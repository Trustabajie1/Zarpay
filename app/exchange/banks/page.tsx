"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];
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
  const [savedBanks, setSavedBanks] = useState([{ bank:"GTBank", account:"0123456789", name:"John Doe" }]);
  const [showForm, setShowForm] = useState(false);
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [name, setName] = useState("");
  function handleAdd() {
    if (!bank||!account||!name) return;
    setSavedBanks([...savedBanks,{bank,account,name}]);
    setBank(""); setAccount(""); setName(""); setShowForm(false);
  }
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Bank Accounts</h1>
        <button onClick={() => setShowForm(!showForm)} style={{ marginLeft:"auto", background:"#4ade80", border:"none", color:"#111", fontWeight:"700", fontSize:"13px", borderRadius:"10px", padding:"8px 14px", cursor:"pointer" }}>+ Add Bank</button>
      </div>
      {showForm && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"16px" }}>
          <p style={{ color:text, fontWeight:"700", marginBottom:"16px" }}>Add Bank Account</p>
          <select value={bank} onChange={e => setBank(e.target.value)}
            style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"12px", boxSizing:"border-box" }}>
            <option value="">Select bank</option>
            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)} maxLength={10}
            style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"12px", boxSizing:"border-box" }} />
          <input type="text" placeholder="Account name" value={name} onChange={e => setName(e.target.value)}
            style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"16px", boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:"10px" }}>
            <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:"transparent", color:text, cursor:"pointer", fontWeight:"600" }}>Cancel</button>
            <button onClick={handleAdd} disabled={!bank||!account||!name}
              style={{ flex:2, padding:"14px", borderRadius:"12px", border:"none", background:!bank||!account||!name?"#1f2937":"#4ade80", color:!bank||!account||!name?"#4b5563":"#111", fontWeight:"700", cursor:!bank||!account||!name?"not-allowed":"pointer" }}>Save Account</button>
          </div>
        </div>
      )}
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", flexDirection:"column", gap:"10px" }}>
        {savedBanks.map((b,i) => (
          <div key={i} style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ color:text, fontWeight:"700", margin:0 }}>{b.bank}</p>
              <p style={{ color:"#4ade80", fontSize:"13px", fontFamily:"monospace", margin:"4px 0 0" }}>{b.account}</p>
              <p style={{ color:subText, fontSize:"12px", margin:"2px 0 0" }}>{b.name}</p>
            </div>
            <button onClick={() => setSavedBanks(savedBanks.filter((_,idx) => idx!==i))}
              style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", borderRadius:"10px", padding:"8px 12px", cursor:"pointer", fontSize:"13px" }}>Remove</button>
          </div>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
