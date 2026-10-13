import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, Building2, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { FALLBACK_RATES } from "@/zarpay-settings";

// ── Nigerian banks ────────────────────────────────────────────────────────────
const NIGERIAN_BANKS = [
  { id: "access", name: "Access Bank", code: "044" },
  { id: "gtb", name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { id: "zenith", name: "Zenith Bank", code: "057" },
  { id: "firstbank", name: "First Bank of Nigeria", code: "011" },
  { id: "uba", name: "United Bank for Africa (UBA)", code: "033" },
  { id: "stanbic", name: "Stanbic IBTC Bank", code: "221" },
  { id: "sterling", name: "Sterling Bank", code: "232" },
  { id: "union", name: "Union Bank", code: "032" },
  { id: "fcmb", name: "FCMB", code: "214" },
  { id: "fidelity", name: "Fidelity Bank", code: "070" },
  { id: "ecobank", name: "Ecobank Nigeria", code: "050" },
  { id: "heritage", name: "Heritage Bank", code: "030" },
  { id: "keystone", name: "Keystone Bank", code: "082" },
  { id: "polaris", name: "Polaris Bank", code: "076" },
  { id: "providus", name: "Providus Bank", code: "101" },
  { id: "suntrust", name: "SunTrust Bank", code: "100" },
  { id: "titan", name: "Titan Trust Bank", code: "102" },
  { id: "wema", name: "Wema Bank", code: "035" },
  { id: "kuda", name: "Kuda Bank", code: "090267" },
  { id: "opay", name: "OPay (Paycom)", code: "100004" },
  { id: "palmpay", name: "PalmPay", code: "100033" },
  { id: "moniepoint", name: "Moniepoint MFB", code: "090405" },
  { id: "carbon", name: "Carbon (One Finance)", code: "090270" },
];

// ── USDC → NGN rate ───────────────────────────────────────────────────────────
const USDC_TO_NGN = FALLBACK_RATES["NGN"]; // 1 USDC ≈ 1 USD ≈ 1380 NGN

// ── Fake account name lookup (demo) ──────────────────────────────────────────
function fakeLookup(accountNumber: string, bankId: string): string {
  const names = ["ADEBAYO TRUST", "IBRAHIM FATIMA", "OKONKWO CHUKWUEMEKA", "BELLO AISHA", "ADELEKE SAMUEL"];
  const idx = (accountNumber.charCodeAt(0) + bankId.charCodeAt(0)) % names.length;
  return names[idx];
}

interface Props {
  onBack: () => void;
}

type Step = "form" | "verify" | "confirm" | "processing" | "success";

export function BankTransferScreen({ onBack }: Props) {
  const { address } = useAccount();
  const { settings } = useZarpaySettings();
  const { usdcFormatted } = useWalletBalance(address);

  const [step, setStep] = useState<Step>("form");
  const [bankSearch, setBankSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<(typeof NIGERIAN_BANKS)[0] | null>(null);
  const [showBankList, setShowBankList] = useState(false);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState(""); // in NGN
  const [narration, setNarration] = useState("");
  const [isLooking, setIsLooking] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [txRef] = useState(() => "ZPB-" + Math.random().toString(36).slice(2, 9).toUpperCase());

  const usdcBalance = parseFloat(usdcFormatted) || 0;
  const ngnAmount = parseFloat(amount) || 0;
  const usdcRequired = ngnAmount / USDC_TO_NGN;
  const fee = usdcRequired * 0.015; // 1.5% fee
  const usdcTotal = usdcRequired + fee;
  const hasEnough = usdcTotal <= usdcBalance;

  const filteredBanks = NIGERIAN_BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  // Auto-lookup when 10 digits entered
  function handleAccountNumber(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 10);
    setAccountNumber(clean);
    setLookupDone(false);
    setAccountName("");
    if (clean.length === 10 && selectedBank) {
      setIsLooking(true);
      setTimeout(() => {
        setAccountName(fakeLookup(clean, selectedBank.id));
        setIsLooking(false);
        setLookupDone(true);
      }, 1200);
    }
  }

  function handleSelectBank(bank: typeof NIGERIAN_BANKS[0]) {
    setSelectedBank(bank);
    setShowBankList(false);
    setBankSearch("");
    setLookupDone(false);
    setAccountName("");
    if (accountNumber.length === 10) {
      setIsLooking(true);
      setTimeout(() => {
        setAccountName(fakeLookup(accountNumber, bank.id));
        setIsLooking(false);
        setLookupDone(true);
      }, 1200);
    }
  }

  function handleContinue() {
    if (!selectedBank || accountNumber.length < 10 || !lookupDone || !amount || !hasEnough) return;
    setStep("confirm");
  }

  function handleConfirm() {
    setStep("processing");
    setTimeout(() => setStep("success"), 3000);
  }

  function handleReset() {
    setStep("form");
    setSelectedBank(null);
    setAccountNumber("");
    setAccountName("");
    setAmount("");
    setNarration("");
    setLookupDone(false);
    setBankSearch("");
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="zp-page">
        <div className="zp-content" style={{ alignItems: "center", justifyContent: "center", minHeight: "70vh", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--zp-green-dim)", border: "2px solid var(--zp-green-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={36} color="var(--zp-green)" />
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Transfer Initiated!</p>
            <p style={{ fontSize: "13px", color: "var(--zp-text-2)", marginTop: 6 }}>
              ₦{ngnAmount.toLocaleString()} to {accountName}
            </p>
          </div>
          <div style={{ width: "100%", background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 16, padding: "20px" }}>
            {[
              ["Bank", selectedBank?.name ?? ""],
              ["Account", accountNumber],
              ["Account Name", accountName],
              ["Amount", `₦${ngnAmount.toLocaleString()}`],
              ["USDC Deducted", `${usdcTotal.toFixed(4)} USDC`],
              ["Reference", txRef],
              ["Status", "Processing"],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 6 ? "1px solid var(--zp-border)" : "none" }}>
                <span style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>{label}</span>
                <span style={{ fontSize: "13px", color: label === "Status" ? "var(--zp-amber)" : "var(--zp-text)", fontWeight: 600 }}>{value}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Clock size={14} color="var(--zp-amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>
              Demo mode — no real funds moved. With Flutterwave live, transfers settle in 2–5 minutes.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <button onClick={handleReset} className="zp-btn-secondary" style={{ flex: 1 }}>New Transfer</button>
            <button onClick={onBack} className="zp-btn-primary" style={{ flex: 1 }}>Done</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing ────────────────────────────────────────────────────────────
  if (step === "processing") {
    return (
      <div className="zp-page">
        <div className="zp-content" style={{ alignItems: "center", justifyContent: "center", minHeight: "70vh", display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="zp-spinner" style={{ width: 48, height: 48 }} />
          <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--zp-text)" }}>Processing Transfer...</p>
          <p style={{ fontSize: "13px", color: "var(--zp-text-2)", textAlign: "center" }}>
            Converting {usdcTotal.toFixed(4)} USDC → ₦{ngnAmount.toLocaleString()} and routing to {selectedBank?.name}
          </p>
        </div>
      </div>
    );
  }

  // ── Confirm ───────────────────────────────────────────────────────────────
  if (step === "confirm") {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <button onClick={() => setStep("form")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--zp-text-2)", padding: 4 }}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Confirm Transfer</h1>
          </div>

          <div style={{ background: "linear-gradient(135deg, #0D1621, #0F1E30)", border: "1px solid var(--zp-green-border)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: "13px", color: "var(--zp-text-2)", marginBottom: 8 }}>You are sending</p>
            <p style={{ fontSize: "36px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>
              ₦{ngnAmount.toLocaleString()}
            </p>
            <p style={{ fontSize: "13px", color: "var(--zp-green)", marginTop: 4 }}>≈ {usdcRequired.toFixed(4)} USDC</p>
          </div>

          <div style={{ background: "var(--zp-surface)", border: "1px solid var(--zp-border)", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            {[
              ["To", accountName],
              ["Bank", selectedBank?.name ?? ""],
              ["Account Number", accountNumber],
              ["Amount", `₦${ngnAmount.toLocaleString()}`],
              ["USDC equivalent", `${usdcRequired.toFixed(4)} USDC`],
              ["Fee (1.5%)", `${fee.toFixed(4)} USDC`],
              ["Total USDC", `${usdcTotal.toFixed(4)} USDC`],
              ...(narration ? [["Narration", narration]] : []),
            ].map(([label, value], i, arr) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--zp-border)" : "none" }}>
                <span style={{ fontSize: "13px", color: "var(--zp-text-2)" }}>{label}</span>
                <span style={{ fontSize: "13px", color: label === "Total USDC" ? "var(--zp-green)" : "var(--zp-text)", fontWeight: label === "Total USDC" ? 700 : 500 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(240,165,0,0.08)", border: "1px solid rgba(240,165,0,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
            <AlertCircle size={14} color="var(--zp-amber)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>
              Demo mode — no real USDC will be deducted. Connect Flutterwave to go live.
            </p>
          </div>

          <button onClick={handleConfirm} className="zp-btn-primary">
            Confirm — Send ₦{ngnAmount.toLocaleString()}
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="zp-page">
      <div className="zp-content">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--zp-text-2)", padding: 4 }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>Bank Transfer</h1>
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)", marginTop: 2 }}>Send NGN to any Nigerian bank</p>
          </div>
        </div>

        {/* Balance pill */}
        <div style={{ background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>Available USDC</span>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--zp-green)" }}>{usdcBalance.toFixed(2)} USDC</span>
        </div>

        {/* Bank selector */}
        <div className="zp-card" style={{ marginBottom: 0 }}>
          <p className="zp-label">Select Bank</p>
          <button
            onClick={() => setShowBankList(!showBankList)}
            style={{ width: "100%", background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Building2 size={16} color="var(--zp-text-2)" />
              <span style={{ fontSize: "14px", color: selectedBank ? "var(--zp-text)" : "var(--zp-text-3)", fontWeight: selectedBank ? 600 : 400 }}>
                {selectedBank ? selectedBank.name : "Choose a bank..."}
              </span>
            </div>
            <ChevronRight size={16} color="var(--zp-text-3)" style={{ transform: showBankList ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
          </button>

          {showBankList && (
            <div style={{ marginTop: 8, background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--zp-border)" }}>
                <input
                  type="text"
                  placeholder="Search banks..."
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                  className="zp-input"
                  style={{ margin: 0 }}
                  autoFocus
                />
              </div>
              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                {filteredBanks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => handleSelectBank(bank)}
                    style={{ width: "100%", background: selectedBank?.id === bank.id ? "var(--zp-green-dim)" : "none", border: "none", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderBottom: "1px solid var(--zp-border)" }}
                  >
                    <span style={{ fontSize: "14px", color: "var(--zp-text)", fontWeight: selectedBank?.id === bank.id ? 700 : 400 }}>{bank.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--zp-text-3)", fontFamily: "monospace" }}>{bank.code}</span>
                  </button>
                ))}
                {filteredBanks.length === 0 && (
                  <p style={{ padding: "16px", fontSize: "13px", color: "var(--zp-text-2)", textAlign: "center" }}>No banks found</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Account number */}
        <div className="zp-card" style={{ marginBottom: 0 }}>
          <p className="zp-label">Account Number</p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 10-digit account number"
            value={accountNumber}
            onChange={e => handleAccountNumber(e.target.value)}
            className="zp-input"
            style={{ fontFamily: "monospace", letterSpacing: "0.1em", fontSize: "18px" }}
          />
          {isLooking && (
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)", marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="zp-spinner" style={{ width: 12, height: 12 }} /> Looking up account...
            </p>
          )}
          {lookupDone && accountName && (
            <div style={{ marginTop: 10, background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={14} color="var(--zp-green)" />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--zp-green)" }}>{accountName}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="zp-card" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <p className="zp-label" style={{ margin: 0 }}>Amount (NGN)</p>
          </div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="₦0.00"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="zp-input"
            style={{ fontSize: "28px", fontWeight: 800 }}
          />
          {ngnAmount > 0 && (
            <div style={{ marginTop: 10, background: "var(--zp-surface-2)", borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>USDC required</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--zp-text)" }}>{usdcRequired.toFixed(4)} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>Fee (1.5%)</span>
                <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>{fee.toFixed(4)} USDC</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--zp-border)", paddingTop: 6, marginTop: 2 }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--zp-text)" }}>Total</span>
                <span style={{ fontSize: "12px", fontWeight: 700, color: hasEnough ? "var(--zp-green)" : "var(--zp-red)" }}>
                  {usdcTotal.toFixed(4)} USDC {!hasEnough && "(insufficient)"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Narration */}
        <div className="zp-card">
          <p className="zp-label">Narration (optional)</p>
          <input
            type="text"
            placeholder="What is this payment for?"
            value={narration}
            onChange={e => setNarration(e.target.value.slice(0, 50))}
            className="zp-input"
          />
        </div>

        {/* Rate info */}
        <div style={{ background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>Rate</span>
          <span style={{ fontSize: "12px", color: "var(--zp-text)", fontFamily: "monospace" }}>1 USDC ≈ ₦{USDC_TO_NGN.toLocaleString()}</span>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedBank || accountNumber.length < 10 || !lookupDone || !amount || !hasEnough}
          className="zp-btn-primary"
          style={{ opacity: (!selectedBank || accountNumber.length < 10 || !lookupDone || !amount || !hasEnough) ? 0.5 : 1 }}
        >
          {!selectedBank ? "Select a bank" :
           accountNumber.length < 10 ? "Enter account number" :
           !lookupDone ? "Looking up account..." :
           !amount ? "Enter amount" :
           !hasEnough ? "Insufficient USDC" :
           `Continue — Send ₦${ngnAmount.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
