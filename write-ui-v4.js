const fs = require('fs');

// SHARED PAGE HEADER COMPONENT
fs.writeFileSync('components/PageHeader.tsx',
'"use client";\n' +
'import { useRouter } from "next/navigation";\n' +
'export function PageHeader({ title, badge }: { title: string; badge?: string }) {\n' +
'  const router = useRouter();\n' +
'  return (\n' +
'    <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>\n' +
'      <button onClick={() => router.back()}\n' +
'        style={{ width:"36px", height:"36px", borderRadius:"10px", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--text-2)", cursor:"pointer", fontSize:"16px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>\n' +
'        \u2190\n' +
'      </button>\n' +
'      <h1 style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em", flex:1 }}>{title}</h1>\n' +
'      {badge && <span className="zp-badge zp-badge-amber">{badge}</span>}\n' +
'    </div>\n' +
'  );\n' +
'}\n'
);
console.log("✅ PageHeader component");

// DEPOSIT PAGE
fs.writeFileSync('app/exchange/deposit/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
'const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];\n' +
'const AMOUNTS = ["1000","2000","5000","10000","20000","50000"];\n' +
'export default function DepositPage() {\n' +
'  const { settings } = useAppSettings();\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [bank, setBank] = useState("");\n' +
'  const [step, setStep] = useState("form");\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <PageHeader title="Deposit NGN" badge="Demo Mode" />\n' +
'        {step === "form" && (\n' +
'          <>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Amount (NGN)</p>\n' +
'              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="zp-input" style={{ fontSize:"24px", fontWeight:"800", marginBottom:"12px" }} />\n' +
'              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>\n' +
'                {AMOUNTS.map(a => (\n' +
'                  <button key={a} onClick={() => setAmount(a)}\n' +
'                    style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+(amount===a?"var(--green-border)":"var(--border)"), background:amount===a?"var(--green-dim)":"var(--surface-2)", color:amount===a?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"12px", fontWeight:"600" }}>\n' +
'                    \u20A6{Number(a).toLocaleString()}\n' +
'                  </button>\n' +
'                ))}\n' +
'              </div>\n' +
'            </div>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Select Bank</p>\n' +
'              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>\n' +
'                {BANKS.map(b => (\n' +
'                  <button key={b} onClick={() => setBank(b)}\n' +
'                    style={{ padding:"14px 16px", borderRadius:"12px", border:"1px solid "+(bank===b?"var(--green-border)":"var(--border)"), background:bank===b?"var(--green-dim)":"var(--surface-2)", color:"var(--text)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:"14px", fontWeight:bank===b?"600":"400" }}>\n' +
'                    {b}\n' +
'                    {bank===b && <span style={{ color:"var(--green)", fontSize:"16px" }}>\u2713</span>}\n' +
'                  </button>\n' +
'                ))}\n' +
'              </div>\n' +
'            </div>\n' +
'            {amount && (\n' +
'              <div className="zp-card">\n' +
'                {[{label:"You pay",value:"\u20A6"+Number(amount).toLocaleString()},{label:"You receive",value:(Number(amount)/1650).toFixed(2)+" USDC"},{label:"Rate",value:"\u20A61,650 = 1 USDC"},{label:"Status",value:"\uD83D\uDFE1 Demo Mode"}].map((r,i) => (\n' +
'                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:i<3?"1px solid var(--border)":"none" }}>\n' +
'                    <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{r.label}</span>\n' +
'                    <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>{r.value}</span>\n' +
'                  </div>\n' +
'                ))}\n' +
'              </div>\n' +
'            )}\n' +
'            <button onClick={() => { if(!amount||!bank) return; setStep("pending"); setTimeout(()=>setStep("success"),2500); }} disabled={!amount||!bank} className="zp-btn-primary">\n' +
'              {!amount?"Enter amount":!bank?"Select a bank":"Deposit NGN"}\n' +
'            </button>\n' +
'          </>\n' +
'        )}\n' +
'        {step==="pending" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"48px 24px" }}>\n' +
'            <div className="zp-spinner" />\n' +
'            <p style={{ color:"var(--text)", fontWeight:"700" }}>Processing Deposit...</p>\n' +
'            <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Demo mode \u00B7 Simulating bank transfer</p>\n' +
'          </div>\n' +
'        )}\n' +
'        {step==="success" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"48px 24px" }}>\n' +
'            <div className="zp-result-icon success">\u2713</div>\n' +
'            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Deposit Initiated!</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>\u20A6{Number(amount).toLocaleString()} via {bank}</p>\n' +
'            <span className="zp-badge zp-badge-amber">\uD83D\uDFE1 Demo \u2014 no real funds moved</span>\n' +
'            <button onClick={() => { setStep("form"); setAmount(""); setBank(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>New Deposit</button>\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log("✅ Deposit page");

// WITHDRAW PAGE
fs.writeFileSync('app/exchange/withdraw/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
'const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];\n' +
'const AMOUNTS = ["10","20","50","100","200","500"];\n' +
'export default function WithdrawPage() {\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const { usdcFormatted } = useWalletBalance(address);\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [bank, setBank] = useState("");\n' +
'  const [accountNumber, setAccountNumber] = useState("");\n' +
'  const [accountName, setAccountName] = useState("");\n' +
'  const [step, setStep] = useState("form");\n' +
'  const ngnAmount = amount ? (Number(amount)*1650).toLocaleString() : "--";\n' +
'  function handleVerify() { if (accountNumber.length===10) setAccountName("John Doe (Demo)"); }\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <PageHeader title="Withdraw to Bank" badge="Demo Mode" />\n' +
'        <div style={{ background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:"12px", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'          <span style={{ fontSize:"13px", color:"var(--text-2)" }}>Available USDC</span>\n' +
'          <span style={{ fontSize:"14px", fontWeight:"700", color:"var(--green)" }}>{usdcFormatted} USDC</span>\n' +
'        </div>\n' +
'        {step==="form" && (\n' +
'          <>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Amount (USDC)</p>\n' +
'              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="zp-input" style={{ fontSize:"24px", fontWeight:"800", marginBottom:"12px" }} />\n' +
'              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"12px" }}>\n' +
'                {AMOUNTS.map(a => (\n' +
'                  <button key={a} onClick={() => setAmount(a)}\n' +
'                    style={{ padding:"10px", borderRadius:"10px", border:"1px solid "+(amount===a?"var(--green-border)":"var(--border)"), background:amount===a?"var(--green-dim)":"var(--surface-2)", color:amount===a?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"12px", fontWeight:"600" }}>\n' +
'                    {a} USDC\n' +
'                  </button>\n' +
'                ))}\n' +
'              </div>\n' +
'              {amount && <p style={{ fontSize:"13px", color:"var(--green)", textAlign:"right" }}>\u2248 \u20A6{ngnAmount}</p>}\n' +
'            </div>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Bank Details</p>\n' +
'              <select value={bank} onChange={e => setBank(e.target.value)} className="zp-input" style={{ marginBottom:"12px" }}>\n' +
'                <option value="">Select bank</option>\n' +
'                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}\n' +
'              </select>\n' +
'              <input type="text" placeholder="Account number (10 digits)" value={accountNumber} onChange={e => { setAccountNumber(e.target.value); setAccountName(""); }} onBlur={handleVerify} maxLength={10} className="zp-input" style={{ marginBottom:"8px" }} />\n' +
'              {accountName && <p style={{ fontSize:"13px", color:"var(--green)", fontWeight:"600" }}>\u2713 {accountName}</p>}\n' +
'            </div>\n' +
'            <button onClick={() => setStep("confirm")} disabled={!amount||!bank||accountNumber.length<10} className="zp-btn-primary">Continue</button>\n' +
'          </>\n' +
'        )}\n' +
'        {step==="confirm" && (\n' +
'          <>\n' +
'            <div className="zp-card">\n' +
'              <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"16px" }}>Confirm Withdrawal</p>\n' +
'              {[{label:"Amount",value:amount+" USDC"},{label:"You receive",value:"\u20A6"+ngnAmount},{label:"Bank",value:bank},{label:"Account",value:accountNumber},{label:"Name",value:accountName},{label:"Rate",value:"1 USDC = \u20A61,650"},{label:"Status",value:"\uD83D\uDFE1 Demo Mode"}].map((r,i) => (\n' +
'                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:i<6?"1px solid var(--border)":"none" }}>\n' +
'                  <span style={{ fontSize:"13px", color:"var(--text-2)" }}>{r.label}</span>\n' +
'                  <span style={{ fontSize:"13px", fontWeight:"600", color:"var(--text)" }}>{r.value}</span>\n' +
'                </div>\n' +
'              ))}\n' +
'            </div>\n' +
'            <div style={{ display:"flex", gap:"10px" }}>\n' +
'              <button onClick={() => setStep("form")} className="zp-btn-secondary">Back</button>\n' +
'              <button onClick={() => { setStep("pending"); setTimeout(()=>setStep("success"),3000); }} className="zp-btn-primary">Confirm</button>\n' +
'            </div>\n' +
'          </>\n' +
'        )}\n' +
'        {step==="pending" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"48px 24px" }}>\n' +
'            <div className="zp-spinner" />\n' +
'            <p style={{ color:"var(--text)", fontWeight:"700" }}>Processing Withdrawal...</p>\n' +
'          </div>\n' +
'        )}\n' +
'        {step==="success" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"48px 24px" }}>\n' +
'            <div className="zp-result-icon success">\u2713</div>\n' +
'            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Withdrawal Initiated!</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{amount} USDC \u2192 \u20A6{ngnAmount} to {bank}</p>\n' +
'            <span className="zp-badge zp-badge-amber">\uD83D\uDFE1 Demo \u2014 no real funds moved</span>\n' +
'            <button onClick={() => { setStep("form"); setAmount(""); setBank(""); setAccountNumber(""); setAccountName(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>New Withdrawal</button>\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log("✅ Withdraw page");

// UTILITY HUB
fs.writeFileSync('app/exchange/utility/page.tsx',
'"use client";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
'const UTILITIES = [\n' +
'  { label:"Airtime", icon:"\uD83D\uDCF1", path:"/exchange/utility/airtime", color:"rgba(46,204,113,0.15)", iconColor:"var(--green)" },\n' +
'  { label:"Electricity", icon:"\u26A1", path:"/exchange/utility/electricity", color:"rgba(240,165,0,0.15)", iconColor:"var(--amber)" },\n' +
'  { label:"Data", icon:"\uD83D\uDCF6", path:"/exchange/utility/data", color:"rgba(59,130,246,0.15)", iconColor:"#3B82F6" },\n' +
'  { label:"TV", icon:"\uD83D\uDCFA", path:"/exchange/utility/tv", color:"rgba(167,139,250,0.15)", iconColor:"#A78BFA" },\n' +
'  { label:"Internet", icon:"\uD83C\uDF10", path:"/exchange/utility/internet", color:"rgba(52,211,153,0.15)", iconColor:"#34D399" },\n' +
'  { label:"Water", icon:"\uD83D\uDCA7", path:"/exchange/utility/water", color:"rgba(56,189,248,0.15)", iconColor:"#38BDF8" },\n' +
'];\n' +
'export default function UtilityPage() {\n' +
'  const router = useRouter();\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <PageHeader title="Utility Bills" badge="Demo Mode" />\n' +
'        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>\n' +
'          {UTILITIES.map(u => (\n' +
'            <button key={u.path} onClick={() => router.push(u.path)}\n' +
'              style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"12px", cursor:"pointer" }}>\n' +
'              <div style={{ width:"44px", height:"44px", borderRadius:"14px", background:u.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{u.icon}</div>\n' +
'              <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>{u.label}</p>\n' +
'            </button>\n' +
'          ))}\n' +
'        </div>\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log("✅ Utility hub");

// BANKS PAGE
fs.writeFileSync('app/exchange/banks/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
'const BANKS = ["Access Bank","GTBank","First Bank","Zenith Bank","UBA","Kuda Bank","Opay","Palmpay"];\n' +
'export default function BanksPage() {\n' +
'  const [savedBanks, setSavedBanks] = useState([{ bank:"GTBank", account:"0123456789", name:"John Doe" }]);\n' +
'  const [showForm, setShowForm] = useState(false);\n' +
'  const [bank, setBank] = useState("");\n' +
'  const [account, setAccount] = useState("");\n' +
'  const [name, setName] = useState("");\n' +
'  function handleAdd() { if(!bank||!account||!name) return; setSavedBanks([...savedBanks,{bank,account,name}]); setBank(""); setAccount(""); setName(""); setShowForm(false); }\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"8px" }}>\n' +
'          <PageHeader title="Bank Accounts" />\n' +
'          <button onClick={() => setShowForm(!showForm)}\n' +
'            style={{ marginLeft:"auto", padding:"8px 16px", borderRadius:"10px", border:"none", background:"var(--green)", color:"#080C12", fontWeight:"700", fontSize:"13px", cursor:"pointer", flexShrink:0 }}>+ Add</button>\n' +
'        </div>\n' +
'        {showForm && (\n' +
'          <div className="zp-card">\n' +
'            <p className="zp-label">Add Bank Account</p>\n' +
'            <select value={bank} onChange={e => setBank(e.target.value)} className="zp-input" style={{ marginBottom:"10px" }}>\n' +
'              <option value="">Select bank</option>\n' +
'              {BANKS.map(b => <option key={b} value={b}>{b}</option>)}\n' +
'            </select>\n' +
'            <input type="text" placeholder="Account number" value={account} onChange={e => setAccount(e.target.value)} maxLength={10} className="zp-input" style={{ marginBottom:"10px" }} />\n' +
'            <input type="text" placeholder="Account name" value={name} onChange={e => setName(e.target.value)} className="zp-input" style={{ marginBottom:"16px" }} />\n' +
'            <div style={{ display:"flex", gap:"10px" }}>\n' +
'              <button onClick={() => setShowForm(false)} className="zp-btn-secondary">Cancel</button>\n' +
'              <button onClick={handleAdd} disabled={!bank||!account||!name} className="zp-btn-primary">Save Account</button>\n' +
'            </div>\n' +
'          </div>\n' +
'        )}\n' +
'        {savedBanks.length === 0 ? (\n' +
'          <div className="zp-card" style={{ textAlign:"center", padding:"40px 24px" }}>\n' +
'            <p style={{ fontSize:"32px", marginBottom:"12px" }}>\uD83C\uDFE6</p>\n' +
'            <p style={{ fontSize:"15px", fontWeight:"600", color:"var(--text)", marginBottom:"6px" }}>No bank accounts yet</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)" }}>Add a bank account to enable withdrawals</p>\n' +
'          </div>\n' +
'        ) : (\n' +
'          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>\n' +
'            {savedBanks.map((b,i) => (\n' +
'              <div key={i} className="zp-card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'                <div>\n' +
'                  <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)", marginBottom:"3px" }}>{b.bank}</p>\n' +
'                  <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace" }}>{b.account}</p>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"2px" }}>{b.name}</p>\n' +
'                </div>\n' +
'                <button onClick={() => setSavedBanks(savedBanks.filter((_,idx) => idx!==i))}\n' +
'                  style={{ padding:"8px 14px", borderRadius:"10px", border:"1px solid rgba(231,76,60,0.25)", background:"var(--red-dim)", color:"var(--red)", cursor:"pointer", fontSize:"12px", fontWeight:"600" }}>Remove</button>\n' +
'              </div>\n' +
'            ))}\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log("✅ Banks page");

// MERCHANT REGISTER
fs.writeFileSync('app/merchant/register/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
'const CATEGORIES = ["Retail & Shopping","Food & Drinks","Services","Technology","Health & Beauty","Education","Entertainment","Other"];\n' +
'const EMOJIS = ["\uD83C\uDFEA","\uD83C\uDF54","\uD83D\uDCBB","\uD83D\uDCF1","\uD83D\uDED6","\uD83D\uDC87","\uD83C\uDFAE","\uD83C\uDFE5","\uD83D\uDCDA","\uD83C\uDFB5","\uD83C\uDF3F","\uD83D\uDE97"];\n' +
'export default function MerchantRegisterPage() {\n' +
'  const router = useRouter();\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [name, setName] = useState("");\n' +
'  const [category, setCategory] = useState("");\n' +
'  const [description, setDescription] = useState("");\n' +
'  const [emoji, setEmoji] = useState("\uD83C\uDFEA");\n' +
'  const [step, setStep] = useState("form");\n' +
'  function handleRegister() {\n' +
'    if (!name||!category) return;\n' +
'    localStorage.setItem("zarpay_merchant_"+address, JSON.stringify({ name, category, description, emoji, address, registeredAt: new Date().toISOString() }));\n' +
'    setStep("success");\n' +
'  }\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <PageHeader title="Register as Merchant" />\n' +
'        {step==="form" && (\n' +
'          <>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Business Info</p>\n' +
'              <input type="text" placeholder="Business name" value={name} onChange={e => setName(e.target.value)} className="zp-input" style={{ marginBottom:"10px" }} />\n' +
'              <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}\n' +
'                style={{ width:"100%", padding:"14px 16px", borderRadius:"12px", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--text)", fontSize:"14px", minHeight:"80px", resize:"none", fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />\n' +
'            </div>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Category</p>\n' +
'              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>\n' +
'                {CATEGORIES.map(c => (\n' +
'                  <button key={c} onClick={() => setCategory(c)}\n' +
'                    style={{ padding:"12px", borderRadius:"10px", border:"1px solid "+(category===c?"var(--green-border)":"var(--border)"), background:category===c?"var(--green-dim)":"var(--surface-2)", color:category===c?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"12px", fontWeight:category===c?"700":"400", textAlign:"left" }}>\n' +
'                    {c}\n' +
'                  </button>\n' +
'                ))}\n' +
'              </div>\n' +
'            </div>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Business Icon</p>\n' +
'              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>\n' +
'                {EMOJIS.map(e => (\n' +
'                  <button key={e} onClick={() => setEmoji(e)}\n' +
'                    style={{ padding:"12px", borderRadius:"10px", border:"1px solid "+(emoji===e?"var(--green-border)":"var(--border)"), background:emoji===e?"var(--green-dim)":"var(--surface-2)", cursor:"pointer", fontSize:"20px", textAlign:"center" }}>\n' +
'                    {e}\n' +
'                  </button>\n' +
'                ))}\n' +
'              </div>\n' +
'            </div>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Payment Address</p>\n' +
'              <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", wordBreak:"break-all", marginBottom:"6px" }}>{address}</p>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-2)" }}>Customers will send USDC directly to this address. You receive EURC.</p>\n' +
'            </div>\n' +
'            <button onClick={handleRegister} disabled={!name||!category} className="zp-btn-primary">\n' +
'              {!name?"Enter business name":!category?"Select a category":"Complete Registration"}\n' +
'            </button>\n' +
'          </>\n' +
'        )}\n' +
'        {step==="success" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px 24px" }}>\n' +
'            <div style={{ width:"72px", height:"72px", borderRadius:"20px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"32px" }}>{emoji}</div>\n' +
'            <p style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", textAlign:"center" }}>Welcome, {name}!</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>Your merchant account is active. Share your QR code to start accepting EURC payments.</p>\n' +
'            <button onClick={() => router.push("/merchant/pay?merchant="+address)} className="zp-btn-primary">View My QR Code</button>\n' +
'            <button onClick={() => router.push("/merchant/dashboard")} className="zp-btn-secondary">Go to Dashboard</button>\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log("✅ Merchant register");

// UTILITY SUB-PAGES (all 6)
const utilities = [
  { folder:"airtime", title:"Airtime", icon:"\uD83D\uDCF1", providers:["MTN","Airtel","Glo","9mobile"] },
  { folder:"electricity", title:"Electricity", icon:"\u26A1", providers:["EKEDC","IKEDC","AEDC","PHEDC","EEDC"] },
  { folder:"data", title:"Data", icon:"\uD83D\uDCF6", providers:["MTN Data","Airtel Data","Glo Data","9mobile Data"] },
  { folder:"tv", title:"TV", icon:"\uD83D\uDCFA", providers:["DSTV","GOtv","Startimes","NTA"] },
  { folder:"internet", title:"Internet", icon:"\uD83C\uDF10", providers:["Spectranet","Smile","Swift","ipNX"] },
  { folder:"water", title:"Water", icon:"\uD83D\uDCA7", providers:["Lagos Water","Abuja Water","Rivers Water"] },
];

utilities.forEach(u => {
  const providerList = u.providers.map(p => `"${p}"`).join(",");
  fs.writeFileSync(`app/exchange/utility/${u.folder}/page.tsx`,
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
`const PROVIDERS = [${providerList}];\n` +
`export default function ${u.title.replace(/\s/g,"")}Page() {\n` +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const { usdcFormatted } = useWalletBalance(address);\n' +
'  const [provider, setProvider] = useState("");\n' +
'  const [reference, setReference] = useState("");\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [step, setStep] = useState("form");\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
`        <PageHeader title="${u.icon} ${u.title}" badge="Demo" />\n` +
'        <div style={{ background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:"12px", padding:"14px 16px", display:"flex", justifyContent:"space-between" }}>\n' +
'          <span style={{ fontSize:"13px", color:"var(--text-2)" }}>Available USDC</span>\n' +
'          <span style={{ fontSize:"13px", fontWeight:"700", color:"var(--green)" }}>{usdcFormatted} USDC</span>\n' +
'        </div>\n' +
'        {step==="form" && (\n' +
'          <>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Provider</p>\n' +
'              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>\n' +
'                {PROVIDERS.map(p => (\n' +
'                  <button key={p} onClick={() => setProvider(p)}\n' +
'                    style={{ padding:"14px 16px", borderRadius:"12px", border:"1px solid "+(provider===p?"var(--green-border)":"var(--border)"), background:provider===p?"var(--green-dim)":"var(--surface-2)", color:"var(--text)", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", fontSize:"14px", fontWeight:provider===p?"600":"400" }}>\n' +
'                    {p} {provider===p && <span style={{ color:"var(--green)" }}>\u2713</span>}\n' +
'                  </button>\n' +
'                ))}\n' +
'              </div>\n' +
'            </div>\n' +
'            <div className="zp-card">\n' +
'              <p className="zp-label">Reference / Number</p>\n' +
'              <input type="text" placeholder="Enter meter/phone/account number" value={reference} onChange={e => setReference(e.target.value)} className="zp-input" style={{ marginBottom:"12px" }} />\n' +
'              <p className="zp-label">Amount (USDC)</p>\n' +
'              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="zp-input" style={{ fontSize:"20px", fontWeight:"700" }} />\n' +
'            </div>\n' +
`            <button onClick={() => { if(!provider||!reference||!amount) return; setStep("pending"); setTimeout(()=>setStep("success"),2500); }} disabled={!provider||!reference||!amount} className="zp-btn-primary">Pay ${u.title}</button>\n` +
'          </>\n' +
'        )}\n' +
'        {step==="pending" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"48px 24px" }}>\n' +
'            <div className="zp-spinner" />\n' +
'            <p style={{ color:"var(--text)", fontWeight:"700" }}>Processing Payment...</p>\n' +
'          </div>\n' +
'        )}\n' +
'        {step==="success" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"48px 24px" }}>\n' +
'            <div className="zp-result-icon success">\u2713</div>\n' +
'            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Payment Successful!</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{provider} \u00B7 {reference}</p>\n' +
'            <span className="zp-badge zp-badge-amber">\uD83D\uDFE1 Demo \u2014 no real payment made</span>\n' +
'            <button onClick={() => { setStep("form"); setProvider(""); setReference(""); setAmount(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>New Payment</button>\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
  );
  console.log(`✅ ${u.title} utility page`);
});

console.log("\n🎉 UI v4 complete. Run: npm run dev");