"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";

import {
  useTransactionHistory,
  shortenHash,
  formatTxDate,
} from "@/lib/useTransactionHistory";

export default function TransactionsPage() {
  const router = useRouter();
  const { address } = useAccount();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    transactions,
    isLoading,
    isError,
    refetch,
  } = useTransactionHistory(address);

  if (!mounted) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0f14",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            color: "#4ade80",
            fontSize: "15px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back
        </button>

        <p
          style={{
            color: "white",
            fontSize: "16px",
            fontWeight: "700",
          }}
        >
          Transaction History
        </p>

        <button
          onClick={() => refetch()}
          style={{
            background: "none",
            border: "none",
            color: "#4b5563",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ↻
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                height: "72px",
                background: "#111827",
                borderRadius: "14px",
                border: "1px solid #1f2937",
              }}
            />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            border: "1px solid #1f2937",
            borderRadius: "16px",
            padding: "32px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            background: "#111827",
          }}
        >
          <p
            style={{
              color: "#f87171",
              fontSize: "14px",
              fontFamily: "monospace",
            }}
          >
            Failed to load transactions
          </p>

          <button
            onClick={() => refetch()}
            style={{
              background: "none",
              border: "none",
              color: "#4ade80",
              cursor: "pointer",
              fontFamily: "monospace",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && transactions.length === 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            border: "1px dashed #1f2937",
            borderRadius: "16px",
            padding: "48px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              color: "#374151",
              fontSize: "28px",
            }}
          >
            ◎
          </span>

          <p
            style={{
              color: "#4b5563",
              fontSize: "14px",
            }}
          >
            No transactions yet
          </p>

          <p
            style={{
              color: "#374151",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            Your activity will appear here
          </p>
        </div>
      )}

      {/* Transactions */}
      {!isLoading && !isError && transactions.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "440px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {transactions.map((tx) => (
            <a
              key={tx.hash}
              href={`https://amoy.polygonscan.com/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  background: "#111827",
                  border: "1px solid #1f2937",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "0.2s",
                }}
              >
                {/* Left Side */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        tx.type === "sent"
                          ? "rgba(248,113,113,0.1)"
                          : "rgba(74,222,128,0.1)",
                      border: `1px solid ${
                        tx.type === "sent"
                          ? "rgba(248,113,113,0.3)"
                          : "rgba(74,222,128,0.3)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        color:
                          tx.type === "sent"
                            ? "#f87171"
                            : "#4ade80",
                        fontSize: "16px",
                        fontWeight: "700",
                      }}
                    >
                      {tx.type === "sent" ? "↑" : "↓"}
                    </span>
                  </div>

                  <div>
                    <p
                      style={{
                        color: "white",
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "3px",
                      }}
                    >
                      {tx.type === "sent"
                        ? "Sent"
                        : "Received"}
                    </p>

                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        marginBottom: "2px",
                      }}
                    >
                      {shortenHash(tx.hash)}
                    </p>

                    <p
                      style={{
                        color: "#4b5563",
                        fontSize: "10px",
                        fontFamily: "monospace",
                      }}
                    >
                      {formatTxDate(tx.timeStamp)}
                    </p>
                  </div>
                </div>

                {/* Right Side */}
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <p
                    style={{
                      color:
                        tx.type === "sent"
                          ? "#f87171"
                          : "#4ade80",
                      fontSize: "13px",
                      fontWeight: "700",
                      marginBottom: "4px",
                    }}
                  >
                    {tx.type === "sent" ? "-" : "+"}
                    {tx.value} MATIC
                  </p>

                  <span
                    style={{
                      fontSize: "10px",
                      fontFamily: "monospace",
                      padding: "3px 7px",
                      borderRadius: "5px",
                      background:
                        tx.isError === "0"
                          ? "rgba(74,222,128,0.1)"
                          : "rgba(248,113,113,0.1)",
                      color:
                        tx.isError === "0"
                          ? "#4ade80"
                          : "#f87171",
                    }}
                  >
                    {tx.isError === "0"
                      ? "Success"
                      : "Failed"}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}