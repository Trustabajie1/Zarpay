import hardhat from "hardhat";
const { ethers } = hardhat;

const POOL = "0xa9E945043a7a844448c6717CC7E546c827b455b1";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];
const POOL_ABI = [
  "function addLiquidity(address token, uint256 amount)",
  "function getReserves() view returns (uint256,uint256)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  const eurc = await ethers.getContractAt(ERC20_ABI, EURC, deployer);
  const pool = await ethers.getContractAt(POOL_ABI, POOL, deployer);

  const bal = await eurc.balanceOf(deployer.address);
  console.log("Your EURC balance:", ethers.formatUnits(bal, 6));

  const [usdcRes, eurcRes] = await pool.getReserves();
  console.log("Pool before — USDC:", ethers.formatUnits(usdcRes, 6), "EURC:", ethers.formatUnits(eurcRes, 6));

  console.log("\nApproving EURC...");
  await (await eurc.approve(POOL, ethers.MaxUint256)).wait();

  console.log("Adding 5 EURC to pool...");
  await (await pool.addLiquidity(EURC, ethers.parseUnits("4", 6))).wait();

  const [usdcAfter, eurcAfter] = await pool.getReserves();
  console.log("\nPool after — USDC:", ethers.formatUnits(usdcAfter, 6), "EURC:", ethers.formatUnits(eurcAfter, 6));
  console.log("Done!");
}

main().catch(console.error);
