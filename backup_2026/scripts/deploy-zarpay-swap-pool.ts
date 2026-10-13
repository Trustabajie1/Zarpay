import hardhat from "hardhat";
const { ethers } = hardhat;

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const INITIAL_RATE = 920_000;
const MAX_SWAP_AMOUNT = 1_000_000_000;
const INITIAL_FEE_BPS = 50;
const FEE_RECIPIENT = "0x7ca2839c9075e25f3c6cb3b9e276a0796d5a40b5";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const ZarPaySwapPool = await ethers.getContractFactory("ZarPaySwapPool");
  const pool = await ZarPaySwapPool.deploy(
    USDC_ADDRESS,
    EURC_ADDRESS,
    INITIAL_RATE,
    MAX_SWAP_AMOUNT,
    INITIAL_FEE_BPS,
    FEE_RECIPIENT
  );

  await pool.waitForDeployment();
  const poolAddress = await pool.getAddress();

  console.log("\nZarPaySwapPool deployed!");
  console.log("NEW CONTRACT ADDRESS:", poolAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
