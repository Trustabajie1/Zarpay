const fs = require('fs');

// 1. UPDATE BOTTOMNAV — add Exchange tab
const bottomNav = `"use client";
import { useRouter, usePathname } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { t } from "@/lib/translations";
export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { settings } = useAppSettings();
  const tr = t(settings.language ?? "English");
  const tabs = [
    { label: tr.home || "Home", icon: "⌂", path: "/dashboard" },
    { label: "Swap", icon: "⇄", path: "/swap" },
    { label: "Services", icon: "❋", path: "/exchange" },
    { label: tr.wallet || "Wallet", icon: "◎", path: "/wallet" },
    { label: tr.settings || "Settings", icon: "⚙", path: "/settings" },
  ];
  const isDark = settings.theme === "dark";
  const navBg = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#d1d5db";
  const inactive = isDark ? "#4b5563" : "#6b7280";
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: navBg, borderTop: \`1px solid \${border}\`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0 20px", zIndex: 100, transition: "all 0.3s ease" }}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || pathname.startsWith(tab.path + "/");
        return (
          <button key={tab.path} onClick={() => router.push(tab.path)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", background: "none", border: "none", cursor: "pointer", padding: "4px 12px", position: "relative" }}>
            {isActive && <span style={{ position: "absolute", top: "-10px", width: "20px", height: "3px", background: "#4ade80", borderRadius: "2px" }} />}
            <span style={{ fontSize: "20px", color: isActive ? "#4ade80" : inactive }}>{tab.icon}</span>
            <span style={{ fontSize: "10px", fontWeight: "600", color: isActive ? "#4ade80" : inactive, fontFamily: "monospace" }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}`;

// 2. EXCHANGE HUB PAGE
const exchangeHub = `"use client";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";

const SERVICES = [
  { label: "Deposit", sub: "Buy crypto with NGN", icon: "📥", path: "/exchange/deposit", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
  { label: "Withdraw", sub: "Cash out to bank", icon: "🏦", path: "/exchange/withdraw", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
  { label: "Utility Bills", sub: "Pay bills & services", icon: "⚡", path: "/exchange/utility", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  { label: "Bank Accounts", sub: "Manage your banks", icon: "🏛️", path: "/exchange/banks", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
];

export default function ExchangePage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", marginBottom: "28px" }}>
        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>Financial Services</h1>
        <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>Deposits, withdrawals, bills and more</p>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {SERVICES.map((s) => (
          <button key={s.path} onClick={() => router.push(s.path)}
            style={{ background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: s.bg, border: \`1px solid \${s.border}\`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
              {s.icon}
            </div>
            <div>
              <p style={{ color: text, fontWeight: "700", fontSize: "15px", margin: 0 }}>{s.label}</p>
              <p style={{ color: subText, fontSize: "11px", margin: "4px 0 0" }}>{s.sub}</p>
            </div>
          </button>
        ))}
      </div>

      <div style={{ width: "100%", maxWidth: "440px", marginTop: "16px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "16px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "16px" }}>🔒</span>
        <p style={{ color: subText, fontSize: "12px", margin: 0 }}>All transactions are self-custodial. ZarPay never holds your funds.</p>
      </div>

      <BottomNav />
    </main>
  );
}`;

// 3. DEPOSIT PAGE
const depositPage = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";

const BANKS = ["Access Bank", "GTBank", "First Bank", "Zenith Bank", "UBA", "Kuda Bank", "Opay", "Palmpay"];
const AMOUNTS = ["1,000", "2,000", "5,000", "10,000", "20,000", "50,000"];

export default function DepositPage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [step, setStep] = useState<"form"|"pending"|"success">("form");

  function handleDeposit() {
    if (!amount || !bank) return;
    setStep("pending");
    setTimeout(() => setStep("success"), 2500);
  }

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: text, fontSize: "20px", cursor: "pointer" }}>←</button>
        <h1 style={{ color: text, fontSize: "20px", fontWeight: "700" }}>Deposit NGN</h1>
        <div style={{ marginLeft: "auto", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
          <span style={{ color: "#4ade80", fontSize: "11px" }}>Demo Mode</span>
        </div>
      </div>

      {step === "form" && (
        <>
          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Amount (NGN)</p>
            <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, fontSize: "18px", fontWeight: "700", boxSizing: "border-box" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "12px" }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a.replace(",",""))}
                  style={{ padding: "10px", borderRadius: "10px", border: \`1px solid \${border}\`, background: amount === a.replace(",","") ? "rgba(74,222,128,0.1)" : inputBg, color: text, cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                  ₦{a}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Select Bank</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {BANKS.map(b => (
                <button key={b} onClick={() => setBank(b)}
                  style={{ padding: "14px", borderRadius: "12px", border: \`1px solid \${bank === b ? "rgba(74,222,128,0.4)" : border}\`, background: bank === b ? "rgba(74,222,128,0.08)" : inputBg, color: text, cursor: "pointer", textAlign: "left", fontWeight: bank === b ? "700" : "400", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {b}
                  {bank === b && <span style={{ color: "#4ade80" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "16px", padding: "16px", marginBottom: "16px" }}>
            {[
              { label: "You pay", value: amount ? \`₦\${Number(amount).toLocaleString()}\` : "--" },
              { label: "You receive (est.)", value: amount ? \`\${(Number(amount) / 1650).toFixed(2)} USDC\` : "--" },
              { label: "Rate", value: "₦1,650 = 1 USDC" },
              { label: "Status", value: "🟡 Demo Mode" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: i < 3 ? \`1px solid \${border}\` : "none" }}>
                <span style={{ color: subText, fontSize: "13px" }}>{row.label}</span>
                <span style={{ color: text, fontSize: "13px", fontWeight: "600" }}>{row.value}</span>
              </div>
            ))}
          </div>

          <button onClick={handleDeposit} disabled={!amount || !bank}
            style={{ width: "100%", maxWidth: "440px", padding: "18px", borderRadius: "16px", border: "none", background: !amount || !bank ? "#1f2937" : "#4ade80", color: !amount || !bank ? "#4b5563" : "#111", fontWeight: "700", fontSize: "16px", cursor: !amount || !bank ? "not-allowed" : "pointer" }}>
            {!amount ? "Enter amount" : !bank ? "Select a bank" : "Deposit NGN"}
          </button>
        </>
      )}

      {step === "pending" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: \`4px solid \${border}\`, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ color: text, fontWeight: "700", fontSize: "16px" }}>Processing Deposit...</p>
          <p style={{ color: subText, fontSize: "12px" }}>Demo mode — simulating bank transfer</p>
        </div>
      )}

      {step === "success" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>✓</div>
          <p style={{ color: text, fontWeight: "700", fontSize: "20px" }}>Deposit Initiated!</p>
          <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>₦{Number(amount).toLocaleString()} via {bank}</p>
          <p style={{ color: "#f59e0b", fontSize: "12px", textAlign: "center" }}>🟡 This is a demo — no real funds were moved</p>
          <button onClick={() => { setStep("form"); setAmount(""); setBank(""); }}
            style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>
            New Deposit
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}`;

// 4. WITHDRAW PAGE
const withdrawPage = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";

const BANKS = ["Access Bank", "GTBank", "First Bank", "Zenith Bank", "UBA", "Kuda Bank", "Opay", "Palmpay"];
const AMOUNTS = ["10", "20", "50", "100", "200", "500"];

export default function WithdrawPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [step, setStep] = useState<"form"|"confirm"|"pending"|"success">("form");

  function handleVerifyAccount() {
    if (accountNumber.length === 10) setAccountName("John Doe (Demo)");
  }

  function handleWithdraw() {
    setStep("pending");
    setTimeout(() => setStep("success"), 3000);
  }

  const ngnAmount = amount ? (Number(amount) * 1650).toLocaleString() : "--";

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: text, fontSize: "20px", cursor: "pointer" }}>←</button>
        <h1 style={{ color: text, fontSize: "20px", fontWeight: "700" }}>Withdraw to Bank</h1>
        <div style={{ marginLeft: "auto", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
          <span style={{ color: "#f59e0b", fontSize: "11px" }}>Demo Mode</span>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "14px", padding: "14px 18px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: subText, fontSize: "13px" }}>Available USDC</span>
        <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "13px" }}>{usdcFormatted} USDC</span>
      </div>

      {step === "form" && (
        <>
          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Amount (USDC)</p>
            <input type="number" placeholder="Enter USDC amount" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, fontSize: "18px", fontWeight: "700", boxSizing: "border-box" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px", marginTop: "12px" }}>
              {AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(a)}
                  style={{ padding: "10px", borderRadius: "10px", border: \`1px solid \${border}\`, background: amount === a ? "rgba(74,222,128,0.1)" : inputBg, color: text, cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                  {a} USDC
                </button>
              ))}
            </div>
            {amount && <p style={{ color: "#4ade80", fontSize: "13px", marginTop: "10px", textAlign: "right" }}>≈ ₦{ngnAmount}</p>}
          </div>

          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Bank Details</p>
            <select value={bank} onChange={e => setBank(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, marginBottom: "12px", boxSizing: "border-box" }}>
              <option value="">Select bank</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="text" placeholder="Account number (10 digits)" value={accountNumber}
              onChange={e => { setAccountNumber(e.target.value); setAccountName(""); }}
              onBlur={handleVerifyAccount} maxLength={10}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, marginBottom: "8px", boxSizing: "border-box" }} />
            {accountName && <p style={{ color: "#4ade80", fontSize: "13px", fontWeight: "600" }}>✓ {accountName}</p>}
          </div>

          <button onClick={() => setStep("confirm")} disabled={!amount || !bank || accountNumber.length < 10}
            style={{ width: "100%", maxWidth: "440px", padding: "18px", borderRadius: "16px", border: "none", background: !amount || !bank || accountNumber.length < 10 ? "#1f2937" : "#4ade80", color: !amount || !bank || accountNumber.length < 10 ? "#4b5563" : "#111", fontWeight: "700", fontSize: "16px", cursor: !amount || !bank || accountNumber.length < 10 ? "not-allowed" : "pointer" }}>
            Continue
          </button>
        </>
      )}

      {step === "confirm" && (
        <>
          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
            <p style={{ color: text, fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>Confirm Withdrawal</p>
            {[
              { label: "Amount", value: \`\${amount} USDC\` },
              { label: "You receive", value: \`₦\${ngnAmount}\` },
              { label: "Bank", value: bank },
              { label: "Account", value: accountNumber },
              { label: "Name", value: accountName },
              { label: "Rate", value: "1 USDC = ₦1,650" },
              { label: "Status", value: "🟡 Demo Mode" },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", marginBottom: "10px", borderBottom: i < 6 ? \`1px solid \${border}\` : "none" }}>
                <span style={{ color: subText, fontSize: "13px" }}>{row.label}</span>
                <span style={{ color: text, fontSize: "13px", fontWeight: "600" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ width: "100%", maxWidth: "440px", display: "flex", gap: "12px" }}>
            <button onClick={() => setStep("form")} style={{ flex: 1, padding: "16px", borderRadius: "14px", border: \`1px solid \${border}\`, background: "transparent", color: text, fontWeight: "700", cursor: "pointer" }}>Back</button>
            <button onClick={handleWithdraw} style={{ flex: 2, padding: "16px", borderRadius: "14px", border: "none", background: "#4ade80", color: "#111", fontWeight: "700", cursor: "pointer" }}>Confirm Withdrawal</button>
          </div>
        </>
      )}

      {step === "pending" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: \`4px solid \${border}\`, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ color: text, fontWeight: "700" }}>Processing Withdrawal...</p>
          <p style={{ color: subText, fontSize: "12px" }}>Demo mode — simulating bank transfer</p>
        </div>
      )}

      {step === "success" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>✓</div>
          <p style={{ color: text, fontWeight: "700", fontSize: "20px" }}>Withdrawal Initiated!</p>
          <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>{amount} USDC → ₦{ngnAmount} to {bank}</p>
          <p style={{ color: "#f59e0b", fontSize: "12px", textAlign: "center" }}>🟡 This is a demo — no real funds were moved</p>
          <button onClick={() => { setStep("form"); setAmount(""); setBank(""); setAccountNumber(""); setAccountName(""); }}
            style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>
            New Withdrawal
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}`;

// 5. UTILITY HUB PAGE
const utilityHub = `"use client";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";

const UTILITIES = [
  { label: "Airtime", icon: "📱", path: "/exchange/utility/airtime", color: "#4ade80", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
  { label: "Electricity", icon: "⚡", path: "/exchange/utility/electricity", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  { label: "Data", icon: "📶", path: "/exchange/utility/data", color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
  { label: "TV", icon: "📺", path: "/exchange/utility/tv", color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)" },
  { label: "Internet", icon: "🌐", path: "/exchange/utility/internet", color: "#34d399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.2)" },
  { label: "Water", icon: "💧", path: "/exchange/utility/water", color: "#38bdf8", bg: "rgba(56,189,248,0.08)", border: "rgba(56,189,248,0.2)" },
];

export default function UtilityPage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: text, fontSize: "20px", cursor: "pointer" }}>←</button>
        <h1 style={{ color: text, fontSize: "20px", fontWeight: "700" }}>Utility Bills</h1>
        <div style={{ marginLeft: "auto", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
          <span style={{ color: "#f59e0b", fontSize: "11px" }}>Demo Mode</span>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {UTILITIES.map((u) => (
          <button key={u.path} onClick={() => router.push(u.path)}
            style={{ background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: u.bg, border: \`1px solid \${u.border}\`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
              {u.icon}
            </div>
            <p style={{ color: text, fontWeight: "700", fontSize: "15px", margin: 0 }}>{u.label}</p>
          </button>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}`;

// 6. GENERIC UTILITY PAYMENT PAGE (used by all utility sub-pages)
const utilityPayPage = (title, icon, providers) => \`"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";

export default function ${title.replace(/\s/g,"")}Page() {
  const router = useRouter();
  const { address } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState("form");

  function handlePay() {
    if (!provider || !reference || !amount) return;
    setStep("pending");
    setTimeout(() => setStep("success"), 2500);
  }

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: text, fontSize: "20px", cursor: "pointer" }}>←</button>
        <h1 style={{ color: text, fontSize: "20px", fontWeight: "700" }}>${icon} ${title}</h1>
        <div style={{ marginLeft: "auto", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "8px", padding: "4px 10px" }}>
          <span style={{ color: "#f59e0b", fontSize: "11px" }}>Demo</span>
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "14px", padding: "14px 18px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ color: subText, fontSize: "13px" }}>Available USDC</span>
        <span style={{ color: "#4ade80", fontWeight: "700", fontSize: "13px" }}>{usdcFormatted} USDC</span>
      </div>

      {step === "form" && (
        <>
          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \\\`1px solid \\\${border}\\\`, borderRadius: "20px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Provider</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {${JSON.stringify(providers)}.map(p => (
                <button key={p} onClick={() => setProvider(p)}
                  style={{ padding: "14px", borderRadius: "12px", border: \\\`1px solid \\\${provider === p ? "rgba(74,222,128,0.4)" : border}\\\`, background: provider === p ? "rgba(74,222,128,0.08)" : inputBg, color: text, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                  {p} {provider === p && <span style={{ color: "#4ade80" }}>✓</span>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: "100%", maxWidth: "440px", background: card, border: \\\`1px solid \\\${border}\\\`, borderRadius: "20px", padding: "20px", marginBottom: "12px" }}>
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Reference / Number</p>
            <input type="text" placeholder="Enter meter/phone/account number" value={reference} onChange={e => setReference(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \\\`1px solid \\\${border}\\\`, background: inputBg, color: text, boxSizing: "border-box", marginBottom: "12px" }} />
            <p style={{ color: subText, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Amount (USDC)</p>
            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \\\`1px solid \\\${border}\\\`, background: inputBg, color: text, boxSizing: "border-box" }} />
          </div>

          <button onClick={handlePay} disabled={!provider || !reference || !amount}
            style={{ width: "100%", maxWidth: "440px", padding: "18px", borderRadius: "16px", border: "none", background: !provider || !reference || !amount ? "#1f2937" : "#4ade80", color: !provider || !reference || !amount ? "#4b5563" : "#111", fontWeight: "700", fontSize: "16px", cursor: !provider || !reference || !amount ? "not-allowed" : "pointer" }}>
            Pay ${title}
          </button>
        </>
      )}

      {step === "pending" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: \\\`1px solid \\\${border}\\\`, borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: \\\`4px solid \\\${border}\\\`, borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ color: text, fontWeight: "700" }}>Processing Payment...</p>
          <p style={{ color: subText, fontSize: "12px" }}>Demo mode</p>
        </div>
      )}

      {step === "success" && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: "1px solid rgba(74,222,128,0.3)", borderRadius: "20px", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>✓</div>
          <p style={{ color: text, fontWeight: "700", fontSize: "20px" }}>Payment Successful!</p>
          <p style={{ color: subText, fontSize: "13px", textAlign: "center" }}>{provider} — {reference}</p>
          <p style={{ color: "#f59e0b", fontSize: "12px", textAlign: "center" }}>🟡 Demo — no real payment was made</p>
          <button onClick={() => { setStep("form"); setProvider(""); setReference(""); setAmount(""); }}
            style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>
            New Payment
          </button>
        </div>
      )}

      <BottomNav />
    </main>
  );
}\`;

// 7. BANKS PAGE
const banksPage = `"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";

const BANKS = ["Access Bank", "GTBank", "First Bank", "Zenith Bank", "UBA", "Kuda Bank", "Opay", "Palmpay"];

export default function BanksPage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";

  const [savedBanks, setSavedBanks] = useState([
    { bank: "GTBank", account: "0123456789", name: "John Doe" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");

  function handleAdd() {
    if (!bank || !account || !name) return;
    setSavedBanks([...savedBanks, { bank, account, name }]);
    setBank(""); setAccount(""); setName(""); setShowForm(false);
  }

  function handleRemove(i: number) {
    setSavedBanks(savedBanks.filter((_, idx) => idx !== i));
  }

  return (
    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "440px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: text, fontSize: "20px", cursor: "pointer" }}>←</button>
        <h1 style={{ color: text, fontSize: "20px", fontWeight: "700" }}>Bank Accounts</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ marginLeft: "auto", background: "#4ade80", border: "none", color: "#111", fontWeight: "700", fontSize: "13px", borderRadius: "10px", padding: "8px 14px", cursor: "pointer" }}>
          + Add Bank
        </button>
      </div>

      {showForm && (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "20px", marginBottom: "16px" }}>
          <p style={{ color: text, fontWeight: "700", marginBottom: "16px" }}>Add Bank Account</p>
          <select value={bank} onChange={e => setBank(e.target.value)}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, marginBottom: "12px", boxSizing: "border-box" }}>
            <option value="">Select bank</option>
            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)} maxLength={10}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, marginBottom: "12px", boxSizing: "border-box" }} />
          <input type="text" placeholder="Account name" value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: inputBg, color: text, marginBottom: "16px", boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: "14px", borderRadius: "12px", border: \`1px solid \${border}\`, background: "transparent", color: text, cursor: "pointer", fontWeight: "600" }}>Cancel</button>
            <button onClick={handleAdd} disabled={!bank || !account || !name}
              style={{ flex: 2, padding: "14px", borderRadius: "12px", border: "none", background: !bank || !account || !name ? "#1f2937" : "#4ade80", color: !bank || !account || !name ? "#4b5563" : "#111", fontWeight: "700", cursor: !bank || !account || !name ? "not-allowed" : "pointer" }}>
              Save Account
            </button>
          </div>
        </div>
      )}

      {savedBanks.length === 0 ? (
        <div style={{ width: "100%", maxWidth: "440px", background: card, border: \`1px solid \${border}\`, borderRadius: "20px", padding: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🏦</p>
          <p style={{ color: text, fontWeight: "700" }}>No bank accounts yet</p>
          <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>Add a bank account to enable withdrawals</p>
        </div>
      ) : (
        <div style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {savedBanks.map((b, i) => (
            <div key={i} style={{ background: card, border: \`1px solid \${border}\`, borderRadius: "16px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ color: text, fontWeight: "700", margin: 0 }}>{b.bank}</p>
                <p style={{ color: "#4ade80", fontSize: "13px", fontFamily: "monospace", margin: "4px 0 0" }}>{b.account}</p>
                <p style={{ color: subText, fontSize: "12px", margin: "2px 0 0" }}>{b.name}</p>
              </div>
              <button onClick={() => handleRemove(i)} style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171", borderRadius: "10px", padding: "8px 12px", cursor: "pointer", fontSize: "13px" }}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}`;

// Write all files
fs.mkdirSync('components', { recursive: true });
fs.writeFileSync('components/BottomNav.tsx', bottomNav);
console.log('✅ BottomNav updated');

fs.writeFileSync('app/exchange/page.tsx', exchangeHub);
console.log('✅ Exchange hub written');

fs.mkdirSync('app/exchange/deposit', { recursive: true });
fs.writeFileSync('app/exchange/deposit/page.tsx', depositPage);
console.log('✅ Deposit page written');

fs.mkdirSync('app/exchange/withdraw', { recursive: true });
fs.writeFileSync('app/exchange/withdraw/page.tsx', withdrawPage);
console.log('✅ Withdraw page written');

fs.mkdirSync('app/exchange/utility', { recursive: true });
fs.writeFileSync('app/exchange/utility/page.tsx', utilityHub);
console.log('✅ Utility hub written');

fs.mkdirSync('app/exchange/banks', { recursive: true });
fs.writeFileSync('app/exchange/banks/page.tsx', banksPage);
console.log('✅ Banks page written');

// Write all utility sub-pages
const utilities = [
  { title: 'Airtime', icon: '📱', folder: 'airtime', providers: ['MTN', 'Airtel', 'Glo', '9mobile'] },
  { title: 'Electricity', icon: '⚡', folder: 'electricity', providers: ['EKEDC', 'IKEDC', 'AEDC', 'PHEDC', 'EEDC'] },
  { title: 'Data', icon: '📶', folder: 'data', providers: ['MTN Data', 'Airtel Data', 'Glo Data', '9mobile Data'] },
  { title: 'TV', icon: '📺', folder: 'tv', providers: ['DSTV', 'GOtv', 'Startimes', 'NTA'] },
  { title: 'Internet', icon: '🌐', folder: 'internet', providers: ['Spectranet', 'Smile', 'Swift', 'ipNX'] },
  { title: 'Water', icon: '💧', folder: 'water', providers: ['Lagos Water', 'Abuja Water', 'Rivers Water'] },
];

utilities.forEach(u => {
  fs.mkdirSync(\`app/exchange/utility/\${u.folder}\`, { recursive: true });
  fs.writeFileSync(\`app/exchange/utility/\${u.folder}/page.tsx\`, utilityPayPage(u.title, u.icon, u.providers));
  console.log(\`✅ \${u.title} page written\`);
});

console.log('\n🎉 All files written successfully!');