// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Single Value Example
/// @notice Demonstrates public decryption using FHE.decrypt()
/// @dev Shows how to decrypt values for on-chain verification
contract PublicDecryptSingleValue is SepoliaConfig {
    /// @notice Encrypted value storage
    euint32 private encryptedValue;

    /// @notice Last publicly decrypted value
    uint32 public lastDecryptedValue;

    /// @notice Owner who can trigger decryption
    address public owner;

    /// @notice Track if value exists
    bool private hasValue;

    /// @notice Event for value stored
    event ValueStored(address indexed user, uint256 timestamp);

    /// @notice Event for value decrypted
    event ValueDecrypted(uint32 value, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Store an encrypted value
    /// @dev Anyone can store, but only owner can decrypt publicly
    /// @param inputValue Encrypted value
    /// @param inputProof Proof for the value
    function storeEncryptedValue(inEuint32 calldata inputValue, bytes calldata inputProof)
        external
    {
        euint32 encrypted = FHE.asEuint32(inputValue, inputProof);

        encryptedValue = encrypted;
        hasValue = true;

        // Grant permissions
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);

        emit ValueStored(msg.sender, block.timestamp);
    }

    /// @notice Publicly decrypt the stored value
    /// @dev ✅ CORRECT: Use FHE.decrypt() to reveal value on-chain
    /// @return The decrypted plaintext value
    function decryptValue() external returns (uint32) {
        require(msg.sender == owner, "Only owner can decrypt");
        require(hasValue, "No value to decrypt");

        // ✅ PUBLIC DECRYPTION: This reveals the value on-chain
        // Use this only when you need the plaintext for contract logic
        uint32 decrypted = FHE.decrypt(encryptedValue);

        lastDecryptedValue = decrypted;

        emit ValueDecrypted(decrypted, block.timestamp);

        return decrypted;
    }

    /// @notice Example: Verify if value meets threshold
    /// @dev Demonstrates using decryption for conditional logic
    /// @param threshold The threshold to check against
    /// @return bool indicating if value >= threshold
    function verifyThreshold(uint32 threshold) external returns (bool) {
        require(msg.sender == owner, "Only owner can verify");
        require(hasValue, "No value to verify");

        // Decrypt to compare
        uint32 value = FHE.decrypt(encryptedValue);
        lastDecryptedValue = value;

        return value >= threshold;
    }

    /// @notice Example: Decrypt and process value
    /// @dev Shows how decrypted value can be used in contract logic
    /// @return The decrypted value doubled
    function decryptAndDouble() external returns (uint32) {
        require(msg.sender == owner, "Only owner can decrypt");
        require(hasValue, "No value to decrypt");

        // Decrypt
        uint32 value = FHE.decrypt(encryptedValue);
        lastDecryptedValue = value;

        // Process the plaintext value
        uint32 doubled = value * 2;

        emit ValueDecrypted(value, block.timestamp);

        return doubled;
    }

    /// @notice Get encrypted value (does not decrypt)
    /// @dev For user-side decryption, not public decryption
    /// @return The encrypted value
    function getEncryptedValue() external view returns (euint32) {
        require(hasValue, "No value stored");
        return encryptedValue;
    }

    /// @notice Check if value is stored
    /// @return bool indicating if value exists
    function hasStoredValue() external view returns (bool) {
        return hasValue;
    }

    /// @notice WARNING: Public decryption reveals data on-chain
    /// @dev This example function shows the danger of unnecessary decryption
    function dangerousPublicReveal() external returns (uint32) {
        require(msg.sender == owner, "Only owner");

        // ❌ WARNING: This makes the value public forever!
        // Only decrypt when absolutely necessary for contract logic
        return FHE.decrypt(encryptedValue);
    }
}
