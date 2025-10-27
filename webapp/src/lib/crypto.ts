// lib/crypto.ts - Complete crypto utilities with ECIES support

import { ethers } from 'ethers';

/**
 * Generate a random AES-256 key (32 bytes)
 */
export async function generateAesKeyRaw(): Promise<Uint8Array> {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Encrypt file with AES-GCM
 */
export async function encryptFileWithAesGcm(
  file: File,
  aesKey: Uint8Array
): Promise<{ cipher: Uint8Array; iv: Uint8Array }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
  const fileBuffer = await file.arrayBuffer();

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    aesKey,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    fileBuffer
  );

  return {
    cipher: new Uint8Array(encrypted),
    iv,
  };
}

/**
 * Decrypt file with AES-GCM
 */
export async function decryptWithAesGcm(
  ciphertext: Uint8Array,
  iv: Uint8Array,
  aesKey: Uint8Array
): Promise<Uint8Array> {
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    aesKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    ciphertext
  );

  return new Uint8Array(decrypted);
}

/**
 * Derive public key from Ethereum address using wallet signature
 */
export async function getPublicKeyFromWallet(address: string): Promise<string> {
  if (!window.ethereum) throw new Error('Wallet not found');
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Request encryption public key from MetaMask
  // This uses the eth_getEncryptionPublicKey RPC method
  try {
    const publicKey = await window.ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [address],
    });
    return publicKey;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the request for encryption public key');
    }
    throw error;
  }
}

/**
 * Encrypt AES key with recipient's public key using MetaMask encryption
 */
export async function encryptForRecipient(
  aesKey: Uint8Array,
  recipientPublicKey: string
): Promise<string> {
  if (!window.ethereum) throw new Error('Wallet not found');

  // Convert Uint8Array to hex string
  const aesKeyHex = Array.from(aesKey)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Use MetaMask's encryption (ECIES)
  const encryptedData = await window.ethereum.request({
    method: 'eth_encrypt',
    params: [recipientPublicKey, aesKeyHex],
  });

  // Return as JSON string (contains version, nonce, ephemPublicKey, ciphertext)
  return JSON.stringify(encryptedData);
}

/**
 * Decrypt wrapped key using user's private key (via MetaMask)
 */
export async function decryptWrappedKey(
  wrappedKeyJson: string,
  userAddress: string
): Promise<Uint8Array> {
  if (!window.ethereum) throw new Error('Wallet not found');

  try {
    // Parse the encrypted data
    const encryptedData = JSON.parse(wrappedKeyJson);

    // Decrypt using MetaMask
    const decryptedHex = await window.ethereum.request({
      method: 'eth_decrypt',
      params: [encryptedData, userAddress],
    });

    // Convert hex string back to Uint8Array
    const aesKey = new Uint8Array(
      decryptedHex.match(/.{1,2}/g).map((byte: string) => parseInt(byte, 16))
    );

    return aesKey;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the decryption request');
    }
    throw error;
  }
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}