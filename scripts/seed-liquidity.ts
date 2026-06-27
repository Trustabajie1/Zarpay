import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";
const ZARPAY_SWAP_POOL_ADDRESS = "0x7b3b331260d8147436E76aE035850345ee3F6123";

// 15 USDC and 15 EURC — both use 6 decimals on Arc
const USDC_AMOUNT = ethers.parseUnits("15", 6);
const EURC_AMOUNT = ethers.parseUnits("15", 6);

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

const POOL_ABI = [
  "function addLiquidity(address token, uint256 amount)",
];

async function main() {
  const signers = await ethers.getSigners();
  if (!signers || signers.length === 0) {
    throw new Error("No signers found. Check your .env file.");
  }

  const deployer = signers[0];
  console.log("Seeding pool with account:", deployer.address);

  const usdc = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, deployer);
  const eurc = new ethers.Contract(EURC_ADDRESS, ERC20_ABI, deployer);
  const pool = new ethers.Contract(ZARPAY_SWAP_POOL_ADDRESS, POOL_ABI, deployer);

  // Check balances first
  const usdcBalance = await usdc.balanceOf(deployer.address);
  const eurcBalance = await eurc.balanceOf(deployer.address);
  console.log("USDC balance:", ethers.formatUnits(usdcBalance, 6));
  console.log("EURC balance:", ethers.formatUnits(eurcBalance, 6));

  if (usdcBalance < USDC_AMOUNT) {
    throw new Error("Not enough USDC in wallet.");
  }
  if (eurcBalance < EURC_AMOUNT) {
    throw new Error("Not enough EURC in wallet.");
  }

  // Approve pool to pull USDC
  console.log("\nApproving pool to pull USDC...");
  const approveTx1 = await usdc.approve(ZARPAY_SWAP_POOL_ADDRESS, USDC_AMOUNT);
  await approveTx1.wait();
  console.log("USDC approved ✅");

  // Seed USDC into pool
  console.log("Adding USDC liquidity...");
  const addTx1 = await pool.addLiquidity(USDC_ADDRESS, USDC_AMOUNT);
  await addTx1.wait();
  console.log("USDC liquidity added ✅");

  // Approve pool to pull EURC
  console.log("\nApproving pool to pull EURC...");
  const approveTx2 = await eurc.approve(ZARPAY_SWAP_POOL_ADDRESS, EURC_AMOUNT);
  await approveTx2.wait();
  console.log("EURC approved ✅");

  // Seed EURC into pool
  console.log("Adding EURC liquidity...");
  const addTx2 = await pool.addLiquidity(EURC_ADDRESS, EURC_AMOUNT);
  await addTx2.wait();
  console.log("EURC liquidity added ✅");

  console.log("\n🎉 Pool seeded successfully!");
  console.log("Pool now holds 15 USDC and 15 EURC — ready for swaps.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});