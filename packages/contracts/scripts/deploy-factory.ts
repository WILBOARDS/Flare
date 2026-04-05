import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CreatorTokenFactory with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH/MATIC");

  const CreatorTokenFactory = await ethers.getContractFactory("CreatorTokenFactory");
  const factory = await CreatorTokenFactory.deploy();
  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("CreatorTokenFactory deployed to:", address);
  console.log("Owner (admin):", await factory.owner());

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

  deployments["CreatorTokenFactory"] = address;
  deployments["deployer"] = deployer.address;
  deployments["deployedAt"] = new Date().toISOString();

  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  console.log(`Deployment saved to deployments/${networkName}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
