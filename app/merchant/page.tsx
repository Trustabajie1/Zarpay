"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
export default function MerchantPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zarpay_merchant_"+address);
    if (saved) setMerchant(JSON.parse(saved));
  }, [address]);
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";
  if (!mounted) return null;
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", marginBottom:"28px" }}>
        <h1 style={{ color:text, fontSize:"22px", fontWeight:"700" }}>Merchant</h1>
        <p style={{ color:subText, fontSize:"13px", marginTop:"4px" }}>Accept EURC payments from customers</p>
      </div>
      {!isConnected ? (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", textAlign:"center" }}>
          <p style={{ fontSize:"32px", marginBottom:"12px" }}>🔌</p>
          <p style={{ color:text, fontWeight:"700", fontSize:"16px" }}>Connect your wallet</p>
          <p style={{ color:subText, fontSize:"13px", marginTop:"8px" }}>You need a connected wallet to register as a merchant</p>
        </div>
      ) : merchant ? (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"20px", padding:"24px", marginBottom:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}>
              <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>
                {merchant.emoji || "🏪"}
              </div>
              <div>
                <p style={{ color:text, fontWeight:"700", fontSize:"18px", margin:0 }}>{merchant.name}</p>
                <p style={{ color:subText, fontSize:"12px", marginTop:"4px" }}>{merchant.category}</p>
              </div>
              <div style={{ marginLeft:"auto", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:"8px", padding:"4px 10px" }}>
                <span style={{ color:"#4ade80", fontSize:"11px", fontWeight:"700" }}>✓ Active</span>
              </div>
            </div>
            <p style={{ color:subText, fontSize:"12px", fontFamily:"monospace", wordBreak:"break-all" }}>{address}</p>
          </div>
          <div style={{ width:"100%", maxWidth:"440px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
            <button onClick={() => router.push("/merchant/dashboard")}
              style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>
              <span style={{ fontSize:"24px" }}>📊</span>
              <p style={{ color:text, fontWeight:"700", margin:0 }}>Dashboard</p>
              <p style={{ color:subText, fontSize:"11px", margin:0 }}>View payments</p>
            </button>
            <button onClick={() => router.push("/merchant/pay?merchant="+address)}
              style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>
              <span style={{ fontSize:"24px" }}>📱</span>
              <p style={{ color:text, fontWeight:"700", margin:0 }}>QR Code</p>
              <p style={{ color:subText, fontSize:"11px", margin:0 }}>Show payment QR</p>
            </button>
          </div>
          <button onClick={() => { localStorage.removeItem("zarpay_merchant_"+address); setMerchant(null); }}
            style={{ width:"100%", maxWidth:"440px", padding:"14px", borderRadius:"14px", border:"1px solid rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.05)", color:"#f87171", fontWeight:"600", cursor:"pointer", fontSize:"14px" }}>
            Unregister Merchant
          </button>
        </>
      ) : (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"32px", marginBottom:"16px", textAlign:"center" }}>
            <p style={{ fontSize:"48px", marginBottom:"16px" }}>🏪</p>
            <p style={{ color:text, fontWeight:"700", fontSize:"18px", marginBottom:"8px" }}>Become a Merchant</p>
            <p style={{ color:subText, fontSize:"13px", marginBottom:"24px" }}>Register to accept EURC payments from ZarPay customers via QR code or wallet address</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px", textAlign:"left", marginBottom:"24px" }}>
              {["Accept EURC payments instantly","Share your QR code with customers","Track all incoming payments","No monthly fees"].map((f,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ color:"#4ade80", fontSize:"16px" }}>✓</span>
                  <span style={{ color:subText, fontSize:"13px" }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/merchant/register")}
              style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"16px", cursor:"pointer" }}>
              Register as Merchant
            </button>
          </div>
        </>
      )}
      <BottomNav />
    </main>
  );
}
