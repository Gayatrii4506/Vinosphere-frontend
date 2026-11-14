import { Router } from 'express';
import { experienceController } from './experience.controller';

const router = Router();

router.route('/')
  .get(experienceController.getAllExperiences)
  .post(experienceController.createExperience);

router.route('/:id')
  .get(experienceController.getExperienceById)
  .put(experienceController.updateExperience)
  .delete(experienceController.deleteExperience);

export default router;
