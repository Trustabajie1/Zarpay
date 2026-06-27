"use client";

export type Currency =
| "NGN"
| "USD"
| "GBP"
| "EUR";

export type Language =
| "English"
| "French"
| "Spanish"
| "Arabic"
| "Portuguese"
| "Chinese"
| "German"
| "Japanese";

export type Theme =
| "dark"
| "light";

export type AppSettings = {
currency: Currency;
notifications: boolean;
language: Language;
displayName: string;
theme: Theme;
};

export const DEFAULT_SETTINGS: AppSettings = {
currency: "NGN",
notifications: true,
language: "English",
displayName: "",
theme: "dark",
};

export const FALLBACK_RATES: Record<Currency, number> = {
NGN: 1380,
USD: 1,
GBP: 0.79,
EUR: 0.92,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
NGN: "₦",
USD: "$",
GBP: "£",
EUR: "€",
};

const STORAGE_KEY = "zarpay_settings";

export async function getLiveRates(): Promise<Record<Currency, number>> {
try {
const response = await fetch(
"https://open.er-api.com/v6/latest/USD",
{
cache: "no-store",
}
);

```
if (!response.ok) {
  throw new Error("Failed to fetch exchange rates");
}

const data = await response.json();

return {
  USD: 1,
  NGN: Number(data?.rates?.NGN) || FALLBACK_RATES.NGN,
  GBP: Number(data?.rates?.GBP) || FALLBACK_RATES.GBP,
  EUR: Number(data?.rates?.EUR) || FALLBACK_RATES.EUR,
};
```

} catch (error) {
console.error(
"Failed to fetch live rates:",
error
);

```
return FALLBACK_RATES;
```

}
}

export function saveSettings(
settings: AppSettings
): void {
try {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify(settings)
);
} catch (error) {
console.error(
"Failed to save settings:",
error
);
}
}

export function loadSettings(): AppSettings {
try {
const stored =
localStorage.getItem(STORAGE_KEY);

```
if (stored) {
  const parsed = JSON.parse(stored);

  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
  };
}
```

} catch (error) {
console.error(
"Failed to load settings:",
error
);
}

return DEFAULT_SETTINGS;
}

export function clearSettings(): void {
try {
localStorage.removeItem(STORAGE_KEY);
} catch (error) {
console.error(
"Failed to clear settings:",
error
);
}
}
