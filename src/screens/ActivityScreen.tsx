import { useState } from "react";
import { useAccount } from "wagmi";
import { RefreshCw, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Zap, Building2, Inbox, ExternalLink } from "lucide-react";
import { useTransactionHistory, shortenHash, formatTxDate, type Transaction } from "@/hooks/useTransactionHistory";
import { buildTxExplorerUrl } from "@/onchain-facts";

const ARC_CHAIN_ID = 5042002;

type Filter = "all" | "sent" | "received" | "usdc" | "eurc";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all",      label: "All" },
  { id: "received", label: "Received" },
  { id: "sent",     label: "Sent" },
  { id: "usdc",     label: "USDC" },
  { id: "eurc",     label: "EURC" },
];

function getTxIcon(tx: Transaction) {
  const isSent = tx.type === "sent";
  if (tx.token === "EURC" && isSent) return { icon: ArrowUpRight, bg: "var(--zp-red-dim)", border: "rgba(231,76,60,0.25)", color: "var(--zp-red)" };
  if (tx.token === "EURC")          return { icon: ArrowDownLeft, bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)", color: "#818cf8" };
  if (isSent)                        return { icon: ArrowUpRight, bg: "var(--zp-red-dim)", border: "rgba(231,76,60,0.25)", color: "var(--zp-red)" };
  return                               { icon: ArrowDownLeft, bg: "var(--zp-green-dim)", border: "var(--zp-green-border)", color: "var(--zp-green)" };
}

function getTxLabel(tx: Transaction) {
  if (tx.type === "sent")     return `Sent ${tx.token}`;
  return `Received ${tx.token}`;
}

function groupByDate(txs: Transaction[]): { label: string; txs: Transaction[] }[] {
  const groups: Record<string, Transaction[]> = {};
  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now.getTime() - 86400000).toDateString();

  txs.forEach((tx) => {
    // timeStamp is a block number when < 2000000000 (unix epoch threshold)
    const isBlockNum = Number(tx.timeStamp) < 2_000_000_000;
    let label: string;
    if (isBlockNum) {
      label = "Recent";
    } else {
      const d = new Date(Number(tx.timeStamp) * 1000);
      if (d.toDateString() === today) label = "Today";
      else if (d.toDateString() === yesterday) label = "Yesterday";
      else label = d.toLocaleDateString("en-NG", { weekday: "long", month: "short", day: "numeric" });
    }
    (groups[label] ??= []).push(tx);
  });

  return Object.entries(groups).map(([label, txs]) => ({ label, txs }));
}

export function ActivityScreen() {
  const { address } = useAccount();
  const { transactions, isLoading, isError, refetch } = useTransactionHistory(address);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = transactions.filter((tx) => {
    if (filter === "all")      return true;
    if (filter === "sent")     return tx.type === "sent";
    if (filter === "received") return tx.type === "received";
    if (filter === "usdc")     return tx.token === "USDC";
    if (filter === "eurc")     return tx.token === "EURC";
    return true;
  });

  const groups = groupByDate(filtered);

  const totalIn  = transactions.filter(t => t.type === "received" && t.isError === "0").reduce((s, t) => s + parseFloat(t.value), 0);
  const totalOut = transactions.filter(t => t.type === "sent"     && t.isError === "0").reduce((s, t) => s + parseFloat(t.value), 0);

  return (
    <div className="zp-page">
      <div className="zp-content">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "var(--zp-text)", letterSpacing: "-0.02em" }}>History</h1>
          <button
            onClick={() => void refetch()}
            style={{ background: "var(--zp-surface-2)", border: "1px solid var(--zp-border)", borderRadius: 8, padding: "6px 10px", color: "var(--zp-text-2)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <RefreshCw size={14} />
            <span style={{ fontSize: 12 }}>Refresh</span>
          </button>
        </div>

        {/* Summary strip */}
        {!isLoading && transactions.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <div style={{ background: "var(--zp-green-dim)", border: "1px solid var(--zp-green-border)", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, color: "var(--zp-text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total In</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "var(--zp-green)" }}>+{totalIn.toFixed(2)}</p>
              <p style={{ fontSize: 10, color: "var(--zp-text-2)" }}>across {transactions.filter(t => t.type === "received").length} txns</p>
            </div>
            <div style={{ background: "var(--zp-red-dim)", border: "1px solid rgba(231,76,60,0.2)", borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 10, color: "var(--zp-text-2)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Out</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: "var(--zp-red)" }}>-{totalOut.toFixed(2)}</p>
              <p style={{ fontSize: 10, color: "var(--zp-text-2)" }}>across {transactions.filter(t => t.type === "sent").length} txns</p>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: "1px solid " + (filter === f.id ? "var(--zp-green-border)" : "var(--zp-border)"),
                background: filter === f.id ? "var(--zp-green-dim)" : "var(--zp-surface-2)",
                color: filter === f.id ? "var(--zp-green)" : "var(--zp-text-2)",
                fontSize: 12,
                fontWeight: filter === f.id ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div className="zp-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ height: 64, background: "var(--zp-surface-2)", borderRadius: 10, opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="zp-card" style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ color: "var(--zp-red)", fontSize: "14px", marginBottom: 16 }}>Failed to load transactions</p>
            <button onClick={() => void refetch()} className="zp-btn-secondary" style={{ width: "auto", padding: "10px 20px" }}>Try Again</button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="zp-card" style={{ padding: "48px 20px", textAlign: "center" }}>
            <Inbox size={40} color="var(--zp-text-3)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--zp-text)", marginBottom: 6 }}>
              {filter === "all" ? "No transactions yet" : `No ${filter} transactions`}
            </p>
            <p style={{ fontSize: "12px", color: "var(--zp-text-2)" }}>
              {filter === "all"
                ? "Send or receive USDC/EURC on Arc Testnet to see activity here"
                : "Try a different filter"}
            </p>
          </div>
        )}

        {/* Grouped transactions */}
        {!isLoading && !isError && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {groups.map((group) => (
              <div key={group.label}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--zp-text-2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                  {group.label}
                </p>
                <div className="zp-card" style={{ padding: 0, overflow: "hidden" }}>
                  {group.txs.map((tx, i) => {
                    const { icon: Icon, bg, border, color } = getTxIcon(tx);
                    return (
                      <a
                        key={`${tx.token}-${tx.hash}`}
                        href={buildTxExplorerUrl(ARC_CHAIN_ID, tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "14px 16px",
                          borderBottom: i < group.txs.length - 1 ? "1px solid var(--zp-border)" : "none",
                          textDecoration: "none",
                          transition: "background 0.1s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: "50%",
                            background: bg, border: `1px solid ${border}`,
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            <Icon size={16} color={color} />
                          </div>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--zp-text)" }}>
                                {getTxLabel(tx)}
                              </p>
                              <span style={{
                                fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                                background: tx.token === "EURC" ? "rgba(99,102,241,0.12)" : "rgba(46,204,113,0.1)",
                                color: tx.token === "EURC" ? "#818cf8" : "var(--zp-green)",
                              }}>
                                {tx.token}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                              <p style={{ fontSize: "11px", color: "var(--zp-text-2)", fontFamily: "var(--font-mono)" }}>
                                {shortenHash(tx.hash)}
                              </p>
                              <ExternalLink size={9} color="var(--zp-text-3)" />
                            </div>
                            <p style={{ fontSize: "10px", color: "var(--zp-text-3)", marginTop: 1 }}>
                              {formatTxDate(tx.timeStamp)}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p style={{ fontSize: "15px", fontWeight: 800, color, marginBottom: 4, fontVariantNumeric: "tabular-nums" }}>
                            {tx.type === "sent" ? "-" : "+"}{tx.value}
                          </p>
                          <span style={{
                            fontSize: "10px", padding: "2px 8px", borderRadius: 4,
                            background: tx.isError === "0" ? "var(--zp-green-dim)" : "var(--zp-red-dim)",
                            color: tx.isError === "0" ? "var(--zp-green)" : "var(--zp-red)",
                          }}>
                            {tx.isError === "0" ? "Success" : "Failed"}
                          </span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
