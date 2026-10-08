export const ARC_TESTNET_CHAIN_ID = 5042002;

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as const;
export const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;

export const ZARPAY_SWAP_POOL_ADDRESS = "0x7b3b331260d8147436E76aE035850345ee3F6123" as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "decimals",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;

export const ZARPAY_SWAP_POOL_ABI = [
    {
    type: "function",
    name: "swapUSDCtoEURC",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "swapEURCtoUSDC",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "payMerchant",
    stateMutability: "nonpayable",
    inputs: [
      { name: "merchant", type: "address" },
      { name: "usdcAmountIn", type: "uint256" },
      { name: "minEurcOut", type: "uint256" },
    ],
    outputs: [{ name: "eurcAmountOut", type: "uint256" }],
  },
  {
    type: "function",
    name: "previewSwap",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "isUsdcToEurc", type: "bool" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "previewSwapAfterFee",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "isUsdcToEurc", type: "bool" },
    ],
    outputs: [
      { name: "netOut", type: "uint256" },
      { name: "feeAmount", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "usdcToEurcRate",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "feeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const TOKEN_DECIMALS = 6;