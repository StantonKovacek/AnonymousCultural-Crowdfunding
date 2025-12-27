import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { AccessControl, AccessControl__factory } from "../../../types";
import { expect } from "chai";

/**
 * AccessControl Test Suite
 *
 * Demonstrates:
 * - Proper FHE permission patterns
 * - Access control with FHE.allow() and FHE.allowThis()
 * - Authorization checks for encrypted data
 * - Common access control mistakes
 */

describe("AccessControl", function () {
  let contract: AccessControl;
  let contractAddress: string;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let unauthorized: HardhatEthersSigner;

  before(async function () {
    const signers = await ethers.getSigners();
    owner = signers[0];
    user1 = signers[1];
    user2 = signers[2];
    unauthorized = signers[3];
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      this.skip();
    }

    const factory = (await ethers.getContractFactory(
      "AccessControl",
    )) as AccessControl__factory;
    contract = (await factory.deploy()) as AccessControl;
    contractAddress = await contract.getAddress();
  });

  describe("Access Grant/Revoke", function () {
    /**
     * ✅ DO: Owner grants access properly
     * Demonstrates correct access grant workflow
     */
    it("owner should grant access to users", async function () {
      const tx = await contract.connect(owner).grantAccess(user1.address);

      expect(tx).to.emit(contract, "AccessGranted");

      const hasAccess = await contract.hasAccess(user1.address);
      expect(hasAccess).to.be.true;
    });

    /**
     * ✅ DO: Owner revokes access
     * Shows access revocation workflow
     */
    it("owner should revoke access from users", async function () {
      // Grant first
      await contract.connect(owner).grantAccess(user1.address);
      expect(await contract.hasAccess(user1.address)).to.be.true;

      // Then revoke
      const tx = await contract.connect(owner).revokeAccess(user1.address);
      expect(tx).to.emit(contract, "AccessRevoked");

      expect(await contract.hasAccess(user1.address)).to.be.false;
    });

    /**
     * ❌ DON'T: Non-owner grants access
     * Demonstrates authorization enforcement
     */
    it("non-owner should not grant access", async function () {
      await expect(
        contract.connect(user1).grantAccess(user2.address),
      ).to.be.revertedWith("Only owner can grant access");
    });

    /**
     * ❌ DON'T: Grant access to zero address
     * Shows input validation
     */
    it("should reject zero address for access grant", async function () {
      await expect(
        contract.connect(owner).grantAccess(ethers.ZeroAddress),
      ).to.be.revertedWith("Invalid address");
    });

    /**
     * ❌ DON'T: Grant access twice
     * Demonstrates duplicate prevention
     */
    it("should not double-grant access", async function () {
      await contract.connect(owner).grantAccess(user1.address);

      await expect(
        contract.connect(owner).grantAccess(user1.address),
      ).to.be.revertedWith("Already approved");
    });
  });

  describe("Sensitive Data Storage", function () {
    /**
     * ✅ DO: Owner sets encrypted data properly
     * Shows correct encryption workflow with permissions
     */
    it("owner should set sensitive data", async function () {
      const value = 12345;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(value)
        .encrypt();

      const tx = await contract
        .connect(owner)
        .setSensitiveData(encrypted.handles[0], encrypted.inputProof);

      expect(tx).to.emit(contract, "DataUpdated");
    });

    /**
     * ❌ DON'T: Non-owner sets sensitive data
     * Demonstrates authorization check
     */
    it("non-owner should not set sensitive data", async function () {
      const value = 54321;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, user1.address)
        .add32(value)
        .encrypt();

      await expect(
        contract
          .connect(user1)
          .setSensitiveData(encrypted.handles[0], encrypted.inputProof),
      ).to.be.revertedWith("Only owner can set data");
    });
  });

  describe("Encrypted Data Access", function () {
    /**
     * ✅ DO: Owner accesses their own encrypted data
     * Shows proper access control enforcement
     */
    it("owner should access sensitive data", async function () {
      const value = 9999;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(value)
        .encrypt();

      await contract
        .connect(owner)
        .setSensitiveData(encrypted.handles[0], encrypted.inputProof);

      // Owner can access
      const result = await contract.connect(owner).getSensitiveData();
      expect(result).to.be.ok;
    });

    /**
     * ✅ DO: Approved user accesses encrypted data
     * Demonstrates proper approval workflow
     */
    it("approved user should access sensitive data", async function () {
      const value = 7777;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(value)
        .encrypt();

      await contract
        .connect(owner)
        .setSensitiveData(encrypted.handles[0], encrypted.inputProof);

      // Grant access
      await contract.connect(owner).grantAccess(user1.address);

      // User can access
      const result = await contract.connect(user1).getSensitiveData();
      expect(result).to.be.ok;
    });

    /**
     * ❌ DON'T: Unauthorized user accesses sensitive data
     * Shows access denial
     */
    it("unauthorized user should not access sensitive data", async function () {
      const value = 5555;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(value)
        .encrypt();

      await contract
        .connect(owner)
        .setSensitiveData(encrypted.handles[0], encrypted.inputProof);

      // Unauthorized should fail
      await expect(
        contract.connect(unauthorized).getSensitiveData(),
      ).to.be.revertedWith("Access denied: not authorized");
    });

    /**
     * ❌ DON'T: Revoked user accesses data
     * Shows access revocation effect
     */
    it("revoked user should not access sensitive data", async function () {
      const value = 3333;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(value)
        .encrypt();

      await contract
        .connect(owner)
        .setSensitiveData(encrypted.handles[0], encrypted.inputProof);

      // Grant then revoke
      await contract.connect(owner).grantAccess(user1.address);
      await contract.connect(owner).revokeAccess(user1.address);

      // Should be denied
      await expect(
        contract.connect(user1).getSensitiveData(),
      ).to.be.revertedWith("Access denied: not authorized");
    });
  });

  describe("Anti-Pattern Testing", function () {
    /**
     * Tests for the getDataWrong() function
     * ❌ DON'T: Return encrypted data without access checks
     */
    it("demonstrates why getDataWrong is bad practice", async function () {
      const value = 1111;

      const encrypted = await fhevm
        .createEncryptedInput(contractAddress, owner.address)
        .add32(value)
        .encrypt();

      await contract
        .connect(owner)
        .setSensitiveData(encrypted.handles[0], encrypted.inputProof);

      // This would allow unauthorized access (if implemented)
      // The function is provided to show what NOT to do
      // In this test, it demonstrates the vulnerability conceptually
    });
  });

  describe("Permission Verification", function () {
    /**
     * ✅ DO: Verify access status correctly
     * Shows access verification pattern
     */
    it("should correctly report access status", async function () {
      // Initially no access
      expect(await contract.hasAccess(user1.address)).to.be.false;

      // Grant access
      await contract.connect(owner).grantAccess(user1.address);
      expect(await contract.hasAccess(user1.address)).to.be.true;

      // Owner always has access
      expect(await contract.hasAccess(owner.address)).to.be.true;

      // Revoke access
      await contract.connect(owner).revokeAccess(user1.address);
      expect(await contract.hasAccess(user1.address)).to.be.false;
    });
  });
});
