"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];
const AMOUNTS = ["1000","2000","5000","10000","20000","50000"];
export default function DepositPage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [step, setStep] = useState("form");
  function handleDeposit() {
    if (!amount || !bank) return;
    setStep("pending");
    setTimeout(() => setStep("success"), 2500);
  }
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Deposit NGN</h1>
        <div style={{ marginLeft:"auto", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"8px", padding:"4px 10px" }}>
          <span style={{ color:"#4ade80", fontSize:"11px" }}>Demo Mode</span>
        </div>
      </div>
      {step === "form" && (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Amount (NGN)</p>
            <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"18px", fontWeight:"700", boxSizing:"border-box" }} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"12px" }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+border, background:amount===a?"rgba(74,222,128,0.1)":inputBg, color:text, cursor:"pointer", fontSize:"13px", fontWeight:"600" }}>
                  ₦{Number(a).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Select Bank</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {BANKS.map(b => (
                <button key={b} onClick={() => setBank(b)}
                  style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(bank===b?"rgba(74,222,128,0.4)":border), background:bank===b?"rgba(74,222,128,0.08)":inputBg, color:text, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  {b} {bank===b && <span style={{ color:"#4ade80" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"16px", padding:"16px", marginBottom:"16px" }}>
            {[{label:"You pay",value:amount?"₦"+Number(amount).toLocaleString():"--"},{label:"You receive (est.)",value:amount?(Number(amount)/1650).toFixed(2)+" USDC":"--"},{label:"Rate",value:"₦1,650 = 1 USDC"},{label:"Status",value:"🟡 Demo Mode"}].map((row,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:"10px", marginBottom:"10px", borderBottom:i<3?"1px solid "+border:"none" }}>
                <span style={{ color:subText, fontSize:"13px" }}>{row.label}</span>
                <span style={{ color:text, fontSize:"13px", fontWeight:"600" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <button onClick={handleDeposit} disabled={!amount||!bank}
            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!amount||!bank?"#1f2937":"#4ade80", color:!amount||!bank?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!amount||!bank?"not-allowed":"pointer" }}>
            {!amount?"Enter amount":!bank?"Select a bank":"Deposit NGN"}
          </button>
        </>
      )}
      {step === "pending" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          <p style={{ color:text, fontWeight:"700" }}>Processing Deposit...</p>
          <p style={{ color:subText, fontSize:"12px" }}>Demo mode — simulating bank transfer</p>
        </div>
      )}
      {step === "success" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>
          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Deposit Initiated!</p>
          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>₦{Number(amount).toLocaleString()} via {bank}</p>
          <p style={{ color:"#f59e0b", fontSize:"12px", textAlign:"center" }}>🟡 Demo — no real funds were moved</p>
          <button onClick={() => { setStep("form"); setAmount(""); setBank(""); }}
            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>New Deposit</button>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
