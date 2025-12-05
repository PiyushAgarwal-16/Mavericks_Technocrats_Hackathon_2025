/**
 * Certificate Controller
 * 
 * Handles certificate-related operations including creation, retrieval,
 * verification, and listing.
 */

import { Response } from 'express';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import Certificate from '../models/Certificate';
import { AuthRequest } from '../middleware/auth';

/**
 * Generate a unique certificate ID
 */
const generateCertificateId = (): string => {
  return `ZT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

/**
 * Sign certificate data
 * TODO: Implement proper RSA signing with private key
 */
const signCertificate = (data: any): string => {
  const secret = process.env.JWT_SECRET || 'default-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(data))
    .digest('hex');
};

/**
 * POST /api/certificates
 * Create a new certificate
 */
export const createCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceInfo, wipeDetails, operator } = req.body;
    const certificateId = generateCertificateId();

    const dataToSign = {
      certificateId,
      deviceInfo,
      wipeDetails,
      operator,
      timestamp: new Date().toISOString(),
    };

    const signature = signCertificate(dataToSign);

    const certificate = new Certificate({
      certificateId,
      deviceInfo,
      wipeDetails: {
        ...wipeDetails,
        timestamp: new Date(wipeDetails.timestamp || Date.now()),
      },
      operator,
      signature,
      verified: true,
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      certificate: {
        certificateId: certificate.certificateId,
        deviceInfo: certificate.deviceInfo,
        wipeDetails: certificate.wipeDetails,
        operator: certificate.operator,
        signature: certificate.signature,
        createdAt: certificate.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/certificates/:certificateId
 * Get certificate by ID (protected)
 */
export const getCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json({ certificate });
  } catch (error: any) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/certificates/verify/:certificateId
 * Verify certificate (public endpoint)
 */
export const verifyCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ 
        verified: false, 
        error: 'Certificate not found' 
      });
    }

    // TODO: Verify signature against public key

    res.json({
      verified: certificate.verified,
      certificate: {
        certificateId: certificate.certificateId,
        deviceInfo: certificate.deviceInfo,
        wipeDetails: certificate.wipeDetails,
        operator: certificate.operator,
        createdAt: certificate.createdAt,
        signature: certificate.signature,
      },
    });
  } catch (error: any) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/certificates
 * List all certificates (admin only)
 */
export const listCertificates = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const total = await Certificate.countDocuments();
    const certificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      certificates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('List certificates error:', error);
    res.status(500).json({ error: error.message });
  }
};
