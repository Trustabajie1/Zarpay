"use client";

import { useEffect, useState } from "react";
import { useDisconnect, useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export function DisconnectButton() {
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/");
    }
  }, [isConnected, mounted, router]);

  function handleDisconnect() {
    disconnect();
  }

  if (!mounted) return null;

  return (
    <button
      onClick={handleDisconnect}
      style={{
        fontSize: "12px",
        color: "#6b7280",
        border: "1px solid #374151",
        borderRadius: "8px",
        padding: "6px 12px",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      Disconnect
    </button>
  );
}