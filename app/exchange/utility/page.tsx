"use client";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
const UTILITIES = [
  { label:"Airtime", icon:"📱", path:"/exchange/utility/airtime" },
  { label:"Electricity", icon:"⚡", path:"/exchange/utility/electricity" },
  { label:"Data", icon:"📶", path:"/exchange/utility/data" },
  { label:"TV", icon:"📺", path:"/exchange/utility/tv" },
  { label:"Internet", icon:"🌐", path:"/exchange/utility/internet" },
  { label:"Water", icon:"💧", path:"/exchange/utility/water" },
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
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Utility Bills</h1>
        <div style={{ marginLeft:"auto", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"4px 10px" }}>
          <span style={{ color:"#f59e0b", fontSize:"11px" }}>Demo Mode</span>
        </div>
      </div>
      <div style={{ width:"100%", maxWidth:"440px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
        {UTILITIES.map(u => (
          <button key={u.path} onClick={() => router.push(u.path)}
            style={{ background:card, border:"1px solid "+border, borderRadius:"20px", padding:"24px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{u.icon}</div>
            <p style={{ color:text, fontWeight:"700", fontSize:"15px", margin:0 }}>{u.label}</p>
          </button>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}
