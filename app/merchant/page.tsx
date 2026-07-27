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
  useEffect(() => { setMounted(true); const s = localStorage.getItem("zarpay_merchant_"+address); if (s) setMerchant(JSON.parse(s)); }, [address]);
  if (!mounted) return null;
  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ marginBottom:"8px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Merchant</h1>
          <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"4px" }}>Accept EURC payments from customers</p>
        </div>

        {!isConnected ? (
          <div className="zp-card" style={{ textAlign:"center", padding:"40px 24px" }}>
            <p style={{ fontSize:"40px", marginBottom:"16px" }}>🔌</p>
            <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"8px" }}>Connect your wallet</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)" }}>You need a connected wallet to register as a merchant</p>
          </div>
        ) : merchant ? (
          <>
            <div style={{ background:"linear-gradient(135deg, #0F1420, #161C2D)", border:"1px solid var(--green-border)", borderRadius:"16px", padding:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>
                <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>{merchant.emoji}</div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:"17px", fontWeight:"700", color:"var(--text)" }}>{merchant.name}</p>
                  <p style={{ fontSize:"12px", color:"var(--text-2)" }}>{merchant.category}</p>
                </div>
                <span className="zp-badge zp-badge-green">✓ Active</span>
              </div>
              <p style={{ fontSize:"11px", color:"var(--text-3)", fontFamily:"monospace", wordBreak:"break-all" }}>{address}</p>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              <button onClick={() => router.push("/merchant/dashboard")} className="zp-card" style={{ cursor:"pointer", textAlign:"left", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:"24px", marginBottom:"10px" }}>📊</p>
                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>Dashboard</p>
                <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"2px" }}>View payments</p>
              </button>
              <button onClick={() => router.push("/merchant/pay?merchant="+address)} className="zp-card" style={{ cursor:"pointer", textAlign:"left", border:"1px solid var(--border)" }}>
                <p style={{ fontSize:"24px", marginBottom:"10px" }}>📱</p>
                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>QR Code</p>
                <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"2px" }}>Show to customers</p>
              </button>
            </div>
            <button onClick={() => { localStorage.removeItem("zarpay_merchant_"+address); setMerchant(null); }}
              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid rgba(231,76,60,0.25)", background:"var(--red-dim)", color:"var(--red)", fontWeight:"600", cursor:"pointer", fontSize:"14px" }}>
              Unregister Merchant
            </button>
          </>
        ) : (
          <div className="zp-card" style={{ textAlign:"center", padding:"32px 24px" }}>
            <p style={{ fontSize:"48px", marginBottom:"20px" }}>🏪</p>
            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)", marginBottom:"8px", letterSpacing:"-0.02em" }}>Become a Merchant</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)", marginBottom:"24px", lineHeight:1.6 }}>Register to accept EURC payments from ZarPay customers via QR code or wallet address</p>
            <div style={{ textAlign:"left", marginBottom:"24px", display:"flex", flexDirection:"column", gap:"10px" }}>
              {["Accept EURC payments instantly","Share your QR code with customers","Track all incoming payments","No monthly fees"].map((f,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"var(--green)", flexShrink:0 }}>✓</div>
                  <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => router.push("/merchant/register")} className="zp-btn-primary">Register as Merchant</button>
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
