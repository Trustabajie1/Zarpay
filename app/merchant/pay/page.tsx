"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { BottomNav } from "@/components/BottomNav";
import { PageHeader } from "@/components/PageHeader";
import { USDC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";

function PayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const merchantAddress = searchParams.get("merchant") || "";
  const { address, isConnected } = useAccount();
  const { settings } = useAppSettings();
  const { usdcFormatted } = useWalletBalance(address);
  const [amount, setAmount] = useState("");
    const [netOut, setNetOut] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [netOutRaw, setNetOutRaw] = useState<bigint>(BigInt(0));
  const SLIPPAGE_TOLERANCE_BPS = BigInt(50); // 0.5%
  const [step, setStep] = useState("qr");
  const [merchant, setMerchant] = useState<any>(null);
  const [copied, setCopied] = useState(false);

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
    if (approveConfirmed && step==="approving") { refetchAllowance(); runPay(); }
  }, [approveConfirmed]);

  useEffect(() => {
    if (payConfirmed && step==="paying") setStep("success");
  }, [payConfirmed]);

    useEffect(() => {
    if (amountIn > BigInt(0)) {
      refetchPreview().then(res => {
        const data = res.data as [bigint,bigint] | undefined;
        if (data) { setNetOut(formatUnits(data[0],TOKEN_DECIMALS)); setFeeAmount(formatUnits(data[1],TOKEN_DECIMALS)); setNetOutRaw(data[0]); }
      });
    } else { setNetOut(""); setFeeAmount(""); setNetOutRaw(BigInt(0)); }
  }, [amount]);

    function runPay() {
    setStep("paying");
    const minEurcOut = netOutRaw - (netOutRaw * SLIPPAGE_TOLERANCE_BPS) / BigInt(10000);
    writePay({ address:ZARPAY_SWAP_POOL_ADDRESS, abi:ZARPAY_SWAP_POOL_ABI, functionName:"payMerchant", args:[merchantAddress as `0x${string}`, amountIn, minEurcOut] } as any);
  }

  function handlePay() {
    if (!isConnected||!amount||Number(amount)<=0) return;
    resetApprove(); resetPay();
    if (needsApproval) { setStep("approving"); writeApprove({ address:USDC_ADDRESS, abi:ERC20_ABI, functionName:"approve", args:[ZARPAY_SWAP_POOL_ADDRESS,amountIn] } as any); }
    else { runPay(); }
  }

  function handleCopyAddress() {
    navigator.clipboard.writeText(merchantAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPending = step==="approving"||step==="paying"||approveConfirming||payConfirming;
  const qrUrl = merchantAddress
    ? "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data="+encodeURIComponent("https://zarpay-ten.vercel.app/merchant/pay?merchant="+merchantAddress)+"&bgcolor=080C12&color=2ECC71&margin=16"
    : "";

  return (
    <main className="zp-page">
      <div className="zp-content">
        <PageHeader title={merchant ? merchant.name : "Pay Merchant"} />

        {/* QR Card */}
        <div style={{ background:"linear-gradient(135deg, #0D1621, #0F1E30)", border:"1px solid var(--green-border)", borderRadius:"20px", padding:"24px", display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
          {merchant && (
            <div style={{ display:"flex", alignItems:"center", gap:"10px", alignSelf:"flex-start" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"10px", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>{merchant.emoji}</div>
              <div>
                <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)", margin:0 }}>{merchant.name}</p>
                <p style={{ fontSize:"11px", color:"var(--text-2)", margin:0 }}>{merchant.category}</p>
              </div>
            </div>
          )}
          <div style={{ background:"#080C12", border:"1px solid var(--border)", borderRadius:"16px", padding:"16px" }}>
            {qrUrl && <img src={qrUrl} alt="Payment QR" width={180} height={180} style={{ borderRadius:"8px", display:"block" }} />}
          </div>
          <p style={{ fontSize:"12px", color:"var(--text-2)", textAlign:"center" }}>Customer scans this QR to pay with USDC → you receive EURC</p>
          <button onClick={handleCopyAddress}
            style={{ width:"100%", padding:"12px", borderRadius:"12px", border:"1px solid "+(copied?"var(--green-border)":"var(--border)"), background:copied?"var(--green-dim)":"var(--surface-2)", color:copied?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"13px", fontWeight:"600", fontFamily:"monospace", transition:"all 0.2s" }}>
            {copied ? "✓ Address Copied!" : merchantAddress.slice(0,20)+"..."}
          </button>
        </div>

        {/* Pay Form — only show if customer (not the merchant) */}
        {isConnected && address !== merchantAddress && step==="qr" && (
          <>
            <div className="zp-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                <p className="zp-label" style={{ margin:0 }}>Pay Amount (USDC)</p>
                <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Balance: {usdcFormatted} USDC</p>
              </div>
              <input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                className="zp-input" style={{ fontSize:"24px", fontWeight:"800", marginBottom:"12px" }} />
              {netOut && (
                <div style={{ background:"var(--surface-2)", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"12px", color:"var(--text-2)" }}>Merchant receives</span>
                    <span style={{ fontSize:"12px", fontWeight:"700", color:"var(--green)" }}>{netOut} EURC</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <span style={{ fontSize:"12px", color:"var(--text-2)" }}>ZarPay fee (0.5%)</span>
                    <span style={{ fontSize:"12px", color:"var(--text-2)" }}>{feeAmount} EURC</span>
                  </div>
                </div>
              )}
            </div>
            <button onClick={handlePay} disabled={!amount||Number(amount)<=0} className="zp-btn-primary">
              {!amount ? "Enter amount" : "Pay "+( merchant?.name || "Merchant")}
            </button>
          </>
        )}

        {isPending && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px 24px" }}>
            <div className="zp-spinner" />
            <p style={{ color:"var(--text)", fontWeight:"700" }}>
              {step==="approving"?(approveConfirming?"Confirming approval...":"Waiting for approval..."):(payConfirming?"Confirming payment...":"Waiting for confirmation...")}
            </p>
            {step==="approving" && <p style={{ fontSize:"12px", color:"var(--text-2)", textAlign:"center" }}>Step 1 of 2 — approval then payment</p>}
          </div>
        )}

        {step==="success" && (
          <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px 24px" }}>
            <div className="zp-result-icon success">✓</div>
            <p style={{ fontSize:"20px", fontWeight:"800", color:"var(--text)" }}>Payment Sent!</p>
            <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{amount} USDC → {netOut} EURC to {merchant?.name||"merchant"}</p>
            {payHash && <a href={"https://testnet.arcscan.app/tx/"+payHash} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", textDecoration:"underline" }}>View on ArcScan ↗</a>}
            <button onClick={() => { setStep("qr"); setAmount(""); setNetOut(""); setFeeAmount(""); resetApprove(); resetPay(); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>Pay Again</button>
          </div>
        )}

      </div>
      <BottomNav />
    </main>
  );
}

export default function MerchantPayPage() {
  return <Suspense><PayContent /></Suspense>;
}
