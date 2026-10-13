import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, TrendingUp, Lock, Unlock, Info, ChevronRight, Shield, Zap } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { CURRENCY_SYMBOLS } from "@/zarpay-settings";

interface SavingsScreenProps {
  onBack: () => void;
}

const PLANS = [
  { id: "flex",    label: "Flexible",  apy: 4.2,  lockDays: 0,   minDeposit: 1,    color: "#2ECC71", icon: "💧", desc: "Withdraw anytime. Best for short-term savings." },
  { id: "30d",     label: "30 Days",   apy: 7.5,  lockDays: 30,  minDeposit: 10,   color: "#3B82F6", icon: "📅", desc: "Lock for 30 days. Higher yield, still accessible." },
  { id: "90d",     label: "90 Days",   apy: 11.0, lockDays: 90,  minDeposit: 50,   color: "#A78BFA", icon: "🔐", desc: "Lock for 90 days. Best yield for serious savers." },
  { id: "180d",    label: "180 Days",  apy: 15.5, lockDays: 180, minDeposit: 100,  color: "#F59E0B", icon: "🏆", desc: "Maximum lock. Premium yield for long-term goals." },
];

type Step = "plans" | "deposit" | "confirm" | "success" | "portfolio";

interface SavedPosition {
  planId: string;
  amount: number;
  startDate: number;
  apy: number;
  lockDays: number;
}

function loadPositions(): SavedPosition[] {
  try {
    const raw = localStorage.getItem("zarpay_savings");
    return raw ? (JSON.parse(raw) as SavedPosition[]) : [];
  } catch { return []; }
}

function savePositions(positions: SavedPosition[]) {
  try { localStorage.setItem("zarpay_savings", JSON.stringify(positions)); } catch { /* ignore */ }
}

function daysRemaining(startDate: number, lockDays: number): number {
  const elapsed = Math.floor((Date.now() - startDate) / 86400000);
  return Math.max(0, lockDays - elapsed);
}

function calcEarned(amount: number, apy: number, startDate: number): number {
  const days = Math.floor((Date.now() - startDate) / 86400000);
  return (amount * apy / 100) * (days / 365);
}

export function SavingsScreen({ onBack }: SavingsScreenProps) {
  const { address } = useAccount();
  const { usdcFormatted } = useWalletBalance(address);
  const { settings } = useZarpaySettings();
  const symbol = CURRENCY_SYMBOLS[settings.currency];

  const [step, setStep] = useState<Step>("plans");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [amount, setAmount] = useState("");
  const [positions, setPositions] = useState<SavedPosition[]>(() => loadPositions());
  const [withdrawing, setWithdrawing] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  const usdcBal = parseFloat(usdcFormatted) || 0;
  const amountNum = parseFloat(amount) || 0;
  const projectedYearly = amountNum * selectedPlan.apy / 100;
  const projectedMonthly = projectedYearly / 12;

  const totalSaved = positions.reduce((s, p) => s + p.amount, 0);
  const totalEarned = positions.reduce((s, p) => s + calcEarned(p.amount, p.apy, p.startDate), 0);

  function handleDeposit() {
    if (!amount || amountNum < selectedPlan.minDeposit || amountNum > usdcBal) return;
    setProcessing(true);
    setTimeout(() => {
      const newPos: SavedPosition = {
        planId: selectedPlan.id,
        amount: amountNum,
        startDate: Date.now(),
        apy: selectedPlan.apy,
        lockDays: selectedPlan.lockDays,
      };
      const updated = [...positions, newPos];
      setPositions(updated);
      savePositions(updated);
      setProcessing(false);
      setStep("success");
    }, 2500);
  }

  function handleWithdraw(idx: number) {
    setWithdrawing(idx);
    setTimeout(() => {
      const updated = positions.filter((_, i) => i !== idx);
      setPositions(updated);
      savePositions(updated);
      setWithdrawing(null);
    }, 2000);
  }

  const plan = selectedPlan;

  // SUCCESS
  if (step === "success") {
    return (
      <div className="zp-page">
        <div className="zp-content" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--zp-green-dim)", border: "2px solid var(--zp-green)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>
            🎉
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--zp-text)", marginBottom: 8 }}>Savings Started!</h2>
          <p style={{ color: "var(--zp-text-2)", fontSize: 14, marginBottom: 4 }}>
            {amountNum.toFixed(2)} USDC locked in {plan.label} plan
          </p>
          <p style={{ color: "var(--zp-green)", fontSize: 14, marginBottom: 32 }}>
            Earning {plan.apy}% APY
          </p>
          <div style={{ background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)", borderRadius: 16, padding: 20, width: "100%", marginBottom: 24 }}>
            {[
              { label: "Amount Saved", value: `${amountNum.toFixed(2)} USDC` },
              { label: "Plan", value: plan.label },
              { label: "APY", value: `${plan.apy}%` },
              { label: "Monthly Yield", value: `~${projectedMonthly.toFixed(4)} USDC` },
              { label: "Lock Period", value: plan.lockDays === 0 ? "Flexible" : `${plan.lockDays} days` },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? "1px solid var(--zp-border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--zp-text)" }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(46,204,113,0.08)", border: "1px solid var(--zp-green-border)", borderRadius: 12, padding: "12px 16px", width: "100%", marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: "var(--zp-text-2)" }}>
              Demo mode — no real USDC was moved. Connect Flutterwave or a yield protocol to go live.
            </p>
          </div>
          <button onClick={() => { setStep("portfolio"); setAmount(""); }} className="zp-btn-primary" style={{ width: "100%" }}>
            View My Savings
          </button>
        </div>
      </div>
    );
  }

  // CONFIRM
  if (step === "confirm") {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <button onClick={() => setStep("deposit")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--zp-text)", marginBottom: 4 }}>Confirm Savings</h1>
          <p style={{ fontSize: 13, color: "var(--zp-text-2)", marginBottom: 20 }}>Review before locking your USDC</p>

          <div className="zp-card" style={{ marginBottom: 16 }}>
            {[
              { label: "Amount", value: `${amountNum.toFixed(2)} USDC` },
              { label: "Plan", value: `${plan.icon} ${plan.label}` },
              { label: "APY", value: `${plan.apy}%` },
              { label: "Lock period", value: plan.lockDays === 0 ? "No lock" : `${plan.lockDays} days` },
              { label: "Projected monthly", value: `~${projectedMonthly.toFixed(4)} USDC` },
              { label: "Projected yearly", value: `~${projectedYearly.toFixed(4)} USDC` },
            ].map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: i < 5 ? "1px solid var(--zp-border)" : "none" }}>
                <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--zp-text)" }}>{row.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 10 }}>
            <Info size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "var(--zp-text-2)", lineHeight: 1.6 }}>
              {plan.lockDays === 0
                ? "Flexible plan — you can withdraw anytime with no penalty."
                : `Funds will be locked for ${plan.lockDays} days. Early withdrawal may incur a penalty.`}
            </p>
          </div>

          <button
            onClick={handleDeposit}
            disabled={processing}
            className="zp-btn-primary"
            style={{ width: "100%", opacity: processing ? 0.7 : 1 }}
          >
            {processing ? "Processing..." : `Lock ${amountNum.toFixed(2)} USDC`}
          </button>
        </div>
      </div>
    );
  }

  // DEPOSIT AMOUNT
  if (step === "deposit") {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <button onClick={() => setStep("plans")} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--zp-text)", marginBottom: 4 }}>{plan.icon} {plan.label} Plan</h1>
          <p style={{ fontSize: 13, color: "var(--zp-text-2)", marginBottom: 20 }}>{plan.apy}% APY · {plan.lockDays === 0 ? "No lock" : `${plan.lockDays} day lock`}</p>

          <div className="zp-card" style={{ marginBottom: 16 }}>
            <p className="zp-label">Amount to save (USDC)</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min ${plan.minDeposit} USDC`}
                className="zp-input"
                style={{ flex: 1 }}
              />
              <button
                onClick={() => setAmount(usdcBal.toFixed(2))}
                style={{ padding: "0 14px", borderRadius: 10, border: "1px solid var(--zp-border)", background: "var(--zp-surface-2)", color: "var(--zp-text-2)", fontWeight: 600, fontSize: 12, cursor: "pointer", flexShrink: 0 }}
              >
                MAX
              </button>
            </div>
            <p style={{ fontSize: 12, color: "var(--zp-text-2)" }}>Available: {usdcFormatted} USDC</p>

            {/* Quick amounts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>
              {[10, 25, 50, 100].map((v) => (
                <button key={v} onClick={() => setAmount(String(v))}
                  style={{ padding: "8px 0", borderRadius: 8, border: `1px solid ${amountNum === v ? "var(--zp-green-border)" : "var(--zp-border)"}`, background: amountNum === v ? "var(--zp-green-dim)" : "var(--zp-surface-2)", color: amountNum === v ? "var(--zp-green)" : "var(--zp-text-2)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {amountNum > 0 && (
            <div className="zp-card" style={{ marginBottom: 16 }}>
              <p className="zp-label">Projected earnings</p>
              {[
                { label: "Daily", value: `~${(amountNum * plan.apy / 100 / 365).toFixed(6)} USDC` },
                { label: "Monthly", value: `~${projectedMonthly.toFixed(4)} USDC` },
                { label: "Yearly", value: `~${projectedYearly.toFixed(4)} USDC` },
                { label: "Yearly (${symbol})", value: `~${symbol}${(projectedYearly * (plan.apy > 10 ? 1380 : 1)).toFixed(2)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--zp-border)" : "none" }}>
                  <span style={{ fontSize: 13, color: "var(--zp-text-2)" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--zp-green)" }}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setStep("confirm")}
            disabled={!amount || amountNum < plan.minDeposit || amountNum > usdcBal}
            className="zp-btn-primary"
            style={{ width: "100%", opacity: (!amount || amountNum < plan.minDeposit || amountNum > usdcBal) ? 0.5 : 1 }}
          >
            Continue
          </button>
          {amountNum > 0 && amountNum < plan.minDeposit && (
            <p style={{ fontSize: 12, color: "var(--zp-red)", textAlign: "center", marginTop: 8 }}>Minimum deposit is {plan.minDeposit} USDC</p>
          )}
        </div>
      </div>
    );
  }

  // PORTFOLIO VIEW
  if (step === "portfolio") {
    return (
      <div className="zp-page">
        <div className="zp-content">
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 8 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--zp-text)", marginBottom: 20 }}>My Savings</h1>

          {/* Summary */}
          <div style={{ background: "linear-gradient(135deg,#0D1621,#0F1E30)", border: "1px solid var(--zp-green-border)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: "var(--zp-text-2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total Saved</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: "var(--zp-text)", marginBottom: 4 }}>{totalSaved.toFixed(2)} <span style={{ fontSize: 18, color: "var(--zp-green)" }}>USDC</span></p>
            <p style={{ fontSize: 13, color: "var(--zp-green)" }}>+{totalEarned.toFixed(6)} USDC earned</p>
          </div>

          {positions.length === 0 ? (
            <div className="zp-card" style={{ textAlign: "center", padding: "40px 20px" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>💰</p>
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--zp-text)", marginBottom: 6 }}>No active savings</p>
              <p style={{ fontSize: 12, color: "var(--zp-text-2)", marginBottom: 20 }}>Start saving to earn yield on your USDC</p>
              <button onClick={() => setStep("plans")} className="zp-btn-primary" style={{ width: "auto", padding: "12px 24px" }}>Start Saving</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {positions.map((pos, i) => {
                const planInfo = PLANS.find((p) => p.id === pos.planId) ?? PLANS[0];
                const earned = calcEarned(pos.amount, pos.apy, pos.startDate);
                const daysLeft = daysRemaining(pos.startDate, pos.lockDays);
                const canWithdraw = pos.lockDays === 0 || daysLeft === 0;
                return (
                  <div key={i} className="zp-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{planInfo.icon}</span>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--zp-text)" }}>{planInfo.label}</p>
                          <p style={{ fontSize: 11, color: "var(--zp-text-2)" }}>{pos.apy}% APY</p>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: "var(--zp-text)" }}>{pos.amount.toFixed(2)} USDC</p>
                        <p style={{ fontSize: 11, color: "var(--zp-green)" }}>+{earned.toFixed(6)} earned</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {canWithdraw ? <Unlock size={13} color="var(--zp-green)" /> : <Lock size={13} color="var(--zp-text-2)" />}
                        <span style={{ fontSize: 12, color: canWithdraw ? "var(--zp-green)" : "var(--zp-text-2)" }}>
                          {canWithdraw ? "Available to withdraw" : `${daysLeft} days left`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleWithdraw(i)}
                        disabled={!canWithdraw || withdrawing === i}
                        style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid " + (canWithdraw ? "var(--zp-green-border)" : "var(--zp-border)"), background: canWithdraw ? "var(--zp-green-dim)" : "var(--zp-surface-2)", color: canWithdraw ? "var(--zp-green)" : "var(--zp-text-2)", fontSize: 12, fontWeight: 600, cursor: canWithdraw ? "pointer" : "not-allowed", opacity: withdrawing === i ? 0.6 : 1 }}
                      >
                        {withdrawing === i ? "Withdrawing..." : "Withdraw"}
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={() => setStep("plans")} className="zp-btn-secondary" style={{ width: "100%", marginTop: 8 }}>
                + Add More Savings
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // PLANS LIST (default)
  return (
    <div className="zp-page">
      <div className="zp-content">
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: 0, marginBottom: 8 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--zp-text)", marginBottom: 4 }}>ZarPay Savings</h1>
            <p style={{ fontSize: 13, color: "var(--zp-text-2)" }}>Earn yield on your USDC</p>
          </div>
          {positions.length > 0 && (
            <button onClick={() => setStep("portfolio")} style={{ background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", borderRadius: 10, padding: "8px 14px", color: "var(--zp-green)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              My Savings ({positions.length})
            </button>
          )}
        </div>

        {/* Summary strip if has positions */}
        {positions.length > 0 && (
          <div style={{ background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", borderRadius: 14, padding: "14px 16px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 11, color: "var(--zp-text-2)", marginBottom: 2 }}>Total Saved</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "var(--zp-text)" }}>{totalSaved.toFixed(2)} USDC</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 11, color: "var(--zp-text-2)", marginBottom: 2 }}>Total Earned</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: "var(--zp-green)" }}>+{totalEarned.toFixed(6)}</p>
            </div>
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PLANS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelectedPlan(p); setStep("deposit"); }}
              style={{ width: "100%", background: "var(--zp-surface)", border: `1px solid ${selectedPlan.id === p.id ? p.color + "66" : "var(--zp-border)"}`, borderRadius: 16, padding: 16, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: p.color + "22", border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                    {p.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--zp-text)" }}>{p.label}</p>
                    <p style={{ fontSize: 11, color: "var(--zp-text-2)" }}>Min {p.minDeposit} USDC</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: p.color }}>{p.apy}%</p>
                  <p style={{ fontSize: 10, color: "var(--zp-text-2)" }}>APY</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: "var(--zp-text-2)", marginBottom: 8 }}>{p.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {p.lockDays === 0
                    ? <><Zap size={12} color={p.color} /><span style={{ fontSize: 11, color: p.color }}>Flexible</span></>
                    : <><Shield size={12} color={p.color} /><span style={{ fontSize: 11, color: p.color }}>{p.lockDays} day lock</span></>
                  }
                </div>
                <ChevronRight size={16} color="var(--zp-text-2)" />
              </div>
            </button>
          ))}
        </div>

        <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
          <Info size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 12, color: "var(--zp-text-2)", lineHeight: 1.6 }}>
            Demo mode — yields are simulated. Connect to a real yield protocol (Aave, Compound, or Circle Yield) to earn real returns.
          </p>
        </div>
      </div>
    </div>
  );
}
