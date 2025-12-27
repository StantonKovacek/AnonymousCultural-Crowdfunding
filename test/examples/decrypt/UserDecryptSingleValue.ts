import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { UserDecryptSingleValue, UserDecryptSingleValue__factory } from "../../../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

/**
 * UserDecryptSingleValue Test Suite
 *
 * Demonstrates:
 * - Storing encrypted values for user decryption
 * - User permission management
 * - Client-side decryption workflow
 * - Value retrieval and updates
 */

describe("UserDecryptSingleValue", function () {
  let contract: UserDecryptSingleValue;
  let contractAddress: string;
  let user: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  before(async function () {
    const signers = await ethers.getSigners();
    user = signers[0];
    other = signers[1];
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const factory = (await ethers.getContractFactory(
      "UserDecryptSingleValue",
    )) as UserDecryptSingleValue__factory;
    contract = (await factory.deploy()) as UserDecryptSingleValue;
    contractAddress = await contract.getAddress();
  });

  describe("Value Storage", function () {
    /**
     * ✅ DO: Store encrypted value properly
     * Shows correct encryption and storage workflow
     */
    it("should store encrypted value with proper permissions", async function () {
      const valueToStore = 42;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(valueToStore)
        .encrypt();

      const tx = await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);
      await tx.wait();

      // Verify value was stored
      expect(await contract.connect(user).hasStoredValue()).to.be.true;
    });

    /**
     * ✅ DO: User can retrieve encrypted value
     * Demonstrates user retrieval workflow
     */
    it("should allow user to retrieve encrypted value", async function () {
      const valueToStore = 100;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(valueToStore)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      // User can get encrypted value
      const encryptedValue = await contract
        .connect(user)
        .getValueForDecryption();
      expect(encryptedValue).to.be.ok;

      // User can decrypt on client side
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedValue,
        contractAddress,
        user,
      );
      expect(decrypted).to.equal(valueToStore);
    });

    /**
     * ❌ DON'T: Other users access value without permission
     * Shows authorization enforcement
     */
    it("should deny unauthorized access to encrypted value", async function () {
      const valueToStore = 50;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(valueToStore)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      // Other user cannot retrieve
      await expect(
        contract.connect(other).getValueForDecryption(),
      ).to.be.revertedWith("No value stored for user");
    });
  });

  describe("Bytes32 Format", function () {
    /**
     * ✅ DO: Get value as bytes32
     * Demonstrates alternative format for client usage
     */
    it("should return encrypted value as bytes32", async function () {
      const valueToStore = 75;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(valueToStore)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      const bytes32Value = await contract.connect(user).getValueAsBytes();
      expect(bytes32Value).to.not.equal(ethers.ZeroHash);
    });
  });

  describe("Value Updates", function () {
    /**
     * ✅ DO: Update encrypted value
     * Shows value modification workflow
     */
    it("should allow user to update encrypted value", async function () {
      const initialValue = 30;
      const newValue = 60;

      // Store initial value
      let encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(initialValue)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      // Verify initial value
      let stored = await contract.connect(user).getValueForDecryption();
      let decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        stored,
        contractAddress,
        user,
      );
      expect(decrypted).to.equal(initialValue);

      // Update value
      encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(newValue)
        .encrypt();

      await contract
        .connect(user)
        .updateValue(encrypted.handles[0], encrypted.inputProof);

      // Verify updated value
      stored = await contract.connect(user).getValueForDecryption();
      decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        stored,
        contractAddress,
        user,
      );
      expect(decrypted).to.equal(newValue);
    });
  });

  describe("Value Deletion", function () {
    /**
     * ✅ DO: Delete encrypted value
     * Shows cleanup workflow
     */
    it("should allow user to delete encrypted value", async function () {
      const valueToStore = 25;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(valueToStore)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      expect(await contract.connect(user).hasStoredValue()).to.be.true;

      // Delete value
      await contract.connect(user).deleteValue();

      expect(await contract.connect(user).hasStoredValue()).to.be.false;
    });

    /**
     * ❌ DON'T: Delete non-existent value
     * Shows validation
     */
    it("should reject deletion of non-existent value", async function () {
      await expect(
        contract.connect(user).deleteValue(),
      ).to.be.revertedWith("No value to delete");
    });
  });

  describe("Authorization", function () {
    /**
     * ✅ DO: Only authorized user can access value
     * Demonstrates proper authorization checks
     */
    it("should enforce per-user value isolation", async function () {
      const userValue = 111;
      const otherValue = 222;

      // User stores value
      let encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(userValue)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      // Other user stores different value
      encrypted = await fhevm
        .createEncryptedInput(contractAddress, other.address)
        .add32(otherValue)
        .encrypt();

      await contract
        .connect(other)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      // Verify each user sees only their own value
      const userStored = await contract.connect(user).getValueForDecryption();
      const userDecrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        userStored,
        contractAddress,
        user,
      );
      expect(userDecrypted).to.equal(userValue);

      const otherStored = await contract.connect(other).getValueForDecryption();
      const otherDecrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        otherStored,
        contractAddress,
        other,
      );
      expect(otherDecrypted).to.equal(otherValue);
    });
  });

  describe("Edge Cases", function () {
    /**
     * ✅ DO: Handle zero values
     * Shows edge case handling
     */
    it("should handle zero value correctly", async function () {
      const zeroValue = 0;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(zeroValue)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      const stored = await contract.connect(user).getValueForDecryption();
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        stored,
        contractAddress,
        user,
      );
      expect(decrypted).to.equal(0);
    });

    /**
     * ✅ DO: Handle maximum values
     * Shows boundary condition handling
     */
    it("should handle maximum uint32 value", async function () {
      const maxValue = (2 ** 32) - 1; // Max uint32

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user.address)
        .add32(maxValue)
        .encrypt();

      await contract
        .connect(user)
        .storeValue(encrypted.handles[0], encrypted.inputProof);

      const stored = await contract.connect(user).getValueForDecryption();
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        stored,
        contractAddress,
        user,
      );
      expect(decrypted).to.equal(maxValue);
    });
  });
});
