"use client";
import { useRouter } from "next/navigation";
export function PageHeader({ title, badge }: { title: string; badge?: string }) {
  const router = useRouter();
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>
      <button onClick={() => router.back()}
        style={{ width:"36px", height:"36px", borderRadius:"10px", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--text-2)", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        ←
      </button>
      <h1 style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em", flex:1 }}>{title}</h1>
      {badge && <span className="zp-badge zp-badge-amber">{badge}</span>}
    </div>
  );
}
