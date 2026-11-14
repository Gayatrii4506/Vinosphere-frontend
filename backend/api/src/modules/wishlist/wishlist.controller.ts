import { Request, Response } from 'express';
import { wishlistService } from './wishlist.service';

export class WishlistController {
  async getMyWishlist(req: Request, res: Response) {
    // req.user is guaranteed to exist because of the `protect` auth middleware
    const userId = (req as any).user.id;
    
    const wishlist = await wishlistService.getUserWishlist(userId);
    res.status(200).json({ status: 'success', data: wishlist });
  }

  async addWineToWishlist(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { wineId } = req.body;

    const result = await wishlistService.addToWishlist(userId, wineId);
    res.status(201).json({ status: 'success', data: result });
  }

  async removeWineFromWishlist(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const wineId = req.params.wineId as string;

    await wishlistService.removeFromWishlist(userId, wineId);
    res.status(204).send();
  }
}

export const wishlistController = new WishlistController();
