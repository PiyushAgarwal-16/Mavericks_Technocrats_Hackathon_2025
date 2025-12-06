/**
 * Health Check Routes
 * 
 * Simple health check endpoint for monitoring and deployment verification.
 */

import { Router, Request, Response } from 'express';

const router = Router();

/**
 * GET /health
 * Returns server health status
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /health/keys
 * Check if RSA keys are properly configured
 */
router.get('/keys', (_req: Request, res: Response) => {
  const hasPrivateKeyEnv = !!process.env.CERT_PRIVATE_KEY;
  const hasPublicKeyEnv = !!process.env.CERT_PUBLIC_KEY;
  const hasPrivateKeyPath = !!process.env.CERT_PRIVATE_KEY_PATH;
  const hasPublicKeyPath = !!process.env.CERT_PUBLIC_KEY_PATH;

  res.status(200).json({
    status: 'ok',
    keys: {
      privateKeyEnv: hasPrivateKeyEnv,
      publicKeyEnv: hasPublicKeyEnv,
      privateKeyPath: hasPrivateKeyPath,
      publicKeyPath: hasPublicKeyPath,
      privateKeyLength: hasPrivateKeyEnv ? process.env.CERT_PRIVATE_KEY?.length : 0,
      publicKeyLength: hasPublicKeyEnv ? process.env.CERT_PUBLIC_KEY?.length : 0,
      privateKeyPreview: hasPrivateKeyEnv ? process.env.CERT_PRIVATE_KEY?.substring(0, 50) + '...' : 'NOT SET',
    },
    message: hasPrivateKeyEnv && hasPublicKeyEnv 
      ? 'Keys configured via environment variables' 
      : 'Keys not found in environment, will try filesystem'
  });
});

export default router;
