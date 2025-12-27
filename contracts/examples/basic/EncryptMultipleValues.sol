// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Multiple Values Example
/// @notice Demonstrates encryption and management of multiple encrypted values
/// @dev Shows how to handle multiple encrypted inputs and maintain proper permissions
contract EncryptMultipleValues is SepoliaConfig {
    /// @notice Structure holding multiple encrypted values
    struct EncryptedData {
        euint32 amount;
        euint32 balance;
        euint32 limit;
    }

    /// @notice Storage for encrypted data
    mapping(address => EncryptedData) private userData;

    /// @notice Track if user has data
    mapping(address => bool) private hasData;

    /// @notice Event for when multiple values are encrypted
    event MultipleValuesEncrypted(address indexed user, uint256 count, uint256 timestamp);

    /// @notice Encrypts and stores multiple values
    /// @dev Demonstrates handling multiple encrypted inputs:
    /// 1. Receive multiple encrypted inputs
    /// 2. Grant permissions for each value
    /// 3. Store in structured format
    /// @param inputAmount First encrypted value
    /// @param inputBalance Second encrypted value
    /// @param inputLimit Third encrypted value
    /// @param amountProof Proof for first value
    /// @param balanceProof Proof for second value
    /// @param limitProof Proof for third value
    function encryptMultipleValues(
        inEuint32 calldata inputAmount,
        inEuint32 calldata inputBalance,
        inEuint32 calldata inputLimit,
        bytes calldata amountProof,
        bytes calldata balanceProof,
        bytes calldata limitProof,
    ) external {
        // ✅ CORRECT: Convert each encrypted input with its proof
        euint32 amount = FHE.asEuint32(inputAmount, amountProof);
        euint32 balance = FHE.asEuint32(inputBalance, balanceProof);
        euint32 limit = FHE.asEuint32(inputLimit, limitProof);

        // Store all encrypted values
        userData[msg.sender] = EncryptedData({
            amount: amount,
            balance: balance,
            limit: limit,
        });

        hasData[msg.sender] = true;

        // ✅ CRITICAL: Grant permissions for ALL values
        // Each encrypted value needs both permissions
        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);

        FHE.allowThis(balance);
        FHE.allow(balance, msg.sender);

        FHE.allowThis(limit);
        FHE.allow(limit, msg.sender);

        emit MultipleValuesEncrypted(msg.sender, 3, block.timestamp);
    }

    /// @notice Retrieve all encrypted values for a user
    /// @dev Only the user can retrieve their own encrypted values
    /// @return The encrypted data structure
    function getEncryptedData(address user) external view returns (EncryptedData memory) {
        require(msg.sender == user, "Can only access your own data");
        require(hasData[user], "No data found for user");
        return userData[user];
    }

    /// @notice Update a single value while keeping others
    /// @dev Demonstrates updating one encrypted value
    /// @param newAmount The new encrypted amount
    /// @param proof Proof for the new value
    function updateAmount(inEuint32 calldata newAmount, bytes calldata proof) external {
        require(hasData[msg.sender], "No data found");

        euint32 amount = FHE.asEuint32(newAmount, proof);
        userData[msg.sender].amount = amount;

        FHE.allowThis(amount);
        FHE.allow(amount, msg.sender);
    }

    /// @notice Checks if user has data stored
    /// @return bool indicating if user has encrypted data
    function userHasData(address user) external view returns (bool) {
        return hasData[user];
    }
}
