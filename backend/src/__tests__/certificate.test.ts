import mongoose from 'mongoose';
import Certificate from '../models/Certificate.model';

describe('Certificate Model', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/zerotrace-test';
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Certificate.deleteMany({});
  });

  it('should create a valid certificate', async () => {
    const certificateData = {
      certificateId: 'ZT-TEST-001',
      deviceInfo: {
        serialNumber: 'SN123456',
        model: 'Samsung 870 EVO',
        capacity: '1TB',
        type: 'SSD',
      },
      wipeDetails: {
        method: 'ATA Secure Erase',
        passes: 1,
        standard: 'NIST SP 800-88',
        duration: 3600,
        timestamp: new Date(),
      },
      operator: {
        name: 'John Doe',
        organization: 'Test Org',
        email: 'john@test.com',
      },
      signature: 'test-signature-hash',
      verified: true,
    };

    const certificate = new Certificate(certificateData);
    const savedCertificate = await certificate.save();

    expect(savedCertificate._id).toBeDefined();
    expect(savedCertificate.certificateId).toBe('ZT-TEST-001');
    expect(savedCertificate.deviceInfo.serialNumber).toBe('SN123456');
    expect(savedCertificate.verified).toBe(true);
  });

  it('should fail without required fields', async () => {
    const certificate = new Certificate({});

    let error: any;
    try {
      await certificate.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.certificateId).toBeDefined();
  });

  it('should enforce unique certificateId', async () => {
    const certificateData = {
      certificateId: 'ZT-UNIQUE-001',
      deviceInfo: {
        serialNumber: 'SN001',
        model: 'Test Model',
        capacity: '500GB',
        type: 'HDD',
      },
      wipeDetails: {
        method: 'DoD 5220.22-M',
        passes: 3,
        standard: 'DoD',
        duration: 7200,
        timestamp: new Date(),
      },
      operator: {
        name: 'Test User',
      },
      signature: 'signature',
      verified: true,
    };

    await Certificate.create(certificateData);

    let error: any;
    try {
      await Certificate.create(certificateData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // Duplicate key error
  });
});
