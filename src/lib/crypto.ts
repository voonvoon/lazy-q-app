// lib/crypto.ts
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET!;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_SECRET environment variable is required');
}

export function encrypt(text: string): string {
  if (!text) return '';
  
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

// For displaying masked keys in UI
export function maskKey(key: string): string {
  if (!key || key.length < 8) return '••••••••';
  
  const start = key.slice(0, 4);
  const end = key.slice(-4);
  return `${start}••••••••${end}`;
}