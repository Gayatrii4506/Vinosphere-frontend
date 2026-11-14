import { db } from '../../adapters/database';
import { AppError } from '../../shared/errors/AppError';
import { interactionService } from '../interactions/interaction.service';

export class WishlistService {
  /**
   * Fetch a specific user's wishlist, including the wine and winery details.
   */
  async getUserWishlist(userId: string) {
    // Join wishlist -> wines -> wineries, inventory, and images
    const selectQuery = 'user_id, wine_id, created_at, wines(*, wineries(name, city, country), wine_inventory(price, stock_quantity), wine_images(image_url, is_primary))';
    return await db.findWithRelations('wishlist', selectQuery, { user_id: userId });
  }

  /**
   * Add a wine to the user's wishlist
   */
  async addToWishlist(userId: string, wineId: string) {
    if (!wineId) throw new AppError('wineId is required', 400);

    // Record interaction for recommendation & timeline tracking
    try {
      await interactionService.recordInteraction(userId, {
        wineId,
        interactionType: 'WISHLIST'
      });
    } catch (e) {
      console.warn('Wishlist interaction logging notice:', e);
    }

    // Check if it already exists to provide a friendly response
    const existing = await db.find('wishlist', { user_id: userId, wine_id: wineId });
    if (existing && existing.length > 0) {
      return existing[0];
    }

    return await db.create('wishlist', { user_id: userId, wine_id: wineId });
  }

  /**
   * Remove a wine from the user's wishlist
   */
  async removeFromWishlist(userId: string, wineId: string) {
    if (!wineId) throw new AppError('wineId is required', 400);

    // Delete by composite primary key (user_id, wine_id)
    return await db.deleteWhere('wishlist', { user_id: userId, wine_id: wineId });
  }
}

export const wishlistService = new WishlistService();
