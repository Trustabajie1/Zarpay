const hardhat = require("hardhat");
const { ethers } = hardhat;

const ZARPAY_SWAP_POOL_ADDRESS = "0x7b3b331260d8147436E76aE035850345ee3F6123";
const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

async function main() {
  const pool = await ethers.getContractAt("ZarPaySwapPool", ZARPAY_SWAP_POOL_ADDRESS);

  console.log("Checking ZarPaySwapPool at:", ZARPAY_SWAP_POOL_ADDRESS);

  // Confirm the deployed contract actually has the new function signature
  try {
    const fragment = pool.interface.getFunction("swapUSDCtoEURC");
    console.log("swapUSDCtoEURC inputs:", fragment.inputs.map(i => i.name + ":" + i.type).join(", "));
  } catch (e) {
    console.log("Could not read swapUSDCtoEURC signature:", e.message);
  }

  const [usdcReserve, eurcReserve] = await pool.getReserves();
  console.log("USDC reserves (raw):", usdcReserve.toString());
  console.log("EURC reserves (raw):", eurcReserve.toString());
  console.log("USDC reserves (formatted):", ethers.formatUnits(usdcReserve, 6));
  console.log("EURC reserves (formatted):", ethers.formatUnits(eurcReserve, 6));

  const rate = await pool.usdcToEurcRate();
  const feeBps = await pool.feeBps();
  console.log("Current rate (usdcToEurcRate):", rate.toString());
  console.log("Fee (bps):", feeBps.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});