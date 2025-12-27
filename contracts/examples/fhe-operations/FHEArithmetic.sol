// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Arithmetic Operations Example
/// @notice Demonstrates arithmetic operations on encrypted values
/// @dev Shows how to perform add, subtract, multiply on encrypted data
contract FHEArithmetic is SepoliaConfig {
    /// @notice Encrypted counter
    euint32 private encryptedCounter;

    /// @notice Owner
    address public owner;

    /// @notice Track if counter exists
    bool private hasCounter;

    /// @notice Event for operation performed
    event OperationPerformed(string operation, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Initialize counter with encrypted value
    /// @dev Must be done before any operations
    /// @param initialValue Initial encrypted value
    /// @param proof Proof for initial value
    function initializeCounter(inEuint32 calldata initialValue, bytes calldata proof)
        external
    {
        require(msg.sender == owner, "Only owner can initialize");
        require(!hasCounter, "Counter already initialized");

        euint32 encrypted = FHE.asEuint32(initialValue, proof);
        encryptedCounter = encrypted;
        hasCounter = true;

        // Grant permissions
        FHE.allowThis(encrypted);
        FHE.allow(encrypted, owner);
    }

    /// @notice Add a value to counter (encrypted)
    /// @dev ✅ CORRECT: FHE.add() performs addition on encrypted values
    /// @param value Value to add (encrypted)
    /// @param proof Proof for value
    function addToCounter(inEuint32 calldata value, bytes calldata proof) external {
        require(msg.sender == owner, "Only owner");
        require(hasCounter, "Counter not initialized");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Add encrypted values without decryption
        euint32 newCounter = FHE.add(encryptedCounter, encValue);

        encryptedCounter = newCounter;

        // Grant permissions for result
        FHE.allowThis(newCounter);
        FHE.allow(newCounter, owner);

        emit OperationPerformed("add", block.timestamp);
    }

    /// @notice Subtract a value from counter (encrypted)
    /// @dev ✅ CORRECT: FHE.sub() performs subtraction on encrypted values
    /// @param value Value to subtract (encrypted)
    /// @param proof Proof for value
    function subtractFromCounter(inEuint32 calldata value, bytes calldata proof) external {
        require(msg.sender == owner, "Only owner");
        require(hasCounter, "Counter not initialized");

        euint32 encValue = FHE.asEuint32(value, proof);

        // ✅ CORRECT: Subtract encrypted values
        // NOTE: Underflow behavior differs from plaintext Solidity
        euint32 newCounter = FHE.sub(encryptedCounter, encValue);

        encryptedCounter = newCounter;

        // Grant permissions
        FHE.allowThis(newCounter);
        FHE.allow(newCounter, owner);

        emit OperationPerformed("subtract", block.timestamp);
    }

    /// @notice Multiply counter by a value (encrypted)
    /// @dev ✅ CORRECT: FHE.mul() performs multiplication on encrypted values
    /// @param multiplier Value to multiply by (encrypted)
    /// @param proof Proof for multiplier
    function multiplyCounter(inEuint32 calldata multiplier, bytes calldata proof) external {
        require(msg.sender == owner, "Only owner");
        require(hasCounter, "Counter not initialized");

        euint32 encMultiplier = FHE.asEuint32(multiplier, proof);

        // ✅ CORRECT: Multiply encrypted values
        euint32 newCounter = FHE.mul(encryptedCounter, encMultiplier);

        encryptedCounter = newCounter;

        // Grant permissions
        FHE.allowThis(newCounter);
        FHE.allow(newCounter, owner);

        emit OperationPerformed("multiply", block.timestamp);
    }

    /// @notice Add two encrypted values (demonstration)
    /// @dev Shows arithmetic without modifying counter
    /// @param value1 First value (encrypted)
    /// @param value2 Second value (encrypted)
    /// @param proof1 Proof for first value
    /// @param proof2 Proof for second value
    /// @return Result of addition
    function addTwoValues(
        inEuint32 calldata value1,
        inEuint32 calldata value2,
        bytes calldata proof1,
        bytes calldata proof2,
    ) external returns (euint32) {
        euint32 encValue1 = FHE.asEuint32(value1, proof1);
        euint32 encValue2 = FHE.asEuint32(value2, proof2);

        // Add without storing
        euint32 result = FHE.add(encValue1, encValue2);

        // Grant permissions
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        return result;
    }

    /// @notice Get encrypted counter
    /// @return The encrypted counter value
    function getEncryptedCounter() external view returns (euint32) {
        require(hasCounter, "Counter not initialized");
        return encryptedCounter;
    }

    /// @notice Chained operations example
    /// @dev Demonstrates multiple operations in sequence
    /// @param addValue Value to add (encrypted)
    /// @param subValue Value to subtract (encrypted)
    /// @param addProof Proof for add value
    /// @param subProof Proof for subtract value
    function chainedOperations(
        inEuint32 calldata addValue,
        inEuint32 calldata subValue,
        bytes calldata addProof,
        bytes calldata subProof,
    ) external {
        require(msg.sender == owner, "Only owner");
        require(hasCounter, "Counter not initialized");

        euint32 encAdd = FHE.asEuint32(addValue, addProof);
        euint32 encSub = FHE.asEuint32(subValue, subProof);

        // ✅ CORRECT: Chain multiple operations
        // Step 1: Add
        euint32 temp = FHE.add(encryptedCounter, encAdd);

        // Step 2: Subtract
        euint32 result = FHE.sub(temp, encSub);

        encryptedCounter = result;

        // Grant permissions
        FHE.allowThis(result);
        FHE.allow(result, owner);

        emit OperationPerformed("chained", block.timestamp);
    }

    /// @notice Example: ❌ DON'T - Direct comparison without decryption
    /// @dev This shows what NOT to do
    function wrongComparison(inEuint32 calldata value, bytes calldata proof) external {
        euint32 encValue = FHE.asEuint32(value, proof);

        // ❌ WRONG: Cannot directly compare encrypted values
        // if (encValue > FHE.asEuint32(100)) {  // Won't compile!
        //     // This doesn't work
        // }

        // ✅ CORRECT: Use FHE comparison operations
        // ebool result = FHE.gt(encValue, FHE.asEuint32(100));
    }
}
