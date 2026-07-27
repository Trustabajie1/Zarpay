"use client";
import { useEffect, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useRouter } from "next/navigation";
import { parseUnits, formatUnits } from "viem";
import { useAppSettings } from "@/components/SettingsContext";
import { useWalletBalance } from "@/lib/useWalletBalance";
import { useLivePrices } from "@/lib/useLivePrices";
import { CURRENCY_SYMBOLS } from "@/lib/useSettings";
import { BottomNav } from "@/components/BottomNav";
import { TokenIcon } from "@/components/TokenIcon";
import { USDC_ADDRESS, EURC_ADDRESS, ZARPAY_SWAP_POOL_ADDRESS, ERC20_ABI, ZARPAY_SWAP_POOL_ABI, TOKEN_DECIMALS } from "@/lib/contracts";

type TokenSymbol = "USDC" | "EURC";
const TOKEN_ADDRESSES: Record<TokenSymbol, `0x${string}`> = { USDC: USDC_ADDRESS, EURC: EURC_ADDRESS };

const ALL_TOKENS = [
  { symbol:"BTC", name:"Bitcoin", network:"Bitcoin", icon:"₿", color:"#F7931A", bg:"rgba(247,147,26,0.12)", bdr:"rgba(247,147,26,0.25)", live:false, key:null },
  { symbol:"ETH", name:"Ethereum", network:"Ethereum", icon:"Ξ", color:"#627EEA", bg:"rgba(98,126,234,0.12)", bdr:"rgba(98,126,234,0.25)", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Arc Testnet", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:true, key:"usdc" },
  { symbol:"EURC", name:"Euro Coin", network:"Arc Testnet", icon:"€", color:"#4A90D9", bg:"rgba(74,144,217,0.12)", bdr:"rgba(74,144,217,0.25)", live:true, key:"eurc" },
  { symbol:"USDC", name:"USD Coin", network:"ETH Sepolia", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Base", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Arbitrum", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Optimism", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },
  { symbol:"USDC", name:"USD Coin", network:"Avalanche", icon:"$", color:"#2775CA", bg:"rgba(39,117,202,0.12)", bdr:"rgba(39,117,202,0.25)", live:false, key:null },
];

const BRIDGE_ROUTES = [
  { from:"Arc Testnet", to:"Ethereum", token:"USDC", time:"~5 min" },
  { from:"Arc Testnet", to:"Base", token:"USDC", time:"~3 min" },
  { from:"Arc Testnet", to:"Arbitrum", token:"USDC", time:"~5 min" },
  { from:"Arc Testnet", to:"Optimism", token:"USDC", time:"~5 min" },
  { from:"Arc Testnet", to:"Polygon", token:"USDC", time:"~3 min" },
  { from:"Arc Testnet", to:"Avalanche", token:"USDC", time:"~3 min" },
];

export default function WalletPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("portfolio");
  const [fromToken, setFromToken] = useState<TokenSymbol>("USDC");
  const [toToken, setToToken] = useState<TokenSymbol>("EURC");
  const [swapAmount, setSwapAmount] = useState("");
  const [netOut, setNetOut] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [swapStep, setSwapStep] = useState<"idle"|"approving"|"swapping"|"success"|"error">("idle");
  const [swapMsg, setSwapMsg] = useState("");
  const [bridgeRoute, setBridgeRoute] = useState(BRIDGE_ROUTES[0]);
  const [bridgeAmount, setBridgeAmount] = useState("");
  const [bridgeStep, setBridgeStep] = useState<"idle"|"pending"|"success">("idle");
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);
  const { usdcFormatted, eurcFormatted, isLoading, refetch } = useWalletBalance(address);
  const { rates } = useLivePrices();
  const symbol = CURRENCY_SYMBOLS[settings.currency];
  const rate = rates[settings.currency] || 1;
  const usdcNum = parseFloat(usdcFormatted) || 0;
  const eurcNum = parseFloat(eurcFormatted) || 0;
  const totalFiat = ((usdcNum*rate)+(eurcNum*rate*1.08)).toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2});
  function getBalance(t: typeof ALL_TOKENS[0]) { if (!t.live) return "0.00"; if (t.key==="usdc") return usdcFormatted; if (t.key==="eurc") return eurcFormatted; return "0.00"; }
  function getFiat(t: typeof ALL_TOKENS[0]) { if (!t.live) return null; const v = t.key==="usdc" ? usdcNum*rate : eurcNum*rate*1.08; return symbol+v.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}); }
  const isUsdcToEurc = fromToken==="USDC";
  const amountIn = swapAmount && Number(swapAmount)>0 ? parseUnits(swapAmount, TOKEN_DECIMALS) : BigInt(0);
  const { refetch: refetchPreview } = useReadContract({ address:ZARPAY_SWAP_POOL_ADDRESS, abi:ZARPAY_SWAP_POOL_ABI, functionName:"previewSwapAfterFee", args:[amountIn,isUsdcToEurc], query:{enabled:false} });
  const { data: allowance, refetch: refetchAllowance } = useReadContract({ address:TOKEN_ADDRESSES[fromToken], abi:ERC20_ABI, functionName:"allowance", args:address?[address,ZARPAY_SWAP_POOL_ADDRESS]:undefined, query:{enabled:!!address} });
  const needsApproval = !allowance || allowance < amountIn;
  const { writeContract: writeApprove, data: approveHash, error: approveError, reset: resetApprove } = useWriteContract();
  const { writeContract: writeSwap, data: swapHash, error: swapError, reset: resetSwap } = useWriteContract();
  const { isLoading: approveConfirming, isSuccess: approveConfirmed } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: swapConfirming, isSuccess: swapConfirmed } = useWaitForTransactionReceipt({ hash: swapHash });
  useEffect(() => { if (approveConfirmed && swapStep==="approving") { refetchAllowance(); runSwap(); } }, [approveConfirmed]);
  useEffect(() => { if (swapConfirmed && swapStep==="swapping") { setSwapStep("success"); setSwapMsg(swapAmount+" "+fromToken+" → "+netOut+" "+toToken); refetch(); } }, [swapConfirmed]);
  useEffect(() => { if (approveError) { setSwapStep("error"); setSwapMsg(approveError.message||"Approval failed."); } if (swapError) { setSwapStep("error"); setSwapMsg(swapError.message||"Swap failed."); } }, [approveError, swapError]);
  useEffect(() => { if (amountIn>BigInt(0)) { refetchPreview().then(res => { const d=res.data as [bigint,bigint]|undefined; if(d){setNetOut(formatUnits(d[0],TOKEN_DECIMALS));setFeeAmount(formatUnits(d[1],TOKEN_DECIMALS));} }); } else { setNetOut(""); setFeeAmount(""); } }, [swapAmount,fromToken,toToken]);
  function runSwap() { setSwapStep("swapping"); writeSwap({ address:ZARPAY_SWAP_POOL_ADDRESS, abi:ZARPAY_SWAP_POOL_ABI, functionName:isUsdcToEurc?"swapUSDCtoEURC":"swapEURCtoUSDC", args:[amountIn] } as any); }
  function handleSwap() { if (!swapAmount||Number(swapAmount)<=0||fromToken===toToken) return; resetApprove(); resetSwap(); setSwapMsg(""); if (needsApproval) { setSwapStep("approving"); writeApprove({ address:TOKEN_ADDRESSES[fromToken], abi:ERC20_ABI, functionName:"approve", args:[ZARPAY_SWAP_POOL_ADDRESS,amountIn] } as any); } else { runSwap(); } }
  function resetSwapState() { setSwapStep("idle"); setSwapAmount(""); setNetOut(""); setFeeAmount(""); setSwapMsg(""); resetApprove(); resetSwap(); }
  const isPending = swapStep==="approving"||swapStep==="swapping"||approveConfirming||swapConfirming;
  if (!mounted) return null;
  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Wallet</h1>
          <button onClick={() => refetch()} style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"6px 12px", color:"var(--text-2)", cursor:"pointer", fontSize:"16px" }}>↻</button>
        </div>

        {/* Portfolio Value */}
        <div style={{ position:"relative", background:"linear-gradient(135deg,#0F1420,#161C2D)", border:"1px solid var(--border)", borderRadius:"16px", padding:"20px", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:"-30px", right:"-30px", width:"120px", height:"120px", borderRadius:"50%", background:"radial-gradient(circle,rgba(46,204,113,0.12) 0%,transparent 70%)", animation:"glow-pulse 3s ease-in-out infinite", pointerEvents:"none" }} />
          <p style={{ fontSize:"11px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--text-2)", marginBottom:"8px" }}>Total Portfolio Value</p>
          <p style={{ fontSize:"36px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.03em" }}>{symbol}{isLoading?"...":totalFiat}</p>
          <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"4px" }}>Arc Testnet · {settings.currency}</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
          {[{id:"portfolio",label:"Portfolio"},{id:"swap",label:"Swap"},{id:"bridge",label:"Bridge"}].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding:"12px", borderRadius:"12px", border:"1px solid "+(activeTab===tab.id?"var(--green-border)":"var(--border)"), background:activeTab===tab.id?"var(--green-dim)":"var(--surface)", color:activeTab===tab.id?"var(--green)":"var(--text-2)", fontWeight:activeTab===tab.id?"700":"500", cursor:"pointer", fontSize:"13px", transition:"all 0.2s" }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* PORTFOLIO TAB */}
        {activeTab==="portfolio" && (
          <div className="zp-card">
            <p className="zp-label">Assets</p>
            {ALL_TOKENS.map((token,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:i<ALL_TOKENS.length-1?"1px solid var(--border)":"none", opacity:token.live?1:0.4 }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <TokenIcon symbol={token.symbol} size={38} />
                  <div>
                    <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text)" }}>{token.symbol}</p>
                    <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.name} · {token.network}</p>
                  </div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>{isLoading&&token.live?"...":getBalance(token)}</p>
                  <p style={{ fontSize:"11px", color:"var(--text-2)" }}>{token.live?(isLoading?"...":getFiat(token)):"Coming soon"}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SWAP TAB */}
        {activeTab==="swap" && (
          <div>
            {swapStep==="idle" && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div>
                  <p className="zp-label">From</p>
                  <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <select value={fromToken} onChange={e => { setFromToken(e.target.value as TokenSymbol); setNetOut(""); }} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"15px", fontWeight:"700", cursor:"pointer", flex:1 }}>
                      <option value="USDC">USDC</option>
                      <option value="EURC">EURC</option>
                    </select>
                    <input type="number" placeholder="0.00" value={swapAmount} onChange={e => { setSwapAmount(e.target.value); setNetOut(""); }} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"22px", fontWeight:"800", textAlign:"right", width:"120px" }} />
                  </div>
                  <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"6px", textAlign:"right" }}>Balance: {fromToken==="USDC"?usdcFormatted:eurcFormatted} {fromToken}</p>
                </div>
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <button onClick={() => { setFromToken(toToken); setToToken(fromToken); setSwapAmount(""); setNetOut(""); }} style={{ width:"36px", height:"36px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--green)", cursor:"pointer", fontSize:"16px" }}>⇅</button>
                </div>
                <div>
                  <p className="zp-label">To</p>
                  <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <select value={toToken} onChange={e => { setToToken(e.target.value as TokenSymbol); setNetOut(""); }} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"15px", fontWeight:"700", cursor:"pointer", flex:1 }}>
                      <option value="USDC">USDC</option>
                      <option value="EURC">EURC</option>
                    </select>
                    <p style={{ fontSize:"22px", fontWeight:"800", color:netOut?"var(--green)":"var(--text-3)" }}>{netOut||"0.00"}</p>
                  </div>
                </div>
                {netOut && (
                  <div style={{ background:"var(--surface-2)", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:"12px", color:"var(--text-2)" }}>You receive</span><span style={{ fontSize:"12px", fontWeight:"700", color:"var(--green)" }}>{netOut} {toToken}</span></div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}><span style={{ fontSize:"12px", color:"var(--text-2)" }}>Fee (0.5%)</span><span style={{ fontSize:"12px", color:"var(--text-2)" }}>{feeAmount} {toToken}</span></div>
                  </div>
                )}
                <button onClick={handleSwap} disabled={!swapAmount||Number(swapAmount)<=0||fromToken===toToken} className="zp-btn-primary">
                  {fromToken===toToken?"Select different tokens":!swapAmount?"Enter amount":"Swap "+fromToken+" → "+toToken}
                </button>
              </div>
            )}
            {isPending && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px" }}>
                <div className="zp-spinner" />
                <p style={{ color:"var(--text)", fontWeight:"700" }}>{swapStep==="approving"?(approveConfirming?"Confirming approval...":"Waiting for approval..."):(swapConfirming?"Confirming swap...":"Waiting for confirmation...")}</p>
                {swapStep==="approving" && <p style={{ fontSize:"12px", color:"var(--text-2)", textAlign:"center" }}>Step 1 of 2 — approval, then swap</p>}
              </div>
            )}
            {swapStep==="success" && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px" }}>
                <div className="zp-result-icon success">✓</div>
                <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>Swap Complete</p>
                <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{swapMsg}</p>
                {swapHash && <a href={"https://testnet.arcscan.app/tx/"+swapHash} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"var(--green)", fontFamily:"monospace", textDecoration:"underline" }}>View on ArcScan ↗</a>}
                <button onClick={resetSwapState} className="zp-btn-primary" style={{ marginTop:"8px" }}>Swap Again</button>
              </div>
            )}
            {swapStep==="error" && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px" }}>
                <div className="zp-result-icon error">✕</div>
                <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)" }}>Swap Failed</p>
                <p style={{ fontSize:"13px", color:"var(--red)", textAlign:"center" }}>{swapMsg}</p>
                <button onClick={resetSwapState} className="zp-btn-primary" style={{ marginTop:"8px" }}>Try Again</button>
              </div>
            )}
          </div>
        )}

        {/* BRIDGE TAB */}
        {activeTab==="bridge" && (
          <div>
            {bridgeStep==="idle" && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <p style={{ fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>Bridge USDC</p>
                  <span className="zp-badge zp-badge-amber">Demo Mode</span>
                </div>
                <div>
                  <p className="zp-label">From</p>
                  <div style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"var(--green-dim)", border:"1px solid var(--green-border)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"var(--green)", fontWeight:"700", flexShrink:0 }}>ARC</div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:"14px", fontWeight:"700", color:"var(--text)" }}>Arc Testnet</p>
                      <p style={{ fontSize:"11px", color:"var(--text-2)" }}>Balance: {usdcFormatted} USDC</p>
                    </div>
                    <input type="number" placeholder="0.00" value={bridgeAmount} onChange={e => setBridgeAmount(e.target.value)} style={{ width:"90px", background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:"20px", fontWeight:"800", textAlign:"right" }} />
                  </div>
                </div>
                <div style={{ display:"flex", justifyContent:"center" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"50%", border:"1px solid var(--border)", background:"var(--surface-2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--green)", fontSize:"14px" }}>↓</div>
                </div>
                <div>
                  <p className="zp-label">To Network</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px" }}>
                    {BRIDGE_ROUTES.map(r => (
                      <button key={r.to} onClick={() => setBridgeRoute(r)}
                        style={{ padding:"10px 8px", borderRadius:"10px", border:"1px solid "+(bridgeRoute.to===r.to?"var(--green-border)":"var(--border)"), background:bridgeRoute.to===r.to?"var(--green-dim)":"var(--surface-2)", color:bridgeRoute.to===r.to?"var(--green)":"var(--text-2)", cursor:"pointer", fontSize:"11px", fontWeight:bridgeRoute.to===r.to?"700":"400", textAlign:"center" }}>
                        {r.to}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize:"11px", color:"var(--text-2)", marginTop:"8px", textAlign:"center" }}>Est. time: {bridgeRoute.time}</p>
                </div>
                {bridgeAmount && Number(bridgeAmount)>0 && (
                  <div style={{ background:"var(--surface-2)", borderRadius:"10px", padding:"12px 14px", display:"flex", flexDirection:"column", gap:"6px" }}>
                    {[{label:"You send",value:bridgeAmount+" USDC"},{label:"You receive",value:bridgeAmount+" USDC on "+bridgeRoute.to},{label:"Bridge fee",value:"~0.10 USDC"},{label:"Est. time",value:bridgeRoute.time}].map((row,i) => (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:"12px", color:"var(--text-2)" }}>{row.label}</span>
                        <span style={{ fontSize:"12px", fontWeight:"600", color:i===1?"var(--green)":"var(--text)" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={() => { if(!bridgeAmount||Number(bridgeAmount)<=0) return; setBridgeStep("pending"); setTimeout(()=>setBridgeStep("success"),3000); }} disabled={!bridgeAmount||Number(bridgeAmount)<=0} className="zp-btn-primary">
                  {!bridgeAmount?"Enter amount":"Bridge to "+bridgeRoute.to}
                </button>
              </div>
            )}
            {bridgeStep==="pending" && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"40px" }}>
                <div className="zp-spinner" />
                <p style={{ color:"var(--text)", fontWeight:"700" }}>Bridging to {bridgeRoute.to}...</p>
                <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Demo mode · Est. {bridgeRoute.time}</p>
              </div>
            )}
            {bridgeStep==="success" && (
              <div className="zp-card" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"14px", padding:"40px" }}>
                <div className="zp-result-icon success">✓</div>
                <p style={{ fontSize:"18px", fontWeight:"800", color:"var(--text)" }}>Bridge Initiated!</p>
                <p style={{ fontSize:"13px", color:"var(--text-2)", textAlign:"center" }}>{bridgeAmount} USDC → {bridgeRoute.to}</p>
                <span className="zp-badge zp-badge-amber">🟡 Demo — no real funds moved</span>
                <button onClick={() => { setBridgeStep("idle"); setBridgeAmount(""); }} className="zp-btn-primary" style={{ marginTop:"8px" }}>Bridge Again</button>
              </div>
            )}
          </div>
        )}

      </div>
      <BottomNav />
    </main>
  );
}
