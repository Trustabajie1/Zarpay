"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";
import { USDC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";
function PayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchantAddress = searchParams.get("merchant") || "";
  const { address, isConnected } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const isDark = settings.theme === "dark";
  const bg = isDark ? "#0a0f14" : "#f0f4f8";
  const card = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#e2e8f0";
  const inputBg = isDark ? "#111827" : "#f8fafc";
  const text = isDark ? "#ffffff" : "#0a0f14";
  const subText = isDark ? "#6b7280" : "#94a3b8";
  const [amount, setAmount] = useState("");
  const [netOut, setNetOut] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [step, setStep] = useState("qr");
  const [merchant, setMerchant] = useState<any>(null);
  const amountIn = amount && Number(amount) > 0 ? parseUnits(amount, TOKEN_DECIMALS) : BigInt(0);
  useEffect(() => {
    if (merchantAddress) {
      const saved = localStorage.getItem("zarpay_merchant_"+merchantAddress);
      if (saved) setMerchant(JSON.parse(saved));
    }
  }, [merchantAddress]);
  const { refetch: refetchPreview } = useReadContract({
    address: ZARPAY_SWAP_POOL_ADDRESS,
    abi: ZARPAY_SWAP_POOL_ABI,
    functionName: "previewSwapAfterFee",
    args: [amountIn, true],
    query: { enabled: false },
  });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, ZARPAY_SWAP_POOL_ADDRESS] : undefined,
    query: { enabled: !!address },
  });
  const needsApproval = !allowance || allowance < amountIn;
  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();
  const { writeContract: writePay, data: payHash, error: payError, reset: resetPay } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: payConfirming, isSuccess: payConfirmed } = useWaitForTransactionReceipt({ hash: payHash });
  useEffect(() => {
    if (approveConfirmed && step === "approving") { refetchAllowance(); runPay(); }
  }, [approveConfirmed]);
  useEffect(() => {
    if (payConfirmed && step === "paying") setStep("success");
  }, [payConfirmed]);
  useEffect(() => {
    if (amountIn > BigInt(0)) {
      refetchPreview().then(res => {
        const data = res.data as [bigint,bigint] | undefined;
        if (data) { setNetOut(formatUnits(data[0],TOKEN_DECIMALS)); setFeeAmount(formatUnits(data[1],TOKEN_DECIMALS)); }
      });
    } else { setNetOut(""); setFeeAmount(""); }
  }, [amount]);
  function runPay() {
    setStep("paying");
    writePay({
      address: ZARPAY_SWAP_POOL_ADDRESS,
      abi: ZARPAY_SWAP_POOL_ABI,
      functionName: "payMerchant",
      args: [merchantAddress as `0x${string}`, amountIn],
    });
  }
  function handlePay() {
    if (!isConnected||!amount||Number(amount)<=0) return;
    resetApprove(); resetPay();
    if (needsApproval) {
      setStep("approving");
      writeApprove({ address: USDC_ADDRESS, abi: ERC20_ABI, functionName: "approve", args: [ZARPAY_SWAP_POOL_ADDRESS, amountIn] });
    } else { runPay(); }
  }
  const isPending = step==="approving"||step==="paying"||approveConfirming||payConfirming;
  const qrUrl = merchantAddress ? "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent("https://zarpay.app/merchant/pay?merchant="+merchantAddress)+"&bgcolor=0e1318&color=4ade80" : "";
  return (
    <main style={{ minHeight:"100vh", background:bg, padding:"24px 16px 100px", display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ width:"100%", maxWidth:"440px", display:"flex", alignItems:"center", gap:"12px", marginBottom:"28px" }}>
        <button onClick={() => router.back()} style={{ background:"none", border:"none", color:text, fontSize:"20px", cursor:"pointer" }}>←</button>
        <h1 style={{ color:text, fontSize:"20px", fontWeight:"700" }}>{merchant ? merchant.name : "Pay Merchant"}</h1>
      </div>
      {step === "qr" && (
        <>
          <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"24px", marginBottom:"16px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
            {merchant && <p style={{ color:subText, fontSize:"13px", margin:0 }}>{merchant.category}</p>}
            <div style={{ background:"#0e1318", border:"1px solid #14532d", borderRadius:"16px", padding:"16px" }}>
              <img src={qrUrl} alt="Payment QR" width={180} height={180} style={{ borderRadius:"8px", display:"block" }} />
            </div>
            <p style={{ color:subText, fontSize:"11px", textAlign:"center" }}>Customer scans this QR to pay with USDC → merchant receives EURC</p>
            <p style={{ color:"#4ade80", fontSize:"11px", fontFamily:"monospace", wordBreak:"break-all", textAlign:"center" }}>{merchantAddress}</p>
          </div>
          {isConnected && address !== merchantAddress && (
            <>
              <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"20px", marginBottom:"12px" }}>
                <p style={{ color:subText, fontSize:"11px", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Pay Amount (USDC)</p>
                <p style={{ color:subText, fontSize:"12px", marginBottom:"12px", textAlign:"right" }}>Balance: {usdcFormatted} USDC</p>
                <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                  style={{ width:"100%", padding:"14px", borderRadius:"12px", border:"1px solid "+border, background:inputBg, color:text, fontSize:"18px", fontWeight:"700", boxSizing:"border-box" }} />
                {netOut && (
                  <div style={{ marginTop:"12px", padding:"12px", borderRadius:"10px", background:bg, border:"1px solid "+border }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                      <span style={{ color:subText, fontSize:"12px" }}>Merchant receives</span>
                      <span style={{ color:"#4ade80", fontSize:"12px", fontWeight:"700" }}>{netOut} EURC</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color:subText, fontSize:"12px" }}>ZarPay fee (0.5%)</span>
                      <span style={{ color:subText, fontSize:"12px" }}>{feeAmount} EURC</span>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handlePay} disabled={!amount||Number(amount)<=0}
                style={{ width:"100%", maxWidth:"440px", padding:"18px", borderRadius:"16px", border:"none", background:!amount||Number(amount)<=0?"#1f2937":"#4ade80", color:!amount||Number(amount)<=0?"#4b5563":"#111", fontWeight:"700", fontSize:"16px", cursor:!amount||Number(amount)<=0?"not-allowed":"pointer" }}>
                {!amount?"Enter amount":"Pay "+merchant?.name||"Merchant"}
              </button>
            </>
          )}
        </>
      )}
      {isPending && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid "+border, borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"4px solid "+border, borderTop:"4px solid #4ade80", animation:"spin 1s linear infinite" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          <p style={{ color:text, fontWeight:"700" }}>{step==="approving"?(approveConfirming?"Confirming approval...":"Waiting for approval..."):(payConfirming?"Confirming payment...":"Waiting for confirmation...")}</p>
          {step==="approving" && <p style={{ color:subText, fontSize:"12px", textAlign:"center" }}>Step 1 of 2 — approval then payment</p>}
        </div>
      )}
      {step === "success" && (
        <div style={{ width:"100%", maxWidth:"440px", background:card, border:"1px solid rgba(74,222,128,0.3)", borderRadius:"20px", padding:"40px", display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"60px", height:"60px", borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"28px" }}>✓</div>
          <p style={{ color:text, fontWeight:"700", fontSize:"20px" }}>Payment Sent!</p>
          <p style={{ color:subText, fontSize:"13px", textAlign:"center" }}>{amount} USDC → {netOut} EURC to {merchant?.name||"merchant"}</p>
          {payHash && <a href={"https://testnet.arcscan.app/tx/"+payHash} target="_blank" rel="noopener noreferrer" style={{ color:"#4ade80", fontSize:"12px", fontFamily:"monospace", textDecoration:"underline" }}>View on ArcScan ↗</a>}
          <button onClick={() => { setStep("qr"); setAmount(""); setNetOut(""); setFeeAmount(""); resetApprove(); resetPay(); }}
            style={{ background:"#4ade80", color:"#111", fontWeight:"700", fontSize:"14px", borderRadius:"12px", padding:"12px 24px", border:"none", cursor:"pointer", marginTop:"8px" }}>Pay Again</button>
        </div>
      )}
      <BottomNav />
    </main>
  );
}
export default function MerchantPayPage() {
  return <Suspense><PayContent /></Suspense>;
}
