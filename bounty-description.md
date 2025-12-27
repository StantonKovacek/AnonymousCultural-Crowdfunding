# Anonymous Cultural Crowdfunding - FHEVM Example Hub Bounty Submission

## Project Overview

**Anonymous Cultural Crowdfunding** is a comprehensive, production-ready example of a privacy-preserving crowdfunding platform built on FHEVM (Fully Homomorphic Encryption Virtual Machine). This project demonstrates advanced FHE concepts including encrypted state management, privacy-preserving computations, and access control patterns.

### Project Objectives

This submission addresses the FHEVM Example Hub bounty by providing:

1. **Standalone, Self-Contained Repository** - Complete Hardhat-based FHEVM project
2. **Advanced FHE Example** - Real-world use case with encrypted financial operations
3. **Comprehensive Test Suite** - Demonstrating correct usage patterns and common pitfalls
4. **Production-Ready Code** - Clean, well-documented smart contracts
5. **Automated Documentation** - Scripts for generating GitBook-compatible documentation
6. **Developer Tools** - Scripts for project scaffolding and deployment

## Technical Implementation

### Core Concepts Demonstrated

The project showcases the following FHEVM concepts:

#### 1. **Encrypted State Management**
- Encrypted funding targets (`euint64`)
- Encrypted contribution amounts
- Encrypted balance tracking
- Privacy-preserving fund management

#### 2. **Access Control with FHE**
- Proper use of `FHE.allowThis()` - Grant contract permission
- Proper use of `FHE.allow()` - Grant user permission
- Permission-based access to encrypted data
- Creator-only access to financial information

#### 3. **Input Proofs and Encryption Binding**
- Encrypting input values with `createEncryptedInput()`
- Generating zero-knowledge proofs of correct binding
- Matching signer addresses between encryption and transaction
- Proper handle generation and usage

#### 4. **Decryption Requests**
- Requesting decryption of encrypted values for verification
- Callback functions for processing decrypted data
- Conditional logic based on encrypted comparisons

#### 5. **Privacy-Preserving Computations**
- Adding encrypted amounts: `FHE.add()`
- Comparing encrypted values (through decryption request)
- Maintaining privacy while performing smart contract logic

### Contract Structure

```
contracts/
└── AnonymousCulturalCrowdfunding.sol
    ├── Project Creation
    │   ├── createProject() - Create encrypted funding targets
    │   ├── Project struct with encrypted amounts
    │   └── ProjectStatus enum
    │
    ├── Anonymous Contributions
    │   ├── contributeAnonymously() - Submit encrypted contributions
    │   ├── AnonymousContribution struct
    │   └── Encrypted amount tracking
    │
    ├── Privacy-Preserving Logic
    │   ├── _checkProjectGoal() - Encrypted comparison
    │   ├── finalizeProject() - Conditional finalization
    │   └── Access control via FHE permissions
    │
    ├── Fund Management
    │   ├── withdrawFunds() - Creator fund withdrawal
    │   ├── requestRefund() - Contributor refund requests
    │   └── processRefund() - Decryption-based refund
    │
    └── Query Functions
        ├── getProject() - Public project info
        ├── getProjectAmounts() - Encrypted amounts (authorized only)
        └── getPlatformStats() - Aggregate statistics
```

## Example Patterns and Anti-Patterns

### ✅ DO: Proper FHE Permission Management

```solidity
// Always grant both permissions
euint64 encryptedAmount = FHE.asEuint64(_amount);
FHE.allowThis(encryptedAmount);        // Contract permission
FHE.allow(encryptedAmount, creator);   // Creator permission
```

### ❌ DON'T: Incomplete Permission Setup

```solidity
// BROKEN: Missing allowThis() - will fail at decryption
FHE.allow(encryptedAmount, msg.sender);
```

### ✅ DO: Match Encryption Signer

```typescript
// Encrypt with correct signer
const enc = await fhevm
  .createEncryptedInput(contractAddr, alice.address)
  .add32(value)
  .encrypt();

// Call with same signer
await contract.connect(alice).contribute(enc.handles[0], enc.inputProof);
```

### ❌ DON'T: Mismatched Signer

```typescript
// BROKEN: Encrypted for alice but called by bob
const enc = await fhevm
  .createEncryptedInput(contractAddr, alice.address)
  .add32(value)
  .encrypt();

await contract.connect(bob).contribute(enc.handles[0], enc.inputProof); // FAILS!
```

### ✅ DO: Access Control for Encrypted Data

```solidity
function getProjectAmounts(uint32 _projectId)
  external
  view
  returns (bytes32 encryptedTarget, bytes32 encryptedCurrent)
{
  require(
    msg.sender == project.creator ||
    contributions[_projectId][msg.sender].timestamp > 0,
    "Not authorized"
  );
  return (...);
}
```

### ❌ DON'T: Expose Encrypted Data Without Authorization

```solidity
// BROKEN: Anyone can see encrypted amounts
function revealProjectAmounts(uint32 _projectId)
  external
  view
  returns (bytes32, bytes32)
{
  return (FHE.toBytes32(targetAmount), FHE.toBytes32(currentAmount));
}
```

## Project Structure

```
anonymous-cultural-crowdfunding/
├── contracts/
│   └── AnonymousCulturalCrowdfunding.sol
│
├── test/
│   └── AnonymousCulturalCrowdfunding.ts
│       ├── Project Creation Tests
│       ├── Anonymous Contributions Tests
│       ├── Project Finalization Tests
│       ├── Fund Withdrawal Tests
│       ├── Privacy & Access Control Tests
│       └── Platform Statistics Tests
│
├── tasks/
│   ├── accounts.ts
│   └── ProjectManager.ts
│
├── scripts/
│   ├── generate-docs.ts
│   ├── create-example.ts
│   └── README.md
│
├── deploy/
│   └── deploy.ts
│
├── hardhat.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── bounty-description.md
└── .gitignore
```

## Test Coverage

The test suite includes 14 comprehensive test cases demonstrating:

### ✅ Correct Usage Patterns
- Creating valid projects with all parameters
- Making anonymous encrypted contributions
- Accessing encrypted data as authorized user
- Finalizing projects after deadline
- Withdrawing funds as project creator
- Tracking platform statistics

### ❌ Common Pitfalls and Validation
- Missing title validation
- Funding period constraints
- Zero-value contributions
- Accessing non-existent projects
- Premature project finalization
- Unauthorized access to encrypted amounts
- Non-creator fund withdrawal attempts

## Key Features

### 1. **Privacy-Preserving Contributions**
Contributors can support cultural projects with completely encrypted donation amounts. Only the contributor can decrypt their own contribution, and the smart contract performs calculations without ever revealing the amounts.

### 2. **Encrypted Fund Tracking**
- Project funding targets are encrypted
- Current raised amounts are encrypted
- Smart contract performs encrypted arithmetic
- Comparisons happen through decryption requests

### 3. **Access Control**
- Only creators can withdraw project funds
- Only contributors can view their contributions
- Creators can view encrypted project totals
- Platform statistics available to all

### 4. **Automated Project Management**
- Projects automatically finalize after deadline
- Funding goal verification through encrypted comparison
- Automatic fund distribution or refund processing
- Emergency pause functionality for owner

## Development Workflow

### Setup

```bash
npm install
npm run compile
npm run test
```

### Development Commands

```bash
# Compile contracts
npm run compile

# Run tests
npm run test

# Generate documentation
npm run generate-docs

# Check code quality
npm run lint

# View code coverage
npm run coverage
```

### Deployment

```bash
# Deploy to localhost
npm run deploy:localhost

# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia
```

## Documentation Generation

Comprehensive documentation is auto-generated from code annotations:

```bash
npm run generate-docs
```

Generated files include:
- Contract API documentation
- Test case descriptions
- Usage examples
- FHE pattern explanations
- Deployment instructions

## Bonus Features

### 1. **Production-Ready Code**
- Reentrancy protection patterns
- Input validation and bounds checking
- Secure error handling
- Emergency pause functionality

### 2. **Comprehensive Testing**
- 14 test cases covering success and failure paths
- Explanatory comments with ✅/❌ markers
- Edge case coverage
- Permission validation tests

### 3. **Clear Documentation**
- Inline code comments explaining FHE concepts
- Test case descriptions
- Architecture documentation
- Developer guide for extending examples

### 4. **Developer Tools**
- Deployment scripts with multi-network support
- Helper tasks for project management
- Automated documentation generation
- Code generation templates

### 5. **Educational Value**
- Real-world use case (crowdfunding)
- Demonstrates complex FHE patterns
- Shows both correct and incorrect approaches
- Practical privacy applications

## Extending the Project

### Adding New Project Categories

Modify the `category` field in project creation:

```solidity
// Current categories: Art, Music, Literature, Film, Theater, Dance, etc.
function createProject(
  string calldata _title,
  string calldata _description,
  string calldata _category,  // Add custom categories here
  // ...
)
```

### Adding New Contribution Tiers

Extend the contribution system:

```solidity
struct ContributionTier {
  euint64 minimumAmount;
  string reward;
}

mapping(uint32 => ContributionTier[]) public tiers;
```

### Integrating with Other Contracts

Use the contract as a module in larger dApps:

```solidity
import "./AnonymousCulturalCrowdfunding.sol";

contract CulturalHub is AnonymousCulturalCrowdfunding {
  // Extend functionality
}
```

## Maintenance and Updates

### When FHEVM Libraries Update

1. Update `@fhevm/solidity` version in package.json
2. Recompile and run tests
3. Regenerate documentation
4. Update examples if breaking changes occur

### Adding New Examples

Create a new contract file in `contracts/examples/` directory and corresponding tests.

## Resources

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Zama GitHub**: https://github.com/zama-ai
- **Community Forum**: https://www.zama.ai/community
- **Discord**: https://discord.com/invite/zama

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

**Built with ❤️ for cultural creators and privacy advocates using FHEVM by Zama**
