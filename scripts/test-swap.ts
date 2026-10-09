import hardhat from "hardhat";
const { ethers } = hardhat;

const POOL = "0x7b3b331260d8147436E76aE035850345ee3F6123";
const USDC = "0x3600000000000000000000000000000000000000";

const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const POOL_ABI = [
  "function swapUSDCtoEURC(uint256,uint256) returns (uint256)",
  "function previewSwapAfterFee(uint256,bool) view returns (uint256,uint256)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Swapping from:", deployer.address);

  const usdc = new ethers.Contract(USDC, ERC20_ABI, deployer);
  const pool = new ethers.Contract(POOL, POOL_ABI, deployer);

  const amountIn = ethers.parseUnits("1", 6); // 1 USDC

  // Check allowance
  const allowance = await usdc.allowance(deployer.address, POOL);
  console.log("Current allowance:", ethers.formatUnits(allowance, 6), "USDC");

  // Approve if needed
  if (allowance < amountIn) {
    console.log("Approving...");
    const approveTx = await usdc.approve(POOL, ethers.MaxUint256);
    await approveTx.wait();
    console.log("Approved.");
  }

  // Get quote
  const [netOut] = await pool.previewSwapAfterFee(amountIn, true);
  const minOut = netOut - (netOut * 50n) / 10000n;
  console.log("Expected out:", ethers.formatUnits(netOut, 6), "EURC");
  console.log("Min out (0.5% slippage):", ethers.formatUnits(minOut, 6), "EURC");

  // Execute swap
  console.log("Sending swap...");
  try {
    const tx = await pool.swapUSDCtoEURC(amountIn, minOut);
    const receipt = await tx.wait();
    console.log("SUCCESS! Tx hash:", receipt.hash);
    console.log("Gas used:", receipt.gasUsed.toString());
  } catch (err: unknown) {
    const error = err as { message?: string; reason?: string; data?: string };
    console.error("FAILED:", error.message);
    console.error("Reason:", error.reason);
    console.error("Data:", error.data);
  }
}

main().catch(console.error);
