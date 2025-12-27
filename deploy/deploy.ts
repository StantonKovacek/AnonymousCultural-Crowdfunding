import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy AnonymousCulturalCrowdfunding Contract
 *
 * This script deploys the main AnonymousCulturalCrowdfunding smart contract
 * to the configured network.
 *
 * Usage:
 *   npx hardhat deploy --network localhost
 *   npx hardhat deploy --network sepolia
 */
const deploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy: deployContract } = hre.deployments;

  console.log("Deploying AnonymousCulturalCrowdfunding contract...");

  const deployment = await deployContract("AnonymousCulturalCrowdfunding", {
    from: deployer,
    log: true,
    autoMine: true, // can be disabled if used on local-optimism
  });

  console.log(
    "AnonymousCulturalCrowdfunding deployed to:",
    deployment.address,
  );

  // Verify contract on Etherscan for public networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations before verification...");
    await deployment.waitConfirmations?.(6);

    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: deployment.address,
        constructorArguments: [],
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (
        !errorMessage.includes(
          "Already Verified",
        )
      ) {
        console.error("Verification failed:", error);
      }
    }
  }

  return true;
};

deploy.tags = ["AnonymousCulturalCrowdfunding"];

export default deploy;
