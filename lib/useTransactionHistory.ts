"use client";
import { useEffect, useState, useCallback } from "react";

const API_KEY = "M6HD8ES5YW89AWPE6M96YJQXY9IB4Z5IKE";

export type Transaction = {
  hash: string;
  value: string;
  type: "sent" | "received";
  timeStamp: string;
  isError: string;
};

export function shortenHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function formatTxDate(timestamp: string) {
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function useTransactionHistory(address?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setIsError(false);
      const response = await fetch(
        `https://api.etherscan.io/v2/api?chainid=80002&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`
      );
      const data = await response.json();
      if (data.status === "1" && Array.isArray(data.result)) {
        const formatted = data.result.map((tx: any) => ({
          hash: tx.hash,
          value: (Number(tx.value) / 1e18).toFixed(4),
          type: tx.from.toLowerCase() === address.toLowerCase() ? "sent" : "received",
          timeStamp: tx.timeStamp,
          isError: tx.isError,
        }));
        setTransactions(formatted);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, isLoading, isError, refetch: fetchTransactions };
}