const fs = require('fs');

fs.mkdirSync('app/merchant', { recursive: true });
fs.mkdirSync('app/merchant/register', { recursive: true });
fs.mkdirSync('app/merchant/dashboard', { recursive: true });
fs.mkdirSync('app/merchant/pay', { recursive: true });

// MERCHANT HUB
fs.writeFileSync('app/merchant/page.tsx',
'"use client";\n' +
'import { useState, useEffect } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'export default function MerchantPage() {\n' +
'  const router = useRouter();\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'  useEffect(() => {\n' +
'    setMounted(true);\n' +
'    const saved = localStorage.getItem("zarpay_merchant_"+address);\n' +
'    if (saved) setMerchant(JSON.parse(saved));\n' +
'  }, [address]);\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", marginBottom:"28px" }}>\n' +
'        <h1 style={{ color:text, fontSize:"22px", fontWeight:"700" }}>Merchant</h1>\n' +
'        <p style={{ color:subText, fontSize:"13px", marginTop:"4px" }}>Accept EURC payments from customers</p>\n' +
'      </div>\n' +
'      {!isConnected ? (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", textAlign:"center" }}>\n' +
'          <p style={{ fontSize:"32px", marginBottom:"12px" }}>🔌</p>\n' +
'          <p style={{ color:text, fontWeight:"700", fontSize:"16px" }}>Connect your wallet</p>\n' +
'          <p style={{ color:subText, fontSize:"13px", marginTop:"8px" }}>You need a connected wallet to register as a merchant</p>\n' +
'        </div>\n' +
'      ) : merchant ? (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"20px", padding:"24px", marginBottom:"16px" }}>\n' +
'            <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"16px" }}>\n' +
'              <div style={{ width:"56px", height:"56px", borderRadius:"16px", background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>\n' +
'                {merchant.emoji || "🏪"}\n' +
'              </div>\n' +
'              <div>\n' +
'                <p style={{ color:text, fontWeight:"700", fontSize:"18px", margin:0 }}>{merchant.name}</p>\n' +
'                <p style={{ color:subText, fontSize:"12px", marginTop:"4px" }}>{merchant.category}</p>\n' +
'              </div>\n' +
'              <div style={{ marginLeft:"auto", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", borderRadius:"8px", padding:"4px 10px" }}>\n' +
'                <span style={{ color:"#4ade80", fontSize:"11px", fontWeight:"700" }}>✓ Active</span>\n' +
'              </div>\n' +
'            </div>\n' +
'            <p style={{ color:subText, fontSize:"12px", fontFamily:"monospace", wordBreak:"break-all" }}>{address}</p>\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>\n' +
'            <button onClick={() => router.push("/merchant/dashboard")}\n' +
'              style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>\n' +
'              <span style={{ fontSize:"24px" }}>📊</span>\n' +
'              <p style={{ color:text, fontWeight:"700", margin:0 }}>Dashboard</p>\n' +
'              <p style={{ color:subText, fontSize:"11px", margin:0 }}>View payments</p>\n' +
'            </button>\n' +
'            <button onClick={() => router.push("/merchant/pay?merchant="+address)}\n' +
'              style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>\n' +
'              <span style={{ fontSize:"24px" }}>📱</span>\n' +
'              <p style={{ color:text, fontWeight:"700", margin:0 }}>QR Code</p>\n' +
'              <p style={{ color:subText, fontSize:"11px", margin:0 }}>Show payment QR</p>\n' +
'            </button>\n' +
'          </div>\n' +
'          <button onClick={() => { localStorage.removeItem("zarpay_merchant_"+address); setMerchant(null); }}\n' +
'            style={{ width:"100%", maxWidth:"440px", padding:"14px", borderRadius:"14px", border:"1px solid rgba(248,113,113,0.3)", background:"rgba(248,113,113,0.05)", color:"#f87171", fontWeight:"600", cursor:"pointer", fontSize:"14px" }}>\n' +
'            Unregister Merchant\n' +
'          </button>\n' +
'        </>\n' +
'      ) : (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"32px", marginBottom:"16px", textAlign:"center" }}>\n' +
'            <p style={{ fontSize:"48px", marginBottom:"16px" }}>🏪</p>\n' +
'            <p style={{ color:text, fontWeight:"700", fontSize:"18px", marginBottom:"8px" }}>Become a Merchant</p>\n' +
'            <p style={{ color:subText, fontSize:"13px", marginBottom:"24px" }}>Register to accept EURC payments from ZarPay customers via QR code or wallet address</p>\n' +
'            <div style={{ display:"flex", flexDirection:"column", gap:"10px", textAlign:"left", marginBottom:"24px" }}>\n' +
'              {["Accept EURC payments instantly","Share your QR code with customers","Track all incoming payments","No monthly fees"].map((f,i) => (\n' +
'                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>\n' +
'                  <span style={{ color:"#4ade80", fontSize:"16px" }}>✓</span>\n' +
'                  <span style={{ color:subText, fontSize:"13px" }}>{f}</span>\n' +
'                </div>\n' +
'              ))}\n' +
'            </div>\n' +
'            <button onClick={() => router.push("/merchant/register")}\n' +
'              style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"16px", cursor:"pointer" }}>\n' +
'              Register as Merchant\n' +
'            </button>\n' +
'          </div>\n' +
'        </>\n' +
'      )}\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Merchant hub written');

// MERCHANT REGISTER PAGE
fs.writeFileSync('app/merchant/register/page.tsx',
'"use client";\n' +
'import { useState } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'const CATEGORIES = ["Retail & Shopping","Food & Drinks","Services","Technology","Health & Beauty","Education","Entertainment","Other"];\n' +
'const EMOJIS = ["🏪","🍔","💻","📱","🛍️","💇","🎮","🏥","📚","🎵","🌿","🚗"];\n' +
'export default function MerchantRegisterPage() {\n' +
'  const router = useRouter();\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const inputBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const [name, setName] = useState("");\n' +
'  const [category, setCategory] = useState("");\n' +
'  const [description, setDescription] = useState("");\n' +
'  const [emoji, setEmoji] = useState("🏪");\n' +
'  const [step, setStep] = useState("form");\n' +
'  function handleRegister() {\n' +
'    if (!name||!category) return;\n' +
'    const merchant = { name, category, description, emoji, address, registeredAt: new Date().toISOString() };\n' +
'    localStorage.setItem("zarpay_merchant_"+address, JSON.stringify(merchant));\n' +
'    setStep("success");\n' +
'  }\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Register as Merchant</h1>\n' +
'      </div>\n' +
'      {step === "form" && (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Business Info</p>\n' +
'            <input type="text" placeholder="Business name" value={name} onChange={e => setName(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"16px", boxSizing:"border-box", marginBottom:"12px" }} />\n' +
'            <textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)}\n' +
'              style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"14px", boxSizing:"border-box", minHeight:"80px", resize:"none", fontFamily:"inherit" }} />\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Category</p>\n' +
'            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>\n' +
'              {CATEGORIES.map(c => (\n' +
'                <button key={c} onClick={() => setCategory(c)}\n' +
'                  style={{ padding:"12px", borderRadius:"12px", border:"1px solid "+(category===c?"rgba(74,222,128,0.4)":border), background:category===c?"rgba(74,222,128,0.08)":inputBg, color:text, cursor:"pointer", fontSize:"12px", fontWeight:category===c?"700":"400", textAlign:"left" }}>\n' +
'                  {c}\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Choose an Icon</p>\n' +
'            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"8px" }}>\n' +
'              {EMOJIS.map(e => (\n' +
'                <button key={e} onClick={() => setEmoji(e)}\n' +
'                  style={{ padding:"12px", borderRadius:"12px", border:"1px solid "+(emoji===e?"rgba(74,222,128,0.4)":border), background:emoji===e?"rgba(74,222,128,0.08)":inputBg, cursor:"pointer", fontSize:"20px", textAlign:"center" }}>\n' +
'                  {e}\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'          </div>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"16px", padding:"16px", marginBottom:"16px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Payment Address</p>\n' +
'            <p style={{ color:"#4ade80", fontSize:"12px", fontFamily:"monospace", wordBreak:"break-all" }}>{address}</p>\n' +
'            <p style={{ color:subText, fontSize:"11px", marginTop:"8px" }}>Customers will send EURC directly to this wallet address</p>\n' +
'          </div>\n' +
'          <button onClick={handleRegister} disabled={!name||!category}\n' +
'            style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!name||!category?"#1f2937":"#4ade80", color:!name||!category?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!name||!category?"not-allowed":"pointer" }}>\n' +
'            {!name?"Enter business name":!category?"Select a category":"Complete Registration"}\n' +
'          </button>\n' +
'        </>\n' +
'      )}\n' +
'      {step === "success" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'          <div style={{ width:"72px", height:"72px", borderRadius:"20px", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"32px" }}>{emoji}</div>\n' +
'          <p style={{ color:text, fontWeight:"700", fontSize:"22px" }}>Welcome, {name}!</p>\n' +
'          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>Your merchant account is active. Share your QR code to start accepting EURC payments.</p>\n' +
'          <div style={{ display:"flex", flexDirection:"column", gap:"10px", width:"100%" }}>\n' +
'            <button onClick={() => router.push("/merchant/pay?merchant="+address)}\n' +
'              style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>View My QR Code</button>\n' +
'            <button onClick={() => router.push("/merchant/dashboard")}\n' +
'              style={{ width:"100%", padding:"16px", borderRadius:"14px", border:"1px solid "+border, background:"transparent", color:text, fontWeight:"700", fontSize:"15px", cursor:"pointer" }}>Go to Dashboard</button>\n' +
'          </div>\n' +
'        </div>\n' +
'      )}\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Merchant register page written');

// MERCHANT DASHBOARD
fs.writeFileSync('app/merchant/dashboard/page.tsx',
'"use client";\n' +
'import { useState, useEffect } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useReadContract } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { EURC_ADDRESS, ERC20_ABI, TOKEN_DECIMALS } from "@/lib/contracts";\n' +
'import { formatUnits } from "viem";\n' +
'export default function MerchantDashboardPage() {\n' +
'  const router = useRouter();\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'  useEffect(() => {\n' +
'    setMounted(true);\n' +
'    const saved = localStorage.getItem("zarpay_merchant_"+address);\n' +
'    if (saved) setMerchant(JSON.parse(saved));\n' +
'  }, [address]);\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const { data: eurcBalance } = useReadContract({\n' +
'    address: EURC_ADDRESS,\n' +
'    abi: ERC20_ABI,\n' +
'    functionName: "balanceOf",\n' +
'    args: address ? [address] : undefined,\n' +
'    query: { enabled: !!address },\n' +
'  });\n' +
'  const eurcFormatted = eurcBalance ? Number(formatUnits(eurcBalance as bigint, TOKEN_DECIMALS)).toFixed(2) : "0.00";\n' +
'  if (!mounted) return null;\n' +
'  if (!merchant) return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", textAlign:"center", marginTop:"40px" }}>\n' +
'        <p style={{ fontSize:"32px", marginBottom:"12px" }}>🏪</p>\n' +
'        <p style={{ color:text, fontWeight:"700" }}>Not registered as a merchant</p>\n' +
'        <button onClick={() => router.push("/merchant/register")}\n' +
'          style={{ marginTop:"16px", padding:"14px 24px", borderRadius:"12px", border:"none", background:"#4ade80", color:"#111", fontWeight:"700", cursor:"pointer" }}>Register Now</button>\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Merchant Dashboard</h1>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:"20px", padding:"24px", marginBottom:"16px" }}>\n' +
'        <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>\n' +
'          <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"rgba(74,222,128,0.15)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px" }}>{merchant.emoji}</div>\n' +
'          <div>\n' +
'            <p style={{ color:text, fontWeight:"700", fontSize:"16px", margin:0 }}>{merchant.name}</p>\n' +
'            <p style={{ color:subText, fontSize:"12px", margin:"2px 0 0" }}>{merchant.category}</p>\n' +
'          </div>\n' +
'        </div>\n' +
'        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>\n' +
'          <div style={{ background:card, border:"1px solid "+border, borderRadius:"14px", padding:"16px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>EURC Balance</p>\n' +
'            <p style={{ color:"#4ade80", fontSize:"22px", fontWeight:"800", margin:0 }}>{eurcFormatted}</p>\n' +
'            <p style={{ color:subText, fontSize:"11px", margin:"2px 0 0" }}>EURC received</p>\n' +
'          </div>\n' +
'          <div style={{ background:card, border:"1px solid "+border, borderRadius:"14px", padding:"16px" }}>\n' +
'            <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>Status</p>\n' +
'            <p style={{ color:"#4ade80", fontSize:"16px", fontWeight:"700", margin:0 }}>✓ Active</p>\n' +
'            <p style={{ color:subText, fontSize:"11px", margin:"2px 0 0" }}>Accepting payments</p>\n' +
'          </div>\n' +
'        </div>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"16px" }}>\n' +
'        <button onClick={() => router.push("/merchant/pay?merchant="+address)}\n' +
'          style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>\n' +
'          <span style={{ fontSize:"24px" }}>📱</span>\n' +
'          <p style={{ color:text, fontWeight:"700", margin:0 }}>My QR Code</p>\n' +
'          <p style={{ color:subText, fontSize:"11px", margin:0 }}>Show to customers</p>\n' +
'        </button>\n' +
'        <button onClick={() => { navigator.clipboard.writeText(address||""); }}\n' +
'          style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"8px", cursor:"pointer" }}>\n' +
'          <span style={{ fontSize:"24px" }}>📋</span>\n' +
'          <p style={{ color:text, fontWeight:"700", margin:0 }}>Copy Address</p>\n' +
'          <p style={{ color:subText, fontSize:"11px", margin:0 }}>Share payment link</p>\n' +
'        </button>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px" }}>\n' +
'        <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"16px" }}>Payment Address</p>\n' +
'        <p style={{ color:"#4ade80", fontSize:"12px", fontFamily:"monospace", wordBreak:"break-all", marginBottom:"8px" }}>{address}</p>\n' +
'        <p style={{ color:subText, fontSize:"11px" }}>Customers pay USDC → automatically converted to EURC and sent to this address</p>\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Merchant dashboard written');

// MERCHANT PAY / QR PAGE
fs.writeFileSync('app/merchant/pay/page.tsx',
'"use client";\n' +
'import { useState, useEffect, Suspense } from "react";\n' +
'import { useRouter, useSearchParams } from "next/navigation";\n' +
'import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";\n' +
'import { parseUnits, formatUnits } from "viem";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { USDC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";\n' +
'function PayContent() {\n' +
'  const router = useRouter();\n' +
'  const searchParams = useSearchParams();\n' +
'  const merchantAddress = searchParams.get("merchant") || "";\n' +
'  const { address, isConnected } = useAccount();\n' +
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
'  const [netOut, setNetOut] = useState("");\n' +
'  const [feeAmount, setFeeAmount] = useState("");\n' +
'  const [step, setStep] = useState("qr");\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'  const amountIn = amount && Number(amount) > 0 ? parseUnits(amount, TOKEN_DECIMALS) : BigInt(0);\n' +
'  useEffect(() => {\n' +
'    if (merchantAddress) {\n' +
'      const saved = localStorage.getItem("zarpay_merchant_"+merchantAddress);\n' +
'      if (saved) setMerchant(JSON.parse(saved));\n' +
'    }\n' +
'  }, [merchantAddress]);\n' +
'  const { refetch: refetchPreview } = useReadContract({\n' +
'    address: ZARPAY_SWAP_POOL_ADDRESS,\n' +
'    abi: ZARPAY_SWAP_POOL_ABI,\n' +
'    functionName: "previewSwapAfterFee",\n' +
'    args: [amountIn, true],\n' +
'    query: { enabled: false },\n' +
'  });\n' +
'  const { data: allowance, refetch: refetchAllowance } = useReadContract({\n' +
'    address: USDC_ADDRESS,\n' +
'    abi: ERC20_ABI,\n' +
'    functionName: "allowance",\n' +
'    args: address ? [address, ZARPAY_SWAP_POOL_ADDRESS] : undefined,\n' +
'    query: { enabled: !!address },\n' +
'  });\n' +
'  const needsApproval = !allowance || allowance < amountIn;\n' +
'  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();\n' +
'  const { writeContract: writePay, data: payHash, error: payError, reset: resetPay } = useWriteContract();\n' +
'  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });\n' +
'  const { isLoading: payConfirming, isSuccess: payConfirmed } = useWaitForTransactionReceipt({ hash: payHash });\n' +
'  useEffect(() => {\n' +
'    if (approveConfirmed && step === "approving") { refetchAllowance(); runPay(); }\n' +
'  }, [approveConfirmed]);\n' +
'  useEffect(() => {\n' +
'    if (payConfirmed && step === "paying") setStep("success");\n' +
'  }, [payConfirmed]);\n' +
'  useEffect(() => {\n' +
'    if (amountIn > BigInt(0)) {\n' +
'      refetchPreview().then(res => {\n' +
'        const data = res.data as [bigint,bigint] | undefined;\n' +
'        if (data) { setNetOut(formatUnits(data[0],TOKEN_DECIMALS)); setFeeAmount(formatUnits(data[1],TOKEN_DECIMALS)); }\n' +
'      });\n' +
'    } else { setNetOut(""); setFeeAmount(""); }\n' +
'  }, [amount]);\n' +
'  function runPay() {\n' +
'    setStep("paying");\n' +
'    writePay({\n' +
'      address: ZARPAY_SWAP_POOL_ADDRESS,\n' +
'      abi: ZARPAY_SWAP_POOL_ABI,\n' +
'      functionName: "payMerchant",\n' +
'      args: [merchantAddress as `0x${string}`, amountIn],\n' +
'    });\n' +
'  }\n' +
'  function handlePay() {\n' +
'    if (!isConnected||!amount||Number(amount)<=0) return;\n' +
'    resetApprove(); resetPay();\n' +
'    if (needsApproval) {\n' +
'      setStep("approving");\n' +
'      writeApprove({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [ZARPAY_SWAP_POOL_ADDRESS, amountIn] });\n' +
'    } else { runPay(); }\n' +
'  }\n' +
'  const isPending = step==="approving"||step==="paying"||approveConfirming||payConfirming;\n' +
'  const qrUrl = merchantAddress ? "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent("https://zarpay.app/merchant/pay?merchant="+merchantAddress)+"&bgcolor=0e1318&color=4ade80" : "";\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>\n' +
'        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>{merchant ? merchant.name : "Pay Merchant"}</h1>\n' +
'      </div>\n' +
'      {step === "qr" && (\n' +
'        <>\n' +
'          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"24px", marginBottom:"16px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'            {merchant && <p style={{ color:subText, fontSize:"13px", margin:0 }}>{merchant.category}</p>}\n' +
'            <div style={{ background:"#0e1318", border:"1px solid #14532d", borderRadius:"16px", padding:"16px" }}>\n' +
'              <img src={qrUrl} alt="Payment QR" width={180} height={180} style={{ borderRadius:"8px", display:"block" }} />\n' +
'            </div>\n' +
'            <p style={{ color:subText, fontSize:"11px", textAlign:"center" }}>Customer scans this QR to pay with USDC → merchant receives EURC</p>\n' +
'            <p style={{ color:"#4ade80", fontSize:"11px", fontFamily:"monospace", wordBreak:"break-all", textAlign:"center" }}>{merchantAddress}</p>\n' +
'          </div>\n' +
'          {isConnected && address !== merchantAddress && (\n' +
'            <>\n' +
'              <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>\n' +
'                <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Pay Amount (USDC)</p>\n' +
'                <p style={{ color:subText, fontSize:"12px", marginBottom:"12px", textAlign:"right" }}>Balance: {usdcFormatted} USDC</p>\n' +
'                <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}\n' +
'                  style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"18px", fontWeight:"700", boxSizing:"border-box" }} />\n' +
'                {netOut && (\n' +
'                  <div style={{ marginTop:"12px", padding:"12px", borderRadius:"10px", background:bg, border:"1px solid "+border }}>\n' +
'                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>\n' +
'                      <span style={{ color:subText, fontSize:"12px" }}>Merchant receives</span>\n' +
'                      <span style={{ color:"#4ade80", fontSize:"12px", fontWeight:"700" }}>{netOut} EURC</span>\n' +
'                    </div>\n' +
'                    <div style={{ display:"flex", justifyContent:"space-between" }}>\n' +
'                      <span style={{ color:subText, fontSize:"12px" }}>ZarPay fee (0.5%)</span>\n' +
'                      <span style={{ color:subText, fontSize:"12px" }}>{feeAmount} EURC</span>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                )}\n' +
'              </div>\n' +
'              <button onClick={handlePay} disabled={!amount||Number(amount)<=0}\n' +
'                style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!amount||Number(amount)<=0?"#1f2937":"#4ade80", color:!amount||Number(amount)<=0?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!amount||Number(amount)<=0?"not-allowed":"pointer" }}>\n' +
'                {!amount?"Enter amount":"Pay "+merchant?.name||"Merchant"}\n' +
'              </button>\n' +
'            </>\n' +
'          )}\n' +
'        </>\n' +
'      )}\n' +
'      {isPending && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />\n' +
'          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'          <p style={{ color:text, fontWeight:"700" }}>{step==="approving"?(approveConfirming?"Confirming approval...":"Waiting for approval..."):(payConfirming?"Confirming payment...":"Waiting for confirmation...")}</p>\n' +
'          {step==="approving" && <p style={{ color:subText, fontSize:"12px", textAlign:"center" }}>Step 1 of 2 — approval then payment</p>}\n' +
'        </div>\n' +
'      )}\n' +
'      {step === "success" && (\n' +
'        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>\n' +
'          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>\n' +
'          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Payment Sent!</p>\n' +
'          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>{amount} USDC → {netOut} EURC to {merchant?.name||"merchant"}</p>\n' +
'          {payHash && <a href={"https://testnet.arcscan.app/tx/"+payHash} target="_blank" rel="noopener noreferrer" style={{ color:"#4ade80", fontSize:"12px", fontFamily:"monospace", textDecoration:"underline" }}>View on ArcScan ↗</a>}\n' +
'          <button onClick={() => { setStep("qr"); setAmount(""); setNetOut(""); setFeeAmount(""); resetApprove(); resetPay(); }}\n' +
'            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>Pay Again</button>\n' +
'        </div>\n' +
'      )}\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n' +
'export default function MerchantPayPage() {\n' +
'  return <Suspense><PayContent /></Suspense>;\n' +
'}\n'
);
console.log('✅ Merchant pay/QR page written');

console.log('\n🎉 All merchant pages written successfully!');