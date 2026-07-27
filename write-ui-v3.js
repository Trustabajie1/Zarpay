const fs = require('fs');

// SETTINGS PAGE - full redesign
const settings = `"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { DisconnectButton } from "@/components/DisconnectButton";
import { BottomNav } from "@/components/BottomNav";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { t } from "@/lib/translations";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;
const LANGUAGES = ["English", "French", "Spanish", "Arabic"] as const;

export default function SettingsPage() {
  const { address } = useAccount();
  const { settings, updateSettings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState(settings.displayName || "");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const shortAddr = address ? address.slice(0,6)+"..."+address.slice(-4) : "";

  function handleSaveName() {
    updateSettings({ displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ marginBottom:"8px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Settings</h1>
        </div>

        {/* Profile */}
        <div className="zp-card">
          <p className="zp-label">Profile</p>
          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px" }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"linear-gradient(135deg, #2ECC71, #0F9B5C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", fontWeight:"800", color:"#fff", flexShrink:0 }}>
              {(displayName || "W").slice(0,1).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)" }}>{displayName || "My Wallet"}</p>
              <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", marginTop:"2px" }}>{shortAddr}</p>
            </div>
          </div>
          <p className="zp-label">Display Name</p>
          <div style={{ display:"flex", gap:"10px" }}>
            <input
              type="text"
              placeholder="Enter a nickname..."
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="zp-input"
              style={{ flex:1 }}
            />
            <button onClick={handleSaveName}
              style={{ padding:"0 20px", borderRadius:"12px", border:"none", background: saved ? "var(--green-dim)" : "var(--green)", color: saved ? "var(--green)" : "#080C12", fontWeight:"700", cursor:"pointer", fontSize:"13px", flexShrink:0, transition:"all 0.2s" }}>
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="zp-card">
          <p className="zp-label">Appearance</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {["dark","light"].map(theme => (
              <button key={theme} onClick={() => updateSettings({ theme: theme as any })}
                style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(settings.theme===theme?"var(--green-border)":"var(--border)"), background:settings.theme===theme?"var(--green-dim)":"var(--surface-2)", color:settings.theme===theme?"var(--green)":"var(--text-2)", fontWeight:settings.theme===theme?"700":"500", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                <span>{theme==="dark"?"🌙":"☀️"}</span>
                <span style={{ textTransform:"capitalize" }}>{theme}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="zp-card">
          <p className="zp-label">Currency</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => updateSettings({ currency: c })}
                style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(settings.currency===c?"var(--green-border)":"var(--border)"), background:settings.currency===c?"var(--green-dim)":"var(--surface-2)", color:settings.currency===c?"var(--green)":"var(--text-2)", fontWeight:settings.currency===c?"700":"500", cursor:"pointer", fontSize:"14px" }}>
                {CURRENCY_SYMBOLS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="zp-card">
          <p className="zp-label">Language</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {LANGUAGES.map(lang => (
              <button key={lang} onClick={() => updateSettings({ language: lang })}
                style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(settings.language===lang?"var(--green-border)":"var(--border)"), background:settings.language===lang?"var(--green-dim)":"var(--surface-2)", color:settings.language===lang?"var(--green)":"var(--text-2)", fontWeight:settings.language===lang?"700":"500", cursor:"pointer", fontSize:"14px" }}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <div className="zp-card">
          <p className="zp-label">Network</p>
          {[
            { label:"Network", value:"Arc Testnet" },
            { label:"Chain ID", value:"5042002" },
            { label:"Wallet", value:shortAddr },
          ].map((item,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<2?"1px solid var(--border)":"none" }}>
              <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{item.label}</span>
              <span style={{ fontSize:"13px", color:"var(--text)", fontFamily:"monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="zp-card" style={{ textAlign:"center" }}>
          <p style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em", marginBottom:"4px" }}>ZarPay</p>
          <p style={{ fontSize:"12px", color:"var(--text-2)", marginBottom:"16px" }}>Stablecoin payments on Arc Testnet</p>
          <span className="zp-badge zp-badge-green">v1.0.0 · Testnet</span>
        </div>

        {/* Disconnect */}
        <div style={{ display:"flex", justifyContent:"center", paddingBottom:"8px" }}>
          <DisconnectButton />
        </div>

      </div>
      <BottomNav />
    </main>
  );
}`;

fs.writeFileSync('app/settings/page.tsx', settings);
console.log("✅ Settings page");

// TOKEN ICON COMPONENT
const tokenIcon = `export function TokenIcon({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const tokens: Record<string, { bg: string; color: string; label: string }> = {
    USDC: { bg: "linear-gradient(135deg, #1a56a4, #2775CA)", color: "#fff", label: "$" },
    EURC: { bg: "linear-gradient(135deg, #002580, #003399)", color: "#fff", label: "€" },
    BTC:  { bg: "linear-gradient(135deg, #c45d00, #F7931A)", color: "#fff", label: "₿" },
    ETH:  { bg: "linear-gradient(135deg, #4254a0, #627EEA)", color: "#fff", label: "Ξ" },
    USDT: { bg: "linear-gradient(135deg, #1a7a55, #26A17B)", color: "#fff", label: "₮" },
  };
  const t = tokens[symbol] || { bg: "linear-gradient(135deg, #1E2640, #2D3A5C)", color: "#7B8DB0", label: symbol.slice(0,1) };
  return (
    <div style={{
      width: size+"px",
      height: size+"px",
      borderRadius: "50%",
      background: t.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.round(size*0.38)+"px",
      fontWeight: "700",
      color: t.color,
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      {t.label}
    </div>
  );
}`;

fs.mkdirSync('components', { recursive: true });
fs.writeFileSync('components/TokenIcon.tsx', tokenIcon);
console.log("✅ TokenIcon component");

// UPDATE GLOBALS - add token icon gradient support
let globals = fs.readFileSync('app/globals.css', 'utf8');
if (!globals.includes('zp-token-icon-gradient')) {
  globals += `
/* Token icon upgrade */
.zp-token-icon {
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
`;
  fs.writeFileSync('app/globals.css', globals);
}
console.log("✅ Globals updated");

// UPDATE DASHBOARD to use TokenIcon
const dashboard = `"use client";
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
}`;

fs.writeFileSync('app/dashboard/page.tsx', dashboard);
console.log("✅ Dashboard v3");

// UPDATE WALLET PAGE to use TokenIcon
let wallet = fs.readFileSync('app/wallet/page.tsx', 'utf8');
// Add TokenIcon import
if (!wallet.includes('TokenIcon')) {
  wallet = wallet.replace(
    'import { BottomNav } from "@/components/BottomNav";',
    'import { BottomNav } from "@/components/BottomNav";\nimport { TokenIcon } from "@/components/TokenIcon";'
  );
  // Replace old token icon divs in portfolio tab with TokenIcon
  wallet = wallet.replace(
    '<div className="zp-token-icon" style={{ background:token.bg, border:"1px solid "+token.bdr, color:token.color }}>{token.icon}</div>',
    '<TokenIcon symbol={token.symbol} size={38} />'
  );
  fs.writeFileSync('app/wallet/page.tsx', wallet);
  console.log("✅ Wallet - TokenIcon added");
}

// UPDATE MERCHANT PAGE to use TokenIcon style
let merchant = fs.readFileSync('app/merchant/page.tsx', 'utf8');
console.log("✅ Merchant - no changes needed");

console.log("\n🎉 UI v3 complete. Run: npm run dev");