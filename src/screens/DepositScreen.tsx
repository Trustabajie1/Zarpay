import { useState } from "react";
import { useAccount } from "wagmi";
import { ArrowLeft, Copy, CheckCircle2, Clock, Info, ChevronDown } from "lucide-react";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { useZarpaySettings } from "@/hooks/useZarpaySettings";
import { FALLBACK_RATES } from "@/zarpay-settings";

// ── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "bank_transfer", label: "Bank Transfer", sub: "Pay via Nigerian bank transfer", icon: "🏦", eta: "5–15 mins" },
  { id: "card",         label: "Debit Card",    sub: "Visa / Mastercard / Verve",      icon: "💳", eta: "Instant" },
  { id: "ussd",         label: "USSD",          sub: "Dial a code on your phone",      icon: "📱", eta: "2–5 mins" },
];

// ── Quick NGN amounts ─────────────────────────────────────────────────────────
const QUICK_AMOUNTS = [5000, 10000, 20000, 50000, 100000];

// ── Demo bank account (ZarPay virtual account) ─────────────────────────────
const DEMO_VIRTUAL_ACCOUNT = {
  bankName:      "Providus Bank",
  accountNumber: "9912345678",
  accountName:   "ZARPAY / FLUTTERWAVE",
  reference:     "",
};

interface Props { onBack: () => void; }

export function DepositScreen({ onBack }: Props) {
  const { address } = useAccount();
  const { settings } = useZarpaySettings();
  const { usdcFormatted, refetch } = useWalletBalance(address);

  const [step, setStep]           = useState<"amount" | "method" | "paying" | "processing" | "success">("amount");
  const [ngnAmount, setNgnAmount] = useState("");
  const [method, setMethod]       = useState<string | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);
  const [txRef]                   = useState(() => "ZP-DEP-" + Math.random().toString(36).slice(2, 9).toUpperCase());

  const NGN_RATE  = FALLBACK_RATES["NGN"];   // ₦1,380 per USD
  const FEE_PCT   = 1.5;                     // 1.5% deposit fee
  const ngnNum    = parseFloat(ngnAmount.replace(/,/g, "")) || 0;
  const usdcNet   = ngnNum > 0 ? (ngnNum / NGN_RATE) * (1 - FEE_PCT / 100) : 0;
  const feeNgn    = ngnNum * (FEE_PCT / 100);
  const usdcGross = ngnNum / NGN_RATE;

  const isDark    = settings.theme === "dark";
  const surface   = isDark ? "var(--zp-surface)"   : "#ffffff";
  const surface2  = isDark ? "var(--zp-surface-2)" : "#f8fafc";
  const border    = isDark ? "var(--zp-border)"    : "#e2e8f0";

  function formatNgn(val: string) {
    const digits = val.replace(/\D/g, "");
    return digits ? Number(digits).toLocaleString("en") : "";
  }

  function handleNgnInput(raw: string) {
    setNgnAmount(formatNgn(raw));
  }

  function handleCopy(text: string, key: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleConfirm() {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
      void refetch();
    }, 3000);
  }

  const virtualAccount = { ...DEMO_VIRTUAL_ACCOUNT, reference: txRef };

  // ── Amount step ─────────────────────────────────────────────────────────────
  if (step === "amount") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={onBack} style={{ background:"var(--zp-surface-2)", border:"1px solid var(--zp-border)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <ArrowLeft size={18} color="var(--zp-text)" />
          </button>
          <div>
            <h1 style={{ fontSize:"20px", fontWeight:800, color:"var(--zp-text)", letterSpacing:"-0.02em" }}>Deposit</h1>
            <p style={{ fontSize:"12px", color:"var(--zp-text-2)" }}>Buy USDC with Nigerian Naira</p>
          </div>
        </div>

        {/* Demo notice */}
        <div style={{ background:"rgba(240,165,0,0.1)", border:"1px solid rgba(240,165,0,0.3)", borderRadius:10, padding:"10px 14px", display:"flex", gap:10, alignItems:"flex-start", marginBottom:16 }}>
          <Info size={14} color="var(--zp-amber)" style={{ flexShrink:0, marginTop:1 }} />
          <p style={{ fontSize:"12px", color:"var(--zp-amber)", lineHeight:1.5 }}>
            Demo mode — no real money moves. Connect Flutterwave to go live.
          </p>
        </div>

        {/* Current balance */}
        <div style={{ background:"var(--zp-green-dim)", border:"1px solid var(--zp-green-border)", borderRadius:14, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:"13px", color:"var(--zp-text-2)" }}>Current USDC balance</span>
          <span style={{ fontSize:"15px", fontWeight:700, color:"var(--zp-green)" }}>{usdcFormatted} USDC</span>
        </div>

        {/* Amount input */}
        <div style={{ background:surface, border:`1px solid ${border}`, borderRadius:16, padding:"20px", marginBottom:14 }}>
          <p style={{ fontSize:"11px", color:"var(--zp-text-2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Amount (NGN)</p>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <span style={{ fontSize:"28px", fontWeight:800, color:"var(--zp-text-2)" }}>₦</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={ngnAmount}
              onChange={e => handleNgnInput(e.target.value)}
              style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:"32px", fontWeight:800, color:"var(--zp-text)", width:"100%" }}
            />
          </div>

          {/* Quick amounts */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {QUICK_AMOUNTS.map(amt => (
              <button key={amt} onClick={() => setNgnAmount(amt.toLocaleString("en"))}
                style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${border}`, background:surface2, color:"var(--zp-text-2)", fontSize:"12px", fontWeight:600, cursor:"pointer" }}>
                ₦{(amt/1000).toFixed(0)}k
              </button>
            ))}
          </div>
        </div>

        {/* Conversion preview */}
        {ngnNum > 0 && (
          <div style={{ background:surface, border:`1px solid ${border}`, borderRadius:14, padding:"16px", marginBottom:14 }}>
            <p style={{ fontSize:"11px", color:"var(--zp-text-2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Breakdown</p>
            {[
              { label:"You pay",           value:`₦${ngnNum.toLocaleString("en")}`,                        bold:false },
              { label:"Gross USDC",        value:`${usdcGross.toFixed(4)} USDC`,                            bold:false },
              { label:`Fee (${FEE_PCT}%)`, value:`–₦${feeNgn.toLocaleString("en", { maximumFractionDigits:0 })}`, bold:false },
              { label:"Rate",              value:`₦${NGN_RATE.toLocaleString("en")} / USDC`,                bold:false },
            ].map(({ label, value, bold }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:"13px", color:"var(--zp-text-2)" }}>{label}</span>
                <span style={{ fontSize:"13px", fontWeight:bold ? 700 : 500, color:"var(--zp-text)" }}>{value}</span>
              </div>
            ))}
            <div style={{ borderTop:`1px solid ${border}`, paddingTop:10, marginTop:4, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:"14px", fontWeight:700, color:"var(--zp-text)" }}>You receive</span>
              <span style={{ fontSize:"14px", fontWeight:800, color:"var(--zp-green)" }}>{usdcNet.toFixed(4)} USDC</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setStep("method")}
          disabled={ngnNum < 500}
          className="zp-btn-primary"
          style={{ opacity: ngnNum < 500 ? 0.4 : 1 }}
        >
          {ngnNum < 500 ? "Minimum ₦500" : `Continue — Receive ${usdcNet.toFixed(4)} USDC`}
        </button>
      </div>
    </div>
  );

  // ── Payment method step ──────────────────────────────────────────────────────
  if (step === "method") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => setStep("amount")} style={{ background:"var(--zp-surface-2)", border:"1px solid var(--zp-border)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <ArrowLeft size={18} color="var(--zp-text)" />
          </button>
          <div>
            <h1 style={{ fontSize:"20px", fontWeight:800, color:"var(--zp-text)", letterSpacing:"-0.02em" }}>Payment Method</h1>
            <p style={{ fontSize:"12px", color:"var(--zp-text-2)" }}>How do you want to pay?</p>
          </div>
        </div>

        {/* Summary bar */}
        <div style={{ background:"var(--zp-green-dim)", border:"1px solid var(--zp-green-border)", borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:"13px", color:"var(--zp-text-2)" }}>₦{ngnNum.toLocaleString("en")} → {usdcNet.toFixed(4)} USDC</span>
          <button onClick={() => setStep("amount")} style={{ fontSize:"12px", color:"var(--zp-green)", background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Edit</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {PAYMENT_METHODS.map(pm => (
            <button key={pm.id}
              onClick={() => { setMethod(pm.id); setStep("paying"); }}
              style={{ background:surface, border:`1px solid ${method===pm.id ? "var(--zp-green-border)" : border}`, borderRadius:14, padding:"16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}>
              <div style={{ width:44, height:44, borderRadius:12, background:surface2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>
                {pm.icon}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:"15px", fontWeight:700, color:"var(--zp-text)", margin:0 }}>{pm.label}</p>
                <p style={{ fontSize:"12px", color:"var(--zp-text-2)", margin:"3px 0 0" }}>{pm.sub}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ fontSize:"11px", color:"var(--zp-text-3)", margin:0 }}>ETA</p>
                <p style={{ fontSize:"12px", fontWeight:600, color:"var(--zp-green)", margin:"2px 0 0" }}>{pm.eta}</p>
              </div>
              <ChevronDown size={16} color="var(--zp-text-3)" style={{ transform:"rotate(-90deg)" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Paying step (virtual account details) ────────────────────────────────────
  if (step === "paying") return (
    <div className="zp-page">
      <div className="zp-content">
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={() => setStep("method")} style={{ background:"var(--zp-surface-2)", border:"1px solid var(--zp-border)", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <ArrowLeft size={18} color="var(--zp-text)" />
          </button>
          <div>
            <h1 style={{ fontSize:"20px", fontWeight:800, color:"var(--zp-text)", letterSpacing:"-0.02em" }}>
              {method === "bank_transfer" ? "Bank Transfer Details" : method === "card" ? "Card Payment" : "USSD Payment"}
            </h1>
            <p style={{ fontSize:"12px", color:"var(--zp-text-2)" }}>Complete payment to receive USDC</p>
          </div>
        </div>

        {/* Timer */}
        <div style={{ background:"rgba(240,165,0,0.1)", border:"1px solid rgba(240,165,0,0.25)", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <Clock size={14} color="var(--zp-amber)" />
          <p style={{ fontSize:"12px", color:"var(--zp-amber)" }}>This order expires in <strong>30 minutes</strong>. Send the exact amount.</p>
        </div>

        {method === "bank_transfer" && (
          <>
            <div style={{ background:surface, border:`1px solid ${border}`, borderRadius:16, padding:"20px", marginBottom:14 }}>
              <p style={{ fontSize:"11px", color:"var(--zp-text-2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Transfer to this account</p>
              {[
                { label:"Bank",           value:virtualAccount.bankName,      key:"bank" },
                { label:"Account Number", value:virtualAccount.accountNumber, key:"acct" },
                { label:"Account Name",   value:virtualAccount.accountName,   key:"name" },
                { label:"Amount (exact)", value:`₦${ngnNum.toLocaleString("en")}`, key:"amt" },
                { label:"Reference",      value:virtualAccount.reference,     key:"ref" },
              ].map(({ label, value, key }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${border}` }}>
                  <span style={{ fontSize:"12px", color:"var(--zp-text-2)" }}>{label}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:"13px", fontWeight:600, color:"var(--zp-text)", fontFamily: key==="acct"||key==="ref" ? "monospace" : "inherit" }}>{value}</span>
                    {(key==="acct"||key==="ref"||key==="amt") && (
                      <button onClick={() => handleCopy(value, key)} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                        {copied===key ? <CheckCircle2 size={14} color="var(--zp-green)" /> : <Copy size={14} color="var(--zp-text-3)" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <p style={{ fontSize:"11px", color:"var(--zp-text-3)", textAlign:"center", marginBottom:16 }}>
              After transfer, tap "I've Paid" — USDC will be credited within 5–15 minutes.
            </p>
          </>
        )}

        {method === "card" && (
          <div style={{ background:surface, border:`1px solid ${border}`, borderRadius:16, padding:"24px", marginBottom:14, textAlign:"center" }}>
            <div style={{ fontSize:"48px", marginBottom:12 }}>💳</div>
            <p style={{ fontSize:"16px", fontWeight:700, color:"var(--zp-text)", marginBottom:8 }}>Card Checkout</p>
            <p style={{ fontSize:"13px", color:"var(--zp-text-2)", marginBottom:20, lineHeight:1.6 }}>
              In live mode, a Flutterwave card checkout popup will appear here. You'll pay ₦{ngnNum.toLocaleString("en")} and receive {usdcNet.toFixed(4)} USDC instantly.
            </p>
            <div style={{ background:surface2, borderRadius:10, padding:"12px", fontSize:"12px", color:"var(--zp-text-3)" }}>
              Demo mode — tap "I've Paid" to simulate
            </div>
          </div>
        )}

        {method === "ussd" && (
          <div style={{ background:surface, border:`1px solid ${border}`, borderRadius:16, padding:"24px", marginBottom:14 }}>
            <p style={{ fontSize:"11px", color:"var(--zp-text-2)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Dial on your phone</p>
            {[
              { bank:"GTBank",       code:`*737*${ngnNum}*${txRef}#` },
              { bank:"Access Bank",  code:`*901*${ngnNum}*${txRef}#` },
              { bank:"Zenith Bank",  code:`*966*${ngnNum}*${txRef}#` },
              { bank:"First Bank",   code:`*894*${ngnNum}*${txRef}#` },
            ].map(({ bank, code }) => (
              <div key={bank} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${border}` }}>
                <span style={{ fontSize:"12px", color:"var(--zp-text-2)" }}>{bank}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:"12px", fontWeight:600, color:"var(--zp-text)", fontFamily:"monospace" }}>{code}</span>
                  <button onClick={() => handleCopy(code, bank)} style={{ background:"none", border:"none", cursor:"pointer" }}>
                    {copied===bank ? <CheckCircle2 size={14} color="var(--zp-green)" /> : <Copy size={14} color="var(--zp-text-3)" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleConfirm} className="zp-btn-primary">
          I've Paid — Confirm ₦{ngnNum.toLocaleString("en")}
        </button>
      </div>
    </div>
  );

  // ── Processing step ──────────────────────────────────────────────────────────
  if (step === "processing") return (
    <div className="zp-page" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center", padding:"40px 24px" }}>
        <div className="zp-spinner" style={{ margin:"0 auto 24px" }} />
        <p style={{ fontSize:"18px", fontWeight:700, color:"var(--zp-text)", marginBottom:8 }}>Processing Deposit</p>
        <p style={{ fontSize:"13px", color:"var(--zp-text-2)" }}>Confirming payment and crediting USDC...</p>
      </div>
    </div>
  );

  // ── Success step ─────────────────────────────────────────────────────────────
  return (
    <div className="zp-page">
      <div className="zp-content" style={{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:40 }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:"var(--zp-green-dim)", border:"2px solid var(--zp-green-border)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
          <CheckCircle2 size={36} color="var(--zp-green)" />
        </div>
        <h2 style={{ fontSize:"24px", fontWeight:800, color:"var(--zp-text)", marginBottom:8, letterSpacing:"-0.02em" }}>Deposit Successful!</h2>
        <p style={{ fontSize:"14px", color:"var(--zp-text-2)", marginBottom:24, textAlign:"center" }}>
          {usdcNet.toFixed(4)} USDC has been credited to your wallet
        </p>

        <div style={{ width:"100%", background:surface, border:`1px solid ${border}`, borderRadius:16, padding:"20px", marginBottom:24 }}>
          {[
            { label:"Amount paid",    value:`₦${ngnNum.toLocaleString("en")}` },
            { label:"USDC received",  value:`${usdcNet.toFixed(4)} USDC` },
            { label:"Method",         value: PAYMENT_METHODS.find(m => m.id === method)?.label ?? "" },
            { label:"Reference",      value: txRef },
            { label:"Status",         value:"Completed" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${border}` }}>
              <span style={{ fontSize:"13px", color:"var(--zp-text-2)" }}>{label}</span>
              <span style={{ fontSize:"13px", fontWeight:600, color: label==="Status" ? "var(--zp-green)" : "var(--zp-text)" }}>{value}</span>
            </div>
          ))}
        </div>

        <button onClick={onBack} className="zp-btn-primary" style={{ width:"100%" }}>
          Done
        </button>
      </div>
    </div>
  );
}
