import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import { Moon, Sun, User, Building2 } from "lucide-react";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { CURRENCY_SYMBOLS, type Currency, type Language } from "@/zarpay-settings";

const CURRENCIES: Currency[] = ["NGN", "USD", "GBP", "EUR"];
const LANGUAGES: Language[] = ["English", "French", "Spanish", "Arabic"];

interface SettingsScreenProps {
  onNavigate?: (s: "profile" | "bank-accounts") => void;
}

export function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { address } = useAccount();
  const { settings, updateSetting } = useZarpaySettings();
  const [displayName, setDisplayName] = useState(settings.displayName ?? "");
  const [saved, setSaved] = useState(false);

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  function handleSaveName() {
    updateSetting("displayName", displayName);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="zp-page">
      <div className="zp-content">
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Settings</h1>

        {/* Profile */}
        <div className="zp-card">
          <p className="zp-label">Profile</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: "linear-gradient(135deg, #2ECC71, #0F9B5C)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: 800, color: "#fff", flexShrink: 0,
            }}>
              {(displayName || "W").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--zp-text)" }}>{displayName || "My Wallet"}</p>
              <p style={{ fontSize: "12px", color: "var(--zp-green)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{shortAddr}</p>
            </div>
          </div>
          {onNavigate && (
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => onNavigate("profile")}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <User size={15} /> Profile
              </button>
              <button onClick={() => onNavigate("bank-accounts")}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Building2 size={15} /> Banks
              </button>
            </div>
          )}
          <p className="zp-label">Display Name</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              type="text"
              placeholder="Enter a nickname..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="zp-input"
              style={{ flex: 1 }}
            />
            <button onClick={handleSaveName}
              style={{
                padding: "0 20px", borderRadius: 12, border: "none",
                background: saved ? "var(--zp-green-dim)" : "var(--zp-green)",
                color: saved ? "var(--zp-green)" : "#080C12",
                fontWeight: 700, cursor: "pointer", fontSize: "13px", flexShrink: 0, transition: "all 0.2s",
              }}>
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="zp-card">
          <p className="zp-label">Appearance</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(["dark", "light"] as const).map((theme) => (
              <button key={theme} onClick={() => updateSetting("theme", theme)}
                style={{
                  padding: 14, borderRadius: 12,
                  border: "1px solid " + (settings.theme === theme ? "var(--zp-green-border)" : "var(--zp-border)"),
                  background: settings.theme === theme ? "var(--zp-green-dim)" : "var(--zp-surface-2)",
                  color: settings.theme === theme ? "var(--zp-green)" : "var(--zp-text-2)",
                  fontWeight: settings.theme === theme ? 700 : 500, cursor: "pointer", fontSize: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
                <span style={{ textTransform: "capitalize" }}>{theme}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="zp-card">
          <p className="zp-label">Display Currency</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {CURRENCIES.map((c) => (
              <button key={c} onClick={() => updateSetting("currency", c)}
                style={{
                  padding: 14, borderRadius: 12,
                  border: "1px solid " + (settings.currency === c ? "var(--zp-green-border)" : "var(--zp-border)"),
                  background: settings.currency === c ? "var(--zp-green-dim)" : "var(--zp-surface-2)",
                  color: settings.currency === c ? "var(--zp-green)" : "var(--zp-text-2)",
                  fontWeight: settings.currency === c ? 700 : 500, cursor: "pointer", fontSize: "14px",
                }}>
                {CURRENCY_SYMBOLS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="zp-card">
          <p className="zp-label">Language</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {LANGUAGES.map((lang) => (
              <button key={lang} onClick={() => updateSetting("language", lang)}
                style={{
                  padding: 14, borderRadius: 12,
                  border: "1px solid " + (settings.language === lang ? "var(--zp-green-border)" : "var(--zp-border)"),
                  background: settings.language === lang ? "var(--zp-green-dim)" : "var(--zp-surface-2)",
                  color: settings.language === lang ? "var(--zp-green)" : "var(--zp-text-2)",
                  fontWeight: settings.language === lang ? 700 : 500, cursor: "pointer", fontSize: "14px",
                }}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Network */}
        <div className="zp-card">
          <p className="zp-label">Network</p>
          {[
            { label: "Network", value: "Arc Testnet" },
            { label: "Chain ID", value: "5042002" },
            { label: "Wallet", value: shortAddr || "—" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid var(--zp-border)" : "none",
            }}>
              <span style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>{item.label}</span>
              <span style={{ fontSize: "13px", color: "var(--zp-text)", fontFamily: "var(--font-mono)" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="zp-card" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em", marginBottom: 4 }}>ZarPay</p>
          <p style={{ fontSize: "12px", color: "var(--zp-text-2)", marginBottom: 16 }}>Stablecoin payments on Arc Network</p>
          <span className="zp-badge zp-badge-green">v1.0.0 · Testnet</span>
        </div>

        {/* Disconnect */}
        <div style={{ display: "flex", justifyContent: "center", paddingBottom: 8 }}>
          <ConnectKitButton />
        </div>
      </div>
    </div>
  );
}
