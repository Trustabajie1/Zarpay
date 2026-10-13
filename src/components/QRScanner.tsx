import { useEffect, useRef, useState } from "react";
import { X, Camera, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScan: (address: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const containerId = "zarpay-qr-reader";

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!mounted) return;
            // Accept raw address or ethereum: URI
            const raw = decodedText.trim();
            const addr = raw.startsWith("ethereum:") ? raw.split(":")[1].split("@")[0] : raw;
            if (/^0x[0-9a-fA-F]{40}$/.test(addr)) {
              void scanner.stop().catch(() => {});
              onScan(addr);
            } else {
              setError("QR code is not a valid wallet address. Try again.");
            }
          },
          undefined
        );
        if (mounted) setStarted(true);
      } catch {
        if (mounted) setError("Camera access denied or not available. Please allow camera permissions and try again.");
      }
    }

    void startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 440, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Scan QR Code</p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Point camera at a wallet QR code</p>
        </div>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} />
        </button>
      </div>

      {/* Scanner container */}
      <div style={{ width: "100%", maxWidth: 360, position: "relative" }}>
        <div
          id={containerId}
          style={{ width: "100%", borderRadius: 20, overflow: "hidden", background: "#000" }}
        />

        {/* Overlay corners */}
        {started && !error && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {/* Top-left */}
            <div style={{ position: "absolute", top: 40, left: 40, width: 40, height: 40, borderTop: "3px solid #2ECC71", borderLeft: "3px solid #2ECC71", borderRadius: "4px 0 0 0" }} />
            {/* Top-right */}
            <div style={{ position: "absolute", top: 40, right: 40, width: 40, height: 40, borderTop: "3px solid #2ECC71", borderRight: "3px solid #2ECC71", borderRadius: "0 4px 0 0" }} />
            {/* Bottom-left */}
            <div style={{ position: "absolute", bottom: 40, left: 40, width: 40, height: 40, borderBottom: "3px solid #2ECC71", borderLeft: "3px solid #2ECC71", borderRadius: "0 0 0 4px" }} />
            {/* Bottom-right */}
            <div style={{ position: "absolute", bottom: 40, right: 40, width: 40, height: 40, borderBottom: "3px solid #2ECC71", borderRight: "3px solid #2ECC71", borderRadius: "0 0 4px 0" }} />
          </div>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div style={{ width: "100%", maxWidth: 360, marginTop: 20, background: "rgba(231,76,60,0.1)", border: "1px solid rgba(231,76,60,0.3)", borderRadius: 14, padding: "14px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertCircle size={18} color="#E74C3C" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13, color: "#E74C3C", fontWeight: 600, marginBottom: 4 }}>Camera Error</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{error}</p>
            <button onClick={onClose} style={{ marginTop: 12, padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(231,76,60,0.3)", background: "rgba(231,76,60,0.1)", color: "#E74C3C", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {!started && !error && (
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <Camera size={20} color="rgba(255,255,255,0.4)" />
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Starting camera...</p>
        </div>
      )}

      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 20, textAlign: "center", maxWidth: 280 }}>
        Align the QR code within the frame. Supports MetaMask and ZarPay QR codes.
      </p>
    </div>
  );
}
