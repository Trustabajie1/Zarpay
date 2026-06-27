"use client";

import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { BottomNav } from "@/components/BottomNav";
import { useAppSettings } from "@/components/SettingsContext";
import { USDC_ADDRESS, EURC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";

type TokenSymbol = "USDC" | "EURC";
const TOKEN_ADDRESSES: Record<TokenSymbol, `0x${string}`> = { USDC: USDC_ADDRESS, EURC: EURC_ADDRESS };

export default function SwapPage() {
  const { settings } = useAppSettings();
  const { address, isConnected } = useAccount();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0b0f14" : "#f8fafc";
  const cardBg = isDark ? "#111827" : "#ffffff";
  const text = isDark ? "#ffffff" : "#111827";
  const border = isDark ? "#1f2937" : "#d1d5db";
  const subText = isDark ? "#9ca3af" : "#6b7280";

  const [fromToken, setFromToken] = useState<TokenSymbol>("USDC");
  const [toToken, setToToken] = useState<TokenSymbol>("EURC");
  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<string>("--");
  const [quoteError, setQuoteError] = useState("");
  const [step, setStep] = useState<"idle"|"approving"|"swapping"|"success"|"error">("idle");
  const [swapMessage, setSwapMessage] = useState("");
  const [netOut, setNetOut] = useState<string>("");
  const [feeAmount, setFeeAmount] = useState<string>("");

  const isUsdcToEurc = fromToken === "USDC";
  const amountIn = amount && Number(amount) > 0 ? parseUnits(amount, TOKEN_DECIMALS) : BigInt(0);

  // Balance of the FROM token for the connected wallet
  const { data: fromTokenBalance, refetch: refetchFromBalance } = useReadContract({
    address: TOKEN_ADDRESSES[fromToken],
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const fromBalanceFormatted = fromTokenBalance !== undefined
    ? Number(formatUnits(fromTokenBalance as bigint, TOKEN_DECIMALS)).toFixed(2)
    : "0.00";

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
    if (approveConfirmed && step === "approving") { refetchAllowance(); runSwap(); }
  }, [approveConfirmed]);

  useEffect(() => {
    if (swapConfirmed && step === "swapping") {
      setStep("success");
      setSwapMessage(`Swapped ${amount} ${fromToken} → ${netOut} ${toToken} (fee: ${feeAmount} ${toToken})`);
      refetchFromBalance();
    }
  }, [swapConfirmed]);

  useEffect(() => {
    if (approveError) { setStep("error"); setSwapMessage(approveError.message || "Approval failed."); }
    if (swapError) { setStep("error"); setSwapMessage(swapError.message || "Swap failed."); }
  }, [approveError, swapError]);

  function switchTokens() {
    setFromToken(toToken);
    setToToken(fromToken);
    setQuote("--");
    setNetOut("");
    setFeeAmount("");
  }

  function getQuote() {
    if (!amount || Number(amount) <= 0) { setQuoteError("Enter an amount"); return; }
    setQuoteError("");
    refetchPreview().then((res) => {
      const data = res.data as [bigint, bigint] | undefined;
      if (data) {
        const net = formatUnits(data[0], TOKEN_DECIMALS);
        const fee = formatUnits(data[1], TOKEN_DECIMALS);
        setNetOut(net); setFeeAmount(fee); setQuote(`~${net} ${toToken}`);
      } else { setQuoteError("Couldn't fetch a quote. Try again."); }
    });
  }

  function runSwap() {
    setStep("swapping");
    setSwapMessage("Waiting for wallet confirmation...");
    writeSwap({
      address: ZARPAY_SWAP_POOL_ADDRESS,
      abi: ZARPAY_SWAP_POOL_ABI,
      functionName: isUsdcToEurc ? "swapUSDCtoEURC" : "swapEURCtoUSDC",
      args: [amountIn],
    });
  }

  function handleConvert() {
    if (!isConnected || !address) { setStep("error"); setSwapMessage("Connect your wallet first."); return; }
    if (fromToken === toToken) { setStep("error"); setSwapMessage("Select two different tokens."); return; }
    if (!amount || Number(amount) <= 0) { setStep("error"); setSwapMessage("Enter a valid amount."); return; }
    resetApprove(); resetSwap();
    if (needsApproval) {
      setStep("approving");
      setSwapMessage("Approving ZarPay to access this amount...");
      writeApprove({ address: TOKEN_ADDRESSES[fromToken], abi: ERC20_ABI, functionName: "approve", args: [ZARPAY_SWAP_POOL_ADDRESS, amountIn] });
    } else { runSwap(); }
  }

  function handleReset() {
    setStep("idle"); setSwapMessage(""); setAmount(""); setQuote("--"); setNetOut(""); setFeeAmount(""); resetApprove(); resetSwap();
  }

  function handleMaxAmount() {
    setAmount(fromBalanceFormatted);
    setQuote("--");
  }

  const isPending = step === "approving" || step === "swapping" || approveConfirming || swapConfirming;
  const pendingLabel = step === "approving"
    ? (approveConfirming ? "Confirming approval on-chain..." : "Waiting for wallet confirmation...")
    : (swapConfirming ? "Confirming swap on-chain..." : swapMessage);

  return (
    <main style={{ minHeight: "100vh", background: bg, color: text, padding: "20px", paddingBottom: "110px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px" }}>Convert Assets</h1>

        {step === "idle" && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "20px", padding: "20px" }}>

            {/* FROM */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <p style={{ fontSize: "12px", opacity: 0.7, margin: 0 }}>From</p>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <p style={{ fontSize: "12px", color: subText, margin: 0 }}>
                    Balance: <span style={{ color: text, fontWeight: 600 }}>{fromBalanceFormatted} {fromToken}</span>
                  </p>
                  <button
                    onClick={handleMaxAmount}
                    style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "6px", border: `1px solid ${border}`, background: "transparent", color: "#4ade80", cursor: "pointer", fontWeight: 700 }}
                  >
                    MAX
                  </button>
                </div>
              </div>
              <select
                value={fromToken}
                onChange={(e) => { setFromToken(e.target.value as TokenSymbol); setQuote("--"); }}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `1px solid ${border}`, background: cardBg, color: text, marginBottom: "12px" }}
              >
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setQuote("--"); }}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `1px solid ${border}`, background: cardBg, color: text }}
              />
            </div>

            {/* SWITCH */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <button onClick={switchTokens} style={{ width: "48px", height: "48px", borderRadius: "50%", border: `1px solid ${border}`, background: cardBg, color: text, cursor: "pointer", fontSize: "18px" }}>⇅</button>
            </div>

            {/* TO */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "8px" }}>To</p>
              <select
                value={toToken}
                onChange={(e) => { setToToken(e.target.value as TokenSymbol); setQuote("--"); }}
                style={{ width: "100%", padding: "14px", borderRadius: "12px", border: `1px solid ${border}`, background: cardBg, color: text }}
              >
                <option value="USDC">USDC</option>
                <option value="EURC">EURC</option>
              </select>
            </div>

            {/* QUOTE */}
            <div style={{ border: `1px solid ${border}`, borderRadius: "12px", padding: "14px", marginBottom: "8px" }}>
              <p style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>Estimated Receive</p>
              <p style={{ fontWeight: "700", fontSize: "18px" }}>{quote}</p>
              {feeAmount && <p style={{ fontSize: "11px", opacity: 0.5, marginTop: "4px" }}>Includes 0.5% ZarPay fee: {feeAmount} {toToken}</p>}
            </div>

            {quoteError && <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>{quoteError}</p>}

            <button onClick={getQuote} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "#4ade80", color: "#000", fontWeight: "700", cursor: "pointer", marginBottom: "12px", marginTop: "12px" }}>
              Get Quote
            </button>
            <button onClick={handleConvert} disabled={quote === "--"} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: quote === "--" ? "#374151" : "#4ade80", color: quote === "--" ? "#9ca3af" : "#000", fontWeight: "700", cursor: quote === "--" ? "not-allowed" : "pointer" }}>
              Convert
            </button>
          </div>
        )}

        {isPending && (
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: `4px solid ${border}`, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontWeight: "700", fontSize: "16px", textAlign: "center" }}>{pendingLabel}</p>
            {step === "approving" && <p style={{ fontSize: "12px", opacity: 0.6, textAlign: "center" }}>Step 1 of 2 — you'll get a second wallet prompt for the swap itself.</p>}
          </div>
        )}

        {step === "success" && (
          <div style={{ background: cardBg, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#4ade80", fontSize: "24px" }}>✓</span>
            </div>
            <p style={{ fontWeight: "700", fontSize: "18px" }}>Swap Complete!</p>
            <p style={{ fontSize: "13px", textAlign: "center", opacity: 0.8 }}>{swapMessage}</p>
            {swapHash && (
              <a href={`https://testnet.arcscan.app/tx/${swapHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", wordBreak: "break-all", textDecoration: "underline" }}>
                View on ArcScan ↗
              </a>
            )}
            <button onClick={handleReset} style={{ background: "#4ade80", color: "#000", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Swap Again</button>
          </div>
        )}

        {step === "error" && (
          <div style={{ background: cardBg, border: "1px solid rgba(248,113,113,0.3)", borderRadius: "20px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#f87171", fontSize: "24px" }}>✕</span>
            </div>
            <p style={{ fontWeight: "700", fontSize: "18px" }}>Swap Failed</p>
            <p style={{ fontSize: "13px", textAlign: "center", color: "#f87171" }}>{swapMessage}</p>
            <button onClick={handleReset} style={{ background: "#4ade80", color: "#000", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Try Again</button>
          </div>
        )}

      </div>
      <BottomNav />
    </main>
  );
}