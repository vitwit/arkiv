import { ethers } from 'ethers';
import contractJson from './Arkiv.json';
import type { Arkiv } from './Arkiv';

export const contractAddress =
  import.meta.env.VITE_CONTRACT || '0xa7c0881009756025F52952e380896fC1D008D448';
export const ABI = contractJson.abi;

export interface TransactionConfirmation {
  hash: string;
}

export async function getProviderAndSigner() {
  if (!window.ethereum) throw new Error('Please install wallet!');

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send('eth_accounts', []);

  if (!accounts.length) {
    // Only prompt if no accounts connected yet
    await provider.send('eth_requestAccounts', []);
  }

  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getContract(readOnly = false): Promise<Arkiv> {
  if (readOnly) {
    const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
    return new ethers.Contract(
      contractAddress,
      ABI,
      provider
    ) as unknown as Arkiv;
  }

  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(contractAddress, ABI, signer) as unknown as Arkiv;
}

export async function registerInstitution(
  name: string,
  description: string,
  contactInfo: string
): Promise<TransactionConfirmation> {
  const contract = await getContract();

  try {
    const tx = await contract.registerInstitution(
      name,
      description,
      contactInfo,
      {
        gasLimit: 500000n,
      }
    );

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    return {
      hash: receipt?.hash || '',
    };
  } catch (err) {
    console.error('Error sending transaction:', err);
    throw err;
  }
}


export async function createFile(
  fileId: string,
  cid: string,
  metadata: string
): Promise<TransactionConfirmation> {
  const contract = await getContract();
  try {
    const tx = await contract.createFile(fileId, cid, metadata);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    return {
      hash: receipt?.hash || '',
    };
  } catch (err) {
    console.error('Error sending transaction:', err);
    throw err;
  }
}

export async function grantAccess(
  fieldId: string,
  grantee: string
): Promise<TransactionConfirmation> {
  const contract = await getContract();
  try {
    const tx = await contract.grantAccess(fieldId, grantee);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    return {
      hash: receipt?.hash || '',
    };
  } catch (err) {
    console.error('Error sending transaction:', err);
    throw err;
  }
}

export async function revokeAccess(
  fieldId: string,
  grantee: string
): Promise<TransactionConfirmation> {
  const contract = await getContract();
  try {
    const tx = await contract.revokeAccess(fieldId, grantee);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);
    return {
      hash: receipt?.hash || '',
    };
  } catch (err) {
    console.error('Error sending transaction:', err);
    throw err;
  }
}
