/**
 * Cryptography Utilities
 * 
 * Provides functions for certificate signing and verification using RSA.
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Sign data using RSA private key
 */
export function signData(data: string): string {
  try {
    const privateKeyPath = process.env.CERT_PRIVATE_KEY_PATH || path.join(__dirname, '../../keys/private.pem');
    
    if (!fs.existsSync(privateKeyPath)) {
      throw new Error(`Private key not found at: ${privateKeyPath}`);
    }

    const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    sign.end();
    
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    console.error('Error signing data:', error);
    throw error;
  }
}

/**
 * Verify signature using RSA public key
 */
export function verifySignature(data: string, signature: string): boolean {
  try {
    const publicKeyPath = process.env.CERT_PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/public.pem');
    
    if (!fs.existsSync(publicKeyPath)) {
      throw new Error(`Public key not found at: ${publicKeyPath}`);
    }

    const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    verify.end();
    
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Generate SHA256 hash
 */
export function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate random wipe ID
 */
export function generateWipeId(): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `ZT-${timestamp}-${random}`;
}
