"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { EURC_ADDRESS, ERC20_ABI, TOKEN_DECIMALS } from "@/lib/contracts";
import { formatUnits } from "viem";

export default function MerchantDashboardPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [merchant, setMerchant] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zarpay_merchant_"+address);
    if (saved) setMerchant(JSON.parse(saved));
  }, [address]);

  const { data: eurcBalance } = useReadContract({
    address: EURC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const eurcFormatted = eurcBalance
    ? Number(formatUnits(eurcBalance as bigint, TOKEN_DECIMALS)).toFixed(2)
    : "0.00";

  function handleCopy() {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  if (!mounted) return null;

  if (!merchant) return (
    <main className="zp-page">
      <div className="zp-content">
        <div className="zp-card" style={{ textAlign:"center", padding:"48px 24px" }}>
          <p style={{ fontSize:"40px", marginBottom:"16px" }}>🏪</p>
          <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"8px" }}>Not registered as a merchant</p>
          <p style={{ fontSize:"13px", color:"var(--text-2)", marginBottom:"24px" }}>Register to start accepting EURC payments</p>
          <button onClick={() => router.push("/merchant/register")} className="zp-btn-primary">Register Now</button>
        </div>
      </div>
      <BottomNav />
    </main>
  );

  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title="Merchant Dashboard" />

        {/* Merchant Info Card */}
        <div style={{ position:"relative", background:"linear-gradient(135deg, #0D1621, #0F1E30)", border:"1px solid var(--green-border)", borderRadius:"20px", padding:"24px", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"140px", height:"140px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,204,113,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />
          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px" }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", flexShrink:0 }}>
              {merchant.emoji}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)", margin:0, letterSpacing:"-0.02em" }}>{merchant.name}</p>
              <p style={{ fontSize:"12px", color:"var(--text-2)", margin:"3px 0 0" }}>{merchant.category}</p>
            </div>
            <span className="zp-badge zp-badge-green">✓ Active</span>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div style={{ background:"rgba(15,20,32,0.6)", border:"1px solid var(--border)", borderRadius:"14px", padding:"16px" }}>
              <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-2)", margin:"0 0 8px" }}>EURC Balance</p>
              <p style={{ fontSize:"24px", fontWeight:"800", color:"var(--green)", margin:0, letterSpacing:"-0.02em" }}>{eurcFormatted}</p>
              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>EURC received</p>
            </div>
            <div style={{ background:"rgba(15,20,32,0.6)", border:"1px solid var(--border)", borderRadius:"14px", padding:"16px" }}>
              <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-2)", margin:"0 0 8px" }}>Status</p>
              <div style={{ display:"flex", alignItems:"center", gap:"6px", margin:"0 0 3px" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--green)" }} />
                <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)", margin:0 }}>Active</p>
              </div>
              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:0 }}>Accepting payments</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          <button onClick={() => router.push("/merchant/pay?merchant="+address)}
            style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer", textAlign:"left" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"rgba(46,204,113,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>📱</div>
            <div>
              <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)", margin:0 }}>My QR Code</p>
              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>Show to customers</p>
            </div>
          </button>
          <button onClick={handleCopy}
            style={{ background: copied ? "var(--green-dim)" : "var(--surface)", border:"1px solid "+(copied?"var(--green-border)":"var(--border)"), borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>
            <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>📋</div>
            <div>
              <p style={{ fontSize:"14px", fontWeight:"700", color: copied ? "var(--green)" : "var(--text)", margin:0 }}>{copied ? "Copied!" : "Copy Address"}</p>
              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>Share payment link</p>
            </div>
          </button>
        </div>

        {/* Payment Address */}
        <div className="zp-card">
          <p className="zp-label">Payment Address</p>
          <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"JetBrains Mono,monospace", wordBreak:"break-all", marginBottom:"8px" }}>{address}</p>
          <p style={{ fontSize:"12px", color:"var(--text-2)", lineHeight:"1.5" }}>Customers pay USDC → automatically converted to EURC and sent to this address</p>
        </div>

      </div>
      <BottomNav />
    </main>
  );
}
