import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import { protect } from '../../middleware/authMiddleware';
import { catchAsync } from '../../shared/utils/catchAsync';

const router = Router();

// ALL wishlist routes require the user to be logged in
router.use(protect);

router.route('/')
  .get(catchAsync(wishlistController.getMyWishlist))
  .post(catchAsync(wishlistController.addWineToWishlist));

router.route('/:wineId')
  .delete(catchAsync(wishlistController.removeWineFromWishlist));

export default router;
