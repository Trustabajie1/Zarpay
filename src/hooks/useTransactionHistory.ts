import { useState, useCallback, useEffect } from "react";
import { createPublicClient, http, parseAbiItem, formatUnits } from "viem";

export interface Transaction {
  hash: string;
  value: string;
  token: string;
  type: "sent" | "received";
  timeStamp: string;
  isError: string;
  blockNumber: bigint;
}

export function shortenHash(hash: string) {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

export function formatTxDate(timestamp: string) {
  if (!timestamp || timestamp === "0") return "Recent";
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;
const TRANSFER_EVENT = parseAbiItem("event Transfer(address indexed from, address indexed to, uint256 value)");
const RPC = "https://rpc.testnet.arc.io";
const BLOCK_RANGE = 5000n; // small enough to avoid RPC limits

const client = createPublicClient({
  chain: {
    id: 5042002,
    name: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: { default: { http: [RPC] } },
  },
  transport: http(RPC, { timeout: 15_000 }),
});

async function fetchTxHistory(address: string): Promise<Transaction[]> {
  const addr = address.toLowerCase() as `0x${string}`;
  const currentBlock = await client.getBlockNumber();
  const fromBlock = currentBlock > BLOCK_RANGE ? currentBlock - BLOCK_RANGE : 0n;

  const results = await Promise.allSettled([
    client.getLogs({ address: USDC_ADDRESS, event: TRANSFER_EVENT, args: { from: addr }, fromBlock, toBlock: "latest" }),
    client.getLogs({ address: USDC_ADDRESS, event: TRANSFER_EVENT, args: { to: addr }, fromBlock, toBlock: "latest" }),
    client.getLogs({ address: EURC_ADDRESS, event: TRANSFER_EVENT, args: { from: addr }, fromBlock, toBlock: "latest" }),
    client.getLogs({ address: EURC_ADDRESS, event: TRANSFER_EVENT, args: { to: addr }, fromBlock, toBlock: "latest" }),
  ]);

  const [usdcSent, usdcReceived, eurcSent, eurcReceived] = results.map(r =>
    r.status === "fulfilled" ? r.value : []
  );

  const toTx = (log: typeof usdcSent[0], token: string, type: "sent" | "received"): Transaction => {
    const value = log.args.value ? formatUnits(log.args.value, 6) : "0";
    // Use blockNumber as a proxy for timestamp (no extra RPC calls needed)
    return {
      hash: log.transactionHash ?? "",
      value: parseFloat(value).toFixed(2),
      token,
      type,
      timeStamp: log.blockNumber?.toString() ?? "0",
      isError: "0",
      blockNumber: log.blockNumber ?? 0n,
    };
  };

  const all: Transaction[] = [
    ...usdcSent.map(l => toTx(l, "USDC", "sent")),
    ...usdcReceived.map(l => toTx(l, "USDC", "received")),
    ...eurcSent.map(l => toTx(l, "EURC", "sent")),
    ...eurcReceived.map(l => toTx(l, "EURC", "received")),
  ].sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));

  // Deduplicate by token+hash
  const seen = new Set<string>();
  return all.filter(tx => {
    const key = `${tx.token}-${tx.hash}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 30);
}

export function useTransactionHistory(address?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    if (!address) {
      setTransactions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setIsError(false);
    fetchTxHistory(address)
      .then((txs) => { if (!cancelled) setTransactions(txs); })
      .catch(() => { if (!cancelled) setIsError(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [address, tick]);

  return { transactions, isLoading, isError, refetch };
}
