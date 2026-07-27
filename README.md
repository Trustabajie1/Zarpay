# ZarPay 🟢

> Stablecoin-powered P2P payment app built on Arc Network

ZarPay is a Web3 fintech application that simplifies crypto payments using USDC and EURC stablecoins on Arc Network — a purpose-built L1 blockchain for real-world financial activity.

## Features

- 🔐 Wallet connect via RainbowKit + MetaMask
- 💰 Live USDC & EURC balances on Arc Testnet
- ↑ Send USDC/EURC transactions on Arc Network
- ↓ Receive with QR code
- ⇄ Exchange USDC ↔ EURC
- 📜 Transaction history via ArcScan
- 🌐 Multi-language support (8 languages)
- 🎨 Dark/Light theme
- 💱 Multi-currency display (NGN, USD, GBP, EUR)

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript
- **Web3:** wagmi, RainbowKit, viem
- **Blockchain:** Arc Testnet (Chain ID: 5042002)
- **Tokens:** USDC, EURC (Circle)
- **Explorer:** ArcScan

## Network Details

| Parameter | Value |
|-----------|-------|
| Network | Arc Testnet |
| Chain ID | 5042002 |
| RPC | https://rpc.testnet.arc.network |
| Explorer | https://testnet.arcscan.app |
| Faucet | https://faucet.circle.com |

## Contract Addresses

| Token | Address |
|-------|---------|
| USDC | 0x3600000000000000000000000000000000000000 |
| EURC | 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a |
| Permit2 | 0x000000000022D473030F116dDEE9F6B43aC78BA3 |

## Getting Started

```bash
git clone https://github.com/Trustabajie1/Zarpay.git
cd Zarpay
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing

1. Add Arc Testnet to MetaMask (Chain ID: 5042002)
2. Get testnet USDC from [faucet.circle.com](https://faucet.circle.com)
3. Connect wallet and start testing!

## Built For

ZarPay is designed to bridge traditional local currency systems with modern blockchain finance — starting with emerging markets like Africa where stablecoin payments can replace slow, expensive traditional transfers.