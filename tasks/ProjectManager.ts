import { task, types } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Project Manager Task
 *
 * Provides utility commands for managing cultural projects
 *
 * Usage:
 *   npx hardhat project:stats --network localhost
 *   npx hardhat project:info --id 1 --network localhost
 *   npx hardhat project:create --title "My Project" --target 5 --network localhost
 */

task(
  "project:stats",
  "Display platform statistics",
)
  .setAction(async (_taskArgs: TaskArguments, hre) => {
    const deployments = await hre.deployments.all();
    const contractAddress = deployments.AnonymousCulturalCrowdfunding?.address;

    if (!contractAddress) {
      console.error("AnonymousCulturalCrowdfunding contract not found");
      return;
    }

    const contract = await hre.ethers.getContractAt(
      "AnonymousCulturalCrowdfunding",
      contractAddress,
    );

    const stats = await contract.getPlatformStats();

    console.log("=== Platform Statistics ===");
    console.log(`Total Projects: ${stats.totalProjects}`);
    console.log(`Active Projects: ${stats.activeProjects}`);
    console.log(`Successful Projects: ${stats.successfulProjects}`);
    console.log(`Failed Projects: ${stats.failedProjects}`);
  });

task("project:info", "Get information about a specific project")
  .addParam(
    "id",
    "Project ID",
    undefined,
    types.int,
  )
  .setAction(async (taskArgs: TaskArguments, hre) => {
    const deployments = await hre.deployments.all();
    const contractAddress = deployments.AnonymousCulturalCrowdfunding?.address;

    if (!contractAddress) {
      console.error("AnonymousCulturalCrowdfunding contract not found");
      return;
    }

    const contract = await hre.ethers.getContractAt(
      "AnonymousCulturalCrowdfunding",
      contractAddress,
    );

    const project = await contract.getProject(taskArgs.id);

    console.log(`=== Project #${taskArgs.id} ===`);
    console.log(`Title: ${project.title}`);
    console.log(`Description: ${project.description}`);
    console.log(`Category: ${project.category}`);
    console.log(`Creator: ${project.creator}`);
    console.log(`Status: ${project.status}`);
    console.log(`Created: ${new Date(Number(project.createdAt) * 1000).toISOString()}`);
    console.log(`Deadline: ${new Date(Number(project.deadline) * 1000).toISOString()}`);
    console.log(`Backer Count: ${project.backerCount}`);
    console.log(`Metadata Hash: ${project.metadataHash}`);
  });

task("project:list", "List all projects")
  .setAction(async (_taskArgs: TaskArguments, hre) => {
    const deployments = await hre.deployments.all();
    const contractAddress = deployments.AnonymousCulturalCrowdfunding?.address;

    if (!contractAddress) {
      console.error("AnonymousCulturalCrowdfunding contract not found");
      return;
    }

    const contract = await hre.ethers.getContractAt(
      "AnonymousCulturalCrowdfunding",
      contractAddress,
    );

    const stats = await contract.getPlatformStats();
    const totalProjects = Number(stats.totalProjects);

    if (totalProjects === 0) {
      console.log("No projects found");
      return;
    }

    console.log("=== All Projects ===");
    for (let i = 1; i <= totalProjects; i++) {
      const project = await contract.getProject(i);
      const status = ["Active", "Successful", "Failed", "Withdrawn"][Number(project.status)];
      console.log(`\n[#${i}] ${project.title}`);
      console.log(`  Category: ${project.category}`);
      console.log(`  Status: ${status}`);
      console.log(`  Backers: ${project.backerCount}`);
    }
  });
