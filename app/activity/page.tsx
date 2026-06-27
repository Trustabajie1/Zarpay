"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useAppSettings } from "@/components/SettingsContext";
import { translations } from "@/lib/translations";
import { useTransactionHistory, formatTxDate, shortenHash } from "@/lib/useTransactionHistory";
export default function ActivityPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { settings } = useAppSettings();
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);
  const { transactions, isLoading, isError, refetch } = useTransactionHistory(address);
  const tr = translations[settings.language] ?? translations.English;
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const cardBg = isDark ? "#0e1318" : "#ffffff";
  const cardBorder = isDark ? "#1f2937" : "#e2e8f0";
  const txBg = isDark ? "#111827" : "#f8fafc";
  const textPrimary = isDark ? "white" : "#0a0f14";
  const textMuted = isDark ? "#4b5563" : "#94a3b8";
  if (!mounted) return null;
  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center", transition: "background 0.3s" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: textPrimary, fontSize: "20px", fontWeight: "700" }}>{tr.recentActivity}</h1>
        <button onClick={() => refetch()} style={{ background: "none", border: "none", color: textMuted, fontSize: "18px", cursor: "pointer" }}>↻</button>
      </div>
      <div style={{ width: "100%", maxWidth: "440px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "20px", padding: "20px" }}>
        {isLoading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ height: "68px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px", border: `1px solid ${cardBorder}` }} />
            ))}
          </div>
        )}
        {isError && !isLoading && (
          <div style={{ padding: "48px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#f87171", fontSize: "32px" }}>✕</span>
            <p style={{ color: "#f87171", fontSize: "14px", fontFamily: "monospace" }}>Failed to load transactions</p>
            <button onClick={() => refetch()} style={{ color: "#4ade80", fontSize: "13px", fontFamily: "monospace", background: "none", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer" }}>{tr.cancel}</button>
          </div>
        )}
        {!isLoading && !isError && transactions.length === 0 && (
          <div style={{ padding: "56px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <span style={{ color: textMuted, fontSize: "48px" }}>◎</span>
            <p style={{ color: textMuted, fontSize: "15px", fontWeight: "600" }}>No transactions yet</p>
            <p style={{ color: textMuted, fontSize: "12px", fontFamily: "monospace", textAlign: "center" }}>Send or receive MATIC to see your activity here</p>
          </div>
        )}
        {!isLoading && !isError && transactions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {transactions.map((tx) => (
              <a key={tx.hash} href={`https://amoy.polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                <div style={{ background: txBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: tx.type === "sent" ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)", border: `1px solid ${tx.type === "sent" ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: tx.type === "sent" ? "#f87171" : "#4ade80", fontSize: "18px" }}>{tx.type === "sent" ? "↑" : "↓"}</span>
                    </div>
                    <div>
                      <p style={{ color: textPrimary, fontSize: "14px", fontWeight: "600", marginBottom: "3px" }}>{tx.type === "sent" ? tr.send : tr.receive}</p>
                      <p style={{ color: textMuted, fontSize: "11px", fontFamily: "monospace" }}>{shortenHash(tx.hash)}</p>
                      <p style={{ color: textMuted, fontSize: "10px", fontFamily: "monospace", marginTop: "2px" }}>{formatTxDate(tx.timeStamp)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: tx.type === "sent" ? "#f87171" : "#4ade80", fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>{tx.type === "sent" ? "-" : "+"}{tx.value} MATIC</p>
                    <span style={{ fontSize: "10px", fontFamily: "monospace", padding: "3px 8px", borderRadius: "4px", background: tx.isError === "0" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)", color: tx.isError === "0" ? "#4ade80" : "#f87171" }}>{tx.isError === "0" ? "Success" : "Failed"}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}