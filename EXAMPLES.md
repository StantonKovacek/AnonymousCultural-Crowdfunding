# FHEVM Examples Index

This document provides an overview of all examples included in this project, organized by category and complexity level.

## Quick Links

- [Basic Examples](#basic-examples)
- [Access Control Examples](#access-control-examples)
- [Advanced Examples](#advanced-examples)
- [Anti-Patterns](#anti-patterns)

---

## Basic Examples

### 1. Encrypt Single Value

**Location**: `contracts/examples/basic/EncryptSingleValue.sol`
**Tests**: `test/examples/basic/EncryptSingleValue.ts`
**Difficulty**: ⭐ Beginner
**Time to Understand**: 15-20 minutes

**What You'll Learn**:
- How to encrypt a single value from user input
- Creating encrypted input with proofs
- Granting FHE permissions (allowThis + allow)
- Storing encrypted values on-chain
- Access control patterns

**Key Concepts**:
- `FHE.asEuint32()` - Convert external encrypted input
- `FHE.allowThis()` - Grant contract permission
- `FHE.allow()` - Grant user permission
- Input proof validation

**Example Usage**:
```typescript
// Encrypt a value
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(42)
  .encrypt();

// Store it
await contract.encryptAndStore(encrypted.handles[0], encrypted.inputProof);
```

---

### 2. Encrypt Multiple Values

**Location**: `contracts/examples/basic/EncryptMultipleValues.sol`
**Tests**: `test/examples/basic/EncryptMultipleValues.ts`
**Difficulty**: ⭐ Beginner
**Time to Understand**: 25-30 minutes

**What You'll Learn**:
- Managing multiple encrypted values
- Handling multiple input proofs
- Storing encrypted data in structs
- Updating encrypted values
- Permission management for multiple values

**Key Concepts**:
- Multiple encrypted inputs
- Structured storage of encrypted data
- Individual permission grants per value
- Data consistency

**Extends**:
- Single value encryption
- Adds complexity with multiple values

---

### 3. User Decryption (Single Value)

**Location**: `contracts/examples/basic/` (To be created)
**Difficulty**: ⭐ Beginner
**Time to Understand**: 20-25 minutes

**What You'll Learn**:
- User-initiated decryption
- Decryption authorization
- Returning plaintext values to authorized users
- Security considerations

---

### 4. User Decryption (Multiple Values)

**Location**: `contracts/examples/basic/` (To be created)
**Difficulty**: ⭐⭐ Intermediate
**Time to Understand**: 30-40 minutes

**What You'll Learn**:
- Decrypting multiple values simultaneously
- Coordinating multiple decryption requests
- Handling decryption callbacks
- Performance considerations

---

## Access Control Examples

### 1. Access Control Patterns

**Location**: `contracts/examples/access-control/AccessControl.sol`
**Tests**: `test/examples/access-control/AccessControl.ts`
**Difficulty**: ⭐⭐ Intermediate
**Time to Understand**: 30-40 minutes

**What You'll Learn**:
- Implementing access control for encrypted data
- Permission grant and revocation
- Authorization checks
- Common access control mistakes

**Key Concepts**:
- Approval mapping pattern
- Authorization validation
- Role-based access
- Event tracking for access changes

**Example Usage**:
```solidity
// Grant access to user
function grantAccess(address user) external onlyOwner {
    approvedUsers[user] = true;
}

// Check authorization before exposing data
function getSensitiveData() external view returns (euint32) {
    require(approvedUsers[msg.sender] || msg.sender == owner, "Not authorized");
    return sensitiveData;
}
```

---

## Advanced Examples

### 1. Anonymous Cultural Crowdfunding

**Location**: `contracts/AnonymousCulturalCrowdfunding.sol`
**Tests**: `test/AnonymousCulturalCrowdfunding.ts`
**Difficulty**: ⭐⭐⭐ Advanced
**Time to Understand**: 60-90 minutes

**What You'll Learn**:
- Real-world privacy-preserving application
- Complex encrypted state management
- Multi-party interactions with encrypted data
- Project management with FHE
- Fund management and refunds
- Privacy guarantees in complex workflows

**Key Concepts**:
- Encrypted financial amounts
- Encrypted comparisons through decryption
- Complex access control
- Event-driven architecture
- State machine patterns

**Application Scenario**:
Privacy-preserving crowdfunding where:
- Project funding targets are encrypted
- Contribution amounts are encrypted
- Only authorized parties can decrypt
- Smart contract computes on encrypted values
- Projects auto-finalize based on encrypted comparisons

**Files**:
- Main Contract: `contracts/AnonymousCulturalCrowdfunding.sol`
- Tests: `test/AnonymousCulturalCrowdfunding.ts`
- Tasks: `tasks/ProjectManager.ts`

---

## Anti-Patterns

### 1. Common Mistakes in FHEVM

**Location**: `contracts/examples/anti-patterns/AntiPatterns.sol`
**Tests**: `test/examples/anti-patterns/` (To be created)
**Difficulty**: ⭐⭐ Intermediate
**Time to Understand**: 20-30 minutes

**What You'll Learn**:
- Missing allowThis() permission
- Missing allow() for users
- Exposing encrypted data without checks
- Using unverified encrypted inputs
- Direct comparisons on encrypted values
- Forgetting to re-permission after operations
- Arithmetic overflow assumptions

**Patterns Demonstrated**:

1. **❌ Missing FHE.allowThis()**
   ```solidity
   // WRONG - Will fail at decryption
   FHE.allow(encrypted, user);
   ```

2. **❌ Exposing Encrypted Data**
   ```solidity
   // WRONG - Privacy violation
   function getData() external view returns (euint32) {
       return sensitiveData;  // No access check!
   }
   ```

3. **❌ Unverified Input**
   ```solidity
   // WRONG - Security vulnerability
   function process(euint32 value) external {
       // No proof validation!
   }
   ```

4. **✅ Correct Pattern**
   ```solidity
   function process(inEuint32 calldata input, bytes calldata proof) external {
       euint32 verified = FHE.asEuint32(input, proof);
       FHE.allowThis(verified);
       FHE.allow(verified, msg.sender);
   }
   ```

---

## Learning Paths

### Path 1: Complete Beginner
**Goal**: Understand FHE basics
**Duration**: 2-3 hours

1. Encrypt Single Value
2. Encrypt Multiple Values
3. Review Anti-Patterns (what not to do)
4. Read DEVELOPER_GUIDE.md

### Path 2: Intermediate Developer
**Goal**: Implement access control
**Duration**: 4-6 hours

1. Review: Encrypt Single/Multiple Values
2. Study: Access Control Patterns
3. Build: Custom access control example
4. Test: Write your own tests

### Path 3: Advanced Developer
**Goal**: Build real-world dApp
**Duration**: 8-12 hours

1. Study: Anonymous Cultural Crowdfunding
2. Understand: Complex state management
3. Review: All tests and patterns
4. Build: Your own FHE application
5. Deploy: Using automation tools

---

## Complexity Breakdown

```
Beginner ⭐
├── Encrypt Single Value
├── Encrypt Multiple Values
├── User Decryption
└── Anti-Patterns (learning)

Intermediate ⭐⭐
├── Access Control
├── Input Proofs
├── Anti-Patterns (understanding)
└── FHE Arithmetic

Advanced ⭐⭐⭐
├── Anonymous Cultural Crowdfunding
├── Complex State Management
├── Privacy-Preserving Computations
└── Production Patterns
```

---

## Test Coverage

Each example includes comprehensive tests demonstrating:

| Aspect | Coverage |
|--------|----------|
| ✅ Success Cases | Multiple scenarios |
| ❌ Failure Cases | Authorization, validation |
| 🔒 Security | Access control, permissions |
| 📊 Edge Cases | Boundaries, limits |
| 📝 Documentation | Inline comments, explanations |

---

## Running Examples

### Compile All Examples
```bash
npm run compile
```

### Run All Tests
```bash
npm run test
```

### Run Specific Test
```bash
npx hardhat test test/examples/basic/EncryptSingleValue.ts
```

### Generate Documentation
```bash
npm run generate-docs
```

---

## Creating Your Own Example

To add a new example:

1. **Create Contract**
   ```
   contracts/examples/category/YourExample.sol
   ```

2. **Create Tests**
   ```
   test/examples/category/YourExample.ts
   ```

3. **Update Automation Scripts**
   - Add to EXAMPLES_CONFIG in `scripts/generate-docs.ts`
   - Add to EXAMPLES_MAP in `scripts/create-example.ts`

4. **Generate Documentation**
   ```bash
   npm run generate-docs
   ```

5. **Test Standalone Repository**
   ```bash
   npx ts-node scripts/create-example.ts your-example ./test-output
   cd test-output && npm install && npm run test
   ```

---

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Example Code**: See `contracts/` and `test/` directories
- **Developer Guide**: `DEVELOPER_GUIDE.md`
- **Automation Tools**: `scripts/README.md`

---

## FAQ

**Q: Which example should I start with?**
A: Start with "Encrypt Single Value" if you're new to FHE.

**Q: How long does it take to understand each example?**
A: Beginner examples: 15-30 min, Intermediate: 30-60 min, Advanced: 60-120 min.

**Q: Can I modify these examples?**
A: Yes! They're designed to be modified and extended for learning.

**Q: Are these examples production-ready?**
A: The core patterns are sound, but always conduct security audits before deploying to mainnet.

**Q: How do I contribute new examples?**
A: Follow the pattern in DEVELOPER_GUIDE.md and create a pull request.

---

**Last Updated**: December 2025
**Version**: 1.0.0
