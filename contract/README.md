# Arkiv - Confidential Medical Records Management (FHEVM)

A Hardhat-based project implementing a privacy-preserving medical records management system using the FHEVM protocol by Zama.

This contract (Arkiv.sol) enables secure healthcare data sharing with client-side encryption:
- Medical records encrypted with AES-256 keys generated client-side
- Encryption keys stored securely in contract metadata
- Medical records stored on IPFS with encrypted access control
- Healthcare institutions can register and be verified on-chain
- Patients control access grants and revocations through smart contract permissions
- Only authorized recipients can retrieve encryption keys and decrypt records

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

### 🧰 Prerequisites

Before you begin, ensure you have the following installed:

- **[Node.js (v18 or higher)](https://nodejs.org/en/download/)** — required for Hardhat and dependencies  
- **[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)**, **[yarn](https://classic.yarnpkg.com/lang/en/docs/install/)**, or **[pnpm](https://pnpm.io/installation)** — for managing packages  
- **[IPFS](https://docs.ipfs.tech/install/)** — used to store encrypted medical records  


### Installation

1. **Install dependencies**
```bash
   npm install
```

2. **Set up environment variables**
```bash
   npx hardhat vars set MNEMONIC

   # Set your Infura API key for network access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Set Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
```

3. **Compile and test**
```bash
   npm run compile
   npm run test
```

4. **Deploy to local network**
```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
```

5. **Deploy to Sepolia Testnet**
```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

6. **Test on Sepolia Testnet**
```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
```

## 📁 Project Structure
```
arkiv/
├── contracts/
│   └── Arkiv.sol                  # Main contract
├── deploy/                        # Deployment scripts
├── test/
│   └── Arkiv.ts                   # Comprehensive tests
├── hardhat.config.ts              # Hardhat config
└── package.json
```

## ⚙️ Core Features

### 🔹 Institution Registry

- Healthcare providers register on-chain with:
  - Institution name and description
  - Contact information
  - Verified Ethereum address
- Public directory of registered institutions (`listInstitutions()`)
- Individual institution lookup (`getInstitution()`)

### 🔹 File Management

- Users create medical record entries with:
  - Unique file ID (bytes32)
  - IPFS CID (content identifier)
  - Metadata containing AES-256 encryption key
- File ownership tracked on-chain
- Retrieve file CID via `getFileCid()`
- Retrieve metadata via `getFileMetadata()`
- List files by owner via `getFilesByOwner()`
- List all files via `getAllFiles()`

### 🔹 Access Control

- Grant access to specific institutions (`grantAccess()`)
- Revoke access from institutions (`revokeAccess()`)
- Check access permissions (`hasAccess()`)
- List active recipients (`listRecipients()`)
- List revoked recipients (`listRevokedRecipients()`)
- Owner-only permissions for access control

### 🔹 Encryption Key Management

- AES-256 encryption keys generated client-side during file upload
- Keys stored securely in the contract's metadata field
- Only authorized recipients can retrieve keys from metadata
- Recipients decrypt files locally using the retrieved key
- Owner maintains full control over key access

### 🔹 Privacy Features

- Medical files encrypted before IPFS upload
- Encryption keys never exposed in plaintext on-chain
- Access control enforced at smart contract level
- Immediate key access removal upon revocation
- Recipients can only access keys for files they're authorized to view

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 📚 Documentation

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)
- [FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)

## 🎯 Use Cases

- Patient-controlled health record sharing
- Secure inter-institutional medical data transfer
- Telemedicine with privacy-preserving access
- Clinical research with encrypted data access
- Insurance claim verification without exposing full records
- Emergency medical access with revocable permissions

## 🔐 Security Features

- **Client-side encryption**: Files encrypted before leaving user's device
- **On-chain access control**: Smart contract enforces permissions
- **IPFS storage**: Decentralized file storage with content addressing
- **Metadata security**: Encryption keys stored in contract metadata
- **Immediate revocation**: Access removal takes effect instantly
- **Owner-only operations**: Only file owners can grant/revoke access
- **Transparent audit trail**: All access grants/revokes recorded via events

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Zama FHEVM**