import { useState } from "react";
import { Building2, Plus, Trash2, CheckCircle2, ChevronRight, AlertCircle, Copy, Check } from "lucide-react";

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  addedAt: number;
}

const BANKS = [
  "Access Bank", "First Bank", "GTBank", "Zenith Bank", "UBA",
  "Stanbic IBTC", "FCMB", "Fidelity Bank", "Union Bank", "Sterling Bank",
  "Wema Bank", "Polaris Bank", "Keystone Bank", "Heritage Bank", "Providus Bank",
  "Kuda Bank", "OPay", "PalmPay", "Moniepoint", "Carbon",
  "VFD Microfinance Bank", "Rubies Bank", "Sparkle Bank",
];

const STORAGE_KEY = "zarpay_bank_accounts";

function loadAccounts(): BankAccount[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function saveAccounts(accounts: BankAccount[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

type Step = "list" | "add" | "verify";

export function BankAccountScreen({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(loadAccounts);
  const [step, setStep] = useState<Step>("list");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  function handleVerify() {
    if (accountNumber.length !== 10) { setError("Account number must be 10 digits"); return; }
    if (!bank) { setError("Please select a bank"); return; }
    setError("");
    setVerifying(true);
    // Demo: simulate name lookup
    setTimeout(() => {
      const names = ["ADEWALE TRUST BABAJIDE", "CHIOMA OKONKWO NWOSU", "EMEKA CHUKWU OKAFOR", "FATIMA ABDULLAHI MUSA", "OLUWASEUN JAMES ADEYEMI"];
      setAccountName(names[Math.floor(Math.random() * names.length)]);
      setVerifying(false);
      setStep("verify");
    }, 1500);
  }

  function handleAddAccount() {
    const newAccount: BankAccount = {
      id: Date.now().toString(),
      bankName: bank,
      accountNumber,
      accountName,
      isDefault: accounts.length === 0,
      addedAt: Date.now(),
    };
    const updated = [...accounts, newAccount];
    setAccounts(updated);
    saveAccounts(updated);
    setStep("list");
    setBank(""); setAccountNumber(""); setAccountName("");
  }

  function handleDelete(id: string) {
    const updated = accounts.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    setAccounts(updated);
    saveAccounts(updated);
  }

  function handleSetDefault(id: string) {
    const updated = accounts.map((a) => ({ ...a, isDefault: a.id === id }));
    setAccounts(updated);
    saveAccounts(updated);
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  // Add Account Form
  if (step === "add") {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => setStep("list")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", fontSize: 20 }}>←</button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Add Bank Account</h1>
          </div>

          <div className="zp-card">
            <p className="zp-label">Select Bank</p>
            <select
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="zp-input"
              style={{ marginBottom: 16, appearance: "none", cursor: "pointer" }}
            >
              <option value="">Choose your bank...</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <p className="zp-label">Account Number</p>
            <input
              type="tel"
              maxLength={10}
              placeholder="10-digit account number"
              value={accountNumber}
              onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, "")); setError(""); }}
              className="zp-input"
              style={{ marginBottom: 4 }}
            />
            <p style={{ fontSize: 11, color: "var(--zp-text-2)", marginBottom: 16, textAlign: "right" }}>{accountNumber.length}/10</p>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16 }}>
                <AlertCircle size={14} color="#EF4444" />
                <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={verifying || accountNumber.length !== 10 || !bank}
              className="zp-btn-primary"
              style={{ opacity: (verifying || accountNumber.length !== 10 || !bank) ? 0.5 : 1 }}
            >
              {verifying ? "Verifying account..." : "Verify Account"}
            </button>
          </div>

          <div className="zp-card" style={{ background: "rgba(46,204,113,0.05)", border: "1px solid rgba(46,204,113,0.15)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <AlertCircle size={14} color="var(--zp-green)" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: 0, lineHeight: 1.5 }}>
                Your bank account is used for withdrawals only. ZarPay never stores your banking credentials. Account name lookup is powered by Flutterwave.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verify Step
  if (step === "verify") {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <button onClick={() => setStep("add")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", fontSize: 20 }}>←</button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Confirm Account</h1>
          </div>

          <div className="zp-card" style={{ textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <CheckCircle2 size={28} color="var(--zp-green)" />
            </div>
            <p style={{ fontSize: 13, color: "var(--zp-text-2)", marginBottom: 20 }}>Account verified successfully</p>

            {[
              { label: "Bank", value: bank },
              { label: "Account Number", value: accountNumber },
              { label: "Account Name", value: accountName },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 2 ? "1px solid var(--zp-border)" : "none", textAlign: "left" }}>
                <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--zp-text)" }}>{item.value}</span>
              </div>
            ))}

            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={handleAddAccount} className="zp-btn-primary">
                Add Account
              </button>
              <button onClick={() => setStep("add")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", fontSize: 14, cursor: "pointer", padding: 8 }}>
                Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Account List
  return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", fontSize: 20 }}>←</button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Bank Accounts</h1>
          </div>
          <button onClick={() => setStep("add")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={14} /> Add
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="zp-card" style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ width: 60, height: 60, borderRadius: 20, background: "var(--zp-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Building2 size={28} color="var(--zp-text-2)" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--zp-text)", marginBottom: 8 }}>No bank accounts yet</p>
            <p style={{ fontSize: 13, color: "var(--zp-text-2)", marginBottom: 20 }}>Add a Nigerian bank account to withdraw your USDC as NGN</p>
            <button onClick={() => setStep("add")} className="zp-btn-primary">
              Add Bank Account
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {accounts.map((acc) => (
              <div key={acc.id} className="zp-card" style={{ border: acc.isDefault ? "1px solid rgba(46,204,113,0.3)" : "1px solid var(--zp-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: acc.isDefault ? "rgba(46,204,113,0.1)" : "var(--zp-surface-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Building2 size={18} color={acc.isDefault ? "var(--zp-green)" : "var(--zp-text-2)"} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>{acc.bankName}</p>
                      {acc.isDefault && <span style={{ fontSize: 10, color: "var(--zp-green)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Default</span>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(acc.id)} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>

                {[
                  { label: "Account Number", value: acc.accountNumber },
                  { label: "Account Name", value: acc.accountName },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: "1px solid var(--zp-border)" }}>
                    <span style={{ fontSize: 12, color: "var(--zp-text-2)" }}>{item.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--zp-text)", fontFamily: "var(--font-mono)" }}>{item.value}</span>
                      <button onClick={() => handleCopy(item.value, acc.id + i)} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 2 }}>
                        {copied === acc.id + i ? <Check size={12} color="var(--zp-green)" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                ))}

                {!acc.isDefault && (
                  <button onClick={() => handleSetDefault(acc.id)} style={{ marginTop: 12, width: "100%", padding: "8px", borderRadius: 8, border: "1px solid var(--zp-border)", background: "none", color: "var(--zp-text-2)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Set as Default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="zp-card" style={{ marginTop: 8, background: "rgba(46,204,113,0.03)", border: "1px solid rgba(46,204,113,0.1)" }}>
          <p style={{ fontSize: 12, color: "var(--zp-text-2)", margin: 0, lineHeight: 1.6 }}>
            Bank accounts are saved on your device. When you make a withdrawal, your USDC is converted to NGN at the live rate and sent to your default account. Powered by Flutterwave (coming soon).
          </p>
        </div>
      </div>
    </div>
  );
}
