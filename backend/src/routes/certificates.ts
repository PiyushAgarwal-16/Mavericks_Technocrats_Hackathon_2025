/**
 * Certificate Routes
 */

import { Router } from 'express';
import { createCertificate, getCertificate, validateCertificateId } from '../controllers/certController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Protected: Create certificate
router.post('/', authenticate, createCertificate);

// Public: Validate certificate ID format and check existence
router.get('/validate/:wipeId', validateCertificateId);

// Public: Get and verify certificate
router.get('/:wipeId', getCertificate);

export default router;
