// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, inEuint32, inEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Multiple Values Example
/// @notice Demonstrates user decryption of multiple related encrypted values
/// @dev Shows how to manage and decrypt multiple encrypted fields per user
contract UserDecryptMultipleValues is SepoliaConfig {
    /// @notice Structure holding multiple encrypted values per user
    struct EncryptedValues {
        euint32 balance;
        euint64 totalDeposits;
        euint32 withdrawals;
        bool exists;
    }

    /// @notice Storage for each user's encrypted values
    mapping(address => EncryptedValues) private userAccounts;

    /// @notice Event for account creation
    event AccountCreated(address indexed user, uint256 timestamp);

    /// @notice Event for values updated
    event ValuesUpdated(address indexed user, uint256 timestamp);

    /// @notice Initialize user account with encrypted values
    /// @dev Demonstrates setting up multiple encrypted values with proper permissions
    /// @param balance Initial encrypted balance
    /// @param deposits Initial encrypted total deposits
    /// @param withdrawals Initial encrypted withdrawals
    /// @param balanceProof Proof for balance
    /// @param depositsProof Proof for deposits
    /// @param withdrawalsProof Proof for withdrawals
    function createAccount(
        inEuint32 calldata balance,
        inEuint64 calldata deposits,
        inEuint32 calldata withdrawals,
        bytes calldata balanceProof,
        bytes calldata depositsProof,
        bytes calldata withdrawalsProof,
    ) external {
        require(!userAccounts[msg.sender].exists, "Account already exists");

        // ✅ CORRECT: Convert each encrypted input with its proof
        euint32 encBalance = FHE.asEuint32(balance, balanceProof);
        euint64 encDeposits = FHE.asEuint64(deposits, depositsProof);
        euint32 encWithdrawals = FHE.asEuint32(withdrawals, withdrawalsProof);

        // Store all encrypted values
        userAccounts[msg.sender] = EncryptedValues({
            balance: encBalance,
            totalDeposits: encDeposits,
            withdrawals: encWithdrawals,
            exists: true,
        });

        // ✅ CRITICAL: Grant permissions for ALL values
        // Each encrypted value needs both allowThis() and allow()
        FHE.allowThis(encBalance);
        FHE.allow(encBalance, msg.sender);

        FHE.allowThis(encDeposits);
        FHE.allow(encDeposits, msg.sender);

        FHE.allowThis(encWithdrawals);
        FHE.allow(encWithdrawals, msg.sender);

        emit AccountCreated(msg.sender, block.timestamp);
    }

    /// @notice Get all user's encrypted values
    /// @dev User can decrypt all their values on client side
    /// @return The encrypted values structure
    function getAccountValues() external view returns (EncryptedValues memory) {
        require(userAccounts[msg.sender].exists, "Account does not exist");

        // Return all encrypted values - user can decrypt each
        return userAccounts[msg.sender];
    }

    /// @notice Get individual encrypted balance
    /// @return The encrypted balance value
    function getBalance() external view returns (euint32) {
        require(userAccounts[msg.sender].exists, "Account does not exist");
        return userAccounts[msg.sender].balance;
    }

    /// @notice Get individual encrypted deposits
    /// @return The encrypted deposits value
    function getDeposits() external view returns (euint64) {
        require(userAccounts[msg.sender].exists, "Account does not exist");
        return userAccounts[msg.sender].totalDeposits;
    }

    /// @notice Get individual encrypted withdrawals
    /// @return The encrypted withdrawals value
    function getWithdrawals() external view returns (euint32) {
        require(userAccounts[msg.sender].exists, "Account does not exist");
        return userAccounts[msg.sender].withdrawals;
    }

    /// @notice Update balance (example operation)
    /// @dev Demonstrates updating one value while keeping others
    /// @param newBalance New encrypted balance
    /// @param proof Proof for new balance
    function updateBalance(inEuint32 calldata newBalance, bytes calldata proof) external {
        require(userAccounts[msg.sender].exists, "Account does not exist");

        euint32 encBalance = FHE.asEuint32(newBalance, proof);
        userAccounts[msg.sender].balance = encBalance;

        // Grant permissions for updated value
        FHE.allowThis(encBalance);
        FHE.allow(encBalance, msg.sender);

        emit ValuesUpdated(msg.sender, block.timestamp);
    }

    /// @notice Add to deposits (example operation)
    /// @dev Shows arithmetic on encrypted values
    /// @param amount Amount to add (encrypted)
    /// @param proof Proof for amount
    function addDeposits(inEuint64 calldata amount, bytes calldata proof) external {
        require(userAccounts[msg.sender].exists, "Account does not exist");

        euint64 encAmount = FHE.asEuint64(amount, proof);

        // ✅ CORRECT: Perform operation on encrypted values
        euint64 newDeposits = FHE.add(userAccounts[msg.sender].totalDeposits, encAmount);
        userAccounts[msg.sender].totalDeposits = newDeposits;

        // Grant permissions for result
        FHE.allowThis(newDeposits);
        FHE.allow(newDeposits, msg.sender);

        emit ValuesUpdated(msg.sender, block.timestamp);
    }

    /// @notice Add to withdrawals
    /// @dev Similar operation on different field
    /// @param amount Amount to add (encrypted)
    /// @param proof Proof for amount
    function addWithdrawals(inEuint32 calldata amount, bytes calldata proof) external {
        require(userAccounts[msg.sender].exists, "Account does not exist");

        euint32 encAmount = FHE.asEuint32(amount, proof);

        // Perform operation
        euint32 newWithdrawals = FHE.add(userAccounts[msg.sender].withdrawals, encAmount);
        userAccounts[msg.sender].withdrawals = newWithdrawals;

        // Grant permissions
        FHE.allowThis(newWithdrawals);
        FHE.allow(newWithdrawals, msg.sender);

        emit ValuesUpdated(msg.sender, block.timestamp);
    }

    /// @notice Check if user has account
    /// @return bool indicating if account exists
    function hasAccount() external view returns (bool) {
        return userAccounts[msg.sender].exists;
    }
}
