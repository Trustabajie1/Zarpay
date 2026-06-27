"use client";

import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { usdcAbi } from "@/lib/usdcAbi";
import { ARC_USDC, USDC_DECIMALS } from "@/lib/tokens";
import { EURC_ADDRESS, TOKEN_DECIMALS } from "@/lib/contracts";

export type WalletBalance = {
  usdcFormatted: string;
  eurcFormatted: string;
  isLoading: boolean;
  refetch: () => void;
};

export function useWalletBalance(address?: `0x${string}`): WalletBalance {
  const {
    data: usdcBalance,
    isLoading: usdcLoading,
    refetch: refetchUsdc,
  } = useReadContract({
    address: ARC_USDC as `0x${string}`,
    abi: usdcAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const {
    data: eurcBalance,
    isLoading: eurcLoading,
    refetch: refetchEurc,
  } = useReadContract({
    address: EURC_ADDRESS,
    abi: usdcAbi, // EURC uses the same standard ERC-20 ABI
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const usdcFormatted =
    usdcBalance !== undefined
      ? Number(formatUnits(usdcBalance as bigint, USDC_DECIMALS)).toFixed(2)
      : "0.00";

  const eurcFormatted =
    eurcBalance !== undefined
      ? Number(formatUnits(eurcBalance as bigint, TOKEN_DECIMALS)).toFixed(2)
      : "0.00";

  function refetch() {
    refetchUsdc();
    refetchEurc();
  }

  return {
    usdcFormatted,
    eurcFormatted,
    isLoading: usdcLoading || eurcLoading,
    refetch,
  };
}