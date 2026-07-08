const fs = require('fs');

// 1. UPDATED useTransactionHistory — Arc Testnet via Blockscout API
fs.writeFileSync('lib/useTransactionHistory.ts',
'"use client";\n' +
'import { useEffect, useState, useCallback } from "react";\n' +
'\n' +
'export type Transaction = {\n' +
'  hash: string;\n' +
'  value: string;\n' +
'  token: string;\n' +
'  type: "sent" | "received";\n' +
'  timeStamp: string;\n' +
'  isError: string;\n' +
'};\n' +
'\n' +
'export function shortenHash(hash: string) {\n' +
'  return hash.slice(0, 6) + "..." + hash.slice(-4);\n' +
'}\n' +
'\n' +
'export function formatTxDate(timestamp: string) {\n' +
'  return new Date(Number(timestamp) * 1000).toLocaleString();\n' +
'}\n' +
'\n' +
'export function useTransactionHistory(address?: string) {\n' +
'  const [transactions, setTransactions] = useState<Transaction[]>([]);\n' +
'  const [isLoading, setIsLoading] = useState(true);\n' +
'  const [isError, setIsError] = useState(false);\n' +
'\n' +
'  const fetchTransactions = useCallback(async () => {\n' +
'    if (!address) { setTransactions([]); setIsLoading(false); return; }\n' +
'    try {\n' +
'      setIsLoading(true);\n' +
'      setIsError(false);\n' +
'      // Arc Testnet Blockscout API\n' +
'      const response = await fetch(\n' +
'        "https://testnet.arcscan.app/api?module=account&action=txlist&address="+address+"&startblock=0&endblock=99999999&page=1&offset=25&sort=desc"\n' +
'      );\n' +
'      const data = await response.json();\n' +
'      if (data.status === "1" && Array.isArray(data.result)) {\n' +
'        const formatted = data.result.map((tx: any) => ({\n' +
'          hash: tx.hash,\n' +
'          value: (Number(tx.value) / 1e6).toFixed(4),\n' +
'          token: "USDC",\n' +
'          type: tx.from.toLowerCase() === address.toLowerCase() ? "sent" : "received",\n' +
'          timeStamp: tx.timeStamp,\n' +
'          isError: tx.isError ?? "0",\n' +
'        }));\n' +
'        setTransactions(formatted);\n' +
'      } else {\n' +
'        setTransactions([]);\n' +
'      }\n' +
'    } catch (error) {\n' +
'      setIsError(true);\n' +
'    } finally {\n' +
'      setIsLoading(false);\n' +
'    }\n' +
'  }, [address]);\n' +
'\n' +
'  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);\n' +
'  return { transactions, isLoading, isError, refetch: fetchTransactions };\n' +
'}\n'
);
console.log('✅ useTransactionHistory updated for Arc Testnet');

// 2. UPDATED ACTIVITY PAGE
fs.writeFileSync('app/activity/page.tsx',
'"use client";\n' +
'import { useEffect, useState } from "react";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useTransactionHistory, formatTxDate, shortenHash } from "@/lib/useTransactionHistory";\n' +
'export default function ActivityPage() {\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const { settings } = useAppSettings();\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);\n' +
'  const { transactions, isLoading, isError, refetch } = useTransactionHistory(address);\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const txBg = isDark ? "#111827" : "#f8fafc";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#4b5563" : "#94a3b8";\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>\n' +
'        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>Transaction History</h1>\n' +
'        <button onClick={() => refetch()} style={{ background:"none", border:"none", color:subText, fontSize:"18px", cursor:"pointer" }}>↻</button>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px" }}>\n' +
'        {isLoading && (\n' +
'          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>\n' +
'            {[1,2,3,4,5].map(i => (\n' +
'              <div key={i} style={{ height:"68px", background:isDark?"rgba(255,255,255,0.03)":"rgba(0,0,0,0.03)", borderRadius:"12px", border:"1px solid "+border }} />\n' +
'            ))}\n' +
'          </div>\n' +
'        )}\n' +
'        {isError && !isLoading && (\n' +
'          <div style={{ padding:"48px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>\n' +
'            <span style={{ color:"#f87171", fontSize:"32px" }}>✕</span>\n' +
'            <p style={{ color:"#f87171", fontSize:"14px", fontFamily:"monospace" }}>Failed to load transactions</p>\n' +
'            <button onClick={() => refetch()} style={{ color:"#4ade80", fontSize:"13px", background:"none", border:"1px solid rgba(74,222,128,0.3)", borderRadius:"8px", padding:"8px 16px", cursor:"pointer" }}>Try Again</button>\n' +
'          </div>\n' +
'        )}\n' +
'        {!isLoading && !isError && transactions.length === 0 && (\n' +
'          <div style={{ padding:"56px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>\n' +
'            <p style={{ color:subText, fontSize:"15px", fontWeight:"600" }}>No transactions yet</p>\n' +
'            <p style={{ color:subText, fontSize:"12px", fontFamily:"monospace", textAlign:"center" }}>Send or receive USDC on Arc Testnet to see activity here</p>\n' +
'          </div>\n' +
'        )}\n' +
'        {!isLoading && !isError && transactions.length > 0 && (\n' +
'          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>\n' +
'            {transactions.map((tx) => (\n' +
'              <a key={tx.hash} href={"https://testnet.arcscan.app/tx/"+tx.hash} target="_blank" rel="noopener noreferrer" style={{ textDecoration:"none", display:"block" }}>\n' +
'                <div style={{ background:txBg, border:"1px solid "+border, borderRadius:"12px", padding:"14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>\n' +
'                    <div style={{ width:"40px", height:"40px", borderRadius:"50%", background:tx.type==="sent"?"rgba(248,113,113,0.1)":"rgba(74,222,128,0.1)", border:"1px solid "+(tx.type==="sent"?"rgba(248,113,113,0.3)":"rgba(74,222,128,0.3)"), display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>\n' +
'                      <span style={{ color:tx.type==="sent"?"#f87171":"#4ade80", fontSize:"16px" }}>{tx.type==="sent"?"↗":"↙"}</span>\n' +
'                    </div>\n' +
'                    <div>\n' +
'                      <p style={{ color:text, fontSize:"14px", fontWeight:"600", marginBottom:"3px" }}>{tx.type==="sent"?"Sent":"Received"}</p>\n' +
'                      <p style={{ color:subText, fontSize:"11px", fontFamily:"monospace" }}>{shortenHash(tx.hash)}</p>\n' +
'                      <p style={{ color:subText, fontSize:"10px", marginTop:"2px" }}>{formatTxDate(tx.timeStamp)}</p>\n' +
'                    </div>\n' +
'                  </div>\n' +
'                  <div style={{ textAlign:"right" }}>\n' +
'                    <p style={{ color:tx.type==="sent"?"#f87171":"#4ade80", fontSize:"14px", fontWeight:"700", marginBottom:"6px" }}>{tx.type==="sent"?"-":"+"}{tx.value} {tx.token}</p>\n' +
'                    <span style={{ fontSize:"10px", padding:"3px 8px", borderRadius:"4px", background:tx.isError==="0"?"rgba(74,222,128,0.1)":"rgba(248,113,113,0.1)", color:tx.isError==="0"?"#4ade80":"#f87171" }}>{tx.isError==="0"?"Success":"Failed"}</span>\n' +
'                  </div>\n' +
'                </div>\n' +
'              </a>\n' +
'            ))}\n' +
'          </div>\n' +
'        )}\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Activity page updated');

// 3. WALLET PAGE — becomes Portfolio/Assets page
fs.writeFileSync('app/wallet/page.tsx',
'"use client";\n' +
'import { useEffect, useState } from "react";\n' +
'import { useAccount } from "wagmi";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { useLivePrices } from "@/lib/useLivePrices";\n' +
'import { CURRENCY_SYMBOLS } from "@/lib/useSettings";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'export default function WalletPage() {\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);\n' +
'  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);\n' +
'  const { rates } = useLivePrices();\n' +
'  const symbol = CURRENCY_SYMBOLS[settings.currency];\n' +
'  const isDark = settings.theme === "dark";\n' +
'  const bg = isDark ? "#0a0f14" : "#f0f4f8";\n' +
'  const card = isDark ? "#0e1318" : "#ffffff";\n' +
'  const border = isDark ? "#1f2937" : "#e2e8f0";\n' +
'  const text = isDark ? "#ffffff" : "#0a0f14";\n' +
'  const subText = isDark ? "#6b7280" : "#94a3b8";\n' +
'  const rate = rates[settings.currency] || 1;\n' +
'  const usdcNum = parseFloat(usdcFormatted) || 0;\n' +
'  const eurcNum = parseFloat(eurcFormatted) || 0;\n' +
'  const usdcFiat = (usdcNum * rate).toLocaleString("en", { minimumFractionDigits:2, maximumFractionDigits:2 });\n' +
'  const eurcFiat = (eurcNum * rate * 1.08).toLocaleString("en", { minimumFractionDigits:2, maximumFractionDigits:2 });\n' +
'  const totalFiat = ((usdcNum * rate) + (eurcNum * rate * 1.08)).toLocaleString("en", { minimumFractionDigits:2, maximumFractionDigits:2 });\n' +
'  const TOKENS = [\n' +
'    { symbol:"USDC", name:"USD Coin", balance:usdcFormatted, fiat:usdcFiat, color:"#2775CA", bg:"rgba(39,117,202,0.1)", border:"rgba(39,117,202,0.3)", icon:"$", change:"+0.00%", stable:true },\n' +
'    { symbol:"EURC", name:"Euro Coin", balance:eurcFormatted, fiat:eurcFiat, color:"#003399", bg:"rgba(0,51,153,0.1)", border:"rgba(0,51,153,0.3)", icon:"€", change:"+0.00%", stable:true },\n' +
'  ];\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px" }}>\n' +
'        <h1 style={{ color:text, fontSize:"22px", fontWeight:"700" }}>Portfolio</h1>\n' +
'        <button onClick={() => refetch()} style={{ background:"none", border:"none", color:subText, fontSize:"18px", cursor:"pointer" }}>↻</button>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:"rgba(74,222,128,0.05)", border:"1px solid rgba(74,222,128,0.15)", borderRadius:"20px", padding:"24px", marginBottom:"20px", textAlign:"center" }}>\n' +
'        <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Total Portfolio Value</p>\n' +
'        {isLoading ? (\n' +
'          <div style={{ height:"48px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", width:"60%", margin:"0 auto" }} />\n' +
'        ) : (\n' +
'          <p style={{ color:text, fontSize:"42px", fontWeight:"800", letterSpacing:"-0.02em", margin:0 }}>{symbol}{totalFiat}</p>\n' +
'        )}\n' +
'        <p style={{ color:subText, fontSize:"12px", marginTop:"8px" }}>Arc Testnet · {settings.currency}</p>\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", display:"flex", flexDirection:"column", gap:"10px", marginBottom:"20px" }}>\n' +
'        {TOKENS.map(token => (\n' +
'          <div key={token.symbol} style={{ background:card, border:"1px solid "+border, borderRadius:"16px", padding:"18px", display:"flex", alignItems:"center", gap:"14px" }}>\n' +
'            <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:token.bg, border:"1px solid "+token.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", color:token.color, fontWeight:"700", flexShrink:0 }}>\n' +
'              {token.icon}\n' +
'            </div>\n' +
'            <div style={{ flex:1 }}>\n' +
'              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>\n' +
'                <p style={{ color:text, fontWeight:"700", fontSize:"15px", margin:0 }}>{token.symbol}</p>\n' +
'                <p style={{ color:text, fontWeight:"700", fontSize:"15px", margin:0 }}>{isLoading?"...":token.balance}</p>\n' +
'              </div>\n' +
'              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'                <p style={{ color:subText, fontSize:"12px", margin:0 }}>{token.name}</p>\n' +
'                <p style={{ color:subText, fontSize:"12px", margin:0 }}>{symbol}{isLoading?"...":token.fiat}</p>\n' +
'              </div>\n' +
'            </div>\n' +
'          </div>\n' +
'        ))}\n' +
'      </div>\n' +
'      <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"16px", padding:"16px", marginBottom:"16px" }}>\n' +
'        <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Network</p>\n' +
'        {[{label:"Network",value:"Arc Testnet"},{label:"Chain ID",value:"5042002"},{label:"Currency",value:settings.currency},{label:"Wallet",value:address?address.slice(0,6)+"..."+address.slice(-4):"--"}].map((item,i) => (\n' +
'          <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:"10px", marginBottom:"10px", borderBottom:i<3?"1px solid "+border:"none" }}>\n' +
'            <span style={{ color:subText, fontSize:"13px" }}>{item.label}</span>\n' +
'            <span style={{ color:text, fontSize:"13px", fontFamily:"monospace" }}>{item.value}</span>\n' +
'          </div>\n' +
'        ))}\n' +
'      </div>\n' +
'      <button onClick={() => router.push("/activity")}\n' +
'        style={{ width:"100%", maxWidth:"440px", padding:"16px", borderRadius:"14px", border:"1px solid "+border, background:card, color:text, fontWeight:"700", fontSize:"15px", cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center", gap:"8px" }}>\n' +
'        View Transaction History →\n' +
'      </button>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log('✅ Wallet page updated to Portfolio');

console.log('\n🎉 All files written successfully!');