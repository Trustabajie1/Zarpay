import hardhat from "hardhat";
const { ethers } = hardhat;

const POOL = "0x7b3b331260d8147436E76aE035850345ee3F6123";
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function transfer(address,uint256) returns (bool)",
];

const POOL_ABI = [
  "function getReserves() view returns (uint256,uint256)",
  "function usdcToEurcRate() view returns (uint256)",
  "function feeBps() view returns (uint256)",
  "function feeRecipient() view returns (address)",
  "function maxSwapAmount() view returns (uint256)",
  "function paused() view returns (bool)",
  "function addLiquidity(address,uint256)",
  "function previewSwapAfterFee(uint256,bool) view returns (uint256,uint256)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const pool = new ethers.Contract(POOL, POOL_ABI, deployer);
  const usdc = new ethers.Contract(USDC, ERC20_ABI, deployer);
  const eurc = new ethers.Contract(EURC, ERC20_ABI, deployer);

  // 1. Read pool state
  const [usdcRes, eurcRes] = await pool.getReserves();
  const rate = await pool.usdcToEurcRate();
  const fee = await pool.feeBps();
  const feeRec = await pool.feeRecipient();
  const maxSwap = await pool.maxSwapAmount();
  const paused = await pool.paused();

  console.log("\n=== POOL STATE ===");
  console.log("USDC reserve:", ethers.formatUnits(usdcRes, 6), "USDC");
  console.log("EURC reserve:", ethers.formatUnits(eurcRes, 6), "EURC");
  console.log("Rate:", rate.toString(), "(divide by 1,000,000 =", Number(rate) / 1_000_000, ")");
  console.log("Fee:", fee.toString(), "bps =", Number(fee) / 100, "%");
  console.log("Fee recipient:", feeRec);
  console.log("Max swap:", maxSwap.toString() === "0" ? "unlimited" : ethers.formatUnits(maxSwap, 6));
  console.log("Paused:", paused);

  // 2. Check deployer balances
  const myUsdc = await usdc.balanceOf(deployer.address);
  const myEurc = await eurc.balanceOf(deployer.address);
  console.log("\n=== DEPLOYER BALANCES ===");
  console.log("USDC:", ethers.formatUnits(myUsdc, 6));
  console.log("EURC:", ethers.formatUnits(myEurc, 6));

  // 3. Try preview swap for 2 USDC
  const [netOut, feeAmt] = await pool.previewSwapAfterFee(2_000_000n, true);
  console.log("\n=== PREVIEW: 2 USDC -> EURC ===");
  console.log("Net out:", ethers.formatUnits(netOut, 6), "EURC");
  console.log("Fee:", ethers.formatUnits(feeAmt, 6), "EURC");
  console.log("Fee recipient gets:", feeRec);

  // 4. Check if feeRecipient can receive EURC
  const feeRecEurcBal = await eurc.balanceOf(feeRec);
  console.log("Fee recipient EURC balance:", ethers.formatUnits(feeRecEurcBal, 6));

  console.log("\nDone. Share this output so we can diagnose the revert.");
}

main().catch(console.error);
