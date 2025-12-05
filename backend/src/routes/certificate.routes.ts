import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCertificate,
  getCertificate,
  verifyCertificate,
  listCertificates,
} from '../controllers/certificate.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public route - verify certificate
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.post(
  '/',
  authenticate,
  [
    body('deviceInfo.serialNumber').notEmpty(),
    body('deviceInfo.model').notEmpty(),
    body('deviceInfo.capacity').notEmpty(),
    body('deviceInfo.type').isIn(['USB', 'HDD', 'SSD', 'OTHER']),
    body('wipeDetails.method').notEmpty(),
    body('wipeDetails.passes').isInt({ min: 1 }),
    body('wipeDetails.standard').notEmpty(),
    body('wipeDetails.duration').isInt({ min: 1 }),
    body('operator.name').notEmpty(),
  ],
  createCertificate
);

router.get('/:certificateId', authenticate, getCertificate);

router.get('/', authenticate, requireAdmin, listCertificates);

export default router;
