# Arkiv - Confidential Medical Records Management (FHEVM)

A Hardhat-based project implementing a privacy-preserving medical records management system using the FHEVM protocol by Zama.

This contract (Arkiv.sol) enables secure healthcare data sharing with fully homomorphic encryption (FHE):
- Encryption keys remain confidential on-chain using encrypted 64-bit words
- Medical records stored on IPFS with encrypted access control
- Healthcare institutions can register and be verified on-chain
- Patients control access grants and revocations with automatic key cleanup
- Recipients decrypt keys locally without exposing sensitive data

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 18 or higher
- **npm or yarn/pnpm**: Package manager
- **IPFS**: For storing encrypted medical records (optional for testing)

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
│   └── Arkiv.test.ts              # Comprehensive tests
├── hardhat.config.ts              # Hardhat config
└── package.json
```

## ⚙️ Core Features

### 🔹 Institution Registry

- Healthcare providers register on-chain with:
  - Institution name and description
  - Contact information
  - Verified Ethereum address
- Public directory of registered institutions

### 🔹 File Management

- Create medical record entries with:
  - IPFS CID (content identifier)
  - Optional metadata
  - Owner address
- Retrieve file information and metadata

### 🔹 Confidential Access Control

- Grant/revoke access to specific recipients
- Automatic access list management
- Owner-only permissions for access control

### 🔹 Encrypted Key Storage

- AES-256 encryption keys split into 4×64-bit encrypted words
- Each recipient receives their own encrypted key copy
- Keys stored using FHEVM euint64 primitives
- Batch upload for gas efficiency

### 🔹 Key Retrieval

- Recipients fetch their encrypted key words
- Local decryption using fhevmjs library
- Zero-knowledge: contract never sees plaintext keys
- Owner can view all stored keys for audit purposes

### 🔹 Access Revocation

- Immediate access removal
- Automatic cleanup of encrypted keys
- Maintains privacy even after revocation

## 📜 Available Scripts

| Script             | Description              |
| ------------------ | ------------------------ |
| `npm run compile`  | Compile all contracts    |
| `npm run test`     | Run all tests            |
| `npm run coverage` | Generate coverage report |
| `npm run lint`     | Run linting checks       |
| `npm run clean`    | Clean build artifacts    |

## 🔄 Application Flow

### Owner Flow
```
Create File → Grant Access → Store Encrypted Key → Monitor Access → Revoke (Optional)
```

### Healthcare Provider Flow
```
Register Institution → Receive Access Grant → Retrieve Encrypted Keys → Decrypt Locally → Access Medical Records
```

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

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using Zama FHEVM**