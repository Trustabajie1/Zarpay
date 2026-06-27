"use client"

import "@rainbow-me/rainbowkit/styles.css"

import {
  getDefaultConfig,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit"

import {
  WagmiProvider,
} from "wagmi"

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import { defineChain } from "viem"

export const arcTestnet = defineChain({
  id: 5042002,

  name: "Arc Testnet",

  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 6,
  },

  rpcUrls: {
    default: {
      http: [
        "https://rpc.testnet.arc.network",
      ],
    },
  },

  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },

  testnet: true,
})

export const config = getDefaultConfig({
  appName: "ZarPay",

  projectId: "d2896492534f1efc1b3da44fb7d034a4",

  chains: [arcTestnet],

  ssr: true,

  autoConnect: false,
})

const queryClient = new QueryClient()

export function Providers({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}