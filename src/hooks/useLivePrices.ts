import { useEffect, useState } from "react";
import { FALLBACK_RATES, type Currency } from "@/zarpay-settings";

interface PriceState {
  rates: Record<Currency, number>;
  loading: boolean;
}

export function useLivePrices(): PriceState {
  const [state, setState] = useState<PriceState>({
    rates: { ...FALLBACK_RATES },
    loading: true,
  });

  useEffect(() => {
    void fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json() as Promise<{ rates?: Record<string, number> }>)
      .then((data) => {
        setState({
          rates: {
            USD: 1,
            NGN: Number(data?.rates?.["NGN"]) || FALLBACK_RATES.NGN,
            GBP: Number(data?.rates?.["GBP"]) || FALLBACK_RATES.GBP,
            EUR: Number(data?.rates?.["EUR"]) || FALLBACK_RATES.EUR,
          },
          loading: false,
        });
      })
      .catch(() => {
        setState({ rates: { ...FALLBACK_RATES }, loading: false });
      });
  }, []);

  return state;
}
