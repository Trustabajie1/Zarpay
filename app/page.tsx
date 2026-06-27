"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0f14",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "24px",
        padding: "24px",
      }}
    >
      <h1
        style={{
          color: "white",
          fontSize: "42px",
          fontWeight: "800",
        }}
      >
        ZarPay
      </h1>

      <p
        style={{
          color: "#9ca3af",
          fontSize: "16px",
          textAlign: "center",
          maxWidth: "420px",
        }}
      >
        Borderless stablecoin payments powered by Web3.
      </p>

      <ConnectButton />
    </main>
  );
}