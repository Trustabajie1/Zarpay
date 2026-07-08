"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";
const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];
const AMOUNTS = ["10","20","50","100","200","500"];
export default function WithdrawPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [step, setStep] = useState("form");
  const ngnAmount = amount ? (Number(amount)*1650).toLocaleString() : "--";
  function handleVerify() { if (accountNumber.length===10) setAccountName("John Doe (Demo)"); }
  function handleWithdraw() { setStep("pending"); setTimeout(() => setStep("success"), 3000); }
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Withdraw to Bank</h1>
        <div style={{ marginLeft:"auto", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"4px 10px" }}>
          <span style={{ color:"#f59e0b", fontSize:"11px" }}>Demo Mode</span>
        </div>
      </div>
      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:"14px", padding:"14px 18px", marginBottom:"16px", display:"flex", justifyContent:"space-between" }}>
        <span style={{ color:subText, fontSize:"13px" }}>Available USDC</span>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"13px" }}>{usdcFormatted} USDC</span>
      </div>
      {step === "form" && (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Amount (USDC)</p>
            <input type="number" placeholder="Enter USDC amount" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"18px", fontWeight:"700", boxSizing:"border-box" }} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"12px" }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+border, background:amount===a?"rgba(74,222,128,0.1)":inputBg, color:text, cursor:"pointer", fontSize:"13px", fontWeight:"600" }}>
                  {a} USDC
                </button>
              ))}
            </div>
            {amount && <p style={{ color:"#4ade80", fontSize:"13px", marginTop:"10px", textAlign:"right" }}>≈ ₦{ngnAmount}</p>}
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Bank Details</p>
            <select value={bank} onChange={e => setBank(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"12px", boxSizing:"border-box" }}>
              <option value="">Select bank</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="text" placeholder="Account number (10 digits)" value={accountNumber}
              onChange={e => { setAccountNumber(e.target.value); setAccountName(""); }}
              onBlur={handleVerify} maxLength={10}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"8px", boxSizing:"border-box" }} />
            {accountName && <p style={{ color:"#4ade80", fontSize:"13px", fontWeight:"600" }}>✓ {accountName}</p>}
          </div>
          <button onClick={() => setStep("confirm")} disabled={!amount||!bank||accountNumber.length<10}
            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!amount||!bank||accountNumber.length<10?"#1f2937":"#4ade80", color:!amount||!bank||accountNumber.length<10?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!amount||!bank||accountNumber.length<10?"not-allowed":"pointer" }}>
            Continue
          </button>
        </>
      )}
      {step === "confirm" && (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"16px" }}>
            <p style={{ color:text, fontWeight:"700", fontSize:"16px", marginBottom:"16px" }}>Confirm Withdrawal</p>
            {[{label:"Amount",value:amount+" USDC"},{label:"You receive",value:"₦"+ngnAmount},{label:"Bank",value:bank},{label:"Account",value:accountNumber},{label:"Name",value:accountName},{label:"Rate",value:"1 USDC = ₦1,650"},{label:"Status",value:"🟡 Demo Mode"}].map((row,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:"10px", marginBottom:"10px", borderBottom:i<6?"1px solid "+border:"none" }}>
                <span style={{ color:subText, fontSize:"13px" }}>{row.label}</span>
                <span style={{ color:text, fontSize:"13px", fontWeight:"600" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ width:"100%", maxWidth:"440px", display:"flex", gap:"12px" }}>
            <button onClick={() => setStep("form")} style={{ flex:1, padding:"16px", borderRadius:"14px", border:"1px solid "+border, background:"transparent", color:text, fontWeight:"700", cursor:"pointer" }}>Back</button>
            <button onClick={handleWithdraw} style={{ flex:2, padding:"16px", borderRadius:"14px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", cursor:"pointer" }}>Confirm Withdrawal</button>
          </div>
        </>
      )}
      {step === "pending" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          <p style={{ color:text, fontWeight:"700" }}>Processing Withdrawal...</p>
        </div>
      )}
      {step === "success" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>
          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Withdrawal Initiated!</p>
          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>{amount} USDC to {bank}</p>
          <p style={{ color:"#f59e0b", fontSize:"12px", textAlign:"center" }}>🟡 Demo — no real funds were moved</p>
          <button onClick={() => { setStep("form"); setAmount(""); setBank(""); setAccountNumber(""); setAccountName(""); }}
            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>New Withdrawal</button>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
