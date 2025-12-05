/**
 * Certificate Controller
 * 
 * Handles certificate creation and verification with RSA signing.
 */

import { Response } from 'express';
import Certificate from '../models/Certificate';
import WipeLog from '../models/WipeLog';
import { AuthRequest } from '../middleware/auth';
import { signData, verifySignature, generateHash, generateWipeId } from '../utils/crypto';

/**
 * POST /certificates
 * Create a new certificate with optional log file upload
 */
export const createCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deviceModel, serialNumber, method, timestamp, rawLog, devicePath, duration, exitCode } = req.body;

    if (!deviceModel || !method || !req.user?.id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Generate unique wipe ID
    const wipeId = generateWipeId();

    // Prepare certificate payload for signing
    const certPayload = {
      wipeId,
      userId: req.user.id,
      deviceModel,
      serialNumber: serialNumber || null,
      method,
      timestamp: timestamp || new Date().toISOString(),
    };

    // Generate log hash
    const logContent = rawLog || '';
    const logHash = generateHash(logContent);

    // Sign the certificate payload
    const dataToSign = JSON.stringify({ ...certPayload, logHash });
    const signature = signData(dataToSign);

    // Create certificate
    const certificate = new Certificate({
      wipeId,
      userId: req.user.id,
      deviceModel,
      serialNumber: serialNumber || undefined,
      method,
      timestamp: new Date(timestamp || Date.now()),
      logHash,
      signature,
      uploaded: !!rawLog,
    });

    await certificate.save();

    // Create wipe log if raw log provided
    if (rawLog && devicePath && duration !== undefined && exitCode !== undefined) {
      const wipeLog = new WipeLog({
        wipeId,
        rawLog,
        devicePath,
        duration,
        exitCode,
      });
      await wipeLog.save();
    }

    // Generate verification URL
    const verificationUrl = `${req.protocol}://${req.get('host')}/certificates/${wipeId}`;

    res.status(201).json({
      wipeId,
      verificationUrl,
      signature,
      logHash,
    });
  } catch (error: any) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /certificates/:wipeId
 * Verify and retrieve certificate
 */
export const getCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { wipeId } = req.params;

    const certificate = await Certificate.findOne({ wipeId }).populate('userId', 'email role');
    if (!certificate) {
      res.status(404).json({ 
        verified: false,
        error: 'Certificate not found' 
      });
      return;
    }

    // Reconstruct payload for verification
    const certPayload = {
      wipeId: certificate.wipeId,
      userId: certificate.userId,
      deviceModel: certificate.deviceModel,
      serialNumber: certificate.serialNumber || null,
      method: certificate.method,
      timestamp: certificate.timestamp.toISOString(),
    };

    const dataToVerify = JSON.stringify({ ...certPayload, logHash: certificate.logHash });
    
    // Verify signature
    const isValid = verifySignature(dataToVerify, certificate.signature);

    // Get associated wipe log if exists
    let wipeLog = null;
    if (certificate.uploaded) {
      wipeLog = await WipeLog.findOne({ wipeId });
    }

    res.json({
      verified: isValid,
      certificate: {
        wipeId: certificate.wipeId,
        deviceModel: certificate.deviceModel,
        serialNumber: certificate.serialNumber,
        method: certificate.method,
        timestamp: certificate.timestamp,
        logHash: certificate.logHash,
        signature: certificate.signature,
        uploaded: certificate.uploaded,
        createdAt: certificate.createdAt,
      },
      wipeLog: wipeLog ? {
        devicePath: wipeLog.devicePath,
        duration: wipeLog.duration,
        exitCode: wipeLog.exitCode,
      } : null,
    });
  } catch (error: any) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};
