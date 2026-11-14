import { Router } from 'express';
import { authController } from '../auth/auth.controller';

const router = Router();

// Superadmin verification & approval endpoints
// GET /api/v1/admin/pending
router.get('/pending', (req, res) => authController.getPendingWineries(req, res));

// POST /api/v1/admin/approve/:wineryId
router.post('/approve/:wineryId', (req, res) => authController.approveWinery(req, res));

// POST /api/v1/admin/reject/:wineryId
router.post('/reject/:wineryId', (req, res) => authController.rejectWinery(req, res));

export default router;
