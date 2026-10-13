import { useState, useEffect, useCallback, useRef } from "react";

export type NotificationType = "received_usdc" | "received_eurc" | "swap" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  txHash?: string;
  amount?: string;
  token?: string;
}

const STORAGE_KEY = "zarpay_notifications";
const SEEN_KEY = "zarpay_seen_txs";
const POLL_INTERVAL = 30_000; // 30 seconds

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch { return []; }
}

function saveNotifications(notifications: AppNotification[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)); } catch { /* ignore */ }
}

function loadSeenTxs(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch { return new Set(); }
}

function saveSeenTxs(seen: Set<string>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...seen])); } catch { /* ignore */ }
}

async function fetchIncoming(address: string): Promise<{ hash: string; value: string; token: string; timeStamp: string }[]> {
  const base = "https://explorer.testnet.arc.io/api";
  try {
    const [usdcRes, eurcRes] = await Promise.all([
      fetch(`${base}?module=account&action=tokentx&contractaddress=${USDC_ADDRESS}&address=${address}&page=1&offset=10&sort=desc`),
      fetch(`${base}?module=account&action=tokentx&contractaddress=${EURC_ADDRESS}&address=${address}&page=1&offset=10&sort=desc`),
    ]);
    const [usdcData, eurcData] = await Promise.all([
      usdcRes.json() as Promise<unknown>,
      eurcRes.json() as Promise<unknown>,
    ]);

    const parse = (data: unknown, token: string) => {
      if (data && typeof data === "object" && "result" in data && Array.isArray((data as { result: unknown[] }).result)) {
        return (data as { result: Record<string, string>[] }).result
          .filter((tx) => tx["to"]?.toLowerCase() === address.toLowerCase() && tx["isError"] === "0")
          .map((tx) => ({ hash: tx["hash"], value: (Number(tx["value"]) / 1e6).toFixed(2), token, timeStamp: tx["timeStamp"] }));
      }
      return [];
    };

    return [...parse(usdcData, "USDC"), ...parse(eurcData, "EURC")];
  } catch { return []; }
}

export function useNotifications(address?: string) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications());
  const seenRef = useRef<Set<string>>(loadSeenTxs());
  const initialized = useRef(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => n.id === id ? { ...n, read: true } : n);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveNotifications([]);
  }, []);

  const addSystemNotification = useCallback((title: string, message: string) => {
    const n: AppNotification = {
      id: `sys-${Date.now()}`,
      type: "system",
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };
    setNotifications((prev) => {
      const updated = [n, ...prev].slice(0, 50);
      saveNotifications(updated);
      return updated;
    });
  }, []);

  // Poll for new incoming transactions
  useEffect(() => {
    if (!address) return;

    const poll = async () => {
      const incoming = await fetchIncoming(address);
      const seen = seenRef.current;
      const newTxs = incoming.filter((tx) => !seen.has(tx.hash));

      if (newTxs.length === 0) return;

      // On first load, just mark all as seen without notifying
      if (!initialized.current) {
        newTxs.forEach((tx) => seen.add(tx.hash));
        saveSeenTxs(seen);
        initialized.current = true;
        return;
      }

      const newNotifs: AppNotification[] = newTxs.map((tx) => ({
        id: tx.hash,
        type: tx.token === "USDC" ? "received_usdc" : "received_eurc",
        title: `${tx.token} Received`,
        message: `You received ${tx.value} ${tx.token}`,
        timestamp: Number(tx.timeStamp) * 1000,
        read: false,
        txHash: tx.hash,
        amount: tx.value,
        token: tx.token,
      }));

      newTxs.forEach((tx) => seen.add(tx.hash));
      saveSeenTxs(seen);

      setNotifications((prev) => {
        const updated = [...newNotifs, ...prev].slice(0, 50);
        saveNotifications(updated);
        return updated;
      });
    };

    void poll();
    initialized.current = false;
    const timer = setInterval(() => void poll(), POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [address]);

  return { notifications, unreadCount, markRead, markAllRead, clearAll, addSystemNotification };
}
