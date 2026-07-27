"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
const CATEGORIES = ["Retail & Shopping","Food & Drinks","Services","Technology","Health & Beauty","Education","Entertainment","Other"];
const EMOJIS = ["🏪","🍔","💻","📱","🛖","💇","🎮","🏥","📚","🎵","🌿","🚗"];
export default function MerchantRegisterPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🏪");
  const [step, setStep] = useState("form");
  function handleRegister() {
    if (!name||!category) return;
    localStorage.setItem("zarpay_merchant_"+address, JSON.stringify({ name, category, description, emoji, address, registeredAt: new Date().toISOString() }));
    setStep("success");
  }
  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title="Register as Merchant" />
        {step==="form" && (
          <>
            <div className="zp-card">
              <p className="zp-label">Business Info</p>
              <input type="text" placeholder="Business name" value={name} onChange={e => setName(e.target.value)} className="zp-input" style={{ marginBottom:"10px" }} />
              <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}
                style={{ width:"100%", padding:"14px 16px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--text)", fontSize:"14px", minHeight:"80px", resize:"none", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
            </div>
            <div className="zp-card">
              <p className="zp-label">Category</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ padding:"12px", borderRadius:"10px", border:"1px solid "+(category===c?"var(--green-border)":"var(--border)"), background:category===c?"var(--green-dim)":"var(--surface-2)", color:category===c?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"12px", fontWeight:category===c?"700":"400", textAlign:"left" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="zp-card">
              <p className="zp-label">Business Icon</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setEmoji(e)}
                    style={{ padding:"12px", borderRadius:"10px", border:"1px solid "+(emoji===e?"var(--green-border)":"var(--border)"), background:emoji===e?"var(--green-dim)":"var(--surface-2)", cursor:"pointer", fontSize:"20px", textAlign:"center" }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="zp-card">
              <p className="zp-label">Payment Address</p>
              <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", wordBreak:"break-all", marginBottom:"6px" }}>{address}</p>
              <p style={{ fontSize:"11px", color:"var(--text-2)" }}>Customers will send USDC directly to this address. You receive EURC.</p>
            </div>
            <button onClick={handleRegister} disabled={!name||!category} className="zp-btn-primary">
              {!name?"Enter business name":!category?"Select a category":"Complete Registration"}
            </button>
          </>
        )}
        {step==="success" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px 24px" }}>
            <div style={{ width:"72px", height:"72px", borderRadius:"20px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"32px" }}>{emoji}</div>
            <p style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", textAlign:"center" }}>Welcome, {name}!</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>Your merchant account is active. Share your QR code to start accepting EURC payments.</p>
            <button onClick={() => router.push("/merchant/pay?merchant="+address)} className="zp-btn-primary">View My QR Code</button>
            <button onClick={() => router.push("/merchant/dashboard")} className="zp-btn-secondary">Go to Dashboard</button>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
