import hardhat from "hardhat";
const { ethers } = hardhat;

// Hardcoded new pool address
const POOL = "0xa9E945043a7a844448c6717CC7E546c827b455b1";
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];
const POOL_ABI = [
  "function addLiquidity(address token, uint256 amount)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Seeding from:", deployer.address);

  const usdc = await ethers.getContractAt(ERC20_ABI, USDC, deployer);
  const eurc = await ethers.getContractAt(ERC20_ABI, EURC, deployer);
  const pool = await ethers.getContractAt(POOL_ABI, POOL, deployer);

  const usdcBal = await usdc.balanceOf(deployer.address);
  const eurcBal = await eurc.balanceOf(deployer.address);
  console.log("USDC balance:", ethers.formatUnits(usdcBal, 6));
  console.log("EURC balance:", ethers.formatUnits(eurcBal, 6));

  // Approve both tokens
  console.log("\nApproving USDC...");
  await (await usdc.approve(POOL, ethers.MaxUint256)).wait();
  console.log("Approving EURC...");
  await (await eurc.approve(POOL, ethers.MaxUint256)).wait();

  // Seed 20 USDC + 4 EURC (well within your balance)
  console.log("Adding 20 USDC...");
  await (await pool.addLiquidity(USDC, ethers.parseUnits("20", 6))).wait();
  console.log("Adding 4 EURC...");
  await (await pool.addLiquidity(EURC, ethers.parseUnits("4", 6))).wait();

  console.log("\nDone! Pool seeded: 20 USDC + 4 EURC");
  console.log("Max USDC->EURC swap at rate 0.92: ~4 USDC at a time");
}

main().catch(console.error);
