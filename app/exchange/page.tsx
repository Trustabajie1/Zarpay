"use client";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
const SERVICES = [
  { label:"Deposit", sub:"Buy crypto with NGN", icon:"📥", path:"/exchange/deposit", color:"var(--green)", tint:"var(--green-dim)", border:"var(--green-border)" },
  { label:"Withdraw", sub:"Cash out to bank", icon:"🏦", path:"/exchange/withdraw", color:"#3B82F6", tint:"rgba(59,130,246,0.12)", border:"rgba(59,130,246,0.25)" },
  { label:"Utility Bills", sub:"Pay bills & services", icon:"⚡", path:"/exchange/utility", color:"var(--amber)", tint:"var(--amber-dim)", border:"rgba(240,165,0,0.25)" },
  { label:"Bank Accounts", sub:"Manage your banks", icon:"🏛", path:"/exchange/banks", color:"#A78BFA", tint:"rgba(167,139,250,0.12)", border:"rgba(167,139,250,0.25)" },
];
export default function ExchangePage() {
  const router = useRouter();
  const { settings } = useAppSettings();
  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ marginBottom:"8px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Financial Services</h1>
          <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"4px" }}>Deposits, withdrawals, bills and more</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {SERVICES.map((s) => (
            <button key={s.path} onClick={() => router.push(s.path)}
              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"12px", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:s.tint, border:"1px solid "+s.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{s.icon}</div>
              <div>
                <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>{s.label}</p>
                <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"3px" }}>{s.sub}</p>
              </div>
            </button>
          ))}
        </div>
        <div style={{ background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"10px" }}>
          <span style={{ fontSize:"16px" }}>🔒</span>
          <p style={{ fontSize:"12px", color:"var(--text-2)" }}>All transactions are self-custodial. ZarPay never holds your funds.</p>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
