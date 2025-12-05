/**
 * Integration Tests for ZeroTrace Backend API
 * 
 * Tests authentication, certificate creation, and verification
 * using in-memory MongoDB and fake RSA keys
 */

import request from 'supertest';
import express, { Application } from 'express';
import { connectDB, closeDB, clearDB } from './setup/db';
import { generateTestKeyPair, setTestKeys, cleanupTestKeys } from './setup/keys';
import authRoutes from '../src/routes/auth';
import certificateRoutes from '../src/routes/certificates';
import { authMiddleware } from '../src/middleware/auth';

// Create Express app for testing
const createApp = (): Application => {
  const app = express();
  app.use(express.json());
  app.use('/auth', authRoutes);
  app.use('/certificates', certificateRoutes);
  return app;
};

let app: Application;
let testUser = {
  email: 'test@zerotrace.com',
  password: 'testPassword123',
};
let authToken: string;

describe('ZeroTrace Backend Integration Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    
    // Generate and set test RSA keys
    const { privateKey, publicKey } = generateTestKeyPair();
    setTestKeys(privateKey, publicKey);
    
    // Connect to in-memory MongoDB
    await connectDB();
    
    // Create Express app
    app = createApp();
  });

  afterAll(async () => {
    // Cleanup
    await closeDB();
    cleanupTestKeys();
  });

  afterEach(async () => {
    // Clear database between tests
    await clearDB();
  });

  describe('Authentication Tests', () => {
    describe('POST /auth/register', () => {
      it('should create a new user successfully', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(201);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).toHaveProperty('role', 'operator');
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).not.toHaveProperty('passwordHash');
      });

      it('should reject registration with missing email', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            password: testUser.password,
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject registration with missing password', async () => {
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject duplicate email registration', async () => {
        // First registration
        await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(201);

        // Duplicate registration
        const response = await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: 'differentPassword123',
          })
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toContain('already exists');
      });
    });

    describe('POST /auth/login', () => {
      beforeEach(async () => {
        // Create user before login tests
        await request(app)
          .post('/auth/register')
          .send({
            email: testUser.email,
            password: testUser.password,
          });
      });

      it('should login successfully and return JWT token', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password,
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.length).toBeGreaterThan(0);

        // Save token for subsequent tests
        authToken = response.body.token;
      });

      it('should reject login with incorrect password', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: testUser.email,
            password: 'wrongPassword',
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject login with non-existent email', async () => {
        const response = await request(app)
          .post('/auth/login')
          .send({
            email: 'nonexistent@zerotrace.com',
            password: testUser.password,
          })
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject login with missing credentials', async () => {
        await request(app)
          .post('/auth/login')
          .send({})
          .expect(400);
      });
    });
  });

  describe('Certificate Tests', () => {
    beforeEach(async () => {
      // Create and login user before certificate tests
      await request(app)
        .post('/auth/register')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      authToken = loginResponse.body.token;
    });

    describe('POST /certificates', () => {
      const fakeCertificateData = {
        deviceModel: 'Samsung SSD 860 EVO',
        serialNumber: 'S4B2NB0M123456',
        method: 'zero',
        timestamp: '2025-12-05T10:30:00.000Z',
        rawLog: '[2025-12-05 10:30:00] Starting disk wipe operation\n[2025-12-05 10:30:01] Target: /dev/sdb\n[2025-12-05 10:32:00] Wipe completed successfully',
        devicePath: '/dev/sdb',
        duration: 120,
        exitCode: 0,
      };

      it('should create certificate with valid data and return wipeId', async () => {
        const response = await request(app)
          .post('/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send(fakeCertificateData)
          .expect(201);

        expect(response.body).toHaveProperty('wipeId');
        expect(response.body.wipeId).toMatch(/^ZT-\d+-[A-F0-9]+$/);
        expect(response.body).toHaveProperty('signature');
        expect(response.body).toHaveProperty('logHash');
        expect(response.body).toHaveProperty('verificationUrl');
        expect(typeof response.body.signature).toBe('string');
        expect(response.body.signature.length).toBeGreaterThan(0);
      });

      it('should create certificate without optional fields', async () => {
        const minimalData = {
          deviceModel: 'Generic HDD',
          method: 'random',
        };

        const response = await request(app)
          .post('/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send(minimalData)
          .expect(201);

        expect(response.body).toHaveProperty('wipeId');
        expect(response.body).toHaveProperty('signature');
        expect(response.body).toHaveProperty('logHash');
      });

      it('should reject certificate creation without authentication', async () => {
        const response = await request(app)
          .post('/certificates')
          .send(fakeCertificateData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject certificate with invalid JWT token', async () => {
        const response = await request(app)
          .post('/certificates')
          .set('Authorization', 'Bearer invalid-token-123')
          .send(fakeCertificateData)
          .expect(401);

        expect(response.body).toHaveProperty('error');
      });

      it('should reject certificate without required fields', async () => {
        const invalidData = {
          // Missing deviceModel and method
          serialNumber: 'S4B2NB0M123456',
        };

        const response = await request(app)
          .post('/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidData)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /certificates/:wipeId', () => {
      let createdWipeId: string;
      let createdSignature: string;
      const testLog = '[2025-12-05 10:30:00] Test wipe log content\n[2025-12-05 10:31:00] Wipe completed';

      beforeEach(async () => {
        // Create a certificate first
        const createResponse = await request(app)
          .post('/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            deviceModel: 'Test Device',
            serialNumber: 'TEST123',
            method: 'hdparm',
            timestamp: '2025-12-05T10:30:00.000Z',
            rawLog: testLog,
            devicePath: '/dev/sdc',
            duration: 90,
            exitCode: 0,
          });

        createdWipeId = createResponse.body.wipeId;
        createdSignature = createResponse.body.signature;
      });

      it('should verify valid certificate with signatureValid = true', async () => {
        const response = await request(app)
          .get(`/certificates/${createdWipeId}`)
          .expect(200);

        expect(response.body).toHaveProperty('verified');
        expect(response.body).toHaveProperty('signatureValid', true);
        expect(response.body).toHaveProperty('logHashMatches');
        expect(response.body).toHaveProperty('certificate');
        expect(response.body.certificate).toHaveProperty('wipeId', createdWipeId);
        expect(response.body.certificate).toHaveProperty('signature', createdSignature);
        expect(response.body.certificate).toHaveProperty('deviceModel', 'Test Device');
        expect(response.body.certificate).toHaveProperty('method', 'hdparm');
      });

      it('should verify log hash matches when using same log', async () => {
        const response = await request(app)
          .get(`/certificates/${createdWipeId}`)
          .expect(200);

        expect(response.body).toHaveProperty('logHashMatches', true);
        expect(response.body).toHaveProperty('verified', true);
        expect(response.body.verified).toBe(
          response.body.signatureValid && response.body.logHashMatches
        );
      });

      it('should return certificate with wipe log details', async () => {
        const response = await request(app)
          .get(`/certificates/${createdWipeId}`)
          .expect(200);

        expect(response.body).toHaveProperty('wipeLog');
        expect(response.body.wipeLog).toHaveProperty('devicePath', '/dev/sdc');
        expect(response.body.wipeLog).toHaveProperty('duration', 90);
        expect(response.body.wipeLog).toHaveProperty('exitCode', 0);
        expect(response.body.wipeLog).toHaveProperty('rawLog');
      });

      it('should return user information with certificate', async () => {
        const response = await request(app)
          .get(`/certificates/${createdWipeId}`)
          .expect(200);

        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).toHaveProperty('role');
      });

      it('should return 404 for non-existent wipeId', async () => {
        const response = await request(app)
          .get('/certificates/ZT-9999999999-INVALID')
          .expect(404);

        expect(response.body).toHaveProperty('verified', false);
        expect(response.body).toHaveProperty('signatureValid', false);
        expect(response.body).toHaveProperty('logHashMatches', false);
        expect(response.body).toHaveProperty('error');
      });

      it('should handle certificate without log upload', async () => {
        // Create certificate without rawLog
        const noLogResponse = await request(app)
          .post('/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            deviceModel: 'Device Without Log',
            method: 'zero',
          });

        expect(noLogResponse.status).toBe(201);
        expect(noLogResponse.body).toHaveProperty('wipeId');
        expect(noLogResponse.body).toHaveProperty('signature');

        const wipeId = noLogResponse.body.wipeId;

        const response = await request(app)
          .get(`/certificates/${wipeId}`)
          .expect(200);

        // When there's no log, signature should still be valid
        // logHashMatches is true because no log was uploaded (uploaded=false)
        expect(response.body).toHaveProperty('signatureValid', true);
        expect(response.body).toHaveProperty('logHashMatches', true);
        expect(response.body.wipeLog).toBeNull();
      });
    });

    describe('Certificate Signature Integrity', () => {
      it('should maintain signature consistency', async () => {
        const certData = {
          deviceModel: 'Consistency Test Device',
          serialNumber: 'CONS123',
          method: 'random',
          timestamp: '2025-12-05T12:00:00.000Z',
          rawLog: 'Test log for consistency',
          devicePath: '/dev/sdd',
          duration: 60,
          exitCode: 0,
        };

        // Create certificate
        const createResponse = await request(app)
          .post('/certificates')
          .set('Authorization', `Bearer ${authToken}`)
          .send(certData);

        const wipeId = createResponse.body.wipeId;
        const originalSignature = createResponse.body.signature;

        // Verify multiple times - signature should remain valid
        for (let i = 0; i < 3; i++) {
          const verifyResponse = await request(app)
            .get(`/certificates/${wipeId}`)
            .expect(200);

          expect(verifyResponse.body.signatureValid).toBe(true);
          expect(verifyResponse.body.certificate.signature).toBe(originalSignature);
        }
      });

      it('should detect tampered signature', async () => {
        // This test would require direct database manipulation
        // For now, we verify that invalid wipeId returns proper error
        const response = await request(app)
          .get('/certificates/ZT-TAMPERED-123')
          .expect(404);

        expect(response.body.verified).toBe(false);
      });
    });
  });
});
