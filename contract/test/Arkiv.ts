import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import { Arkiv, Arkiv__factory } from "../types";

type Signers = {
  deployer: HardhatEthersSigner;
  patient: HardhatEthersSigner;
  hospital: HardhatEthersSigner;
  clinic: HardhatEthersSigner;
};

describe("Arkiv - End-to-End Flow", function () {
  let signers: Signers;
  let arkivContract: Arkiv;

  // Test data
  const FILE_ID = ethers.keccak256(ethers.toUtf8Bytes("medical-record-001"));
  const CID = "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  const METADATA = JSON.stringify({ 
    type: "blood-test",
    date: "2024-10-29",
    encryptionKey: "aes-256-key-stored-here"
  });

  async function deployFixture() {
    const factory = (await ethers.getContractFactory("Arkiv")) as Arkiv__factory;
    const contract = (await factory.deploy()) as Arkiv;
    return contract;
  }

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      patient: ethSigners[1],
      hospital: ethSigners[2],
      clinic: ethSigners[3],
    };
  });

  beforeEach(async function () {
    arkivContract = await deployFixture();
  });

  describe("Complete Medical Records Flow", function () {
    it("should handle the full lifecycle: register institution -> upload file -> share -> revoke", async function () {
      console.log("\n🏥 === ARKIV COMPLETE FLOW TEST ===\n");

      // ========== STEP 1: Register Institution ==========
      console.log("📋 Step 1: Registering Healthcare Institution");
      
      await arkivContract
        .connect(signers.hospital)
        .registerInstitution(
          "City General Hospital",
          "Multi-specialty healthcare provider",
          "contact@cityhospital.com"
        );

      const hospital = await arkivContract.getInstitution(signers.hospital.address);
      expect(hospital.name).to.equal("City General Hospital");
      expect(hospital.exists).to.be.true;

      const institutions = await arkivContract.listInstitutions();
      expect(institutions.length).to.equal(1);

      console.log("✅ Institution registered successfully");
      console.log(`   Name: ${hospital.name}`);
      console.log(`   Contact: ${hospital.contactInfo}\n`);

      // ========== STEP 2: Patient Uploads Medical Record ==========
      console.log("📄 Step 2: Patient Uploading Medical Record");

      await arkivContract
        .connect(signers.patient)
        .createFile(FILE_ID, CID, METADATA);

      const cid = await arkivContract.getFileCid(FILE_ID);
      const metadata = await arkivContract.getFileMetadata(FILE_ID);
      
      expect(cid).to.equal(CID);
      expect(metadata).to.equal(METADATA);

      const patientFiles = await arkivContract.getFilesByOwner(signers.patient.address);
      expect(patientFiles.length).to.equal(1);
      expect(patientFiles[0]).to.equal(FILE_ID);

      console.log("✅ File uploaded successfully");
      console.log(`   CID: ${cid.substring(0, 20)}...`);
      console.log(`   Owner: ${signers.patient.address.substring(0, 10)}...\n`);

      // ========== STEP 3: Patient Grants Access to Hospital ==========
      console.log("🔑 Step 3: Patient Granting Access to Hospital");

      // Initially, hospital should not have access
      let hasAccess = await arkivContract.hasAccess(FILE_ID, signers.hospital.address);
      expect(hasAccess).to.be.false;

      // Grant access
      await arkivContract
        .connect(signers.patient)
        .grantAccess(FILE_ID, signers.hospital.address);

      hasAccess = await arkivContract.hasAccess(FILE_ID, signers.hospital.address);
      expect(hasAccess).to.be.true;

      const recipients = await arkivContract.listRecipients(FILE_ID);
      expect(recipients.length).to.equal(1);
      expect(recipients[0]).to.equal(signers.hospital.address);

      console.log("✅ Access granted successfully");
      console.log(`   Recipients: ${recipients.length}`);
      console.log(`   Hospital can now access encryption key\n`);

      // ========== STEP 4: Hospital Accesses File Metadata ==========
      console.log("🏥 Step 4: Hospital Retrieving File Information");

      // Hospital retrieves CID and metadata
      const hospitalCid = await arkivContract
        .connect(signers.hospital)
        .getFileCid(FILE_ID);

      const hospitalMetadata = await arkivContract
        .connect(signers.hospital)
        .getFileMetadata(FILE_ID);

      expect(hospitalCid).to.equal(CID);
      expect(hospitalMetadata).to.equal(METADATA);

      console.log("✅ Hospital retrieved file information");
      console.log(`   CID: ${hospitalCid.substring(0, 20)}...`);
      console.log(`   Metadata contains encryption key\n`);

      // ========== STEP 5: Patient Revokes Access ==========
      console.log("🚫 Step 5: Patient Revoking Hospital Access");

      await arkivContract
        .connect(signers.patient)
        .revokeAccess(FILE_ID, signers.hospital.address);

      hasAccess = await arkivContract.hasAccess(FILE_ID, signers.hospital.address);
      expect(hasAccess).to.be.false;

      const activeRecipients = await arkivContract.listRecipients(FILE_ID);
      expect(activeRecipients.length).to.equal(0);

      const revokedRecipients = await arkivContract.listRevokedRecipients(FILE_ID);
      expect(revokedRecipients.length).to.equal(1);
      expect(revokedRecipients[0]).to.equal(signers.hospital.address);

      console.log("✅ Access revoked successfully");
      console.log(`   Active recipients: ${activeRecipients.length}`);
      console.log(`   Revoked recipients: ${revokedRecipients.length}\n`);

      // ========== STEP 6: Verify Access Control ==========
      console.log("🔒 Step 6: Verifying Access Control Enforcement");

      // Hospital should still be able to call the function but has no access
      const stillHasAccess = await arkivContract
        .connect(signers.hospital)
        .hasAccess(FILE_ID, signers.hospital.address);
      
      expect(stillHasAccess).to.be.false;

      console.log("✅ Access control verified");
      console.log(`   Hospital access: ${stillHasAccess}\n`);

      // ========== FINAL SUMMARY ==========
      console.log("📊 === FINAL SUMMARY ===");
      console.log(`✅ Institutions registered: 1`);
      console.log(`✅ Files created: 1`);
      console.log(`✅ Access grants: 1`);
      console.log(`✅ Access revocations: 1`);
      console.log(`✅ All operations completed successfully!\n`);
    });

    it("should prevent unauthorized operations", async function () {
      console.log("\n🔐 Testing Access Control\n");

      // Create a file as patient
      await arkivContract
        .connect(signers.patient)
        .createFile(FILE_ID, CID, METADATA);

      console.log("📄 File created by patient\n");

      // Test 1: Non-owner cannot grant access
      console.log("Test 1: Non-owner trying to grant access");
      await expect(
        arkivContract
          .connect(signers.hospital)
          .grantAccess(FILE_ID, signers.clinic.address)
      ).to.be.revertedWith("Only file owner");
      console.log("✅ Non-owner prevented from granting access\n");

      // Test 2: Non-owner cannot revoke access
      console.log("Test 2: Non-owner trying to revoke access");
      await arkivContract
        .connect(signers.patient)
        .grantAccess(FILE_ID, signers.hospital.address);

      await expect(
        arkivContract
          .connect(signers.clinic)
          .revokeAccess(FILE_ID, signers.hospital.address)
      ).to.be.revertedWith("Only file owner");
      console.log("✅ Non-owner prevented from revoking access\n");

      // Test 3: Cannot revoke non-existent access
      console.log("Test 3: Trying to revoke non-existent access");
      await expect(
        arkivContract
          .connect(signers.patient)
          .revokeAccess(FILE_ID, signers.clinic.address)
      ).to.be.revertedWith("Not granted");
      console.log("✅ Cannot revoke access that was never granted\n");

      // Test 4: Cannot create duplicate file
      console.log("Test 4: Trying to create duplicate file");
      await expect(
        arkivContract
          .connect(signers.patient)
          .createFile(FILE_ID, CID, METADATA)
      ).to.be.revertedWith("File: already exists");
      console.log("✅ Duplicate file creation prevented\n");

      // Test 5: Cannot register institution twice
      console.log("Test 5: Trying to register institution twice");
      await arkivContract
        .connect(signers.hospital)
        .registerInstitution("Hospital A", "Desc A", "a@hospital.com");

      await expect(
        arkivContract
          .connect(signers.hospital)
          .registerInstitution("Hospital B", "Desc B", "b@hospital.com")
      ).to.be.revertedWith("Already registered");
      console.log("✅ Duplicate institution registration prevented\n");

      console.log("🎯 All access control tests passed!\n");
    });

    it("should support multiple institutions accessing same file", async function () {
      console.log("\n🏥 Testing Multiple Institution Access\n");

      // Register two institutions
      await arkivContract
        .connect(signers.hospital)
        .registerInstitution("Hospital A", "Desc A", "a@hospital.com");

      await arkivContract
        .connect(signers.clinic)
        .registerInstitution("Clinic B", "Desc B", "b@clinic.com");

      console.log("✅ Two institutions registered\n");

      // Patient creates file
      await arkivContract
        .connect(signers.patient)
        .createFile(FILE_ID, CID, METADATA);

      console.log("✅ Patient created medical record\n");

      // Grant access to both institutions
      await arkivContract
        .connect(signers.patient)
        .grantAccess(FILE_ID, signers.hospital.address);

      await arkivContract
        .connect(signers.patient)
        .grantAccess(FILE_ID, signers.clinic.address);

      console.log("✅ Access granted to both institutions\n");

      // Verify both have access
      const hospitalAccess = await arkivContract.hasAccess(FILE_ID, signers.hospital.address);
      const clinicAccess = await arkivContract.hasAccess(FILE_ID, signers.clinic.address);

      expect(hospitalAccess).to.be.true;
      expect(clinicAccess).to.be.true;

      const recipients = await arkivContract.listRecipients(FILE_ID);
      expect(recipients.length).to.equal(2);

      console.log(`✅ Both institutions have access (${recipients.length} recipients)\n`);

      // Both can retrieve metadata
      const hospitalMetadata = await arkivContract
        .connect(signers.hospital)
        .getFileMetadata(FILE_ID);

      const clinicMetadata = await arkivContract
        .connect(signers.clinic)
        .getFileMetadata(FILE_ID);

      expect(hospitalMetadata).to.equal(METADATA);
      expect(clinicMetadata).to.equal(METADATA);

      console.log("✅ Both institutions can retrieve file metadata\n");

      // Revoke access from one institution
      await arkivContract
        .connect(signers.patient)
        .revokeAccess(FILE_ID, signers.hospital.address);

      const hospitalAccessAfter = await arkivContract.hasAccess(FILE_ID, signers.hospital.address);
      const clinicAccessAfter = await arkivContract.hasAccess(FILE_ID, signers.clinic.address);

      expect(hospitalAccessAfter).to.be.false;
      expect(clinicAccessAfter).to.be.true;

      const activeRecipients = await arkivContract.listRecipients(FILE_ID);
      expect(activeRecipients.length).to.equal(1);
      expect(activeRecipients[0]).to.equal(signers.clinic.address);

      console.log("✅ Selective revocation successful");
      console.log(`   Hospital access: ${hospitalAccessAfter}`);
      console.log(`   Clinic access: ${clinicAccessAfter}`);
      console.log(`   Active recipients: ${activeRecipients.length}\n`);
    });
  });
});