import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, RotateCcw } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "becky";
  text: string;
  ts: number;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "I'm Becky, your ZarPay AI assistant! I can help with anything — finance, crypto, general questions, or just a chat. What's on your mind?",
  hello: "Hey! 👋 I'm Becky. Great to meet you! How can I help you today?",
  hi: "Hi there! 😊 I'm Becky, your AI assistant inside ZarPay. Ask me anything!",
  swap: "To swap on ZarPay, go to the Wallet tab and tap the Swap tab. You can swap USDC to EURC or EURC to USDC instantly using the ZarPay pool on Arc Testnet. The current rate is about 0.92 EURC per USDC.",
  send: "To send money, tap the Send button on your Dashboard. You can send USDC or EURC to any wallet address. You can also scan a QR code using the scan icon next to the address field.",
  usdc: "USDC is a stablecoin pegged to the US Dollar — 1 USDC always equals $1. On Arc, USDC is the native gas token, which means you use it for both payments AND transaction fees. No need for a separate coin!",
  eurc: "EURC is a stablecoin pegged to the Euro — 1 EURC ≈ 1 EUR. ZarPay supports EURC alongside USDC, so you can hold savings in euros if that's useful for you.",
  arc: "Arc is a blockchain where USDC is the native gas token. That means every transaction fee is paid in USDC — no ETH or other coins needed. It's fast (sub-second finality) and cheap, which makes it perfect for everyday payments.",
  savings: "ZarPay Savings lets you earn yield on your USDC. You can choose between Flexible (4.2% APY) or lock your funds for 30, 90, or 180 days for higher rates up to 15.5% APY. Go to Dashboard → Save to get started.",
  bills: "You can pay Nigerian utility bills right inside ZarPay! Go to Exchange → Utility Bills. We support airtime, data, electricity (EKEDC, IKEDC, AEDC and more), and cable TV (DSTV, GOtv, Startimes). Real integration with Flutterwave coming soon.",
  merchant: "ZarPay has a Merchant Hub where you can register your business, display a QR code for customers, and accept USDC payments. Customers pay in USDC and you receive EURC automatically via the swap pool.",
  deposit: "To deposit NGN into your ZarPay wallet, go to Exchange → Deposit. You can pay via bank transfer, debit card, or USSD. Your NGN gets converted to USDC at the live rate. Real Flutterwave integration coming soon.",
  withdraw: "To withdraw to your bank account, go to Exchange → Withdraw → Bank Transfer. Enter your account number and bank, and your USDC gets converted to NGN and sent to your account. Real integration coming soon.",
  crypto: "Crypto (short for cryptocurrency) is digital money that lives on a blockchain — a secure, decentralized ledger that no single person or company controls. Bitcoin was the first, but there are thousands now. Stablecoins like USDC are crypto that don't fluctuate in price.",
  blockchain: "A blockchain is like a public spreadsheet that thousands of computers all agree on simultaneously. Once something is written on it, it can't be changed. This makes it perfect for financial transactions — no bank needed to verify your payment.",
  wallet: "A crypto wallet is like your bank account but you fully control it. No one can freeze it or ask for ID. Your wallet address is like your account number — it's public. Your private key (stored in MetaMask) is like your PIN — keep it secret!",
  nigeria: "Nigeria has one of the most active crypto communities in the world! High inflation and limited access to USD have made stablecoins like USDC very popular. ZarPay is built specifically for Nigerians who want to send, save, and spend in stable currencies.",
  metamask: "MetaMask is a browser wallet that lets you interact with blockchains. It stores your private keys securely and signs transactions. To use ZarPay, you need MetaMask installed and connected to Arc Testnet (Chain ID: 5042002).",
};

function getBeckyReply(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, val] of Object.entries(DEMO_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return val;
  }
  // Contextual fallbacks
  if (lower.includes("how") && lower.includes("work")) {
    return "Great question! ZarPay works by connecting your MetaMask wallet to the Arc blockchain. When you send or swap, the transaction goes directly on-chain — no middleman holds your funds. Everything is self-custodial, meaning you're always in full control.";
  }
  if (lower.includes("fee") || lower.includes("cost") || lower.includes("charge")) {
    return "ZarPay charges a 0.5% fee on swaps (USDC ↔ EURC). Sending USDC or EURC to another address costs only the network gas fee, which on Arc is a tiny fraction of a USDC — usually less than $0.01.";
  }
  if (lower.includes("safe") || lower.includes("secure") || lower.includes("trust")) {
    return "ZarPay is self-custodial — your funds stay in YOUR wallet at all times. The app never holds your money. The swap contract has been deployed on Arc Testnet and includes reentrancy protection and slippage guards. For mainnet, a full security audit is planned.";
  }
  if (lower.includes("help")) {
    return "Of course! I can help you with:\n• How to send, receive, or swap\n• Understanding USDC, EURC, or crypto\n• ZarPay features like Savings, Bills, Merchant Hub\n• General finance or crypto questions\n\nJust ask me anything! 😊";
  }
  if (lower.includes("thank")) {
    return "You're very welcome! 😊 I'm always here if you have more questions.";
  }
  if (lower.includes("who are you") || lower.includes("what are you")) {
    return "I'm Becky — your AI assistant built into ZarPay! Right now I'm running in demo mode with pre-set answers. Once an AI key is connected, I'll be able to answer absolutely anything, just like ChatGPT. 🤖";
  }
  return "That's a great question! I'm currently in demo mode so my answers are limited. Once I'm connected to a live AI service, I'll be able to answer absolutely anything you ask. For now, try asking me about ZarPay features, USDC, crypto basics, or Nigerian finance!";
}

const SUGGESTIONS = [
  "How do I swap USDC?",
  "What is USDC?",
  "How do I pay bills?",
  "Is ZarPay safe?",
  "What is Arc blockchain?",
  "How do I earn on savings?",
];

const INTRO_MESSAGE: Message = {
  id: "intro",
  role: "becky",
  text: "Hi! I'm Becky, your ZarPay AI assistant 👋\n\nI can help with ZarPay features, crypto questions, Nigerian finance, or just about anything. What would you like to know?",
  ts: 0,
};

let msgCounter = 1;
function nextId() { return String(++msgCounter); }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BeckyScreen(_props?: { onBack?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  function sendMessage(text: string) {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { id: nextId(), role: "user", text: text.trim(), ts: 0 };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      const reply = getBeckyReply(text);
      setMessages((prev) => [...prev, { id: nextId(), role: "becky", text: reply, ts: 0 }]);
      setThinking(false);
    }, 900);
  }

  function clearChat() {
    setMessages([{ id: "intro", role: "becky", text: "Chat cleared! I'm Becky 👋 What would you like to know?", ts: 0 }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "var(--zp-bg)", overflow: "hidden" }}>

      {/* Header */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--zp-border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, background: "var(--zp-surface)" }}>
        <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, #7C3AED, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--zp-text)", margin: 0 }}>Becky</p>
          <p style={{ fontSize: 11, color: "#A855F7", margin: 0 }}>AI Assistant · Demo mode</p>
        </div>
        <button onClick={clearChat} title="Clear chat" style={{ background: "none", border: "none", color: "var(--zp-text-2)", cursor: "pointer", padding: 4 }}>
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            {msg.role === "becky" && (
              <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 8, alignSelf: "flex-end" }}>
                <Sparkles size={13} color="#fff" />
              </div>
            )}
            <div style={{
              maxWidth: "78%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? "var(--zp-green)" : "var(--zp-surface-2)",
              color: msg.role === "user" ? "#080C12" : "var(--zp-text)",
              fontSize: 14,
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: "linear-gradient(135deg, #7C3AED, #A855F7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={13} color="#fff" />
            </div>
            <div style={{ background: "var(--zp-surface-2)", borderRadius: "16px 16px 16px 4px", padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#A855F7", display: "inline-block", animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (only show at start) */}
      {messages.length <= 1 && (
        <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => sendMessage(s)}
              style={{ padding: "6px 12px", borderRadius: 20, border: "1px solid rgba(168,85,247,0.3)", background: "rgba(168,85,247,0.08)", color: "#A855F7", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding: "12px 16px 24px", borderTop: "1px solid var(--zp-border)", display: "flex", gap: 10, flexShrink: 0, background: "var(--zp-surface)" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask Becky anything..."
          className="zp-input"
          style={{ flex: 1, marginBottom: 0 }}
          disabled={thinking}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || thinking}
          style={{ width: 44, height: 44, borderRadius: 12, border: "none", background: input.trim() ? "linear-gradient(135deg, #7C3AED, #A855F7)" : "var(--zp-surface-2)", color: input.trim() ? "#fff" : "var(--zp-text-2)", cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
        >
          <Send size={16} />
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
