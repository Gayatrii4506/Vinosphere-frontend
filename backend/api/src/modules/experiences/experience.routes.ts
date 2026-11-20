import { Router } from 'express';
import { experienceController } from './experience.controller';
import { protect } from '../../middleware/authMiddleware';
import { restrictTo } from '../../middleware/roleMiddleware';

const router = Router();

router.route('/')
  .get(experienceController.getAllExperiences)
  .post(protect, restrictTo('admin', 'winery'), experienceController.createExperience);

router.route('/:id')
  .get(experienceController.getExperienceById)
  .put(protect, restrictTo('admin', 'winery'), experienceController.updateExperience)
  .delete(protect, restrictTo('admin', 'winery'), experienceController.deleteExperience);

export default router;
