"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { DisconnectButton } from "@/components/DisconnectButton";
import { SendModal } from "@/components/SendModal";
import { ReceiveModal } from "@/components/ReceiveModal";
import { BottomNav } from "@/components/BottomNav";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { useAppSettings } from "@/components/SettingsContext";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { useLivePrices } from "@/lib/useLivePrices";
import { t } from "@/lib/translations";

const ALL_TOKENS = [
  { symbol: "USDC", name: "USD Coin", network: "Arc Testnet", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: true, key: "usdc" },
  { symbol: "EURC", name: "Euro Coin", network: "Arc Testnet", icon: "€", color: "#003399", bg: "rgba(0,51,153,0.1)", bdr: "rgba(0,51,153,0.3)", live: true, key: "eurc" },
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", icon: "₿", color: "#F7931A", bg: "rgba(247,147,26,0.1)", bdr: "rgba(247,147,26,0.3)", live: false, key: null },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", icon: "Ξ", color: "#627EEA", bg: "rgba(98,126,234,0.1)", bdr: "rgba(98,126,234,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "ETH Sepolia", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Base", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Arbitrum", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Optimism", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
  { symbol: "USDC", name: "USD Coin", network: "Avalanche", icon: "$", color: "#2775CA", bg: "rgba(39,117,202,0.1)", bdr: "rgba(39,117,202,0.3)", live: false, key: null },
];


export default function DashboardPage() {
  const { address } = useAccount();
  const router = useRouter();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { usdcFormatted, eurcFormatted, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const tr = t(settings.language);
  const symbol = CURRENCY_SYMBOLS[settings.currency];

  const usdcValue = (parseFloat(usdcFormatted) || 0) * (rates[settings.currency] || 1);
  const eurcValue = (parseFloat(eurcFormatted) || 0) * (rates[settings.currency] || 1) * 1.08;
  const totalPortfolioValue = usdcValue + eurcValue;
  const fiatValue = totalPortfolioValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const displayName = settings.displayName && settings.displayName.trim() ? settings.displayName.trim() : tr.goodDay;
  const shortAddress = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";

  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f3f4f6";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e5e7eb";
  const text = isDark ? "#ffffff" : "#111827";
  const subText = isDark ? "#9ca3af" : "#6b7280";

  function getBalance(token: typeof ALL_TOKENS[0]) {
    if (!token.live) return "0.00";
    if (token.key === "usdc") return usdcFormatted;
    if (token.key === "eurc") return eurcFormatted;
    return "0.00";
  }

  function getFiat(token: typeof ALL_TOKENS[0]) {
    if (!token.live) return "0.00";
    if (token.key === "usdc") return usdcValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (token.key === "eurc") return eurcValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return "0.00";
  }

  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {showSendModal && <SendModal onClose={() => { setShowSendModal(false); refetchBalance(); }} />}
      {showReceiveModal && <ReceiveModal onClose={() => setShowReceiveModal(false)} />}

      <div style={{ width: "100%", maxWidth: "520px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>ZarPay</h1>
        <DisconnectButton />
      </div>

      <div style={{ width: "100%", maxWidth: "520px", marginBottom: "20px" }}>
        <p style={{ color: text, fontSize: "18px", fontWeight: "700" }}>{displayName} 👋</p>
        <p style={{ color: "#4ade80", fontFamily: "monospace", marginTop: "6px", fontSize: "13px" }}>{shortAddress}</p>
      </div>

      <div style={{ width: "100%", maxWidth: "520px", background: card, border: "1px solid " + border, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>{tr.walletBalance}</p>
        {balanceLoading ? (
          <p style={{ color: text }}>{tr.loading}</p>
        ) : (
          <>
            <p style={{ color: text, fontSize: "48px", fontWeight: "800" }}>{symbol}{fiatValue}</p>
            <p style={{ color: subText, fontSize: "14px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Portfolio Value</p>
          </>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: "520px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setShowSendModal(true)} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "22px" }}>📤</div>
          <div style={{ fontSize: "11px", fontWeight: "600" }}>{tr.send}</div>
        </button>
        <button onClick={() => setShowReceiveModal(true)} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "22px" }}>📥</div>
          <div style={{ fontSize: "11px", fontWeight: "600" }}>{tr.receive}</div>
        </button>
        <button onClick={() => router.push("/activity")} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "22px" }}>◷</div>
          <div style={{ fontSize: "11px", fontWeight: "600" }}>History</div>
        </button>
        <button onClick={() => router.push("/exchange")} style={{ background: card, border: "1px solid " + border, borderRadius: "16px", padding: "18px 8px", color: text, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ fontSize: "22px", color: "#4ade80" }}>$</div>
          <div style={{ fontSize: "11px", fontWeight: "600" }}>Services</div>
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: "520px", background: card, border: "1px solid " + border, borderRadius: "20px", padding: "20px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Assets</p>
        {ALL_TOKENS.map((token, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", marginBottom: i < ALL_TOKENS.length - 1 ? "14px" : "0", borderBottom: i < ALL_TOKENS.length - 1 ? "1px solid " + border : "none", opacity: token.live ? 1 : 0.45 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: token.bg, border: "1px solid " + token.bdr, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: token.color, fontWeight: "700", flexShrink: 0 }}>{token.icon}</div>
              <div>
                <p style={{ color: text, fontWeight: "600", margin: 0, fontSize: "14px" }}>{token.symbol}</p>
                <p style={{ color: subText, margin: 0, fontSize: "11px" }}>{token.name} · {token.network}</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: text, fontWeight: "700", margin: 0, fontSize: "14px" }}>{balanceLoading && token.live ? "..." : getBalance(token)}</p>
              <p style={{ color: subText, fontSize: "11px", margin: 0 }}>{token.live ? symbol + (balanceLoading ? "..." : getFiat(token)) : "Coming soon"}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}
