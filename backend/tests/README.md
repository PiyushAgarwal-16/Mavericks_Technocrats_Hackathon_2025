# ZeroTrace Backend Integration Tests

This directory contains comprehensive integration tests for the ZeroTrace backend API.

## Test Structure

### Setup Utilities (`setup/`)

- **`db.ts`**: MongoDB Memory Server utilities for isolated testing
  - `connectDB()`: Creates in-memory MongoDB instance
  - `closeDB()`: Cleans up database and closes connections
  - `clearDB()`: Clears all collections between tests

- **`keys.ts`**: RSA key generation for testing
  - `generateTestKeyPair()`: Creates 2048-bit RSA key pairs
  - `setTestKeys()`: Writes keys to temp files and sets environment variables
  - `cleanupTestKeys()`: Removes temporary key files

### Integration Tests (`integration.test.ts`)

Comprehensive test suite covering all authentication and certificate endpoints:

#### Authentication Tests (8 tests)
- POST /auth/register
  - ✓ Successful user creation
  - ✓ Validation: missing email, missing password
  - ✓ Duplicate email rejection
- POST /auth/login
  - ✓ Successful login with JWT token
  - ✓ Invalid credentials rejection
  - ✓ Validation: missing credentials

#### Certificate Tests (13 tests)
- POST /certificates
  - ✓ Create certificate with full data (returns wipeId, signature)
  - ✓ Create certificate with minimal required fields
  - ✓ Authentication required
  - ✓ Invalid JWT rejection
  - ✓ Validation: missing required fields

- GET /certificates/:wipeId
  - ✓ Valid signature verification (signatureValid = true)
  - ✓ Log hash verification (logHashMatches = true)
  - ✓ Return wipe log details
  - ✓ Return user information
  - ✓ 404 for non-existent wipeId
  - ✓ Handle certificates without log upload

- Signature Integrity
  - ✓ Maintain signature consistency across multiple verifications
  - ✓ Detect tampered signatures

## Running Tests

```bash
# Run all tests with coverage
npm test

# Run specific test pattern
npm test -- --testNamePattern="POST /auth/register"

# Run without coverage
npm test -- --no-coverage

# Watch mode
npm test -- --watch
```

## Coverage

Current coverage (as of last run):
- **Statements**: 67.53%
- **Branches**: 62.96%
- **Functions**: 59.25%
- **Lines**: 68.09%

Key areas with high coverage:
- Controllers: 90.9% (authController, certController)
- Models: 92.3% (Certificate, User, WipeLog)
- Signing utilities: 82.22%

## Test Environment

- **MongoDB**: In-memory server (`mongodb-memory-server`)
- **RSA Keys**: Dynamically generated 2048-bit keys
- **JWT Secret**: `test-jwt-secret-key-for-testing-only`
- **Wipe Scripts**: NOT executed (tests use fake log data)

## Key Features

1. **Isolation**: Each test run uses fresh in-memory MongoDB
2. **Security**: Fake RSA keys generated per test run
3. **No Side Effects**: Tests don't execute actual wipe scripts
4. **Fast**: In-memory database enables quick test execution
5. **Comprehensive**: Covers authentication, authorization, signing, and verification

## Debugging

To debug failing tests:
1. Check MongoDB connection issues
2. Verify RSA key generation (keys written to `tests/tmp/`)
3. Inspect payload canonicalization (signing must match verification)
4. Review timestamp consistency (ISO format required)

## Notes

- Tests use `supertest` for HTTP assertions
- Cleanup happens in `beforeEach`, `afterEach`, `afterAll` hooks
- User role defaults to `operator` (not `user`)
- Empty log hash: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
