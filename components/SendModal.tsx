"use client";
import { useWriteContract } from "wagmi";
import { parseUnits, isAddress } from "viem";
import { ARC_USDC, ARC_EURC, USDC_DECIMALS } from "@/lib/tokens";
import { usdcAbi } from "@/lib/usdcAbi";
import { useState } from "react";

type Props = { onClose: () => void };

export function SendModal({ onClose }: Props) {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC");
  const [status, setStatus] = useState<"idle"|"pending"|"success"|"error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const { writeContractAsync } = useWriteContract();

  async function handleSend() {
    if (!toAddress) { setErrorMessage("Enter a recipient address."); setStatus("error"); return; }
    if (!isAddress(toAddress)) { setErrorMessage("Invalid wallet address."); setStatus("error"); return; }
    if (!amount || Number(amount) <= 0) { setErrorMessage("Enter a valid amount."); setStatus("error"); return; }
    try {
      setStatus("pending");
      const tokenAddress = selectedToken === "USDC" ? ARC_USDC : ARC_EURC;
      const hash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: usdcAbi,
        functionName: "transfer",
        args: [toAddress as `0x${string}`, parseUnits(amount, USDC_DECIMALS)],
      } as any);
      setTxHash(hash);
      setStatus("success");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("rejected") || msg.includes("cancelled")) {
        setErrorMessage("You cancelled the transaction.");
      } else if (msg.includes("insufficient")) {
        setErrorMessage("Insufficient balance.");
      } else {
        setErrorMessage("Transaction failed. Try again.");
      }
      setStatus("error");
    }
  }

  function handleReset() {
    setToAddress(""); setAmount(""); setStatus("idle"); setErrorMessage(""); setTxHash("");
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>
      <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", position: "relative", zIndex: 101 }} onClick={e => e.stopPropagation()}>

        {status === "idle" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>Send</h2>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {(["USDC", "EURC"] as const).map(token => (
                <button key={token} onClick={() => setSelectedToken(token)}
                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid " + (selectedToken === token ? "rgba(74,222,128,0.4)" : "#1f2937"), background: selectedToken === token ? "rgba(74,222,128,0.08)" : "#111827", color: selectedToken === token ? "#4ade80" : "#9ca3af", fontWeight: "600", cursor: "pointer" }}>
                  {token}
                </button>
              ))}
            </div>
            <input type="text" placeholder="Recipient address (0x...)" value={toAddress} onChange={e => setToAddress(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #1f2937", background: "#111827", color: "#fff", marginBottom: "12px", boxSizing: "border-box" }} />
            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #1f2937", background: "#111827", color: "#fff", marginBottom: "16px", boxSizing: "border-box" }} />
            <button onClick={handleSend}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>
              Send {selectedToken}
            </button>
          </>
        )}

        {status === "pending" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "20px 0" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid #1f2937", borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
            <p style={{ color: "#fff", fontWeight: "700" }}>Sending...</p>
          </div>
        )}

        {status === "success" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✓</div>
            <p style={{ color: "#fff", fontWeight: "700", fontSize: "18px" }}>Sent!</p>
            {txHash && <a href={"https://testnet.arcscan.app/tx/" + txHash} target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", textDecoration: "underline" }}>View on ArcScan ↗</a>}
            <button onClick={handleReset} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Send Again</button>
          </div>
        )}

        {status === "error" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>✕</div>
            <p style={{ color: "#fff", fontWeight: "700", fontSize: "18px" }}>Failed</p>
            <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{errorMessage}</p>
            <button onClick={handleReset} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Try Again</button>
          </div>
        )}

      </div>
    </div>
  );
}
