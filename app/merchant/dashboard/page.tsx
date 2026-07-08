"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
import { EURC_ADDRESS, ERC20_ABI, TOKEN_DECIMALS } from "@/lib/contracts";
import { formatUnits } from "viem";
export default function MerchantDashboardPage() {
  const router = useRouter();
  const { address } = useAccount();
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
  const { data: eurcBalance } = useReadContract({
    address: EURC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const eurcFormatted = eurcBalance ? Number(formatUnits(eurcBalance as bigint, TOKEN_DECIMALS)).toFixed(2) : "0.00";
  if (!mounted) return null;
  if (!merchant) return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", textAlign:"center", marginTop:"40px" }}>
        <p style={{ fontSize:"32px", marginBottom:"12px" }}>🏪</p>
        <p style={{ color:text, fontWeight:"700" }}>Not registered as a merchant</p>
        <button onClick={() => router.push("/merchant/register")}
          style={{ marginTop:"16px", padding:"14px 24px", borderRadius:"12px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", cursor:"pointer" }}>Register Now</button>
      </div>
      <BottomNav />
    </main>
  );
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Merchant Dashboard</h1>
      </div>
      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"20px", padding:"24px", marginBottom:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{merchant.emoji}</div>
          <div>
            <p style={{ color:text, fontWeight:"700", fontSize:"16px", margin:0 }}>{merchant.name}</p>
            <p style={{ color:subText, fontSize:"12px", margin:"2px 0 0" }}>{merchant.category}</p>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <div style={{ background:card, border:"1px solid "+border, borderRadius:"14px", padding:"16px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>EURC Balance</p>
            <p style={{ color:"#4ade80", fontSize:"22px", fontWeight:"800", margin:0 }}>{eurcFormatted}</p>
            <p style={{ color:subText, fontSize:"11px", margin:"2px 0 0" }}>EURC received</p>
          </div>
          <div style={{ background:card, border:"1px solid "+border, borderRadius:"14px", padding:"16px" }}>
            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>Status</p>
            <p style={{ color:"#4ade80", fontSize:"16px", fontWeight:"700", margin:0 }}>✓ Active</p>
            <p style={{ color:subText, fontSize:"11px", margin:"2px 0 0" }}>Accepting payments</p>
          </div>
        </div>
      </div>
      <div style={{ width:"100%", maxWidth:"440px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>
        <button onClick={() => router.push("/merchant/pay?merchant="+address)}
          style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>
          <span style={{ fontSize:"24px" }}>📱</span>
          <p style={{ color:text, fontWeight:"700", margin:0 }}>My QR Code</p>
          <p style={{ color:subText, fontSize:"11px", margin:0 }}>Show to customers</p>
        </button>
        <button onClick={() => { navigator.clipboard.writeText(address||""); }}
          style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>
          <span style={{ fontSize:"24px" }}>📋</span>
          <p style={{ color:text, fontWeight:"700", margin:0 }}>Copy Address</p>
          <p style={{ color:subText, fontSize:"11px", margin:0 }}>Share payment link</p>
        </button>
      </div>
      <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px" }}>
        <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Payment Address</p>
        <p style={{ color:"#4ade80", fontSize:"12px", fontFamily:"monospace", wordBreak:"break-all", marginBottom:"8px" }}>{address}</p>
        <p style={{ color:subText, fontSize:"11px" }}>Customers pay USDC → automatically converted to EURC and sent to this address</p>
      </div>
      <BottomNav />
    </main>
  );
}
