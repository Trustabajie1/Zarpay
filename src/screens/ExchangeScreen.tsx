import { Download, Banknote, Zap, Building2, Lock } from "lucide-react";

type SubScreen = "deposit" | "withdraw" | "utility" | "banks";

interface ExchangeScreenProps {
  onNavigate?: (sub: SubScreen) => void;
}

const SERVICES = [
  {
    id: "deposit" as SubScreen,
    label: "Deposit",
    sub: "Buy crypto with NGN",
    Icon: Download,
    color: "var(--zp-green)",
    tint: "var(--zp-green-dim)",
    border: "var(--zp-green-border)",
  },
  {
    id: "withdraw" as SubScreen,
    label: "Withdraw",
    sub: "Cash out to bank",
    Icon: Banknote,
    color: "#3B82F6",
    tint: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
  },
  {
    id: "utility" as SubScreen,
    label: "Utility Bills",
    sub: "Pay bills & services",
    Icon: Zap,
    color: "var(--zp-amber)",
    tint: "var(--zp-amber-dim)",
    border: "rgba(240,165,0,0.25)",
  },
  {
    id: "banks" as SubScreen,
    label: "Bank Accounts",
    sub: "Manage your banks",
    Icon: Building2,
    color: "#A78BFA",
    tint: "rgba(167,139,250,0.12)",
    border: "rgba(167,139,250,0.25)",
  },
];

export function ExchangeScreen({ onNavigate }: ExchangeScreenProps) {
  return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>
            Financial Services
          </h1>
          <p style={{ fontSize: "13px", color: "var(--zp-text-2)", marginTop: 4 }}>
            Deposits, withdrawals, bills and more
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SERVICES.map(({ id, label, sub, Icon, color, tint, border }) => (
            <button
              key={id}
              onClick={() => onNavigate?.(id)}
              style={{
                background: "var(--zp-surface)",
                border: "1px solid var(--zp-border)",
                borderRadius: 16,
                padding: "20px 16px",
                display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12,
                cursor: "pointer", textAlign: "left",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = border)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--zp-border)")}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: tint, border: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "var(--zp-text)" }}>{label}</p>
                <p style={{ fontSize: "11px", color: "var(--zp-text-2)", marginTop: 3 }}>{sub}</p>
              </div>
            </button>
          ))}
        </div>

        <div style={{
          background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)",
          borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 10,
        }}>
          <Lock size={16} color="var(--zp-text-2)" />
          <p style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>
            All transactions are self-custodial. ZarPay never holds your funds.
          </p>
        </div>

        {/* Coming Soon notice */}
        <div style={{
          background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)",
          borderRadius: 12, padding: "16px 16px", textAlign: "center",
        }}>
          <p style={{ fontSize: "13px", color: "var(--zp-text-2)", marginBottom: 4 }}>More services coming soon</p>
          <p style={{ fontSize: "11px", color: "var(--zp-text-3)" }}>
            Fiat on/off ramp, bill payments, and bank integrations are in development.
          </p>
        </div>
      </div>
    </div>
  );
}
