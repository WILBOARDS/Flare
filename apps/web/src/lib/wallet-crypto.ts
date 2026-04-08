/**
 * Client-side wallet cryptography utilities.
 *
 * Security model:
 * - Mnemonics and private keys are generated entirely in the browser.
 * - The mnemonic is encrypted with AES-256-GCM derived from a user-chosen
 *   password via PBKDF2 (100 000 iterations, SHA-256).
 * - Only the encrypted keystore JSON (+ the plain wallet address) is sent to
 *   the server. The server stores the keystore opaquely and never sees the
 *   plaintext mnemonic or private key.
 * - The mnemonic is shown once for manual backup and then discarded from
 *   memory; it is NOT stored in any persistent client-side storage.
 */

import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { mnemonicToAccount } from 'viem/accounts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletKeystore {
  version: 1;
  address: string;
  cipher: 'aes-256-gcm';
  ciphertext: string; // hex
  iv: string;         // hex, 12 bytes
  salt: string;       // hex, 16 bytes
  kdf: 'pbkdf2';
  kdfparams: {
    iterations: number;
    hash: string;
    keylen: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function deriveKey(
  password: string,
  salt: Uint8Array,
  usage: 'encrypt' | 'decrypt',
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Generate a fresh BIP-39 wallet. Returns the 12-word mnemonic and address. */
export function generateWallet(): { mnemonic: string; address: string } {
  const mnemonic = generateMnemonic(wordlist, 128); // 12 words
  const account = mnemonicToAccount(mnemonic);
  return { mnemonic, address: account.address };
}

/** Derive the Ethereum address from a mnemonic phrase. */
export function addressFromMnemonic(mnemonic: string): string {
  return mnemonicToAccount(mnemonic).address;
}

/**
 * Encrypt a mnemonic phrase with a user-chosen password.
 * Returns the keystore JSON string to be stored server-side.
 */
export async function encryptMnemonic(
  mnemonic: string,
  password: string,
  address: string,
): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveKey(password, salt, 'encrypt');
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(mnemonic),
  );

  const keystore: WalletKeystore = {
    version: 1,
    address,
    cipher: 'aes-256-gcm',
    ciphertext: bytesToHex(new Uint8Array(ciphertext)),
    iv: bytesToHex(iv),
    salt: bytesToHex(salt),
    kdf: 'pbkdf2',
    kdfparams: { iterations: 100_000, hash: 'SHA-256', keylen: 32 },
  };

  return JSON.stringify(keystore);
}

/**
 * Decrypt a keystore JSON string with the user's wallet password.
 * Throws if the password is wrong (AES-GCM authentication will fail).
 */
export async function decryptMnemonic(
  keystoreJson: string,
  password: string,
): Promise<string> {
  const dec = new TextDecoder();
  const keystore: WalletKeystore = JSON.parse(keystoreJson);

  const salt = hexToBytes(keystore.salt);
  const iv = hexToBytes(keystore.iv);
  const ciphertext = hexToBytes(keystore.ciphertext);

  const key = await deriveKey(password, salt, 'decrypt');
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return dec.decode(decrypted);
}

/** Basic Ethereum address format check. */
export function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address);
}
