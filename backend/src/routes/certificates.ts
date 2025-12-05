/**
 * Certificate Routes
 */

import { Router } from 'express';
import { createCertificate, getCertificate } from '../controllers/certController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected: Create certificate
router.post('/', authenticate, createCertificate);

// Public: Get and verify certificate
router.get('/:wipeId', getCertificate);

export default router;
