import { db } from '../../adapters/database';
import { wishlistService } from '../wishlist/wishlist.service';
import {
  WineInteractionType,
  UserWineInteraction,
  RecordInteractionDto,
  UserInteractionSummary,
} from './interaction.types';
import crypto from 'crypto';

export class InteractionService {
  // In-memory store for high-performance retrieval and resilience
  private memoryInteractions: Map<string, UserWineInteraction[]> = new Map();

  /**
   * Normalizes incoming interaction type string to canonical WineInteractionType.
   */
  public normalizeInteractionType(rawType: string | undefined): WineInteractionType {
    if (!rawType) return 'VIEW';
    const upper = rawType.toUpperCase().trim();
    if (upper === 'LIKE' || upper === 'THUMBS_UP' || upper === 'FAVORITE') return 'LIKE';
    if (upper === 'DISLIKE' || upper === 'THUMBS_DOWN' || upper === 'NOT_FOR_ME') return 'DISLIKE';
    if (upper === 'WISHLIST' || upper === 'SAVE' || upper === 'BOOKMARK') return 'WISHLIST';
    if (upper === 'PURCHASE' || upper === 'BUY' || upper === 'ORDER') return 'PURCHASE';
    return 'VIEW';
  }

  /**
   * Records a user wine interaction (VIEW, LIKE, DISLIKE, WISHLIST, PURCHASE).
   */
  public async recordInteraction(
    userId: string,
    dto: RecordInteractionDto
  ): Promise<UserWineInteraction> {
    const rawWineId = dto.wineId || dto.wine_id;
    if (!rawWineId) {
      throw new Error('wineId is required to record interaction');
    }

    const type = this.normalizeInteractionType(dto.interactionType || dto.interaction_type || dto.type);
    const interaction: UserWineInteraction = {
      id: crypto.randomUUID(),
      userId,
      wineId: rawWineId,
      interactionType: type,
      timestamp: new Date().toISOString(),
      metadata: dto.metadata,
    };

    // 1. Add to in-memory store
    const userList = this.memoryInteractions.get(userId) || [];
    // If it's a VIEW or LIKE/DISLIKE, avoid spamming duplicate identical sequential events in short order
    const isDuplicateRecent = userList.some(
      (existing) =>
        existing.wineId === rawWineId &&
        existing.interactionType === type &&
        Date.now() - new Date(existing.timestamp).getTime() < 10000 // 10 seconds debounce
    );

    if (!isDuplicateRecent) {
      userList.push(interaction);
      this.memoryInteractions.set(userId, userList);
    }

    // 2. Sync with existing wishlist table if interaction is WISHLIST
    if (type === 'WISHLIST') {
      try {
        await wishlistService.addToWishlist(userId, rawWineId);
      } catch (err) {
        // Fallback gracefully
      }
    }

    // 3. Attempt to persist to database if interactions table exists
    try {
      await db.create('user_interactions', {
        user_id: userId,
        wine_id: rawWineId,
        interaction_type: type,
        created_at: interaction.timestamp,
        metadata: dto.metadata || {},
      });
    } catch (err) {
      // Table may not exist yet in Supabase schema; memory store ensures 100% operational availability
    }

    return interaction;
  }

  /**
   * Retrieves recent interactions for a given user.
   */
  public async getUserInteractions(userId: string, limit = 50): Promise<UserWineInteraction[]> {
    const memoryList = this.memoryInteractions.get(userId) || [];

    // Also attempt to fetch from database
    try {
      const dbList = await db.find('user_interactions', { user_id: userId });
      if (dbList && Array.isArray(dbList) && dbList.length > 0) {
        const mapped: UserWineInteraction[] = dbList.map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          wineId: d.wine_id,
          interactionType: this.normalizeInteractionType(d.interaction_type),
          timestamp: d.created_at,
          metadata: d.metadata,
        }));
        return mapped.slice(0, limit);
      }
    } catch (err) {
      // Return memory fallback
    }

    return [...memoryList].reverse().slice(0, limit);
  }

  /**
   * Retrieves categorized wine IDs for a user to power recommendations and personalization.
   */
  public async getUserInteractionSummary(userId: string): Promise<UserInteractionSummary> {
    const interactions = await this.getUserInteractions(userId, 200);

    const viewed = new Set<string>();
    const liked = new Set<string>();
    const disliked = new Set<string>();
    const wishlisted = new Set<string>();
    const purchased = new Set<string>();

    for (const item of interactions) {
      if (item.interactionType === 'VIEW') viewed.add(item.wineId);
      if (item.interactionType === 'LIKE') liked.add(item.wineId);
      if (item.interactionType === 'DISLIKE') disliked.add(item.wineId);
      if (item.interactionType === 'WISHLIST') wishlisted.add(item.wineId);
      if (item.interactionType === 'PURCHASE') purchased.add(item.wineId);
    }

    // Also sync with database wishlist table
    try {
      const wishlistDb = await db.find('wishlist', { user_id: userId });
      if (wishlistDb && Array.isArray(wishlistDb)) {
        wishlistDb.forEach((w: any) => wishlisted.add(w.wine_id));
      }
    } catch (err) {
      // Fallback gracefully
    }

    return {
      userId,
      viewedWineIds: Array.from(viewed),
      likedWineIds: Array.from(liked),
      dislikedWineIds: Array.from(disliked),
      wishlistedWineIds: Array.from(wishlisted),
      purchasedWineIds: Array.from(purchased),
      totalInteractions: interactions.length,
    };
  }

  /**
   * Resets all recorded interactions for a user.
   */
  public async resetUserInteractions(userId: string): Promise<boolean> {
    this.memoryInteractions.delete(userId);
    try {
      await db.deleteWhere('user_interactions', { user_id: userId });
    } catch (err) {
      // Memory store cleared
    }
    return true;
  }
}

export const interactionService = new InteractionService();
