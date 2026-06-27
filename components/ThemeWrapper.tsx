"use client";
import { useAppSettings } from "@/components/SettingsContext";
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useAppSettings();
  const isDark = settings.theme === "dark";
  return (
    <div style={{ minHeight: "100vh", background: isDark ? "#0a0f14" : "#f0f4f8", color: isDark ? "#f0f4f8" : "#0a0f14", transition: "background 0.3s, color 0.3s" }}>
      {children}
    </div>
  );
}