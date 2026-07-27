"use client";
import { useDisconnect } from "wagmi";
export function DisconnectButton() {
  const { disconnect } = useDisconnect();
  return (
    <button onClick={() => disconnect()}
      style={{ padding:"8px 14px", borderRadius:"8px", border:"1px solid var(--border)", background:"var(--surface-2)", color:"var(--text-2)", fontSize:"12px", fontWeight:"600", cursor:"pointer", letterSpacing:"0.02em" }}>
      Disconnect
    </button>
  );
}
