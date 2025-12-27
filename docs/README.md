# FHEVM Examples Documentation

Welcome to the comprehensive documentation for the Anonymous Cultural Crowdfunding project - a production-ready example of privacy-preserving smart contracts using Fully Homomorphic Encryption.

## What is FHEVM?

Fully Homomorphic Encryption Virtual Machine (FHEVM) is a groundbreaking technology that enables smart contracts to perform computations on encrypted data without ever revealing the plaintext. This documentation covers practical examples, patterns, and best practices.

## Key Features of This Project

- 🔐 **Privacy-First Design** - All sensitive data encrypted on-chain
- 📚 **Comprehensive Examples** - From basic to advanced FHE patterns
- 🧪 **Extensive Testing** - Over 20+ test cases with explanatory comments
- 📖 **Detailed Documentation** - Clear explanations of FHE concepts
- ⚙️ **Automation Tools** - Scripts for scaffolding and documentation generation
- 🎓 **Educational Focus** - Learn by examples and anti-patterns

## Core Concepts

### Encrypted Data Types

FHEVM provides encrypted types that support operations on encrypted data:

- `euint32` - 32-bit encrypted unsigned integer
- `euint64` - 64-bit encrypted unsigned integer
- `ebool` - Encrypted boolean value

### Essential Operations

**Permission Management** (Most Important!)
```solidity
// ALWAYS do this for encrypted values:
FHE.allowThis(encryptedValue);        // Allow contract to use value
FHE.allow(encryptedValue, user);      // Allow user to decrypt value
```

**Arithmetic Operations**
```solidity
euint64 sum = FHE.add(a, b);          // Addition
euint64 diff = FHE.sub(a, b);         // Subtraction
euint64 product = FHE.mul(a, b);      // Multiplication
```

**Comparison Operations**
```solidity
ebool equal = FHE.eq(a, b);           // Equality
ebool greater = FHE.gt(a, b);         // Greater than
ebool less = FHE.lt(a, b);            // Less than
```

## Project Structure

```
docs/
├── concepts/                 # FHE concepts explained
├── examples/                 # Working examples by category
├── anti-patterns/           # Common mistakes to avoid
├── development/             # Development guides
├── automation/              # Automation script docs
├── reference/               # API and pattern reference
└── SUMMARY.md               # GitBook index
```

## Quick Navigation

### For Beginners
1. Start with [Understanding FHE](concepts/understanding-fhe.md)
2. Read [Encryption Basics](concepts/encryption-basics.md)
3. Try [Encrypt Single Value](examples/basic/encrypt-single-value.md)
4. Review [Anti-Patterns](anti-patterns/anti-patterns.md) to learn what NOT to do

### For Intermediate Developers
1. Explore [Access Control Patterns](examples/access-control/access-control.md)
2. Study [Permission System](concepts/permission-system.md)
3. Review [Best Practices](reference/best-practices.md)
4. Understand [Input Proofs](concepts/input-proofs.md)

### For Advanced Users
1. Study [Anonymous Cultural Crowdfunding](examples/advanced/anonymous-cultural-crowdfunding.md)
2. Explore [FHE Operations](reference/fhe-operations.md)
3. Review [Contract Patterns](reference/patterns.md)
4. Check [Testing Guide](development/testing.md)

## Important Patterns

### ✅ Pattern #1: Always Grant Both Permissions

```solidity
euint64 encrypted = FHE.asEuint64(value);
FHE.allowThis(encrypted);        // Contract needs this
FHE.allow(encrypted, msg.sender); // User needs this
```

### ✅ Pattern #2: Validate Input with Proofs

```solidity
// Good: Using proven encrypted input
euint32 value = FHE.asEuint32(inputHandle, inputProof);

// Bad: Using unproven input
euint32 value = inputHandle;  // Don't do this!
```

### ✅ Pattern #3: Match Signer in Encryption

```typescript
// Good: Same signer for encryption and transaction
const enc = await fhevm.createEncryptedInput(addr, alice.address)...
await contract.connect(alice).function(enc.handles[0], enc.inputProof);

// Bad: Different signers
const enc = await fhevm.createEncryptedInput(addr, alice.address)...
await contract.connect(bob).function(enc.handles[0], enc.inputProof); // FAILS!
```

### ✅ Pattern #4: Access Control for Encrypted Data

```solidity
function getSecret() external view returns (euint32) {
    require(msg.sender == owner, "Not authorized");
    return secret;
}
```

## Common Mistakes to Avoid

❌ **Missing allowThis()** - Will fail during decryption
❌ **Missing allow(user)** - User cannot decrypt value
❌ **Forgetting input proof** - Security vulnerability
❌ **Wrong signer** - Proof won't validate
❌ **Exposing encrypted data** - Privacy violation
❌ **Direct comparisons** - Encrypted values are opaque

## Examples Overview

### Basic Examples

| Example | Concept | Difficulty |
|---------|---------|-----------|
| Encrypt Single Value | Basic encryption workflow | ⭐ Beginner |
| Encrypt Multiple Values | Managing multiple encrypted values | ⭐ Beginner |
| User Decryption | User-side decryption patterns | ⭐ Beginner |
| Public Decryption | Contract-side decryption | ⭐ Beginner |

### Advanced Examples

| Example | Concept | Difficulty |
|---------|---------|-----------|
| Access Control | Permission-based access patterns | ⭐⭐ Intermediate |
| Input Proofs | Zero-knowledge proof validation | ⭐⭐ Intermediate |
| Anonymous Crowdfunding | Complete privacy-preserving application | ⭐⭐⭐ Advanced |

## Development Workflow

1. **Learn** - Study the concepts and examples
2. **Understand** - Review test cases and comments
3. **Experiment** - Modify examples and run tests
4. **Build** - Create your own FHE contracts
5. **Deploy** - Use automation tools for deployment

## Testing Your Code

Run the comprehensive test suite:

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# View test coverage
npm run coverage

# Run linter
npm run lint
```

Each test includes comments explaining:
- ✅ What the test validates
- ❌ What mistakes are being prevented
- 📝 Why this pattern is important

## Automation Tools

### Generate Documentation
```bash
npm run generate-docs
```

### Create Standalone Examples
```bash
npx ts-node scripts/create-example.ts anonymous-cultural-crowdfunding ./output
```

### Create Category Projects
```bash
npx ts-node scripts/create-category.ts basic ./output
```

## Getting Help

- 📚 [FHEVM Official Docs](https://docs.zama.ai/fhevm)
- 💬 [Zama Discord Community](https://discord.com/invite/zama)
- 🤝 [Zama Community Forum](https://www.zama.ai/community)
- 🐛 [GitHub Issues](https://github.com/zama-ai/fhevm)

## Key Takeaways

1. **Always Grant Permissions** - Both `allowThis()` and `allow()` are required
2. **Use Input Proofs** - Always validate encrypted inputs
3. **Match Signers** - Same signer for encryption and transaction
4. **Control Access** - Check authorization before exposing encrypted data
5. **Test Thoroughly** - Use the provided test patterns
6. **Learn from Examples** - Study working code before writing your own
7. **Understand Anti-Patterns** - Know what NOT to do

## Next Steps

Start your journey into FHE:

1. **Read** → [Understanding FHE](concepts/understanding-fhe.md)
2. **Try** → [Getting Started](getting-started.md)
3. **Build** → [Anonymous Cultural Crowdfunding](examples/advanced/anonymous-cultural-crowdfunding.md)
4. **Deploy** → [Deployment Guide](development/deployment.md)

---

**Built with ❤️ for privacy-preserving blockchain development**

**Last Updated**: December 2025
**Status**: Ready for Production
