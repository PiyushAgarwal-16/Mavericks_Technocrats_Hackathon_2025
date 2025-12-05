/**
 * Certificate Controller
 * 
 * Handles certificate creation and verification with RSA signing.
 */

import { Response } from 'express';
import Certificate from '../models/Certificate';
import WipeLog from '../models/WipeLog';
import { AuthRequest } from '../middleware/auth';
import { generateHash, generateWipeId } from '../utils/crypto';
import { signCertificatePayload, verifyCertificateSignature, computeSHA256 } from '../utils/signing';

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

    // Generate log hash
    const logContent = rawLog || '';
    const logHash = generateHash(logContent);

    // Use consistent timestamp for both signing and storage
    const certTimestamp = timestamp || new Date().toISOString();

    // Prepare certificate payload for signing (includes all required fields)
    const certPayload = {
      wipeId,
      userId: req.user.id,
      deviceModel,
      serialNumber: serialNumber || null,
      method,
      timestamp: certTimestamp,
      logHash,
    };

    // Sign the certificate payload (will be canonicalized automatically)
    const signature = signCertificatePayload(certPayload);

    // Create certificate (use same values as signed payload)
    const certificate = new Certificate({
      wipeId,
      userId: req.user.id,
      deviceModel,
      serialNumber: serialNumber || null,
      method,
      timestamp: new Date(certTimestamp),
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
        signatureValid: false,
        logHashMatches: false,
        error: 'Certificate not found' 
      });
      return;
    }

    // Reconstruct payload for verification (must match signing payload exactly)
    // Note: userId is populated, so we need to extract the _id
    const userId = (certificate.userId as any)._id
      ? (certificate.userId as any)._id.toString()
      : certificate.userId.toString();
    
    const certPayload = {
      wipeId: certificate.wipeId,
      userId: userId,
      deviceModel: certificate.deviceModel,
      serialNumber: certificate.serialNumber || null,
      method: certificate.method,
      timestamp: certificate.timestamp.toISOString(),
      logHash: certificate.logHash,
    };

    // Verify signature using canonicalized payload
    const signatureValid = verifyCertificateSignature(certPayload, certificate.signature);

    // Get associated wipe log and verify log hash
    let wipeLog = null;
    let logHashMatches = false;

    if (certificate.uploaded) {
      wipeLog = await WipeLog.findOne({ wipeId });
      if (wipeLog) {
        // Recompute SHA256 of raw log and compare with stored logHash
        const recomputedHash = computeSHA256(wipeLog.rawLog);
        logHashMatches = recomputedHash === certificate.logHash;
      }
    } else {
      // If no log uploaded, consider hash valid (empty log scenario)
      logHashMatches = true;
    }

    res.json({
      verified: signatureValid && logHashMatches,
      signatureValid,
      logHashMatches,
      certificate: {
        _id: certificate._id,
        wipeId: certificate.wipeId,
        userId: certificate.userId,
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
        wipeId: wipeLog.wipeId,
        devicePath: wipeLog.devicePath,
        duration: wipeLog.duration,
        exitCode: wipeLog.exitCode,
        rawLog: wipeLog.rawLog.substring(0, 500) + (wipeLog.rawLog.length > 500 ? '...' : ''),
      } : null,
      user: certificate.userId,
    });
  } catch (error: any) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: error.message });
  }
};
