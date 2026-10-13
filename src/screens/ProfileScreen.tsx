import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, Copy, Check, ExternalLink, Shield, Zap, Award, TrendingUp } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { CURRENCY_SYMBOLS } from "@/zarpay-settings";
import { buildAddressExplorerUrl } from "@/onchain-facts";

const ARC_CHAIN_ID = 5042002;

interface ProfileScreenProps {
  onBack: () => void;
}

const KYC_LEVELS = [
  { level: 0, label: "Unverified",  color: "var(--zp-text-2)", bg: "var(--zp-surface-2)", icon: "👤", limit: "₦50,000/day"  },
  { level: 1, label: "Basic",       color: "#F59E0B",           bg: "rgba(245,158,11,0.1)", icon: "✅", limit: "₦200,000/day" },
  { level: 2, label: "Verified",    color: "var(--zp-green)",   bg: "var(--zp-green-dim)",  icon: "🛡️", limit: "₦1,000,000/day" },
  { level: 3, label: "Premium",     color: "#A78BFA",           bg: "rgba(167,139,250,0.1)", icon: "👑", limit: "Unlimited"     },
];

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { address } = useAccount();
  const { settings, updateSetting } = useZarpaySettings();
  const { usdcFormatted, eurcFormatted } = useWalletBalance(address);
  const { transactions } = useTransactionHistory(address);
  const symbol = CURRENCY_SYMBOLS[settings.currency];

  const [copied, setCopied] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(settings.displayName || "");
  const [kycLevel] = useState(0); // demo: always unverified

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const initials = (settings.displayName?.trim() || "W").slice(0, 2).toUpperCase();

  const sent = transactions.filter((t) => t.type === "sent").length;
  const received = transactions.filter((t) => t.type === "received").length;
  const totalVolume = transactions.reduce((s, t) => s + parseFloat(t.value), 0);

  const kyc = KYC_LEVELS[kycLevel];
  const nextKyc = KYC_LEVELS[Math.min(kycLevel + 1, 3)];

  function handleCopy() {
    if (!address) return;
    void navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveName() {
    updateSetting("displayName", nameInput.trim());
    setEditingName(false);
  }

  const qrUrl = address
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${address}&bgcolor=080C12&color=2ECC71&margin=12`
    : "";

  return (
    <div className="zp-page">
      <div className="zp-content">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 8 }}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Avatar + name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 20, borderBottom: "1px solid var(--zp-border)", marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#2ECC71,#0F9B5C)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff" }}>
            {initials}
          </div>

          {editingName ? (
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter display name"
                className="zp-input"
                style={{ flex: 1 }}
                autoFocus
              />
              <button onClick={handleSaveName} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: "var(--zp-green)", color: "#080C12", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
              <button onClick={() => setEditingName(false)} style={{ padding: "0 12px", borderRadius: 10, border: "1px solid var(--zp-border)", background: "none", color: "var(--zp-text-2)", fontSize: 13, cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <button onClick={() => setEditingName(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "var(--zp-text)", marginBottom: 2 }}>
                  {settings.displayName?.trim() || "My Wallet"} ✏️
                </p>
              </button>
              <p style={{ fontSize: 12, color: "var(--zp-green)", fontFamily: "var(--font-mono)" }}>{shortAddr}</p>
            </div>
          )}

          {/* KYC badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: kyc.bg, border: `1px solid ${kyc.color}44`, borderRadius: 20, padding: "4px 12px" }}>
            <span style={{ fontSize: 12 }}>{kyc.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: kyc.color }}>{kyc.label}</span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { icon: <TrendingUp size={16} color="var(--zp-green)" />, label: "Total Volume", value: `${totalVolume.toFixed(2)} USDC` },
            { icon: <Award size={16} color="#A78BFA" />,              label: "Transactions", value: String(transactions.length) },
            { icon: <Zap size={16} color="#F59E0B" />,                label: "Sent",         value: String(sent) },
            { icon: <Shield size={16} color="#3B82F6" />,             label: "Received",     value: String(received) },
          ].map((stat, i) => (
            <div key={i} style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>{stat.icon}<span style={{ fontSize: 11, color: "var(--zp-text-2)" }}>{stat.label}</span></div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "var(--zp-text)" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Balances */}
        <div className="zp-card" style={{ marginBottom: 16 }}>
          <p className="zp-label">Wallet Balances</p>
          {[
            { label: "USDC", sub: "USD Coin · Arc Testnet", val: usdcFormatted, color: "#2775CA" },
            { label: "EURC", sub: "Euro Coin · Arc Testnet", val: eurcFormatted, color: "#4469CC" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i === 0 ? "1px solid var(--zp-border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: item.color + "22", border: `1px solid ${item.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: item.color }}>
                  {item.label === "USDC" ? "$" : "€"}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--zp-text)" }}>{item.label}</p>
                  <p style={{ fontSize: 11, color: "var(--zp-text-2)" }}>{item.sub}</p>
                </div>
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "var(--zp-text)" }}>{item.val}</p>
            </div>
          ))}
        </div>

        {/* Wallet address + QR */}
        <div className="zp-card" style={{ marginBottom: 16 }}>
          <p className="zp-label">Wallet Address</p>
          {qrUrl && (
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ background: "#080C12", border: "1px solid var(--zp-green-border)", borderRadius: 14, padding: 12 }}>
                <img src={qrUrl} alt="QR" width={140} height={140} style={{ borderRadius: 8, display: "block" }} />
              </div>
            </div>
          )}
          <div style={{ background: "var(--zp-surface-2)", borderRadius: 10, padding: "10px 14px", marginBottom: 10, wordBreak: "break-all" }}>
            <p style={{ fontSize: 11, color: "var(--zp-green)", fontFamily: "var(--font-mono)" }}>{address}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCopy} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              {copied ? <Check size={14} color="var(--zp-green)" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <a href={buildAddressExplorerUrl(ARC_CHAIN_ID, address ?? "")} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}>
              <ExternalLink size={14} /> Explorer
            </a>
          </div>
        </div>

        {/* KYC upgrade */}
        {kycLevel < 3 && (
          <div style={{ background: nextKyc.bg, border: `1px solid ${nextKyc.color}44`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--zp-text)" }}>Upgrade to {nextKyc.label}</p>
              <span style={{ fontSize: 18 }}>{nextKyc.icon}</span>
            </div>
            <p style={{ fontSize: 12, color: "var(--zp-text-2)", marginBottom: 12 }}>
              Unlock {nextKyc.limit} limit and premium features.
            </p>
            <button style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: nextKyc.color, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: 0.9 }}>
              Start Verification (Demo)
            </button>
          </div>
        )}

        {/* Settings shortcuts */}
        <div className="zp-card">
          <p className="zp-label">Preferences</p>
          {[
            { label: "Currency", value: `${symbol} ${settings.currency}` },
            { label: "Language", value: settings.language },
            { label: "Theme", value: settings.theme === "dark" ? "🌙 Dark" : "☀️ Light" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--zp-border)" : "none" }}>
              <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--zp-text)" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
