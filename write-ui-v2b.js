const fs = require('fs');

// FIX DISCONNECT BUTTON
fs.writeFileSync('components/DisconnectButton.tsx',
'"use client";\n' +
'import { useDisconnect } from "wagmi";\n' +
'export function DisconnectButton() {\n' +
'  const { disconnect } = useDisconnect();\n' +
'  return (\n' +
'    <button onClick={() => disconnect()}\n' +
'      style={{ padding:"8px 14px", borderRadius:"8px", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--text-2)", fontSize:"12px", fontWeight:"600", cursor:"pointer", letterSpacing:"0.02em" }}>\n' +
'      Disconnect\n' +
'    </button>\n' +
'  );\n' +
'}\n'
);
console.log("✅ DisconnectButton");

// WALLET PAGE — Portfolio / Swap / Bridge tabs
const walletPage =
'"use client";\n' +
'import { useEffect, useState } from "react";\n' +
'import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { parseUnits, formatUnits } from "viem";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { useWalletBalance } from "@/lib/useWalletBalance";\n' +
'import { useLivePrices } from "@/lib/useLivePrices";\n' +
'import { CURRENCY_SYMBOLS } from "@/lib/useSettings";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { USDC_ADDRESS, EURC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";\n' +
'\n' +
'type TokenSymbol = "USDC" | "EURC";\n' +
'const TOKEN_ADDRESSES: Record<TokenSymbol, `0x${string}`> = { USDC: USDC_ADDRESS, EURC: EURC_ADDRESS };\n' +
'\n' +
'const ALL_TOKENS = [\n' +
'  { symbol:"BTC", name:"Bitcoin", network:"Bitcoin", icon:"\u20BF", color:"#F7931A", bg:"rgba(247,147,26,0.12)", bdr:"rgba(247,147,26,0.25)", live:false, key:null },\n' +
'  { symbol:"ETH", name:"Ethereum", network:"Ethereum", icon:"\u039E", color:"#627EEA", bg:"rgba(98,126,234,0.12)", bdr:"rgba(98,126,234,0.25)", live:false, key:null },\n' +
'  { symbol:"USDC", name:"USD Coin", network:"Arc Testnet", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:true, key:"usdc" },\n' +
'  { symbol:"EURC", name:"Euro Coin", network:"Arc Testnet", icon:"\u20AC", color:"#4A90D9", bg:"rgba(74,144,217,0.12)", bdr:"rgba(74,144,217,0.25)", live:true, key:"eurc" },\n' +
'  { symbol:"USDC", name:"USD Coin", network:"ETH Sepolia", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },\n' +
'  { symbol:"USDC", name:"USD Coin", network:"Base", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },\n' +
'  { symbol:"USDC", name:"USD Coin", network:"Arbitrum", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },\n' +
'  { symbol:"USDC", name:"USD Coin", network:"Optimism", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },\n' +
'  { symbol:"USDC", name:"USD Coin", network:"Avalanche", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },\n' +
'];\n' +
'\n' +
'const BRIDGE_ROUTES = [\n' +
'  { from:"Arc Testnet", to:"Ethereum", token:"USDC", time:"~5 min" },\n' +
'  { from:"Arc Testnet", to:"Base", token:"USDC", time:"~3 min" },\n' +
'  { from:"Arc Testnet", to:"Arbitrum", token:"USDC", time:"~5 min" },\n' +
'  { from:"Arc Testnet", to:"Optimism", token:"USDC", time:"~5 min" },\n' +
'  { from:"Arc Testnet", to:"Polygon", token:"USDC", time:"~3 min" },\n' +
'  { from:"Arc Testnet", to:"Avalanche", token:"USDC", time:"~3 min" },\n' +
'];\n' +
'\n' +
'export default function WalletPage() {\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const router = useRouter();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [activeTab, setActiveTab] = useState("portfolio");\n' +
'  const [fromToken, setFromToken] = useState<TokenSymbol>("USDC");\n' +
'  const [toToken, setToToken] = useState<TokenSymbol>("EURC");\n' +
'  const [swapAmount, setSwapAmount] = useState("");\n' +
'  const [netOut, setNetOut] = useState("");\n' +
'  const [feeAmount, setFeeAmount] = useState("");\n' +
'  const [swapStep, setSwapStep] = useState<"idle"|"approving"|"swapping"|"success"|"error">("idle");\n' +
'  const [swapMsg, setSwapMsg] = useState("");\n' +
'  const [bridgeRoute, setBridgeRoute] = useState(BRIDGE_ROUTES[0]);\n' +
'  const [bridgeAmount, setBridgeAmount] = useState("");\n' +
'  const [bridgeStep, setBridgeStep] = useState<"idle"|"pending"|"success">("idle");\n' +
'  useEffect(() => { setMounted(true); }, []);\n' +
'  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);\n' +
'  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);\n' +
'  const { rates } = useLivePrices();\n' +
'  const symbol = CURRENCY_SYMBOLS[settings.currency];\n' +
'  const rate = rates[settings.currency] || 1;\n' +
'  const usdcNum = parseFloat(usdcFormatted) || 0;\n' +
'  const eurcNum = parseFloat(eurcFormatted) || 0;\n' +
'  const totalFiat = ((usdcNum*rate)+(eurcNum*rate*1.08)).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2});\n' +
'  function getBalance(t: typeof ALL_TOKENS[0]) { if (!t.live) return "0.00"; if (t.key==="usdc") return usdcFormatted; if (t.key==="eurc") return eurcFormatted; return "0.00"; }\n' +
'  function getFiat(t: typeof ALL_TOKENS[0]) { if (!t.live) return null; const v = t.key==="usdc" ? usdcNum*rate : eurcNum*rate*1.08; return symbol+v.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}); }\n' +
'  const isUsdcToEurc = fromToken==="USDC";\n' +
'  const amountIn = swapAmount && Number(swapAmount)>0 ? parseUnits(swapAmount, TOKEN_DECIMALS) : BigInt(0);\n' +
'  const { refetch: refetchPreview } = useReadContract({ address:ZARPAY_SWAP_POOL_ADDRESS, abi:ZARPAY_SWAP_POOL_ABI, functionName:"previewSwapAfterFee", args:[amountIn,isUsdcToEurc], query:{enabled:false} });\n' +
'  const { data: allowance, refetch: refetchAllowance } = useReadContract({ address:TOKEN_ADDRESSES[fromToken], abi:ERC20_ABI, functionName:"allowance", args:address?[address,ZARPAY_SWAP_POOL_ADDRESS]:undefined, query:{enabled:!!address} });\n' +
'  const needsApproval = !allowance || allowance < amountIn;\n' +
'  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();\n' +
'  const { writeContract: writeSwap, data: swapHash, error: swapError, reset: resetSwap } = useWriteContract();\n' +
'  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });\n' +
'  const { isLoading: swapConfirming, isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapHash });\n' +
'  useEffect(() => { if (approveConfirmed && swapStep==="approving") { refetchAllowance(); runSwap(); } }, [approveConfirmed]);\n' +
'  useEffect(() => { if (swapConfirmed && swapStep==="swapping") { setSwapStep("success"); setSwapMsg(swapAmount+" "+fromToken+" \u2192 "+netOut+" "+toToken); refetch(); } }, [swapConfirmed]);\n' +
'  useEffect(() => { if (approveError) { setSwapStep("error"); setSwapMsg(approveError.message||"Approval failed."); } if (swapError) { setSwapStep("error"); setSwapMsg(swapError.message||"Swap failed."); } }, [approveError, swapError]);\n' +
'  useEffect(() => { if (amountIn>BigInt(0)) { refetchPreview().then(res => { const d=res.data as [bigint,bigint]|undefined; if(d){setNetOut(formatUnits(d[0],TOKEN_DECIMALS));setFeeAmount(formatUnits(d[1],TOKEN_DECIMALS));} }); } else { setNetOut(""); setFeeAmount(""); } }, [swapAmount,fromToken,toToken]);\n' +
'  function runSwap() { setSwapStep("swapping"); writeSwap({ address:ZARPAY_SWAP_POOL_ADDRESS, abi:ZARPAY_SWAP_POOL_ABI, functionName:isUsdcToEurc?"swapUSDCtoEURC":"swapEURCtoUSDC", args:[amountIn] } as any); }\n' +
'  function handleSwap() { if (!swapAmount||Number(swapAmount)<=0||fromToken===toToken) return; resetApprove(); resetSwap(); setSwapMsg(""); if (needsApproval) { setSwapStep("approving"); writeApprove({ address:TOKEN_ADDRESSES[fromToken], abi:ERC20_ABI, functionName:"approve", args:[ZARPAY_SWAP_POOL_ADDRESS,amountIn] } as any); } else { runSwap(); } }\n' +
'  function resetSwapState() { setSwapStep("idle"); setSwapAmount(""); setNetOut(""); setFeeAmount(""); setSwapMsg(""); resetApprove(); resetSwap(); }\n' +
'  const isPending = swapStep==="approving"||swapStep==="swapping"||approveConfirming||swapConfirming;\n' +
'  if (!mounted) return null;\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Wallet</h1>\n' +
'          <button onClick={() => refetch()} style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"6px 12px", color:"var(--text-2)", cursor:"pointer", fontSize:"16px" }}>\u21BB</button>\n' +
'        </div>\n' +
'\n' +
'        {/* Portfolio Value */}\n' +
'        <div style={{ position:"relative", background:"linear-gradient(135deg,#0F1420,#161C2D)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", overflow:"hidden" }}>\n' +
'          <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"radial-gradient(circle,rgba(46,204,113,0.12) 0%,transparent 70%)", animation:"glow-pulse 3s ease-in-out infinite", pointerEvents:"none" }} />\n' +
'          <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-2)", marginBottom:"8px" }}>Total Portfolio Value</p>\n' +
'          <p style={{ fontSize:"36px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.03em" }}>{symbol}{isLoading?"...":totalFiat}</p>\n' +
'          <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"4px" }}>Arc Testnet \u00B7 {settings.currency}</p>\n' +
'        </div>\n' +
'\n' +
'        {/* Tabs */}\n' +
'        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>\n' +
'          {[{id:"portfolio",label:"Portfolio"},{id:"swap",label:"Swap"},{id:"bridge",label:"Bridge"}].map(tab => (\n' +
'            <button key={tab.id} onClick={() => setActiveTab(tab.id)}\n' +
'              style={{ padding:"12px", borderRadius:"12px", border:"1px solid "+(activeTab===tab.id?"var(--green-border)":"var(--border)"), background:activeTab===tab.id?"var(--green-dim)":"var(--surface)", color:activeTab===tab.id?"var(--green)":"var(--text-2)", fontWeight:activeTab===tab.id?"700":"500", cursor:"pointer", fontSize:"13px", transition:"all 0.2s" }}>\n' +
'              {tab.label}\n' +
'            </button>\n' +
'          ))}\n' +
'        </div>\n' +
'\n' +
'        {/* PORTFOLIO TAB */}\n' +
'        {activeTab==="portfolio" && (\n' +
'          <div className="zp-card">\n' +
'            <p className="zp-label">Assets</p>\n' +
'            {ALL_TOKENS.map((token,i) => (\n' +
'              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<ALL_TOKENS.length-1?"1px solid var(--border)":"none", opacity:token.live?1:0.4 }}>\n' +
'                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>\n' +
'                  <div className="zp-token-icon" style={{ background:token.bg, border:"1px solid "+token.bdr, color:token.color }}>{token.icon}</div>\n' +
'                  <div>\n' +
'                    <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text)" }}>{token.symbol}</p>\n' +
'                    <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.name} \u00B7 {token.network}</p>\n' +
'                  </div>\n' +
'                </div>\n' +
'                <div style={{ textAlign:"right" }}>\n' +
'                  <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>{isLoading&&token.live?"...":getBalance(token)}</p>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.live?(isLoading?"...":getFiat(token)):"Coming soon"}</p>\n' +
'                </div>\n' +
'              </div>\n' +
'            ))}\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'        {/* SWAP TAB */}\n' +
'        {activeTab==="swap" && (\n' +
'          <div>\n' +
'            {swapStep==="idle" && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>\n' +
'                <div>\n' +
'                  <p className="zp-label">From</p>\n' +
'                  <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>\n' +
'                    <select value={fromToken} onChange={e => { setFromToken(e.target.value as TokenSymbol); setNetOut(""); }} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"15px", fontWeight:"700", cursor:"pointer", flex:1 }}>\n' +
'                      <option value="USDC">USDC</option>\n' +
'                      <option value="EURC">EURC</option>\n' +
'                    </select>\n' +
'                    <input type="number" placeholder="0.00" value={swapAmount} onChange={e => { setSwapAmount(e.target.value); setNetOut(""); }} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"22px", fontWeight:"800", textAlign:"right", width:"120px" }} />\n' +
'                  </div>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"6px", textAlign:"right" }}>Balance: {fromToken==="USDC"?usdcFormatted:eurcFormatted} {fromToken}</p>\n' +
'                </div>\n' +
'                <div style={{ display:"flex", justifyContent:"center" }}>\n' +
'                  <button onClick={() => { setFromToken(toToken); setToToken(fromToken); setSwapAmount(""); setNetOut(""); }} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--green)", cursor:"pointer", fontSize:"16px" }}>\u21C5</button>\n' +
'                </div>\n' +
'                <div>\n' +
'                  <p className="zp-label">To</p>\n' +
'                  <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>\n' +
'                    <select value={toToken} onChange={e => { setToToken(e.target.value as TokenSymbol); setNetOut(""); }} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"15px", fontWeight:"700", cursor:"pointer", flex:1 }}>\n' +
'                      <option value="USDC">USDC</option>\n' +
'                      <option value="EURC">EURC</option>\n' +
'                    </select>\n' +
'                    <p style={{ fontSize:"22px", fontWeight:"800", color:netOut?"var(--green)":"var(--text-3)" }}>{netOut||"0.00"}</p>\n' +
'                  </div>\n' +
'                </div>\n' +
'                {netOut && (\n' +
'                  <div style={{ background:"var(--surface-2)", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>\n' +
'                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:"12px", color:"var(--text-2)" }}>You receive</span><span style={{ fontSize:"12px", fontWeight:"700", color:"var(--green)" }}>{netOut} {toToken}</span></div>\n' +
'                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:"12px", color:"var(--text-2)" }}>Fee (0.5%)</span><span style={{ fontSize:"12px", color:"var(--text-2)" }}>{feeAmount} {toToken}</span></div>\n' +
'                  </div>\n' +
'                )}\n' +
'                <button onClick={handleSwap} disabled={!swapAmount||Number(swapAmount)<=0||fromToken===toToken} className="zp-btn-primary">\n' +
'                  {fromToken===toToken?"Select different tokens":!swapAmount?"Enter amount":"Swap "+fromToken+" \u2192 "+toToken}\n' +
'                </button>\n' +
'              </div>\n' +
'            )}\n' +
'            {isPending && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px" }}>\n' +
'                <div className="zp-spinner" />\n' +
'                <p style={{ color:"var(--text)", fontWeight:"700" }}>{swapStep==="approving"?(approveConfirming?"Confirming approval...":"Waiting for approval..."):(swapConfirming?"Confirming swap...":"Waiting for confirmation...")}</p>\n' +
'                {swapStep==="approving" && <p style={{ fontSize:"12px", color:"var(--text-2)", textAlign:"center" }}>Step 1 of 2 — approval, then swap</p>}\n' +
'              </div>\n' +
'            )}\n' +
'            {swapStep==="success" && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px" }}>\n' +
'                <div className="zp-result-icon success">\u2713</div>\n' +
'                <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Swap Complete</p>\n' +
'                <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{swapMsg}</p>\n' +
'                {swapHash && <a href={"https://testnet.arcscan.app/tx/"+swapHash} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", textDecoration:"underline" }}>View on ArcScan \u2197</a>}\n' +
'                <button onClick={resetSwapState} className="zp-btn-primary" style={{ marginTop:"8px" }}>Swap Again</button>\n' +
'              </div>\n' +
'            )}\n' +
'            {swapStep==="error" && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px" }}>\n' +
'                <div className="zp-result-icon error">\u2715</div>\n' +
'                <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)" }}>Swap Failed</p>\n' +
'                <p style={{ fontSize:"13px", color:"var(--red)", textAlign:"center" }}>{swapMsg}</p>\n' +
'                <button onClick={resetSwapState} className="zp-btn-primary" style={{ marginTop:"8px" }}>Try Again</button>\n' +
'              </div>\n' +
'            )}\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'        {/* BRIDGE TAB */}\n' +
'        {activeTab==="bridge" && (\n' +
'          <div>\n' +
'            {bridgeStep==="idle" && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>\n' +
'                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>\n' +
'                  <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>Bridge USDC</p>\n' +
'                  <span className="zp-badge zp-badge-amber">Demo Mode</span>\n' +
'                </div>\n' +
'                <div>\n' +
'                  <p className="zp-label">From</p>\n' +
'                  <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>\n' +
'                    <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"var(--green)", fontWeight:"700", flexShrink:0 }}>ARC</div>\n' +
'                    <div style={{ flex:1 }}>\n' +
'                      <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>Arc Testnet</p>\n' +
'                      <p style={{ fontSize:"11px", color:"var(--text-2)" }}>Balance: {usdcFormatted} USDC</p>\n' +
'                    </div>\n' +
'                    <input type="number" placeholder="0.00" value={bridgeAmount} onChange={e => setBridgeAmount(e.target.value)} style={{ width:"90px", background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"20px", fontWeight:"800", textAlign:"right" }} />\n' +
'                  </div>\n' +
'                </div>\n' +
'                <div style={{ display:"flex", justifyContent:"center" }}>\n' +
'                  <div style={{ width:"32px", height:"32px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--green)", fontSize:"14px" }}>\u2193</div>\n' +
'                </div>\n' +
'                <div>\n' +
'                  <p className="zp-label">To Network</p>\n' +
'                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>\n' +
'                    {BRIDGE_ROUTES.map(r => (\n' +
'                      <button key={r.to} onClick={() => setBridgeRoute(r)}\n' +
'                        style={{ padding:"10px 8px", borderRadius:"10px", border:"1px solid "+(bridgeRoute.to===r.to?"var(--green-border)":"var(--border)"), background:bridgeRoute.to===r.to?"var(--green-dim)":"var(--surface-2)", color:bridgeRoute.to===r.to?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"11px", fontWeight:bridgeRoute.to===r.to?"700":"400", textAlign:"center" }}>\n' +
'                        {r.to}\n' +
'                      </button>\n' +
'                    ))}\n' +
'                  </div>\n' +
'                  <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"8px", textAlign:"center" }}>Est. time: {bridgeRoute.time}</p>\n' +
'                </div>\n' +
'                {bridgeAmount && Number(bridgeAmount)>0 && (\n' +
'                  <div style={{ background:"var(--surface-2)", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>\n' +
'                    {[{label:"You send",value:bridgeAmount+" USDC"},{label:"You receive",value:bridgeAmount+" USDC on "+bridgeRoute.to},{label:"Bridge fee",value:"~0.10 USDC"},{label:"Est. time",value:bridgeRoute.time}].map((row,i) => (\n' +
'                      <div key={i} style={{ display:"flex", justifyContent:"space-between" }}>\n' +
'                        <span style={{ fontSize:"12px", color:"var(--text-2)" }}>{row.label}</span>\n' +
'                        <span style={{ fontSize:"12px", fontWeight:"600", color:i===1?"var(--green)":"var(--text)" }}>{row.value}</span>\n' +
'                      </div>\n' +
'                    ))}\n' +
'                  </div>\n' +
'                )}\n' +
'                <button onClick={() => { if(!bridgeAmount||Number(bridgeAmount)<=0) return; setBridgeStep("pending"); setTimeout(()=>setBridgeStep("success"),3000); }} disabled={!bridgeAmount||Number(bridgeAmount)<=0} className="zp-btn-primary">\n' +
'                  {!bridgeAmount?"Enter amount":"Bridge to "+bridgeRoute.to}\n' +
'                </button>\n' +
'              </div>\n' +
'            )}\n' +
'            {bridgeStep==="pending" && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px" }}>\n' +
'                <div className="zp-spinner" />\n' +
'                <p style={{ color:"var(--text)", fontWeight:"700" }}>Bridging to {bridgeRoute.to}...</p>\n' +
'                <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Demo mode \u00B7 Est. {bridgeRoute.time}</p>\n' +
'              </div>\n' +
'            )}\n' +
'            {bridgeStep==="success" && (\n' +
'              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px" }}>\n' +
'                <div className="zp-result-icon success">\u2713</div>\n' +
'                <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)" }}>Bridge Initiated!</p>\n' +
'                <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{bridgeAmount} USDC \u2192 {bridgeRoute.to}</p>\n' +
'                <span className="zp-badge zp-badge-amber">\uD83D\uDFE1 Demo \u2014 no real funds moved</span>\n' +
'                <button onClick={() => { setBridgeStep("idle"); setBridgeAmount(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>Bridge Again</button>\n' +
'              </div>\n' +
'            )}\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('app/wallet/page.tsx', walletPage);
console.log("✅ Wallet page");

console.log("\n🎉 Done. Run: npm run dev");