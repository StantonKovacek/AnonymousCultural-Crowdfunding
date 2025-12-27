# Getting Started with FHEVM

Welcome to the Anonymous Cultural Crowdfunding FHEVM Examples! This guide will help you get started with privacy-preserving smart contracts.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 20.x
- **npm** >= 7.x
- **Git** (optional, for cloning)
- **Basic Solidity knowledge**
- **Understanding of smart contracts**

## Quick Start

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd AnonymousCulturalCrowdfunding
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Hardhat development environment
- FHEVM libraries and plugins
- TypeScript and testing tools
- Linting and formatting tools

### 3. Compile Smart Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 5 Solidity files successfully
Generating TypeChain types...
Done!
```

### 4. Run Tests

```bash
npm run test
```

You should see all tests passing with ✅ marks.

### 5. Explore the Examples

```bash
# View project structure
ls -la contracts/examples/

# Read example contracts
cat contracts/examples/basic/EncryptSingleValue.sol
```

## Understanding the Project Structure

```
AnonymousCulturalCrowdfunding/
├── contracts/                     # Smart contracts
│   ├── AnonymousCulturalCrowdfunding.sol   # Main example
│   └── examples/                  # Learning examples
│       ├── basic/                 # Encryption basics
│       ├── decrypt/               # Decryption patterns
│       ├── fhe-operations/        # FHE operations
│       ├── access-control/        # Access control
│       └── anti-patterns/         # What NOT to do
│
├── test/                          # Test suites
│   ├── AnonymousCulturalCrowdfunding.ts
│   └── examples/                  # Example tests
│
├── docs/                          # Documentation
│   ├── concepts/                  # FHE concepts explained
│   ├── SUMMARY.md                 # GitBook index
│   └── README.md                  # Documentation home
│
└── scripts/                       # Automation tools
    ├── generate-docs.ts           # Generate documentation
    ├── create-example.ts          # Create standalone repo
    └── create-fhevm-category.ts   # Create category project
```

## Your First FHEVM Contract

Let's understand a basic FHE contract:

```solidity
// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, inEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract MyFirstFHE is SepoliaConfig {
    // ✅ Encrypted storage
    euint32 private secretValue;

    // ✅ Store encrypted value
    function storeSecret(inEuint32 calldata input, bytes calldata proof) external {
        // Validate proof and convert
        euint32 encrypted = FHE.asEuint32(input, proof);

        // Store encrypted
        secretValue = encrypted;

        // ✅ CRITICAL: Grant permissions
        FHE.allowThis(encrypted);        // Contract permission
        FHE.allow(encrypted, msg.sender); // User permission
    }

    // ✅ Retrieve encrypted value
    function getSecret() external view returns (euint32) {
        return secretValue;
    }
}
```

## Key Concepts to Learn

### 1. Encrypted Types

Instead of `uint32`, use `euint32`:

```solidity
uint32 public plainBalance;    // ❌ Everyone sees
euint32 private encBalance;    // ✅ Privacy preserved
```

### 2. Permission Management

**Always grant both permissions:**

```solidity
euint32 value = FHE.asEuint32(input, proof);
FHE.allowThis(value);         // ← Contract needs this
FHE.allow(value, msg.sender);  // ← User needs this
```

### 3. Input Proofs

Users must prove correct encryption:

```typescript
// Client-side
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(secretNumber)
  .encrypt();

await contract.submit(encrypted.handles[0], encrypted.inputProof);
```

```solidity
// Contract-side
function submit(inEuint32 calldata input, bytes calldata proof) external {
    euint32 validated = FHE.asEuint32(input, proof);  // ← Proof verified
}
```

### 4. FHE Operations

Perform computations on encrypted data:

```solidity
euint32 a = FHE.asEuint32(10);
euint32 b = FHE.asEuint32(20);
euint32 sum = FHE.add(a, b);      // ← Still encrypted!
ebool equal = FHE.eq(a, b);       // ← Encrypted comparison
```

## Learning Path

### Beginner Track (2-3 hours)

1. **Understand FHE Basics** (30 min)
   - Read [Understanding FHE](concepts/understanding-fhe.md)
   - Review [EncryptSingleValue.sol](../contracts/examples/basic/EncryptSingleValue.sol)

2. **Run Your First Test** (30 min)
   ```bash
   npx hardhat test test/examples/basic/EncryptSingleValue.ts
   ```
   - Study test code
   - Understand ✅ and ❌ markers

3. **Study Anti-Patterns** (30 min)
   - Read [AntiPatterns.sol](../contracts/examples/anti-patterns/AntiPatterns.sol)
   - Learn what NOT to do

4. **Try Access Control** (30 min)
   - Review [AccessControl.sol](../contracts/examples/access-control/AccessControl.sol)
   - Run access control tests

### Intermediate Track (4-6 hours)

1. **Multiple Encrypted Values** (1 hour)
   - Study [EncryptMultipleValues.sol](../contracts/examples/basic/EncryptMultipleValues.sol)
   - Understand permission management

2. **Decryption Patterns** (2 hours)
   - User Decryption vs Public Decryption
   - When to decrypt
   - Privacy implications

3. **FHE Operations** (1-2 hours)
   - Arithmetic operations
   - Comparison operations
   - Conditional logic

4. **Build Your Own** (1-2 hours)
   - Modify an example
   - Add new functionality
   - Test your changes

### Advanced Track (8-12 hours)

1. **Study Main Application** (3-4 hours)
   - Analyze [AnonymousCulturalCrowdfunding.sol](../contracts/AnonymousCulturalCrowdfunding.sol)
   - Understand complex state management
   - Review comprehensive test suite

2. **Architecture Patterns** (2-3 hours)
   - Multi-party interactions
   - Privacy-preserving logic
   - Event-driven architecture

3. **Build Real Application** (3-5 hours)
   - Design your use case
   - Implement with FHE
   - Write comprehensive tests
   - Deploy to testnet

## Development Workflow

### 1. Writing Contracts

```bash
# Create new contract
touch contracts/MyContract.sol

# Compile
npm run compile

# Check for errors
npm run lint:sol
```

### 2. Writing Tests

```bash
# Create test file
touch test/MyContract.ts

# Run tests
npm run test test/MyContract.ts

# Check coverage
npm run coverage
```

### 3. Code Quality

```bash
# Lint all code
npm run lint

# Format code
npm run prettier:write

# Run all checks
npm run lint && npm run test
```

## Common Commands

### Compilation
```bash
npm run compile         # Compile contracts
npm run clean           # Clean artifacts
npm run typechain       # Generate types
```

### Testing
```bash
npm run test            # Run all tests
npm run test:sepolia    # Test on Sepolia
npm run coverage        # Generate coverage
```

### Code Quality
```bash
npm run lint            # Lint everything
npm run lint:sol        # Lint Solidity
npm run lint:ts         # Lint TypeScript
npm run prettier:check  # Check formatting
npm run prettier:write  # Format code
```

### Deployment
```bash
npm run deploy:localhost   # Deploy locally
npm run deploy:sepolia     # Deploy to Sepolia
npm run verify:sepolia     # Verify on Etherscan
```

### Automation
```bash
npm run generate-docs      # Generate documentation
npx ts-node scripts/create-example.ts <name> <path>
npx ts-node scripts/create-category.ts <category> <path>
```

## Troubleshooting

### Issue: Compilation Fails

**Solution:**
```bash
npm run clean
npm install
npm run compile
```

### Issue: Tests Fail with Permission Errors

**Solution:** Ensure you're granting both permissions:
```solidity
FHE.allowThis(value);
FHE.allow(value, user);
```

### Issue: Input Proof Validation Fails

**Solution:** Ensure signer matches:
```typescript
// Same signer for both
const enc = await fhevm.createEncryptedInput(addr, alice.address)...
await contract.connect(alice).function(...)  // ← Same signer
```

### Issue: Cannot Decrypt Value

**Solution:** Check that `FHE.allow()` was called:
```solidity
FHE.allow(encryptedValue, msg.sender);
```

## Getting Help

### Documentation
- 📖 [FHEVM Docs](https://docs.zama.ai/fhevm)
- 📚 [Developer Guide](../DEVELOPER_GUIDE.md)
- 📝 [Examples Index](../EXAMPLES.md)

### Community
- 💬 [Zama Discord](https://discord.com/invite/zama)
- 🤝 [Community Forum](https://www.zama.ai/community)
- 🐛 [GitHub Issues](https://github.com/zama-ai/fhevm)

## Next Steps

Now that you're set up:

1. ✅ Run all tests to verify setup
2. 📖 Read [Understanding FHE](concepts/understanding-fhe.md)
3. 🔍 Study [EncryptSingleValue example](../contracts/examples/basic/EncryptSingleValue.sol)
4. 🧪 Run example tests and study the code
5. ⚠️ Review [Anti-Patterns](../contracts/examples/anti-patterns/AntiPatterns.sol)
6. 🚀 Build your first FHE contract!

## Quick Reference

### Essential FHE Operations

```solidity
// Type conversion
euint32 enc = FHE.asEuint32(plainValue);
euint32 enc = FHE.asEuint32(inputValue, proof);

// Arithmetic
euint32 sum = FHE.add(a, b);
euint32 diff = FHE.sub(a, b);
euint32 product = FHE.mul(a, b);

// Comparison
ebool equal = FHE.eq(a, b);
ebool greater = FHE.gt(a, b);
ebool less = FHE.lt(a, b);

// Permissions
FHE.allowThis(encryptedValue);
FHE.allow(encryptedValue, userAddress);

// Decryption (use sparingly!)
uint32 plaintext = FHE.decrypt(encryptedValue);
```

---

**Happy Learning! 🎓**

Remember: The best way to learn is by doing. Start with simple examples and gradually work your way up to complex applications. Don't hesitate to ask for help in the community!
