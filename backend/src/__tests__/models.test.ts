/**
 * Unit Tests for Models and Crypto
 */

import mongoose from 'mongoose';
import User from '../models/User';
import Certificate from '../models/Certificate';
import WipeLog from '../models/WipeLog';
import { signData, verifySignature, generateHash, generateWipeId } from '../utils/crypto';
import fs from 'fs';
import path from 'path';

// Mock environment for testing
process.env.MONGO_URI = 'mongodb://localhost:27017/zerotrace-test';
process.env.JWT_SECRET = 'test-secret';
process.env.CERT_PRIVATE_KEY_PATH = path.join(__dirname, '../../keys/private.pem');
process.env.CERT_PUBLIC_KEY_PATH = path.join(__dirname, '../../keys/public.pem');

describe('Models', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI!);
    }
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Certificate.deleteMany({});
    await WipeLog.deleteMany({});
  });

  describe('User Model', () => {
    it('should create a user with hashed password', async () => {
      const user = new User({
        email: 'test@example.com',
        passwordHash: 'password123',
        role: 'operator',
      });

      await user.save();

      expect(user._id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).not.toBe('password123'); // Should be hashed
      expect(user.role).toBe('operator');
    });

    it('should compare passwords correctly', async () => {
      const user = new User({
        email: 'test@example.com',
        passwordHash: 'password123',
        role: 'operator',
      });

      await user.save();

      const isMatch = await user.comparePassword('password123');
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });
  });

  describe('Certificate Model', () => {
    it('should create a certificate', async () => {
      const user = await User.create({
        email: 'test@example.com',
        passwordHash: 'password123',
        role: 'operator',
      });

      const certificate = new Certificate({
        wipeId: 'ZT-123456-ABCD',
        userId: user._id,
        deviceModel: 'Samsung 870 EVO',
        serialNumber: 'SN123456',
        method: 'ATA Secure Erase',
        timestamp: new Date(),
        logHash: 'abc123',
        signature: 'signature123',
        uploaded: true,
      });

      await certificate.save();

      expect(certificate._id).toBeDefined();
      expect(certificate.wipeId).toBe('ZT-123456-ABCD');
      expect(certificate.deviceModel).toBe('Samsung 870 EVO');
    });
  });

  describe('WipeLog Model', () => {
    it('should create a wipe log', async () => {
      const wipeLog = new WipeLog({
        wipeId: 'ZT-123456-ABCD',
        rawLog: 'Wipe started...\nWipe completed.',
        devicePath: '/dev/sdb',
        duration: 3600,
        exitCode: 0,
      });

      await wipeLog.save();

      expect(wipeLog._id).toBeDefined();
      expect(wipeLog.wipeId).toBe('ZT-123456-ABCD');
      expect(wipeLog.duration).toBe(3600);
      expect(wipeLog.exitCode).toBe(0);
    });
  });
});

describe('Crypto Utilities', () => {
  // Skip crypto tests if keys don't exist
  const privateKeyExists = fs.existsSync(path.join(__dirname, '../../keys/private.pem'));
  const publicKeyExists = fs.existsSync(path.join(__dirname, '../../keys/public.pem'));

  const skipIfNoKeys = privateKeyExists && publicKeyExists ? it : it.skip;

  skipIfNoKeys('should sign and verify data correctly', () => {
    const testData = JSON.stringify({
      wipeId: 'ZT-123456-ABCD',
      deviceModel: 'Samsung 870 EVO',
      method: 'ATA Secure Erase',
    });

    const signature = signData(testData);
    expect(signature).toBeDefined();
    expect(typeof signature).toBe('string');

    const isValid = verifySignature(testData, signature);
    expect(isValid).toBe(true);

    // Test with tampered data
    const tamperedData = JSON.stringify({
      wipeId: 'ZT-123456-ABCD',
      deviceModel: 'Tampered Model',
      method: 'ATA Secure Erase',
    });
    const isInvalid = verifySignature(tamperedData, signature);
    expect(isInvalid).toBe(false);
  });

  it('should generate SHA256 hash', () => {
    const data = 'test data';
    const hash = generateHash(data);
    
    expect(hash).toBeDefined();
    expect(hash).toHaveLength(64); // SHA256 produces 64 hex characters
    expect(hash).toBe(generateHash(data)); // Same data should produce same hash
  });

  it('should generate unique wipe IDs', () => {
    const id1 = generateWipeId();
    const id2 = generateWipeId();

    expect(id1).toMatch(/^ZT-\d+-[A-F0-9]{8}$/);
    expect(id2).toMatch(/^ZT-\d+-[A-F0-9]{8}$/);
    expect(id1).not.toBe(id2);
  });
});
