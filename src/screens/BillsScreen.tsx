"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, Smartphone, Wifi, Zap, Tv, CheckCircle, Loader } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "airtime" | "data" | "electricity" | "cable";

interface Provider {
  id: string;
  name: string;
  logo: string;
  category: Category;
}

interface BillsScreenProps {
  onBack: () => void;
}

// ─── Nigerian Providers ───────────────────────────────────────────────────────

const PROVIDERS: Provider[] = [
  // Airtime
  { id: "mtn", name: "MTN", logo: "📶", category: "airtime" },
  { id: "airtel", name: "Airtel", logo: "📡", category: "airtime" },
  { id: "glo", name: "Glo", logo: "🌐", category: "airtime" },
  { id: "9mobile", name: "9mobile", logo: "📲", category: "airtime" },
  // Data
  { id: "mtn-data", name: "MTN Data", logo: "📶", category: "data" },
  { id: "airtel-data", name: "Airtel Data", logo: "📡", category: "data" },
  { id: "glo-data", name: "Glo Data", logo: "🌐", category: "data" },
  { id: "9mobile-data", name: "9mobile Data", logo: "📲", category: "data" },
  // Electricity
  { id: "ekedc", name: "EKEDC (Eko)", logo: "⚡", category: "electricity" },
  { id: "ikedc", name: "IKEDC (Ikeja)", logo: "⚡", category: "electricity" },
  { id: "aedc", name: "AEDC (Abuja)", logo: "⚡", category: "electricity" },
  { id: "phedc", name: "PHEDC (PH)", logo: "⚡", category: "electricity" },
  { id: "kedco", name: "KEDCO (Kano)", logo: "⚡", category: "electricity" },
  { id: "bedc", name: "BEDC (Benin)", logo: "⚡", category: "electricity" },
  // Cable TV
  { id: "dstv", name: "DSTV", logo: "📺", category: "cable" },
  { id: "gotv", name: "GOtv", logo: "📺", category: "cable" },
  { id: "startimes", name: "Startimes", logo: "📺", category: "cable" },
];

const CATEGORIES: { id: Category; label: string; Icon: React.ElementType; color: string; tint: string }[] = [
  { id: "airtime", label: "Airtime", Icon: Smartphone, color: "#2ECC71", tint: "rgba(46,204,113,0.12)" },
  { id: "data", label: "Data", Icon: Wifi, color: "#3B82F6", tint: "rgba(59,130,246,0.12)" },
  { id: "electricity", label: "Electricity", Icon: Zap, color: "#F0A500", tint: "rgba(240,165,0,0.12)" },
  { id: "cable", label: "Cable TV", Icon: Tv, color: "#A78BFA", tint: "rgba(167,139,250,0.12)" },
];

// Data bundles for MTN (demo)
const DATA_BUNDLES: Record<string, { label: string; price: number; validity: string }[]> = {
  "mtn-data": [
    { label: "500MB", price: 300, validity: "1 day" },
    { label: "1GB", price: 500, validity: "1 day" },
    { label: "2GB", price: 1000, validity: "30 days" },
    { label: "5GB", price: 2000, validity: "30 days" },
    { label: "10GB", price: 3500, validity: "30 days" },
  ],
  "airtel-data": [
    { label: "500MB", price: 300, validity: "1 day" },
    { label: "1.5GB", price: 500, validity: "30 days" },
    { label: "3GB", price: 1000, validity: "30 days" },
    { label: "6GB", price: 2000, validity: "30 days" },
    { label: "15GB", price: 3500, validity: "30 days" },
  ],
  "glo-data": [
    { label: "1GB", price: 500, validity: "30 days" },
    { label: "2GB", price: 1000, validity: "30 days" },
    { label: "5GB", price: 2000, validity: "30 days" },
    { label: "10GB", price: 3000, validity: "30 days" },
  ],
  "9mobile-data": [
    { label: "500MB", price: 300, validity: "30 days" },
    { label: "1GB", price: 500, validity: "30 days" },
    { label: "2GB", price: 1000, validity: "30 days" },
    { label: "5GB", price: 2000, validity: "30 days" },
  ],
};

// Cable TV plans
const CABLE_PLANS: Record<string, { label: string; price: number }[]> = {
  dstv: [
    { label: "Padi (N2,500)", price: 2500 },
    { label: "Yanga (N3,500)", price: 3500 },
    { label: "Confam (N6,200)", price: 6200 },
    { label: "Compact (N12,500)", price: 12500 },
    { label: "Compact Plus (N18,600)", price: 18600 },
    { label: "Premium (N29,500)", price: 29500 },
  ],
  gotv: [
    { label: "Smallie (N1,575)", price: 1575 },
    { label: "Jinja (N2,715)", price: 2715 },
    { label: "Jolli (N4,085)", price: 4085 },
    { label: "Max (N5,500)", price: 5500 },
    { label: "Supa (N7,200)", price: 7200 },
  ],
  startimes: [
    { label: "Nova (N900)", price: 900 },
    { label: "Basic (N2,200)", price: 2200 },
    { label: "Smart (N3,100)", price: 3100 },
    { label: "Classic (N4,200)", price: 4200 },
    { label: "Super (N6,200)", price: 6200 },
  ],
};

const NGN_RATE = 1580; // demo rate: 1 USDC = 1580 NGN

function ngnToUsdc(ngn: number): string {
  return (ngn / NGN_RATE).toFixed(4);
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function BillsScreen({ onBack }: BillsScreenProps) {
  const { address } = useAccount();
  const { usdcFormatted } = useWalletBalance(address);
  const { settings } = useZarpaySettings();
  const isDark = settings.theme === "dark";

  const [category, setCategory] = useState<Category | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [meterNumber, setMeterNumber] = useState("");
  const [smartCard, setSmartCard] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [step, setStep] = useState<"category" | "provider" | "details" | "confirm" | "processing" | "success">("category");
  const [txRef] = useState(() => "ZP-" + Math.random().toString(36).slice(2, 10).toUpperCase());

  const providers = category ? PROVIDERS.filter(p => p.category === category) : [];
  const bundles = provider ? DATA_BUNDLES[provider.id] ?? [] : [];
  const plans = provider ? CABLE_PLANS[provider.id] ?? [] : [];

  const ngnAmount = (() => {
    if (category === "airtime") return Number(amount) || 0;
    if (category === "data" && selectedBundle !== null) return bundles[selectedBundle]?.price ?? 0;
    if (category === "electricity") return Number(amount) || 0;
    if (category === "cable" && selectedPlan !== null) return plans[selectedPlan]?.price ?? 0;
    return 0;
  })();

  const usdcAmount = ngnToUsdc(ngnAmount);
  const usdcBalance = parseFloat(usdcFormatted) || 0;
  const canAfford = usdcBalance >= parseFloat(usdcAmount);

  const recipientRef = (() => {
    if (category === "airtime" || category === "data") return phoneNumber;
    if (category === "electricity") return meterNumber;
    if (category === "cable") return smartCard;
    return "";
  })();

  function handleConfirm() {
    setStep("processing");
    // Simulate processing delay (demo mode)
    setTimeout(() => setStep("success"), 2500);
  }

  function reset() {
    setCategory(null); setProvider(null); setPhoneNumber(""); setMeterNumber("");
    setSmartCard(""); setAmount(""); setSelectedBundle(null); setSelectedPlan(null);
    setStep("category");
  }

  // ── Category Selection ────────────────────────────────────────────────────
  if (step === "category") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em", margin: 0 }}>Utility Bills</h1>
            <p style={{ fontSize: 13, color: "var(--zp-text-2)", margin: 0 }}>Nigeria — pay with USDC</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {CATEGORIES.map(({ id, label, Icon, color, tint }) => (
            <button key={id} onClick={() => { setCategory(id); setStep("provider"); }}
              style={{ background: isDark ? "var(--zp-surface)" : "#fff", border: `1px solid var(--zp-border)`, borderRadius: 16, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, cursor: "pointer", textAlign: "left", transition: "border-color 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: tint, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>{label}</p>
                <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: "3px 0 0" }}>
                  {id === "airtime" && "Top up any network"}
                  {id === "data" && "Buy data bundles"}
                  {id === "electricity" && "Pay electricity bill"}
                  {id === "cable" && "DSTV, GOtv, Startimes"}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--zp-green-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={16} color="var(--zp-green)" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--zp-text)", margin: 0 }}>Pay bills with USDC</p>
            <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: "2px 0 0" }}>1 USDC = ₦{NGN_RATE.toLocaleString()} · Balance: {usdcFormatted} USDC</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Provider Selection ────────────────────────────────────────────────────
  if (step === "provider") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setStep("category")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--zp-text)", margin: 0 }}>
              {CATEGORIES.find(c => c.id === category)?.label}
            </h1>
            <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: 0 }}>Select a provider</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {providers.map(p => (
            <button key={p.id} onClick={() => { setProvider(p); setStep("details"); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", background: isDark ? "var(--zp-surface)" : "#fff", border: "1px solid var(--zp-border)", borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "border-color 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--zp-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {p.logo}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>{p.name}</p>
                <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: "2px 0 0" }}>
                  {category === "airtime" && "Top up " + p.name + " number"}
                  {category === "data" && p.name + " data bundles"}
                  {category === "electricity" && "Prepaid & postpaid"}
                  {category === "cable" && "Subscription renewal"}
                </p>
              </div>
              <span style={{ color: "var(--zp-text-3)", fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Details Entry ─────────────────────────────────────────────────────────
  if (step === "details") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setStep("provider")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{provider?.logo}</span>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--zp-text)", margin: 0 }}>{provider?.name}</h1>
              <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: 0 }}>
                {category === "airtime" && "Airtime top-up"}
                {category === "data" && "Data bundle"}
                {category === "electricity" && "Electricity"}
                {category === "cable" && "Cable TV"}
              </p>
            </div>
          </div>
        </div>

        {/* Phone / Meter / Smartcard input */}
        <div className="zp-card">
          <p className="zp-label">
            {(category === "airtime" || category === "data") && "Phone Number"}
            {category === "electricity" && "Meter Number"}
            {category === "cable" && "Smart Card / IUC Number"}
          </p>
          <input
            type={category === "airtime" || category === "data" ? "tel" : "text"}
            placeholder={
              category === "airtime" || category === "data" ? "e.g. 08012345678" :
              category === "electricity" ? "e.g. 45067890123" : "e.g. 7042134852"
            }
            value={category === "electricity" ? meterNumber : category === "cable" ? smartCard : phoneNumber}
            onChange={e => {
              if (category === "electricity") setMeterNumber(e.target.value);
              else if (category === "cable") setSmartCard(e.target.value);
              else setPhoneNumber(e.target.value);
            }}
            className="zp-input"
            style={{ fontSize: 18, fontWeight: 700, letterSpacing: "0.05em" }}
          />
        </div>

        {/* Amount input for airtime and electricity */}
        {(category === "airtime" || category === "electricity") && (
          <div className="zp-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <p className="zp-label" style={{ margin: 0 }}>Amount (NGN)</p>
              {ngnAmount > 0 && (
                <span style={{ fontSize: 12, color: "var(--zp-green)", fontWeight: 600 }}>≈ {usdcAmount} USDC</span>
              )}
            </div>
            {category === "airtime" ? (
              <>
                <input type="number" placeholder="Enter amount in NGN" value={amount} onChange={e => setAmount(e.target.value)}
                  className="zp-input" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[100, 200, 500, 1000, 2000].map(v => (
                    <button key={v} onClick={() => setAmount(v.toString())}
                      style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${amount === v.toString() ? "var(--zp-green-border)" : "var(--zp-border)"}`, background: amount === v.toString() ? "var(--zp-green-dim)" : "var(--zp-surface-2)", color: amount === v.toString() ? "var(--zp-green)" : "var(--zp-text-2)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      ₦{v}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <input type="number" placeholder="Enter amount in NGN" value={amount} onChange={e => setAmount(e.target.value)}
                  className="zp-input" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1000, 2000, 5000, 10000, 20000].map(v => (
                    <button key={v} onClick={() => setAmount(v.toString())}
                      style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${amount === v.toString() ? "var(--zp-green-border)" : "var(--zp-border)"}`, background: amount === v.toString() ? "var(--zp-green-dim)" : "var(--zp-surface-2)", color: amount === v.toString() ? "var(--zp-green)" : "var(--zp-text-2)", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                      ₦{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Data bundles */}
        {category === "data" && bundles.length > 0 && (
          <div className="zp-card">
            <p className="zp-label">Select Bundle</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {bundles.map((b, i) => (
                <button key={i} onClick={() => setSelectedBundle(i)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: 12, border: `1px solid ${selectedBundle === i ? "var(--zp-green-border)" : "var(--zp-border)"}`, background: selectedBundle === i ? "var(--zp-green-dim)" : "var(--zp-surface-2)", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: selectedBundle === i ? "var(--zp-green)" : "var(--zp-text)", margin: 0 }}>{b.label}</p>
                    <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: "2px 0 0" }}>Valid for {b.validity}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: selectedBundle === i ? "var(--zp-green)" : "var(--zp-text)", margin: 0 }}>₦{b.price.toLocaleString()}</p>
                    <p style={{ fontSize: 11, color: "var(--zp-text-2)", margin: "2px 0 0" }}>{ngnToUsdc(b.price)} USDC</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cable plans */}
        {category === "cable" && plans.length > 0 && (
          <div className="zp-card">
            <p className="zp-label">Select Plan</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plans.map((p, i) => (
                <button key={i} onClick={() => setSelectedPlan(i)}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px", borderRadius: 12, border: `1px solid ${selectedPlan === i ? "var(--zp-green-border)" : "var(--zp-border)"}`, background: selectedPlan === i ? "var(--zp-green-dim)" : "var(--zp-surface-2)", cursor: "pointer", transition: "all 0.15s" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: selectedPlan === i ? "var(--zp-green)" : "var(--zp-text)", margin: 0 }}>{p.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: selectedPlan === i ? "var(--zp-green)" : "var(--zp-text)", margin: 0 }}>{ngnToUsdc(p.price)} USDC</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setStep("confirm")}
          disabled={
            !recipientRef ||
            (category === "airtime" && !amount) ||
            (category === "electricity" && !amount) ||
            (category === "data" && selectedBundle === null) ||
            (category === "cable" && selectedPlan === null) ||
            ngnAmount === 0
          }
          className="zp-btn-primary"
          style={{ opacity: ngnAmount > 0 && recipientRef ? 1 : 0.4 }}
        >
          {ngnAmount > 0 ? `Continue — ${usdcAmount} USDC` : "Continue"}
        </button>
      </div>
    </div>
  );

  // ── Confirm ───────────────────────────────────────────────────────────────
  if (step === "confirm") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setStep("details")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4, display: "flex" }}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "var(--zp-text)", margin: 0 }}>Confirm Payment</h1>
        </div>

        <div className="zp-card" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { label: "Provider", value: provider?.name ?? "" },
            { label: "Service", value: category === "airtime" ? "Airtime Top-up" : category === "data" ? (selectedBundle !== null ? bundles[selectedBundle]?.label + " Data" : "") : category === "electricity" ? "Electricity Token" : (selectedPlan !== null ? plans[selectedPlan]?.label : "") },
            { label: category === "electricity" ? "Meter Number" : category === "cable" ? "Smart Card" : "Phone Number", value: recipientRef },
            { label: "Amount (NGN)", value: "₦" + ngnAmount.toLocaleString() },
            { label: "Amount (USDC)", value: usdcAmount + " USDC" },
            { label: "Rate", value: "1 USDC = ₦" + NGN_RATE.toLocaleString() },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--zp-border)" : "none" }}>
              <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--zp-text)", fontFamily: "monospace" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {!canAfford && (
          <div style={{ background: "var(--zp-red-dim)", border: "1px solid rgba(231,76,60,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
            <p style={{ fontSize: 13, color: "var(--zp-red)", margin: 0, fontWeight: 600 }}>
              Insufficient USDC balance. You need {usdcAmount} USDC but have {usdcFormatted} USDC.
            </p>
          </div>
        )}

        <div style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: 0 }}>
            Demo mode: no real transaction will occur. When Flutterwave is connected, USDC will be deducted from your wallet and the bill delivered instantly.
          </p>
        </div>

        <button onClick={handleConfirm} disabled={!canAfford} className="zp-btn-primary" style={{ opacity: canAfford ? 1 : 0.4 }}>
          Confirm Payment
        </button>
      </div>
    </div>
  );

  // ── Processing ────────────────────────────────────────────────────────────
  if (step === "processing") return (
    <div className="zp-page">
      <div className="zp-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader size={32} color="var(--zp-green)" style={{ animation: "spin 1s linear infinite" }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 18, fontWeight: 800, color: "var(--zp-text)", margin: 0 }}>Processing Payment</p>
          <p style={{ fontSize: 13, color: "var(--zp-text-2)", marginTop: 6 }}>Delivering {provider?.name} {category === "airtime" ? "airtime" : category === "data" ? "data" : category === "electricity" ? "electricity token" : "subscription"}...</p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === "success") return (
    <div className="zp-page">
      <div className="zp-content" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--zp-green-dim)", border: "2px solid var(--zp-green-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={40} color="var(--zp-green)" />
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 24, fontWeight: 800, color: "var(--zp-text)", margin: 0, letterSpacing: "-0.02em" }}>Payment Successful!</p>
          <p style={{ fontSize: 14, color: "var(--zp-text-2)", marginTop: 8 }}>
            {category === "airtime" && `₦${ngnAmount.toLocaleString()} airtime sent to ${recipientRef}`}
            {category === "data" && `${bundles[selectedBundle!]?.label} data sent to ${recipientRef}`}
            {category === "electricity" && `₦${ngnAmount.toLocaleString()} electricity token sent to meter ${recipientRef}`}
            {category === "cable" && `${plans[selectedPlan!]?.label} subscription renewed for ${recipientRef}`}
          </p>
        </div>

        <div className="zp-card" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { label: "Provider", value: provider?.name ?? "" },
            { label: "Reference", value: txRef },
            { label: "Amount Paid", value: usdcAmount + " USDC" },
            { label: "NGN Value", value: "₦" + ngnAmount.toLocaleString() },
            { label: "Status", value: "Delivered ✓" },
          ].map((row, i, arr) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--zp-border)" : "none" }}>
              <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: i === arr.length - 1 ? "var(--zp-green)" : "var(--zp-text)", fontFamily: "monospace" }}>{row.value}</span>
            </div>
          ))}
        </div>

        <button onClick={reset} className="zp-btn-primary">Pay Another Bill</button>
        <button onClick={onBack} style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid var(--zp-border)", background: "none", color: "var(--zp-text-2)", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          Back to Services
        </button>
      </div>
    </div>
  );

  return null;
}
