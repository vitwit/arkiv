// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Arkiv
 * @notice Stores IPFS CID + metadata + AES-256 (encrypted) key split into four euint64 words per recipient.
 *         Uses Zama FHE primitives optionally (kept), and also supports storing wrapped key blobs (bytes)
 *         which are easier to produce client-side initially.
 */
contract Arkiv is SepoliaConfig {
    struct FileMeta {
        address owner;
        string cid;
        string metadata;
        address[] recipients;
        mapping(address => bool) canAccess;
        bool exists;
    }

    mapping(bytes32 => FileMeta) private _files;
    mapping(address => bytes32[]) private _ownerFiles;
    // Stores all uploaded file IDs (public so frontend can access directly)
    bytes32[] public allFiles;

    struct Institution {
        string name;
        string description;
        string contactInfo;
        address account;
        bool exists;
    }

    mapping(address => Institution) public institutions;
    address[] public institutionList;

    event InstitutionRegistered(address indexed account, string name);
    event FileCreated(bytes32 indexed fileId, address indexed owner, string cid, string metadata);
    event AccessGranted(bytes32 indexed fileId, address indexed grantee);
    event AccessRevoked(bytes32 indexed fileId, address indexed grantee);

    // ---------------- Institutions -----------------------------------------
    function registerInstitution(
        string calldata name,
        string calldata description,
        string calldata contactInfo
    ) external {
        require(!institutions[msg.sender].exists, "Already registered");
        institutions[msg.sender] = Institution({
            name: name,
            description: description,
            contactInfo: contactInfo,
            account: msg.sender,
            exists: true
        });
        institutionList.push(msg.sender);
        emit InstitutionRegistered(msg.sender, name);
    }

    function getInstitution(address account) external view returns (Institution memory) {
        require(institutions[account].exists, "Institution not found");
        return institutions[account];
    }

    function listInstitutions() external view returns (Institution[] memory) {
        Institution[] memory list = new Institution[](institutionList.length);
        for (uint256 i = 0; i < institutionList.length; i++) {
            list[i] = institutions[institutionList[i]];
        }
        return list;
    }

    // ---------------- Files ------------------------------------------------
    function createFile(bytes32 fileId, string calldata cid, string calldata metadata) external {
        require(!_files[fileId].exists, "File: already exists");
        FileMeta storage f = _files[fileId];
        f.owner = msg.sender;
        f.cid = cid;
        f.metadata = metadata;
        f.exists = true;
        _ownerFiles[msg.sender].push(fileId);
        allFiles.push(fileId);
        emit FileCreated(fileId, msg.sender, cid, metadata);
    }

    function getFileCid(bytes32 fileId) external view returns (string memory) {
        require(_files[fileId].exists, "File: not found");
        return _files[fileId].cid;
    }

    function getFileMetadata(bytes32 fileId) external view returns (string memory) {
        require(_files[fileId].exists, "File: not found");
        return _files[fileId].metadata;
    }

    function getFilesByOwner(address owner) external view returns (bytes32[] memory) {
        return _ownerFiles[owner];
    }

    function getAllFiles() external view returns (bytes32[] memory) {
        return allFiles;
    }

    modifier onlyFileOwner(bytes32 fileId) {
        require(_files[fileId].exists, "File: not found");
        require(_files[fileId].owner == msg.sender, "Only file owner");
        _;
    }

    function grantAccess(bytes32 fileId, address grantee) public onlyFileOwner(fileId) {
        FileMeta storage f = _files[fileId];
        if (!f.canAccess[grantee]) {
            f.canAccess[grantee] = true;
            f.recipients.push(grantee);
            emit AccessGranted(fileId, grantee);
        }
    }

    function revokeAccess(bytes32 fileId, address grantee) public onlyFileOwner(fileId) {
        FileMeta storage f = _files[fileId];
        require(f.canAccess[grantee], "Not granted");
        f.canAccess[grantee] = false;
        emit AccessRevoked(fileId, grantee);
    }

    // --- Listing recipients (only active / revoked) ------------------------
    function listRecipients(bytes32 fileId) external view returns (address[] memory) {
        FileMeta storage f = _files[fileId];
        require(f.exists, "File: not found");

        uint256 total = f.recipients.length;
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            if (f.canAccess[f.recipients[i]]) count++;
        }

        address[] memory activeRecipients = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            address r = f.recipients[i];
            if (f.canAccess[r]) {
                activeRecipients[idx] = r;
                idx++;
            }
        }
        return activeRecipients;
    }

    function listRevokedRecipients(bytes32 fileId) external view returns (address[] memory) {
        FileMeta storage f = _files[fileId];
        require(f.exists, "File: not found");

        uint256 total = f.recipients.length;
        uint256 count = 0;
        for (uint256 i = 0; i < total; i++) {
            if (!f.canAccess[f.recipients[i]]) count++;
        }

        address[] memory revokedRecipients = new address[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < total; i++) {
            address r = f.recipients[i];
            if (!f.canAccess[r]) {
                revokedRecipients[idx] = r;
                idx++;
            }
        }
        return revokedRecipients;
    }

    function hasAccess(bytes32 fileId, address account) external view returns (bool) {
        require(_files[fileId].exists, "File: not found");
        return _files[fileId].canAccess[account];
    }
}
