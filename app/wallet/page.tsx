"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { useAppSettings } from "@/components/SettingsContext";
import { translations } from "@/lib/translations";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { settings } = useAppSettings();
  const tr = translations[settings.language] ?? translations.English;
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const cardBg = isDark ? "#0e1318" : "#ffffff";
  const cardBorder = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const textPrimary = isDark ? "white" : "#0a0f14";
  const textMuted = isDark ? "#4b5563" : "#94a3b8";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);

  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);
  const symbol = CURRENCY_SYMBOLS[settings.currency];

  const totalValue = (parseFloat(usdcFormatted) || 0) + ((parseFloat(eurcFormatted) || 0) * 1.08);
  const fiatValue = totalValue.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function handleCopy() {
    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  }

  const qrUrl = address ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${address}&bgcolor=0e1f18&color=4ade80` : "";

  if (!mounted) return null;

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center", transition: "all 0.3s ease" }}>
      <div style={{ width: "100%", maxWidth: "440px", marginBottom: "24px" }}>
        <h1 style={{ color: textPrimary, fontSize: "20px", fontWeight: "700" }}>{tr.wallet}</h1>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: isDark ? "#0e1f18" : "#f0fdf4", border: `1px solid ${isDark ? "#14532d" : "#bbf7d0"}`, borderRadius: "20px", padding: "24px", marginBottom: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <p style={{ color: textMuted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace" }}>{tr.walletBalance}</p>
          <button onClick={() => refetch()} style={{ background: "none", border: "none", color: textMuted, fontSize: "16px", cursor: "pointer" }}>↻</button>
        </div>
        {isLoading ? (
          <div>
            <div style={{ height: "44px", background: "rgba(0,0,0,0.06)", borderRadius: "8px", width: "70%", marginBottom: "10px" }} />
            <div style={{ height: "20px", background: "rgba(0,0,0,0.04)", borderRadius: "8px", width: "45%" }} />
          </div>
        ) : (
          <div>
            <p style={{ color: textPrimary, fontSize: "38px", fontWeight: "800", letterSpacing: "-0.03em" }}>
              {symbol}{fiatValue}
            </p>
            <p style={{ color: textMuted, fontSize: "15px", fontFamily: "monospace", marginTop: "8px" }}>
              Total Portfolio Value
            </p>
          </div>
        )}
        <div style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#d1fae5"}`, marginTop: "20px", paddingTop: "16px", display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: textMuted, fontSize: "12px", fontFamily: "monospace", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            Arc Testnet
          </span>
          <span style={{ color: textMuted, fontSize: "12px", fontFamily: "monospace" }}>Testnet</span>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <p style={{ color: textMuted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "16px" }}>Assets</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#2775CA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: "700" }}>$</div>
            <div>
              <div style={{ color: textPrimary, fontWeight: "700" }}>USDC</div>
              <div style={{ color: textMuted, fontSize: "12px" }}>USD Coin</div>
            </div>
          </div>
          <div style={{ color: textPrimary, fontWeight: "700" }}>{usdcFormatted}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${cardBorder}`, paddingTop: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#003399", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#fff", fontWeight: "700" }}>€</div>
            <div>
              <div style={{ color: textPrimary, fontWeight: "700" }}>EURC</div>
              <div style={{ color: textMuted, fontSize: "12px" }}>Euro Coin</div>
            </div>
          </div>
          <div style={{ color: textPrimary, fontWeight: "700" }}>{eurcFormatted}</div>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "20px", padding: "24px", marginBottom: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <p style={{ color: textMuted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace" }}>{tr.receive} Address</p>
        {address && (
          <div style={{ background: "#0e1f18", border: "1px solid #14532d", borderRadius: "16px", padding: "16px" }}>
            <img src={qrUrl} alt="Wallet QR" width={160} height={160} style={{ borderRadius: "8px", display: "block" }} />
          </div>
        )}
        <div style={{ width: "100%", background: inputBg, border: `1px solid ${cardBorder}`, borderRadius: "12px", padding: "12px 16px" }}>
          <p style={{ color: "#4ade80", fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all", textAlign: "center" }}>{address}</p>
        </div>
        <button onClick={handleCopy} style={{ width: "100%", background: copied ? "#14532d" : "#4ade80", color: copied ? "#4ade80" : "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "14px", border: copied ? "1px solid #4ade80" : "none", cursor: "pointer" }}>
          {copied ? "✓ Copied!" : "Copy Address"}
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: "16px", padding: "16px" }}>
        <p style={{ color: textMuted, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "12px" }}>Network Info</p>
        {[
          { label: "Network", value: "Arc Testnet" },
          { label: "Chain ID", value: "5042002" },
          { label: tr.currency, value: `${settings.currency} (${symbol})` },
          { label: "Language", value: settings.language },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: i < 3 ? `1px solid ${cardBorder}` : "none" }}>
            <span style={{ color: textMuted, fontSize: "13px", fontFamily: "monospace" }}>{item.label}</span>
            <span style={{ color: textPrimary, fontSize: "13px", fontFamily: "monospace" }}>{item.value}</span>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}