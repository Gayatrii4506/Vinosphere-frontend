import { Router } from 'express';
import { userController } from './user.controller';
import { protect } from '../../middleware/authMiddleware';

const router = Router();

// Current authenticated user preferences (Phase 17 Requirement 4)
router.route('/preferences')
  .get(protect, userController.getMyPreferences)
  .post(protect, userController.updateMyPreferences)
  .patch(protect, userController.updateMyPreferences)
  .put(protect, userController.updateMyPreferences);

router.route('/me/preferences')
  .get(protect, userController.getMyPreferences)
  .post(protect, userController.updateMyPreferences)
  .patch(protect, userController.updateMyPreferences)
  .put(protect, userController.updateMyPreferences);

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
