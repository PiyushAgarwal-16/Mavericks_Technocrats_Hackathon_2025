# ZeroTrace Backend API

Node.js + TypeScript + Express REST API for certificate management.

## Features

- JWT authentication
- MongoDB integration
- Certificate CRUD operations
- Digital signature generation
- Public verification endpoint

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your configuration
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Testing

```bash
npm test
npm run test:watch
```

## API Endpoints

### Public
- `GET /api/certificates/verify/:id` - Verify certificate

### Protected (JWT required)
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/certificates` - Create certificate
- `GET /api/certificates/:id` - Get certificate
- `GET /api/certificates` - List all (admin)

## Environment Variables

See `.env.example` for required configuration.
