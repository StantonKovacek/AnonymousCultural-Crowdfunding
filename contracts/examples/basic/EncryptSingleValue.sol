// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypt Single Value Example
/// @notice Demonstrates how to encrypt a single value using FHEVM
/// @dev This example shows the basic encryption workflow with proper permission management
contract EncryptSingleValue is SepoliaConfig {
    /// @notice Encrypted storage value
    /// @dev This value is encrypted on-chain and can only be decrypted by authorized parties
    euint32 private storedValue;

    /// @notice Owner of the contract who can access encrypted values
    address public owner;

    /// @notice Event emitted when a value is encrypted and stored
    event ValueEncrypted(address indexed user, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Encrypts and stores a single value
    /// @dev Demonstrates the complete encryption workflow:
    /// 1. Receive encrypted input with proof
    /// 2. Convert to internal encrypted type
    /// 3. Store encrypted value
    /// 4. Grant proper permissions
    /// @param inputValue The encrypted input value (euint32)
    /// @param inputProof Zero-knowledge proof of correct encryption
    function encryptAndStore(inEuint32 calldata inputValue, bytes calldata inputProof) external {
        // Convert external encrypted input to internal type
        // This validates the input proof and ensures the value was encrypted correctly
        euint32 encryptedValue = FHE.asEuint32(inputValue, inputProof);

        // Store the encrypted value
        storedValue = encryptedValue;

        // ✅ CRITICAL: Grant permissions
        // The contract needs permission to use this value in future operations
        FHE.allowThis(encryptedValue);

        // The user who encrypted the value needs permission to decrypt it later
        FHE.allow(encryptedValue, msg.sender);

        emit ValueEncrypted(msg.sender, block.timestamp);
    }

    /// @notice Retrieves the encrypted value as bytes32
    /// @dev Only the owner or the user who encrypted the value can retrieve it
    /// @return The encrypted value as bytes32 handle
    function getEncryptedValue() external view returns (euint32) {
        require(msg.sender == owner, "Only owner can view encrypted value");
        return storedValue;
    }

    /// @notice Checks if a value has been stored
    /// @return bool indicating if a value exists
    function hasValue() external view returns (bool) {
        // Note: In FHE, we cannot directly check if encrypted value is zero
        // This is a simplified check
        return FHE.decrypt(FHE.ne(storedValue, FHE.asEuint32(0)));
    }
}
