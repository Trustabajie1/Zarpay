"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { DisconnectButton } from "@/components/DisconnectButton";
import { BottomNav } from "@/components/BottomNav";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { t } from "@/lib/translations";

const CURRENCIES = ["NGN", "USD", "GBP", "EUR"] as const;
const LANGUAGES = ["English", "French", "Spanish", "Arabic"] as const;

export default function SettingsPage() {
  const { address } = useAccount();
  const { settings, updateSettings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [displayName, setDisplayName] = useState(settings.displayName || "");
  const [saved, setSaved] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const shortAddr = address ? address.slice(0,6)+"..."+address.slice(-4) : "";

  function handleSaveName() {
    updateSettings({ displayName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ marginBottom:"8px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Settings</h1>
        </div>

        {/* Profile */}
        <div className="zp-card">
          <p className="zp-label">Profile</p>
          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px" }}>
            <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"linear-gradient(135deg, #2ECC71, #0F9B5C)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", fontWeight:"800", color:"#fff", flexShrink:0 }}>
              {(displayName || "W").slice(0,1).toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)" }}>{displayName || "My Wallet"}</p>
              <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", marginTop:"2px" }}>{shortAddr}</p>
            </div>
          </div>
          <p className="zp-label">Display Name</p>
          <div style={{ display:"flex", gap:"10px" }}>
            <input
              type="text"
              placeholder="Enter a nickname..."
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="zp-input"
              style={{ flex:1 }}
            />
            <button onClick={handleSaveName}
              style={{ padding:"0 20px", borderRadius:"12px", border:"none", background: saved ? "var(--green-dim)" : "var(--green)", color: saved ? "var(--green)" : "#080C12", fontWeight:"700", cursor:"pointer", fontSize:"13px", flexShrink:0, transition:"all 0.2s" }}>
              {saved ? "Saved!" : "Save"}
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="zp-card">
          <p className="zp-label">Appearance</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {["dark","light"].map(theme => (
              <button key={theme} onClick={() => updateSettings({ theme: theme as any })}
                style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(settings.theme===theme?"var(--green-border)":"var(--border)"), background:settings.theme===theme?"var(--green-dim)":"var(--surface-2)", color:settings.theme===theme?"var(--green)":"var(--text-2)", fontWeight:settings.theme===theme?"700":"500", cursor:"pointer", fontSize:"14px", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
                <span>{theme==="dark"?"🌙":"☀️"}</span>
                <span style={{ textTransform:"capitalize" }}>{theme}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="zp-card">
          <p className="zp-label">Currency</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => updateSettings({ currency: c })}
                style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(settings.currency===c?"var(--green-border)":"var(--border)"), background:settings.currency===c?"var(--green-dim)":"var(--surface-2)", color:settings.currency===c?"var(--green)":"var(--text-2)", fontWeight:settings.currency===c?"700":"500", cursor:"pointer", fontSize:"14px" }}>
                {CURRENCY_SYMBOLS[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="zp-card">
          <p className="zp-label">Language</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
            {LANGUAGES.map(lang => (
              <button key={lang} onClick={() => updateSettings({ language: lang })}
                style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(settings.language===lang?"var(--green-border)":"var(--border)"), background:settings.language===lang?"var(--green-dim)":"var(--surface-2)", color:settings.language===lang?"var(--green)":"var(--text-2)", fontWeight:settings.language===lang?"700":"500", cursor:"pointer", fontSize:"14px" }}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Network Info */}
        <div className="zp-card">
          <p className="zp-label">Network</p>
          {[
            { label:"Network", value:"Arc Testnet" },
            { label:"Chain ID", value:"5042002" },
            { label:"Wallet", value:shortAddr },
          ].map((item,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<2?"1px solid var(--border)":"none" }}>
              <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{item.label}</span>
              <span style={{ fontSize:"13px", color:"var(--text)", fontFamily:"monospace" }}>{item.value}</span>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="zp-card" style={{ textAlign:"center" }}>
          <p style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em", marginBottom:"4px" }}>ZarPay</p>
          <p style={{ fontSize:"12px", color:"var(--text-2)", marginBottom:"16px" }}>Stablecoin payments on Arc Testnet</p>
          <span className="zp-badge zp-badge-green">v1.0.0 · Testnet</span>
        </div>

        {/* Disconnect */}
        <div style={{ display:"flex", justifyContent:"center", paddingBottom:"8px" }}>
          <DisconnectButton />
        </div>

      </div>
      <BottomNav />
    </main>
  );
}