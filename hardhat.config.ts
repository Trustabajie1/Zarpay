import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as fs from "fs";
import * as path from "path";

// Read .env file manually — bypasses dotenvx interference
const envPath = path.resolve(__dirname, ".env");
let DEPLOYER_PRIVATE_KEY = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/DEPLOYER_PRIVATE_KEY=(.+)/);
  if (match) {
    DEPLOYER_PRIVATE_KEY = match[1].trim();
  }
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    arcTestnet: {
      url: "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};

export default config;