const fs = require('fs');

const content = 
'"use client";\n' +
'\n' +
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
'  { symbol: "USDC", name: "USD Coin", network: "Arc Testnet", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: true, key: "usdc" },\n' +
'  { symbol: "EURC", name: "Euro Coin", network: "Arc Testnet", icon: "\u20AC", color: "#003399", bg: "rgba(0,51,153,0.1)", bdr: "rgba(0,51,153,0.3)", live: true, key: "eurc" },\n' +
'  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", icon: "\u20BF", color: "#F7931A", bg: "rgba(247,147,26,0.1)", bdr: "rgba(247,147,26,0.3)", live: false, key: null },\n' +
'  { symbol: "ETH", name: "Ethereum", network: "Ethereum", icon: "\u039E", color: "#627EEA", bg: "rgba(98,126,234,0.1)", bdr: "rgba(98,126,234,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "ETH Sepolia", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Base", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Arbitrum", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Optimism", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Avalanche", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'];\n' +'];\n' +
'\n' +
'export default function DashboardPage() {\n' +
'  const { address } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [showSendModal, setShowSendModal] = useState(false);\n' +
'  const [showReceiveModal, setShowReceiveModal] = useState(false);\n' +
'\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'\n' +
'  const { usdcFormatted, eurcFormatted, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance(address);\n' +
'  const { rates } = useLivePrices();\n' +
'  const tr = t(settings.language);\n' +
'  const symbol = CURRENCY_SYMBOLS[settings.currency];\n' +
'\n' +
'  const usdcValue = (parseFloat(usdcFormatted) || 0) * (rates[settings.currency] || 1);\n' +
'  const eurcValue = (parseFloat(eurcFormatted) || 0) * (rates[settings.currency] || 1) * 1.08;\n' +
'  const totalPortfolioValue = usdcValue + eurcValue;\n' +
'  const fiatValue = totalPortfolioValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'  const displayName = settings.displayName && settings.displayName.trim() ? settings.displayName.trim() : tr.goodDay;\n' +
'  const shortAddress = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";\n' +
'\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f3f4f6";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e5e7eb";\n' +
'  const text = isDark ? "#ffffff" : "#111827";\n' +
'  const subText = isDark ? "#9ca3af" : "#6b7280";\n' +
'\n' +
'  function getBalance(token: typeof ALL_TOKENS[0]) {\n' +
'    if (!token.live) return "0.00";\n' +
'    if (token.key === "usdc") return usdcFormatted;\n' +
'    if (token.key === "eurc") return eurcFormatted;\n' +
'    return "0.00";\n' +
'  }\n' +
'\n' +
'  function getFiat(token: typeof ALL_TOKENS[0]) {\n' +
'    if (!token.live) return "0.00";\n' +
'    if (token.key === "usdc") return usdcValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'    if (token.key === "eurc") return eurcValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'    return "0.00";\n' +
'  }\n' +
'\n' +
'  if (!mounted) return null;\n' +
'\n' +
'  return (\n' +
'    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>\n' +
'      {showSendModal && <SendModal onClose={() => { setShowSendModal(false); refetchBalance(); }} />}\n' +
'      {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} />}\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "520px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>\n' +
'        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>ZarPay</h1>\n' +
'        <DisconnectButton />\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "520px", marginBottom: "20px" }}>\n' +
'        <p style={{ color: text, fontSize: "18px", fontWeight: "700" }}>{displayName} \uD83D\uDC4B</p>\n' +
'        <p style={{ color: "#4ade80", fontFamily: "monospace", marginTop: "6px", fontSize: "13px" }}>{shortAddress}</p>\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "520px", background: card, border: "1px solid " + border, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>\n' +
'        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>{tr.walletBalance}</p>\n' +
'        {balanceLoading ? (\n' +
'          <p style={{ color: text }}>{tr.loading}</p>\n' +
'        ) : (\n' +
'          <>\n' +
'            <p style={{ color: text, fontSize: "48px", fontWeight: "800" }}>{symbol}{fiatValue}</p>\n' +
'            <p style={{ color: subText, fontSize: "14px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Portfolio Value</p>\n' +
'          </>\n' +
'        )}\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "520px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>\n' +
'        <button onClick={() => setShowSendModal(true)} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>\n' +
'          <div style={{ fontSize: "22px" }}>\uD83D\uDCE4</div>\n' +
'          <div style={{ fontSize: "11px", fontWeight: "600" }}>{tr.send}</div>\n' +
'        </button>\n' +
'        <button onClick={() => setShowReceiveModal(true)} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>\n' +
'          <div style={{ fontSize: "22px" }}>\uD83D\uDCE5</div>\n' +
'          <div style={{ fontSize: "11px", fontWeight: "600" }}>{tr.receive}</div>\n' +
'        </button>\n' +
'        <button onClick={() => router.push("/activity")} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>\n' +
'          <div style={{ fontSize: "22px" }}>\u25F7</div>\n' +
'          <div style={{ fontSize: "11px", fontWeight: "600" }}>History</div>\n' +
'        </button>\n' +
'        <button onClick={() => router.push("/exchange")} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>\n' +
'          <div style={{ fontSize: "22px", color: "#4ade80" }}>$</div>\n' +
'          <div style={{ fontSize: "11px", fontWeight: "600" }}>Services</div>\n' +
'        </button>\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "520px", background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>\n' +
'        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Assets</p>\n' +
'        {ALL_TOKENS.map((token, i) => (\n' +
'          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", marginBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", borderBottom: i < ALL_TOKENS.length - 1 ? "1px solid " + border : "none", opacity: token.live ? 1 : 0.45 }}>\n' +
'            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>\n' +
'              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: token.bg, border: "1px solid " + token.bdr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: token.color, fontWeight: "700", flexShrink: 0 }}>{token.icon}</div>\n' +
'              <div>\n' +
'                <p style={{ color: text, fontWeight: "600", margin: 0, fontSize: "14px" }}>{token.symbol}</p>\n' +
'                <p style={{ color: subText, margin: 0, fontSize: "11px" }}>{token.name} \u00B7 {token.network}</p>\n' +
'              </div>\n' +
'            </div>\n' +
'            <div style={{ textAlign: "right" }}>\n' +
'              <p style={{ color: text, fontWeight: "700", margin: 0, fontSize: "14px" }}>{balanceLoading && token.live ? "..." : getBalance(token)}</p>\n' +
'              <p style={{ color: subText, fontSize: "11px", margin: 0 }}>{token.live ? symbol + (balanceLoading ? "..." : getFiat(token)) : "Coming soon"}</p>\n' +
'            </div>\n' +
'          </div>\n' +
'        ))}\n' +
'      </div>\n' +
'\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/dashboard/page.tsx', content);
console.log('Done! Dashboard updated with multi-chain assets.');