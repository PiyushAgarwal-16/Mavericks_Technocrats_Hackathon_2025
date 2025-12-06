import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Canonicalize JSON object by sorting keys alphabetically.
 * This ensures the same payload always produces the same signature.
 */
function canonicalizeJSON(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalizeJSON(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => {
    const value = canonicalizeJSON(obj[key]);
    return `"${key}":${value}`;
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Load RSA private key from environment variable or file system.
 */
function loadPrivateKey(): string {
  // First, try to load from environment variable (for Railway/cloud deployment)
  const privateKeyEnv = process.env.CERT_PRIVATE_KEY;
  if (privateKeyEnv) {
    console.log('📝 Loading private key from environment variable');
    console.log('📏 Key length:', privateKeyEnv.length);
    console.log('🔍 Key preview:', privateKeyEnv.substring(0, 50) + '...');
    
    // Handle different newline encodings
    let key = privateKeyEnv;
    // Replace literal \n with actual newlines
    if (key.includes('\\n')) {
      key = key.replace(/\\n/g, '\n');
    }
    // Ensure proper PEM format
    if (!key.includes('\n') && key.includes('-----')) {
      // Key might be on single line, try to add newlines
      key = key.replace(/-----BEGIN PRIVATE KEY-----/, '-----BEGIN PRIVATE KEY-----\n')
                .replace(/-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----')
                .replace(/([A-Za-z0-9+/=]{64})/g, '$1\n');
    }
    console.log('✅ Private key loaded from environment');
    return key;
  }

  // Fallback to file system (for local development)
  console.log('📁 Loading private key from file system');
  const keyPath = process.env.CERT_PRIVATE_KEY_PATH || path.join(__dirname, '../../keys/private.pem');
  
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Private key not found. Set CERT_PRIVATE_KEY environment variable or provide file at: ${keyPath}`);
  }

  console.log('✅ Private key loaded from file:', keyPath);
  return fs.readFileSync(keyPath, 'utf8');
}

/**
 * Load RSA public key from environment variable or file system.
 */
function loadPublicKey(): string {
  // First, try to load from environment variable (for Railway/cloud deployment)
  const publicKeyEnv = process.env.CERT_PUBLIC_KEY;
  if (publicKeyEnv) {
    console.log('📝 Loading public key from environment variable');
    
    // Handle different newline encodings
    let key = publicKeyEnv;
    // Replace literal \n with actual newlines
    if (key.includes('\\n')) {
      key = key.replace(/\\n/g, '\n');
    }
    // Ensure proper PEM format
    if (!key.includes('\n') && key.includes('-----')) {
      key = key.replace(/-----BEGIN PUBLIC KEY-----/, '-----BEGIN PUBLIC KEY-----\n')
                .replace(/-----END PUBLIC KEY-----/, '\n-----END PUBLIC KEY-----')
                .replace(/([A-Za-z0-9+/=]{64})/g, '$1\n');
    }
    console.log('✅ Public key loaded from environment');
    return key;
  }

  // Fallback to file system (for local development)
  console.log('📁 Loading public key from file system');
  const keyPath = process.env.CERT_PUBLIC_KEY_PATH || path.join(__dirname, '../../keys/public.pem');
  
  if (!fs.existsSync(keyPath)) {
    throw new Error(`Public key not found. Set CERT_PUBLIC_KEY environment variable or provide file at: ${keyPath}`);
  }

  console.log('✅ Public key loaded from file:', keyPath);
  return fs.readFileSync(keyPath, 'utf8');
}

/**
 * Sign certificate payload using RSA-SHA256.
 * Returns base64-encoded signature.
 * 
 * @param payload - Certificate payload object containing wipeId, userId, deviceModel, etc.
 * @returns Base64-encoded signature
 */
export function signCertificatePayload(payload: object): string {
  try {
    console.log('🔐 Starting certificate signing...');
    const privateKey = loadPrivateKey();
    const canonicalPayload = canonicalizeJSON(payload);
    console.log('📦 Canonical payload length:', canonicalPayload.length);
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(canonicalPayload);
    sign.end();
    
    const signature = sign.sign(privateKey, 'base64');
    console.log('✅ Signature created successfully');
    console.log('📝 Signature length:', signature.length);
    return signature;
  } catch (error) {
    console.error('❌ Error signing certificate payload:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw new Error('Failed to sign certificate payload');
  }
}

/**
 * Verify certificate signature using RSA-SHA256.
 * 
 * @param payload - Certificate payload object (will be canonicalized before verification)
 * @param signature - Base64-encoded signature to verify
 * @returns True if signature is valid, false otherwise
 */
export function verifyCertificateSignature(payload: object, signature: string): boolean {
  try {
    const publicKey = loadPublicKey();
    const canonicalPayload = canonicalizeJSON(payload);
    
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(canonicalPayload);
    verify.end();
    
    const isValid = verify.verify(publicKey, signature, 'base64');
    return isValid;
  } catch (error) {
    console.error('Error verifying certificate signature:', error);
    return false;
  }
}

/**
 * Compute SHA256 hash of a string.
 * 
 * @param data - String data to hash
 * @returns Hex-encoded SHA256 hash
 */
export function computeSHA256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
