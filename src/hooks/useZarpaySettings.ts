import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";
import { useAccount } from "wagmi";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/zarpay-settings";

interface SettingsCtx {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, val: AppSettings[K]) => void;
}

const Ctx = createContext<SettingsCtx | undefined>(undefined);

export function ZarpaySettingsProvider({ children }: { children: ReactNode }) {
  const { address } = useAccount();
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // When wallet connects/changes, reload that wallet's settings
  useEffect(() => {
    setSettings(loadSettings(address));
  }, [address]);

  function updateSetting<K extends keyof AppSettings>(key: K, val: AppSettings[K]) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: val };
      saveSettings(updated, address);
      return updated;
    });
  }

  return createElement(Ctx.Provider, { value: { settings, updateSetting } }, children);
}

export function useZarpaySettings(): SettingsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useZarpaySettings must be used inside ZarpaySettingsProvider");
  return ctx;
}
