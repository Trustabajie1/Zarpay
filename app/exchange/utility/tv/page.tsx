"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
const PROVIDERS = ["DSTV","GOtv","Startimes","NTA"];
export default function TVPage() {
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form");
  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title="📺 TV" badge="Demo" />
        <div style={{ background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:"12px", padding:"14px 16px", display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:"13px", color:"var(--text-2)" }}>Available USDC</span>
          <span style={{ fontSize:"13px", fontWeight:"700", color:"var(--green)" }}>{usdcFormatted} USDC</span>
        </div>
        {step==="form" && (
          <>
            <div className="zp-card">
              <p className="zp-label">Provider</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {PROVIDERS.map(p => (
                  <button key={p} onClick={() => setProvider(p)}
                    style={{ padding:"14px 16px", borderRadius:"12px", border:"1px solid "+(provider===p?"var(--green-border)":"var(--border)"), background:provider===p?"var(--green-dim)":"var(--surface-2)", color:"var(--text)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", fontSize:"14px", fontWeight:provider===p?"600":"400" }}>
                    {p} {provider===p && <span style={{ color:"var(--green)" }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div className="zp-card">
              <p className="zp-label">Reference / Number</p>
              <input type="text" placeholder="Enter meter/phone/account number" value={reference} onChange={e => setReference(e.target.value)} className="zp-input" style={{ marginBottom:"12px" }} />
              <p className="zp-label">Amount (USDC)</p>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="zp-input" style={{ fontSize:"20px", fontWeight:"700" }} />
            </div>
            <button onClick={() => { if(!provider||!reference||!amount) return; setStep("pending"); setTimeout(()=>setStep("success"),2500); }} disabled={!provider||!reference||!amount} className="zp-btn-primary">Pay TV</button>
          </>
        )}
        {step==="pending" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"48px 24px" }}>
            <div className="zp-spinner" />
            <p style={{ color:"var(--text)", fontWeight:"700" }}>Processing Payment...</p>
          </div>
        )}
        {step==="success" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"48px 24px" }}>
            <div className="zp-result-icon success">✓</div>
            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Payment Successful!</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{provider} · {reference}</p>
            <span className="zp-badge zp-badge-amber">🟡 Demo — no real payment made</span>
            <button onClick={() => { setStep("form"); setProvider(""); setReference(""); setAmount(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>New Payment</button>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
