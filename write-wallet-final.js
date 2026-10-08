const fs = require('fs');

// 1. UPDATE BOTTOMNAV — 4 tabs only
fs.writeFileSync('components/BottomNav.tsx',
'"use client";\n' +
'import { useRouter, usePathname } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { t } from "@/lib/translations";\n' +
'export function BottomNav() {\n' +
'  const router = useRouter();\n' +
'  const pathname = usePathname();\n' +
'  const { settings } = useAppSettings();\n' +
'  const tr = t(settings.language ?? "English");\n' +
'  const tabs = [\n' +
'    { label: tr.home || "Home", icon: "\u2302", path: "/dashboard" },\n' +
'    { label: "Merchant", icon: "\u25C8", path: "/merchant" },\n' +
'    { label: tr.wallet || "Wallet", icon: "\u25CE", path: "/wallet" },\n' +
'    { label: tr.settings || "Settings", icon: "\u2699", path: "/settings" },\n' +
'  ];\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const navBg = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#d1d5db";\n' +
'  const inactive = isDark ? "#4b5563" : "#6b7280";\n' +
'  return (\n' +
'    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: navBg, borderTop: "1px solid " + border, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0 20px", zIndex: 100, transition: "all 0.3s ease" }}>\n' +
'      {tabs.map((tab) => {\n' +
'        const isActive = pathname === tab.path || pathname.startsWith(tab.path + "/");\n' +
'        return (\n' +
'          <button key={tab.path} onClick={() => router.push(tab.path)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: "4px 20px", position: "relative" }}>\n' +
'            {isActive && <span style={{ position: "absolute", top: "-10px", width: "20px", height: "3px", background: "#4ade80", borderRadius: "2px" }} />}\n' +
'            <span style={{ fontSize: "20px", color: isActive ? "#4ade80" : inactive }}>{tab.icon}</span>\n' +
'            <span style={{ fontSize: "10px", fontWeight: "600", color: isActive ? "#4ade80" : inactive, fontFamily: "monospace" }}>{tab.label}</span>\n' +
'          </button>\n' +
'        );\n' +
'      })}\n' +
'    </nav>\n' +
'  );\n' +
'}\n'
);
console.log('BottomNav updated to 4 tabs');

// 2. UPDATE WALLET PAGE — Portfolio + Swap + Bridge tabs + Assets
const walletContent =
'"use client";\n' +
'import { useEffect, useState } from "react";\n' +
'import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { parseUnits, formatUnits } from "viem";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { useLivePrices } from "@/lib/useLivePrices";\n' +
'import { CURRENCY_SYMBOLS } from "@/lib/useSettings";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { USDC_ADDRESS, EURC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";\n' +
'\n' +
'type TokenSymbol = "USDC" | "EURC";\n' +
'const TOKEN_ADDRESSES: Record<TokenSymbol, `0x${string}`> = { USDC: USDC_ADDRESS, EURC: EURC_ADDRESS };\n' +
'\n' +
'const ALL_TOKENS = [\n' +
'  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", icon: "\u20BF", color: "#F7931A", bg: "rgba(247,147,26,0.1)", bdr: "rgba(247,147,26,0.3)", live: false, key: null },\n' +
'  { symbol: "ETH", name: "Ethereum", network: "Ethereum", icon: "\u039E", color: "#627EEA", bg: "rgba(98,126,234,0.1)", bdr: "rgba(98,126,234,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Arc Testnet", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: true, key: "usdc" },\n' +
'  { symbol: "EURC", name: "Euro Coin", network: "Arc Testnet", icon: "\u20AC", color: "#003399", bg: "rgba(0,51,153,0.1)", bdr: "rgba(0,51,153,0.3)", live: true, key: "eurc" },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "ETH Sepolia", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Base", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Arbitrum", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Optimism", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'  { symbol: "USDC", name: "USD Coin", network: "Avalanche", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },\n' +
'];\n' +
'\n' +
'const BRIDGE_ROUTES = [\n' +
'  { from: "Arc Testnet", to: "Ethereum", token: "USDC", time: "~5 min" },\n' +
'  { from: "Arc Testnet", to: "Base", token: "USDC", time: "~3 min" },\n' +
'  { from: "Arc Testnet", to: "Arbitrum", token: "USDC", time: "~5 min" },\n' +
'  { from: "Arc Testnet", to: "Optimism", token: "USDC", time: "~5 min" },\n' +
'  { from: "Arc Testnet", to: "Polygon", token: "USDC", time: "~3 min" },\n' +
'  { from: "Arc Testnet", to: "Avalanche", token: "USDC", time: "~3 min" },\n' +
'];\n' +
'\n' +
'export default function WalletPage() {\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [activeTab, setActiveTab] = useState("portfolio");\n' +
'\n' +
'  // Swap state\n' +
'  const [fromToken, setFromToken] = useState<TokenSymbol>("USDC");\n' +
'  const [toToken, setToToken] = useState<TokenSymbol>("EURC");\n' +
'  const [swapAmount, setSwapAmount] = useState("");\n' +
'  const [netOut, setNetOut] = useState("");\n' +
'  const [feeAmount, setFeeAmount] = useState("");\n' +
'  const [netOutRaw, setNetOutRaw] = useState<bigint>(BigInt(0));\n' +
'  const SLIPPAGE_TOLERANCE_BPS = BigInt(50);\n' +
'  const [swapStep, setSwapStep] = useState<"idle"|"approving"|"swapping"|"success"|"error">("idle");\n' +
'  const [swapMsg, setSwapMsg] = useState("");\n' +
'\n' +
'  // Bridge state\n' +
'  const [bridgeRoute, setBridgeRoute] = useState(BRIDGE_ROUTES[0]);\n' +
'  const [bridgeAmount, setBridgeAmount] = useState("");\n' +
'  const [bridgeStep, setBridgeStep] = useState<"idle"|"pending"|"success">("idle");\n' +
'\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);\n' +
'\n' +
'  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);\n' +
'  const { rates } = useLivePrices();\n' +
'  const symbol = CURRENCY_SYMBOLS[settings.currency];\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const inputBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'\n' +
'  const rate = rates[settings.currency] || 1;\n' +
'  const usdcNum = parseFloat(usdcFormatted) || 0;\n' +
'  const eurcNum = parseFloat(eurcFormatted) || 0;\n' +
'  const totalFiat = ((usdcNum * rate) + (eurcNum * rate * 1.08)).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'\n' +
'  function getBalance(token: typeof ALL_TOKENS[0]) {\n' +
'    if (!token.live) return "0.00";\n' +
'    if (token.key === "usdc") return usdcFormatted;\n' +
'    if (token.key === "eurc") return eurcFormatted;\n' +
'    return "0.00";\n' +
'  }\n' +
'  function getFiat(token: typeof ALL_TOKENS[0]) {\n' +
'    if (!token.live) return "0.00";\n' +
'    if (token.key === "usdc") return (usdcNum * rate).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'    if (token.key === "eurc") return (eurcNum * rate * 1.08).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });\n' +
'    return "0.00";\n' +
'  }\n' +
'\n' +
'  const isUsdcToEurc = fromToken === "USDC";\n' +
'  const amountIn = swapAmount && Number(swapAmount) > 0 ? parseUnits(swapAmount, TOKEN_DECIMALS) : BigInt(0);\n' +
'\n' +
'  const { refetch: refetchPreview } = useReadContract({\n' +
'    address: ZARPAY_SWAP_POOL_ADDRESS,\n' +
'    abi: ZARPAY_SWAP_POOL_ABI,\n' +
'    functionName: "previewSwapAfterFee",\n' +
'    args: [amountIn, isUsdcToEurc],\n' +
'    query: { enabled: false },\n' +
'  });\n' +
'  const { data: allowance, refetch: refetchAllowance } = useReadContract({\n' +
'    address: TOKEN_ADDRESSES[fromToken],\n' +
'    abi: ERC20_ABI,\n' +
'    functionName: "allowance",\n' +
'    args: address ? [address, ZARPAY_SWAP_POOL_ADDRESS] : undefined,\n' +
'    query: { enabled: !!address },\n' +
'  });\n' +
'  const needsApproval = !allowance || allowance < amountIn;\n' +
'  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();\n' +
'  const { writeContract: writeSwap, data: swapHash, error: swapError, reset: resetSwap } = useWriteContract();\n' +
'  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });\n' +
'  const { isLoading: swapConfirming, isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapHash });\n' +
'\n' +
'  useEffect(() => {\n' +
'    if (approveConfirmed && swapStep === "approving") { refetchAllowance(); runSwap(); }\n' +
'  }, [approveConfirmed]);\n' +
'  useEffect(() => {\n' +
'    if (swapConfirmed && swapStep === "swapping") { setSwapStep("success"); setSwapMsg("Swapped " + swapAmount + " " + fromToken + " \u2192 " + netOut + " " + toToken); refetch(); }\n' +
'  }, [swapConfirmed]);\n' +
'  useEffect(() => {\n' +
'    if (approveError) { setSwapStep("error"); setSwapMsg(approveError.message || "Approval failed."); }\n' +
'    if (swapError) { setSwapStep("error"); setSwapMsg(swapError.message || "Swap failed."); }\n' +
'  }, [approveError, swapError]);\n' +
'  useEffect(() => {\n' +
'    if (amountIn > BigInt(0)) {\n' +
'      refetchPreview().then(res => {\n' +
'        const data = res.data as [bigint, bigint] | undefined;\n' +
'        if (data) { setNetOut(formatUnits(data[0], TOKEN_DECIMALS)); setFeeAmount(formatUnits(data[1], TOKEN_DECIMALS)); setNetOutRaw(data[0]); }\n' +
'      });\n' +
'    } else { setNetOut(""); setFeeAmount(""); setNetOutRaw(BigInt(0)); }\n' +
'  }, [swapAmount, fromToken, toToken]);\n' +
'\n' +
'  function runSwap() {\n' +
'    setSwapStep("swapping");\n' +
'    const minAmountOut = netOutRaw - (netOutRaw * SLIPPAGE_TOLERANCE_BPS) / BigInt(10000);\n' +
'    writeSwap({ address: ZARPAY_SWAP_POOL_ADDRESS, abi: ZARPAY_SWAP_POOL_ABI, functionName: isUsdcToEurc ? "swapUSDCtoEURC" : "swapEURCtoUSDC", args: [amountIn, minAmountOut] });\n' +
'  }\n' +
'  function handleSwap() {\n' +
'    if (!swapAmount || Number(swapAmount) <= 0 || fromToken === toToken) return;\n' +
'    resetApprove(); resetSwap(); setSwapMsg("");\n' +
'    if (needsApproval) { setSwapStep("approving"); writeApprove({ address: TOKEN_ADDRESSES[fromToken], abi: ERC20_ABI, functionName: "approve", args: [ZARPAY_SWAP_POOL_ADDRESS, amountIn] }); }\n' +
'    else { runSwap(); }\n' +
'  }\n' +
'  function resetSwapState() { setSwapStep("idle"); setSwapAmount(""); setNetOut(""); setFeeAmount(""); setSwapMsg(""); resetApprove(); resetSwap(); }\n' +
'\n' +
'  const isPending = swapStep === "approving" || swapStep === "swapping" || approveConfirming || swapConfirming;\n' +
'\n' +
'  if (!mounted) return null;\n' +
'\n' +
'  return (\n' +
'    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "440px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>\n' +
'        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>Wallet</h1>\n' +
'        <button onClick={() => refetch()} style={{ background: "none", border: "none", color: subText, fontSize: "18px", cursor: "pointer" }}>\u21BB</button>\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "20px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>\n' +
'        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Total Portfolio Value</p>\n' +
'        <p style={{ color: text, fontSize: "38px", fontWeight: "800", letterSpacing: "-0.02em", margin: 0 }}>{symbol}{isLoading ? "..." : totalFiat}</p>\n' +
'        <p style={{ color: subText, fontSize: "12px", marginTop: "6px" }}>Arc Testnet \u00B7 {settings.currency}</p>\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "440px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>\n' +
'        {["portfolio", "swap", "bridge"].map(tab => (\n' +
'          <button key={tab} onClick={() => setActiveTab(tab)}\n' +
'            style={{ padding: "12px", borderRadius: "12px", border: "1px solid " + (activeTab === tab ? "rgba(74,222,128,0.4)" : border), background: activeTab === tab ? "rgba(74,222,128,0.08)" : card, color: activeTab === tab ? "#4ade80" : subText, fontWeight: activeTab === tab ? "700" : "400", cursor: "pointer", fontSize: "13px", textTransform: "capitalize" }}>\n' +
'            {tab === "portfolio" ? "\uD83D\uDCCA Portfolio" : tab === "swap" ? "\u21C4 Swap" : "\uD83C\uDF09 Bridge"}\n' +
'          </button>\n' +
'        ))}\n' +
'      </div>\n' +
'\n' +
'      {activeTab === "portfolio" && (\n' +
'        <div style={{ width: "100%", maxWidth: "440px", background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>\n' +
'          <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Assets</p>\n' +
'          {ALL_TOKENS.map((token, i) => (\n' +
'            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", marginBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", borderBottom: i < ALL_TOKENS.length - 1 ? "1px solid " + border : "none", opacity: token.live ? 1 : 0.45 }}>\n' +
'              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>\n' +
'                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: token.bg, border: "1px solid " + token.bdr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: token.color, fontWeight: "700", flexShrink: 0 }}>{token.icon}</div>\n' +
'                <div>\n' +
'                  <p style={{ color: text, fontWeight: "600", margin: 0, fontSize: "14px" }}>{token.symbol}</p>\n' +
'                  <p style={{ color: subText, margin: 0, fontSize: "11px" }}>{token.name} \u00B7 {token.network}</p>\n' +
'                </div>\n' +
'              </div>\n' +
'              <div style={{ textAlign: "right" }}>\n' +
'                <p style={{ color: text, fontWeight: "700", margin: 0, fontSize: "14px" }}>{isLoading && token.live ? "..." : getBalance(token)}</p>\n' +
'                <p style={{ color: subText, fontSize: "11px", margin: 0 }}>{token.live ? symbol + (isLoading ? "..." : getFiat(token)) : "Coming soon"}</p>\n' +
'              </div>\n' +
'            </div>\n' +
'          ))}\n' +
'        </div>\n' +
'      )}\n' +
'\n' +
'      {activeTab === "swap" && (\n' +
'        <div style={{ width: "100%", maxWidth: "440px" }}>\n' +
'          {swapStep === "idle" && (\n' +
'            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>\n' +
'              <div style={{ marginBottom: "16px" }}>\n' +
'                <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>From</p>\n' +
'                <select value={fromToken} onChange={e => { setFromToken(e.target.value as TokenSymbol); setNetOut(""); }}\n' +
'                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid " + border, background: inputBg, color: text, marginBottom: "10px" }}>\n' +
'                  <option value="USDC">USDC</option>\n' +
'                  <option value="EURC">EURC</option>\n' +
'                </select>\n' +
'                <p style={{ color: subText, fontSize: "11px", textAlign: "right", marginBottom: "6px" }}>Balance: {fromToken === "USDC" ? usdcFormatted : eurcFormatted} {fromToken}</p>\n' +
'                <input type="number" placeholder="0.00" value={swapAmount} onChange={e => { setSwapAmount(e.target.value); setNetOut(""); }}\n' +
'                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid " + border, background: inputBg, color: text, fontSize: "18px", fontWeight: "700", boxSizing: "border-box" }} />\n' +
'              </div>\n' +
'              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>\n' +
'                <button onClick={() => { setFromToken(toToken); setToToken(fromToken); setSwapAmount(""); setNetOut(""); }}\n' +
'                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid " + border, background: bg, color: "#4ade80", cursor: "pointer", fontSize: "16px" }}>\u21C5</button>\n' +
'              </div>\n' +
'              <div style={{ marginBottom: "16px" }}>\n' +
'                <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>To</p>\n' +
'                <select value={toToken} onChange={e => { setToToken(e.target.value as TokenSymbol); setNetOut(""); }}\n' +
'                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid " + border, background: inputBg, color: text }}>\n' +
'                  <option value="USDC">USDC</option>\n' +
'                  <option value="EURC">EURC</option>\n' +
'                </select>\n' +
'              </div>\n' +
'              {netOut && (\n' +
'                <div style={{ background: bg, border: "1px solid " + border, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>\n' +
'                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>\n' +
'                    <span style={{ color: subText, fontSize: "12px" }}>You receive</span>\n' +
'                    <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: "700" }}>{netOut} {toToken}</span>\n' +
'                  </div>\n' +
'                  <div style={{ display: "flex", justifyContent: "space-between" }}>\n' +
'                    <span style={{ color: subText, fontSize: "12px" }}>Fee (0.5%)</span>\n' +
'                    <span style={{ color: subText, fontSize: "12px" }}>{feeAmount} {toToken}</span>\n' +
'                  </div>\n' +
'                </div>\n' +
'              )}\n' +
'              <button onClick={handleSwap} disabled={!swapAmount || Number(swapAmount) <= 0 || fromToken === toToken}\n' +
'                style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: !swapAmount || Number(swapAmount) <= 0 || fromToken === toToken ? "#1f2937" : "#4ade80", color: !swapAmount || Number(swapAmount) <= 0 || fromToken === toToken ? "#4b5563" : "#111", fontWeight: "700", fontSize: "15px", cursor: !swapAmount || Number(swapAmount) <= 0 || fromToken === toToken ? "not-allowed" : "pointer" }}>\n' +
'                {fromToken === toToken ? "Select different tokens" : !swapAmount ? "Enter amount" : "Swap " + fromToken + " \u2192 " + toToken}\n' +
'              </button>\n' +
'            </div>\n' +
'          )}\n' +
'          {isPending && (\n' +
'            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>\n' +
'              <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid " + border, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />\n' +
'              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'              <p style={{ color: text, fontWeight: "700" }}>{swapStep === "approving" ? (approveConfirming ? "Confirming approval..." : "Waiting for approval...") : (swapConfirming ? "Confirming swap..." : "Waiting for confirmation...")}</p>\n' +
'              {swapStep === "approving" && <p style={{ color: subText, fontSize: "12px", textAlign: "center" }}>Step 1 of 2</p>}\n' +
'            </div>\n' +
'          )}\n' +
'          {swapStep === "success" && (\n' +
'            <div style={{ background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>\n' +
'              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>\u2713</div>\n' +
'              <p style={{ color: text, fontWeight: "700", fontSize: "18px" }}>Swap Complete!</p>\n' +
'              <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>{swapMsg}</p>\n' +
'              {swapHash && <a href={"https://testnet.arcscan.app/tx/" + swapHash} target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", textDecoration: "underline" }}>View on ArcScan \u2197</a>}\n' +
'              <button onClick={resetSwapState} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Swap Again</button>\n' +
'            </div>\n' +
'          )}\n' +
'          {swapStep === "error" && (\n' +
'            <div style={{ background: card, border: "1px solid rgba(248,113,113,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>\n' +
'              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>\u2715</div>\n' +
'              <p style={{ color: text, fontWeight: "700", fontSize: "18px" }}>Swap Failed</p>\n' +
'              <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{swapMsg}</p>\n' +
'              <button onClick={resetSwapState} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Try Again</button>\n' +
'            </div>\n' +
'          )}\n' +
'        </div>\n' +
'      )}\n' +
'\n' +
'      {activeTab === "bridge" && (\n' +
'        <div style={{ width: "100%", maxWidth: "440px" }}>\n' +
'          {bridgeStep === "idle" && (\n' +
'            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>\n' +
'              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>\n' +
'                <p style={{ color: text, fontWeight: "700", fontSize: "15px", margin: 0 }}>Bridge USDC</p>\n' +
'                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "4px 10px" }}>\n' +
'                  <span style={{ color: "#f59e0b", fontSize: "11px" }}>Demo Mode</span>\n' +
'                </div>\n' +
'              </div>\n' +
'              <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>From</p>\n' +
'              <div style={{ background: inputBg, border: "1px solid " + border, borderRadius: "14px", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>\n' +
'                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#4ade80", fontWeight: "700", flexShrink: 0 }}>ARC</div>\n' +
'                <div style={{ flex: 1 }}>\n' +
'                  <p style={{ color: text, fontWeight: "700", margin: 0 }}>Arc Testnet</p>\n' +
'                  <p style={{ color: subText, fontSize: "11px", margin: "2px 0 0" }}>Balance: {usdcFormatted} USDC</p>\n' +
'                </div>\n' +
'                <input type="number" placeholder="0.00" value={bridgeAmount} onChange={e => setBridgeAmount(e.target.value)}\n' +
'                  style={{ width: "90px", background: "none", border: "none", outline: "none", color: text, fontSize: "20px", fontWeight: "800", textAlign: "right" }} />\n' +
'              </div>\n' +
'              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>\n' +
'                <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid " + border, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80", fontSize: "16px" }}>\u2193</div>\n' +
'              </div>\n' +
'              <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>To</p>\n' +
'              <div style={{ marginBottom: "16px" }}>\n' +
'                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>\n' +
'                  {BRIDGE_ROUTES.map(r => (\n' +
'                    <button key={r.to} onClick={() => setBridgeRoute(r)}\n' +
'                      style={{ padding: "12px 8px", borderRadius: "12px", border: "1px solid " + (bridgeRoute.to === r.to ? "rgba(74,222,128,0.4)" : border), background: bridgeRoute.to === r.to ? "rgba(74,222,128,0.08)" : inputBg, color: bridgeRoute.to === r.to ? "#4ade80" : text, cursor: "pointer", fontSize: "12px", fontWeight: bridgeRoute.to === r.to ? "700" : "400", textAlign: "center" }}>\n' +
'                      {r.to}\n' +
'                    </button>\n' +
'                  ))}\n' +
'                </div>\n' +
'                <p style={{ color: subText, fontSize: "11px", margin: "10px 0 0", textAlign: "center" }}>Est. time: {bridgeRoute.time}</p>\n' +
'              </div>\n' +
'              {bridgeAmount && Number(bridgeAmount) > 0 && (\n' +
'                <div style={{ background: bg, border: "1px solid " + border, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>\n' +
'                  {[\n' +
'                    { label: "You send", value: bridgeAmount + " USDC" },\n' +
'                    { label: "You receive", value: bridgeAmount + " USDC (on " + bridgeRoute.to + ")" },\n' +
'                    { label: "Bridge fee", value: "~0.10 USDC" },\n' +
'                    { label: "Est. time", value: bridgeRoute.time },\n' +
'                  ].map((row, i) => (\n' +
'                    <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: i < 3 ? "8px" : "0", marginBottom: i < 3 ? "8px" : "0", borderBottom: i < 3 ? "1px solid " + border : "none" }}>\n' +
'                      <span style={{ color: subText, fontSize: "12px" }}>{row.label}</span>\n' +
'                      <span style={{ color: i === 1 ? "#4ade80" : text, fontSize: "12px", fontWeight: "600" }}>{row.value}</span>\n' +
'                    </div>\n' +
'                  ))}\n' +
'                </div>\n' +
'              )}\n' +
'              <button onClick={() => { if (!bridgeAmount || Number(bridgeAmount) <= 0) return; setBridgeStep("pending"); setTimeout(() => setBridgeStep("success"), 3000); }}\n' +
'                disabled={!bridgeAmount || Number(bridgeAmount) <= 0}\n' +
'                style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: !bridgeAmount || Number(bridgeAmount) <= 0 ? "#1f2937" : "#4ade80", color: !bridgeAmount || Number(bridgeAmount) <= 0 ? "#4b5563" : "#111", fontWeight: "700", fontSize: "15px", cursor: !bridgeAmount || Number(bridgeAmount) <= 0 ? "not-allowed" : "pointer" }}>\n' +
'                {!bridgeAmount ? "Enter amount" : "Bridge to " + bridgeRoute.to}\n' +
'              </button>\n' +
'            </div>\n' +
'          )}\n' +
'          {bridgeStep === "pending" && (\n' +
'            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>\n' +
'              <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid " + border, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />\n' +
'              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'              <p style={{ color: text, fontWeight: "700" }}>Bridging to {bridgeRoute.to}...</p>\n' +
'              <p style={{ color: subText, fontSize: "12px" }}>Demo mode \u00B7 Est. {bridgeRoute.time}</p>\n' +
'            </div>\n' +
'          )}\n' +
'          {bridgeStep === "success" && (\n' +
'            <div style={{ background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>\n' +
'              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>\u2713</div>\n' +
'              <p style={{ color: text, fontWeight: "700", fontSize: "18px" }}>Bridge Initiated!</p>\n' +
'              <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>{bridgeAmount} USDC \u2192 {bridgeRoute.to}</p>\n' +
'              <p style={{ color: "#f59e0b", fontSize: "12px", textAlign: "center" }}>\uD83D\uDFE1 Demo \u2014 no real funds were moved</p>\n' +
'              <button onClick={() => { setBridgeStep("idle"); setBridgeAmount(""); }}\n' +
'                style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Bridge Again</button>\n' +
'            </div>\n' +
'          )}\n' +
'        </div>\n' +
'      )}\n' +
'\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/wallet/page.tsx', walletContent);
console.log('Wallet page updated with Portfolio/Swap/Bridge tabs');

console.log('All done!');