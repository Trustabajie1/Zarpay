import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi";
import { erc20Abi, parseUnits, formatUnits } from "viem";
import { ArrowLeftRight, RefreshCw, ArrowDown, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { CURRENCY_SYMBOLS } from "@/zarpay-settings";
import { buildTxExplorerUrl } from "@/onchain-facts";

const ARC_CHAIN_ID = 5042002;
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;
const SWAP_POOL = "0xa9E945043a7a844448c6717CC7E546c827b455b1" as const;
const TOKEN_DECIMALS = 6;

const SWAP_POOL_ABI = [
  { type: "function", name: "swapUSDCtoEURC", stateMutability: "nonpayable", inputs: [{ name: "amountIn", type: "uint256" }, { name: "minAmountOut", type: "uint256" }], outputs: [{ name: "amountOut", type: "uint256" }] },
  { type: "function", name: "swapEURCtoUSDC", stateMutability: "nonpayable", inputs: [{ name: "amountIn", type: "uint256" }, { name: "minAmountOut", type: "uint256" }], outputs: [{ name: "amountOut", type: "uint256" }] },
  { type: "function", name: "previewSwapAfterFee", stateMutability: "view", inputs: [{ name: "amountIn", type: "uint256" }, { name: "isUsdcToEurc", type: "bool" }], outputs: [{ name: "netOut", type: "uint256" }, { name: "feeAmount", type: "uint256" }] },
] as const;

const BRIDGE_ROUTES = [
  { to: "Ethereum", time: "~5 min" }, { to: "Base", time: "~3 min" },
  { to: "Arbitrum", time: "~5 min" }, { to: "Optimism", time: "~5 min" },
  { to: "Polygon", time: "~3 min" }, { to: "Avalanche", time: "~3 min" },
];

type Tab = "portfolio" | "swap" | "bridge";
type SwapStep = "idle" | "approving" | "swapping" | "success" | "error";

export function WalletScreen() {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { settings } = useZarpaySettings();
  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const [tab, setTab] = useState<Tab>("portfolio");

  // Swap state
  const [fromToken, setFromToken] = useState<"USDC" | "EURC">("USDC");
  const [swapAmt, setSwapAmt] = useState("");
  const [netOut, setNetOut] = useState("");
  const [feeAmt, setFeeAmt] = useState("");
  const [netOutRaw, setNetOutRaw] = useState(0n);
  const [swapStep, setSwapStep] = useState<SwapStep>("idle");
  const [swapMsg, setSwapMsg] = useState("");

  // Bridge state
  const [bridgeRoute, setBridgeRoute] = useState(BRIDGE_ROUTES[0]);
  const [bridgeAmt, setBridgeAmt] = useState("");
  const [bridgeStep, setBridgeStep] = useState<"idle" | "pending" | "success">("idle");

  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const rate = rates[settings.currency] ?? 1;
  const usdcNum = parseFloat(usdcFormatted) || 0;
  const eurcNum = parseFloat(eurcFormatted) || 0;
  const totalFiat = ((usdcNum * rate) + (eurcNum * rate * 1.08)).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const isUsdcToEurc = fromToken === "USDC";
  const amountIn = swapAmt && Number(swapAmt) > 0 ? parseUnits(swapAmt, TOKEN_DECIMALS) : 0n;
  const fromAddress = fromToken === "USDC" ? USDC_ADDRESS : EURC_ADDRESS;

  const { refetch: refetchPreview } = useReadContract({
    address: SWAP_POOL, abi: SWAP_POOL_ABI, functionName: "previewSwapAfterFee",
    args: [amountIn, isUsdcToEurc], query: { enabled: false },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: fromAddress, abi: erc20Abi, functionName: "allowance",
    args: address ? [address, SWAP_POOL] : undefined,
    chainId: ARC_CHAIN_ID, query: { enabled: !!address, staleTime: 0 },
  });

  // Use max uint256 approval so we never need to re-approve for every swap
  const MAX_APPROVAL = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  const needsApproval = !allowance || allowance < amountIn;

  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();
  const { writeContract: writeSwap, data: swapHash, error: swapError, reset: resetSwap } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: swapConfirming, isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapHash });

  useEffect(() => {
    if (approveConfirmed && swapStep === "approving") {
      // Re-fetch allowance to confirm it updated before swapping
      void refetchAllowance().then(() => {
        runSwap();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    if (swapConfirmed && swapStep === "swapping") {
      setSwapStep("success");
      setSwapMsg(`Swapped ${swapAmt} ${fromToken} → ${netOut} ${fromToken === "USDC" ? "EURC" : "USDC"}`);
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapConfirmed]);

  useEffect(() => {
    if (approveError) {
      const msg = approveError.message ?? "";
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("denied")) {
        setSwapStep("idle");
      } else {
        setSwapStep("error");
        const detail = (approveError as { shortMessage?: string }).shortMessage ?? approveError.message ?? "Approval failed.";
        setSwapMsg(detail);
      }
    }
    if (swapError) {
      const msg = swapError.message ?? "";
      if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("denied")) {
        setSwapStep("idle");
      } else {
        setSwapStep("error");
        const detail = (swapError as { shortMessage?: string }).shortMessage ?? swapError.message ?? "Swap failed.";
        setSwapMsg(detail);
      }
    }
  }, [approveError, swapError]);

  useEffect(() => {
    if (amountIn > 0n) {
      void refetchPreview().then((res) => {
        const data = res.data as [bigint, bigint] | undefined;
        if (data) {
          setNetOut(formatUnits(data[0], TOKEN_DECIMALS));
          setFeeAmt(formatUnits(data[1], TOKEN_DECIMALS));
          setNetOutRaw(data[0]);
        }
      });
    } else { setNetOut(""); setFeeAmt(""); setNetOutRaw(0n); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapAmt, fromToken]);

  function runSwap() {
    setSwapStep("swapping");
    const min = netOutRaw - (netOutRaw * 50n) / 10000n;
    writeSwap({ address: SWAP_POOL, abi: SWAP_POOL_ABI, functionName: isUsdcToEurc ? "swapUSDCtoEURC" : "swapEURCtoUSDC", args: [amountIn, min] });
  }

  function handleSwap() {
    if (!swapAmt || Number(swapAmt) <= 0) return;
    if (chainId !== ARC_CHAIN_ID) { switchChain({ chainId: ARC_CHAIN_ID }); return; }
    resetApprove(); resetSwap(); setSwapMsg("");
    if (needsApproval) { setSwapStep("approving"); writeApprove({ address: fromAddress, abi: erc20Abi, functionName: "approve", args: [SWAP_POOL, MAX_APPROVAL], chainId: ARC_CHAIN_ID }); }
    else { runSwap(); }
  }

  function resetSwapState() { setSwapStep("idle"); setSwapAmt(""); setNetOut(""); setFeeAmt(""); setSwapMsg(""); resetApprove(); resetSwap(); }
  function flipTokens() { setFromToken(t => t === "USDC" ? "EURC" : "USDC"); setSwapAmt(""); setNetOut(""); }

  const isPending = swapStep === "approving" || swapStep === "swapping" || approveConfirming || swapConfirming;
  const swapExplorer = swapHash ? buildTxExplorerUrl(ARC_CHAIN_ID, swapHash) : undefined;
  const toToken = fromToken === "USDC" ? "EURC" : "USDC";

  const ASSETS = [
    { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", live: false, key: null as null | "usdc" | "eurc" },
    { symbol: "ETH", name: "Ethereum", network: "Ethereum", live: false, key: null as null | "usdc" | "eurc" },
    { symbol: "USDC", name: "USD Coin", network: "Arc Testnet", live: true, key: "usdc" as null | "usdc" | "eurc" },
    { symbol: "EURC", name: "Euro Coin", network: "Arc Testnet", live: true, key: "eurc" as null | "usdc" | "eurc" },
    { symbol: "USDC", name: "USD Coin", network: "ETH Sepolia", live: false, key: null as null | "usdc" | "eurc" },
    { symbol: "USDC", name: "USD Coin", network: "Base", live: false, key: null as null | "usdc" | "eurc" },
  ];

  function getBal(key: null | "usdc" | "eurc") {
    if (key === "usdc") return usdcFormatted;
    if (key === "eurc") return eurcFormatted;
    return "0.00";
  }
  function getFiat(key: null | "usdc" | "eurc") {
    if (key === "usdc") return symbol + (usdcNum * rate).toLocaleString("en", { minimumFractionDigits: 2 });
    if (key === "eurc") return symbol + (eurcNum * rate * 1.08).toLocaleString("en", { minimumFractionDigits: 2 });
    return "0.00";
  }

  return (
    <div className="zp-page">
      <div className="zp-content">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--zp-text)" }}>Wallet</h1>
          <button onClick={refetch} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer" }}>
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Total value card */}
        <div style={{ background: "rgba(46,204,113,0.05)", border: "1px solid rgba(46,204,113,0.15)", borderRadius: 20, padding: "20px", textAlign: "center" }}>
          <p style={{ color: "var(--zp-text-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total Portfolio Value</p>
          <p style={{ color: "var(--zp-text)", fontSize: "38px", fontWeight: 800, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
            {symbol}{isLoading ? "..." : totalFiat}
          </p>
          <p style={{ color: "var(--zp-text-2)", fontSize: "12px", marginTop: 6 }}>Arc Testnet · {settings.currency}</p>
        </div>

        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {(["portfolio", "swap", "bridge"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "12px", borderRadius: "12px",
              border: "1px solid " + (tab === t ? "rgba(46,204,113,0.4)" : "var(--zp-border)"),
              background: tab === t ? "rgba(46,204,113,0.08)" : "var(--zp-surface)",
              color: tab === t ? "var(--zp-green)" : "var(--zp-text-2)",
              fontWeight: tab === t ? 700 : 400, cursor: "pointer", fontSize: "13px",
            }}>
              {t === "portfolio" ? "Portfolio" : t === "swap" ? "Swap" : "Bridge"}
            </button>
          ))}
        </div>

        {/* Portfolio */}
        {tab === "portfolio" && (
          <div className="zp-card">
            <p className="zp-label">Assets</p>
            {ASSETS.map((a, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: i < ASSETS.length - 1 ? "1px solid var(--zp-border)" : "none",
                opacity: a.live ? 1 : 0.4,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="zp-token-icon" style={{ background: a.symbol === "USDC" ? "rgba(39,117,202,0.12)" : a.symbol === "EURC" ? "rgba(0,51,153,0.12)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: a.symbol === "USDC" ? "#2775CA" : a.symbol === "EURC" ? "#4469CC" : "var(--zp-text-2)", fontSize: "12px" }}>
                    {a.symbol === "USDC" ? "$" : a.symbol === "EURC" ? "€" : a.symbol.slice(0, 1)}
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--zp-text)" }}>{a.symbol}</p>
                    <p style={{ fontSize: "11px", color: "var(--zp-text-2)" }}>{a.name} · {a.network}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--zp-text)", fontVariantNumeric: "tabular-nums" }}>{isLoading && a.live ? "..." : getBal(a.key)}</p>
                  <p style={{ fontSize: "11px", color: "var(--zp-text-2)" }}>{a.live ? (isLoading ? "..." : getFiat(a.key)) : "Coming soon"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Swap */}
        {tab === "swap" && (
          <div>
            {isPending && (
              <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
                <Loader2 size={40} color="var(--zp-green)" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ fontWeight: 700, color: "var(--zp-text)" }}>
                  {swapStep === "approving" ? (approveConfirming ? "Confirming approval..." : "Approve in wallet...") : (swapConfirming ? "Confirming swap..." : "Confirm in wallet...")}
                </p>
                {swapStep === "approving" && <p style={{ color: "var(--zp-text-2)", fontSize: "12px" }}>Step 1 of 2: Approval</p>}
              </div>
            )}

            {!isPending && swapStep === "success" && (
              <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
                <div className="zp-result-icon success"><CheckCircle2 size={28} /></div>
                <p style={{ fontWeight: 700, fontSize: "18px", color: "var(--zp-text)" }}>Swap Complete!</p>
                <p style={{ color: "var(--zp-text-2)", fontSize: "13px", textAlign: "center" }}>{swapMsg}</p>
                {swapExplorer && <a href={swapExplorer} target="_blank" rel="noopener noreferrer" style={{ color: "var(--zp-green)", fontSize: "12px", textDecoration: "none" }}>View on explorer ↗</a>}
                <button onClick={resetSwapState} className="zp-btn-primary" style={{ marginTop: 8, width: "auto", padding: "12px 24px" }}>Swap Again</button>
              </div>
            )}

            {!isPending && swapStep === "error" && (
              <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
                <div className="zp-result-icon error"><AlertCircle size={28} /></div>
                <p style={{ fontWeight: 700, fontSize: "18px", color: "var(--zp-text)" }}>Swap Failed</p>
                <p style={{ color: "var(--zp-red)", fontSize: "13px", textAlign: "center" }}>{swapMsg}</p>
                <button onClick={resetSwapState} className="zp-btn-primary" style={{ marginTop: 8, width: "auto", padding: "12px 24px" }}>Try Again</button>
              </div>
            )}

            {!isPending && swapStep === "idle" && (
              <div className="zp-card">
                {/* Wrong network banner */}
                {chainId !== ARC_CHAIN_ID && (
                  <div style={{ background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.3)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--zp-amber)" }}>Wrong Network</p>
                      <p style={{ fontSize: "11px", color: "var(--zp-text-2)", marginTop: 2 }}>Switch to Arc Testnet to swap</p>
                    </div>
                    <button onClick={() => switchChain({ chainId: ARC_CHAIN_ID })} style={{ background: "var(--zp-amber)", color: "#080C12", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                      Switch
                    </button>
                  </div>
                )}
                {/* From */}
                <div style={{ marginBottom: 16 }}>
                  <p className="zp-label">From</p>
                  <select value={fromToken} onChange={(e) => { setFromToken(e.target.value as "USDC" | "EURC"); setNetOut(""); }}
                    className="zp-input" style={{ marginBottom: 8 }}>
                    <option value="USDC">USDC</option>
                    <option value="EURC">EURC</option>
                  </select>
                  <p style={{ fontSize: "11px", color: "var(--zp-text-2)", textAlign: "right", marginBottom: 6 }}>
                    Balance: {fromToken === "USDC" ? usdcFormatted : eurcFormatted} {fromToken}
                  </p>
                  <input type="number" placeholder="0.00" value={swapAmt} onChange={(e) => { setSwapAmt(e.target.value); setNetOut(""); }}
                    className="zp-input" style={{ fontSize: "20px", fontWeight: 800 }} />
                </div>

                {/* Flip */}
                <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
                  <button onClick={flipTokens} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--zp-border)", background: "var(--zp-bg)", color: "var(--zp-green)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowDown size={16} />
                  </button>
                </div>

                {/* To */}
                <div style={{ marginBottom: 16 }}>
                  <p className="zp-label">To</p>
                  <div className="zp-card-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "var(--zp-text)" }}>{toToken}</span>
                    {netOut ? (
                      <span style={{ fontWeight: 700, fontSize: "18px", color: "var(--zp-green)", fontVariantNumeric: "tabular-nums" }}>{netOut}</span>
                    ) : (
                      <span style={{ color: "var(--zp-text-3)" }}>—</span>
                    )}
                  </div>
                </div>

                {/* Preview */}
                {netOut && (
                  <div style={{ background: "var(--zp-bg)", border: "1px solid var(--zp-border)", borderRadius: 10, padding: 12, marginBottom: 16 }}>
                    {[
                      { label: "You receive", value: `${netOut} ${toToken}`, highlight: true },
                      { label: "Fee (0.5%)", value: `${feeAmt} ${toToken}`, highlight: false },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < 1 ? 6 : 0 }}>
                        <span style={{ color: "var(--zp-text-2)", fontSize: "12px" }}>{row.label}</span>
                        <span style={{ color: row.highlight ? "var(--zp-green)" : "var(--zp-text-2)", fontSize: "12px", fontWeight: row.highlight ? 700 : 400 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleSwap} className="zp-btn-primary"
                  disabled={!swapAmt || Number(swapAmt) <= 0}
                  style={{ background: !swapAmt || Number(swapAmt) <= 0 ? "var(--zp-surface-2)" : "var(--zp-green)", color: !swapAmt || Number(swapAmt) <= 0 ? "var(--zp-text-3)" : "#080C12" }}>
                  {chainId !== ARC_CHAIN_ID ? "Switch to Arc Testnet" : !swapAmt ? "Enter amount" : `Swap ${fromToken} → ${toToken}`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bridge */}
        {tab === "bridge" && (
          <div>
            {bridgeStep === "idle" && (
              <div className="zp-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, color: "var(--zp-text)" }}>Bridge USDC</p>
                  <span style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 8, padding: "3px 8px", color: "var(--zp-amber)", fontSize: "11px" }}>Demo Mode</span>
                </div>

                <p className="zp-label">From: Arc Testnet</p>
                <div className="zp-card-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "var(--zp-text)" }}>Arc Testnet</p>
                    <p style={{ fontSize: "11px", color: "var(--zp-text-2)", marginTop: 2 }}>Balance: {usdcFormatted} USDC</p>
                  </div>
                  <input type="number" placeholder="0.00" value={bridgeAmt} onChange={(e) => setBridgeAmt(e.target.value)}
                    style={{ width: 90, background: "none", border: "none", outline: "none", color: "var(--zp-text)", fontSize: "20px", fontWeight: 800, textAlign: "right" }} />
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--zp-border)", background: "var(--zp-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--zp-green)" }}>
                    <ArrowDown size={14} />
                  </div>
                </div>

                <p className="zp-label">To</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {BRIDGE_ROUTES.map((r) => (
                    <button key={r.to} onClick={() => setBridgeRoute(r)} style={{
                      padding: "10px 6px", borderRadius: 10,
                      border: "1px solid " + (bridgeRoute.to === r.to ? "rgba(46,204,113,0.4)" : "var(--zp-border)"),
                      background: bridgeRoute.to === r.to ? "rgba(46,204,113,0.08)" : "var(--zp-surface-2)",
                      color: bridgeRoute.to === r.to ? "var(--zp-green)" : "var(--zp-text)",
                      cursor: "pointer", fontSize: "11px", fontWeight: bridgeRoute.to === r.to ? 700 : 400, textAlign: "center",
                    }}>{r.to}</button>
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: "var(--zp-text-2)", textAlign: "center", marginBottom: 16 }}>Est. time: {bridgeRoute.time}</p>

                <button onClick={() => { if (!bridgeAmt || Number(bridgeAmt) <= 0) return; setBridgeStep("pending"); setTimeout(() => setBridgeStep("success"), 3000); }}
                  disabled={!bridgeAmt || Number(bridgeAmt) <= 0}
                  className="zp-btn-primary"
                  style={{ background: !bridgeAmt || Number(bridgeAmt) <= 0 ? "var(--zp-surface-2)" : "var(--zp-green)", color: !bridgeAmt || Number(bridgeAmt) <= 0 ? "var(--zp-text-3)" : "#080C12" }}>
                  {!bridgeAmt ? "Enter amount" : `Bridge to ${bridgeRoute.to}`}
                </button>
              </div>
            )}

            {bridgeStep === "pending" && (
              <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
                <Loader2 size={40} color="var(--zp-green)" style={{ animation: "spin 1s linear infinite" }} />
                <p style={{ fontWeight: 700, color: "var(--zp-text)" }}>Bridging to {bridgeRoute.to}...</p>
                <p style={{ color: "var(--zp-text-2)", fontSize: "12px" }}>Demo mode · {bridgeRoute.time}</p>
              </div>
            )}

            {bridgeStep === "success" && (
              <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
                <div className="zp-result-icon success"><CheckCircle2 size={28} /></div>
                <p style={{ fontWeight: 700, fontSize: "18px", color: "var(--zp-text)" }}>Bridge Initiated!</p>
                <p style={{ color: "var(--zp-text-2)", fontSize: "13px" }}>{bridgeAmt} USDC → {bridgeRoute.to}</p>
                <p style={{ color: "var(--zp-amber)", fontSize: "12px", textAlign: "center" }}>Demo mode — no real funds were moved</p>
                <button onClick={() => { setBridgeStep("idle"); setBridgeAmt(""); }} className="zp-btn-primary" style={{ marginTop: 8, width: "auto", padding: "12px 24px" }}>Bridge Again</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
