# Certificate Signing & Verification Enhancement

## Overview

Enhanced the backend certificate signing and verification system with proper RSA-SHA256 cryptography, canonical JSON serialization, and separate verification of signature validity and log hash integrity.

## Changes Made

### 1. New Signing Utility (`backend/src/utils/signing.ts`)

Created a dedicated signing module with the following functions:

#### `signCertificatePayload(payload: object): string`
- Loads RSA private key from `CERT_PRIVATE_KEY_PATH` environment variable
- Canonicalizes JSON payload by sorting keys alphabetically (ensures consistent signatures regardless of key order)
- Uses `crypto.createSign('RSA-SHA256')` to create signature
- Returns base64-encoded signature

#### `verifyCertificateSignature(payload: object, signature: string): boolean`
- Loads RSA public key from `CERT_PUBLIC_KEY_PATH` environment variable
- Canonicalizes JSON payload (same as signing)
- Uses `crypto.createVerify('RSA-SHA256')` to verify signature
- Returns `true` if signature is valid, `false` otherwise

#### `computeSHA256(data: string): string`
- Helper function to compute SHA256 hash of string data
- Returns hex-encoded hash
- Used for log file verification

#### Canonical JSON Serialization
- Recursively sorts object keys alphabetically
- Ensures deterministic string representation
- Key order independence: `{a:1, b:2}` and `{b:2, a:1}` produce identical signatures

### 2. Updated Certificate Controller (`backend/src/controllers/certController.ts`)

#### Certificate Creation (POST /certificates)
**Payload Structure:**
```json
{
  "wipeId": "ZT-timestamp-hex",
  "userId": "user_id",
  "deviceModel": "device_model",
  "serialNumber": "serial_number",
  "method": "zero|random|hdparm",
  "timestamp": "ISO8601_timestamp",
  "logHash": "sha256_of_log"
}
```

**Changes:**
- Constructs complete payload including `logHash` before signing
- Uses `signCertificatePayload()` instead of old `signData()`
- Ensures all required fields are included in signature

#### Certificate Verification (GET /certificates/:wipeId)
**Response Structure:**
```json
{
  "verified": boolean,
  "signatureValid": boolean,
  "logHashMatches": boolean,
  "certificate": { /* certificate object */ },
  "wipeLog": { /* wipe log if available */ },
  "user": { /* user who created certificate */ }
}
```

**Verification Process:**
1. **Signature Verification:**
   - Reconstructs exact payload used during signing
   - Calls `verifyCertificateSignature()` with payload and stored signature
   - Returns `signatureValid: true/false`

2. **Log Hash Verification:**
   - Retrieves associated `WipeLog` from database
   - Recomputes SHA256 hash of `rawLog` content
   - Compares recomputed hash with stored `logHash`
   - Returns `logHashMatches: true/false`

3. **Overall Verification:**
   - `verified = signatureValid && logHashMatches`
   - Both checks must pass for certificate to be valid

### 3. Updated Web Frontend

#### API Service (`web/src/services/api.ts`)
Updated `VerificationResult` interface:
```typescript
export interface VerificationResult {
  verified: boolean;
  signatureValid: boolean;    // NEW
  logHashMatches: boolean;    // NEW
  certificate: Certificate;
  wipeLog?: WipeLog;
  user?: User;
}
```

#### Verify Page (`web/src/pages/VerifyPage.tsx`)
Updated to display separate verification status:
- **Signature Valid:** ✅ Yes / ❌ No
- **Log Hash Matches:** ✅ Yes / ❌ No
- Overall badge: **VALID** (green) / **INVALID** (red)

### 4. Comprehensive Tests (`backend/tests/signing.test.ts`)

Test suite covering:
1. ✅ Signature generation
2. ✅ Valid signature verification
3. ✅ Tampered payload rejection
4. ✅ Invalid signature rejection
5. ✅ Canonical JSON (key order independence)
6. ✅ SHA256 determinism

**Run tests:**
```bash
cd backend
npm run test:signing
```

## Security Features

### RSA-SHA256 Signing
- Industry-standard asymmetric cryptography
- Private key signs certificates
- Public key verifies signatures
- Keys stored securely in `backend/keys/` directory

### Canonical JSON
- Deterministic serialization
- Prevents signature invalidation from key reordering
- Alphabetical key sorting ensures consistency

### Separate Verification
- **Signature verification** ensures certificate authenticity (not tampered)
- **Log hash verification** ensures log file integrity (not modified)
- Both must pass for full validation

### Tamper Detection
- Any modification to payload invalidates signature
- Log file changes detected via hash mismatch
- Clear indication of which verification failed

## Environment Variables

```env
# RSA Key Paths
CERT_PRIVATE_KEY_PATH=./backend/keys/private.pem
CERT_PUBLIC_KEY_PATH=./backend/keys/public.pem
```

## API Examples

### Create Certificate
```bash
POST /api/certificates
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "deviceModel": "Samsung SSD 860 EVO",
  "serialNumber": "S4B2NB0M123456",
  "method": "zero",
  "timestamp": "2025-12-05T10:30:00Z",
  "rawLog": "...",
  "devicePath": "/dev/sdb",
  "duration": 142.5,
  "exitCode": 0
}
```

**Response:**
```json
{
  "wipeId": "ZT-1733395800-ABC123",
  "verificationUrl": "http://localhost:5000/api/certificates/ZT-1733395800-ABC123",
  "signature": "rWBjqClmCSitUc0dmADg9bvPhPLzTykkN9Scx4GHjd8...",
  "logHash": "da52dc5d88e57272a5d84172822ceef0513ce6c6714445300a81b42d75035c18"
}
```

### Verify Certificate
```bash
GET /api/certificates/:wipeId
```

**Response:**
```json
{
  "verified": true,
  "signatureValid": true,
  "logHashMatches": true,
  "certificate": {
    "_id": "...",
    "wipeId": "ZT-1733395800-ABC123",
    "userId": {...},
    "deviceModel": "Samsung SSD 860 EVO",
    "serialNumber": "S4B2NB0M123456",
    "method": "zero",
    "timestamp": "2025-12-05T10:30:00.000Z",
    "logHash": "da52dc5d88e...",
    "signature": "rWBjqClmCS...",
    "uploaded": true,
    "createdAt": "2025-12-05T10:30:00.000Z"
  },
  "wipeLog": {
    "wipeId": "ZT-1733395800-ABC123",
    "devicePath": "/dev/sdb",
    "duration": 142.5,
    "exitCode": 0,
    "rawLog": "[2025-12-05 10:30:00] Starting disk wipe..."
  },
  "user": {
    "_id": "...",
    "email": "user@example.com",
    "role": "user"
  }
}
```

## Commits

- `7ae0479` - feat(backend): enhance certificate signing with RSA-SHA256 and canonical JSON, add separate signature and log hash verification
- `86b232e` - test(backend): add comprehensive signing and verification tests

## Files Modified

- ✅ `backend/src/utils/signing.ts` (new file - 119 lines)
- ✅ `backend/src/controllers/certController.ts` (enhanced verification)
- ✅ `backend/tests/signing.test.ts` (new file - 82 lines)
- ✅ `backend/package.json` (added test:signing script)
- ✅ `web/src/services/api.ts` (updated VerificationResult interface)
- ✅ `web/src/pages/VerifyPage.tsx` (display signatureValid and logHashMatches)

## Next Steps

1. **Key Management:**
   - Generate production 4096-bit RSA keys
   - Store private key securely (Azure Key Vault, AWS KMS, etc.)
   - Never commit private keys to version control

2. **Additional Verification:**
   - Certificate expiration/revocation
   - Certificate chain of trust
   - Timestamping service integration

3. **Compliance:**
   - NIST SP 800-88 guidelines
   - DoD 5220.22-M standards
   - GDPR data destruction requirements

## License

MIT
