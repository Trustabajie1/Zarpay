import { useReadContract } from "wagmi";
import { erc20Abi } from "viem";
import { getUsdc } from "@/onchain-facts";
import { Amount, usdcDecimalsFor } from "@/onchain-money";

const ARC_TESTNET_CHAIN_ID = 5042002;

// EURC on Arc Testnet
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const;
const EURC_DECIMALS = 6;

export interface WalletBalance {
  usdcFormatted: string;
  eurcFormatted: string;
  usdcRaw: bigint;
  eurcRaw: bigint;
  isLoading: boolean;
  refetch: () => void;
}

export function useWalletBalance(address?: `0x${string}`): WalletBalance {
  const usdc = getUsdc(ARC_TESTNET_CHAIN_ID);
  const usdcAddress = usdc?.address as `0x${string}` | undefined;

  const {
    data: usdcBalance,
    isLoading: usdcLoading,
    refetch: refetchUsdc,
  } = useReadContract({
    address: usdcAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!address && !!usdcAddress },
  });

  const {
    data: eurcBalance,
    isLoading: eurcLoading,
    refetch: refetchEurc,
  } = useReadContract({
    address: EURC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: ARC_TESTNET_CHAIN_ID,
    query: { enabled: !!address },
  });

  const usdcDecimals = usdcDecimalsFor(ARC_TESTNET_CHAIN_ID);
  const usdcRaw = (usdcBalance) ?? 0n;
  const eurcRaw = (eurcBalance) ?? 0n;

  const usdcFormatted = Amount.fromRaw(usdcRaw, usdcDecimals).toFixed(2);
  const eurcFormatted = Amount.fromRaw(eurcRaw, EURC_DECIMALS).toFixed(2);

  function refetch() {
    void refetchUsdc();
    void refetchEurc();
  }

  return {
    usdcFormatted,
    eurcFormatted,
    usdcRaw,
    eurcRaw,
    isLoading: usdcLoading || eurcLoading,
    refetch,
  };
}
