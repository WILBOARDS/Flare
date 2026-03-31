import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FLCToken with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH/MATIC");

  const FLCToken = await ethers.getContractFactory("FLCToken");
  const flc = await FLCToken.deploy(deployer.address);
  await flc.waitForDeployment();

  const address = await flc.getAddress();
  console.log("FLCToken deployed to:", address);
  console.log("Owner (treasury):", await flc.owner());
  console.log("Initial supply:", ethers.formatEther(await flc.totalSupply()), "FLC");
  console.log("Max supply:", ethers.formatEther(await flc.MAX_SUPPLY()), "FLC");

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const networkName = network.name;
  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);

  let deployments: Record<string, string> = {};
  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }

  deployments["FLCToken"] = address;
  deployments["deployer"] = deployer.address;
  deployments["deployedAt"] = new Date().toISOString();

  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  console.log(`Deployment saved to deployments/${networkName}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
