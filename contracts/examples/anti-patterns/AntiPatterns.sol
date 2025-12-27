// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Anti-Patterns Example
/// @notice Demonstrates COMMON MISTAKES to AVOID when using FHEVM
/// @dev This contract is for educational purposes - DO NOT copy these patterns!
contract AntiPatterns is SepoliaConfig {
    euint32 private data;

    // ❌ ANTI-PATTERN #1: Missing allowThis()
    /// This will FAIL when trying to decrypt
    function antiPatternMissingAllowThis(inEuint32 calldata inputValue, bytes calldata proof) external {
        euint32 encrypted = FHE.asEuint32(inputValue, proof);
        data = encrypted;

        // ❌ WRONG: Only grant user permission
        FHE.allow(encrypted, msg.sender);  // Missing FHE.allowThis()!
        // Result: User cannot decrypt - permission denied error
    }

    // ❌ ANTI-PATTERN #2: Missing allow() for users
    /// User cannot decrypt because they don't have permission
    function antiPatternMissingAllow(inEuint32 calldata inputValue, bytes calldata proof) external {
        euint32 encrypted = FHE.asEuint32(inputValue, proof);
        data = encrypted;

        // ❌ WRONG: Only grant contract permission
        FHE.allowThis(encrypted);  // Missing FHE.allow()!
        // Result: Contract can use it but user cannot decrypt
    }

    // ❌ ANTI-PATTERN #3: Exposing encrypted data without checks
    /// Anyone can see encrypted values
    function antiPatternNoAccessControl() external view returns (euint32) {
        // ❌ WRONG: No access control!
        return data;
        // Result: Privacy violation - anyone can access encrypted data
    }

    // ❌ ANTI-PATTERN #4: Trusting unverified input
    /// Encrypted values without proofs can be forged
    function antiPatternNoInputVerification(euint32 directValue) external {
        // ❌ WRONG: Accepting encrypted value without proof!
        data = directValue;
        // Result: Value could be maliciously crafted - security risk
    }

    // ❌ ANTI-PATTERN #5: Using encrypted values in view functions
    /// Cannot return encrypted values from view functions
    /// (This won't compile but shows the conceptual error)
    // function antiPatternReturnEncrypted() external view returns (euint32) {
    //     // ❌ WRONG: Returning encrypted values from view functions
    //     return data;
    // }

    // ❌ ANTI-PATTERN #6: Logic depending on plaintext encrypted values
    /// You cannot directly compare or use encrypted values
    function antiPatternDirectComparison(inEuint32 calldata inputValue, bytes calldata proof)
        external
    {
        euint32 encrypted = FHE.asEuint32(inputValue, proof);

        // ❌ WRONG: Trying to use encrypted value in if statement
        // if (encrypted == FHE.asEuint32(100)) {  // Won't work!
        //     // This doesn't work - encrypted values are opaque
        // }

        // ✅ CORRECT: Use FHE operations for comparison
        // ebool result = FHE.eq(encrypted, FHE.asEuint32(100));
        // Then request decryption if needed
    }

    // ❌ ANTI-PATTERN #7: Forgetting to re-encrypt after operations
    /// Original encrypted value permission might not apply to result
    function antiPatternForgotRePerm(inEuint32 calldata inputValue, bytes calldata proof)
        external
    {
        euint32 encrypted = FHE.asEuint32(inputValue, proof);

        // ❌ WRONG: Adding without granting permission to result
        euint32 result = FHE.add(encrypted, FHE.asEuint32(10));
        data = result;

        FHE.allow(encrypted, msg.sender);  // Permission for input
        // Missing: FHE.allowThis(result) and FHE.allow(result, msg.sender)
        // Result: User cannot decrypt the result
    }

    // ❌ ANTI-PATTERN #8: Assuming encrypted arithmetic works like plaintext
    /// Overflow/underflow behavior differs
    function antiPatternArithmetic(inEuint32 calldata val1, inEuint32 calldata val2,
        bytes calldata proof1, bytes calldata proof2) external {
        euint32 e1 = FHE.asEuint32(val1, proof1);
        euint32 e2 = FHE.asEuint32(val2, proof2);

        // ❌ WRONG: Assuming overflow protection like in plaintext Solidity
        // In FHE, overflow behavior is different
        euint32 result = FHE.add(e1, e2);

        // ✅ CORRECT: Implement your own bounds checking
        // Use decryption requests for verification when needed
    }

    // ✅ CORRECT PATTERNS FOR REFERENCE

    /// ✅ CORRECT: Proper encryption workflow
    function correctPattern(inEuint32 calldata inputValue, bytes calldata proof) external {
        // 1. Validate input with proof
        euint32 encrypted = FHE.asEuint32(inputValue, proof);

        // 2. Store encrypted value
        data = encrypted;

        // 3. Grant BOTH permissions
        FHE.allowThis(encrypted);        // Contract permission
        FHE.allow(encrypted, msg.sender); // User permission

        // Result: Both contract and user can use the encrypted value
    }

    /// ✅ CORRECT: Access control for encrypted data
    function correctAccessControl() external view returns (euint32) {
        // 1. Check authorization
        require(msg.sender == tx.origin, "Direct calls only");

        // 2. Return encrypted data to authorized user
        return data;
    }

    /// ✅ CORRECT: Handling multiple values
    function correctMultipleValues(inEuint32 calldata val1, inEuint32 calldata val2,
        bytes calldata proof1, bytes calldata proof2) external {
        euint32 e1 = FHE.asEuint32(val1, proof1);
        euint32 e2 = FHE.asEuint32(val2, proof2);

        // Grant permissions for EACH value
        FHE.allowThis(e1);
        FHE.allow(e1, msg.sender);

        FHE.allowThis(e2);
        FHE.allow(e2, msg.sender);

        // Perform operations
        euint32 result = FHE.add(e1, e2);

        // Grant permissions for RESULT
        FHE.allowThis(result);
        FHE.allow(result, msg.sender);

        data = result;
    }
}
