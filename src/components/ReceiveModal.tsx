import { useState } from "react";
import { useAccount } from "wagmi";
import { X, Copy, CheckCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface ReceiveModalProps {
  onClose: () => void;
}

export function ReceiveModal({ onClose }: ReceiveModalProps) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!address) return;
    void navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 200,
        display: "flex", alignItems: "flex-end", justifyContent: "center",
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
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Receive Payment</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>

        {/* QR Code */}
        {address ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
              display: "inline-flex",
            }}>
              <QRCodeSVG
                value={address}
                size={200}
                level="M"
                includeMargin={false}
                fgColor="#0a0f1a"
                bgColor="#ffffff"
              />
            </div>
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)", textAlign: "center" }}>
              Scan to send USDC or EURC on Arc Testnet
            </p>
          </div>
        ) : (
          <div style={{ height: 232, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: "var(--zp-text-3)", fontSize: "13px" }}>Connect wallet to show QR</p>
          </div>
        )}

        {/* Address */}
        <div className="zp-card-2" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "11px", color: "var(--zp-text-2)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            Your Wallet Address
          </p>
          <p style={{ fontSize: "12px", color: "var(--zp-green)", fontFamily: "var(--font-mono)", wordBreak: "break-all", lineHeight: 1.6 }}>
            {address ?? "—"}
          </p>
        </div>

        <button
          onClick={handleCopy}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            background: copied ? "rgba(46,204,113,0.15)" : "var(--zp-green)",
            color: copied ? "var(--zp-green)" : "#080C12",
            fontWeight: 700, fontSize: "14px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all 0.2s",
          }}
        >
          {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
          {copied ? "Address Copied!" : "Copy Address"}
        </button>
      </div>
    </div>
  );
}
