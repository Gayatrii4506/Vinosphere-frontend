import { Router } from 'express';
import { reviewController } from './review.controller';

const router = Router();

router.route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router.route('/:id')
  .get(reviewController.getReviewById)
  .put(reviewController.updateReview)
  .delete(reviewController.deleteReview);

export default router;
