"use client";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { useAppSettings } from "@/components/SettingsContext";
import { useTransactionHistory, formatTxDate, shortenHash } from "@/lib/useTransactionHistory";
export default function ActivityPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { settings } = useAppSettings();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && !isConnected) router.push("/"); }, [mounted, isConnected, router]);
  const { transactions, isLoading, isError, refetch } = useTransactionHistory(address);
  if (!mounted) return null;
  return (
    <main className="zp-page">
      <div className="zp-content">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)", letterSpacing:"-0.02em" }}>History</h1>
          <button onClick={() => refetch()} style={{ background:"var(--surface-2)", border:"1px solid var(--border)", borderRadius:"8px", padding:"6px 12px", color:"var(--text-2)", cursor:"pointer", fontSize:"16px" }}>↻</button>
        </div>
        <div className="zp-card">
          {isLoading && (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ height:"64px", background:"var(--surface-2)", borderRadius:"10px" }} />)}
            </div>
          )}
          {isError && !isLoading && (
            <div style={{ padding:"40px", textAlign:"center" }}>
              <p style={{ color:"var(--red)", fontSize:"14px", marginBottom:"16px" }}>Failed to load transactions</p>
              <button onClick={() => refetch()} className="zp-btn-secondary" style={{ width:"auto", padding:"10px 20px" }}>Try Again</button>
            </div>
          )}
          {!isLoading && !isError && transactions.length === 0 && (
            <div style={{ padding:"48px 20px", textAlign:"center" }}>
              <p style={{ fontSize:"32px", marginBottom:"12px" }}>📭</p>
              <p style={{ fontSize:"15px", fontWeight:"600", color:"var(--text)", marginBottom:"6px" }}>No transactions yet</p>
              <p style={{ fontSize:"12px", color:"var(--text-2)" }}>Send or receive USDC on Arc Testnet to see activity here</p>
            </div>
          )}
          {!isLoading && !isError && transactions.length > 0 && (
            <div style={{ display:"flex", flexDirection:"column" }}>
              {transactions.map((tx, i) => (
                <a key={tx.hash} href={"https://testnet.arcscan.app/tx/"+tx.hash} target="_blank" rel="noopener noreferrer"
                  style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom: i < transactions.length-1 ? "1px solid var(--border)" : "none", textDecoration:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    <div style={{ width:"38px", height:"38px", borderRadius:"50%", background: tx.type==="sent" ? "var(--red-dim)" : "var(--green-dim)", border:"1px solid "+(tx.type==="sent" ? "rgba(231,76,60,0.25)" : "var(--green-border)"), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px" }}>
                      {tx.type==="sent" ? "↗" : "↙"}
                    </div>
                    <div>
                      <p style={{ fontSize:"14px", fontWeight:"600", color:"var(--text)", marginBottom:"2px" }}>{tx.type==="sent" ? "Sent" : "Received"}</p>
                      <p style={{ fontSize:"11px", color:"var(--text-2)", fontFamily:"monospace" }}>{shortenHash(tx.hash)}</p>
                      <p style={{ fontSize:"10px", color:"var(--text-3)", marginTop:"1px" }}>{formatTxDate(tx.timeStamp)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:"14px", fontWeight:"700", color: tx.type==="sent" ? "var(--red)" : "var(--green)", marginBottom:"4px" }}>{tx.type==="sent"?"-":"+"}{tx.value} {tx.token}</p>
                    <span style={{ fontSize:"10px", padding:"2px 8px", borderRadius:"4px", background: tx.isError==="0" ? "var(--green-dim)" : "var(--red-dim)", color: tx.isError==="0" ? "var(--green)" : "var(--red)" }}>{tx.isError==="0"?"Success":"Failed"}</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
