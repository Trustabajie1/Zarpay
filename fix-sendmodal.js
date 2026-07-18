const fs = require('fs');

const content = '"use client";\n' +
'import { useWriteContract } from "wagmi";\n' +
'import { parseUnits, isAddress } from "viem";\n' +
'import { ARC_USDC, ARC_EURC, USDC_DECIMALS } from "@/lib/tokens";\n' +
'import { usdcAbi } from "@/lib/usdcAbi";\n' +
'import { useState } from "react";\n' +
'\n' +
'type Props = { onClose: () => void };\n' +
'\n' +
'export function SendModal({ onClose }: Props) {\n' +
'  const [toAddress, setToAddress] = useState("");\n' +
'  const [amount, setAmount] = useState("");\n' +
'  const [selectedToken, setSelectedToken] = useState<"USDC" | "EURC">("USDC");\n' +
'  const [status, setStatus] = useState<"idle"|"pending"|"success"|"error">("idle");\n' +
'  const [errorMessage, setErrorMessage] = useState("");\n' +
'  const [txHash, setTxHash] = useState("");\n' +
'\n' +
'  const { writeContractAsync } = useWriteContract();\n' +
'\n' +
'  async function handleSend() {\n' +
'    if (!toAddress) { setErrorMessage("Enter a recipient address."); setStatus("error"); return; }\n' +
'    if (!isAddress(toAddress)) { setErrorMessage("Invalid wallet address."); setStatus("error"); return; }\n' +
'    if (!amount || Number(amount) <= 0) { setErrorMessage("Enter a valid amount."); setStatus("error"); return; }\n' +
'    try {\n' +
'      setStatus("pending");\n' +
'      const tokenAddress = selectedToken === "USDC" ? ARC_USDC : ARC_EURC;\n' +
'      const hash = await writeContractAsync({\n' +
'        address: tokenAddress as `0x${string}`,\n' +
'        abi: usdcAbi,\n' +
'        functionName: "transfer",\n' +
'        args: [toAddress as `0x${string}`, parseUnits(amount, USDC_DECIMALS)],\n' +
'      });\n' +
'      setTxHash(hash);\n' +
'      setStatus("success");\n' +
'    } catch (err: any) {\n' +
'      const msg = err?.message || "";\n' +
'      if (msg.includes("rejected") || msg.includes("cancelled")) {\n' +
'        setErrorMessage("You cancelled the transaction.");\n' +
'      } else if (msg.includes("insufficient")) {\n' +
'        setErrorMessage("Insufficient balance.");\n' +
'      } else {\n' +
'        setErrorMessage("Transaction failed. Try again.");\n' +
'      }\n' +
'      setStatus("error");\n' +
'    }\n' +
'  }\n' +
'\n' +
'  function handleReset() {\n' +
'    setToAddress(""); setAmount(""); setStatus("idle"); setErrorMessage(""); setTxHash("");\n' +
'  }\n' +
'\n' +
'  return (\n' +
'    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }} onClick={onClose}>\n' +
'      <div style={{ width: "100%", maxWidth: "440px", background: "#0e1318", border: "1px solid #1f2937", borderRadius: "20px", padding: "24px", position: "relative", zIndex: 101 }} onClick={e => e.stopPropagation()}>\n' +
'\n' +
'        {status === "idle" && (\n' +
'          <>\n' +
'            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>\n' +
'              <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", margin: 0 }}>Send</h2>\n' +
'              <button onClick={onClose} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "20px", cursor: "pointer" }}>\u2715</button>\n' +
'            </div>\n' +
'            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>\n' +
'              {(["USDC", "EURC"] as const).map(token => (\n' +
'                <button key={token} onClick={() => setSelectedToken(token)}\n' +
'                  style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid " + (selectedToken === token ? "rgba(74,222,128,0.4)" : "#1f2937"), background: selectedToken === token ? "rgba(74,222,128,0.08)" : "#111827", color: selectedToken === token ? "#4ade80" : "#9ca3af", fontWeight: "600", cursor: "pointer" }}>\n' +
'                  {token}\n' +
'                </button>\n' +
'              ))}\n' +
'            </div>\n' +
'            <input type="text" placeholder="Recipient address (0x...)" value={toAddress} onChange={e => setToAddress(e.target.value)}\n' +
'              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #1f2937", background: "#111827", color: "#fff", marginBottom: "12px", boxSizing: "border-box" }} />\n' +
'            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)}\n' +
'              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid #1f2937", background: "#111827", color: "#fff", marginBottom: "16px", boxSizing: "border-box" }} />\n' +
'            <button onClick={handleSend}\n' +
'              style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "15px", cursor: "pointer" }}>\n' +
'              Send {selectedToken}\n' +
'            </button>\n' +
'          </>\n' +
'        )}\n' +
'\n' +
'        {status === "pending" && (\n' +
'          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "20px 0" }}>\n' +
'            <div style={{ width: "48px", height: "48px", borderRadius: "50%", border: "4px solid #1f2937", borderTop: "4px solid #4ade80", animation: "spin 1s linear infinite" }} />\n' +
'            <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>\n' +
'            <p style={{ color: "#fff", fontWeight: "700" }}>Sending...</p>\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'        {status === "success" && (\n' +
'          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>\n' +
'            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>\u2713</div>\n' +
'            <p style={{ color: "#fff", fontWeight: "700", fontSize: "18px" }}>Sent!</p>\n' +
'            {txHash && <a href={"https://testnet.arcscan.app/tx/" + txHash} target="_blank" rel="noopener noreferrer" style={{ color: "#4ade80", fontSize: "12px", fontFamily: "monospace", textDecoration: "underline" }}>View on ArcScan \u2197</a>}\n' +
'            <button onClick={handleReset} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Send Again</button>\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'        {status === "error" && (\n' +
'          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px 0" }}>\n' +
'            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>\u2715</div>\n' +
'            <p style={{ color: "#fff", fontWeight: "700", fontSize: "18px" }}>Failed</p>\n' +
'            <p style={{ color: "#f87171", fontSize: "13px", textAlign: "center" }}>{errorMessage}</p>\n' +
'            <button onClick={handleReset} style={{ background: "#4ade80", color: "#111", fontWeight: "700", fontSize: "14px", borderRadius: "12px", padding: "12px 24px", border: "none", cursor: "pointer", marginTop: "8px" }}>Try Again</button>\n' +
'          </div>\n' +
'        )}\n' +
'\n' +
'      </div>\n' +
'    </div>\n' +
'  );\n' +
'}\n';

fs.writeFileSync('components/SendModal.tsx', content);
console.log('Done! SendModal fully restored.');