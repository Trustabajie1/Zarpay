"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];
const AMOUNTS = ["10","20","50","100","200","500"];
export default function WithdrawPage() {
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [step, setStep] = useState("form");
  const ngnAmount = amount ? (Number(amount)*1650).toLocaleString() : "--";
  function handleVerify() { if (accountNumber.length===10) setAccountName("John Doe (Demo)"); }
  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title="Withdraw to Bank" badge="Demo Mode" />
        <div style={{ background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:"12px", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:"13px", color:"var(--text-2)" }}>Available USDC</span>
          <span style={{ fontSize:"14px", fontWeight:"700", color:"var(--green)" }}>{usdcFormatted} USDC</span>
        </div>
        {step==="form" && (
          <>
            <div className="zp-card">
              <p className="zp-label">Amount (USDC)</p>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="zp-input" style={{ fontSize:"24px", fontWeight:"800", marginBottom:"12px" }} />
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"12px" }}>
                {AMOUNTS.map(a => (
                  <button key={a} onClick={() => setAmount(a)}
                    style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+(amount===a?"var(--green-border)":"var(--border)"), background:amount===a?"var(--green-dim)":"var(--surface-2)", color:amount===a?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"12px", fontWeight:"600" }}>
                    {a} USDC
                  </button>
                ))}
              </div>
              {amount && <p style={{ fontSize:"13px", color:"var(--green)", textAlign:"right" }}>≈ ₦{ngnAmount}</p>}
            </div>
            <div className="zp-card">
              <p className="zp-label">Bank Details</p>
              <select value={bank} onChange={e => setBank(e.target.value)} className="zp-input" style={{ marginBottom:"12px" }}>
                <option value="">Select bank</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input type="text" placeholder="Account number (10 digits)" value={accountNumber} onChange={e => { setAccountNumber(e.target.value); setAccountName(""); }} onBlur={handleVerify} maxLength={10} className="zp-input" style={{ marginBottom:"8px" }} />
              {accountName && <p style={{ fontSize:"13px", color:"var(--green)", fontWeight:"600" }}>✓ {accountName}</p>}
            </div>
            <button onClick={() => setStep("confirm")} disabled={!amount||!bank||accountNumber.length<10} className="zp-btn-primary">Continue</button>
          </>
        )}
        {step==="confirm" && (
          <>
            <div className="zp-card">
              <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"16px" }}>Confirm Withdrawal</p>
              {[{label:"Amount",value:amount+" USDC"},{label:"You receive",value:"₦"+ngnAmount},{label:"Bank",value:bank},{label:"Account",value:accountNumber},{label:"Name",value:accountName},{label:"Rate",value:"1 USDC = ₦1,650"},{label:"Status",value:"🟡 Demo Mode"}].map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:i<6?"1px solid var(--border)":"none" }}>
                  <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{r.label}</span>
                  <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setStep("form")} className="zp-btn-secondary">Back</button>
              <button onClick={() => { setStep("pending"); setTimeout(()=>setStep("success"),3000); }} className="zp-btn-primary">Confirm</button>
            </div>
          </>
        )}
        {step==="pending" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"48px 24px" }}>
            <div className="zp-spinner" />
            <p style={{ color:"var(--text)", fontWeight:"700" }}>Processing Withdrawal...</p>
          </div>
        )}
        {step==="success" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"48px 24px" }}>
            <div className="zp-result-icon success">✓</div>
            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Withdrawal Initiated!</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{amount} USDC → ₦{ngnAmount} to {bank}</p>
            <span className="zp-badge zp-badge-amber">🟡 Demo — no real funds moved</span>
            <button onClick={() => { setStep("form"); setAmount(""); setBank(""); setAccountNumber(""); setAccountName(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>New Withdrawal</button>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
