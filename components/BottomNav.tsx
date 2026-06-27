"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAppSettings } from "@/components/SettingsContext";
import { t } from "@/lib/translations";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const { settings } = useAppSettings();

  const tr = t(settings.language ?? "English");

 const tabs = [
  {
    label: tr.home || "Home",
    icon: "⌂",
    path: "/dashboard",
  },
  {
    label: "Swap",
    icon: "⇄",
    path: "/swap",
  },
  {
    label: tr.wallet || "Wallet",
    icon: "◎",
    path: "/wallet",
  },
  {
    label: tr.settings || "Settings",
    icon: "⚙",
    path: "/settings",
  },
];

  const isDark = settings.theme === "dark";

  const navBg = isDark ? "#0e1318" : "#ffffff";
  const border = isDark ? "#1f2937" : "#d1d5db";
  const inactive = isDark ? "#4b5563" : "#6b7280";

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: navBg,
        borderTop: `1px solid ${border}`,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        padding: "10px 0 20px",
        zIndex: 100,
        transition: "all 0.3s ease",
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 20px",
              position: "relative",
            }}
          >
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  top: "-10px",
                  width: "20px",
                  height: "3px",
                  background: "#4ade80",
                  borderRadius: "2px",
                }}
              />
            )}

            <span
              style={{
                fontSize: "20px",
                color: isActive ? "#4ade80" : inactive,
              }}
            >
              {tab.icon}
            </span>

            <span
              style={{
                fontSize: "10px",
                fontWeight: "600",
                color: isActive ? "#4ade80" : inactive,
                fontFamily: "monospace",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}