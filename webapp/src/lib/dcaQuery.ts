/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from 'ethers';
import { ABI, contractAddress } from './dcaTx';
import type { Arkiv } from './Arkiv';

export interface Institution {
  name: string;
  description: string;
  contactInfo: string;
  account: string;
  exists: boolean;
}

export async function getInstitutions(): Promise<Institution[]> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  const institutions: any[] = await contract.listInstitutions();
  return institutions as unknown as Institution[];
}

export async function getFileCid(fileId: string): Promise<string | null> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const cid = await contract.getFileCid(fileId);
    return cid;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getFileMetadata(fileId: string): Promise<string | null> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const metadata = await contract.getFileMetadata(fileId);
    return metadata;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getFilesByOwner(owner: string): Promise<string[]> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const fileIds: string[] = await contract.getFilesByOwner(owner);
    // Convert bytes32 → string (if needed, e.g., from keccak256 hash to hex)
    return fileIds.map((id) => id.toString());
  } catch (err) {
    console.error('Error fetching files for owner:', err);
    return [];
  }
}

// export async function listRecipients(fileId: string): Promise<string[]> {
//   const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
//   const contract = new ethers.Contract(
//     contractAddress,
//     ABI,
//     provider
//   ) as unknown as Arkiv;

//   try {
//     const recipients = await contract.listRecipients(fileId);
//     return recipients;
//   } catch (err) {
//     console.log(err);
//     return [];
//   }
// }


export async function listRevokedRecipients(fileId: string): Promise<string[]> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const recipients = await contract.listRecipients(fileId);
    return recipients;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export interface FileResult {
  fileId: string;
  owner: string;
  cid: string;
  metadata: string;
  recipients: string[];
  keyWordCount: number;
}

export async function getFileDetails(
  fileId: string
): Promise<FileResult | null> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const cid = await contract.getFileCid(fileId);
    const metadata = await contract.getFileMetadata(fileId);
    const recipients = await contract.listRecipients(fileId);

    return {
      fileId,
      owner: '',
      cid,
      metadata,
      recipients,
      keyWordCount: 0,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function getRecipientKeyWordCount(
  fileId: string,
  recipient: string
): Promise<number> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const count = await contract.keyWordCount(fileId, recipient);
    return Number(count);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function checkFileAccess(
  fileId: string,
  account: string
): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    return await contract.hasAccess(fileId, account);
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function getFileRecipients(fileId: string): Promise<string[]> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    return await contract.listRecipients(fileId);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export interface InstitutionDetails {
  name: string;
  description: string;
  contactInfo: string;
  account: string;
  exists: boolean;
}

export async function getInstitutionDetails(
  account: string
): Promise<InstitutionDetails | null> {
  const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  const contract = new ethers.Contract(
    contractAddress,
    ABI,
    provider
  ) as unknown as Arkiv;

  try {
    const institution = await contract.getInstitution(account);
    return {
      name: institution.name,
      description: institution.description,
      contactInfo: institution.contactInfo,
      account: institution.account,
      exists: institution.exists,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}
