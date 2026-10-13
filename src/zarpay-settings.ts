// ZarPay settings types and storage helpers

export type Currency = "NGN" | "USD" | "GBP" | "EUR";
export type Language = "English" | "French" | "Spanish" | "Arabic";
export type Theme = "dark" | "light";

export interface AppSettings {
  currency: Currency;
  language: Language;
  displayName: string;
  theme: Theme;
  notifications: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  currency: "NGN",
  language: "English",
  displayName: "",
  theme: "dark",
  notifications: true,
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
  EUR: "€",
};

export const FALLBACK_RATES: Record<Currency, number> = {
  NGN: 1380,
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
};

const STORAGE_KEY = "zarpay_settings";

function storageKey(address?: string) {
  return address ? `${STORAGE_KEY}_${address.toLowerCase()}` : STORAGE_KEY;
}

export function saveSettings(s: AppSettings, address?: string): void {
  try {
    // Save to wallet-specific key AND the global key (global = last active)
    const json = JSON.stringify(s);
    localStorage.setItem(storageKey(address), json);
    localStorage.setItem(STORAGE_KEY, json);
  } catch { /* ignore */ }
}

export function loadSettings(address?: string): AppSettings {
  try {
    // Prefer wallet-specific settings, fall back to global
    const raw = localStorage.getItem(storageKey(address)) ?? localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}
