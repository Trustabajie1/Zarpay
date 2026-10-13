import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { erc20Abi, isAddress } from "viem";
import { X, ArrowUpRight, CheckCircle2, AlertCircle, Loader2, ScanLine } from "lucide-react";
import { getUsdc, buildTxExplorerUrl } from "@/onchain-facts";
import { parseAmount, usdcDecimalsFor } from "@/onchain-money";
import { QRScanner } from "@/components/QRScanner";

const ARC_CHAIN_ID = 5042002;
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;
const EURC_DECIMALS = 6;

type Token = "USDC" | "EURC";

interface SendModalProps {
  onClose: () => void;
  usdcBalance: string;
  eurcBalance: string;
}

export function SendModal({ onClose, usdcBalance, eurcBalance }: SendModalProps) {
  const { chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const [token, setToken] = useState<Token>("USDC");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [inputError, setInputError] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const usdc = getUsdc(ARC_CHAIN_ID);
  const usdcAddress = usdc?.address as `0x${string}` | undefined;
  const usdcDecimals = usdcDecimalsFor(ARC_CHAIN_ID);

  const contractAddress = token === "USDC" ? usdcAddress : EURC_ADDRESS;
  const decimals = token === "USDC" ? usdcDecimals : EURC_DECIMALS;

  const { writeContract, data: hash, isPending, isError, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const isWrongChain = chainId !== ARC_CHAIN_ID;

  function validate(): boolean {
    if (!toAddress) { setInputError("Enter a recipient address."); return false; }
    if (!isAddress(toAddress)) { setInputError("Invalid wallet address."); return false; }
    if (!amount || Number(amount) <= 0) { setInputError("Enter a valid amount."); return false; }
    const bal = token === "USDC" ? parseFloat(usdcBalance) : parseFloat(eurcBalance);
    if (Number(amount) > bal) { setInputError("Insufficient balance."); return false; }
    setInputError("");
    return true;
  }

  function handleSend() {
    if (!validate()) return;
    if (isWrongChain) { switchChain({ chainId: ARC_CHAIN_ID }); return; }
    if (!contractAddress) return;

    let rawAmount: bigint;
    try {
      const parsed = parseAmount(ARC_CHAIN_ID, amount);
      rawAmount = parsed.raw;
    } catch {
      rawAmount = BigInt(Math.round(Number(amount) * 10 ** decimals));
    }

    writeContract({
      address: contractAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [toAddress as `0x${string}`, rawAmount],
      chainId: ARC_CHAIN_ID,
    });
  }

  function handleReset() {
    setToAddress("");
    setAmount("");
    setInputError("");
    reset();
  }

  const explorerUrl = hash ? buildTxExplorerUrl(ARC_CHAIN_ID, hash) : undefined;

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        padding: "0 0 0 0",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: "480px",
          background: "var(--zp-surface)",
          border: "1px solid var(--zp-border)",
          borderRadius: "24px 24px 0 0",
          padding: "24px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Send</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* Success */}
        {isSuccess && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "20px 0" }}>
            <div className="zp-result-icon success"><CheckCircle2 size={28} /></div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--zp-text)" }}>Sent!</p>
            <p style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>{amount} {token} sent successfully</p>
            {explorerUrl && (
              <a href={explorerUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--zp-green)", fontSize: "12px", textDecoration: "none" }}>
                View on explorer <ArrowUpRight size={12} />
              </a>
            )}
            <button onClick={handleReset} className="zp-btn-primary" style={{ marginTop: 8 }}>Send Again</button>
          </div>
        )}

        {/* Error */}
        {isError && !isSuccess && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "20px 0" }}>
            <div className="zp-result-icon error"><AlertCircle size={28} /></div>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--zp-text)" }}>Failed</p>
            <p style={{ fontSize: "13px", color: "var(--zp-red)", textAlign: "center" }}>
              {error?.message?.includes("rejected") || error?.message?.includes("denied")
                ? "You cancelled the transaction."
                : error?.message?.includes("insufficient")
                  ? "Insufficient balance."
                  : ((error as { shortMessage?: string })?.shortMessage ?? error?.message ?? "Transaction failed. Please try again.")}
            </p>
            <button onClick={handleReset} className="zp-btn-primary" style={{ marginTop: 8 }}>Try Again</button>
          </div>
        )}

        {/* Pending */}
        {(isPending || isConfirming) && !isSuccess && !isError && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 0" }}>
            <Loader2 size={40} color="var(--zp-green)" style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ fontWeight: 700, color: "var(--zp-text)" }}>
              {isPending ? "Confirm in wallet..." : "Confirming..."}
            </p>
          </div>
        )}

        {/* Form */}
        {!isPending && !isConfirming && !isSuccess && !isError && (
          <>
            {/* Token toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {(["USDC", "EURC"] as Token[]).map((t) => (
                <button key={t} onClick={() => setToken(t)}
                  style={{
                    flex: 1, padding: "10px", borderRadius: "10px",
                    border: "1px solid " + (token === t ? "rgba(46,204,113,0.5)" : "var(--zp-border)"),
                    background: token === t ? "rgba(46,204,113,0.1)" : "var(--zp-surface-2)",
                    color: token === t ? "var(--zp-green)" : "var(--zp-text-2)",
                    fontWeight: 700, cursor: "pointer", fontSize: "14px",
                  }}>
                  {t}
                </button>
              ))}
            </div>

            <p style={{ fontSize: "11px", color: "var(--zp-text-2)", marginBottom: 12, textAlign: "right" }}>
              Balance: {token === "USDC" ? usdcBalance : eurcBalance} {token}
            </p>

            {showScanner && (
              <QRScanner
                onScan={(addr) => { setToAddress(addr); setShowScanner(false); }}
                onClose={() => setShowScanner(false)}
              />
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                type="text"
                placeholder="Recipient address (0x...)"
                value={toAddress}
                onChange={(e) => { setToAddress(e.target.value); setInputError(""); }}
                className="zp-input"
                style={{ flex: 1, marginBottom: 0 }}
              />
              <button
                onClick={() => setShowScanner(true)}
                title="Scan QR code"
                style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <ScanLine size={18} />
              </button>
            </div>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setInputError(""); }}
              className="zp-input"
              style={{ marginBottom: 8, fontSize: "18px", fontWeight: 700 }}
            />

            {inputError && (
              <p style={{ fontSize: "12px", color: "var(--zp-red)", marginBottom: 12 }}>{inputError}</p>
            )}

            {isWrongChain ? (
              <button onClick={() => switchChain({ chainId: ARC_CHAIN_ID })} className="zp-btn-primary" style={{ marginTop: 8 }}>
                Switch to Arc Testnet
              </button>
            ) : (
              <button onClick={handleSend} className="zp-btn-primary" style={{ marginTop: 8 }}>
                Send {token}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
