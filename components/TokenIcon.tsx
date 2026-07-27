export function TokenIcon({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const tokens: Record<string, { bg: string; color: string; label: string }> = {
    USDC: { bg: "linear-gradient(135deg, #1a56a4, #2775CA)", color: "#fff", label: "$" },
    EURC: { bg: "linear-gradient(135deg, #002580, #003399)", color: "#fff", label: "€" },
    BTC:  { bg: "linear-gradient(135deg, #c45d00, #F7931A)", color: "#fff", label: "₿" },
    ETH:  { bg: "linear-gradient(135deg, #4254a0, #627EEA)", color: "#fff", label: "Ξ" },
    USDT: { bg: "linear-gradient(135deg, #1a7a55, #26A17B)", color: "#fff", label: "₮" },
  };
  const t = tokens[symbol] || { bg: "linear-gradient(135deg, #1E2640, #2D3A5C)", color: "#7B8DB0", label: symbol.slice(0,1) };
  return (
    <div style={{
      width: size+"px",
      height: size+"px",
      borderRadius: "50%",
      background: t.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.round(size*0.38)+"px",
      fontWeight: "700",
      color: t.color,
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      {t.label}
    </div>
  );
}