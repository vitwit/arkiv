import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import { Arkiv, Arkiv__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
  institution1: HardhatEthersSigner;
  institution2: HardhatEthersSigner;
};

describe("Arkiv - Complete Flow with Encrypted Key Management", function () {
  let signers: Signers;
  let arkivContract: Arkiv;
  let arkivContractAddress: string;

  // Test data
  const FILE_ID_1 = ethers.keccak256(ethers.toUtf8Bytes("medical-record-001"));
  const FILE_ID_2 = ethers.keccak256(ethers.toUtf8Bytes("medical-record-002"));
  const CID_1 = "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX1";
  const CID_2 = "QmYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY2";
  const METADATA_1 = JSON.stringify({ 
    type: "medical-record", 
    date: "2024-01-15",
    description: "Patient X-Ray Results"
  });
  const METADATA_2 = JSON.stringify({ 
    type: "lab-results", 
    date: "2024-02-20",
    description: "Blood Test Results"
  });

  async function deployFixture() {
    const factory = (await ethers.getContractFactory("Arkiv")) as Arkiv__factory;
    const contract = (await factory.deploy()) as Arkiv;
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress };
  }

  // Helper function to wait for single decryption (if needed for future features)
  async function waitForSingleDecryption() {
    console.log("Waiting for decryption...");
    await fhevm.awaitDecryptionOracle();
    console.log("Decryption completed");
  }

  // Helper to generate mock AES-256 key as 4 x 64-bit words
  function generateMockAESKey(): bigint[] {
    return [
      BigInt("0x0123456789ABCDEF"),
      BigInt("0xFEDCBA9876543210"),
      BigInt("0x1111222233334444"),
      BigInt("0x5555666677778888")
    ];
  }

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
      institution1: ethSigners[4],
      institution2: ethSigners[5],
    };
  });

  beforeEach(async function () {
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    const { contract, contractAddress } = await deployFixture();
    
    arkivContract = contract;
    arkivContractAddress = contractAddress;
  });

  describe("Institution Management", function () {
    it("should register institutions successfully", async function () {
      console.log("\n🏥 Testing Institution Registration");
      
      const inst1Name = "City General Hospital";
      const inst1Desc = "Leading healthcare provider";
      const inst1Contact = "contact@cityhospital.com";

      const inst2Name = "Medical Research Center";
      const inst2Desc = "Advanced medical research facility";
      const inst2Contact = "info@researchcenter.org";

      // Register first institution
      await arkivContract
        .connect(signers.institution1)
        .registerInstitution(inst1Name, inst1Desc, inst1Contact);
      
      console.log(`✅ ${inst1Name} registered`);

      // Register second institution
      await arkivContract
        .connect(signers.institution2)
        .registerInstitution(inst2Name, inst2Desc, inst2Contact);
      
      console.log(`✅ ${inst2Name} registered`);

      // Verify first institution
      const institution1 = await arkivContract.getInstitution(signers.institution1.address);
      expect(institution1.name).to.equal(inst1Name);
      expect(institution1.description).to.equal(inst1Desc);
      expect(institution1.contactInfo).to.equal(inst1Contact);
      expect(institution1.account).to.equal(signers.institution1.address);
      expect(institution1.exists).to.be.true;

      // Verify second institution
      const institution2 = await arkivContract.getInstitution(signers.institution2.address);
      expect(institution2.name).to.equal(inst2Name);

      // List all institutions
      const allInstitutions = await arkivContract.listInstitutions();
      expect(allInstitutions.length).to.equal(2);
      expect(allInstitutions[0].name).to.equal(inst1Name);
      expect(allInstitutions[1].name).to.equal(inst2Name);

      console.log(`✅ Institution registration and listing successful`);
    });

    it("should prevent duplicate institution registration", async function () {      
      await arkivContract
        .connect(signers.institution1)
        .registerInstitution("Hospital A", "Description", "contact@a.com");

      // Try to register again
      await expect(
        arkivContract
          .connect(signers.institution1)
          .registerInstitution("Hospital B", "New Description", "contact@b.com")
      ).to.be.revertedWith("Already registered");

      console.log(`✅ Check Duplicate registration`);
    });

    it("should fail when getting non-existent institution", async function () {
      await expect(
        arkivContract.getInstitution(signers.alice.address)
      ).to.be.revertedWith("Institution not found");
    });
  });

  describe("File Lifecycle", function () {
    it("should create files successfully", async function () {
      // Alice creates a file
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);

      console.log(`✅ File created by Alice with ID: ${FILE_ID_1.substring(0, 10)}...`);

      // Verify file data
      const cid = await arkivContract.getFileCid(FILE_ID_1);
      expect(cid).to.equal(CID_1);

      const metadata = await arkivContract.getFileMetadata(FILE_ID_1);
      expect(metadata).to.equal(METADATA_1);
    });

    it("should prevent duplicate file creation", async function () {

      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);

      await expect(
        arkivContract
          .connect(signers.alice)
          .createFile(FILE_ID_1, CID_1, METADATA_1)
      ).to.be.revertedWith("File: already exists");

      console.log(`✅ Duplicate file creation prevented`);
    });

    it("should fail when accessing non-existent file", async function () {
      await expect(
        arkivContract.getFileCid(FILE_ID_1)
      ).to.be.revertedWith("File: not found");

      await expect(
        arkivContract.getFileMetadata(FILE_ID_1)
      ).to.be.revertedWith("File: not found");
    });
  });

  describe("Access Control", function () {
    beforeEach(async function () {
      // Create a file owned by Alice
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);
    });

    it("should grant access to recipients", async function () {
      // Grant access to Bob
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      console.log(`✅ Access granted to Bob`);

      // Verify access
      const hasAccess = await arkivContract.hasAccess(FILE_ID_1, signers.bob.address);
      expect(hasAccess).to.be.true;

      // Check recipients list
      const recipients = await arkivContract.listRecipients(FILE_ID_1);
      expect(recipients.length).to.equal(1);
      expect(recipients[0]).to.equal(signers.bob.address);

      console.log(`✅ Access verified for Bob`);
    });

    it("should grant access to multiple recipients", async function () {
      // Grant access to multiple users
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.charlie.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.institution1.address);

      // Verify all have access
      expect(await arkivContract.hasAccess(FILE_ID_1, signers.bob.address)).to.be.true;
      expect(await arkivContract.hasAccess(FILE_ID_1, signers.charlie.address)).to.be.true;
      expect(await arkivContract.hasAccess(FILE_ID_1, signers.institution1.address)).to.be.true;

      const recipients = await arkivContract.listRecipients(FILE_ID_1);
      expect(recipients.length).to.equal(3);

      console.log(`✅ Multiple access grants successful`);
    });

    it("should revoke access from recipients", async function () {
      // Grant and then revoke access
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      console.log(`✅ Access granted to Bob`);

      await arkivContract
        .connect(signers.alice)
        .revokeAccess(FILE_ID_1, signers.bob.address);

      console.log(`✅ Access revoked from Bob`);

      // Verify access removed
      const hasAccess = await arkivContract.hasAccess(FILE_ID_1, signers.bob.address);
      expect(hasAccess).to.be.false;

      console.log(`✅ Access revocation verified`);
    });

    it("should only allow owner to grant/revoke access", async function () {
      // Bob tries to grant access (should fail)
      await expect(
        arkivContract
          .connect(signers.bob)
          .grantAccess(FILE_ID_1, signers.charlie.address)
      ).to.be.revertedWith("Only file owner");

      // Bob tries to revoke access (should fail)
      await expect(
        arkivContract
          .connect(signers.bob)
          .revokeAccess(FILE_ID_1, signers.charlie.address)
      ).to.be.revertedWith("Only file owner");

      console.log(`✅ Non-owner prevented from access control operations`);
    });

    it("should fail when revoking non-existent access", async function () {
      await expect(
        arkivContract
          .connect(signers.alice)
          .revokeAccess(FILE_ID_1, signers.bob.address)
      ).to.be.revertedWith("Not granted");
    });
  });

  describe("Encrypted Key Management (AES-256)", function () {
    beforeEach(async function () {
      // Setup: Alice creates file and grants access to Bob
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);
    });

    it("should store encrypted AES-256 key words for recipient", async function () {

      const aesKeyWords = generateMockAESKey();

      // Create encrypted input for all 4 words
      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKeyWords[0]))
        .add64(Number(aesKeyWords[1]))
        .add64(Number(aesKeyWords[2]))
        .add64(Number(aesKeyWords[3]))
        .encrypt();

      // Store all 4 words
      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encryptedInput.handles,
          [
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof
          ]
        );

      console.log(`✅ 4 encrypted key words stored for Bob`);

      // Verify key word count
      const wordCount = await arkivContract.keyWordCount(FILE_ID_1, signers.bob.address);
      expect(wordCount).to.equal(4);

      console.log(`✅ Key word count verified: ${wordCount}`);
    });

    it("should allow recipient to retrieve their encrypted key words", async function () {
      console.log("\n🔓 Testing Key Retrieval by Recipient");

      const aesKeyWords = generateMockAESKey();

      // Store encrypted keys
      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKeyWords[0]))
        .add64(Number(aesKeyWords[1]))
        .add64(Number(aesKeyWords[2]))
        .add64(Number(aesKeyWords[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encryptedInput.handles,
          [
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof
          ]
        );

      // Bob retrieves his encrypted key words
      for (let i = 0; i < 4; i++) {
        const keyWord = await arkivContract
          .connect(signers.bob)
          .getKeyWord(FILE_ID_1, i);
        
        expect(keyWord).to.not.be.undefined;
        console.log(`✅ Bob retrieved encrypted key word ${i}`);
      }

      console.log(`✅ All key words retrieved successfully`);
    });

    it("should prevent unauthorized access to encrypted keys", async function () {

      const aesKeyWords = generateMockAESKey();

      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKeyWords[0]))
        .add64(Number(aesKeyWords[1]))
        .add64(Number(aesKeyWords[2]))
        .add64(Number(aesKeyWords[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encryptedInput.handles,
          [
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof
          ]
        );

      // Charlie (unauthorized) tries to access Bob's keys
      await expect(
        arkivContract
          .connect(signers.charlie)
          .getKeyWord(FILE_ID_1, 0)
      ).to.be.revertedWith("Not authorized");

      console.log(`✅ Unauthorized access prevented`);
    });

    it("should allow owner to view any recipient's encrypted keys", async function () {

      const aesKeyWords = generateMockAESKey();

      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKeyWords[0]))
        .add64(Number(aesKeyWords[1]))
        .add64(Number(aesKeyWords[2]))
        .add64(Number(aesKeyWords[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encryptedInput.handles,
          [
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof
          ]
        );

      // Alice (owner) views Bob's encrypted keys
      for (let i = 0; i < 4; i++) {
        const keyWord = await arkivContract
          .connect(signers.alice)
          .getKeyWordFor(FILE_ID_1, signers.bob.address, i);
        
        expect(keyWord).to.not.be.undefined;
        console.log(`✅ Owner viewed Bob's key word ${i}`);
      }

      console.log(`✅ Owner successfully viewed recipient keys`);
    });

    it("should reject invalid number of key words", async function () {

      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(12345)
        .add64(67890)
        .encrypt();

      await expect(
        arkivContract
          .connect(signers.alice)
          .storeKeyWordsBatch(
            FILE_ID_1,
            signers.bob.address,
            encryptedInput.handles,
            [encryptedInput.inputProof, encryptedInput.inputProof]
          )
      ).to.be.revertedWith("Must supply 4 encrypted words");

      console.log(`✅ Invalid key word count rejected`);
    });

    it("should reject mismatched proofs array", async function () {
      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(1)
        .add64(2)
        .add64(3)
        .add64(4)
        .encrypt();

      await expect(
        arkivContract
          .connect(signers.alice)
          .storeKeyWordsBatch(
            FILE_ID_1,
            signers.bob.address,
            encryptedInput.handles,
            [encryptedInput.inputProof, encryptedInput.inputProof]
          )
      ).to.be.revertedWith("Must supply 4 proofs");
    });

    it("should automatically grant access when storing keys for new recipient", async function () {

      const aesKeyWords = generateMockAESKey();

      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKeyWords[0]))
        .add64(Number(aesKeyWords[1]))
        .add64(Number(aesKeyWords[2]))
        .add64(Number(aesKeyWords[3]))
        .encrypt();

      // Store keys for Charlie (who doesn't have access yet)
      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.charlie.address,
          encryptedInput.handles,
          [
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof
          ]
        );

      const hasAccess = await arkivContract.hasAccess(FILE_ID_1, signers.charlie.address);
      expect(hasAccess).to.be.true;

      const recipients = await arkivContract.listRecipients(FILE_ID_1);
      expect(recipients).to.include(signers.charlie.address);

      console.log(`✅ Access automatically granted when storing keys`);
    });

    it("should clear encrypted keys when access is revoked", async function () {

      const aesKeyWords = generateMockAESKey();

      const encryptedInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKeyWords[0]))
        .add64(Number(aesKeyWords[1]))
        .add64(Number(aesKeyWords[2]))
        .add64(Number(aesKeyWords[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encryptedInput.handles,
          [
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof,
            encryptedInput.inputProof
          ]
        );

      console.log(`✅ Keys stored for Bob`);

      // Revoke access
      await arkivContract
        .connect(signers.alice)
        .revokeAccess(FILE_ID_1, signers.bob.address);

      console.log(`✅ Access revoked from Bob`);

      // Verify key count is cleared
      const wordCount = await arkivContract.keyWordCount(FILE_ID_1, signers.bob.address);
      expect(wordCount).to.equal(0);

      console.log(`✅ Encrypted keys cleared on revocation`);
    });
  });

  describe("Complete Integration Flow", function () {
    it("should handle complete workflow: register -> create -> share -> revoke", async function () {
      console.log("\n🔄 COMPLETE INTEGRATION TEST");
      console.log("=================================\n");

      // Step 1: Register institutions
      console.log("📋 Step 1: Registering Institutions");
      await arkivContract
        .connect(signers.institution1)
        .registerInstitution(
          "City Hospital",
          "Primary healthcare provider",
          "contact@cityhospital.com"
        );

      await arkivContract
        .connect(signers.institution2)
        .registerInstitution(
          "Lab Services Inc",
          "Medical testing laboratory",
          "info@labservices.com"
        );

      const institutions = await arkivContract.listInstitutions();
      expect(institutions.length).to.equal(2);
      console.log(`✅ ${institutions.length} institutions registered\n`);

      // Step 2: Alice creates multiple files
      console.log("📄 Step 2: Creating Medical Records");
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);

      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_2, CID_2, METADATA_2);

      console.log(`✅ 2 medical records created by Alice\n`);

      // Step 3: Grant access to multiple recipients
      console.log("🔑 Step 3: Granting Access to Recipients");
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.institution1.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_2, signers.charlie.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_2, signers.institution2.address);

      console.log(`✅ Access granted to multiple recipients\n`);

      // Step 4: Store encrypted keys for File 1 recipients
      console.log("🔐 Step 4: Storing Encrypted Keys for File 1");
      const aesKey1 = generateMockAESKey();

      // Store for Bob
      let encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKey1[0]))
        .add64(Number(aesKey1[1]))
        .add64(Number(aesKey1[2]))
        .add64(Number(aesKey1[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      console.log(`  ✅ Keys stored for Bob`);

      // Store for Institution1
      encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKey1[0]))
        .add64(Number(aesKey1[1]))
        .add64(Number(aesKey1[2]))
        .add64(Number(aesKey1[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.institution1.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      console.log(`  ✅ Keys stored for Institution1\n`);

      // Step 5: Store encrypted keys for File 2 recipients
      console.log("🔐 Step 5: Storing Encrypted Keys for File 2");
      const aesKey2 = generateMockAESKey();

      encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(aesKey2[0]))
        .add64(Number(aesKey2[1]))
        .add64(Number(aesKey2[2]))
        .add64(Number(aesKey2[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_2,
          signers.charlie.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      console.log(`  ✅ Keys stored for Charlie\n`);

      // Step 6: Recipients retrieve their keys
      console.log("🔓 Step 6: Recipients Retrieving Keys");
      
      // Bob retrieves keys for File 1
      for (let i = 0; i < 4; i++) {
        const keyWord = await arkivContract
          .connect(signers.bob)
          .getKeyWord(FILE_ID_1, i);
        expect(keyWord).to.not.be.undefined;
      }
      console.log(`  ✅ Bob retrieved all 4 key words for File 1`);

      // Charlie retrieves keys for File 2
      for (let i = 0; i < 4; i++) {
        const keyWord = await arkivContract
          .connect(signers.charlie)
          .getKeyWord(FILE_ID_2, i);
        expect(keyWord).to.not.be.undefined;
      }
      console.log(`  ✅ Charlie retrieved all 4 key words for File 2\n`);

      // Step 7: Revoke access and verify
      console.log("🚫 Step 7: Revoking Access");
      await arkivContract
        .connect(signers.alice)
        .revokeAccess(FILE_ID_1, signers.bob.address);

      const bobHasAccess = await arkivContract.hasAccess(FILE_ID_1, signers.bob.address);
      expect(bobHasAccess).to.be.false;

      const bobKeyCount = await arkivContract.keyWordCount(FILE_ID_1, signers.bob.address);
      expect(bobKeyCount).to.equal(0);

      console.log(`  ✅ Bob's access revoked and keys cleared\n`);

      // Step 8: Verify unauthorized access fails
      console.log("🔒 Step 8: Verifying Access Controls");
      await expect(
        arkivContract
          .connect(signers.bob)
          .getKeyWord(FILE_ID_1, 0)
      ).to.be.revertedWith("Not authorized");

      console.log(`  ✅ Unauthorized access properly blocked\n`);

      // Final Summary
      console.log("📊 FINAL SUMMARY");
      console.log("=================");
      
      const file1Recipients = await arkivContract.listRecipients(FILE_ID_1);
      const file2Recipients = await arkivContract.listRecipients(FILE_ID_2);
      
      console.log(`File 1 Recipients: ${file1Recipients.length}`);
      console.log(`File 2 Recipients: ${file2Recipients.length}`);
      console.log(`Total Institutions Registered: ${institutions.length}`);
      console.log(`\n✅ Complete integration test passed successfully!`);
    });

    it("should handle multi-file sharing with same recipient", async function () {
      console.log("\n🔄 Testing Multi-File Sharing");

      // Alice creates two files
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);

      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_2, CID_2, METADATA_2);

      // Grant Bob access to both files
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_2, signers.bob.address);

      console.log(`✅ Bob granted access to 2 files`);

      // Store different keys for each file
      const key1 = generateMockAESKey();
      const key2 = [
        BigInt("0xAAAABBBBCCCCDDDD"),
        BigInt("0xEEEEFFFF00001111"),
        BigInt("0x2222333344445555"),
        BigInt("0x6666777788889999")
      ];

      let encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(key1[0]))
        .add64(Number(key1[1]))
        .add64(Number(key1[2]))
        .add64(Number(key1[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(key2[0]))
        .add64(Number(key2[1]))
        .add64(Number(key2[2]))
        .add64(Number(key2[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_2,
          signers.bob.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      console.log(`✅ Different keys stored for both files`);

      // Verify Bob can access both
      const file1Key0 = await arkivContract
        .connect(signers.bob)
        .getKeyWord(FILE_ID_1, 0);

      const file2Key0 = await arkivContract
        .connect(signers.bob)
        .getKeyWord(FILE_ID_2, 0);

      expect(file1Key0).to.not.equal(file2Key0);

      console.log(`✅ Bob can access different keys for different files`);
    });

    it("should handle complex institution sharing scenario", async function () {
      console.log("\n🏥 Testing Complex Institution Sharing");

      // Register two institutions
      await arkivContract
        .connect(signers.institution1)
        .registerInstitution("Hospital A", "Desc A", "a@hospital.com");

      await arkivContract
        .connect(signers.institution2)
        .registerInstitution("Hospital B", "Desc B", "b@hospital.com");

      // Alice creates file
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);

      // Share with both institutions
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.institution1.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.institution2.address);

      console.log(`✅ File shared with 2 institutions`);

      // Store keys for both
      const key = generateMockAESKey();

      for (const inst of [signers.institution1, signers.institution2]) {
        const encInput = await fhevm
          .createEncryptedInput(arkivContractAddress, signers.alice.address)
          .add64(Number(key[0]))
          .add64(Number(key[1]))
          .add64(Number(key[2]))
          .add64(Number(key[3]))
          .encrypt();

        await arkivContract
          .connect(signers.alice)
          .storeKeyWordsBatch(
            FILE_ID_1,
            inst.address,
            encInput.handles,
            [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
          );
      }

      console.log(`✅ Keys stored for both institutions`);

      // Both institutions can retrieve keys
      const inst1Key = await arkivContract
        .connect(signers.institution1)
        .getKeyWord(FILE_ID_1, 0);

      const inst2Key = await arkivContract
        .connect(signers.institution2)
        .getKeyWord(FILE_ID_1, 0);

      expect(inst1Key).to.not.be.undefined;
      expect(inst2Key).to.not.be.undefined;

      console.log(`✅ Both institutions can access their keys`);

      // Revoke one institution's access
      await arkivContract
        .connect(signers.alice)
        .revokeAccess(FILE_ID_1, signers.institution1.address);

      // Institution 1 can no longer access
      await expect(
        arkivContract
          .connect(signers.institution1)
          .getKeyWord(FILE_ID_1, 0)
      ).to.be.revertedWith("Not authorized");

      // Institution 2 still can
      const inst2KeyAfter = await arkivContract
        .connect(signers.institution2)
        .getKeyWord(FILE_ID_1, 0);

      expect(inst2KeyAfter).to.not.be.undefined;

      console.log(`✅ Selective revocation working correctly`);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    beforeEach(async function () {
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_1, CID_1, METADATA_1);
    });

    it("should allow overwriting existing keys", async function () {
      console.log("\n🔄 Testing Key Overwriting");

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      const key1 = generateMockAESKey();
      let encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(key1[0]))
        .add64(Number(key1[1]))
        .add64(Number(key1[2]))
        .add64(Number(key1[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      console.log(`✅ First key set stored`);

      // Store new keys (overwrite)
      const key2 = [
        BigInt("0x1111111111111111"),
        BigInt("0x2222222222222222"),
        BigInt("0x3333333333333333"),
        BigInt("0x4444444444444444")
      ];

      encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(key2[0]))
        .add64(Number(key2[1]))
        .add64(Number(key2[2]))
        .add64(Number(key2[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      console.log(`✅ Second key set stored (overwrite)`);

      // Verify count is still 4
      const wordCount = await arkivContract.keyWordCount(FILE_ID_1, signers.bob.address);
      expect(wordCount).to.equal(4);

      console.log(`✅ Key overwriting works correctly`);
    });

    it("should handle empty recipients list for new file", async function () {
      const recipients = await arkivContract.listRecipients(FILE_ID_1);
      expect(recipients.length).to.equal(0);
    });

    it("should maintain separate key spaces for different files", async function () {
      console.log("\n🔐 Testing Key Space Isolation");

      // Create second file
      await arkivContract
        .connect(signers.alice)
        .createFile(FILE_ID_2, CID_2, METADATA_2);

      // Grant Bob access to both files
      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_1, signers.bob.address);

      await arkivContract
        .connect(signers.alice)
        .grantAccess(FILE_ID_2, signers.bob.address);

      // Store keys only for FILE_ID_1
      const key = generateMockAESKey();
      const encInput = await fhevm
        .createEncryptedInput(arkivContractAddress, signers.alice.address)
        .add64(Number(key[0]))
        .add64(Number(key[1]))
        .add64(Number(key[2]))
        .add64(Number(key[3]))
        .encrypt();

      await arkivContract
        .connect(signers.alice)
        .storeKeyWordsBatch(
          FILE_ID_1,
          signers.bob.address,
          encInput.handles,
          [encInput.inputProof, encInput.inputProof, encInput.inputProof, encInput.inputProof]
        );

      // FILE_ID_1 should have keys
      const count1 = await arkivContract.keyWordCount(FILE_ID_1, signers.bob.address);
      expect(count1).to.equal(4);

      // FILE_ID_2 should have no keys
      const count2 = await arkivContract.keyWordCount(FILE_ID_2, signers.bob.address);
      expect(count2).to.equal(0);

      console.log(`✅ Key spaces properly isolated between files`);
    });
  });

});