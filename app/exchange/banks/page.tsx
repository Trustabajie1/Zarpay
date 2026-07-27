"use client";
import { useState } from "react";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];
export default function BanksPage() {
  const [savedBanks, setSavedBanks] = useState([{ bank:"GTBank", account:"0123456789", name:"John Doe" }]);
  const [showForm, setShowForm] = useState(false);
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  function handleAdd() { if(!bank||!account||!name) return; setSavedBanks([...savedBanks,{bank,account,name}]); setBank(""); setAccount(""); setName(""); setShowForm(false); }
  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
          <PageHeader title="Bank Accounts" />
          <button onClick={() => setShowForm(!showForm)}
            style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:"10px", border:"none", background:"var(--green)", color:"#080C12", fontWeight:"700", fontSize:"13px", cursor:"pointer", flexShrink:0 }}>+ Add</button>
        </div>
        {showForm && (
          <div className="zp-card">
            <p className="zp-label">Add Bank Account</p>
            <select value={bank} onChange={e => setBank(e.target.value)} className="zp-input" style={{ marginBottom:"10px" }}>
              <option value="">Select bank</option>
              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)} maxLength={10} className="zp-input" style={{ marginBottom:"10px" }} />
            <input type="text" placeholder="Account name" value={name} onChange={e => setName(e.target.value)} className="zp-input" style={{ marginBottom:"16px" }} />
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setShowForm(false)} className="zp-btn-secondary">Cancel</button>
              <button onClick={handleAdd} disabled={!bank||!account||!name} className="zp-btn-primary">Save Account</button>
            </div>
          </div>
        )}
        {savedBanks.length === 0 ? (
          <div className="zp-card" style={{ textAlign:"center", padding:"40px 24px" }}>
            <p style={{ fontSize:"32px", marginBottom:"12px" }}>🏦</p>
            <p style={{ fontSize:"15px", fontWeight:"600", color:"var(--text)", marginBottom:"6px" }}>No bank accounts yet</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)" }}>Add a bank account to enable withdrawals</p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {savedBanks.map((b,i) => (
              <div key={i} className="zp-card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)", marginBottom:"3px" }}>{b.bank}</p>
                  <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace" }}>{b.account}</p>
                  <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"2px" }}>{b.name}</p>
                </div>
                <button onClick={() => setSavedBanks(savedBanks.filter((_,idx) => idx!==i))}
                  style={{ padding:"8px 14px", borderRadius:"10px", border:"1px solid rgba(231,76,60,0.25)", background:"var(--red-dim)", color:"var(--red)", cursor:"pointer", fontSize:"12px", fontWeight:"600" }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
