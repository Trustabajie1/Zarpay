"use client";
import { useRouter } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
const UTILITIES = [
  { label:"Airtime", icon:"📱", path:"/exchange/utility/airtime", color:"rgba(46,204,113,0.15)", iconColor:"var(--green)" },
  { label:"Electricity", icon:"⚡", path:"/exchange/utility/electricity", color:"rgba(240,165,0,0.15)", iconColor:"var(--amber)" },
  { label:"Data", icon:"📶", path:"/exchange/utility/data", color:"rgba(59,130,246,0.15)", iconColor:"#3B82F6" },
  { label:"TV", icon:"📺", path:"/exchange/utility/tv", color:"rgba(167,139,250,0.15)", iconColor:"#A78BFA" },
  { label:"Internet", icon:"🌐", path:"/exchange/utility/internet", color:"rgba(52,211,153,0.15)", iconColor:"#34D399" },
  { label:"Water", icon:"💧", path:"/exchange/utility/water", color:"rgba(56,189,248,0.15)", iconColor:"#38BDF8" },
];
export default function UtilityPage() {
  const router = useRouter();
  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title="Utility Bills" badge="Demo Mode" />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {UTILITIES.map(u => (
            <button key={u.path} onClick={() => router.push(u.path)}
              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"12px", cursor:"pointer" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"14px", background:u.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{u.icon}</div>
              <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>{u.label}</p>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
