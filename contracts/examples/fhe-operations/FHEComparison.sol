// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, ebool, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Comparison Operations Example
/// @notice Demonstrates comparison operations on encrypted values
/// @dev Shows how to use FHE.eq(), FHE.gt(), FHE.lt() for encrypted comparisons
contract FHEComparison is SepoliaConfig {
    /// @notice Encrypted target value
    euint32 private encryptedTarget;

    /// @notice Owner
    address public owner;

    /// @notice Track if target exists
    bool private hasTarget;

    /// @notice Event for comparison performed
    event ComparisonPerformed(string operation, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Set encrypted target value
    /// @dev Value to compare against
    /// @param target Encrypted target value
    /// @param proof Proof for target
    function setTarget(inEuint32 calldata target, bytes calldata proof) external {
        require(msg.sender == owner, "Only owner");

        euint32 encrypted = FHE.asEuint32(target, proof);
        encryptedTarget = encrypted;
        hasTarget = true;

        FHE.allowThis(encrypted);
        FHE.allow(encrypted, owner);
    }

    /// @notice Check if value equals target (encrypted comparison)
    /// @dev ✅ CORRECT: Use FHE.eq() to compare encrypted values
    /// @param value Value to compare (encrypted)
    /// @param proof Proof for value
    /// @return Encrypted boolean result
    function isEqual(inEuint32 calldata value, bytes calldata proof)
        external
        returns (ebool)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Compare encrypted values using FHE.eq()
        // Result is also encrypted (ebool)
        ebool result = FHE.eq(encValue, encryptedTarget);

        // Grant permissions
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ComparisonPerformed("equal", block.timestamp);

        return result;
    }

    /// @notice Check if value is greater than target
    /// @dev ✅ CORRECT: Use FHE.gt() for greater-than comparison
    /// @param value Value to compare (encrypted)
    /// @param proof Proof for value
    /// @return Encrypted boolean result
    function isGreaterThan(inEuint32 calldata value, bytes calldata proof)
        external
        returns (ebool)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Use FHE.gt() for greater-than
        ebool result = FHE.gt(encValue, encryptedTarget);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ComparisonPerformed("greaterThan", block.timestamp);

        return result;
    }

    /// @notice Check if value is less than target
    /// @dev ✅ CORRECT: Use FHE.lt() for less-than comparison
    /// @param value Value to compare (encrypted)
    /// @param proof Proof for value
    /// @return Encrypted boolean result
    function isLessThan(inEuint32 calldata value, bytes calldata proof)
        external
        returns (ebool)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Use FHE.lt() for less-than
        ebool result = FHE.lt(encValue, encryptedTarget);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ComparisonPerformed("lessThan", block.timestamp);

        return result;
    }

    /// @notice Check if value is greater or equal
    /// @dev Demonstrated using ge operation
    /// @param value Value to compare (encrypted)
    /// @param proof Proof for value
    /// @return Encrypted boolean result
    function isGreaterOrEqual(inEuint32 calldata value, bytes calldata proof)
        external
        returns (ebool)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Use FHE.ge() for greater-or-equal
        ebool result = FHE.ge(encValue, encryptedTarget);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ComparisonPerformed("greaterOrEqual", block.timestamp);

        return result;
    }

    /// @notice Check if value is less or equal
    /// @dev Demonstrated using le operation
    /// @param value Value to compare (encrypted)
    /// @param proof Proof for value
    /// @return Encrypted boolean result
    function isLessOrEqual(inEuint32 calldata value, bytes calldata proof)
        external
        returns (ebool)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Use FHE.le() for less-or-equal
        ebool result = FHE.le(encValue, encryptedTarget);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ComparisonPerformed("lessOrEqual", block.timestamp);

        return result;
    }

    /// @notice Check if value is not equal to target
    /// @dev ✅ CORRECT: Use FHE.ne() for not-equal comparison
    /// @param value Value to compare (encrypted)
    /// @param proof Proof for value
    /// @return Encrypted boolean result
    function isNotEqual(inEuint32 calldata value, bytes calldata proof)
        external
        returns (ebool)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Use FHE.ne() for not-equal
        ebool result = FHE.ne(encValue, encryptedTarget);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        emit ComparisonPerformed("notEqual", block.timestamp);

        return result;
    }

    /// @notice Compare two encrypted values directly
    /// @dev ✅ CORRECT: Compare any two encrypted values
    /// @param value1 First encrypted value
    /// @param value2 Second encrypted value
    /// @param proof1 Proof for value1
    /// @param proof2 Proof for value2
    /// @return True if equal (encrypted)
    function compareValues(
        inEuint32 calldata value1,
        inEuint32 calldata value2,
        bytes calldata proof1,
        bytes calldata proof2,
    ) external returns (ebool) {
        euint32 encValue1 = FHE.asEuint32(value1, proof1);
        euint32 encValue2 = FHE.asEuint32(value2, proof2);

        // Compare two encrypted values
        ebool result = FHE.eq(encValue1, encValue2);

        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return result;
    }

    /// @notice Example: Use comparison in conditional logic (via decryption)
    /// @dev Shows how to use encrypted comparisons for contract logic
    /// @param value Value to check (encrypted)
    /// @param proof Proof for value
    /// @return Decision based on encrypted comparison
    function conditionalLogic(inEuint32 calldata value, bytes calldata proof)
        external
        returns (string memory)
    {
        require(hasTarget, "Target not set");

        euint32 encValue = FHE.asEuint32(value, proof);

        // Compare encrypted values
        ebool isGreater = FHE.gt(encValue, encryptedTarget);

        // ✅ To use in contract logic, must decrypt the boolean
        // bool result = FHE.decrypt(isGreater);  // This would decrypt
        // if (result) { ... }

        // For now, just return encrypted result
        FHE.allowThis(isGreater);
        FHE.allow(isGreater, msg.sender);

        return "Comparison performed (result encrypted)";
    }

    /// @notice Get encrypted target
    /// @return The encrypted target value
    function getTarget() external view returns (euint32) {
        require(hasTarget, "Target not set");
        return encryptedTarget;
    }

    /// @notice Check if target is set
    /// @return bool indicating if target exists
    function hasTargetSet() external view returns (bool) {
        return hasTarget;
    }
}
