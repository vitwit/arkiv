# Arkiv

**Arkiv** is a privacy-first medical records management system that uses **Fully Homomorphic Encryption (FHE)** on Zama's FHEVM. Users can securely upload their medical records encrypted with AES-256, store them on IPFS, and selectively share access with registered healthcare institutions. All encryption keys are stored on-chain in encrypted form, ensuring that only authorized parties can decrypt and access sensitive medical data.

## Table of contents

- [Arkiv](#arkiv)
  - [Table of contents](#table-of-contents)
  - [What is Arkiv?](#what-is-arkiv)
  - [High-level flow (how record sharing works)](#high-level-flow-how-record-sharing-works)
    - [1. Institution registration](#1-institution-registration)
    - [2. Record upload](#2-record-upload)
    - [3. Access management](#3-access-management)
  - [User Flow](#user-flow)
  - [Institution Flow](#institution-flow)
  - [Project layout \& where to look next](#project-layout--where-to-look-next)
  - [License](#license)

## What is Arkiv?

Arkiv is a decentralized medical records platform built on FHEVM where:

- Healthcare institutions register on-chain with their credentials and contact information.
- Users encrypt their medical records client-side using AES-256 before uploading to IPFS.
- The encryption key is stored in the contract's metadata field, keeping it secure on-chain.
- Users can selectively grant or revoke access to registered institutions.
- Authorized institutions can retrieve the encryption key and decrypt records for viewing or downloading.

The goal: give patients full control over their medical data while enabling secure, permissioned sharing with healthcare providers.
## High-level flow (how record sharing works)

### 1. Institution registration
- Healthcare institutions register on-chain with their name, description, and contact information.
- Registration creates a verified on-chain identity that users can trust.
- All registered institutions are publicly viewable to users.

### 2. Record upload
- Users upload their medical records through the frontend.
- During upload, an AES-256 encryption key is generated client-side.
- The file is encrypted with this key before being uploaded to IPFS.
- The IPFS CID and the encryption key (stored in metadata) are saved to the smart contract.
- The encrypted file remains private and accessible only to the owner.

### 3. Access management
- Users can grant access to specific registered institutions by sharing the file.
- The institution receives permission to retrieve the encryption key from the contract.
- Institutions can view and download the decrypted medical records.
- Users can revoke access at any time, removing the institution's ability to decrypt the files.

Key idea: Users maintain complete control over who can access their medical records, with all permissions managed transparently on-chain.

## User Flow
```
                        ┌─────────────────────────┐
                        │   Upload Medical File   │
                        │  (Generate AES-256 Key) │
                        └───────────┬─────────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │  Encrypt File Locally   │
                        └───────────┬─────────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │   Upload to IPFS        │
                        │   (Get CID)             │
                        └───────────┬─────────────┘
                                    │
                                    ▼
                        ┌─────────────────────────┐
                        │   Call createFile()     │
                        │  (Store CID + Key)      │
                        └───────────┬─────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
                ▼                                       ▼
    ┌───────────────────────┐              ┌───────────────────────┐
    │   View My Files       │              │  Grant Access to      │
    │ getFilesByOwner()     │              │  Institution          │
    └───────────────────────┘              │  grantAccess()        │
                                           └───────────┬───────────┘
                                                       │
                                   ┌───────────────────┴───────────────────┐
                                   │                                       │
                                   ▼                                       ▼
                        ┌───────────────────────┐            ┌───────────────────────┐
                        │  View Recipients      │            │   Revoke Access       │
                        │ listRecipients()      │            │  revokeAccess()       │
                        └───────────────────────┘            └───────────────────────┘
```

## Institution Flow
```
                        ┌─────────────────────────────┐
                        │  Register Institution       │
                        │ registerInstitution()       │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Receive Access Grant       │
                        │  (AccessGranted Event)      │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Verify Access              │
                        │  hasAccess()                │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Retrieve File Metadata     │
                        │  getFileMetadata()          │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Get Encryption Key         │
                        │  (From Metadata)            │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Download from IPFS         │
                        │  getFileCid()               │
                        └──────────────┬──────────────┘
                                       │
                                       ▼
                        ┌─────────────────────────────┐
                        │  Decrypt & View File        │
                        │  (Using AES-256 Key)        │
                        └─────────────────────────────┘
```

---

## Project layout & where to look next

- `contracts/Readme.md` - **(Contracts README)** Contains detailed instructions for:
    - Building, testing, and deploying the Arkiv smart contract
    - FHEVM / Hardhat configuration
    - Contract architecture and functions
- `app/Readme.md` - **(Frontend README)** Contains:
    - How to run the frontend application
    - How to connect to Sepolia testnet
    - User and institution workflows

You can jump directly to those docs:
- Contract: [contract/Readme.md](./contracts/README.md)
- Frontend app: [webapp/Readme.md](./app/README.md)

## License

MIT — see [LICENSE](./LICENSE) in this repository.