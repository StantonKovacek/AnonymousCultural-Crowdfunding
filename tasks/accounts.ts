import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Display Available Accounts Task
 *
 * Displays all available test accounts with their addresses and balances
 *
 * Usage:
 *   npx hardhat accounts
 */
task("accounts", "Prints the list of accounts", async (
  _taskArgs: TaskArguments,
  hre,
) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    const formattedBalance = hre.ethers.formatEther(balance);
    console.log(`${account.address} -- ${formattedBalance} ETH`);
  }
});
