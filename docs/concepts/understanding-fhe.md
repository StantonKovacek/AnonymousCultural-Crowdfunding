# Understanding Fully Homomorphic Encryption (FHE)

## What is FHE?

Fully Homomorphic Encryption (FHE) is a revolutionary cryptographic technique that allows computations to be performed on encrypted data **without ever decrypting it**. This means you can process sensitive information while keeping it completely private.

## The Privacy Problem in Traditional Smart Contracts

### Traditional Approach (No Privacy)
```solidity
// Everyone can see the balance!
uint256 public balance = 1000;

function transfer(address to, uint256 amount) public {
    balance -= amount;  // Amount is visible to everyone
}
```

**Problem**: All data on blockchain is public. Anyone can see balances, amounts, votes, bids, etc.

### FHE Approach (Privacy-Preserving)
```solidity
// Balance is encrypted!
euint64 private encryptedBalance;

function transfer(address to, inEuint64 calldata encryptedAmount, bytes calldata proof) public {
    euint64 amount = FHE.asEuint64(encryptedAmount, proof);
    encryptedBalance = FHE.sub(encryptedBalance, amount);  // Operates on encrypted data!
}
```

**Solution**: Data stays encrypted on-chain. Computations happen without revealing plaintext.

## Key Concepts

### 1. Encrypted Data Types

FHEVM provides encrypted equivalents of standard Solidity types:

| Plaintext Type | Encrypted Type | Description |
|----------------|----------------|-------------|
| `uint8` | `euint8` | 8-bit encrypted unsigned integer |
| `uint32` | `euint32` | 32-bit encrypted unsigned integer |
| `uint64` | `euint64` | 64-bit encrypted unsigned integer |
| `bool` | `ebool` | Encrypted boolean |

### 2. Homomorphic Operations

"Homomorphic" means you can perform operations on encrypted data:

```solidity
euint32 a = FHE.asEuint32(10);  // Encrypted 10
euint32 b = FHE.asEuint32(20);  // Encrypted 20
euint32 c = FHE.add(a, b);      // Encrypted 30 (without decryption!)
```

**Available Operations:**
- **Arithmetic**: `FHE.add()`, `FHE.sub()`, `FHE.mul()`
- **Comparison**: `FHE.eq()`, `FHE.ne()`, `FHE.gt()`, `FHE.lt()`, `FHE.ge()`, `FHE.le()`
- **Logical**: `FHE.and()`, `FHE.or()`, `FHE.not()`
- **Conditional**: `FHE.select()`

### 3. Encryption Binding

Each encrypted value is **bound** to a specific `[contract, user]` pair:

```
EncryptedValue = Encrypt(plaintext, contractAddress, userAddress)
```

This ensures:
- ✅ Values encrypted for Contract A cannot be used in Contract B
- ✅ Values encrypted by User 1 cannot be submitted by User 2
- ✅ Protection against replay attacks

### 4. Input Proofs

When users send encrypted data to a contract, they must provide a **zero-knowledge proof** that:
1. They encrypted the data correctly
2. The data is bound to the correct contract and user

```typescript
// Client-side encryption with proof
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add32(secretValue)
  .encrypt();

// encrypted.handles[0]   - The encrypted value
// encrypted.inputProof   - The zero-knowledge proof
```

```solidity
// Contract validates proof
function submitValue(inEuint32 calldata input, bytes calldata proof) external {
    euint32 validated = FHE.asEuint32(input, proof);  // Proof checked here!
}
```

## The FHE Workflow

### Step 1: Client Encrypts Data
```typescript
const secretAmount = 1000;
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add64(secretAmount)
  .encrypt();
```

### Step 2: Submit to Contract
```typescript
await contract
  .connect(alice)
  .deposit(encrypted.handles[0], encrypted.inputProof);
```

### Step 3: Contract Processes (Encrypted)
```solidity
function deposit(inEuint64 calldata amount, bytes calldata proof) external {
    // Validate and convert
    euint64 encAmount = FHE.asEuint64(amount, proof);

    // Add to balance (still encrypted!)
    balance[msg.sender] = FHE.add(balance[msg.sender], encAmount);

    // Grant permissions
    FHE.allowThis(balance[msg.sender]);
    FHE.allow(balance[msg.sender], msg.sender);
}
```

### Step 4: User Decrypts (If Needed)
```typescript
const encryptedBalance = await contract.getBalance();
const decrypted = await fhevm.userDecryptEuint(
    FhevmType.euint64,
    encryptedBalance,
    contractAddress,
    alice
);
console.log("My balance:", decrypted);
```

## Permission System

### Critical Rule: Always Grant Both Permissions

```solidity
euint32 encrypted = FHE.asEuint32(value, proof);

// ✅ ALWAYS DO THIS:
FHE.allowThis(encrypted);        // Contract can use value
FHE.allow(encrypted, msg.sender); // User can decrypt value
```

**Why Both?**
- `allowThis()` - Contract needs permission for future operations
- `allow(user)` - User needs permission to decrypt and view

### Permission Mistakes

```solidity
// ❌ WRONG: Missing allowThis
FHE.allow(encrypted, user);  // User gets permission
// Result: Contract can't use value later → operations fail

// ❌ WRONG: Missing allow(user)
FHE.allowThis(encrypted);  // Contract gets permission
// Result: User can't decrypt → privacy violation if they should see it

// ✅ CORRECT: Both permissions
FHE.allowThis(encrypted);
FHE.allow(encrypted, user);
```

## Decryption Options

### Option 1: User Decryption (Private)
User decrypts on their client - value stays private:

```solidity
function getMyBalance() external view returns (euint64) {
    return balances[msg.sender];  // Returns encrypted value
}
```

```typescript
const encrypted = await contract.getMyBalance();
const plaintext = await fhevm.userDecryptEuint(...);  // Decrypt client-side
```

**Use when**: User needs to see their own private data

### Option 2: Public Decryption (Revealed On-Chain)
Contract decrypts - value becomes public forever:

```solidity
function verifyMinimum(uint64 minimum) external returns (bool) {
    uint64 value = FHE.decrypt(encryptedValue);  // ⚠️ Now public!
    return value >= minimum;
}
```

**Use when**: Contract logic requires plaintext value

**WARNING**: Once decrypted on-chain, privacy is lost forever!

## Security Properties

### What FHE Protects

✅ **Encrypted Values**: No one can see plaintext
✅ **Computation Results**: Results stay encrypted
✅ **Intermediate States**: All operations are opaque
✅ **User Privacy**: Individual data remains confidential

### What FHE Doesn't Hide

❌ **Transaction Patterns**: Who interacts with contract
❌ **Function Calls**: Which functions are called
❌ **Gas Usage**: Computational costs
❌ **Timing**: When transactions occur

## Practical Use Cases

### 1. Private Voting
```solidity
mapping(address => ebool) private votes;

function vote(inEbool calldata encryptedVote, bytes calldata proof) external {
    ebool vote = FHE.asBool(encryptedVote, proof);
    votes[msg.sender] = vote;
    // Votes remain encrypted!
}
```

### 2. Confidential Auctions
```solidity
mapping(address => euint64) private bids;

function placeBid(inEuint64 calldata encryptedBid, bytes calldata proof) external {
    euint64 bid = FHE.asEuint64(encryptedBid, proof);
    bids[msg.sender] = bid;
    // Bids stay secret until reveal!
}
```

### 3. Private Financial Transactions
```solidity
mapping(address => euint64) private balances;

function transfer(address to, inEuint64 calldata encAmount, bytes calldata proof) external {
    euint64 amount = FHE.asEuint64(encAmount, proof);
    balances[msg.sender] = FHE.sub(balances[msg.sender], amount);
    balances[to] = FHE.add(balances[to], amount);
    // Transfer amounts are private!
}
```

## Common Misconceptions

### Myth 1: "FHE is too slow"
**Reality**: FHEVM is optimized for practical use. Simple operations are fast enough for most applications.

### Myth 2: "All data should be encrypted"
**Reality**: Only encrypt what needs privacy. Public data (like usernames) can stay plaintext.

### Myth 3: "Encrypted values are immutable"
**Reality**: You can perform operations and update encrypted values just like plaintext.

### Myth 4: "FHE makes everything private"
**Reality**: FHE protects data values, but transaction patterns and function calls are still visible.

## Best Practices

### 1. Encrypt Only What Needs Privacy
```solidity
struct User {
    string public username;       // No privacy needed
    euint64 private balance;      // Privacy needed
    address public walletAddress; // No privacy needed
}
```

### 2. Always Grant Permissions
```solidity
euint32 value = FHE.asEuint32(input, proof);
FHE.allowThis(value);        // ← Never forget!
FHE.allow(value, msg.sender); // ← Never forget!
```

### 3. Minimize Public Decryption
```solidity
// ❌ BAD: Unnecessary decryption
uint32 amount = FHE.decrypt(encryptedAmount);
emit Transfer(msg.sender, to, amount);  // Now public!

// ✅ GOOD: Keep encrypted
emit Transfer(msg.sender, to, 0);  // Don't reveal amount
```

### 4. Validate Input Proofs
```solidity
// ✅ ALWAYS: Use proofs
euint32 value = FHE.asEuint32(input, proof);

// ❌ NEVER: Skip proof validation
euint32 value = input;  // Security vulnerability!
```

## Next Steps

- 📖 Read [Encryption Basics](encryption-basics.md)
- 🔐 Learn [Access Control](access-control.md)
- 🧪 Try [Basic Examples](../examples/basic/)
- ⚠️ Study [Anti-Patterns](../anti-patterns/)

---

**Remember**: FHE enables privacy-preserving computation, but use it wisely. Encrypt only what needs protection, and always manage permissions correctly!
