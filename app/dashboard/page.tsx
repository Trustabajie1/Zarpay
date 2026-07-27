"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { DisconnectButton } from "@/components/DisconnectButton";
import { SendModal } from "@/components/SendModal";
import { ReceiveModal } from "@/components/ReceiveModal";
import { BottomNav } from "@/components/BottomNav";
import { TokenIcon } from "@/components/TokenIcon";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { useAppSettings } from "@/components/SettingsContext";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { useLivePrices } from "@/lib/useLivePrices";
import { t } from "@/lib/translations";

const ALL_TOKENS = [
  { symbol:"BTC", name:"Bitcoin", network:"Bitcoin", live:false, key:null },
  { symbol:"ETH", name:"Ethereum", network:"Ethereum", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Arc Testnet", live:true, key:"usdc" },
  { symbol:"EURC", name:"Euro Coin", network:"Arc Testnet", live:true, key:"eurc" },
  { symbol:"USDC", name:"USD Coin", network:"ETH Sepolia", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Base", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Arbitrum", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Optimism", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Avalanche", live:false, key:null },
];

const ACTIONS = [
  { icon:"↑", label:"Send", color:"rgba(46,204,113,0.15)", iconColor:"var(--green)" },
  { icon:"↓", label:"Receive", color:"rgba(59,130,246,0.15)", iconColor:"#3B82F6" },
  { icon:"◷", label:"History", color:"rgba(167,139,250,0.15)", iconColor:"#A78BFA" },
  { icon:"⊞", label:"Services", color:"rgba(240,165,0,0.15)", iconColor:"var(--amber)" },
];

export default function DashboardPage() {
  const { address } = useAccount();
  const router = useRouter();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const tr = t(settings.language);
  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const usdcValue = (parseFloat(usdcFormatted)||0) * (rates[settings.currency]||1);
  const eurcValue = (parseFloat(eurcFormatted)||0) * (rates[settings.currency]||1) * 1.08;
  const total = (usdcValue+eurcValue).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2});
  const displayName = settings.displayName?.trim() || tr.goodDay;
  const shortAddr = address ? address.slice(0,6)+"..."+address.slice(-4) : "";

  function getBalance(tok: typeof ALL_TOKENS[0]) {
    if (!tok.live) return "0.00";
    if (tok.key==="usdc") return usdcFormatted;
    if (tok.key==="eurc") return eurcFormatted;
    return "0.00";
  }
  function getFiat(tok: typeof ALL_TOKENS[0]) {
    if (!tok.live) return null;
    const v = tok.key==="usdc" ? usdcValue : eurcValue;
    return symbol+v.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2});
  }

  const actionHandlers = [
    () => setShowSendModal(true),
    () => setShowReceiveModal(true),
    () => router.push("/activity"),
    () => router.push("/exchange"),
  ];

  if (!mounted) return null;
  return (
    <main className="zp-page">
      {showSendModal && <SendModal onClose={() => { setShowSendModal(false); refetch(); }} />}
      {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} />}
      <div className="zp-content">

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:"24px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.03em" }}>ZarPay</span>
          <DisconnectButton />
        </div>

        {/* Greeting */}
        <div>
          <p style={{ fontSize:"15px", fontWeight:"600", color:"var(--text)" }}>{displayName} 👋</p>
          <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"JetBrains Mono,monospace", marginTop:"2px" }}>{shortAddr}</p>
        </div>

        {/* Balance Card */}
        <div style={{ position:"relative", borderRadius:"20px", overflow:"hidden", background:"linear-gradient(135deg, #0D1621 0%, #0F1E30 50%, #0D1621 100%)", border:"1px solid rgba(46,204,113,0.15)", padding:"24px" }}>
          <div style={{ position:"absolute", top:"-60px", right:"-60px", width:"200px", height:"200px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,204,113,0.08) 0%, transparent 70%)", animation:"glow-pulse 4s ease-in-out infinite", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-40px", left:"-40px", width:"140px", height:"140px", borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />
          <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.12em", color:"var(--text-2)", marginBottom:"10px" }}>Total Balance</p>
          {isLoading ? (
            <div style={{ height:"48px", width:"55%", borderRadius:"8px", background:"var(--surface-2)", marginBottom:"8px" }} />
          ) : (
            <p style={{ fontSize:"40px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1.1 }}>{symbol}{total}</p>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"8px" }}>
            <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"var(--green)" }} />
            <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Arc Testnet · {settings.currency}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
          {ACTIONS.map((btn,i) => (
            <button key={i} onClick={actionHandlers[i]}
              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"16px 8px", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", transition:"all 0.2s" }}>
              <div style={{ width:"42px", height:"42px", borderRadius:"14px", background:btn.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", color:btn.iconColor, fontWeight:"700" }}>{btn.icon}</div>
              <span style={{ fontSize:"11px", fontWeight:"600", color:"var(--text-2)" }}>{btn.label}</span>
            </button>
          ))}
        </div>

        {/* Assets */}
        <div className="zp-card">
          <p className="zp-label">Assets</p>
          {ALL_TOKENS.map((token,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<ALL_TOKENS.length-1?"1px solid var(--border)":"none", opacity:token.live?1:0.35 }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <TokenIcon symbol={token.symbol} size={38} />
                <div>
                  <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text)" }}>{token.symbol}</p>
                  <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.name} · {token.network}</p>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>{isLoading&&token.live?"...":getBalance(token)}</p>
                <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.live?(isLoading?"...":getFiat(token)):"Coming soon"}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
      <BottomNav />
    </main>
  );
}