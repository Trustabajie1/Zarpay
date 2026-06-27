"use client";

type Transaction = {
  hash: string;
  amount: string;
  status: string;
};

type Props = {
  transactions: Transaction[];
};

export function TransactionHistory({
  transactions,
}: Props) {
  return (
    <div
      style={{
        marginTop: "24px",
        background: "#0e1318",
        border: "1px solid #1f2937",
        borderRadius: "20px",
        padding: "20px",
      }}
    >
      <h2
        style={{
          color: "white",
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        Recent Transactions
      </h2>

      {transactions.length === 0 ? (
        <p
          style={{
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          No transactions yet.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {transactions.map((tx, index) => (
            <div
              key={index}
              style={{
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: "12px",
                padding: "14px",
              }}
            >
              <p
                style={{
                  color: "#4ade80",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "6px",
                }}
              >
                {tx.amount} MATIC
              </p>

              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  wordBreak: "break-all",
                }}
              >
                {tx.hash}
              </p>

              <p
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                {tx.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}