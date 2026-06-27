"use client";

import { useState } from "react";
import { Currency } from "@/lib/useSettings";

type PriceState = {
  maticUsd: number;
  rates: Record<Currency, number>;
  loading: boolean;
};

export function useLivePrices() {
  const [state] = useState<PriceState>({
    maticUsd: 0.65,
    rates: {
      USD: 1,
      NGN: 1380,
      GBP: 0.79,
      EUR: 0.92,
    },
    loading: false,
  });

  console.log("useLivePrices state", state);

  return state;
}