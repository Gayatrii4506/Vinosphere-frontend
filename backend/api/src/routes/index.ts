import { Router } from 'express';
import userRoutes from '../modules/users/user.routes';
import wineryRoutes from '../modules/wineries/winery.routes';
import wineRoutes from '../modules/wines/wine.routes';
import eventRoutes from '../modules/events/event.routes';
import experienceRoutes from '../modules/experiences/experience.routes';
import bookingRoutes from '../modules/bookings/booking.routes';
import reviewRoutes from '../modules/reviews/review.routes';
import wishlistRoutes from '../modules/wishlist/wishlist.routes';
import uploadRoutes from '../modules/upload/upload.routes';
import discoveryRoutes from '../modules/discovery/discovery.routes';
import dashboardRoutes from '../modules/admin/dashboard.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import authRoutes from '../modules/auth/auth.routes';
import adminRoutes from '../modules/admin/admin.routes';
import interactionRoutes from '../modules/interactions/interaction.routes';
import qualityRoutes from '../modules/quality/quality.routes';

const router = Router();

// Mount individual domain routes
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/wineries', wineryRoutes);
router.use('/wines', wineRoutes);
router.use('/events', eventRoutes);
router.use('/experiences', experienceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/interactions', interactionRoutes);
router.use('/quality', qualityRoutes);
router.use('/uploads', uploadRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
