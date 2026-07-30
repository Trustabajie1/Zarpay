const fs = require('fs');

// MERCHANT DASHBOARD
fs.writeFileSync('app/merchant/dashboard/page.tsx',
'"use client";\n' +
'import { useState, useEffect } from "react";\n' +
'import { useRouter } from "next/navigation";\n' +
'import { useAccount, useReadContract } from "wagmi";\n' +
'import { useAppSettings } from "@/components/SettingsContext";\n' +
'import { BottomNav } from "@/components/BottomNav";\n' +
'import { PageHeader } from "@/components/PageHeader";\n' +
'import { EURC_ADDRESS, ERC20_ABI, TOKEN_DECIMALS } from "@/lib/contracts";\n' +
'import { formatUnits } from "viem";\n' +
'\n' +
'export default function MerchantDashboardPage() {\n' +
'  const router = useRouter();\n' +
'  const { address } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const [mounted, setMounted] = useState(false);\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'  const [copied, setCopied] = useState(false);\n' +
'\n' +
'  useEffect(() => {\n' +
'    setMounted(true);\n' +
'    const saved = localStorage.getItem("zarpay_merchant_"+address);\n' +
'    if (saved) setMerchant(JSON.parse(saved));\n' +
'  }, [address]);\n' +
'\n' +
'  const { data: eurcBalance } = useReadContract({\n' +
'    address: EURC_ADDRESS,\n' +
'    abi: ERC20_ABI,\n' +
'    functionName: "balanceOf",\n' +
'    args: address ? [address] : undefined,\n' +
'    query: { enabled: !!address },\n' +
'  });\n' +
'\n' +
'  const eurcFormatted = eurcBalance\n' +
'    ? Number(formatUnits(eurcBalance as bigint, TOKEN_DECIMALS)).toFixed(2)\n' +
'    : "0.00";\n' +
'\n' +
'  function handleCopy() {\n' +
'    if (address) { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }\n' +
'  }\n' +
'\n' +
'  if (!mounted) return null;\n' +
'\n' +
'  if (!merchant) return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <div className="zp-card" style={{ textAlign:"center", padding:"48px 24px" }}>\n' +
'          <p style={{ fontSize:"40px", marginBottom:"16px" }}>\uD83C\uDFEA</p>\n' +
'          <p style={{ fontSize:"16px", fontWeight:"700", color:"var(--text)", marginBottom:"8px" }}>Not registered as a merchant</p>\n' +
'          <p style={{ fontSize:"13px", color:"var(--text-2)", marginBottom:"24px" }}>Register to start accepting EURC payments</p>\n' +
'          <button onClick={() => router.push("/merchant/register")} className="zp-btn-primary">Register Now</button>\n' +
'        </div>\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <PageHeader title="Merchant Dashboard" />\n' +
'\n' +
'        {/* Merchant Info Card */}\n' +
'        <div style={{ position:"relative", background:"linear-gradient(135deg, #0D1621, #0F1E30)", border:"1px solid var(--green-border)", borderRadius:"20px", padding:"24px", overflow:"hidden" }}>\n' +
'          <div style={{ position:"absolute", top:"-40px", right:"-40px", width:"140px", height:"140px", borderRadius:"50%", background:"radial-gradient(circle, rgba(46,204,113,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />\n' +
'          <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"20px" }}>\n' +
'            <div style={{ width:"52px", height:"52px", borderRadius:"16px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px", flexShrink:0 }}>\n' +
'              {merchant.emoji}\n' +
'            </div>\n' +
'            <div style={{ flex:1 }}>\n' +
'              <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)", margin:0, letterSpacing:"-0.02em" }}>{merchant.name}</p>\n' +
'              <p style={{ fontSize:"12px", color:"var(--text-2)", margin:"3px 0 0" }}>{merchant.category}</p>\n' +
'            </div>\n' +
'            <span className="zp-badge zp-badge-green">\u2713 Active</span>\n' +
'          </div>\n' +
'\n' +
'          {/* Stats */}\n' +
'          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>\n' +
'            <div style={{ background:"rgba(15,20,32,0.6)", border:"1px solid var(--border)", borderRadius:"14px", padding:"16px" }}>\n' +
'              <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-2)", margin:"0 0 8px" }}>EURC Balance</p>\n' +
'              <p style={{ fontSize:"24px", fontWeight:"800", color:"var(--green)", margin:0, letterSpacing:"-0.02em" }}>{eurcFormatted}</p>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>EURC received</p>\n' +
'            </div>\n' +
'            <div style={{ background:"rgba(15,20,32,0.6)", border:"1px solid var(--border)", borderRadius:"14px", padding:"16px" }}>\n' +
'              <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.08em", color:"var(--text-2)", margin:"0 0 8px" }}>Status</p>\n' +
'              <div style={{ display:"flex", alignItems:"center", gap:"6px", margin:"0 0 3px" }}>\n' +
'                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--green)" }} />\n' +
'                <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)", margin:0 }}>Active</p>\n' +
'              </div>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:0 }}>Accepting payments</p>\n' +
'            </div>\n' +
'          </div>\n' +
'        </div>\n' +
'\n' +
'        {/* Quick Actions */}\n' +
'        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>\n' +
'          <button onClick={() => router.push("/merchant/pay?merchant="+address)}\n' +
'            style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer", textAlign:"left" }}>\n' +
'            <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"rgba(46,204,113,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>\uD83D\uDCF1</div>\n' +
'            <div>\n' +
'              <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)", margin:0 }}>My QR Code</p>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>Show to customers</p>\n' +
'            </div>\n' +
'          </button>\n' +
'          <button onClick={handleCopy}\n' +
'            style={{ background: copied ? "var(--green-dim)" : "var(--surface)", border:"1px solid "+(copied?"var(--green-border)":"var(--border)"), borderRadius:"16px", padding:"20px", display:"flex", flexDirection:"column", alignItems:"flex-start", gap:"10px", cursor:"pointer", textAlign:"left", transition:"all 0.2s" }}>\n' +
'            <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>\uD83D\uDCCB</div>\n' +
'            <div>\n' +
'              <p style={{ fontSize:"14px", fontWeight:"700", color: copied ? "var(--green)" : "var(--text)", margin:0 }}>{copied ? "Copied!" : "Copy Address"}</p>\n' +
'              <p style={{ fontSize:"11px", color:"var(--text-2)", margin:"3px 0 0" }}>Share payment link</p>\n' +
'            </div>\n' +
'          </button>\n' +
'        </div>\n' +
'\n' +
'        {/* Payment Address */}\n' +
'        <div className="zp-card">\n' +
'          <p className="zp-label">Payment Address</p>\n' +
'          <p style={{ fontSize:"12px", color:"var(--green)", fontFamily:"JetBrains Mono,monospace", wordBreak:"break-all", marginBottom:"8px" }}>{address}</p>\n' +
'          <p style={{ fontSize:"12px", color:"var(--text-2)", lineHeight:"1.5" }}>Customers pay USDC \u2192 automatically converted to EURC and sent to this address</p>\n' +
'        </div>\n' +
'\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n'
);
console.log("✅ Merchant dashboard");

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
'import { PageHeader } from "@/components/PageHeader";\n' +
'import { USDC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";\n' +
'\n' +
'function PayContent() {\n' +
'  const router = useRouter();\n' +
'  const searchParams = useSearchParams();\n' +
'  const merchantAddress = searchParams.get("merchant") || "";\n' +
'  const { address, isConnected } = useAccount();\n' +
'  const { settings } = useAppSettings();\n' +
'  const { usdcFormatted } = useWalletBalance(address);\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [netOut, setNetOut] = useState("");\n' +
'  const [feeAmount, setFeeAmount] = useState("");\n' +
'  const [step, setStep] = useState("qr");\n' +
'  const [merchant, setMerchant] = useState<any>(null);\n' +
'  const [copied, setCopied] = useState(false);\n' +
'\n' +
'  const amountIn = amount && Number(amount) > 0 ? parseUnits(amount, TOKEN_DECIMALS) : BigInt(0);\n' +
'\n' +
'  useEffect(() => {\n' +
'    if (merchantAddress) {\n' +
'      const saved = localStorage.getItem("zarpay_merchant_"+merchantAddress);\n' +
'      if (saved) setMerchant(JSON.parse(saved));\n' +
'    }\n' +
'  }, [merchantAddress]);\n' +
'\n' +
'  const { refetch: refetchPreview } = useReadContract({\n' +
'    address: ZARPAY_SWAP_POOL_ADDRESS,\n' +
'    abi: ZARPAY_SWAP_POOL_ABI,\n' +
'    functionName: "previewSwapAfterFee",\n' +
'    args: [amountIn, true],\n' +
'    query: { enabled: false },\n' +
'  });\n' +
'\n' +
'  const { data: allowance, refetch: refetchAllowance } = useReadContract({\n' +
'    address: USDC_ADDRESS,\n' +
'    abi: ERC20_ABI,\n' +
'    functionName: "allowance",\n' +
'    args: address ? [address, ZARPAY_SWAP_POOL_ADDRESS] : undefined,\n' +
'    query: { enabled: !!address },\n' +
'  });\n' +
'\n' +
'  const needsApproval = !allowance || allowance < amountIn;\n' +
'  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();\n' +
'  const { writeContract: writePay, data: payHash, error: payError, reset: resetPay } = useWriteContract();\n' +
'  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });\n' +
'  const { isLoading: payConfirming, isSuccess: payConfirmed } = useWaitForTransactionReceipt({ hash: payHash });\n' +
'\n' +
'  useEffect(() => {\n' +
'    if (approveConfirmed && step==="approving") { refetchAllowance(); runPay(); }\n' +
'  }, [approveConfirmed]);\n' +
'\n' +
'  useEffect(() => {\n' +
'    if (payConfirmed && step==="paying") setStep("success");\n' +
'  }, [payConfirmed]);\n' +
'\n' +
'  useEffect(() => {\n' +
'    if (amountIn > BigInt(0)) {\n' +
'      refetchPreview().then(res => {\n' +
'        const data = res.data as [bigint,bigint] | undefined;\n' +
'        if (data) { setNetOut(formatUnits(data[0],TOKEN_DECIMALS)); setFeeAmount(formatUnits(data[1],TOKEN_DECIMALS)); }\n' +
'      });\n' +
'    } else { setNetOut(""); setFeeAmount(""); }\n' +
'  }, [amount]);\n' +
'\n' +
'  function runPay() {\n' +
'    setStep("paying");\n' +
'    writePay({ address:ZARPAY_SWAP_POOL_ADDRESS, abi:ZARPAY_SWAP_POOL_ABI, functionName:"payMerchant", args:[merchantAddress as `0x${string}`, amountIn] } as any);\n' +
'  }\n' +
'\n' +
'  function handlePay() {\n' +
'    if (!isConnected||!amount||Number(amount)<=0) return;\n' +
'    resetApprove(); resetPay();\n' +
'    if (needsApproval) { setStep("approving"); writeApprove({ address:USDC_ADDRESS, abi:ERC20_ABI, functionName:"approve", args:[ZARPAY_SWAP_POOL_ADDRESS,amountIn] } as any); }\n' +
'    else { runPay(); }\n' +
'  }\n' +
'\n' +
'  function handleCopyAddress() {\n' +
'    navigator.clipboard.writeText(merchantAddress);\n' +
'    setCopied(true);\n' +
'    setTimeout(() => setCopied(false), 2000);\n' +
'  }\n' +
'\n' +
'  const isPending = step==="approving"||step==="paying"||approveConfirming||payConfirming;\n' +
'  const qrUrl = merchantAddress\n' +
'    ? "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent("https://zarpay-ten.vercel.app/merchant/pay?merchant="+merchantAddress)+"&bgcolor=080C12&color=2ECC71&margin=16"\n' +
'    : "";\n' +
'\n' +
'  return (\n' +
'    <main className="zp-page">\n' +
'      <div className="zp-content">\n' +
'        <PageHeader title={merchant ? merchant.name : "Pay Merchant"} />\n' +
'\n' +
'        {/* QR Card */}\n' +
'        <div style={{ background:"linear-gradient(135deg, #0D1621, #0F1E30)", border:"1px solid var(--green-border)", borderRadius:"20px", padding:"24px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>\n' +
'          {merchant && (\n' +
'            <div style={{ display:"flex", alignItems:"center", gap:"10px", alignSelf:"flex-start" }}>\n' +
'              <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>{merchant.emoji}</div>\n' +
'              <div>\n' +
'                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)", margin:0 }}>{merchant.name}</p>\n' +
'                <p style={{ fontSize:"11px", color:"var(--text-2)", margin:0 }}>{merchant.category}</p>\n' +
'              </div>\n' +
'            </div>\n' +
'          )}\n' +
'          <div style={{ background:"#080C12", border:"1px solid var(--border)", borderRadius:"16px", padding:"16px" }}>\n' +
'            {qrUrl && <img src={qrUrl} alt="Payment QR" width={180} height={180} style={{ borderRadius:"8px", display:"block" }} />}\n' +
'          </div>\n' +
'          <p style={{ fontSize:"12px", color:"var(--text-2)", textAlign:"center" }}>Customer scans this QR to pay with USDC \u2192 you receive EURC</p>\n' +
'          <button onClick={handleCopyAddress}\n' +
'            style={{ width:"100%", padding:"12px", borderRadius:"12px", border:"1px solid "+(copied?"var(--green-border)":"var(--border)"), background:copied?"var(--green-dim)":"var(--surface-2)", color:copied?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"monospace", transition:"all 0.2s" }}>\n' +
'            {copied ? "\u2713 Address Copied!" : merchantAddress.slice(0,20)+"..."}\n' +
'          </button>\n' +
'        </div>\n' +
'\n' +
'        {/* Pay Form — only show if customer (not the merchant) */}\n' +
'        {isConnected && address !== merchantAddress && step==="qr" && (\n' +
'          <>\n' +
'            <div className="zp-card">\n' +
'              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>\n' +
'                <p className="zp-label" style={{ margin:0 }}>Pay Amount (USDC)</p>\n' +
'                <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Balance: {usdcFormatted} USDC</p>\n' +
'              </div>\n' +
'              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}\n' +
'                className="zp-input" style={{ fontSize:"24px", fontWeight:"800", marginBottom:"12px" }} />\n' +
'              {netOut && (\n' +
'                <div style={{ background:"var(--surface-2)", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>\n' +
'                  <div style={{ display:"flex", justifyContent:"space-between" }}>\n' +
'                    <span style={{ fontSize:"12px", color:"var(--text-2)" }}>Merchant receives</span>\n' +
'                    <span style={{ fontSize:"12px", fontWeight:"700", color:"var(--green)" }}>{netOut} EURC</span>\n' +
'                  </div>\n' +
'                  <div style={{ display:"flex", justifyContent:"space-between" }}>\n' +
'                    <span style={{ fontSize:"12px", color:"var(--text-2)" }}>ZarPay fee (0.5%)</span>\n' +
'                    <span style={{ fontSize:"12px", color:"var(--text-2)" }}>{feeAmount} EURC</span>\n' +
'                  </div>\n' +
'                </div>\n' +
'              )}\n' +
'            </div>\n' +
'            <button onClick={handlePay} disabled={!amount||Number(amount)<=0} className="zp-btn-primary">\n' +
'              {!amount ? "Enter amount" : "Pay "+( merchant?.name || "Merchant")}\n' +
'            </button>\n' +
'          </>\n' +
'        )}\n' +
'\n' +
'        {isPending && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px 24px" }}>\n' +
'            <div className="zp-spinner" />\n' +
'            <p style={{ color:"var(--text)", fontWeight:"700" }}>\n' +
'              {step==="approving"?(approveConfirming?"Confirming approval...":"Waiting for approval..."):(payConfirming?"Confirming payment...":"Waiting for confirmation...")}\n' +
'            </p>\n' +
'            {step==="approving" && <p style={{ fontSize:"12px", color:"var(--text-2)", textAlign:"center" }}>Step 1 of 2 \u2014 approval then payment</p>}\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'        {step==="success" && (\n' +
'          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px 24px" }}>\n' +
'            <div className="zp-result-icon success">\u2713</div>\n' +
'            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Payment Sent!</p>\n' +
'            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{amount} USDC \u2192 {netOut} EURC to {merchant?.name||"merchant"}</p>\n' +
'            {payHash && <a href={"https://testnet.arcscan.app/tx/"+payHash} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", textDecoration:"underline" }}>View on ArcScan \u2197</a>}\n' +
'            <button onClick={() => { setStep("qr"); setAmount(""); setNetOut(""); setFeeAmount(""); resetApprove(); resetPay(); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>Pay Again</button>\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'      </div>\n' +
'      <BottomNav />\n' +
'    </main>\n' +
'  );\n' +
'}\n' +
'\n' +
'export default function MerchantPayPage() {\n' +
'  return <Suspense><PayContent /></Suspense>;\n' +
'}\n'
);
console.log("✅ Merchant pay/QR page");

console.log("\n🎉 Merchant pages done. Run: npm run dev");