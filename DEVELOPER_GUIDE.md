# Developer Guide

Welcome to the Anonymous Cultural Crowdfunding project! This comprehensive guide will help you understand, develop, and extend this privacy-preserving crowdfunding platform built on FHEVM.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Architecture](#project-architecture)
- [FHEVM Concepts](#fhevm-concepts)
- [Development Workflow](#development-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Deployment](#deployment)
- [Extending the Project](#extending-the-project)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- **Node.js**: >= 20.x
- **npm**: >= 7.x
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd AnonymousCulturalCrowdfunding

# Install dependencies
npm install

# Compile smart contracts
npm run compile

# Run tests
npm run test
```

### Project Structure

```
AnonymousCulturalCrowdfunding/
├── contracts/                  # Smart contracts
│   └── AnonymousCulturalCrowdfunding.sol
│
├── test/                       # Test suites
│   └── AnonymousCulturalCrowdfunding.ts
│
├── deploy/                     # Deployment scripts
│   └── deploy.ts
│
├── tasks/                      # Hardhat tasks
│   ├── accounts.ts
│   └── ProjectManager.ts
│
├── scripts/                    # Automation scripts
│   ├── generate-docs.ts
│   ├── create-example.ts
│   └── README.md
│
├── docs/                       # Generated documentation
│   ├── SUMMARY.md
│   └── *.md
│
├── hardhat.config.ts          # Hardhat configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
├── README.md                  # Project README
├── DEVELOPER_GUIDE.md         # This file
├── bounty-description.md      # Bounty submission details
└── .gitignore
```

## Project Architecture

### Smart Contract Design

The `AnonymousCulturalCrowdfunding` contract implements a privacy-preserving crowdfunding platform using Fully Homomorphic Encryption.

#### Key Components

**1. State Variables**
```solidity
address public owner;                    // Contract owner
uint32 public projectCounter;            // Project ID counter
mapping(uint32 => CulturalProject) public projects;
mapping(uint32 => mapping(address => AnonymousContribution)) public contributions;
```

**2. Data Structures**
```solidity
struct CulturalProject {
  string title;
  string description;
  string category;
  address creator;
  euint64 targetAmount;      // Encrypted!
  euint64 currentAmount;     // Encrypted!
  uint256 deadline;
  ProjectStatus status;
  bool fundsWithdrawn;
  uint256 createdAt;
  uint32 backerCount;
  string metadataHash;
}

struct AnonymousContribution {
  euint64 amount;            // Encrypted!
  uint256 timestamp;
  bool refunded;
  string supportMessage;
}
```

**3. Core Functions**

- `createProject()` - Create new crowdfunding project
- `contributeAnonymously()` - Make encrypted contribution
- `finalizeProject()` - Finalize project after deadline
- `withdrawFunds()` - Creator withdraws funds (successful project)
- `requestRefund()` - Contributor requests refund (failed project)

### Privacy Model

#### What is Encrypted?
- ✅ Contribution amounts (`euint64`)
- ✅ Project funding targets (`euint64`)
- ✅ Current raised amounts (`euint64`)

#### What is Public?
- ❌ Project titles and descriptions
- ❌ Project creators' addresses
- ❌ Project status and deadlines
- ❌ Number of backers

#### Access Control
- Creators can view their project's encrypted totals
- Contributors can view their own encrypted contributions
- Contract can perform computations on encrypted values
- No one can see individual contribution amounts in plaintext

## FHEVM Concepts

### Understanding Fully Homomorphic Encryption

FHE allows computations on encrypted data without decryption:

```solidity
// Traditional approach - NOT private
uint256 total = amount1 + amount2;  // Plaintext addition

// FHE approach - PRIVATE
euint64 encryptedTotal = FHE.add(encryptedAmount1, encryptedAmount2);
// Computation happens on encrypted values!
```

### Key FHE Operations

#### 1. Creating Encrypted Values

```solidity
// From plaintext (in contract)
euint64 encrypted = FHE.asEuint64(100);

// From user input (with proof)
euint64 encrypted = FHE.fromExternal(inputHandle, inputProof);
```

#### 2. Arithmetic Operations

```solidity
euint64 sum = FHE.add(a, b);        // Addition
euint64 diff = FHE.sub(a, b);       // Subtraction
euint64 product = FHE.mul(a, b);    // Multiplication
```

#### 3. Comparison Operations

```solidity
ebool isEqual = FHE.eq(a, b);       // Equality
ebool isGreater = FHE.gt(a, b);     // Greater than
ebool isLess = FHE.lt(a, b);        // Less than
```

#### 4. Conditional Operations

```solidity
euint64 result = FHE.select(condition, trueValue, falseValue);
```

### Permission System

**Critical Concept**: Every encrypted value needs TWO permissions:

```solidity
// ✅ CORRECT: Grant both permissions
FHE.allowThis(encryptedValue);        // Contract permission
FHE.allow(encryptedValue, user);      // User permission

// ❌ WRONG: Missing allowThis
FHE.allow(encryptedValue, user);      // Will fail!

// ❌ WRONG: Missing user permission
FHE.allowThis(encryptedValue);        // User can't decrypt!
```

**Why Both?**
- `allowThis()` - Contract needs permission to use the value in computations
- `allow(user)` - User needs permission to decrypt and view the value

### Input Proofs

When users send encrypted data to the contract, they must prove correct encryption:

```typescript
// Client-side encryption
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, signer.address)
  .add64(amount)
  .encrypt();

// Submit with proof
await contract
  .connect(signer)
  .contribute(encrypted.handles[0], encrypted.inputProof);
```

**Important**: The signer who creates the encrypted input MUST be the same signer who submits the transaction!

```typescript
// ✅ CORRECT: Same signer
const enc = await fhevm.createEncryptedInput(addr, alice.address).add64(100).encrypt();
await contract.connect(alice).function(enc.handles[0], enc.inputProof);

// ❌ WRONG: Different signers
const enc = await fhevm.createEncryptedInput(addr, alice.address).add64(100).encrypt();
await contract.connect(bob).function(enc.handles[0], enc.inputProof);  // FAILS!
```

### Decryption Requests

To get plaintext values for verification, use decryption requests:

```solidity
// Request decryption
bytes32[] memory cts = new bytes32[](2);
cts[0] = FHE.toBytes32(encryptedValue1);
cts[1] = FHE.toBytes32(encryptedValue2);
FHE.requestDecryption(cts, this.callback.selector);

// Callback receives decrypted values
function callback(uint256 requestId, uint64 value1, uint64 value2) external {
  // Use decrypted values
}
```

## Development Workflow

### 1. Writing Smart Contracts

**Step-by-step process:**

1. **Import FHE libraries**
```solidity
import { FHE, euint64, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
```

2. **Define encrypted state variables**
```solidity
euint64 private encryptedBalance;
```

3. **Create functions using FHE operations**
```solidity
function addAmount(euint64 value) external {
  encryptedBalance = FHE.add(encryptedBalance, value);
  FHE.allowThis(encryptedBalance);
  FHE.allow(encryptedBalance, msg.sender);
}
```

4. **Implement proper access control**
```solidity
function getBalance() external view returns (bytes32) {
  require(msg.sender == owner, "Not authorized");
  return FHE.toBytes32(encryptedBalance);
}
```

### 2. Writing Tests

**Test structure:**

```typescript
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

describe("MyContract", function () {
  let contract;
  let contractAddress;
  let signers;

  before(async function () {
    signers = await ethers.getSigners();
  });

  beforeEach(async function () {
    // Check for FHEVM mock
    if (!fhevm.isMock) {
      this.skip();
    }

    // Deploy contract
    const factory = await ethers.getContractFactory("MyContract");
    contract = await factory.deploy();
    contractAddress = await contract.getAddress();
  });

  it("should work correctly", async function () {
    // Create encrypted input
    const enc = await fhevm
      .createEncryptedInput(contractAddress, signers[0].address)
      .add64(100)
      .encrypt();

    // Call function
    await contract.myFunction(enc.handles[0], enc.inputProof);

    // Verify result
    const encryptedResult = await contract.getResult();
    const decryptedResult = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedResult,
      contractAddress,
      signers[0],
    );

    expect(decryptedResult).to.equal(100);
  });
});
```

### 3. Compiling Contracts

```bash
# Clean previous builds
npm run clean

# Compile contracts
npm run compile

# TypeChain types are auto-generated in types/
```

### 4. Running Tests

```bash
# Run all tests
npm run test

# Run with gas reporting
REPORT_GAS=true npm run test

# Run with coverage
npm run coverage
```

### 5. Linting and Formatting

```bash
# Check code style
npm run lint

# Fix formatting
npm run prettier:write

# Check Solidity style
npm run lint:sol
```

## Testing Guidelines

### Test Organization

Organize tests by functionality:

```typescript
describe("ContractName", function () {
  describe("Feature 1", function () {
    it("✅ should work correctly", async function () {
      // Test correct usage
    });

    it("❌ should reject invalid input", async function () {
      // Test error cases
    });
  });

  describe("Feature 2", function () {
    // More tests
  });
});
```

### Testing Encrypted Values

```typescript
// Create encrypted input
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, signer.address)
  .add64(value)
  .encrypt();

// Submit transaction
const tx = await contract
  .connect(signer)
  .function(encrypted.handles[0], encrypted.inputProof);
await tx.wait();

// Decrypt and verify
const encryptedResult = await contract.getResult();
const decrypted = await fhevm.userDecryptEuint(
  FhevmType.euint64,
  encryptedResult,
  contractAddress,
  signer,
);

expect(decrypted).to.equal(expectedValue);
```

### Testing Access Control

```typescript
it("should deny unauthorized access", async function () {
  await expect(
    contract.connect(unauthorizedUser).restrictedFunction()
  ).to.be.revertedWith("Not authorized");
});
```

### Common Test Patterns

**Testing Encrypted Arithmetic:**
```typescript
it("should add encrypted values correctly", async function () {
  const enc1 = await fhevm.createEncryptedInput(addr, signer.address)
    .add64(50).encrypt();
  const enc2 = await fhevm.createEncryptedInput(addr, signer.address)
    .add64(30).encrypt();

  await contract.add(enc1.handles[0], enc1.inputProof);
  await contract.add(enc2.handles[0], enc2.inputProof);

  const result = await contract.getTotal();
  const decrypted = await fhevm.userDecryptEuint(
    FhevmType.euint64, result, addr, signer
  );

  expect(decrypted).to.equal(80);
});
```

## Deployment

### Local Deployment

```bash
# Terminal 1: Start local blockchain
npm run chain

# Terminal 2: Deploy contracts
npm run deploy:localhost

# Interact with deployed contracts
npx hardhat project:stats --network localhost
```

### Sepolia Testnet Deployment

1. **Set environment variables:**
```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

2. **Deploy:**
```bash
npm run deploy:sepolia
```

3. **Verify:**
```bash
npm run verify:sepolia
```

### Deployment Script Customization

Edit `deploy/deploy.ts` to customize deployment:

```typescript
const deployment = await deploy("YourContract", {
  from: deployer,
  args: [constructorArg1, constructorArg2],
  log: true,
});
```

## Extending the Project

### Adding New Features

**1. Add Contribution Tiers:**

```solidity
struct Tier {
  euint64 minimumAmount;
  string rewardDescription;
}

mapping(uint32 => Tier[]) public projectTiers;

function addTier(uint32 projectId, uint64 minAmount, string calldata reward)
  external
  onlyCreator(projectId)
{
  euint64 encryptedMin = FHE.asEuint64(minAmount);
  projectTiers[projectId].push(Tier(encryptedMin, reward));
  FHE.allowThis(encryptedMin);
}
```

**2. Add Milestone-Based Funding:**

```solidity
struct Milestone {
  string description;
  euint64 targetAmount;
  bool completed;
  bool fundsReleased;
}

mapping(uint32 => Milestone[]) public projectMilestones;
```

**3. Add Voting Mechanisms:**

```solidity
struct Vote {
  euint64 weight;  // Encrypted vote weight
  bool hasVoted;
}

mapping(uint32 => mapping(address => Vote)) public votes;
```

### Creating New Examples

1. Create new contract in `contracts/`
2. Create test file in `test/`
3. Add to automation scripts:
   - Update `scripts/generate-docs.ts`
   - Update `scripts/create-example.ts`
4. Generate documentation
5. Test standalone repository

## Best Practices

### Security

✅ **DO:**
- Always validate input parameters
- Use modifiers for access control
- Grant both FHE permissions (allowThis and allow)
- Implement reentrancy guards where needed
- Check for zero addresses and amounts

❌ **DON'T:**
- Expose encrypted values without authorization
- Skip input validation
- Forget FHE permissions
- Use deprecated Solidity patterns
- Ignore compiler warnings

### Gas Optimization

- Use appropriate data types (`uint32` vs `uint256`)
- Pack struct variables efficiently
- Minimize storage operations
- Use memory for temporary data
- Batch operations where possible

### Code Quality

- Write comprehensive comments
- Use descriptive variable names
- Follow Solidity style guide
- Keep functions focused and small
- Document all public interfaces

## Troubleshooting

### Common Issues

**Issue**: `TypeError: Cannot read property 'handles' of undefined`
**Solution**: Ensure encrypted input is awaited:
```typescript
const enc = await fhevm.createEncryptedInput(...).add64(100).encrypt();
```

**Issue**: `Error: FHE permission denied`
**Solution**: Add both permissions:
```solidity
FHE.allowThis(value);
FHE.allow(value, user);
```

**Issue**: `Error: Input proof verification failed`
**Solution**: Match encryption signer with transaction signer:
```typescript
const enc = await fhevm.createEncryptedInput(addr, alice.address)...
await contract.connect(alice).function(...);  // Same signer!
```

**Issue**: Tests skip on Sepolia
**Solution**: This is expected - tests only run on FHEVM mock:
```typescript
if (!fhevm.isMock) {
  this.skip();  // Tests skip on real networks
}
```

### Getting Help

- **FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Zama Discord**: https://discord.com/invite/zama
- **Community Forum**: https://www.zama.ai/community
- **GitHub Issues**: https://github.com/zama-ai/fhevm

## Resources

### Documentation
- [FHEVM Docs](https://docs.zama.ai/fhevm)
- [Hardhat Docs](https://hardhat.org)
- [Solidity Docs](https://docs.soliditylang.org)
- [OpenZeppelin Docs](https://docs.openzeppelin.com)

### Examples
- [Zama dApps](https://github.com/zama-ai/dapps)
- [FHEVM Hardhat Template](https://github.com/zama-ai/fhevm-hardhat-template)
- [OpenZeppelin Confidential Contracts](https://github.com/OpenZeppelin/openzeppelin-confidential-contracts)

### Community
- [Zama Discord](https://discord.com/invite/zama)
- [Zama Community](https://www.zama.ai/community)
- [Zama Blog](https://www.zama.ai/post)

---

**Happy Building! 🚀**

For questions or contributions, reach out through the Zama community channels.
