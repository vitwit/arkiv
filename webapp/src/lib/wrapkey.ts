// utils/wrapKey.ts
import EthCrypto from "eth-crypto";

/**
 * Wrap raw AES key bytes with recipient public key (uncompressed hex without 0x or with 0x).
 * Returns JSON string (you can store bytes(JSON)).
 */
export function wrapKeyWithEthPublicKey(recipientPublicKeyHex: string, rawKey: Uint8Array): string {
  // eth-crypto expects public key without 0x prefix and without leading '04' sometimes, but it accepts 04...
  const pub = recipientPublicKeyHex.replace(/^0x/, "");
  // Convert rawKey to base64 to make the encrypted payload a string
  const rawBase64 = Buffer.from(rawKey).toString("base64");
  const encrypted = EthCrypto.encryptWithPublicKey(pub, rawBase64);
  return JSON.stringify(encrypted);
}

/**
 * Unwrap JSON string using recipient private key (0x-prefixed)
 * Returns raw Uint8Array key
 */
export async function unwrapKeyWithEthPrivateKey(recipientPrivateKey: string, wrappedJson: string): Promise<Uint8Array> {
  const encrypted = JSON.parse(wrappedJson);
  const decryptedBase64 = await EthCrypto.decryptWithPrivateKey(recipientPrivateKey, encrypted);
  return Uint8Array.from(Buffer.from(decryptedBase64, "base64"));
}
