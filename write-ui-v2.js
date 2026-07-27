const fs = require('fs');

// ============================================================
// BOTTOM NAV
// ============================================================
fs.writeFileSync('components/BottomNav.tsx',
'"use client";\n' +
'import { useRouter, usePathname } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { t } from "@/lib/translations";\n' +
'\n' +
'export function BottomNav() {\n' +
'  const router = useRouter();\n' +
'  const pathname = usePathname();\n' +
'  const { settings } = useAppSettings();\n' +
'  const tr = t(settings.language ?? "English");\n' +
'  const tabs = [\n' +
'    { label: "Home", icon: "⌂", path: "/dashboard" },\n' +
'    { label: "Merchant", icon: "◈", path: "/merchant" },\n' +
'    { label: "Wallet", icon: "◎", path: "/wallet" },\n' +
'    { label: "Settings", icon: "⚙", path: "/settings" },\n' +
'  ];\n' +
'  return (\n' +
'    <nav className="zp-nav">\n' +
'      {tabs.map((tab) => {\n' +
'        const isActive = pathname === tab.path || pathname.startsWith(tab.path + "/");\n' +
'        return (\n' +
'          <button key={tab.path} onClick={() => router.push(tab.path)} className={"zp-nav-tab" + (isActive ? " active" : "")}>\n' +
'            {isActive && <span className="zp-nav-dot" />}\n' +
'            <span className="zp-nav-icon">{tab.icon}</span>\n' +
'            <span className="zp-nav-label">{tab.label}</span>\n' +
'          </button>\n' +
'        );\n' +
'      })}\n' +
'    </nav>\n' +
'  );\n' +
'}\n'
);
console.log("✅ BottomNav");

// ============================================================
// DASHBOARD
// ============================================================
const dashboard =
'"use client";\n' +
'import { useState, useEffect } from "react";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { DisconnectButton } from "@/components/DisconnectButton";\n' +
'import { SendModal } from "@/components/SendModal";\n' +
'import { ReceiveModal } from "@/components/ReceiveModal";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { CURRENCY_SYMBOLS } from "@/lib/useSettings";\n' +
'import { useLivePrices } from "@/lib/useLivePrices";\n' +
'import { t } from "@/lib/translations";\n' +
'\n' +
'const ALL_TOKENS = [\n' +
'  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", icon: "\u20BF", color: "#F7931A", bg: "rgba(247,147,26,0.12)", bdr: "rgba(247,147,26,0.25)", live: false, key: null },\n' +
'  { symbol: "ETH", name: "Ethereum", network: "Ethereum", icon: "\u039E", color: "#627EEA", bg: "rgba(98,126,234,0.12)", bdr: "rgba(98,126,234,0.25)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Arc Testnet", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.12)", bdr: "rgba(39,117,202,0.25)", live: true, key: "usdc" },\n' +
'  { symbol: "EURC", name: "Euro Coin", network: "Arc Testnet", icon: "\u20AC", color: "#4A90D9", bg: "rgba(74,144,217,0.12)", bdr: "rgba(74,144,217,0.25)", live: true, key: "eurc" },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "ETH Sepolia", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.12)", bdr: "rgba(39,117,202,0.25)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Base", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.12)", bdr: "rgba(39,117,202,0.25)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Arbitrum", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.12)", bdr: "rgba(39,117,202,0.25)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Optimism", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.12)", bdr: "rgba(39,117,202,0.25)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Avalanche", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.12)", bdr: "rgba(39,117,202,0.25)", live: false, key: null },\n' +
'];\n' +
'\n' +
'export default function DashboardPage() {\n' +
'  const { address } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [showSendModal, setShowSendModal] = useState(false);\n' +
'  const [showReceiveModal, setShowReceiveModal] = useState(false);\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'  const { usdcFormatted, eurcFormatted, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance(address);\n' +
'  const { rates } = useLivePrices();\n' +
'  const tr = t(settings.language);\n' +
'  const symbol = CURRENCY_SYMBOLS[settings.currency];\n' +
'  const usdcValue = (parseFloat(usdcFormatted) || 0) * (rates[settings.currency] || 1);\n' +
'  const eurcValue = (parseFloat(eurcFormatted) || 0) * (rates[settings.currency] || 1) * 1.08;\n' +
'  const total = (usdcValue + eurcValue).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'  const displayName = settings.displayName?.trim() || tr.goodDay;\n' +
'  const shortAddr = address ? address.slice(0,6)+"..."+address.slice(-4) : "";\n' +
'  function getBalance(t: typeof ALL_TOKENS[0]) {\n' +
'    if (!t.live) return "0.00";\n' +
'    if (t.key === "usdc") return usdcFormatted;\n' +
'    if (t.key === "eurc") return eurcFormatted;\n' +
'    return "0.00";\n' +
'  }\n' +
'  function getFiat(t: typeof ALL_TOKENS[0]) {\n' +
'    if (!t.live) return null;\n' +
'    const v = t.key === "usdc" ? usdcValue : eurcValue;\n' +
'    return symbol + v.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'  }\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      {showSendModal && <SendModal onClose={() => { setShowSendModal(false); refetchBalance(); }} />}\n' +
'      {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} />}\n' +
'      <div className="zp-content">\n' +
'\n' +
'        {/* Header */}\n' +
'        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>\n' +
'          <span style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>ZarPay</span>\n' +
'          <DisconnectButton />\n' +
'        </div>\n' +
'\n' +
'        {/* Greeting */}\n' +
'        <div style={{ marginBottom:"4px" }}>\n' +
'          <p style={{ fontSize:"16px", fontWeight:"600", color:"var(--text)" }}>{displayName} \uD83D\uDC4B</p>\n' +
'          <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"JetBrains Mono, monospace", marginTop:"2px" }}>{shortAddr}</p>\n' +
'        </div>\n' +
'\n' +
'        {/* Balance Card with glow */}\n' +
'        <div style={{ position:"relative", borderRadius:"20px", overflow:"hidden", background:"linear-gradient(135deg, #0F1420 0%, #161C2D 100%)", border:"1px solid var(--border)", padding:"24px", marginBottom:"4px" }}>\n' +
'          <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"160px", height:"160px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,204,113,0.15) 0%, transparent 70%)", animation:"glow-pulse 3s ease-in-out infinite", pointerEvents:"none" }} />\n' +
'          <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-2)", marginBottom:"12px" }}>Total Balance</p>\n' +
'          {balanceLoading ? (\n' +
'            <div style={{ height:"52px", width:"60%", borderRadius:"8px", background:"var(--surface-2)" }} />\n' +
'          ) : (\n' +
'            <>\n' +
'              <p style={{ fontSize:"42px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.03em", lineHeight:1 }}>{symbol}{total}</p>\n' +
'              <p style={{ fontSize:"12px", color:"var(--text-2)", marginTop:"6px" }}>Arc Testnet \u00B7 {settings.currency}</p>\n' +
'            </>\n' +
'          )}\n' +
'        </div>\n' +
'\n' +
'        {/* Action Buttons */}\n' +
'        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>\n' +
'          {[\n' +
'            { icon:"\uD83D\uDCE4", label:"Send", onClick:() => setShowSendModal(true), color:"rgba(46,204,113,0.12)" },\n' +
'            { icon:"\uD83D\uDCE5", label:"Receive", onClick:() => setShowReceiveModal(true), color:"rgba(59,130,246,0.12)" },\n' +
'            { icon:"\u25F7", label:"History", onClick:() => router.push("/activity"), color:"rgba(167,139,250,0.12)" },\n' +
'            { icon:"$", label:"Services", onClick:() => router.push("/exchange"), color:"rgba(240,165,0,0.12)" },\n' +
'          ].map((btn, i) => (\n' +
'            <button key={i} onClick={btn.onClick} className="zp-action-btn">\n' +
'              <div className="icon" style={{ background: btn.color }}>{btn.icon}</div>\n' +
'              <span className="label">{btn.label}</span>\n' +
'            </button>\n' +
'          ))}\n' +
'        </div>\n' +
'\n' +
'        {/* Assets */}\n' +
'        <div className="zp-card">\n' +
'          <p className="zp-label">Assets</p>\n' +
'          <div style={{ display:"flex", flexDirection:"column", gap:"0" }}>\n' +
'            {ALL_TOKENS.map((token, i) => (\n' +
'              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom: i < ALL_TOKENS.length-1 ? "1px solid var(--border)" : "none", opacity: token.live ? 1 : 0.4 }}>\n' +
'                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>\n' +
'                  <div className="zp-token-icon" style={{ background: token.bg, border:"1px solid "+token.bdr, color: token.color }}>{token.icon}</div>\n' +
'                  <div>\n' +
'                    <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text)" }}>{token.symbol}</p>\n' +
'                    <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.name} \u00B7 {token.network}</p>\n' +
'                  </div>\n' +
'                </div>\n' +
'                <div style={{ textAlign:"right" }}>\n' +
'                  <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>{balanceLoading && token.live ? "..." : getBalance(token)}</p>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.live ? (balanceLoading ? "..." : getFiat(token)) : "Coming soon"}</p>\n' +
'                </div>\n' +
'              </div>\n' +
'            ))}\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/dashboard/page.tsx', dashboard);
console.log("✅ Dashboard");

// ============================================================
// MERCHANT HUB
// ============================================================
const merchant =
'"use client";\n' +
'import { useState, useEffect } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'export default function MerchantPage() {\n' +
'  const router = useRouter();\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'  useEffect(() => { setMounted(true); const s = localStorage.getItem("zarpay_merchant_"+address); if (s) setMerchant(JSON.parse(s)); }, [address]);\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <div style={{ marginBottom:"8px" }}>\n' +
'          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Merchant</h1>\n' +
'          <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"4px" }}>Accept EURC payments from customers</p>\n' +
'        </div>\n' +
'\n' +
'        {!isConnected ? (\n' +
'          <div className="zp-card" style={{ textAlign:"center", padding:"40px 24px" }}>\n' +
'            <p style={{ fontSize:"40px", marginBottom:"16px" }}>\uD83D\uDD0C</p>\n' +
'            <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"8px" }}>Connect your wallet</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)" }}>You need a connected wallet to register as a merchant</p>\n' +
'          </div>\n' +
'        ) : merchant ? (\n' +
'          <>\n' +
'            <div style={{ background:"linear-gradient(135deg, #0F1420, #161C2D)", border:"1px solid var(--green-border)", borderRadius:"16px", padding:"20px" }}>\n' +
'              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>\n' +
'                <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>{merchant.emoji}</div>\n' +
'                <div style={{ flex:1 }}>\n' +
'                  <p style={{ fontSize:"17px", fontWeight:"700", color:"var(--text)" }}>{merchant.name}</p>\n' +
'                  <p style={{ fontSize:"12px", color:"var(--text-2)" }}>{merchant.category}</p>\n' +
'                </div>\n' +
'                <span className="zp-badge zp-badge-green">\u2713 Active</span>\n' +
'              </div>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-3)", fontFamily:"monospace", wordBreak:"break-all" }}>{address}</p>\n' +
'            </div>\n' +
'            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>\n' +
'              <button onClick={() => router.push("/merchant/dashboard")} className="zp-card" style={{ cursor:"pointer", textAlign:"left", border:"1px solid var(--border)" }}>\n' +
'                <p style={{ fontSize:"24px", marginBottom:"10px" }}>\uD83D\uDCCA</p>\n' +
'                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>Dashboard</p>\n' +
'                <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"2px" }}>View payments</p>\n' +
'              </button>\n' +
'              <button onClick={() => router.push("/merchant/pay?merchant="+address)} className="zp-card" style={{ cursor:"pointer", textAlign:"left", border:"1px solid var(--border)" }}>\n' +
'                <p style={{ fontSize:"24px", marginBottom:"10px" }}>\uD83D\uDCF1</p>\n' +
'                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>QR Code</p>\n' +
'                <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"2px" }}>Show to customers</p>\n' +
'              </button>\n' +
'            </div>\n' +
'            <button onClick={() => { localStorage.removeItem("zarpay_merchant_"+address); setMerchant(null); }}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid rgba(231,76,60,0.25)", background:"var(--red-dim)", color:"var(--red)", fontWeight:"600", cursor:"pointer", fontSize:"14px" }}>\n' +
'              Unregister Merchant\n' +
'            </button>\n' +
'          </>\n' +
'        ) : (\n' +
'          <div className="zp-card" style={{ textAlign:"center", padding:"32px 24px" }}>\n' +
'            <p style={{ fontSize:"48px", marginBottom:"20px" }}>\uD83C\uDFEA</p>\n' +
'            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)", marginBottom:"8px", letterSpacing:"-0.02em" }}>Become a Merchant</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", marginBottom:"24px", lineHeight:1.6 }}>Register to accept EURC payments from ZarPay customers via QR code or wallet address</p>\n' +
'            <div style={{ textAlign:"left", marginBottom:"24px", display:"flex", flexDirection:"column", gap:"10px" }}>\n' +
'              {["Accept EURC payments instantly","Share your QR code with customers","Track all incoming payments","No monthly fees"].map((f,i) => (\n' +
'                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>\n' +
'                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"var(--green)", flexShrink:0 }}>\u2713</div>\n' +
'                  <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{f}</span>\n' +
'                </div>\n' +
'              ))}\n' +
'            </div>\n' +
'            <button onClick={() => router.push("/merchant/register")} className="zp-btn-primary">Register as Merchant</button>\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/merchant/page.tsx', merchant);
console.log("✅ Merchant hub");

// ============================================================
// FINANCIAL SERVICES HUB
// ============================================================
const exchange =
'"use client";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const SERVICES = [\n' +
'  { label:"Deposit", sub:"Buy crypto with NGN", icon:"\uD83D\uDCE5", path:"/exchange/deposit", color:"var(--green)", tint:"var(--green-dim)", border:"var(--green-border)" },\n' +
'  { label:"Withdraw", sub:"Cash out to bank", icon:"\uD83C\uDFE6", path:"/exchange/withdraw", color:"#3B82F6", tint:"rgba(59,130,246,0.12)", border:"rgba(59,130,246,0.25)" },\n' +
'  { label:"Utility Bills", sub:"Pay bills & services", icon:"\u26A1", path:"/exchange/utility", color:"var(--amber)", tint:"var(--amber-dim)", border:"rgba(240,165,0,0.25)" },\n' +
'  { label:"Bank Accounts", sub:"Manage your banks", icon:"\uD83C\uDFDB", path:"/exchange/banks", color:"#A78BFA", tint:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.25)" },\n' +
'];\n' +
'export default function ExchangePage() {\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <div style={{ marginBottom:"8px" }}>\n' +
'          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Financial Services</h1>\n' +
'          <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"4px" }}>Deposits, withdrawals, bills and more</p>\n' +
'        </div>\n' +
'        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>\n' +
'          {SERVICES.map((s) => (\n' +
'            <button key={s.path} onClick={() => router.push(s.path)}\n' +
'              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"12px", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}>\n' +
'              <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:s.tint, border:"1px solid "+s.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{s.icon}</div>\n' +
'              <div>\n' +
'                <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>{s.label}</p>\n' +
'                <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"3px" }}>{s.sub}</p>\n' +
'              </div>\n' +
'            </button>\n' +
'          ))}\n' +
'        </div>\n' +
'        <div style={{ background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"10px" }}>\n' +
'          <span style={{ fontSize:"16px" }}>\uD83D\uDD12</span>\n' +
'          <p style={{ fontSize:"12px", color:"var(--text-2)" }}>All transactions are self-custodial. ZarPay never holds your funds.</p>\n' +
'        </div>\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/exchange/page.tsx', exchange);
console.log("✅ Exchange/Services hub");

// ============================================================
// ACTIVITY PAGE
// ============================================================
const activity =
'"use client";\n' +
'import { useEffect, useState } from "react";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useTransactionHistory, formatTxDate, shortenHash } from "@/lib/useTransactionHistory";\n' +
'export default function ActivityPage() {\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);\n' +
'  const { transactions, isLoading, isError, refetch } = useTransactionHistory(address);\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>\n' +
'          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>History</h1>\n' +
'          <button onClick={() => refetch()} style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"6px 12px", color:"var(--text-2)", cursor:"pointer", fontSize:"16px" }}>\u21BB</button>\n' +
'        </div>\n' +
'        <div className="zp-card">\n' +
'          {isLoading && (\n' +
'            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>\n' +
'              {[1,2,3,4,5].map(i => <div key={i} style={{ height:"64px", background:"var(--surface-2)", borderRadius:"10px" }} />)}\n' +
'            </div>\n' +
'          )}\n' +
'          {isError && !isLoading && (\n' +
'            <div style={{ padding:"40px", textAlign:"center" }}>\n' +
'              <p style={{ color:"var(--red)", fontSize:"14px", marginBottom:"16px" }}>Failed to load transactions</p>\n' +
'              <button onClick={() => refetch()} className="zp-btn-secondary" style={{ width:"auto", padding:"10px 20px" }}>Try Again</button>\n' +
'            </div>\n' +
'          )}\n' +
'          {!isLoading && !isError && transactions.length === 0 && (\n' +
'            <div style={{ padding:"48px 20px", textAlign:"center" }}>\n' +
'              <p style={{ fontSize:"32px", marginBottom:"12px" }}>\uD83D\uDCED</p>\n' +
'              <p style={{ fontSize:"15px", fontWeight:"600", color:"var(--text)", marginBottom:"6px" }}>No transactions yet</p>\n' +
'              <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Send or receive USDC on Arc Testnet to see activity here</p>\n' +
'            </div>\n' +
'          )}\n' +
'          {!isLoading && !isError && transactions.length > 0 && (\n' +
'            <div style={{ display:"flex", flexDirection:"column" }}>\n' +
'              {transactions.map((tx, i) => (\n' +
'                <a key={tx.hash} href={"https://testnet.arcscan.app/tx/"+tx.hash} target="_blank" rel="noopener noreferrer"\n' +
'                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom: i < transactions.length-1 ? "1px solid var(--border)" : "none", textDecoration:"none" }}>\n' +
'                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>\n' +
'                    <div style={{ width:"38px", height:"38px", borderRadius:"50%", background: tx.type==="sent" ? "var(--red-dim)" : "var(--green-dim)", border:"1px solid "+(tx.type==="sent" ? "rgba(231,76,60,0.25)" : "var(--green-border)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>\n' +
'                      {tx.type==="sent" ? "\u2197" : "\u2199"}\n' +
'                    </div>\n' +
'                    <div>\n' +
'                      <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text)", marginBottom:"2px" }}>{tx.type==="sent" ? "Sent" : "Received"}</p>\n' +
'                      <p style={{ fontSize:"11px", color:"var(--text-2)", fontFamily:"monospace" }}>{shortenHash(tx.hash)}</p>\n' +
'                      <p style={{ fontSize:"10px", color:"var(--text-3)", marginTop:"1px" }}>{formatTxDate(tx.timeStamp)}</p>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                  <div style={{ textAlign:"right" }}>\n' +
'                    <p style={{ fontSize:"14px", fontWeight:"700", color: tx.type==="sent" ? "var(--red)" : "var(--green)", marginBottom:"4px" }}>{tx.type==="sent"?"-":"+"}{tx.value} {tx.token}</p>\n' +
'                    <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"4px", background: tx.isError==="0" ? "var(--green-dim)" : "var(--red-dim)", color: tx.isError==="0" ? "var(--green)" : "var(--red)" }}>{tx.isError==="0"?"Success":"Failed"}</span>\n' +
'                  </div>\n' +
'                </a>\n' +
'              ))}\n' +
'            </div>\n' +
'          )}\n' +
'        </div>\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/activity/page.tsx', activity);
console.log("✅ Activity page");

console.log("\n🎉 UI v2 written. Run: npm run dev");