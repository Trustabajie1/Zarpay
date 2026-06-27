import { ethers } from "hardhat";
import * as dotenv from "dotenv";
dotenv.config();

const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";
const EURC_ADDRESS = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const INITIAL_RATE = 920_000;
const MAX_SWAP_AMOUNT = 1_000_000_000;
const INITIAL_FEE_BPS = 50;
const FEE_RECIPIENT = "0x7ca2839c9075e25f3c6cb3b9e276a0796d5a40b5"; // keep your existing address here

async function main() {
  const signers = await ethers.getSigners();

  if (!signers || signers.length === 0) {
    throw new Error(
      "No signers found. Check that DEPLOYER_PRIVATE_KEY is set correctly in your .env file and starts with 0x."
    );
  }

  const deployer = signers[0];
  console.log("Deploying ZarPaySwapPool with account:", deployer.address);

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

  console.log("\n✅ ZarPaySwapPool deployed!");
  console.log("Contract address:", poolAddress);
  console.log('\nPaste into lib/contracts.ts:');
  console.log('  export const ZARPAY_SWAP_POOL_ADDRESS = "' + poolAddress + '" as const;');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});