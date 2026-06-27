"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

type Props = {
  onClose: () => void;
};

export function ReceiveModal({ onClose }: Props) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(address || "");

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
            Receive Payment
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

        <div
          style={{
            background: "#111827",
            border: "1px solid #374151",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <p
            style={{
              color: "#6b7280",
              fontSize: "11px",
              marginBottom: "8px",
              fontFamily: "monospace",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Your Wallet Address
          </p>

          <p
            style={{
              color: "#4ade80",
              fontSize: "12px",
              fontFamily: "monospace",
              wordBreak: "break-all",
            }}
          >
            {address}
          </p>
        </div>

        <button
          onClick={handleCopy}
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
          Copy Address
        </button>

        {copied && (
          <div
            style={{
              marginTop: "14px",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.3)",
              color: "#4ade80",
              padding: "12px",
              borderRadius: "12px",
              textAlign: "center",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Address Copied ✅
          </div>
        )}
      </div>
    </div>
  );
}