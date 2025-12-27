// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title User Decrypt Single Value Example
/// @notice Demonstrates how users can decrypt their own encrypted values
/// @dev Shows the complete user decryption workflow with proper permissions
contract UserDecryptSingleValue is SepoliaConfig {
    /// @notice Mapping of user addresses to their encrypted values
    mapping(address => euint32) private userValues;

    /// @notice Track if user has stored a value
    mapping(address => bool) private hasValue;

    /// @notice Event emitted when a value is stored
    event ValueStored(address indexed user, uint256 timestamp);

    /// @notice Event emitted when a value is retrieved for decryption
    event ValueRetrieved(address indexed user, uint256 timestamp);

    /// @notice Store an encrypted value for the user
    /// @dev User encrypts a value and stores it for later decryption
    /// @param inputValue The encrypted value from user
    /// @param inputProof Zero-knowledge proof of correct encryption
    function storeValue(inEuint32 calldata inputValue, bytes calldata inputProof) external {
        // Convert external encrypted input to internal type
        euint32 encrypted = FHE.asEuint32(inputValue, inputProof);

        // Store user's encrypted value
        userValues[msg.sender] = encrypted;
        hasValue[msg.sender] = true;

        // ✅ CRITICAL: Grant permissions for user decryption
        // Contract needs permission to store and use the value
        FHE.allowThis(encrypted);

        // User needs permission to decrypt their own value
        FHE.allow(encrypted, msg.sender);

        emit ValueStored(msg.sender, block.timestamp);
    }

    /// @notice Retrieve encrypted value for user decryption
    /// @dev Returns the encrypted value as euint32 for client-side decryption
    /// @return The user's encrypted value
    function getValueForDecryption() external view returns (euint32) {
        require(hasValue[msg.sender], "No value stored for user");

        // Return encrypted value - user can decrypt on client side
        // Thanks to FHE.allow(encrypted, msg.sender) in storeValue()
        return userValues[msg.sender];
    }

    /// @notice Alternative: Get value as bytes32 handle
    /// @dev Some clients prefer bytes32 format
    /// @return The encrypted value as bytes32
    function getValueAsBytes() external view returns (bytes32) {
        require(hasValue[msg.sender], "No value stored for user");
        return FHE.toBytes32(userValues[msg.sender]);
    }

    /// @notice Check if user has a stored value
    /// @return bool indicating if value exists
    function hasStoredValue() external view returns (bool) {
        return hasValue[msg.sender];
    }

    /// @notice Update user's encrypted value
    /// @dev Allows user to change their stored value
    /// @param newValue New encrypted value
    /// @param proof Proof for new value
    function updateValue(inEuint32 calldata newValue, bytes calldata proof) external {
        euint32 encrypted = FHE.asEuint32(newValue, proof);

        userValues[msg.sender] = encrypted;

        // Grant permissions for new value
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);
    }

    /// @notice Delete user's encrypted value
    /// @dev Removes the stored value (sets to zero)
    function deleteValue() external {
        require(hasValue[msg.sender], "No value to delete");

        // Reset to encrypted zero
        userValues[msg.sender] = FHE.asEuint32(0);
        hasValue[msg.sender] = false;
    }
}
