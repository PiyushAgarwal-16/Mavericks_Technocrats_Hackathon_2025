# RSA Keys for Certificate Signing

This directory contains RSA key pairs used for signing device wipe certificates.

## Development Keys

For development and testing, sample keys have been generated:
- `private.pem` - RSA private key (2048-bit)
- `public.pem` - RSA public key

**⚠️ WARNING: These keys are for DEVELOPMENT ONLY. Never use them in production!**

## Production Keys

For production deployment:

1. Generate a secure RSA key pair:
```bash
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

2. Store the private key securely:
   - Use environment variables or secure vault services (e.g., AWS Secrets Manager, Azure Key Vault)
   - Never commit private keys to version control
   - Set appropriate file permissions (e.g., `chmod 600 private.pem`)

3. Update `.env` with the correct paths:
```
CERT_PRIVATE_KEY_PATH=/path/to/secure/private.pem
CERT_PUBLIC_KEY_PATH=/path/to/secure/public.pem
```

## How It Works

- **Private Key**: Used by the backend to sign certificate payloads
- **Public Key**: Used to verify certificate signatures (can be distributed publicly)

The signature ensures:
- Certificate authenticity (issued by your server)
- Data integrity (certificate hasn't been tampered with)
- Non-repudiation (proof of origin)
