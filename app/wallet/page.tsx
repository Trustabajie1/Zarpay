"use client";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { parseUnits, formatUnits } from "viem";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { useLivePrices } from "@/lib/useLivePrices";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { BottomNav } from "@/components/BottomNav";
import { USDC_ADDRESS, EURC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";

type TokenSymbol = "USDC" | "EURC";
const TOKEN_ADDRESSES: Record<TokenSymbol, `0x${string}`> = { USDC: USDC_ADDRESS, EURC: EURC_ADDRESS };

const ALL_TOKENS = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", icon: "₿", color: "#F7931A", bg: "rgba(247,147,26,0.1)", bdr: "rgba(247,147,26,0.3)", live: false, key: null },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", icon: "Ξ", color: "#627EEA", bg: "rgba(98,126,234,0.1)", bdr: "rgba(98,126,234,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Arc Testnet", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: true, key: "usdc" },
  { symbol: "EURC", name: "Euro Coin", network: "Arc Testnet", icon: "€", color: "#003399", bg: "rgba(0,51,153,0.1)", bdr: "rgba(0,51,153,0.3)", live: true, key: "eurc" },
  { symbol: "USDC", name: "USD Coin", network: "ETH Sepolia", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Base", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Arbitrum", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Optimism", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Avalanche", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
];

const BRIDGE_ROUTES = [
  { from: "Arc Testnet", to: "Ethereum", token: "USDC", time: "~5 min" },
  { from: "Arc Testnet", to: "Base", token: "USDC", time: "~3 min" },
  { from: "Arc Testnet", to: "Arbitrum", token: "USDC", time: "~5 min" },
  { from: "Arc Testnet", to: "Optimism", token: "USDC", time: "~5 min" },
  { from: "Arc Testnet", to: "Polygon", token: "USDC", time: "~3 min" },
  { from: "Arc Testnet", to: "Avalanche", token: "USDC", time: "~3 min" },
];

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("portfolio");

  // Swap state
  const [fromToken, setFromToken] = useState<TokenSymbol>("USDC");
  const [toToken, setToToken] = useState<TokenSymbol>("EURC");
  const [swapAmount, setSwapAmount] = useState("");
  const [netOut, setNetOut] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [swapStep, setSwapStep] = useState<"idle"|"approving"|"swapping"|"success"|"error">("idle");
  const [swapMsg, setSwapMsg] = useState("");

  // Bridge state
  const [bridgeRoute, setBridgeRoute] = useState(BRIDGE_ROUTES[0]);
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [bridgeStep, setBridgeStep] = useState<"idle"|"pending"|"success">("idle");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);

  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  const rate = rates[settings.currency] || 1;
  const usdcNum = parseFloat(usdcFormatted) || 0;
  const eurcNum = parseFloat(eurcFormatted) || 0;
  const totalFiat = ((usdcNum * rate) + (eurcNum * rate * 1.08)).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function getBalance(token: typeof ALL_TOKENS[0]) {
    if (!token.live) return "0.00";
    if (token.key === "usdc") return usdcFormatted;
    if (token.key === "eurc") return eurcFormatted;
    return "0.00";
  }
  function getFiat(token: typeof ALL_TOKENS[0]) {
    if (!token.live) return "0.00";
    if (token.key === "usdc") return (usdcNum * rate).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (token.key === "eurc") return (eurcNum * rate * 1.08).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "0.00";
  }

  const isUsdcToEurc = fromToken === "USDC";
  const amountIn = swapAmount && Number(swapAmount) > 0 ? parseUnits(swapAmount, TOKEN_DECIMALS) : BigInt(0);

  const { refetch: refetchPreview } = useReadContract({
    address: ZARPAY_SWAP_POOL_ADDRESS,
    abi: ZARPAY_SWAP_POOL_ABI,
    functionName: "previewSwapAfterFee",
    args: [amountIn, isUsdcToEurc],
    query: { enabled: false },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: TOKEN_ADDRESSES[fromToken],
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, ZARPAY_SWAP_POOL_ADDRESS] : undefined,
    query: { enabled: !!address },
  });
  const needsApproval = !allowance || allowance < amountIn;
  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();
  const { writeContract: writeSwap, data: swapHash, error: swapError, reset: resetSwap } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: swapConfirming, isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (approveConfirmed && swapStep === "approving") { refetchAllowance(); runSwap(); }
  }, [approveConfirmed]);
  useEffect(() => {
    if (swapConfirmed && swapStep === "swapping") { setSwapStep("success"); setSwapMsg("Swapped " + swapAmount + " " + fromToken + " → " + netOut + " " + toToken); refetch(); }
  }, [swapConfirmed]);
  useEffect(() => {
    if (approveError) { setSwapStep("error"); setSwapMsg(approveError.message || "Approval failed."); }
    if (swapError) { setSwapStep("error"); setSwapMsg(swapError.message || "Swap failed."); }
  }, [approveError, swapError]);
  useEffect(() => {
    if (amountIn > BigInt(0)) {
      refetchPreview().then(res => {
        const data = res.data as [bigint, bigint] | undefined;
        if (data) { setNetOut(formatUnits(data[0], TOKEN_DECIMALS)); setFeeAmount(formatUnits(data[1], TOKEN_DECIMALS)); }
      });
    } else { setNetOut(""); setFeeAmount(""); }
  }, [swapAmount, fromToken, toToken]);

  function runSwap() {
    setSwapStep("swapping");
    writeSwap({ address: ZARPAY_SWAP_POOL_ADDRESS, abi: ZARPAY_SWAP_POOL_ABI, functionName: isUsdcToEurc ? "swapUSDCtoEURC" : "swapEURCtoUSDC", args: [amountIn] });
  }
  function handleSwap() {
    if (!swapAmount || Number(swapAmount) <= 0 || fromToken === toToken) return;
    resetApprove(); resetSwap(); setSwapMsg("");
    if (needsApproval) { setSwapStep("approving"); writeApprove({ address: TOKEN_ADDRESSES[fromToken], abi: ERC20_ABI, functionName: "approve", args: [ZARPAY_SWAP_POOL_ADDRESS, amountIn] }); }
    else { runSwap(); }
  }
  function resetSwapState() { setSwapStep("idle"); setSwapAmount(""); setNetOut(""); setFeeAmount(""); setSwapMsg(""); resetApprove(); resetSwap(); }

  const isPending = swapStep === "approving" || swapStep === "swapping" || approveConfirming || swapConfirming;

  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      <div style={{ width: "100%", maxWidth: "440px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>Wallet</h1>
        <button onClick={() => refetch()} style={{ background: "none", border: "none", color: subText, fontSize: "18px", cursor: "pointer" }}>↻</button>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "20px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>Total Portfolio Value</p>
        <p style={{ color: text, fontSize: "38px", fontWeight: "800", letterSpacing: "-0.02em", margin: 0 }}>{symbol}{isLoading ? "..." : totalFiat}</p>
        <p style={{ color: subText, fontSize: "12px", marginTop: "6px" }}>Arc Testnet · {settings.currency}</p>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        {["portfolio", "swap", "bridge"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding: "12px", borderRadius: "12px", border: "1px solid " + (activeTab === tab ? "rgba(74,222,128,0.4)" : border), background: activeTab === tab ? "rgba(74,222,128,0.08)" : card, color: activeTab === tab ? "#4ade80" : subText, fontWeight: activeTab === tab ? "700" : "400", cursor: "pointer", fontSize: "13px", textTransform: "capitalize" }}>
            {tab === "portfolio" ? "📊 Portfolio" : tab === "swap" ? "⇄ Swap" : "🌉 Bridge"}
          </button>
        ))}
      </div>

      {activeTab === "portfolio" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>
          <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Assets</p>
          {ALL_TOKENS.map((token, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", marginBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", borderBottom: i < ALL_TOKENS.length - 1 ? "1px solid " + border : "none", opacity: token.live ? 1 : 0.45 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: token.bg, border: "1px solid " + token.bdr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", color: token.color, fontWeight: "700", flexShrink: 0 }}>{token.icon}</div>
                <div>
                  <p style={{ color: text, fontWeight: "600", margin: 0, fontSize: "14px" }}>{token.symbol}</p>
                  <p style={{ color: subText, margin: 0, fontSize: "11px" }}>{token.name} · {token.network}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ color: text, fontWeight: "700", margin: 0, fontSize: "14px" }}>{isLoading && token.live ? "..." : getBalance(token)}</p>
                <p style={{ color: subText, fontSize: "11px", margin: 0 }}>{token.live ? symbol + (isLoading ? "..." : getFiat(token)) : "Coming soon"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "swap" && (
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {swapStep === "idle" && (
            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>From</p>
                <select value={fromToken} onChange={e => { setFromToken(e.target.value as TokenSymbol); setNetOut(""); }}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid " + border, background: inputBg, color: text, marginBottom: "10px" }}>
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
                </select>
                <p style={{ color: subText, fontSize: "11px", textAlign: "right", marginBottom: "6px" }}>Balance: {fromToken === "USDC" ? usdcFormatted : eurcFormatted} {fromToken}</p>
                <input type="number" placeholder="0.00" value={swapAmount} onChange={e => { setSwapAmount(e.target.value); setNetOut(""); }}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid " + border, background: inputBg, color: text, fontSize: "18px", fontWeight: "700", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <button onClick={() => { setFromToken(toToken); setToToken(fromToken); setSwapAmount(""); setNetOut(""); }}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid " + border, background: bg, color: "#4ade80", cursor: "pointer", fontSize: "16px" }}>⇅</button>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>To</p>
                <select value={toToken} onChange={e => { setToToken(e.target.value as TokenSymbol); setNetOut(""); }}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid " + border, background: inputBg, color: text }}>
                  <option value="USDC">USDC</option>
                  <option value="EURC">EURC</option>
                </select>
              </div>
              {netOut && (
                <div style={{ background: bg, border: "1px solid " + border, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: subText, fontSize: "12px" }}>You receive</span>
                    <span style={{ color: "#4ade80", fontSize: "12px", fontWeight: "700" }}>{netOut} {toToken}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: subText, fontSize: "12px" }}>Fee (0.5%)</span>
                    <span style={{ color: subText, fontSize: "12px" }}>{feeAmount} {toToken}</span>
                  </div>
                </div>
              )}
              <button onClick={handleSwap} disabled={!swapAmount || Number(swapAmount) <= 0 || fromToken === toToken}
                style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: !swapAmount || Number(swapAmount) <= 0 || fromToken === toToken ? "#1f2937" : "#4ade80", color: !swapAmount || Number(swapAmount) <= 0 || fromToken === toToken ? "#4b5563" : "#111", fontWeight: "700", fontSize: "15px", cursor: !swapAmount || Number(swapAmount) <= 0 || fromToken === toToken ? "not-allowed" : "pointer" }}>
                {fromToken === toToken ? "Select different tokens" : !swapAmount ? "Enter amount" : "Swap " + fromToken + " → " + toToken}
              </button>
            </div>
          )}
          {isPending && (
            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid " + border, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              <p style={{ color: text, fontWeight: "700" }}>{swapStep === "approving" ? (approveConfirming ? "Confirming approval..." : "Waiting for approval...") : (swapConfirming ? "Confirming swap..." : "Waiting for confirmation...")}</p>
              {swapStep === "approving" && <p style={{ color: subText, fontSize: "12px", textAlign: "center" }}>Step 1 of 2</p>}
            </div>
          )}
          {swapStep === "success" && (
            <div style={{ background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✓</div>
              <p style={{ color: text, fontWeight: "700", fontSize: "18px" }}>Swap Complete!</p>
              <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>{swapMsg}</p>
              {swapHash && <a href={"https://testnet.arcscan.app/tx/" + swapHash} target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", textDecoration: "underline" }}>View on ArcScan ↗</a>}
              <button onClick={resetSwapState} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Swap Again</button>
            </div>
          )}
          {swapStep === "error" && (
            <div style={{ background: card, border: "1px solid rgba(248,113,113,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✕</div>
              <p style={{ color: text, fontWeight: "700", fontSize: "18px" }}>Swap Failed</p>
              <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{swapMsg}</p>
              <button onClick={resetSwapState} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Try Again</button>
            </div>
          )}
        </div>
      )}

      {activeTab === "bridge" && (
        <div style={{ width: "100%", maxWidth: "440px" }}>
          {bridgeStep === "idle" && (
            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <p style={{ color: text, fontWeight: "700", fontSize: "15px", margin: 0 }}>Bridge USDC</p>
                <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
                  <span style={{ color: "#f59e0b", fontSize: "11px" }}>Demo Mode</span>
                </div>
              </div>
              <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>From</p>
              <div style={{ background: inputBg, border: "1px solid " + border, borderRadius: "14px", padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#4ade80", fontWeight: "700", flexShrink: 0 }}>ARC</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: text, fontWeight: "700", margin: 0 }}>Arc Testnet</p>
                  <p style={{ color: subText, fontSize: "11px", margin: "2px 0 0" }}>Balance: {usdcFormatted} USDC</p>
                </div>
                <input type="number" placeholder="0.00" value={bridgeAmount} onChange={e => setBridgeAmount(e.target.value)}
                  style={{ width: "90px", background: "none", border: "none", outline: "none", color: text, fontSize: "20px", fontWeight: "800", textAlign: "right" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid " + border, background: bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#4ade80", fontSize: "16px" }}>↓</div>
              </div>
              <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>To</p>
              <div style={{ background: inputBg, border: "1px solid " + border, borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
                <select value={bridgeRoute.to} onChange={e => setBridgeRoute(BRIDGE_ROUTES.find(r => r.to === e.target.value) || BRIDGE_ROUTES[0])}
                  style={{ width: "100%", background: "none", border: "none", outline: "none", color: text, fontSize: "15px", fontWeight: "700", cursor: "pointer" }}>
                  {BRIDGE_ROUTES.map(r => <option key={r.to} value={r.to}>{r.to}</option>)}
                </select>
                <p style={{ color: subText, fontSize: "11px", margin: "6px 0 0" }}>Estimated time: {bridgeRoute.time}</p>
              </div>
              {bridgeAmount && Number(bridgeAmount) > 0 && (
                <div style={{ background: bg, border: "1px solid " + border, borderRadius: "10px", padding: "12px", marginBottom: "16px" }}>
                  {[
                    { label: "You send", value: bridgeAmount + " USDC" },
                    { label: "You receive", value: bridgeAmount + " USDC (on " + bridgeRoute.to + ")" },
                    { label: "Bridge fee", value: "~0.10 USDC" },
                    { label: "Est. time", value: bridgeRoute.time },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: i < 3 ? "8px" : "0", marginBottom: i < 3 ? "8px" : "0", borderBottom: i < 3 ? "1px solid " + border : "none" }}>
                      <span style={{ color: subText, fontSize: "12px" }}>{row.label}</span>
                      <span style={{ color: i === 1 ? "#4ade80" : text, fontSize: "12px", fontWeight: "600" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { if (!bridgeAmount || Number(bridgeAmount) <= 0) return; setBridgeStep("pending"); setTimeout(() => setBridgeStep("success"), 3000); }}
                disabled={!bridgeAmount || Number(bridgeAmount) <= 0}
                style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: !bridgeAmount || Number(bridgeAmount) <= 0 ? "#1f2937" : "#4ade80", color: !bridgeAmount || Number(bridgeAmount) <= 0 ? "#4b5563" : "#111", fontWeight: "700", fontSize: "15px", cursor: !bridgeAmount || Number(bridgeAmount) <= 0 ? "not-allowed" : "pointer" }}>
                {!bridgeAmount ? "Enter amount" : "Bridge to " + bridgeRoute.to}
              </button>
            </div>
          )}
          {bridgeStep === "pending" && (
            <div style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid " + border, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              <p style={{ color: text, fontWeight: "700" }}>Bridging to {bridgeRoute.to}...</p>
              <p style={{ color: subText, fontSize: "12px" }}>Demo mode · Est. {bridgeRoute.time}</p>
            </div>
          )}
          {bridgeStep === "success" && (
            <div style={{ background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✓</div>
              <p style={{ color: text, fontWeight: "700", fontSize: "18px" }}>Bridge Initiated!</p>
              <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>{bridgeAmount} USDC → {bridgeRoute.to}</p>
              <p style={{ color: "#f59e0b", fontSize: "12px", textAlign: "center" }}>🟡 Demo — no real funds were moved</p>
              <button onClick={() => { setBridgeStep("idle"); setBridgeAmount(""); }}
                style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Bridge Again</button>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
