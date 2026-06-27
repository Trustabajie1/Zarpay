"use client";

import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { USDC_AMOY, USDC_DECIMALS } from "@/lib/tokens";
import { usdcAbi } from "@/lib/usdcAbi";
import { useState } from "react";
import { useSendTransaction } from "wagmi";
import { parseEther, isAddress } from "viem";

type Props = {
  onClose: () => void;
};

export function SendModal({ onClose }: Props) {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] =
  useState<"MATIC" | "USDC">("MATIC");
  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");

  const [errorMessage, setErrorMessage] = useState("");
  const [txHash, setTxHash] = useState("");

  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } =
  useWriteContract();

  async function handleSend() {
  if (!toAddress) {
    setErrorMessage("Enter a recipient address.");
    setStatus("error");
    return;
  }

  if (!isAddress(toAddress)) {
    setErrorMessage("Invalid wallet address.");
    setStatus("error");
    return;
  }

  if (!amount || Number(amount) <= 0) {
    setErrorMessage("Enter a valid amount.");
    setStatus("error");
    return;
  }

  try {
    setStatus("pending");

    let hash: string;

    if (selectedToken === "MATIC") {
      hash = await sendTransactionAsync({
        to: toAddress as `0x${string}`,
        value: parseEther(amount),
      });
    } else {
      hash = await writeContractAsync({
        address: USDC_AMOY as `0x${string}`,
        abi: usdcAbi,
        functionName: "transfer",
        args: [
          toAddress as `0x${string}`,
          parseUnits(
            amount,
            USDC_DECIMALS
          ),
        ],
      });
    }

    setTxHash(hash);
    setStatus("success");
  } catch (err: any) {
    const msg = err?.message || "";

    if (
      msg.includes("rejected") ||
      msg.includes("cancelled")
    ) {
      setErrorMessage(
        "You cancelled the transaction."
      );
    } else if (
      msg.includes("insufficient")
    ) {
      setErrorMessage(
        "Insufficient balance."
      );
    } else {
      setErrorMessage(
        "Transaction failed."
      );
    }

    setStatus("error");
    }
}

function handleReset()  {
  setToAddress("");
  setAmount("");
  setStatus("idle");
  setErrorMessage("");
  setTxHash("");
}

return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#0e1318",
          border: "1px solid #1f2937",
          borderRadius: "20px",
          padding: "24px",
          marginBottom: "8px",
          position: "relative",
          zIndex: 101,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* IDLE STATE */}
        {status === "idle" && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  color: "white",
                  fontWeight: "700",
                  fontSize: "18px",
                }}
              >
                Send Payment
              </h2>

              <button
                onClick={onClose}
                style={{
                  color: "#6b7280",
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  color: "#9ca3af",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "monospace",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Recipient Address
              </label>

              <input
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                style={{
                  width: "100%",
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  color: "white",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  color: "#9ca3af",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "monospace",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Amount ({selectedToken})
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: "100%",
                    background: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    color: "white",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    outline: "none",
                    paddingRight: "70px",
                  }}
                />

                <select
  value={selectedToken}
  onChange={(e) =>
    setSelectedToken(
      e.target.value as
        "MATIC" | "USDC"
    )
  }
  style={{
    position: "absolute",
    right: "12px",
    top: "50%",
    transform:
      "translateY(-50%)",
    background: "#111827",
    border: "none",
    color: "#4ade80",
    fontSize: "12px",
    fontFamily: "monospace",
    fontWeight: "700",
    outline: "none",
    cursor: "pointer",
  }}
>
  <option value="MATIC">
    MATIC
  </option>

  <option value="USDC">
    USDC
  </option>
</select>
              </div>

              <p
                style={{
                  color: "#4b5563",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  marginTop: "6px",
                }}
              >
                Testnet transaction — no real funds used
              </p>
            </div>

            <button
              onClick={handleSend}
              style={{
                width: "100%",
                background: "#4ade80",
                color: "#111",
                fontWeight: "700",
                fontSize: "14px",
                borderRadius: "12px",
                padding: "14px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Send Now
            </button>
          </>
        )}

        {/* PENDING STATE */}
        {status === "pending" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "24px 0",
            }}
          >
            <p
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              Waiting for MetaMask...
            </p>

            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Please confirm in MetaMask.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "24px 0",
            }}
          >
            <p style={{ color: "#4ade80", fontSize: "28px" }}>
              ✓
            </p>

            <p
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "22px",
              }}
            >
              Sent!
            </p>

            {txHash && (
              <div
                style={{
                  width: "100%",
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: "12px",
                  padding: "12px",
                }}
              >
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "10px",
                    fontFamily: "monospace",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Transaction Hash
                </p>

                <p
                  style={{
                    color: "#4ade80",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                  }}
                >
                  {txHash}
                </p>

                <a
                  href={`https://amoy.polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#6b7280",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    marginTop: "8px",
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  View on PolygonScan Amoy ↗
                </a>
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                width: "100%",
              }}
            >
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  background: "#4ade80",
                  color: "#111",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Send Another
              </button>

              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "#9ca3af",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "1px solid #374151",
                  cursor: "pointer",
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "24px 0",
            }}
          >
            <p style={{ color: "#f87171", fontSize: "28px" }}>
              ✕
            </p>

            <p
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: "22px",
              }}
            >
              Failed
            </p>

            <p
              style={{
                color: "#f87171",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {errorMessage}
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                width: "100%",
              }}
            >
              <button
                onClick={handleReset}
                style={{
                  flex: 1,
                  background: "#4ade80",
                  color: "#111",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>

              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  background: "transparent",
                  color: "#9ca3af",
                  fontWeight: "700",
                  fontSize: "14px",
                  borderRadius: "12px",
                  padding: "14px",
                  border: "1px solid #374151",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}