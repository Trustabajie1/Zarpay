const fs = require('fs');

// Create folders
fs.mkdirSync('app/exchange/deposit', { recursive: true });
fs.mkdirSync('app/exchange/withdraw', { recursive: true });
fs.mkdirSync('app/exchange/utility', { recursive: true });
fs.mkdirSync('app/exchange/banks', { recursive: true });
fs.mkdirSync('app/exchange/utility/airtime', { recursive: true });
fs.mkdirSync('app/exchange/utility/electricity', { recursive: true });
fs.mkdirSync('app/exchange/utility/data', { recursive: true });
fs.mkdirSync('app/exchange/utility/tv', { recursive: true });
fs.mkdirSync('app/exchange/utility/internet', { recursive: true });
fs.mkdirSync('app/exchange/utility/water', { recursive: true });

// DEPOSIT PAGE
fs.writeFileSync('app/exchange/deposit/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];\n' +
'const AMOUNTS = ["1000","2000","5000","10000","20000","50000"];\n' +
'export default function DepositPage() {\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const inputBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [bank, setBank] = useState("");\n' +
'  const [step, setStep] = useState("form");\n' +
'  function handleDeposit() {\n' +
'    if (!amount || !bank) return;\n' +
'    setStep("pending");\n' +
'    setTimeout(() => setStep("success"), 2500);\n' +
'  }\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Deposit NGN</h1>\n' +
'        <div style={{ marginLeft:"auto", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"8px", padding:"4px 10px" }}>\n' +
'          <span style={{ color:"#4ade80", fontSize:"11px" }}>Demo Mode</span>\n' +
'        </div>\n' +
'      </div>\n' +
'      {step === "form" && (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Amount (NGN)</p>\n' +
'            <input type="number" placeholder="Enter amount" value={amount} onChange={e => setAmount(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"18px", fontWeight:"700", boxSizing:"border-box" }} />\n' +
'            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"12px" }}>\n' +
'              {AMOUNTS.map(a => (\n' +
'                <button key={a} onClick={() => setAmount(a)}\n' +
'                  style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+border, background:amount===a?"rgba(74,222,128,0.1)":inputBg, color:text, cursor:"pointer", fontSize:"13px", fontWeight:"600" }}>\n' +
'                  ₦{Number(a).toLocaleString()}\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Select Bank</p>\n' +
'            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>\n' +
'              {BANKS.map(b => (\n' +
'                <button key={b} onClick={() => setBank(b)}\n' +
'                  style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(bank===b?"rgba(74,222,128,0.4)":border), background:bank===b?"rgba(74,222,128,0.08)":inputBg, color:text, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'                  {b} {bank===b && <span style={{ color:"#4ade80" }}>✓</span>}\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"16px", padding:"16px", marginBottom:"16px" }}>\n' +
'            {[{label:"You pay",value:amount?"₦"+Number(amount).toLocaleString():"--"},{label:"You receive (est.)",value:amount?(Number(amount)/1650).toFixed(2)+" USDC":"--"},{label:"Rate",value:"₦1,650 = 1 USDC"},{label:"Status",value:"🟡 Demo Mode"}].map((row,i) => (\n' +
'              <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:"10px", marginBottom:"10px", borderBottom:i<3?"1px solid "+border:"none" }}>\n' +
'                <span style={{ color:subText, fontSize:"13px" }}>{row.label}</span>\n' +
'                <span style={{ color:text, fontSize:"13px", fontWeight:"600" }}>{row.value}</span>\n' +
'              </div>\n' +
'            ))}\n' +
'          </div>\n' +
'          <button onClick={handleDeposit} disabled={!amount||!bank}\n' +
'            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!amount||!bank?"#1f2937":"#4ade80", color:!amount||!bank?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!amount||!bank?"not-allowed":"pointer" }}>\n' +
'            {!amount?"Enter amount":!bank?"Select a bank":"Deposit NGN"}\n' +
'          </button>\n' +
'        </>\n' +
'      )}\n' +
'      {step === "pending" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />\n' +
'          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'          <p style={{ color:text, fontWeight:"700" }}>Processing Deposit...</p>\n' +
'          <p style={{ color:subText, fontSize:"12px" }}>Demo mode — simulating bank transfer</p>\n' +
'        </div>\n' +
'      )}\n' +
'      {step === "success" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>\n' +
'          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>\n' +
'          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Deposit Initiated!</p>\n' +
'          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>₦{Number(amount).toLocaleString()} via {bank}</p>\n' +
'          <p style={{ color:"#f59e0b", fontSize:"12px", textAlign:"center" }}>🟡 Demo — no real funds were moved</p>\n' +
'          <button onClick={() => { setStep("form"); setAmount(""); setBank(""); }}\n' +
'            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>New Deposit</button>\n' +
'        </div>\n' +
'      )}\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Deposit page written');

// WITHDRAW PAGE
fs.writeFileSync('app/exchange/withdraw/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];\n' +
'const AMOUNTS = ["10","20","50","100","200","500"];\n' +
'export default function WithdrawPage() {\n' +
'  const router = useRouter();\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const { usdcFormatted } = useWalletBalance(address);\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const inputBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [bank, setBank] = useState("");\n' +
'  const [accountNumber, setAccountNumber] = useState("");\n' +
'  const [accountName, setAccountName] = useState("");\n' +
'  const [step, setStep] = useState("form");\n' +
'  const ngnAmount = amount ? (Number(amount)*1650).toLocaleString() : "--";\n' +
'  function handleVerify() { if (accountNumber.length===10) setAccountName("John Doe (Demo)"); }\n' +
'  function handleWithdraw() { setStep("pending"); setTimeout(() => setStep("success"), 3000); }\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Withdraw to Bank</h1>\n' +
'        <div style={{ marginLeft:"auto", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"4px 10px" }}>\n' +
'          <span style={{ color:"#f59e0b", fontSize:"11px" }}>Demo Mode</span>\n' +
'        </div>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:"14px", padding:"14px 18px", marginBottom:"16px", display:"flex", justifyContent:"space-between" }}>\n' +
'        <span style={{ color:subText, fontSize:"13px" }}>Available USDC</span>\n' +
'        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"13px" }}>{usdcFormatted} USDC</span>\n' +
'      </div>\n' +
'      {step === "form" && (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Amount (USDC)</p>\n' +
'            <input type="number" placeholder="Enter USDC amount" value={amount} onChange={e => setAmount(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"18px", fontWeight:"700", boxSizing:"border-box" }} />\n' +
'            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginTop:"12px" }}>\n' +
'              {AMOUNTS.map(a => (\n' +
'                <button key={a} onClick={() => setAmount(a)}\n' +
'                  style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+border, background:amount===a?"rgba(74,222,128,0.1)":inputBg, color:text, cursor:"pointer", fontSize:"13px", fontWeight:"600" }}>\n' +
'                  {a} USDC\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'            {amount && <p style={{ color:"#4ade80", fontSize:"13px", marginTop:"10px", textAlign:"right" }}>≈ ₦{ngnAmount}</p>}\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Bank Details</p>\n' +
'            <select value={bank} onChange={e => setBank(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"12px", boxSizing:"border-box" }}>\n' +
'              <option value="">Select bank</option>\n' +
'              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}\n' +
'            </select>\n' +
'            <input type="text" placeholder="Account number (10 digits)" value={accountNumber}\n' +
'              onChange={e => { setAccountNumber(e.target.value); setAccountName(""); }}\n' +
'              onBlur={handleVerify} maxLength={10}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"8px", boxSizing:"border-box" }} />\n' +
'            {accountName && <p style={{ color:"#4ade80", fontSize:"13px", fontWeight:"600" }}>✓ {accountName}</p>}\n' +
'          </div>\n' +
'          <button onClick={() => setStep("confirm")} disabled={!amount||!bank||accountNumber.length<10}\n' +
'            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!amount||!bank||accountNumber.length<10?"#1f2937":"#4ade80", color:!amount||!bank||accountNumber.length<10?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!amount||!bank||accountNumber.length<10?"not-allowed":"pointer" }}>\n' +
'            Continue\n' +
'          </button>\n' +
'        </>\n' +
'      )}\n' +
'      {step === "confirm" && (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"16px" }}>\n' +
'            <p style={{ color:text, fontWeight:"700", fontSize:"16px", marginBottom:"16px" }}>Confirm Withdrawal</p>\n' +
'            {[{label:"Amount",value:amount+" USDC"},{label:"You receive",value:"₦"+ngnAmount},{label:"Bank",value:bank},{label:"Account",value:accountNumber},{label:"Name",value:accountName},{label:"Rate",value:"1 USDC = ₦1,650"},{label:"Status",value:"🟡 Demo Mode"}].map((row,i) => (\n' +
'              <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:"10px", marginBottom:"10px", borderBottom:i<6?"1px solid "+border:"none" }}>\n' +
'                <span style={{ color:subText, fontSize:"13px" }}>{row.label}</span>\n' +
'                <span style={{ color:text, fontSize:"13px", fontWeight:"600" }}>{row.value}</span>\n' +
'              </div>\n' +
'            ))}\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", display:"flex", gap:"12px" }}>\n' +
'            <button onClick={() => setStep("form")} style={{ flex:1, padding:"16px", borderRadius:"14px", border:"1px solid "+border, background:"transparent", color:text, fontWeight:"700", cursor:"pointer" }}>Back</button>\n' +
'            <button onClick={handleWithdraw} style={{ flex:2, padding:"16px", borderRadius:"14px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", cursor:"pointer" }}>Confirm Withdrawal</button>\n' +
'          </div>\n' +
'        </>\n' +
'      )}\n' +
'      {step === "pending" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />\n' +
'          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'          <p style={{ color:text, fontWeight:"700" }}>Processing Withdrawal...</p>\n' +
'        </div>\n' +
'      )}\n' +
'      {step === "success" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>\n' +
'          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>\n' +
'          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Withdrawal Initiated!</p>\n' +
'          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>{amount} USDC to {bank}</p>\n' +
'          <p style={{ color:"#f59e0b", fontSize:"12px", textAlign:"center" }}>🟡 Demo — no real funds were moved</p>\n' +
'          <button onClick={() => { setStep("form"); setAmount(""); setBank(""); setAccountNumber(""); setAccountName(""); }}\n' +
'            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>New Withdrawal</button>\n' +
'        </div>\n' +
'      )}\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Withdraw page written');

// UTILITY HUB
fs.writeFileSync('app/exchange/utility/page.tsx',
'"use client";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const UTILITIES = [\n' +
'  { label:"Airtime", icon:"📱", path:"/exchange/utility/airtime" },\n' +
'  { label:"Electricity", icon:"⚡", path:"/exchange/utility/electricity" },\n' +
'  { label:"Data", icon:"📶", path:"/exchange/utility/data" },\n' +
'  { label:"TV", icon:"📺", path:"/exchange/utility/tv" },\n' +
'  { label:"Internet", icon:"🌐", path:"/exchange/utility/internet" },\n' +
'  { label:"Water", icon:"💧", path:"/exchange/utility/water" },\n' +
'];\n' +
'export default function UtilityPage() {\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Utility Bills</h1>\n' +
'        <div style={{ marginLeft:"auto", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"4px 10px" }}>\n' +
'          <span style={{ color:"#f59e0b", fontSize:"11px" }}>Demo Mode</span>\n' +
'        </div>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>\n' +
'        {UTILITIES.map(u => (\n' +
'          <button key={u.path} onClick={() => router.push(u.path)}\n' +
'            style={{ background:card, border:"1px solid "+border, borderRadius:"20px", padding:"24px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer" }}>\n' +
'            <div style={{ width:"44px", height:"44px", borderRadius:"12px", background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>{u.icon}</div>\n' +
'            <p style={{ color:text, fontWeight:"700", fontSize:"15px", margin:0 }}>{u.label}</p>\n' +
'          </button>\n' +
'        ))}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Utility hub written');

// BANKS PAGE
fs.writeFileSync('app/exchange/banks/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];\n' +
'export default function BanksPage() {\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const inputBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const [savedBanks, setSavedBanks] = useState([{ bank:"GTBank", account:"0123456789", name:"John Doe" }]);\n' +
'  const [showForm, setShowForm] = useState(false);\n' +
'  const [bank, setBank] = useState("");\n' +
'  const [account, setAccount] = useState("");\n' +
'  const [name, setName] = useState("");\n' +
'  function handleAdd() {\n' +
'    if (!bank||!account||!name) return;\n' +
'    setSavedBanks([...savedBanks,{bank,account,name}]);\n' +
'    setBank(""); setAccount(""); setName(""); setShowForm(false);\n' +
'  }\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Bank Accounts</h1>\n' +
'        <button onClick={() => setShowForm(!showForm)} style={{ marginLeft:"auto", background:"#4ade80", border:"none", color:"#111", fontWeight:"700", fontSize:"13px", borderRadius:"10px", padding:"8px 14px", cursor:"pointer" }}>+ Add Bank</button>\n' +
'      </div>\n' +
'      {showForm && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"16px" }}>\n' +
'          <p style={{ color:text, fontWeight:"700", marginBottom:"16px" }}>Add Bank Account</p>\n' +
'          <select value={bank} onChange={e => setBank(e.target.value)}\n' +
'            style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"12px", boxSizing:"border-box" }}>\n' +
'            <option value="">Select bank</option>\n' +
'            {BANKS.map(b => <option key={b} value={b}>{b}</option>)}\n' +
'          </select>\n' +
'          <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)} maxLength={10}\n' +
'            style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"12px", boxSizing:"border-box" }} />\n' +
'          <input type="text" placeholder="Account name" value={name} onChange={e => setName(e.target.value)}\n' +
'            style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, marginBottom:"16px", boxSizing:"border-box" }} />\n' +
'          <div style={{ display:"flex", gap:"10px" }}>\n' +
'            <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:"transparent", color:text, cursor:"pointer", fontWeight:"600" }}>Cancel</button>\n' +
'            <button onClick={handleAdd} disabled={!bank||!account||!name}\n' +
'              style={{ flex:2, padding:"14px", borderRadius:"12px", border:"none", background:!bank||!account||!name?"#1f2937":"#4ade80", color:!bank||!account||!name?"#4b5563":"#111", fontWeight:"700", cursor:!bank||!account||!name?"not-allowed":"pointer" }}>Save Account</button>\n' +
'          </div>\n' +
'        </div>\n' +
'      )}\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", flexDirection:"column", gap:"10px" }}>\n' +
'        {savedBanks.map((b,i) => (\n' +
'          <div key={i} style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'            <div>\n' +
'              <p style={{ color:text, fontWeight:"700", margin:0 }}>{b.bank}</p>\n' +
'              <p style={{ color:"#4ade80", fontSize:"13px", fontFamily:"monospace", margin:"4px 0 0" }}>{b.account}</p>\n' +
'              <p style={{ color:subText, fontSize:"12px", margin:"2px 0 0" }}>{b.name}</p>\n' +
'            </div>\n' +
'            <button onClick={() => setSavedBanks(savedBanks.filter((_,idx) => idx!==i))}\n' +
'              style={{ background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", borderRadius:"10px", padding:"8px 12px", cursor:"pointer", fontSize:"13px" }}>Remove</button>\n' +
'          </div>\n' +
'        ))}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Banks page written');

// UTILITY SUB-PAGES
const utilities = [
  { folder:'airtime', title:'Airtime', icon:'📱', providers:['MTN','Airtel','Glo','9mobile'] },
  { folder:'electricity', title:'Electricity', icon:'⚡', providers:['EKEDC','IKEDC','AEDC','PHEDC','EEDC'] },
  { folder:'data', title:'Data', icon:'📶', providers:['MTN Data','Airtel Data','Glo Data','9mobile Data'] },
  { folder:'tv', title:'TV', icon:'📺', providers:['DSTV','GOtv','Startimes','NTA'] },
  { folder:'internet', title:'Internet', icon:'🌐', providers:['Spectranet','Smile','Swift','ipNX'] },
  { folder:'water', title:'Water', icon:'💧', providers:['Lagos Water','Abuja Water','Rivers Water'] },
];

utilities.forEach(u => {
  const providerList = u.providers.map(p => '"'+p+'"').join(',');
  fs.writeFileSync('app/exchange/utility/'+u.folder+'/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const PROVIDERS = ['+providerList+'];\n' +
'export default function '+u.title.replace(/\s/g,'')+'Page() {\n' +
'  const router = useRouter();\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const { usdcFormatted } = useWalletBalance(address);\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const inputBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const [provider, setProvider] = useState("");\n' +
'  const [reference, setReference] = useState("");\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [step, setStep] = useState("form");\n' +
'  function handlePay() {\n' +
'    if (!provider||!reference||!amount) return;\n' +
'    setStep("pending");\n' +
'    setTimeout(() => setStep("success"), 2500);\n' +
'  }\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>'+u.icon+' '+u.title+'</h1>\n' +
'        <div style={{ marginLeft:"auto", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px", padding:"4px 10px" }}>\n' +
'          <span style={{ color:"#f59e0b", fontSize:"11px" }}>Demo</span>\n' +
'        </div>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:"14px", padding:"14px 18px", marginBottom:"16px", display:"flex", justifyContent:"space-between" }}>\n' +
'        <span style={{ color:subText, fontSize:"13px" }}>Available USDC</span>\n' +
'        <span style={{ color:"#4ade80", fontWeight:"700", fontSize:"13px" }}>{usdcFormatted} USDC</span>\n' +
'      </div>\n' +
'      {step === "form" && (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Provider</p>\n' +
'            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>\n' +
'              {PROVIDERS.map(p => (\n' +
'                <button key={p} onClick={() => setProvider(p)}\n' +
'                  style={{ padding:"14px", borderRadius:"12px", border:"1px solid "+(provider===p?"rgba(74,222,128,0.4)":border), background:provider===p?"rgba(74,222,128,0.08)":inputBg, color:text, cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between" }}>\n' +
'                  {p} {provider===p && <span style={{ color:"#4ade80" }}>✓</span>}\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Reference / Number</p>\n' +
'            <input type="text" placeholder="Enter meter/phone/account number" value={reference} onChange={e => setReference(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, boxSizing:"border-box", marginBottom:"12px" }} />\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Amount (USDC)</p>\n' +
'            <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, boxSizing:"border-box" }} />\n' +
'          </div>\n' +
'          <button onClick={handlePay} disabled={!provider||!reference||!amount}\n' +
'            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!provider||!reference||!amount?"#1f2937":"#4ade80", color:!provider||!reference||!amount?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!provider||!reference||!amount?"not-allowed":"pointer" }}>\n' +
'            Pay '+u.title+'\n' +
'          </button>\n' +
'        </>\n' +
'      )}\n' +
'      {step === "pending" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />\n' +
'          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'          <p style={{ color:text, fontWeight:"700" }}>Processing Payment...</p>\n' +
'        </div>\n' +
'      )}\n' +
'      {step === "success" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>\n' +
'          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>\n' +
'          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Payment Successful!</p>\n' +
'          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>{provider} — {reference}</p>\n' +
'          <p style={{ color:"#f59e0b", fontSize:"12px", textAlign:"center" }}>🟡 Demo — no real payment was made</p>\n' +
'          <button onClick={() => { setStep("form"); setProvider(""); setReference(""); setAmount(""); }}\n' +
'            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>New Payment</button>\n' +
'        </div>\n' +
'      )}\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
  );
  console.log('✅ '+u.title+' page written');
});

console.log('\n🎉 All sub-pages written successfully!');