import { X, Bell, ArrowDownLeft, RefreshCw, Trash2, ExternalLink } from "lucide-react";
import { AppNotification } from "@/hooks/useNotifications";
import { buildTxExplorerUrl } from "@/onchain-facts";

const ARC_CHAIN_ID = 5042002;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: AppNotification["type"] }) {
  const colors: Record<AppNotification["type"], { bg: string; border: string; icon: string }> = {
    received_usdc: { bg: "var(--zp-green-dim)", border: "var(--zp-green-border)", icon: "var(--zp-green)" },
    received_eurc: { bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", icon: "#818CF8" },
    swap: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.25)", icon: "#FBB024" },
    system: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", icon: "#60A5FA" },
  };
  const c = colors[type];
  return (
    <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.bg, border: `1px solid ${c.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <ArrowDownLeft size={16} color={c.icon} />
    </div>
  );
}

interface Props {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationsPanel({ notifications, onClose, onMarkAllRead, onMarkRead, onClearAll }: Props) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 200, display: "flex", flexDirection: "column" }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} />

      {/* Panel slides in from top */}
      <div
        style={{ position: "relative", width: "100%", maxWidth: 480, margin: "0 auto", background: "var(--zp-bg)", borderRadius: "0 0 20px 20px", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px 14px", borderBottom: "1px solid var(--zp-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={18} color="var(--zp-text)" />
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--zp-text)" }}>Notifications</span>
            {unread > 0 && (
              <span style={{ background: "var(--zp-green)", color: "#080C12", fontSize: "11px", fontWeight: 700, borderRadius: "10px", padding: "1px 7px" }}>
                {unread}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {unread > 0 && (
              <button onClick={onMarkAllRead} style={{ background: "none", border: "none", color: "var(--zp-green)", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={onClearAll} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex" }}>
                <Trash2 size={15} />
              </button>
            )}
            <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {notifications.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--zp-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Bell size={24} color="var(--zp-text-3)" />
              </div>
              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--zp-text)" }}>All caught up</p>
              <p style={{ fontSize: "12px", color: "var(--zp-text-2)", textAlign: "center" }}>
                You'll be notified here when you receive payments
              </p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                style={{
                  display: "flex", gap: 12, padding: "14px 20px",
                  borderBottom: i < notifications.length - 1 ? "1px solid var(--zp-border)" : "none",
                  background: n.read ? "transparent" : "rgba(46,204,113,0.03)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <NotifIcon type={n.type} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <p style={{ fontSize: "13px", fontWeight: n.read ? 500 : 700, color: "var(--zp-text)" }}>{n.title}</p>
                    <span style={{ fontSize: "10px", color: "var(--zp-text-3)", flexShrink: 0, marginLeft: 8 }}>{timeAgo(n.timestamp)}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--zp-text-2)", lineHeight: 1.4 }}>{n.message}</p>
                  {n.txHash && (
                    <a
                      href={buildTxExplorerUrl(ARC_CHAIN_ID, n.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: "11px", color: "var(--zp-green)", textDecoration: "none" }}
                    >
                      <RefreshCw size={10} />View on Explorer
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                {!n.read && (
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--zp-green)", flexShrink: 0, marginTop: 5 }} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
