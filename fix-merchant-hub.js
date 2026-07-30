const fs = require('fs');

const content =
'"use client";\n' +
'import { useState, useEffect } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'\n' +
'export default function MerchantPage() {\n' +
'  const router = useRouter();\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'\n' +
'  useEffect(() => {\n' +
'    setMounted(true);\n' +
'    const s = localStorage.getItem("zarpay_merchant_"+address);\n' +
'    if (s) setMerchant(JSON.parse(s));\n' +
'  }, [address]);\n' +
'\n' +
'  if (!mounted) return null;\n' +
'\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'\n' +
'        <div style={{ marginBottom:"8px" }}>\n' +
'          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Merchant</h1>\n' +
'          <p style={{ fontSize:"13px", color:"var(--text-2)", marginTop:"4px" }}>Accept EURC payments from customers</p>\n' +
'        </div>\n' +
'\n' +
'        {!isConnected ? (\n' +
'          <div className="zp-card" style={{ textAlign:"center", padding:"48px 24px" }}>\n' +
'            <div style={{ fontSize:"40px", marginBottom:"16px" }}>&#128268;</div>\n' +
'            <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"8px" }}>Connect your wallet</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)" }}>You need a connected wallet to register as a merchant</p>\n' +
'          </div>\n' +
'\n' +
'        ) : merchant ? (\n' +
'          <>\n' +
'            <div style={{ background:"linear-gradient(135deg, #0D1621, #0F1E30)", border:"1px solid var(--green-border)", borderRadius:"20px", padding:"20px", position:"relative", overflow:"hidden" }}>\n' +
'              <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,204,113,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />\n' +
'              <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>\n' +
'                <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", flexShrink:0 }}>\n' +
'                  {merchant.emoji}\n' +
'                </div>\n' +
'                <div style={{ flex:1 }}>\n' +
'                  <p style={{ fontSize:"17px", fontWeight:"800", color:"var(--text)", margin:0, letterSpacing:"-0.02em" }}>{merchant.name}</p>\n' +
'                  <p style={{ fontSize:"12px", color:"var(--text-2)", margin:"3px 0 0" }}>{merchant.category}</p>\n' +
'                </div>\n' +
'                <span className="zp-badge zp-badge-green">&#10003; Active</span>\n' +
'              </div>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-3)", fontFamily:"JetBrains Mono,monospace", wordBreak:"break-all" }}>{address}</p>\n' +
'            </div>\n' +
'\n' +
'            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>\n' +
'              <button onClick={() => router.push("/merchant/dashboard")}\n' +
'                style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer", textAlign:"left" }}>\n' +
'                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"rgba(46,204,113,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", color:"var(--green)", fontWeight:"700" }}>&#9783;</div>\n' +
'                <div>\n' +
'                  <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)", margin:0 }}>Dashboard</p>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>View payments</p>\n' +
'                </div>\n' +
'              </button>\n' +
'              <button onClick={() => router.push("/merchant/pay?merchant="+address)}\n' +
'                style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer", textAlign:"left" }}>\n' +
'                <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", color:"#3B82F6", fontWeight:"700" }}>&#9641;</div>\n' +
'                <div>\n' +
'                  <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)", margin:0 }}>QR Code</p>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>Show to customers</p>\n' +
'                </div>\n' +
'              </button>\n' +
'            </div>\n' +
'\n' +
'            <button onClick={() => { localStorage.removeItem("zarpay_merchant_"+address); setMerchant(null); }}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid rgba(231,76,60,0.25)", background:"var(--red-dim)", color:"var(--red)", fontWeight:"600", cursor:"pointer", fontSize:"14px" }}>\n' +
'              Unregister Merchant\n' +
'            </button>\n' +
'          </>\n' +
'\n' +
'        ) : (\n' +
'          <div className="zp-card" style={{ textAlign:"center", padding:"36px 24px" }}>\n' +
'            <div style={{ fontSize:"52px", marginBottom:"20px" }}>&#127978;</div>\n' +
'            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)", marginBottom:"8px", letterSpacing:"-0.02em" }}>Become a Merchant</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", marginBottom:"24px", lineHeight:"1.6" }}>Register to accept EURC payments from ZarPay customers via QR code or wallet address</p>\n' +
'            <div style={{ textAlign:"left", marginBottom:"24px", display:"flex", flexDirection:"column", gap:"10px" }}>\n' +
'              {["Accept EURC payments instantly","Share your QR code with customers","Track all incoming payments","No monthly fees"].map((f,i) => (\n' +
'                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>\n' +
'                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", color:"var(--green)", flexShrink:0 }}>&#10003;</div>\n' +
'                  <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{f}</span>\n' +
'                </div>\n' +
'              ))}\n' +
'            </div>\n' +
'            <button onClick={() => router.push("/merchant/register")} className="zp-btn-primary">Register as Merchant</button>\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/merchant/page.tsx', content);
console.log('Done! Merchant hub updated.');