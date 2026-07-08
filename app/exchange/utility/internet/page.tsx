"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";
const PROVIDERS = ["Spectranet","Smile","Swift","ipNX"];
export default function InternetPage() {
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
  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form");
  function handlePay() {
    if (!provider||!reference||!amount) return;
    setStep("pending");
    setTimeout(() => setStep("success"), 2500);
  }
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>🌐 Internet</h1>
        <div style={{ marginLeft:"auto", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"4px 10px" }}>
          <span style={{ color:"#f59e0b", fontSize:"11px" }}>Demo</span>
        </div>
      </div>
      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:"14px", padding:"14px 18px", marginBottom:"16px", display:"flex", justifyContent:"space-between" }}>
        <span style={{ color:subText, fontSize:"13px" }}>Available USDC</span>
        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"13px" }}>{usdcFormatted} USDC</span>
      </div>
      {step === "form" && (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Provider</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {PROVIDERS.map(p => (
                <button key={p} onClick={() => setProvider(p)}
                  style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(provider===p?"rgba(74,222,128,0.4)":border), background:provider===p?"rgba(74,222,128,0.08)":inputBg, color:text, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between" }}>
                  {p} {provider===p && <span style={{ color:"#4ade80" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Reference / Number</p>
            <input type="text" placeholder="Enter meter/phone/account number" value={reference} onChange={e => setReference(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, boxSizing:"border-box", marginBottom:"12px" }} />
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Amount (USDC)</p>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, boxSizing:"border-box" }} />
          </div>
          <button onClick={handlePay} disabled={!provider||!reference||!amount}
            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!provider||!reference||!amount?"#1f2937":"#4ade80", color:!provider||!reference||!amount?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!provider||!reference||!amount?"not-allowed":"pointer" }}>
            Pay Internet
          </button>
        </>
      )}
      {step === "pending" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          <p style={{ color:text, fontWeight:"700" }}>Processing Payment...</p>
        </div>
      )}
      {step === "success" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>
          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Payment Successful!</p>
          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>{provider} — {reference}</p>
          <p style={{ color:"#f59e0b", fontSize:"12px", textAlign:"center" }}>🟡 Demo — no real payment was made</p>
          <button onClick={() => { setStep("form"); setProvider(""); setReference(""); setAmount(""); }}
            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>New Payment</button>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
