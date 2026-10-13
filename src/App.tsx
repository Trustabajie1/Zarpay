import { useState } from "react";
import { useAccount } from "wagmi";
import { ZarpaySettingsProvider } from "@/hooks/useZarpaySettings";
import { BottomNav } from "@/components/BottomNav";
import { Dashboard } from "@/screens/Dashboard";
import { WalletScreen } from "@/screens/WalletScreen";
import { ExchangeScreen } from "@/screens/ExchangeScreen";
import { ActivityScreen } from "@/screens/ActivityScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { MerchantScreen } from "@/screens/MerchantScreen";
import { MerchantPayScreen } from "@/screens/MerchantPayScreen";
import { BillsScreen } from "@/screens/BillsScreen";
import { BankTransferScreen } from "@/screens/BankTransferScreen";
import { DepositScreen } from "@/screens/DepositScreen";
import { SavingsScreen } from "@/screens/SavingsScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { BeckyScreen } from "@/screens/BeckyScreen";
import { BankAccountScreen } from "@/screens/BankAccountScreen";
import { ServicesScreen } from "@/screens/ServicesScreen";

type Screen = "dashboard" | "merchant" | "wallet" | "settings" | "activity" | "exchange" | "pay-merchant" | "bills" | "bank-transfer" | "deposit" | "savings" | "profile" | "becky" | "bank-accounts" | "services";

function AppInner() {
  const { isConnected } = useAccount();
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [payMerchantAddr, setPayMerchantAddr] = useState("");

  const showNav = isConnected && !["pay-merchant","savings","profile","bank-accounts","services"].includes(screen);

  function goPayMerchant(addr = "") {
    setPayMerchantAddr(addr);
    setScreen("pay-merchant");
  }

  function renderScreen() {
    switch (screen) {
      case "dashboard":
        return <Dashboard onNavigate={(s) => setScreen(s)} onPayMerchant={goPayMerchant} />;
      case "wallet":
        return <WalletScreen />;
      case "exchange":
        return <ExchangeScreen onNavigate={(s) => {
          if (s === "utility") setScreen("bills");
          else if (s === "withdraw") setScreen("bank-transfer");
          else if (s === "deposit") setScreen("deposit");
        }} />;
      case "activity":
        return <ActivityScreen />;
      case "settings":
        return <SettingsScreen onNavigate={(s) => setScreen(s)} />;
      case "merchant":
        return <MerchantScreen />;
      case "pay-merchant":
        return <MerchantPayScreen prefillAddress={payMerchantAddr} onBack={() => setScreen("dashboard")} />;
      case "bills":
        return <BillsScreen onBack={() => setScreen("services")} />;
      case "bank-transfer":
        return <BankTransferScreen onBack={() => setScreen("services")} />;
      case "deposit":
        return <DepositScreen onBack={() => setScreen("services")} />;
      case "savings":
        return <SavingsScreen onBack={() => setScreen("dashboard")} />;
      case "profile":
        return <ProfileScreen onBack={() => setScreen("settings")} />;
      case "becky":
        return <BeckyScreen onBack={() => setScreen("dashboard")} />;
      case "bank-accounts":
        return <BankAccountScreen onBack={() => setScreen("settings")} />;
      case "services":
        return <ServicesScreen onNavigate={(s) => setScreen(s)} onBack={() => setScreen("dashboard")} onPayMerchant={goPayMerchant} />;
      default:
        return <Dashboard onNavigate={(s) => setScreen(s)} onPayMerchant={goPayMerchant} />;
    }
  }

  return (
    <>
      {renderScreen()}
      {showNav && (
        <BottomNav
          active={(["activity","exchange","pay-merchant","bills","bank-transfer","deposit","savings","profile","bank-accounts"].includes(screen) ? "dashboard" : screen) as "dashboard" | "merchant" | "wallet" | "settings" | "becky"}
          onNavigate={(s) => setScreen(s)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ZarpaySettingsProvider>
      <AppInner />
    </ZarpaySettingsProvider>
  );
}
