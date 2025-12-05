import crypto from 'crypto';

/**
 * Generate test RSA key pair for testing purposes only
 * DO NOT use these in production!
 */
export function generateTestKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  return { privateKey, publicKey };
}

/**
 * Set test RSA keys in environment variables
 */
export function setTestKeys(privateKey: string, publicKey: string) {
  // Write keys to temporary files for testing
  const fs = require('fs');
  const path = require('path');
  const tmpDir = path.join(__dirname, '../tmp');
  
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  const privateKeyPath = path.join(tmpDir, 'test-private.pem');
  const publicKeyPath = path.join(tmpDir, 'test-public.pem');

  fs.writeFileSync(privateKeyPath, privateKey);
  fs.writeFileSync(publicKeyPath, publicKey);

  process.env.CERT_PRIVATE_KEY_PATH = privateKeyPath;
  process.env.CERT_PUBLIC_KEY_PATH = publicKeyPath;
}

/**
 * Clean up test keys
 */
export function cleanupTestKeys() {
  const fs = require('fs');
  const path = require('path');
  const tmpDir = path.join(__dirname, '../tmp');

  if (fs.existsSync(tmpDir)) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}
