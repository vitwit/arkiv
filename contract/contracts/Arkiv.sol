// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, euint64, externalEuint32, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Arkiv
 * @notice Stores IPFS CID + metadata + AES-256 (encrypted) key split into four euint64 words per recipient.
 *         Uses Zama FHE primitives: externalEuint64, FHE.fromExternal, FHE.allow, etc.
 *
 * Design decisions:
 * - AES-256 key is stored as 4 x 64-bit encrypted words (wordIndex 0..3).
 * - Owner uploads all 4 words for each recipient in a single transaction via storeKeyWordsBatch.
 * - Recipients read their four encrypted words via getKeyWords and use node re-encryption (fhevmjs) to decrypt locally.
 */
contract Arkiv is SepoliaConfig {
    uint256 private constant AES256_WORDS = 4; // 4 * 64 = 256 bits

    struct FileMeta {
        address owner;
        string cid;
        string metadata;
        address[] recipients;
        mapping(address => bool) canAccess;
        // track how many words stored for a recipient (should be 4 for AES-256)
        mapping(address => uint256) keyWords;
        // encrypted key words: recipient => (index => euint64)
        mapping(address => mapping(uint256 => euint64)) encKey;
        bool exists;
    }

    mapping(bytes32 => FileMeta) private _files;

    struct Institution {
        string name; // Institution name
        string description; // Short description
        string contactInfo; // e.g., email, phone, website
        address account; // Ethereum address of the institution
        bool exists; // Flag to check if registered
    }

    mapping(address => Institution) public institutions;
    address[] public institutionList;

    event InstitutionRegistered(address indexed account, string name);

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
        for (uint i = 0; i < institutionList.length; i++) {
            list[i] = institutions[institutionList[i]];
        }
        return list;
    }

    // Events
    event FileCreated(bytes32 indexed fileId, address indexed owner, string cid, string metadata);
    event AccessGranted(bytes32 indexed fileId, address indexed grantee);
    event AccessRevoked(bytes32 indexed fileId, address indexed grantee);
    event KeyWordsStored(bytes32 indexed fileId, address indexed grantee, uint256 wordsStored);

    // --- File lifecycle -----------------------------------------------------

    function createFile(bytes32 fileId, string calldata cid, string calldata metadata) external {
        require(!_files[fileId].exists, "File: already exists");
        FileMeta storage f = _files[fileId];
        f.owner = msg.sender;
        f.cid = cid;
        f.metadata = metadata;
        f.exists = true;
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

    // --- Access control -----------------------------------------------------

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

        // Optionally clear stored ciphertexts for gas cost reasons (owner pays gas)
        uint256 words = f.keyWords[grantee];
        if (words > 0) {
            for (uint256 i = 0; i < words; i++) {
                f.encKey[grantee][i] = FHE.asEuint64(0);
            }
            f.keyWords[grantee] = 0;
        }
    }

    function listRecipients(bytes32 fileId) external view returns (address[] memory) {
        require(_files[fileId].exists, "File: not found");
        return _files[fileId].recipients;
    }

    function hasAccess(bytes32 fileId, address account) external view returns (bool) {
        require(_files[fileId].exists, "File: not found");
        return _files[fileId].canAccess[account];
    }

    // --- AES-256 key upload (batch) ----------------------------------------

    /**
     * @dev Store AES-256 key for a grantee as four externalEuint64 entries.
     * @param fileId The file identifier.
     * @param grantee Recipient address.
     * @param encWords Array of 4 externalEuint64 encrypted words.
     * @param inputProofs Array of 4 proofs corresponding to each encWord.
     *
     * Requirements:
     * - caller must be file owner
     * - encWords.length == AES256_WORDS
     * - inputProofs.length == AES256_WORDS
     */
    function storeKeyWordsBatch(
        bytes32 fileId,
        address grantee,
        externalEuint64[] calldata encWords,
        bytes[] calldata inputProofs
    ) external onlyFileOwner(fileId) {
        require(encWords.length == AES256_WORDS, "Must supply 4 encrypted words");
        require(inputProofs.length == AES256_WORDS, "Must supply 4 proofs");

        FileMeta storage f = _files[fileId];

        // Ensure ACL
        if (!f.canAccess[grantee]) {
            grantAccess(fileId, grantee);
        }

        // Materialize and persist each encrypted word
        for (uint256 i = 0; i < AES256_WORDS; i++) {
            euint64 word = FHE.fromExternal(encWords[i], inputProofs[i]);
            f.encKey[grantee][i] = word;
            // grant long-lived read permission to grantee for this ciphertext
            FHE.allow(word, grantee);
        }

        // Track number of words (should be 4)
        f.keyWords[grantee] = AES256_WORDS;

        emit KeyWordsStored(fileId, grantee, AES256_WORDS);
    }

    function keyWordCount(bytes32 fileId, address account) external view returns (uint256) {
        require(_files[fileId].exists, "File: not found");
        return _files[fileId].keyWords[account];
    }

    /**
     * @dev Return the encrypted word at index for the caller (must have ACL).
     *      We return euint64 single values to avoid large dynamic returns of custom types.
     */
    function getKeyWord(bytes32 fileId, uint256 wordIndex) external view returns (euint64) {
        require(_files[fileId].exists, "File: not found");
        require(_files[fileId].canAccess[msg.sender], "Not authorized");
        require(wordIndex < AES256_WORDS, "wordIndex out of range");
        return _files[fileId].encKey[msg.sender][wordIndex];
    }

    /**
     * @dev Owner helper: read a stored encrypted word for any recipient (owner only).
     */
    function getKeyWordFor(
        bytes32 fileId,
        address account,
        uint256 wordIndex
    ) external view onlyFileOwner(fileId) returns (euint64) {
        require(_files[fileId].exists, "File: not found");
        require(wordIndex < AES256_WORDS, "wordIndex out of range");
        return _files[fileId].encKey[account][wordIndex];
    }
}
