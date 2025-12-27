// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, euint64, inEuint32, inEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Multiple Values Example
/// @notice Demonstrates decryption of multiple related values
/// @dev Shows how to decrypt multiple values for contract verification
contract PublicDecryptMultipleValues is SepoliaConfig {
    /// @notice Structure for encrypted financial data
    struct EncryptedTransaction {
        euint64 amount;
        euint32 fee;
        euint32 gasLimit;
        uint256 timestamp;
        bool decrypted;
    }

    /// @notice Storage for encrypted transactions
    mapping(uint256 => EncryptedTransaction) private transactions;

    /// @notice Transaction counter
    uint256 private txCounter;

    /// @notice Owner who can decrypt
    address public owner;

    /// @notice Last decrypted values
    struct DecryptedValues {
        uint64 amount;
        uint32 fee;
        uint32 gasLimit;
    }

    mapping(uint256 => DecryptedValues) private decryptedData;

    /// @notice Event for transaction stored
    event TransactionStored(uint256 indexed txId, uint256 timestamp);

    /// @notice Event for transaction decrypted
    event TransactionDecrypted(uint256 indexed txId, uint64 amount, uint32 fee, uint32 gas);

    constructor() {
        owner = msg.sender;
        txCounter = 0;
    }

    /// @notice Store encrypted transaction data
    /// @dev Store multiple related encrypted values
    /// @param amount Transaction amount (encrypted)
    /// @param fee Transaction fee (encrypted)
    /// @param gasLimit Gas limit (encrypted)
    /// @param amountProof Proof for amount
    /// @param feeProof Proof for fee
    /// @param gasProof Proof for gas limit
    function storeTransaction(
        inEuint64 calldata amount,
        inEuint32 calldata fee,
        inEuint32 calldata gasLimit,
        bytes calldata amountProof,
        bytes calldata feeProof,
        bytes calldata gasProof,
    ) external {
        // Convert each encrypted input
        euint64 encAmount = FHE.asEuint64(amount, amountProof);
        euint32 encFee = FHE.asEuint32(fee, feeProof);
        euint32 encGas = FHE.asEuint32(gasLimit, gasProof);

        // Store encrypted transaction
        txCounter++;
        transactions[txCounter] = EncryptedTransaction({
            amount: encAmount,
            fee: encFee,
            gasLimit: encGas,
            timestamp: block.timestamp,
            decrypted: false,
        });

        // Grant permissions for all values
        FHE.allowThis(encAmount);
        FHE.allow(encAmount, msg.sender);

        FHE.allowThis(encFee);
        FHE.allow(encFee, msg.sender);

        FHE.allowThis(encGas);
        FHE.allow(encGas, msg.sender);

        emit TransactionStored(txCounter, block.timestamp);
    }

    /// @notice Decrypt all transaction values
    /// @dev ✅ CORRECT: Decrypt multiple values and verify
    /// @param txId Transaction ID to decrypt
    function decryptTransaction(uint256 txId) external returns (bool) {
        require(msg.sender == owner, "Only owner can decrypt");
        require(txId > 0 && txId <= txCounter, "Invalid transaction ID");
        require(!transactions[txId].decrypted, "Already decrypted");

        EncryptedTransaction storage tx = transactions[txId];

        // ✅ PUBLIC DECRYPTION: Decrypt all values
        uint64 amount = FHE.decrypt(tx.amount);
        uint32 fee = FHE.decrypt(tx.fee);
        uint32 gas = FHE.decrypt(tx.gasLimit);

        // Store decrypted values
        decryptedData[txId] = DecryptedValues({
            amount: amount,
            fee: fee,
            gasLimit: gas,
        });

        // Mark as decrypted
        tx.decrypted = true;

        emit TransactionDecrypted(txId, amount, fee, gas);

        return true;
    }

    /// @notice Verify transaction total
    /// @dev Demonstrates computation on decrypted values
    /// @param txId Transaction ID
    /// @return Total amount including fee
    function verifyTransactionTotal(uint256 txId) external returns (uint64) {
        require(msg.sender == owner, "Only owner");
        require(txId > 0 && txId <= txCounter, "Invalid transaction ID");

        EncryptedTransaction storage tx = transactions[txId];

        // Decrypt all values needed for calculation
        uint64 amount = FHE.decrypt(tx.amount);
        uint32 fee = FHE.decrypt(tx.fee);

        // Calculate total (amount + fee)
        uint64 total = amount + uint64(fee);

        // Store decrypted values for reference
        DecryptedValues storage decrypted = decryptedData[txId];
        decrypted.amount = amount;
        decrypted.fee = fee;

        return total;
    }

    /// @notice Check if total exceeds limit
    /// @dev Demonstrates conditional logic based on decrypted values
    /// @param txId Transaction ID
    /// @param limit Amount limit to check
    /// @return bool indicating if total exceeds limit
    function exceedsLimit(uint256 txId, uint64 limit) external returns (bool) {
        require(msg.sender == owner, "Only owner");
        require(txId > 0 && txId <= txCounter, "Invalid transaction ID");

        EncryptedTransaction storage tx = transactions[txId];

        // Decrypt for comparison
        uint64 amount = FHE.decrypt(tx.amount);
        uint32 fee = FHE.decrypt(tx.fee);
        uint64 total = amount + uint64(fee);

        return total > limit;
    }

    /// @notice Get decrypted transaction values
    /// @param txId Transaction ID
    /// @return The decrypted values structure
    function getDecryptedTransaction(uint256 txId)
        external
        view
        returns (DecryptedValues memory)
    {
        require(txId > 0 && txId <= txCounter, "Invalid transaction ID");
        require(transactions[txId].decrypted, "Transaction not decrypted");

        return decryptedData[txId];
    }

    /// @notice Check if transaction is decrypted
    /// @param txId Transaction ID
    /// @return bool indicating if decrypted
    function isDecrypted(uint256 txId) external view returns (bool) {
        require(txId > 0 && txId <= txCounter, "Invalid transaction ID");
        return transactions[txId].decrypted;
    }

    /// @notice Get total transaction count
    /// @return Number of transactions stored
    function getTransactionCount() external view returns (uint256) {
        return txCounter;
    }
}
