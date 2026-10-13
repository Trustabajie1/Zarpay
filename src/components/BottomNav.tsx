import { Home, Store, Wallet, Settings, Sparkles } from "lucide-react";

type Screen = "dashboard" | "merchant" | "wallet" | "settings" | "becky";

interface BottomNavProps {
  active: Screen;
  onNavigate: (screen: Screen) => void;
}

const TABS: { id: Screen; label: string; Icon: React.ElementType; activeColor: string; activeBg: string }[] = [
  { id: "dashboard", label: "Home",     Icon: Home,     activeColor: "#05C46B", activeBg: "rgba(5,196,107,0.12)"  },
  { id: "wallet",    label: "Wallet",   Icon: Wallet,   activeColor: "#4F8EF7", activeBg: "rgba(79,142,247,0.12)" },
  { id: "merchant",  label: "Merchant", Icon: Store,    activeColor: "#FFAB00", activeBg: "rgba(255,171,0,0.12)"  },
  { id: "becky",     label: "Becky",    Icon: Sparkles, activeColor: "#9B6DFF", activeBg: "rgba(155,109,255,0.12)"},
  { id: "settings",  label: "Settings", Icon: Settings, activeColor: "#05C46B", activeBg: "rgba(5,196,107,0.12)"  },
];

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "rgba(4,8,15,0.94)",
      backdropFilter: "blur(28px)",
      WebkitBackdropFilter: "blur(28px)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "10px 4px 28px", zIndex: 100,
    }}>
      {TABS.map(({ id, label, Icon, activeColor, activeBg }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              padding: "6px 14px", borderRadius: 16,
              transition: "all 0.2s ease",
              minWidth: 56,
            }}
          >
            <div style={{
              width: 40, height: 36, borderRadius: 12,
              background: isActive ? activeBg : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s ease",
              boxShadow: isActive ? `0 0 16px ${activeColor}22` : "none",
            }}>
              <Icon
                size={19}
                color={isActive ? activeColor : "rgba(255,255,255,0.28)"}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
            </div>
            <span style={{
              fontSize: 9.5, fontWeight: isActive ? 700 : 500,
              color: isActive ? activeColor : "rgba(255,255,255,0.28)",
              letterSpacing: "0.03em",
              transition: "color 0.2s",
            }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
