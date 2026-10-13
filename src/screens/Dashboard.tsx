import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectKitButton } from "connectkit";
import {
  ArrowUpRight, ArrowDownLeft, RefreshCw, QrCode,
  Eye, EyeOff, Bell, ChevronRight, LayoutGrid, Zap,
} from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { useLivePrices } from "@/hooks/useLivePrices";
import { useNotifications } from "@/hooks/useNotifications";
import { SendModal } from "@/components/SendModal";
import { ReceiveModal } from "@/components/ReceiveModal";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { CURRENCY_SYMBOLS, FALLBACK_RATES } from "@/zarpay-settings";

type AppScreen = "dashboard" | "wallet" | "exchange" | "activity" | "settings" | "merchant" | "pay-merchant" | "bills" | "bank-transfer" | "deposit" | "savings" | "profile" | "becky" | "bank-accounts" | "services";

interface DashboardProps {
  onNavigate: (s: AppScreen) => void;
  onPayMerchant: (addr?: string) => void;
}

export function Dashboard({ onNavigate, onPayMerchant }: DashboardProps) {
  const { address, isConnected } = useAccount();
  const { settings } = useZarpaySettings();
  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications(address);
  const [showSend, setShowSend] = useState(false);
  const [showReceive, setShowReceive] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const usdcNum = parseFloat(usdcFormatted) || 0;
  const eurcNum = parseFloat(eurcFormatted) || 0;
  const eurToUsd = rates["EUR"] ?? FALLBACK_RATES["EUR"];
  const totalUsd = usdcNum + eurcNum * eurToUsd;
  const fiatRate = rates[settings.currency] ?? FALLBACK_RATES[settings.currency];
  const fiatTotal = (totalUsd * fiatRate).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const displayName = settings.displayName || "My Wallet";
  const initials = displayName.slice(0, 2).toUpperCase();

  /* ── Login screen ──────────────────────────────────────────────────── */
  if (!isConnected) {
    return (
      <div style={{
        minHeight: "100dvh",
        background: "var(--zp-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Ambient background orbs */}
        <div style={{ position: "absolute", top: "-10%", left: "-20%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,196,107,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "40%", right: "10%", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo mark */}
        <div style={{ marginBottom: 56, textAlign: "center" }} className="fade-up">
          {/* Icon */}
          <div style={{
            width: 88, height: 88,
            borderRadius: 28,
            background: "linear-gradient(145deg, #051A0D, #020D06)",
            border: "1px solid rgba(5,196,107,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 28px",
            boxShadow: "0 0 60px rgba(5,196,107,0.12), 0 20px 40px rgba(0,0,0,0.4)",
            position: "relative",
          }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "radial-gradient(circle at 30% 30%, rgba(5,196,107,0.15), transparent 60%)" }} />
            <span style={{ fontSize: 38, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--zp-green)", position: "relative" }}>Z</span>
          </div>

          <h1 style={{
            fontSize: 42, fontWeight: 800,
            color: "var(--zp-text)",
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.04em",
            margin: "0 0 10px",
            lineHeight: 1,
          }}>
            Zar<span style={{ color: "var(--zp-green)" }}>Pay</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--zp-text-2)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            Send, receive and swap stablecoins instantly
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10, marginBottom: 44, width: "100%", maxWidth: 360 }} className="fade-up">
          {[
            { label: "Fast", value: "< 1s", color: "var(--zp-green)" },
            { label: "Secure", value: "Self-custodial", color: "var(--zp-blue)" },
            { label: "Low fees", value: "USDC gas", color: "var(--zp-purple)" },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1,
              background: "var(--zp-surface)",
              border: "1px solid var(--zp-border)",
              borderRadius: 16,
              padding: "14px 10px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: s.color, fontFamily: "var(--font-display)", marginBottom: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--zp-text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ width: "100%", maxWidth: 360 }} className="fade-up">
          <ConnectKitButton.Custom>
            {({ show }) => (
              <button onClick={show} style={{
                width: "100%",
                padding: "18px 24px",
                borderRadius: 16,
                border: "none",
                background: "linear-gradient(135deg, #06E07A 0%, #05C46B 100%)",
                color: "#020D05",
                fontWeight: 800,
                fontSize: 16,
                fontFamily: "var(--font-display)",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                boxShadow: "0 6px 32px rgba(5,196,107,0.30), 0 1px 0 rgba(255,255,255,0.2) inset",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "all 0.2s",
              }}>
                <Zap size={18} fill="#020D05" />
                Connect Wallet
              </button>
            )}
          </ConnectKitButton.Custom>
          <p style={{ textAlign: "center", fontSize: 12, color: "var(--zp-text-3)", marginTop: 14, lineHeight: 1.5 }}>
            MetaMask · Coinbase · WalletConnect · and more
          </p>
        </div>
      </div>
    );
  }

  /* ── Dashboard ─────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100dvh", background: "var(--zp-bg)", paddingBottom: 90, position: "relative", overflow: "hidden" }}>

      {/* Background ambient glow */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 300, background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(5,196,107,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div style={{ padding: "52px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Avatar + greeting */}
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(5,196,107,0.15), rgba(5,196,107,0.04))",
              border: "1px solid var(--zp-green-border)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--zp-green)", fontFamily: "var(--font-display)" }}>
                {initials}
              </span>
            </div>
            <div>
              <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: 0, fontWeight: 500 }}>Good day,</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--zp-text)", margin: 0, fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                {displayName}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { if (unreadCount > 0) markAllRead(); setShowNotifs(!showNotifs); }}
              className="zp-icon-btn"
            >
              <Bell size={15} color={unreadCount > 0 ? "var(--zp-amber)" : "var(--zp-text-2)"} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "var(--zp-amber)", color: "#000",
                  fontSize: 9, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid var(--zp-bg)",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => void refetch()} className="zp-icon-btn">
              <RefreshCw size={14} color="var(--zp-text-2)" />
            </button>
          </div>
        </div>

        {showNotifs && (
          <NotificationsPanel
            notifications={notifications}
            onClose={() => setShowNotifs(false)}
            onMarkAllRead={markAllRead}
            onMarkRead={markRead}
            onClearAll={clearAll}
          />
        )}

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>

          {/* ── Hero Balance Card ──────────────────────────────────────── */}
          <div className="zp-card-hero">
            {/* Inner glow top-right */}
            <div style={{ position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,196,107,0.10) 0%, transparent 65%)", pointerEvents: "none", animation: "glow-pulse 4s ease-in-out infinite" }} />
            {/* Inner glow bottom-left */}
            <div style={{ position: "absolute", bottom: -60, left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

            {/* Balance row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(5,196,107,0.7)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Total Balance</span>
              <button onClick={() => setBalanceHidden(!balanceHidden)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--zp-text-3)", padding: 2, display: "flex", alignItems: "center" }}>
                {balanceHidden ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            {isLoading ? (
              <div className="zp-skeleton" style={{ width: 220, height: 52, marginBottom: 10 }} />
            ) : (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 46, fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {balanceHidden ? "••••••" : `${symbol}${fiatTotal}`}
                  </span>
                  <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{settings.currency}</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: 6 }}>
                    {balanceHidden ? "•••• USDC" : `${usdcFormatted} USDC`}
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.04)", padding: "3px 10px", borderRadius: 6 }}>
                    {balanceHidden ? "•••• EURC" : `${eurcFormatted} EURC`}
                  </span>
                </div>
              </div>
            )}

            {/* Network badge */}
            <div style={{ marginBottom: 20 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 8,
                background: "rgba(5,196,107,0.08)", border: "1px solid rgba(5,196,107,0.14)",
                fontSize: 10, fontWeight: 700, color: "rgba(5,196,107,0.7)", fontFamily: "var(--font-mono)",
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--zp-green)", boxShadow: "0 0 6px rgba(5,196,107,0.6)", flexShrink: 0 }} />
                Arc Testnet · {shortAddr}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "Send",    icon: <ArrowUpRight  size={18} />, color: "#05C46B", bg: "rgba(5,196,107,0.12)",  action: () => setShowSend(true) },
                { label: "Receive", icon: <ArrowDownLeft size={18} />, color: "#4F8EF7", bg: "rgba(79,142,247,0.12)", action: () => setShowReceive(true) },
                { label: "Swap",    icon: <RefreshCw     size={18} />, color: "#9B6DFF", bg: "rgba(155,109,255,0.12)",action: () => onNavigate("wallet") },
                { label: "Pay",     icon: <QrCode        size={18} />, color: "#FFAB00", bg: "rgba(255,171,0,0.12)",  action: () => onPayMerchant() },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                  padding: "12px 4px",
                  borderRadius: 16,
                  border: `1px solid ${btn.color}22`,
                  background: btn.bg,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: `${btn.color}18`, border: `1px solid ${btn.color}25`, display: "flex", alignItems: "center", justifyContent: "center", color: btn.color }}>
                    {btn.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Assets ──────────────────────────────────────────────────── */}
          <div style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 20, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px 10px" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--zp-text-2)", textTransform: "uppercase", letterSpacing: "0.10em" }}>My Assets</span>
              <button onClick={() => onNavigate("wallet")} style={{ display: "flex", alignItems: "center", gap: 3, background: "none", border: "none", color: "var(--zp-green)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Wallet <ChevronRight size={13} />
              </button>
            </div>
            {[
              { name: "USDC", sub: "USD Coin",  amount: usdcFormatted, fiat: `${symbol}${(usdcNum * fiatRate).toFixed(2)}`,           color: "#2775CA", bg: "rgba(39,117,202,0.12)", sym: "$" },
              { name: "EURC", sub: "Euro Coin", amount: eurcFormatted, fiat: `${symbol}${(eurcNum * eurToUsd * fiatRate).toFixed(2)}`, color: "#1A56DB", bg: "rgba(26,86,219,0.12)",  sym: "€" },
            ].map((a, i) => (
              <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderTop: i === 0 ? "1px solid var(--zp-border)" : "1px solid var(--zp-border-2)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, border: `1px solid ${a.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: a.color }}>{a.sym}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>{a.name}</p>
                  <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: 0 }}>{a.sub}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>{isLoading ? <span className="zp-skeleton" style={{ width: 60, height: 14, display: "block" }} /> : a.amount}</p>
                  <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: 0 }}>{isLoading ? "" : a.fiat}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Services entry ───────────────────────────────────────────── */}
          <button
            onClick={() => onNavigate("services")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "16px 18px",
              background: "linear-gradient(135deg, rgba(5,196,107,0.06) 0%, var(--zp-surface) 100%)",
              border: "1px solid var(--zp-green-border)",
              borderRadius: 18, cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(5,196,107,0.10) 0%, var(--zp-surface-2) 100%)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(5,196,107,0.06) 0%, var(--zp-surface) 100%)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(5,196,107,0.12)", border: "1px solid var(--zp-green-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <LayoutGrid size={20} color="var(--zp-green)" />
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--zp-text)", margin: 0, fontFamily: "var(--font-display)" }}>Services</p>
                <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: 0 }}>Bills, savings, deposit & more</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--zp-green)", background: "var(--zp-green-dim)", padding: "3px 8px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>7 services</span>
              <ChevronRight size={16} color="var(--zp-text-3)" />
            </div>
          </button>

          {/* ── Activity link ─────────────────────────────────────────── */}
          <button
            onClick={() => onNavigate("activity")}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              width: "100%", padding: "14px 18px",
              background: "var(--zp-surface)",
              border: "1px solid var(--zp-border)",
              borderRadius: 16, cursor: "pointer",
              transition: "border-color 0.15s",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--zp-text-2)" }}>Transaction History</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--zp-green)" }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>View all</span>
              <ChevronRight size={13} />
            </div>
          </button>

        </div>
      </div>

      {showSend    && <SendModal    onClose={() => setShowSend(false)}    usdcBalance={usdcFormatted} eurcBalance={eurcFormatted} />}
      {showReceive && <ReceiveModal onClose={() => setShowReceive(false)} />}
    </div>
  );
}
