// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Access Control with FHE Example
/// @notice Demonstrates proper access control patterns with encrypted data
/// @dev Shows how to use FHE.allow() and FHE.allowThis() for permission management
contract AccessControl is SepoliaConfig {
    /// @notice Owner of sensitive encrypted data
    address public owner;

    /// @notice Encrypted sensitive value
    euint32 private sensitiveData;

    /// @notice Mapping of approved addresses
    mapping(address => bool) private approvedUsers;

    /// @notice Event for when an address is approved
    event AccessGranted(address indexed user, uint256 timestamp);

    /// @notice Event for when access is revoked
    event AccessRevoked(address indexed user, uint256 timestamp);

    /// @notice Event for data update
    event DataUpdated(address indexed updater, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Grant access to another user
    /// @dev Only the owner can grant access
    /// @param user The address to grant access to
    function grantAccess(address user) external {
        require(msg.sender == owner, "Only owner can grant access");
        require(user != address(0), "Invalid address");
        require(!approvedUsers[user], "Already approved");

        approvedUsers[user] = true;

        emit AccessGranted(user, block.timestamp);
    }

    /// @notice Revoke access from a user
    /// @dev Only the owner can revoke access
    /// @param user The address to revoke access from
    function revokeAccess(address user) external {
        require(msg.sender == owner, "Only owner can revoke access");
        require(approvedUsers[user], "Not approved");

        approvedUsers[user] = false;

        emit AccessRevoked(user, block.timestamp);
    }

    /// @notice Store encrypted data with proper access control
    /// @dev ✅ CORRECT: Grant permissions to owner and contract
    /// @param inputData The encrypted value
    /// @param proof Proof for the encrypted value
    function setSensitiveData(inEuint32 calldata inputData, bytes calldata proof) external {
        require(msg.sender == owner, "Only owner can set data");

        euint32 encrypted = FHE.asEuint32(inputData, proof);
        sensitiveData = encrypted;

        // ✅ CORRECT: Grant permissions
        FHE.allowThis(encrypted);      // Contract can use the value
        FHE.allow(encrypted, owner);   // Owner can decrypt

        emit DataUpdated(msg.sender, block.timestamp);
    }

    /// @notice Retrieve encrypted data
    /// @dev ✅ CORRECT: Only authorized users can access
    /// @return The encrypted data
    function getSensitiveData() external view returns (euint32) {
        require(
            msg.sender == owner || approvedUsers[msg.sender],
            "Access denied: not authorized"
        );
        return sensitiveData;
    }

    /// @notice Example of ❌ WRONG access control pattern
    /// @dev This function would allow anyone to see encrypted data
    /// NEVER do this in production!
    function getDataWrong() external view returns (euint32) {
        // ❌ WRONG: No access control check!
        return sensitiveData;
    }

    /// @notice Check if an address has access
    /// @param user The address to check
    /// @return bool indicating if user has access
    function hasAccess(address user) external view returns (bool) {
        return approvedUsers[user] || user == owner;
    }

    /// @notice Count approved users
    /// @return Number of approved addresses
    function getApprovedUserCount() external view returns (uint256) {
        // Note: This would require a different storage structure for actual counting
        // This is a simplified example
        return 0;
    }
}
