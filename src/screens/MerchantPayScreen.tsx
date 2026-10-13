import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSwitchChain } from "wagmi";
import { erc20Abi, parseUnits, isAddress } from "viem";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, ScanLine } from "lucide-react";
import { buildTxExplorerUrl } from "@/onchain-facts";

const ARC_CHAIN_ID = 5042002;
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
const SWAP_POOL = "0xa9E945043a7a844448c6717CC7E546c827b455b1" as const;

const POOL_ABI = [
  { type: "function", name: "payMerchant", stateMutability: "nonpayable", inputs: [{ name: "merchant", type: "address" }, { name: "usdcAmountIn", type: "uint256" }, { name: "minEurcOut", type: "uint256" }], outputs: [{ name: "eurcAmountOut", type: "uint256" }] },
  { type: "function", name: "previewSwapAfterFee", stateMutability: "view", inputs: [{ name: "amountIn", type: "uint256" }, { name: "isUsdcToEurc", type: "bool" }], outputs: [{ name: "netOut", type: "uint256" }, { name: "feeAmount", type: "uint256" }] },
] as const;

type Step = "form" | "approving" | "paying" | "success" | "error";

interface Props {
  onBack: () => void;
  prefillAddress?: string;
  prefillAmount?: string;
}

export function MerchantPayScreen({ onBack, prefillAddress = "", prefillAmount = "" }: Props) {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const [merchantAddr, setMerchantAddr] = useState(prefillAddress);
  const [amount, setAmount] = useState(prefillAmount);
  const [step, setStep] = useState<Step>("form");
  const [msg, setMsg] = useState("");
  const [netOut, setNetOut] = useState("");
  const [netOutRaw, setNetOutRaw] = useState(0n);

  const MAX_APPROVAL = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
  const amountIn = amount && Number(amount) > 0 ? parseUnits(amount, 6) : 0n;
  const addrValid = isAddress(merchantAddr);

  const { refetch: refetchPreview } = useReadContract({
    address: SWAP_POOL, abi: POOL_ABI, functionName: "previewSwapAfterFee",
    args: [amountIn, true], query: { enabled: false },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS, abi: erc20Abi, functionName: "allowance",
    args: address ? [address, SWAP_POOL] : undefined,
    chainId: ARC_CHAIN_ID, query: { enabled: !!address, staleTime: 0 },
  });

  const needsApproval = !allowance || allowance < amountIn;

  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();
  const { writeContract: writePay, data: payHash, error: payError, reset: resetPay } = useWriteContract();
  const { isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: payConfirming, isSuccess: payConfirmed } = useWaitForTransactionReceipt({ hash: payHash });

  // Fetch preview when amount changes
  useEffect(() => {
    if (amountIn > 0n) {
      void refetchPreview().then((res) => {
        const data = res.data as [bigint, bigint] | undefined;
        if (data) {
          setNetOut((Number(data[0]) / 1_000_000).toFixed(4));
          setNetOutRaw(data[0]);
        }
      });
    } else {
      setNetOut("");
      setNetOutRaw(0n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  // After approval confirmed, fire payment
  useEffect(() => {
    if (approveConfirmed && step === "approving") {
      void refetchAllowance().then(() => { runPay(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approveConfirmed]);

  // After payment confirmed
  useEffect(() => {
    if (payConfirmed && step === "paying") {
      setStep("success");
      setMsg(`Paid ${amount} USDC → ${netOut} EURC to merchant`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payConfirmed]);

  // Error handling
  useEffect(() => {
    if (approveError) {
      const m = approveError.message ?? "";
      if (m.toLowerCase().includes("rejected") || m.toLowerCase().includes("denied")) { setStep("form"); }
      else { setStep("error"); setMsg((approveError as { shortMessage?: string }).shortMessage ?? approveError.message ?? "Approval failed."); }
    }
    if (payError) {
      const m = payError.message ?? "";
      if (m.toLowerCase().includes("rejected") || m.toLowerCase().includes("denied")) { setStep("form"); }
      else { setStep("error"); setMsg((payError as { shortMessage?: string }).shortMessage ?? payError.message ?? "Payment failed."); }
    }
  }, [approveError, payError]);

  function runPay() {
    if (!isAddress(merchantAddr)) return;
    setStep("paying");
    const min = netOutRaw - (netOutRaw * 50n) / 10000n;
    writePay({
      address: SWAP_POOL, abi: POOL_ABI, functionName: "payMerchant",
      args: [merchantAddr, amountIn, min],
    });
  }

  function handlePay() {
    if (!addrValid || !amount || Number(amount) <= 0 || netOutRaw === 0n) return;
    if (chainId !== ARC_CHAIN_ID) { switchChain({ chainId: ARC_CHAIN_ID }); return; }
    resetApprove(); resetPay();
    if (needsApproval) {
      setStep("approving");
      writeApprove({ address: USDC_ADDRESS, abi: erc20Abi, functionName: "approve", args: [SWAP_POOL, MAX_APPROVAL], chainId: ARC_CHAIN_ID });
    } else {
      runPay();
    }
  }

  function reset() { setStep("form"); setAmount(""); setMerchantAddr(prefillAddress); setNetOut(""); setNetOutRaw(0n); resetApprove(); resetPay(); }

  const isPending = step === "approving" || step === "paying" || payConfirming;
  const payExplorer = payHash ? buildTxExplorerUrl(ARC_CHAIN_ID, payHash) : undefined;

  return (
    <div className="zp-page">
      <div className="zp-content">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, fontSize: "20px" }}>
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Pay Merchant</h1>
        </div>

        {/* Pending */}
        {isPending && (
          <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 48 }}>
            <Loader2 size={44} color="var(--zp-green)" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ fontWeight: 700, color: "var(--zp-text)", fontSize: "16px" }}>
              {step === "approving" ? "Approving USDC..." : payConfirming ? "Confirming payment..." : "Confirm in wallet..."}
            </p>
            {step === "approving" && <p style={{ color: "var(--zp-text-2)", fontSize: "12px" }}>Step 1 of 2 — one-time approval</p>}
            {step === "paying" && <p style={{ color: "var(--zp-text-2)", fontSize: "12px" }}>Step 2 of 2 — sending payment</p>}
          </div>
        )}

        {/* Success */}
        {!isPending && step === "success" && (
          <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
            <div className="zp-result-icon success"><CheckCircle2 size={28} /></div>
            <p style={{ fontWeight: 700, fontSize: "20px", color: "var(--zp-text)" }}>Payment Sent!</p>
            <p style={{ color: "var(--zp-text-2)", fontSize: "13px", textAlign: "center" }}>{msg}</p>
            <p style={{ color: "var(--zp-text-3)", fontSize: "11px", fontFamily: "var(--font-mono)", wordBreak: "break-all", textAlign: "center" }}>{merchantAddr}</p>
            {payExplorer && (
              <a href={payExplorer} target="_blank" rel="noopener noreferrer" style={{ color: "var(--zp-green)", fontSize: "12px", textDecoration: "none" }}>
                View on explorer ↗
              </a>
            )}
            <button onClick={reset} className="zp-btn-primary" style={{ marginTop: 8, width: "auto", padding: "12px 28px" }}>Pay Again</button>
          </div>
        )}

        {/* Error */}
        {!isPending && step === "error" && (
          <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
            <div className="zp-result-icon error"><AlertCircle size={28} /></div>
            <p style={{ fontWeight: 700, fontSize: "18px", color: "var(--zp-text)" }}>Payment Failed</p>
            <p style={{ color: "var(--zp-red)", fontSize: "13px", textAlign: "center" }}>{msg}</p>
            <button onClick={reset} className="zp-btn-primary" style={{ marginTop: 8, width: "auto", padding: "12px 28px" }}>Try Again</button>
          </div>
        )}

        {/* Form */}
        {!isPending && step === "form" && (
          <>
            {/* Wrong network banner */}
            {chainId !== ARC_CHAIN_ID && (
              <div style={{ background: "rgba(240,165,0,0.1)", border: "1px solid rgba(240,165,0,0.3)", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--zp-amber)" }}>Wrong Network</p>
                  <p style={{ fontSize: "11px", color: "var(--zp-text-2)", marginTop: 2 }}>Switch to Arc Testnet to pay</p>
                </div>
                <button onClick={() => switchChain({ chainId: ARC_CHAIN_ID })} style={{ background: "var(--zp-amber)", color: "#080C12", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                  Switch
                </button>
              </div>
            )}

            <div className="zp-card">
              {/* How it works */}
              <div style={{ background: "rgba(46,204,113,0.05)", border: "1px solid rgba(46,204,113,0.12)", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                <p style={{ fontSize: "12px", color: "var(--zp-text-2)", lineHeight: 1.6 }}>
                  You pay in <span style={{ color: "var(--zp-green)", fontWeight: 700 }}>USDC</span>. The merchant receives <span style={{ color: "#4469CC", fontWeight: 700 }}>EURC</span> automatically via ZarPay Swap — one signature.
                </p>
              </div>

              {/* Merchant address */}
              <p className="zp-label">Merchant Wallet Address</p>
              <div style={{ position: "relative", marginBottom: 4 }}>
                <input
                  type="text"
                  placeholder="0x..."
                  value={merchantAddr}
                  onChange={(e) => setMerchantAddr(e.target.value)}
                  className="zp-input"
                  style={{ paddingRight: 44 }}
                />
                <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--zp-text-3)" }}>
                  <ScanLine size={16} />
                </div>
              </div>
              {merchantAddr && !addrValid && (
                <p style={{ fontSize: "11px", color: "var(--zp-red)", marginBottom: 12 }}>Invalid wallet address</p>
              )}
              {!merchantAddr && <div style={{ marginBottom: 12 }} />}

              {/* Amount */}
              <p className="zp-label" style={{ marginTop: 4 }}>Amount (USDC)</p>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="zp-input"
                style={{ fontSize: "24px", fontWeight: 800, marginBottom: 16 }}
              />

              {/* Preview */}
              {netOut && addrValid && (
                <div style={{ background: "var(--zp-bg)", border: "1px solid var(--zp-border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>You pay</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--zp-text)" }}>{amount} USDC</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>Merchant receives</span>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#4469CC" }}>{netOut} EURC</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: "var(--zp-text-3)" }}>Exchange fee</span>
                    <span style={{ fontSize: "11px", color: "var(--zp-text-3)" }}>0.5%</span>
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={!addrValid || !amount || Number(amount) <= 0 || netOutRaw === 0n}
                className="zp-btn-primary"
                style={{
                  background: (!addrValid || !amount || Number(amount) <= 0 || netOutRaw === 0n) ? "var(--zp-surface-2)" : "var(--zp-green)",
                  color: (!addrValid || !amount || Number(amount) <= 0 || netOutRaw === 0n) ? "var(--zp-text-3)" : "#080C12",
                }}
              >
                {chainId !== ARC_CHAIN_ID ? "Switch to Arc Testnet" : !amount ? "Enter amount" : !addrValid ? "Enter merchant address" : `Pay ${amount} USDC`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
