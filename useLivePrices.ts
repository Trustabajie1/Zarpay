"use client";

import { useEffect, useState } from "react";
import { getLiveRates, Currency } from "@/lib/useSettings";

type PriceState = {
  maticUsd: number;
  rates: Record<Currency, number>;
  loading: boolean;
};

export function useLivePrices() {
  const [state, setState] = useState<PriceState>({
    maticUsd: 0.65,
    rates: {
      USD: 1,
      NGN: 1380,
      GBP: 0.79,
      EUR: 0.92,
    },
    loading: false,
  });

  useEffect(() => {
    async function loadPrices() {
      try {
        const rates = await getLiveRates();

        setState({
          maticUsd: 0.65,
          rates,
          loading: false,
        });
      } catch {
        setState((prev) => ({
          ...prev,
          maticUsd: 0.65,
          loading: false,
        }));
      }
    }

    loadPrices();
  }, []);

  return state;
}