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
    { label: "Home", icon: "⌂", path: "/dashboard" },
    { label: "Merchant", icon: "◈", path: "/merchant" },
    { label: "Wallet", icon: "◎", path: "/wallet" },
    { label: "Settings", icon: "⚙", path: "/settings" },
  ];
  return (
    <nav className="zp-nav">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path || pathname.startsWith(tab.path + "/");
        return (
          <button key={tab.path} onClick={() => router.push(tab.path)} className={"zp-nav-tab" + (isActive ? " active" : "")}>
            {isActive && <span className="zp-nav-dot" />}
            <span className="zp-nav-icon">{tab.icon}</span>
            <span className="zp-nav-label">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
