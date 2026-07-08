const fs = require('fs');

const content = '"use client";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'\n' +
'const SERVICES = [\n' +
'  { label: "Deposit", sub: "Buy crypto with NGN", icon: "📥", path: "/exchange/deposit" },\n' +
'  { label: "Withdraw", sub: "Cash out to bank", icon: "🏦", path: "/exchange/withdraw" },\n' +
'  { label: "Utility Bills", sub: "Pay bills and services", icon: "⚡", path: "/exchange/utility" },\n' +
'  { label: "Bank Accounts", sub: "Manage your banks", icon: "🏛", path: "/exchange/banks" },\n' +
'];\n' +
'\n' +
'export default function ExchangePage() {\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'\n' +
'  return (\n' +
'    <main style={{ minHeight: "100vh", background: bg, padding: "24px 16px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>\n' +
'      <div style={{ width: "100%", maxWidth: "440px", marginBottom: "28px" }}>\n' +
'        <h1 style={{ color: text, fontSize: "22px", fontWeight: "700" }}>Financial Services</h1>\n' +
'        <p style={{ color: subText, fontSize: "13px", marginTop: "4px" }}>Deposits, withdrawals, bills and more</p>\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "440px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>\n' +
'        {SERVICES.map((s) => (\n' +
'          <button key={s.path} onClick={() => router.push(s.path)}\n' +
'            style={{ background: card, border: "1px solid " + border, borderRadius: "20px", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px", cursor: "pointer", textAlign: "left" }}>\n' +
'            <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>\n' +
'              {s.icon}\n' +
'            </div>\n' +
'            <div>\n' +
'              <p style={{ color: text, fontWeight: "700", fontSize: "15px", margin: 0 }}>{s.label}</p>\n' +
'              <p style={{ color: subText, fontSize: "11px", margin: "4px 0 0" }}>{s.sub}</p>\n' +
'            </div>\n' +
'          </button>\n' +
'        ))}\n' +
'      </div>\n' +
'\n' +
'      <div style={{ width: "100%", maxWidth: "440px", background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: "16px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "10px" }}>\n' +
'        <span style={{ fontSize: "16px" }}>🔒</span>\n' +
'        <p style={{ color: subText, fontSize: "12px", margin: 0 }}>All transactions are self-custodial. ZarPay never holds your funds.</p>\n' +
'      </div>\n' +
'\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/exchange/page.tsx', content);
console.log('Done! Exchange hub page written.');