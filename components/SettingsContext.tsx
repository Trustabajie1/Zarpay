"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  AppSettings,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
} from "@/lib/useSettings";

type SettingsContextType = {
  settings: AppSettings;

  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => void;
};

const SettingsContext = createContext<
  SettingsContextType | undefined
>(undefined);

export function SettingsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, setSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = loadSettings();

    setSettings(stored);

    document.documentElement.setAttribute(
      "data-theme",
      stored.theme || "dark"
    );
  }, []);

  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    setSettings((prev) => {
      const updated = {
        ...prev,
        [key]: value,
      };

      saveSettings(updated);

      if (key === "theme") {
        document.documentElement.setAttribute(
          "data-theme",
          value as string
        );
      }

      return updated;
    });
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error(
      "useAppSettings must be used inside SettingsProvider"
    );
  }

  return context;
}