import { ArrowUpRight, Zap, PiggyBank, TrendingUp, Building2, Sparkles, QrCode, ChevronRight } from "lucide-react";

type AppScreen = "dashboard" | "wallet" | "exchange" | "activity" | "settings" | "merchant" | "pay-merchant" | "bills" | "bank-transfer" | "deposit" | "savings" | "profile" | "becky" | "bank-accounts" | "services";

interface ServicesScreenProps {
  onNavigate: (s: AppScreen) => void;
  onBack: () => void;
  onPayMerchant: (addr?: string) => void;
}

const SERVICES = [
  {
    group: "Payments",
    items: [
      { label: "Pay Merchant", sub: "Scan QR to pay", icon: QrCode, color: "#F59E0B", screen: "pay-merchant" as AppScreen, isPayMerchant: true },
      { label: "Bank Transfer", sub: "Withdraw to bank", icon: ArrowUpRight, color: "#EF4444", screen: "bank-transfer" as AppScreen },
      { label: "Deposit", sub: "Add funds via bank", icon: TrendingUp, color: "#00D97E", screen: "deposit" as AppScreen },
    ],
  },
  {
    group: "Utilities",
    items: [
      { label: "Utility Bills", sub: "Airtime, data, electricity", icon: Zap, color: "#F59E0B", screen: "bills" as AppScreen },
    ],
  },
  {
    group: "Finance",
    items: [
      { label: "Savings", sub: "Earn yield on USDC", icon: PiggyBank, color: "#8B5CF6", screen: "savings" as AppScreen },
      { label: "Bank Accounts", sub: "Manage linked accounts", icon: Building2, color: "#3B82F6", screen: "bank-accounts" as AppScreen },
    ],
  },
  {
    group: "AI",
    items: [
      { label: "Becky AI", sub: "Your ZarPay assistant", icon: Sparkles, color: "#A855F7", screen: "becky" as AppScreen },
    ],
  },
];

export function ServicesScreen({ onNavigate, onBack, onPayMerchant }: ServicesScreenProps) {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--zp-bg)", paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 38, height: 38, borderRadius: 11, border: "1px solid var(--zp-border)", background: "var(--zp-surface)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
        >
          <ChevronRight size={16} color="var(--zp-text-2)" style={{ transform: "rotate(180deg)" }} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--zp-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", margin: 0 }}>Services</h1>
          <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: 0 }}>Everything you can do with ZarPay</p>
        </div>
      </div>

      <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 20 }}>
        {SERVICES.map((group) => (
          <div key={group.group}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--zp-text-2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{group.group}</p>
            <div style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 16, overflow: "hidden" }}>
              {group.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => "isPayMerchant" in item ? onPayMerchant() : onNavigate(item.screen)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "16px 16px",
                      background: "none",
                      border: "none",
                      borderTop: i > 0 ? "1px solid var(--zp-border)" : "none",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget).style.background = "var(--zp-surface-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget).style.background = "none"; }}
                  >
                    {/* Icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: `${item.color}15`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={20} color={item.color} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--zp-text)", margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: "2px 0 0" }}>{item.sub}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight size={16} color="var(--zp-text-3)" />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
