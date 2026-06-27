"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { DisconnectButton } from "@/components/DisconnectButton";
import { useAppSettings } from "@/components/SettingsContext";
import { Currency, Language, DEFAULT_SETTINGS, clearSettings, FALLBACK_RATES, CURRENCY_SYMBOLS, getLiveRates } from "@/lib/useSettings";
import { t } from "@/lib/translations";
export default function SettingsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { settings, updateSetting } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [liveRates, setLiveRates] = useState(FALLBACK_RATES);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);
  useEffect(() => { if (mounted) { getLiveRates().then(rates => setLiveRates(rates)); } }, [mounted]);
  function update<K extends keyof typeof settings>(key: K, value: typeof settings[K]) {
    updateSetting(key, value);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }
  function handleReset() {
    clearSettings();
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      updateSetting(key as any, DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS]);
    });
    setShowClearConfirm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const currencies: Currency[] = ["NGN", "USD", "GBP", "EUR"];
  const languages: Language[] = ["English", "French", "Spanish", "Arabic", "Portuguese", "Chinese", "German", "Japanese"];
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f3f4f6";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#d1d5db";
  const textColor = isDark ? "white" : "#111827";
  const subText = isDark ? "#6b7280" : "#4b5563";

  // Get translations for current language
const tr = t(settings.language);

  if (!mounted) return null;
  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center", transition: "all 0.3s ease" }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: textColor, fontSize: "20px", fontWeight: "700" }}>{tr.settings}</h1>
        {saved && (
          <span style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", padding: "4px 10px", borderRadius: "8px" }}>✓ {tr.saved}</span>
        )}
      </div>

      {/* Profile */}
      <div style={{ width: "100%", maxWidth: "440px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "16px" }}>Profile</p>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "linear-gradient(135deg, #4ade80, #0e1f18)", border: "2px solid #14532d", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#4ade80", fontSize: "22px" }}>⬡</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: textColor, fontSize: "15px", fontWeight: "700" }}>{settings.displayName || "My Wallet"}</p>
            <p style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", marginTop: "2px" }}>{shortAddress}</p>
          </div>
        </div>
        <label style={{ color: subText, fontSize: "11px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "8px" }}>Display Name</label>
        <input type="text" placeholder="Enter a nickname..." value={settings.displayName} onChange={e => update("displayName", e.target.value)} maxLength={20} style={{ width: "100%", background: isDark ? "#111827" : "#f9fafb", border: `1px solid ${border}`, borderRadius: "10px", padding: "10px 14px", color: textColor, fontSize: "14px", fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Preferences */}
      <div style={{ width: "100%", maxWidth: "440px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "20px", marginBottom: "16px", transition: "all 0.3s ease" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "16px" }}>{tr.preferences}</p>

        {/* Notifications */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "16px", marginBottom: "16px", borderBottom: `1px solid ${border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            <div>
              <p style={{ color: textColor, fontSize: "14px", fontWeight: "600" }}>Notifications</p>
              <p style={{ color: subText, fontSize: "11px", fontFamily: "monospace" }}>Transaction alerts</p>
            </div>
          </div>
          <button onClick={() => update("notifications", !settings.notifications)} style={{ width: "48px", height: "26px", borderRadius: "13px", background: settings.notifications ? "#4ade80" : "#1f2937", border: "none", cursor: "pointer", position: "relative" }}>
            <span style={{ position: "absolute", top: "3px", left: settings.notifications ? "24px" : "3px", width: "20px", height: "20px", borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
          </button>
        </div>

        {/* Theme */}
        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px solid ${border}` }}>
          <p style={{ color: textColor, fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>🎨 {tr.theme}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px" }}>
            {(["dark", "light"] as const).map(t => (
              <button key={t} onClick={() => update("theme", t)} style={{ padding: "12px", background: settings.theme === t ? "rgba(74,222,128,0.1)" : isDark ? "#111827" : "#f9fafb", border: `1px solid ${settings.theme === t ? "rgba(74,222,128,0.4)" : border}`, borderRadius: "12px", cursor: "pointer", color: textColor, fontFamily: "monospace", fontSize: "13px" }}>
                {t === "dark" ? `🌙 ${tr.dark}` : `☀️ ${tr.light}`}
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px solid ${border}` }}>
          <p style={{ color: textColor, fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>💱 {tr.currency}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
            {currencies.map(cur => (
              <button key={cur} onClick={() => update("currency", cur)} style={{ padding: "10px", background: settings.currency === cur ? "rgba(74,222,128,0.1)" : isDark ? "#111827" : "#f9fafb", border: `1px solid ${settings.currency === cur ? "rgba(74,222,128,0.4)" : border}`, borderRadius: "10px", cursor: "pointer", color: textColor, fontSize: "12px", fontFamily: "monospace" }}>
                {CURRENCY_SYMBOLS[cur]} {cur}
              </button>
            ))}
          </div>
          <p style={{ color: subText, fontSize: "11px", marginTop: "10px", fontFamily: "monospace" }}>
            1 MATIC = {CURRENCY_SYMBOLS[settings.currency]}{liveRates[settings.currency].toFixed(2)}
          </p>
        </div>

        {/* Language */}
        <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: `1px solid ${border}` }}>
          <p style={{ color: textColor, fontSize: "14px", fontWeight: "600", marginBottom: "12px" }}>🌐 {tr.language}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "8px" }}>
            {languages.map(lang => (
              <button key={lang} onClick={() => update("language", lang)} style={{ padding: "10px", background: settings.language === lang ? "rgba(74,222,128,0.1)" : isDark ? "#111827" : "#f9fafb", border: `1px solid ${settings.language === lang ? "rgba(74,222,128,0.4)" : border}`, borderRadius: "10px", cursor: "pointer", color: textColor, fontSize: "12px", fontFamily: "monospace", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{lang}</span>
                {settings.language === lang && <span style={{ color: "#4ade80" }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${border}`, background: "transparent", color: subText, cursor: "pointer", fontFamily: "monospace", fontSize: "13px" }}>
            🗑️ {tr.resetSettings}
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button onClick={handleReset} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "#ef4444", color: "white", cursor: "pointer", fontWeight: "700", fontSize: "13px" }}>
              {tr.confirmReset}
            </button>
            <button onClick={() => setShowClearConfirm(false)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${border}`, background: "transparent", color: textColor, cursor: "pointer", fontSize: "13px" }}>
              {tr.cancel}
            </button>
          </div>
        )}
      </div>

      {/* App Info */}
      <div style={{ width: "100%", maxWidth: "440px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "16px" }}>App Info</p>
        {[
          { label: "App Name", value: "ZarPay" },
          { label: "Version", value: "1.0.0" },
          { label: "Network", value: "Polygon Amoy" },
          { label: tr.language, value: settings.language },
          { label: tr.currency, value: settings.currency },
          { label: tr.theme, value: settings.theme },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", marginBottom: "12px", borderBottom: i < 5 ? `1px solid ${border}` : "none" }}>
            <span style={{ color: subText, fontSize: "13px", fontFamily: "monospace" }}>{item.label}</span>
            <span style={{ color: textColor, fontSize: "13px", fontFamily: "monospace" }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Links */}
      <div style={{ width: "100%", maxWidth: "440px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "16px" }}>Links</p>
        {[
          { label: "View on PolygonScan", url: `https://amoy.polygonscan.com/address/${address}` },
          { label: "Get Testnet MATIC", url: "https://faucet.polygon.technology" },
          { label: "WalletConnect Docs", url: "https://docs.walletconnect.com" },
        ].map((item, i) => (
          <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", marginBottom: "12px", borderBottom: i < 2 ? `1px solid ${border}` : "none" }}>
            <span style={{ color: "#4ade80", fontSize: "13px", fontFamily: "monospace" }}>{item.label}</span>
            <span style={{ color: subText, fontSize: "14px" }}>↗</span>
          </a>
        ))}
      </div>

      {/* Wallet */}
      <div style={{ width: "100%", maxWidth: "440px", background: card, border: `1px solid ${border}`, borderRadius: "20px", padding: "20px" }}>
        <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "monospace", marginBottom: "16px" }}>{tr.wallet}</p>
        <DisconnectButton />
      </div>

      <BottomNav />
    </main>
  );
}