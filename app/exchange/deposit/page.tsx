"use client";
import { useState } from "react";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];
const AMOUNTS = ["1000","2000","5000","10000","20000","50000"];
export default function DepositPage() {
  const { settings } = useAppSettings();
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [step, setStep] = useState("form");
  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title="Deposit NGN" badge="Demo Mode" />
        {step === "form" && (
          <>
            <div className="zp-card">
              <p className="zp-label">Amount (NGN)</p>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="zp-input" style={{ fontSize:"24px", fontWeight:"800", marginBottom:"12px" }} />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
                {AMOUNTS.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+(amount===a?"var(--green-border)":"var(--border)"), background:amount===a?"var(--green-dim)":"var(--surface-2)", color:amount===a?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"12px", fontWeight:"600" }}>
                    ₦{Number(a).toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <div className="zp-card">
              <p className="zp-label">Select Bank</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {BANKS.map(b => (
                  <button key={b} onClick={() => setBank(b)}
                    style={{ padding:"14px 16px", borderRadius:"12px", border:"1px solid "+(bank===b?"var(--green-border)":"var(--border)"), background:bank===b?"var(--green-dim)":"var(--surface-2)", color:"var(--text)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"14px", fontWeight:bank===b?"600":"400" }}>
                    {b}
                    {bank===b && <span style={{ color:"var(--green)", fontSize:"16px" }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            {amount && (
              <div className="zp-card">
                {[{label:"You pay",value:"₦"+Number(amount).toLocaleString()},{label:"You receive",value:(Number(amount)/1650).toFixed(2)+" USDC"},{label:"Rate",value:"₦1,650 = 1 USDC"},{label:"Status",value:"🟡 Demo Mode"}].map((r,i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:i<3?"1px solid var(--border)":"none" }}>
                    <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{r.label}</span>
                    <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { if(!amount||!bank) return; setStep("pending"); setTimeout(()=>setStep("success"),2500); }} disabled={!amount||!bank} className="zp-btn-primary">
              {!amount?"Enter amount":!bank?"Select a bank":"Deposit NGN"}
            </button>
          </>
        )}
        {step==="pending" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"48px 24px" }}>
            <div className="zp-spinner" />
            <p style={{ color:"var(--text)", fontWeight:"700" }}>Processing Deposit...</p>
            <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Demo mode · Simulating bank transfer</p>
          </div>
        )}
        {step==="success" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"48px 24px" }}>
            <div className="zp-result-icon success">✓</div>
            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Deposit Initiated!</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>₦{Number(amount).toLocaleString()} via {bank}</p>
            <span className="zp-badge zp-badge-amber">🟡 Demo — no real funds moved</span>
            <button onClick={() => { setStep("form"); setAmount(""); setBank(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>New Deposit</button>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
