"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { DisconnectButton } from "@/components/DisconnectButton";
import { SendModal } from "@/components/SendModal";
import { ReceiveModal } from "@/components/ReceiveModal";
import { BottomNav } from "@/components/BottomNav";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { useAppSettings } from "@/components/SettingsContext";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { useLivePrices } from "@/lib/useLivePrices";
import { t } from "@/lib/translations";
import { useTransactionHistory, shortenHash } from "@/lib/useTransactionHistory";

export default function DashboardPage() {
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const { usdcFormatted, eurcFormatted, isLoading: balanceLoading, refetch: refetchBalance } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const { transactions, isLoading: activityLoading } = useTransactionHistory(address);
  const tr = t(settings.language);
  const symbol = CURRENCY_SYMBOLS[settings.currency];

  const usdcValue = (parseFloat(usdcFormatted) || 0) * (rates[settings.currency] || 1);
  const eurcValue = (parseFloat(eurcFormatted) || 0) * (rates[settings.currency] || 1) * 1.08;
  const totalPortfolioValue = usdcValue + eurcValue;
  const fiatValue = totalPortfolioValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const displayName = settings.displayName?.trim() || tr.goodDay;
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f3f4f6";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e5e7eb";
  const text = isDark ? "#ffffff" : "#111827";
  const subText = isDark ? "#9ca3af" : "#6b7280";

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

      <div style={{ width: "100%", maxWidth: "520px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>{tr.walletBalance}</p>
        {balanceLoading ? (
          <p style={{ color: text }}>{tr.loading}</p>
        ) : (
          <>
            <p style={{ color: text, fontSize: "48px", fontWeight: "800" }}>{symbol}{fiatValue}</p>
            <p style={{ color: subText, fontSize: "14px", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Portfolio Value</p>
            <div style={{ marginTop: "20px", borderTop: `1px solid ${border}`, paddingTop: "16px" }}>
              <div style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>Assets</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#2775CA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: "700" }}>$</div>
                  <span style={{ color: text, fontWeight: 500 }}>USDC</span>
                </div>
                <span style={{ color: text, fontWeight: 700 }}>{usdcFormatted}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#fff", fontWeight: "700" }}>€</div>
                  <span style={{ color: text, fontWeight: 500 }}>EURC</span>
                </div>
                <span style={{ color: text, fontWeight: 700 }}>{eurcFormatted}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div style={{ width: "100%", maxWidth: "520px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "12px", marginBottom: "20px" }}>
        <button onClick={() => setShowSendModal(true)} style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "22px", color: text, cursor: "pointer" }}>
          <div style={{ fontSize: "28px" }}>📤</div>
          <div style={{ marginTop: "8px" }}>{tr.send}</div>
        </button>
        <button onClick={() => setShowReceiveModal(true)} style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "22px", color: text, cursor: "pointer" }}>
          <div style={{ fontSize: "28px" }}>📥</div>
          <div style={{ marginTop: "8px" }}>{tr.receive}</div>
        </button>
        <button style={{ background: card, border: `1px solid ${border}`, borderRadius: "16px", padding: "22px", color: text, cursor: "pointer" }}>
          <div style={{ fontSize: "28px" }}>🔄</div>
          <div style={{ marginTop: "8px" }}>{tr.exchange}</div>
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: "520px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "24px" }}>
        <h3 style={{ color: text, marginBottom: "10px" }}>{tr.recentActivity}</h3>
        {activityLoading ? (
          <p style={{ color: subText, fontSize: "14px" }}>Loading...</p>
        ) : transactions.length === 0 ? (
          <p style={{ color: subText, fontSize: "14px" }}>{tr.noTransactionsYet}</p>
        ) : (
          transactions.slice(0, 3).map((tx, index) => (
            <a key={tx.hash} href={`https://testnet.arcscan.app/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer"
              style={{ display: "block", padding: "12px 0", borderBottom: index === 2 ? "none" : `1px solid ${border}`, textDecoration: "none", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: tx.isError === "0" ? "#22c55e" : "#ef4444", fontSize: "11px", fontWeight: 700, marginBottom: "2px" }}>
                    {tx.isError === "0" ? "✅ Success" : "❌ Failed"}
                  </div>
                  <span style={{ color: tx.type === "sent" ? "#f87171" : "#4ade80", fontWeight: 700 }}>
                    {tx.type === "sent" ? "↗ Sent" : "↙ Received"}
                  </span>
                </div>
                <span style={{ color: text, fontWeight: 600 }}>{tx.value} USDC</span>
              </div>
              <div style={{ color: subText, fontSize: "11px", marginTop: "4px", fontFamily: "monospace" }}>{shortenHash(tx.hash)}</div>
              <div style={{ color: "#60a5fa", fontSize: "11px", marginTop: "4px" }}>View transaction ↗</div>
            </a>
          ))
        )}
        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link href="/activity" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 600, fontSize: "14px" }}>View All Activity →</Link>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}