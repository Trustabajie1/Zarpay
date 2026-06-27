"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useWalletBalance } from "@/lib/useWalletBalance";
const TOKENS = [
  { symbol: "MATIC", name: "Polygon",        color: "#8247e5", bg: "rgba(130,71,229,0.15)" },
  { symbol: "USDC",  name: "USD Coin",       color: "#2775ca", bg: "rgba(39,117,202,0.15)" },
  { symbol: "USDT",  name: "Tether",         color: "#26a17b", bg: "rgba(38,161,123,0.15)" },
  { symbol: "DAI",   name: "Dai Stablecoin", color: "#f5ac37", bg: "rgba(245,172,55,0.15)" },
];
const MOCK_RATES: Record<string, Record<string, number>> = {
  MATIC: { MATIC: 1, USDC: 0.85, USDT: 0.85, DAI: 0.85 },
  USDC:  { MATIC: 1.176, USDC: 1, USDT: 1.00, DAI: 1.00 },
  USDT:  { MATIC: 1.176, USDC: 1.00, USDT: 1, DAI: 1.00 },
  DAI:   { MATIC: 1.176, USDC: 1.00, USDT: 1.00, DAI: 1 },
};
const SWAP_FEE = 0.003;
export default function ExchangePage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [fromToken, setFromToken] = useState("MATIC");
  const [toToken, setToToken] = useState("USDC");
  const [fromAmount, setFromAmount] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [swapStatus, setSwapStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);
  const { maticFormatted } = useWalletBalance(address);
  const rate = MOCK_RATES[fromToken]?.[toToken] ?? 1;
  const inputNum = parseFloat(fromAmount) || 0;
  const fee = inputNum * SWAP_FEE;
  const toAmount = inputNum > 0 ? ((inputNum - fee) * rate).toFixed(4) : "";
  const feeDisplay = inputNum > 0 ? fee.toFixed(6) : "0";
  function handleFlip() { setFromToken(toToken); setToToken(fromToken); setFromAmount(toAmount); }
  function handleSwap() {
    if (!fromAmount || inputNum <= 0) return;
    setSwapStatus("loading");
    setTimeout(() => { setSwapStatus("success"); setTimeout(() => { setSwapStatus("idle"); setFromAmount(""); }, 2500); }, 2000);
  }
  function TokenPicker({ selected, onSelect, onClose }: { selected: string; onSelect: (s: string) => void; onClose: () => void }) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "16px" }} onClick={onClose}>
        <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", marginBottom: "8px" }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <p style={{ color: "white", fontSize: "16px", fontWeight: "700" }}>Select Token</p>
            <button onClick={onClose} style={{ color: "#6b7280", background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {TOKENS.map(token => (
              <button key={token.symbol} onClick={() => { onSelect(token.symbol); onClose(); }} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", background: selected === token.symbol ? "rgba(74,222,128,0.08)" : "#111827", border: `1px solid ${selected === token.symbol ? "rgba(74,222,128,0.3)" : "#1f2937"}`, borderRadius: "12px", cursor: "pointer", width: "100%" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: token.bg, border: `1px solid ${token.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: token.color, fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{token.symbol.slice(0, 2)}</span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>{token.symbol}</p>
                  <p style={{ color: "#4b5563", fontSize: "12px", fontFamily: "monospace" }}>{token.name}</p>
                </div>
                {selected === token.symbol && <span style={{ marginLeft: "auto", color: "#4ade80", fontSize: "16px" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!mounted) return null;
  const fromTokenData = TOKENS.find(t => t.symbol === fromToken)!;
  const toTokenData = TOKENS.find(t => t.symbol === toToken)!;
  return (
    <main style={{ minHeight: "100vh", background: "#0a0f14", padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {showFromPicker && <TokenPicker selected={fromToken} onSelect={s => { setFromToken(s); if (s === toToken) setToToken(fromToken); }} onClose={() => setShowFromPicker(false)} />}
      {showToPicker && <TokenPicker selected={toToken} onSelect={s => { setToToken(s); if (s === fromToken) setFromToken(toToken); }} onClose={() => setShowToPicker(false)} />}
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "white", fontSize: "20px", fontWeight: "700" }}>Exchange</h1>
        <div style={{ marginLeft: "auto", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
          <span style={{ color: "#4ade80", fontSize: "11px", fontFamily: "monospace" }}>Mock Mode</span>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid #1f2937", borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <div style={{ marginBottom: "8px" }}>
          <p style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>You Pay</p>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowFromPicker(true)} style={{ display: "flex", alignItems: "center", gap: "8px", background: fromTokenData.bg, border: `1px solid ${fromTokenData.color}40`, borderRadius: "10px", padding: "8px 12px", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ color: fromTokenData.color, fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{fromToken.slice(0,2)}</span>
              <span style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>{fromToken}</span>
              <span style={{ color: "#4b5563", fontSize: "10px" }}>▾</span>
            </button>
            <input type="number" placeholder="0.00" value={fromAmount} onChange={e => setFromAmount(e.target.value)} min="0" step="0.001" style={{ flex: 1, background: "none", border: "none", outline: "none", color: "white", fontSize: "22px", fontWeight: "800", fontFamily: "monospace", textAlign: "right", width: "0" }} />
          </div>
          {fromToken === "MATIC" && <p style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace", marginTop: "6px", textAlign: "right" }}>Balance: {maticFormatted} MATIC</p>}
        </div>
        <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
          <button onClick={handleFlip} style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#0a0f14", border: "1px solid #1f2937", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#4ade80", fontSize: "16px" }}>⇅</button>
        </div>
        <div>
          <p style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>You Receive</p>
          <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: "14px", padding: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setShowToPicker(true)} style={{ display: "flex", alignItems: "center", gap: "8px", background: toTokenData.bg, border: `1px solid ${toTokenData.color}40`, borderRadius: "10px", padding: "8px 12px", cursor: "pointer", flexShrink: 0 }}>
              <span style={{ color: toTokenData.color, fontSize: "12px", fontWeight: "700", fontFamily: "monospace" }}>{toToken.slice(0,2)}</span>
              <span style={{ color: "white", fontSize: "14px", fontWeight: "700" }}>{toToken}</span>
              <span style={{ color: "#4b5563", fontSize: "10px" }}>▾</span>
            </button>
            <p style={{ flex: 1, color: toAmount ? "#4ade80" : "#4b5563", fontSize: "22px", fontWeight: "800", fontFamily: "monospace", textAlign: "right" }}>{toAmount || "0.00"}</p>
          </div>
        </div>
      </div>
      {inputNum > 0 && (
        <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid #1f2937", borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
          <p style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Swap Preview</p>
          {[
            { label: "Rate", value: `1 ${fromToken} = ${rate.toFixed(4)} ${toToken}` },
            { label: "Fee (0.3%)", value: `${feeDisplay} ${fromToken}` },
            { label: "You get", value: `${toAmount} ${toToken}` },
            { label: "Provider", value: "Mock (no real swap)" },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: i < 3 ? "1px solid #1f2937" : "none" }}>
              <span style={{ color: "#4b5563", fontSize: "12px", fontFamily: "monospace" }}>{row.label}</span>
              <span style={{ color: i === 2 ? "#4ade80" : "white", fontSize: "12px", fontFamily: "monospace", fontWeight: i === 2 ? "700" : "400" }}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
      {swapStatus === "idle" && (
        <button onClick={handleSwap} disabled={!fromAmount || inputNum <= 0 || fromToken === toToken} style={{ width: "100%", maxWidth: "440px", background: (!fromAmount || inputNum <= 0 || fromToken === toToken) ? "#1f2937" : "#4ade80", color: (!fromAmount || inputNum <= 0 || fromToken === toToken) ? "#4b5563" : "#111", fontWeight: "700", fontSize: "16px", borderRadius: "16px", padding: "18px", border: "none", cursor: (!fromAmount || inputNum <= 0 || fromToken === toToken) ? "not-allowed" : "pointer" }}>
          {fromToken === toToken ? "Select different tokens" : !fromAmount ? "Enter amount" : `Swap ${fromToken} → ${toToken}`}
        </button>
      )}
      {swapStatus === "loading" && (
        <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid #1f2937", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid #1f2937", borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>Processing Swap...</p>
          <p style={{ color: "#4b5563", fontSize: "12px", fontFamily: "monospace" }}>This is a mock transaction</p>
        </div>
      )}
      {swapStatus === "success" && (
        <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "16px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#4ade80", fontSize: "24px" }}>✓</span>
          </div>
          <p style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>Swap Complete!</p>
          <p style={{ color: "#9ca3af", fontSize: "13px", fontFamily: "monospace", textAlign: "center" }}>{fromAmount} {fromToken} → {toAmount} {toToken}</p>
          <p style={{ color: "#4b5563", fontSize: "11px", fontFamily: "monospace" }}>Mock swap — no real funds moved</p>
        </div>
      )}
      <BottomNav />
    </main>
  );
}