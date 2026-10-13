import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Store, LayoutDashboard, QrCode, Trash2, PlugZap, Check, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface MerchantData {
  name: string;
  category: string;
  emoji: string;
}

const CATEGORIES = ["Retail", "Food & Drink", "Services", "Freelance", "E-commerce", "Other"];

function loadMerchant(address?: string): MerchantData | null {
  if (!address) return null;
  try {
    const s = localStorage.getItem(`zarpay_merchant_${address}`);
    return s ? (JSON.parse(s) as MerchantData) : null;
  } catch { return null; }
}

export function MerchantScreen() {
  const { address, isConnected } = useAccount();
  const [merchant, setMerchant] = useState<MerchantData | null>(() => loadMerchant(address));
  const [showRegister, setShowRegister] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [emoji, setEmoji] = useState("🏪");

  // Re-sync when address changes (e.g. wallet switch)
  useEffect(() => {
    setMerchant(loadMerchant(address));
  }, [address]);

  function handleRegister() {
    if (!name.trim()) return;
    const data: MerchantData = { name: name.trim(), category, emoji };
    localStorage.setItem(`zarpay_merchant_${address}`, JSON.stringify(data));
    setMerchant(data);
    setShowRegister(false);
  }

  function handleUnregister() {
    if (!address) return;
    localStorage.removeItem(`zarpay_merchant_${address}`);
    setMerchant(null);
    setShowDashboard(false);
  }

  if (!isConnected) {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Merchant</h1>
          <div className="zp-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <PlugZap size={40} color="var(--zp-text-3)" style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--zp-text)", marginBottom: 8 }}>Connect your wallet</p>
            <p style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>You need a connected wallet to register as a merchant</p>
          </div>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowRegister(false)} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, fontSize: "20px" }}>←</button>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Register Merchant</h1>
          </div>

          <div className="zp-card">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
              {["🏪","🍔","💼","🖥","📦","🎯"].map((e) => (
                <button key={e} onClick={() => setEmoji(e)}
                  style={{
                    fontSize: "24px", padding: "8px", borderRadius: 10, cursor: "pointer",
                    border: "1px solid " + (emoji === e ? "var(--zp-green-border)" : "var(--zp-border)"),
                    background: emoji === e ? "var(--zp-green-dim)" : "var(--zp-surface-2)",
                  }}>
                  {e}
                </button>
              ))}
            </div>

            <p className="zp-label">Business Name</p>
            <input
              type="text"
              placeholder="e.g. Chidi's Store"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="zp-input"
              style={{ marginBottom: 16 }}
            />

            <p className="zp-label">Category</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="zp-input" style={{ marginBottom: 20 }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <button onClick={handleRegister} disabled={!name.trim()} className="zp-btn-primary"
              style={{ background: !name.trim() ? "var(--zp-surface-2)" : "var(--zp-green)", color: !name.trim() ? "var(--zp-text-3)" : "#080C12" }}>
              Register as Merchant
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showQR && merchant) {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowQR(false)} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4 }}>←</button>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Payment QR</h1>
          </div>

          <div className="zp-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "32px 24px" }}>
            <div style={{ fontSize: "28px" }}>{merchant.emoji}</div>
            <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--zp-text)", margin: 0 }}>{merchant.name}</p>
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)", marginTop: -8 }}>{merchant.category}</p>

            {/* Real QR */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 16,
              marginTop: 4,
              display: "inline-flex",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}>
              <QRCodeSVG
                value={address ?? ""}
                size={220}
                level="M"
                includeMargin={false}
                fgColor="#0a0f1a"
                bgColor="#ffffff"
              />
            </div>

            <p style={{ fontSize: "12px", color: "var(--zp-text-2)", textAlign: "center" }}>
              Show this to customers — they scan to pay you in EURC
            </p>

            <div className="zp-card-2" style={{ width: "100%" }}>
              <p style={{ fontSize: "10px", color: "var(--zp-text-3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", marginBottom: 4 }}>Merchant Address</p>
              <p style={{ fontSize: "11px", color: "var(--zp-green)", fontFamily: "var(--font-mono)", wordBreak: "break-all", lineHeight: 1.6 }}>{address}</p>
            </div>

            <button
              onClick={() => {
                if (!address) return;
                void navigator.clipboard.writeText(address);
              }}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text)", fontWeight: 600, cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Download size={14} /> Copy Address
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showDashboard && merchant) {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setShowDashboard(false)} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, fontSize: "20px" }}>←</button>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Dashboard</h1>
          </div>
          <div className="zp-card">
            <p className="zp-label">Recent Payments</p>
            <div style={{ padding: "32px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>No payments received yet</p>
              <p style={{ fontSize: "11px", color: "var(--zp-text-3)", marginTop: 6 }}>Share your QR code so customers can pay you</p>
            </div>
          </div>
          <button onClick={() => { setShowDashboard(false); setShowQR(true); }} className="zp-btn-primary">
            Show QR Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="zp-page">
      <div className="zp-content">
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Merchant</h1>
          <p style={{ fontSize: "13px", color: "var(--zp-text-2)", marginTop: 4 }}>Accept EURC payments from customers</p>
        </div>

        {merchant ? (
          <>
            {/* Merchant card */}
            <div style={{
              background: "linear-gradient(135deg, #0D1621, #0F1E30)",
              border: "1px solid var(--zp-green-border)", borderRadius: 20, padding: 20,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(46,204,113,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                  {merchant.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "17px", fontWeight: 800, color: "var(--zp-text)", margin: 0, letterSpacing: "-0.02em" }}>{merchant.name}</p>
                  <p style={{ fontSize: "12px", color: "var(--zp-text-2)", margin: "3px 0 0" }}>{merchant.category}</p>
                </div>
                <span className="zp-badge zp-badge-green" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={10} /> Active
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "var(--zp-text-3)", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>{address}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button onClick={() => setShowDashboard(true)}
                style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(46,204,113,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LayoutDashboard size={18} color="var(--zp-green)" />
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Dashboard</p>
                  <p style={{ fontSize: "11px", color: "var(--zp-text-2)", margin: "3px 0 0" }}>View payments</p>
                </div>
              </button>
              <button onClick={() => setShowQR(true)}
                style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59,130,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <QrCode size={18} color="#3B82F6" />
                </div>
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>QR Code</p>
                  <p style={{ fontSize: "11px", color: "var(--zp-text-2)", margin: "3px 0 0" }}>Show to customers</p>
                </div>
              </button>
            </div>

            <button onClick={handleUnregister}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid rgba(231,76,60,0.25)", background: "var(--zp-red-dim)", color: "var(--zp-red)", fontWeight: 600, cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Trash2 size={14} /> Unregister Merchant
            </button>
          </>
        ) : (
          <div className="zp-card" style={{ textAlign: "center", padding: "36px 24px" }}>
            <Store size={52} color="var(--zp-text-3)" style={{ margin: "0 auto 20px" }} />
            <p style={{ fontSize: "20px", fontWeight: 800, color: "var(--zp-text)", marginBottom: 8, letterSpacing: "-0.02em" }}>Become a Merchant</p>
            <p style={{ fontSize: "13px", color: "var(--zp-text-2)", marginBottom: 24, lineHeight: 1.6 }}>
              Register to accept EURC payments from ZarPay customers via QR code or wallet address
            </p>
            <div style={{ textAlign: "left", marginBottom: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Accept EURC payments instantly", "Share your QR code with customers", "Track all incoming payments", "No monthly fees"].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Check size={10} color="var(--zp-green)" />
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowRegister(true)} className="zp-btn-primary">Register as Merchant</button>
          </div>
        )}
      </div>
    </div>
  );
}
