"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
const CATEGORIES = ["Retail & Shopping","Food & Drinks","Services","Technology","Health & Beauty","Education","Entertainment","Other"];
const EMOJIS = ["🏪","🍔","💻","📱","🛍️","💇","🎮","🏥","📚","🎵","🌿","🚗"];
export default function MerchantRegisterPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🏪");
  const [step, setStep] = useState("form");
  function handleRegister() {
    if (!name||!category) return;
    const merchant = { name, category, description, emoji, address, registeredAt: new Date().toISOString() };
    localStorage.setItem("zarpay_merchant_"+address, JSON.stringify(merchant));
    setStep("success");
  }
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Register as Merchant</h1>
      </div>
      {step === "form" && (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Business Info</p>
            <input type="text" placeholder="Business name" value={name} onChange={e => setName(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"16px", boxSizing:"border-box", marginBottom:"12px" }} />
            <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"14px", boxSizing:"border-box", minHeight:"80px", resize:"none", fontFamily:"inherit" }} />
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Category</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  style={{ padding:"12px", borderRadius:"12px", border:"1px solid "+(category===c?"rgba(74,222,128,0.4)":border), background:category===c?"rgba(74,222,128,0.08)":inputBg, color:text, cursor:"pointer", fontSize:"12px", fontWeight:category===c?"700":"400", textAlign:"left" }}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Choose an Icon</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  style={{ padding:"12px", borderRadius:"12px", border:"1px solid "+(emoji===e?"rgba(74,222,128,0.4)":border), background:emoji===e?"rgba(74,222,128,0.08)":inputBg, cursor:"pointer", fontSize:"20px", textAlign:"center" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"16px", padding:"16px", marginBottom:"16px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Payment Address</p>
            <p style={{ color:"#4ade80", fontSize:"12px", fontFamily:"monospace", wordBreak:"break-all" }}>{address}</p>
            <p style={{ color:subText, fontSize:"11px", marginTop:"8px" }}>Customers will send EURC directly to this wallet address</p>
          </div>
          <button onClick={handleRegister} disabled={!name||!category}
            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!name||!category?"#1f2937":"#4ade80", color:!name||!category?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!name||!category?"not-allowed":"pointer" }}>
            {!name?"Enter business name":!category?"Select a category":"Complete Registration"}
          </button>
        </>
      )}
      {step === "success" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"72px", height:"72px", borderRadius:"20px", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"32px" }}>{emoji}</div>
          <p style={{ color:text, fontWeight:"700", fontSize:"22px" }}>Welcome, {name}!</p>
          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>Your merchant account is active. Share your QR code to start accepting EURC payments.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px", width:"100%" }}>
            <button onClick={() => router.push("/merchant/pay?merchant="+address)}
              style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>View My QR Code</button>
            <button onClick={() => router.push("/merchant/dashboard")}
              style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"1px solid "+border, background:"transparent", color:text, fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>Go to Dashboard</button>
          </div>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
