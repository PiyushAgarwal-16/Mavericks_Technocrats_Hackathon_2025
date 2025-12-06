#!/usr/bin/env node

/**
 * Script to generate properly formatted environment variable for Railway
 * This converts the PEM file to a single-line format that Railway can handle
 */

const fs = require('fs');
const path = require('path');

const privateKeyPath = path.join(__dirname, '../backend/keys/private.pem');
const publicKeyPath = path.join(__dirname, '../backend/keys/public.pem');

console.log('📝 Reading RSA keys...\n');

// Read private key
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const publicKey = fs.readFileSync(publicKeyPath, 'utf8');

console.log('=' .repeat(70));
console.log('COPY THIS FOR RAILWAY ENVIRONMENT VARIABLE: CERT_PRIVATE_KEY');
console.log('=' .repeat(70));
console.log('\nOption 1: Multi-line format (paste as-is):\n');
console.log(privateKey);

console.log('\n' + '=' .repeat(70));
console.log('Option 2: Single-line format (with \\n escapes):\n');
// Replace actual newlines with \n literal string
const privateKeySingleLine = privateKey.replace(/\n/g, '\\n');
console.log(privateKeySingleLine);

console.log('\n\n' + '=' .repeat(70));
console.log('COPY THIS FOR RAILWAY ENVIRONMENT VARIABLE: CERT_PUBLIC_KEY');
console.log('=' .repeat(70));
console.log('\nOption 1: Multi-line format (paste as-is):\n');
console.log(publicKey);

console.log('\n' + '=' .repeat(70));
console.log('Option 2: Single-line format (with \\n escapes):\n');
const publicKeySingleLine = publicKey.replace(/\n/g, '\\n');
console.log(publicKeySingleLine);

console.log('\n\n' + '=' .repeat(70));
console.log('📋 INSTRUCTIONS FOR RAILWAY:');
console.log('=' .repeat(70));
console.log(`
1. Go to Railway Dashboard → Your Project → Backend Service
2. Click on "Variables" tab
3. Click "+ New Variable"
4. Add CERT_PRIVATE_KEY:
   - Name: CERT_PRIVATE_KEY
   - Value: Copy "Option 1" (multi-line) above
   - Railway should preserve newlines automatically

5. Add CERT_PUBLIC_KEY:
   - Name: CERT_PUBLIC_KEY  
   - Value: Copy "Option 1" (multi-line) above

6. If multi-line doesn't work, try "Option 2" (single-line with \\n)

7. Click "Deploy" to redeploy with new variables

8. Check logs at: https://railway.app/project/[your-project]/service/[backend-service]

9. Test the keys are loaded: 
   curl https://maverickstechnocratshackathon2025-production.up.railway.app/health/keys

10. Check backend logs for:
    - "📝 Loading private key from environment variable"
    - "✅ Private key loaded from environment"
`);

console.log('=' .repeat(70));
console.log('✅ Done! Follow the instructions above.\n');
