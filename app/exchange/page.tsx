"use client";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";

const SERVICES = [
  { label: "Deposit", sub: "Buy crypto with NGN", icon: "📥", path: "/exchange/deposit" },
  { label: "Withdraw", sub: "Cash out to bank", icon: "🏦", path: "/exchange/withdraw" },
  { label: "Utility Bills", sub: "Pay bills and services", icon: "⚡", path: "/exchange/utility" },
  { label: "Bank Accounts", sub: "Manage your banks", icon: "🏛", path: "/exchange/banks" },
];

export default function ExchangePage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", marginBottom: "28px" }}>
        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>Financial Services</h1>
        <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>Deposits, withdrawals, bills and more</p>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
        {SERVICES.map((s) => (
          <button key={s.path} onClick={() => router.push(s.path)}
            style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: text, fontWeight: "700", fontSize: "15px", margin: 0 }}>{s.label}</p>
              <p style={{ color: subText, fontSize: "11px", margin: "4px 0 0" }}>{s.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "16px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "16px" }}>🔒</span>
        <p style={{ color: subText, fontSize: "12px", margin: 0 }}>All transactions are self-custodial. ZarPay never holds your funds.</p>
      </div>

      <BottomNav />
    </main>
  );
}
