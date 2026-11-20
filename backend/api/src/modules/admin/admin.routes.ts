import { Router } from 'express';
import { authController } from '../auth/auth.controller';
import { protect } from '../../middleware/authMiddleware';
import { restrictTo } from '../../middleware/roleMiddleware';

const router = Router();

// Superadmin verification & approval endpoints (protected, admin only)
router.get('/pending', protect, restrictTo('admin'), (req, res) => authController.getPendingWineries(req, res));
router.post('/approve/:wineryId', protect, restrictTo('admin'), (req, res) => authController.approveWinery(req, res));
router.post('/reject/:wineryId', protect, restrictTo('admin'), (req, res) => authController.rejectWinery(req, res));

export default router;
