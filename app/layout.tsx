import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { SettingsProvider } from "@/components/SettingsContext";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZarPay — Send & Receive Money Instantly",
  description: "P2P crypto payments powered by stablecoins on Arc Network",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  );
}