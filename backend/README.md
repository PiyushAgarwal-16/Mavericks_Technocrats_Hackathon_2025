# ZeroTrace Backend API

Backend API server for ZeroTrace certificate verification system. Built with Node.js, TypeScript, Express, and MongoDB with RSA certificate signing.

## Features

- 🔐 **JWT Authentication** - Secure user registration and login
- 📜 **Certificate Management** - Create and verify device wipe certificates
- ✍️ **RSA Signing** - Cryptographic certificate signing with RSA-SHA256
- 📊 **WipeLog Storage** - Raw log storage for audit trails
- 🔍 **Signature Verification** - Public endpoint for certificate validation
- 🧪 **Unit Tests** - Comprehensive model and crypto tests

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.3+
- **Framework**: Express 4.18
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT + bcrypt
- **Security**: Helmet, CORS
- **Testing**: Jest + ts-jest

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `CERT_PRIVATE_KEY_PATH` - Path to RSA private key
- `CERT_PUBLIC_KEY_PATH` - Path to RSA public key

### 3. Generate RSA Keys (Development)

Sample keys are included in `keys/` directory for development. For production:

```bash
cd keys
openssl genrsa -out private.pem 4096
openssl rsa -in private.pem -pubout -out public.pem
```

### 4. Start MongoDB

```bash
# Local MongoDB
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (update MONGO_URI in .env)
```

### 5. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 6. Build for Production

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "operator@example.com",
  "password": "securePassword123",
  "role": "operator"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "operator@example.com",
    "role": "operator"
  }
}
```

#### POST /auth/login
Login user.

**Request:**
```json
{
  "email": "operator@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "operator@example.com",
    "role": "operator"
  }
}
```

### Certificates

#### POST /certificates
Create a new certificate (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "deviceModel": "Samsung 870 EVO",
  "serialNumber": "S5XNNG0NB12345",
  "method": "ATA Secure Erase",
  "timestamp": "2025-12-05T10:30:00Z",
  "rawLog": "Wipe started at 2025-12-05T10:30:00Z\n...",
  "devicePath": "/dev/sdb",
  "duration": 3600,
  "exitCode": 0
}
```

**Response:**
```json
{
  "wipeId": "ZT-1733397000000-A1B2C3D4",
  "verificationUrl": "http://localhost:5000/certificates/ZT-1733397000000-A1B2C3D4",
  "signature": "kB5x...(base64 encoded signature)",
  "logHash": "abc123...(sha256 hash)"
}
```

#### GET /certificates/:wipeId
Verify and retrieve certificate (public endpoint).

**Response:**
```json
{
  "verified": true,
  "certificate": {
    "wipeId": "ZT-1733397000000-A1B2C3D4",
    "deviceModel": "Samsung 870 EVO",
    "serialNumber": "S5XNNG0NB12345",
    "method": "ATA Secure Erase",
    "timestamp": "2025-12-05T10:30:00Z",
    "logHash": "abc123...",
    "signature": "kB5x...",
    "uploaded": true,
    "createdAt": "2025-12-05T10:30:01Z"
  },
  "wipeLog": {
    "devicePath": "/dev/sdb",
    "duration": 3600,
    "exitCode": 0
  }
}
```

### Health Check

#### GET /health
Check server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T10:30:00Z"
}
```

## Data Models

### User
```typescript
{
  email: string;
  passwordHash: string;  // bcrypt hashed
  role: 'admin' | 'operator';
  createdAt: Date;
  updatedAt: Date;
}
```

### Certificate
```typescript
{
  wipeId: string;  // Format: ZT-<timestamp>-<random>
  userId: ObjectId;  // Reference to User
  deviceModel: string;
  serialNumber?: string;
  method: string;
  timestamp: Date;
  logHash: string;  // SHA256 of raw log
  signature: string;  // RSA-SHA256 signature (base64)
  uploaded: boolean;  // Whether log file was uploaded
  createdAt: Date;
  updatedAt: Date;
}
```

### WipeLog
```typescript
{
  wipeId: string;  // Reference to Certificate
  rawLog: string;  // Full log content
  devicePath: string;
  duration: number;  // In seconds
  exitCode: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security

### RSA Certificate Signing

1. **Signing Process**:
   - Certificate payload is JSON serialized
   - Signed with RSA private key using RSA-SHA256
   - Signature encoded as base64

2. **Verification Process**:
   - Payload reconstructed from stored certificate
   - Signature verified using RSA public key
   - Returns `verified: true/false`

### JWT Authentication

- Tokens signed with `JWT_SECRET`
- Included in `Authorization: Bearer <token>` header

### Password Hashing

- bcrypt with salt rounds: 10
- Passwords never stored in plaintext

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm test -- --coverage
```

**Note**: Tests require MongoDB to be running and RSA keys to be present in `keys/` directory.

## Development

### Project Structure

```
backend/
├── src/
│   ├── __tests__/          # Unit tests
│   │   └── models.test.ts
│   ├── config/             # Configuration
│   │   └── database.ts
│   ├── controllers/        # Route controllers
│   │   ├── authController.ts
│   │   └── certController.ts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts
│   │   └── errorHandler.ts
│   ├── models/             # Mongoose models
│   │   ├── User.ts
│   │   ├── Certificate.ts
│   │   └── WipeLog.ts
│   ├── routes/             # API routes
│   │   ├── auth.ts
│   │   ├── certificates.ts
│   │   └── health.ts
│   ├── utils/              # Utilities
│   │   └── crypto.ts       # RSA signing/verification
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── keys/                   # RSA key pairs
│   ├── private.pem         # Private key (DO NOT COMMIT)
│   ├── public.pem          # Public key
│   └── README.md
├── dist/                   # Compiled JavaScript
├── .env.example            # Environment template
├── .gitignore
├── package.json
├── tsconfig.json
└── jest.config.js
```

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Register route in `src/app.ts`
4. Add tests in `src/__tests__/`

### Code Style

- ESLint configured for TypeScript
- Run linting: `npm run lint`

## Deployment

### Environment Variables (Production)

```bash
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/zerotrace
JWT_SECRET=<strong-secret-key>
CERT_PRIVATE_KEY_PATH=/secure/path/private.pem
CERT_PUBLIC_KEY_PATH=/secure/path/public.pem
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment

Build image:
```bash
docker build -t zerotrace-backend .
```

Run container:
```bash
docker run -p 5000:5000 --env-file .env zerotrace-backend
```

## Troubleshooting

### MongoDB Connection Issues
- Check `MONGO_URI` is correct
- Ensure MongoDB is running
- For Atlas, whitelist IP address

### RSA Key Issues
- Verify key files exist at specified paths
- Check file permissions (private key should be 600)
- Regenerate keys if corrupted

### JWT Token Issues
- Check `JWT_SECRET` is set
- Verify token format: `Bearer <token>`

## License

MIT
