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
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
