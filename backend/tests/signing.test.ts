/**
 * Test script for certificate signing and verification
 * 
 * Run with: npm run test:signing
 */

import { signCertificatePayload, verifyCertificateSignature, computeSHA256 } from '../src/utils/signing';

console.log('🔐 Testing Certificate Signing & Verification\n');

// Test payload
const payload = {
  wipeId: 'ZT-1234567890-ABC123',
  userId: '507f1f77bcf86cd799439011',
  deviceModel: 'Samsung SSD 860 EVO',
  serialNumber: 'S4B2NB0M123456',
  method: 'zero',
  timestamp: '2025-12-05T10:30:00.000Z',
  logHash: 'abc123def456789...',
};

console.log('📋 Test Payload:');
console.log(JSON.stringify(payload, null, 2));
console.log();

// Test 1: Sign payload
console.log('Test 1: Signing payload...');
try {
  const signature = signCertificatePayload(payload);
  console.log('✅ Signature generated successfully');
  console.log(`Signature length: ${signature.length} characters`);
  console.log(`Signature (first 50 chars): ${signature.substring(0, 50)}...`);
  console.log();

  // Test 2: Verify valid signature
  console.log('Test 2: Verifying valid signature...');
  const isValid = verifyCertificateSignature(payload, signature);
  console.log(isValid ? '✅ Signature verification passed' : '❌ Signature verification failed');
  console.log();

  // Test 3: Verify with tampered payload
  console.log('Test 3: Verifying with tampered payload...');
  const tamperedPayload = { ...payload, deviceModel: 'Tampered Device' };
  const isTamperedValid = verifyCertificateSignature(tamperedPayload, signature);
  console.log(!isTamperedValid ? '✅ Correctly rejected tampered payload' : '❌ Failed to detect tampering');
  console.log();

  // Test 4: Verify with invalid signature
  console.log('Test 4: Verifying with invalid signature...');
  const invalidSignature = 'invalid_signature_123';
  const isInvalidValid = verifyCertificateSignature(payload, invalidSignature);
  console.log(!isInvalidValid ? '✅ Correctly rejected invalid signature' : '❌ Failed to detect invalid signature');
  console.log();

  // Test 5: Test canonicalization (key order shouldn't matter)
  console.log('Test 5: Testing canonical JSON (key order independence)...');
  const reorderedPayload = {
    timestamp: payload.timestamp,
    wipeId: payload.wipeId,
    method: payload.method,
    logHash: payload.logHash,
    userId: payload.userId,
    serialNumber: payload.serialNumber,
    deviceModel: payload.deviceModel,
  };
  const isReorderedValid = verifyCertificateSignature(reorderedPayload, signature);
  console.log(isReorderedValid ? '✅ Canonical JSON works - key order ignored' : '❌ Canonical JSON failed');
  console.log();

  // Test 6: SHA256 computation
  console.log('Test 6: Testing SHA256 computation...');
  const testData = 'This is a test log file content';
  const hash1 = computeSHA256(testData);
  const hash2 = computeSHA256(testData);
  console.log(`Hash: ${hash1}`);
  console.log(hash1 === hash2 ? '✅ SHA256 is deterministic' : '❌ SHA256 is not deterministic');
  console.log();

  console.log('🎉 All tests completed!');
} catch (error) {
  console.error('❌ Error during testing:', error);
  process.exit(1);
}
