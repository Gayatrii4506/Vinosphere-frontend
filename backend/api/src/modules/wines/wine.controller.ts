import { Request, Response } from 'express';
import { wineService } from './wine.service';
import { recommendationService, mlRecommenderService } from '../recommendations';
import { interactionService } from '../interactions/interaction.service';
import { userService } from '../users/user.service';
import { cacheService } from '../../shared/cache.service';

export class WineController {
  async getPopularWines(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 8;
      const results = await recommendationService.getPopularWines(limit);
      res.status(200).json({ status: 'success', data: results });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getRecommendations(req: Request, res: Response) {
    try {
      const src = req.method === 'POST' && req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
      const userId = (req as any).user?.id || src.userId || src.user_id;
      const experienceLevel = (src.experienceLevel || src.experience_level || src.experience) as any;
      const beginnerPath = (src.beginnerPath || src.beginner_path || src.path) as any;
      const tasteAppealing = (src.tasteAppealing || src.taste_appealing) as string;
      const rawWineTypes = src.wineTypes || src.wine_types;
      const wineTypes = Array.isArray(rawWineTypes) ? rawWineTypes : (rawWineTypes ? String(rawWineTypes).split(',') : undefined);
      const rawGrapes = src.grapes || src.varietals;
      const grapes = Array.isArray(rawGrapes) ? rawGrapes : (rawGrapes ? String(rawGrapes).split(',') : undefined);
      const sweetness = (src.sweetness || src.sugar) as string;
      const bodyStyle = (src.bodyStyle || src.body_style || src.body) as string;
      const acidity = src.acidity as string;
      const tannin = src.tannin as string;
      const rawRegions = src.regions || src.region;
      const regions = Array.isArray(rawRegions) ? rawRegions : (rawRegions ? String(rawRegions).split(',') : undefined);
      const rawFlavors = src.flavors || src.flavor_notes;
      const flavors = Array.isArray(rawFlavors) ? rawFlavors : (rawFlavors ? String(rawFlavors).split(',') : undefined);
      const occasion = src.occasion as string;
      const budget = src.budget as string;
      const limit = parseInt(src.limit as string) || 8;

      const results = await recommendationService.getPersonalizedRecommendations({
        userId,
        experienceLevel,
        beginnerPath,
        tasteAppealing,
        wineTypes,
        grapes,
        sweetness,
        bodyStyle,
        acidity,
        tannin,
        regions,
        flavors,
        occasion,
        budget,
        limit,
      });

      res.status(200).json({ status: 'success', data: results });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async recommendUserWines(req: Request, res: Response) {
    try {
      const src = req.method === 'POST' && req.body && Object.keys(req.body).length > 0 ? req.body : req.query;
      const userId = (req as any).user?.id || req.params.userId || src.userId || src.user_id;
      const limit = parseInt(src.limit as string) || 8;
      const occasion = src.occasion as string;
      const budget = src.budget as string;
      const forceExperienceLevel = (src.forceExperienceLevel || src.force_experience_level || src.experienceLevel || src.experience_level || src.experience) as any;

      const results = await recommendationService.recommendWines(userId, {
        limit,
        occasion,
        budget,
        forceExperienceLevel,
        tasteAppealing: src.tasteAppealing || src.taste_appealing,
        wineTypes: src.wineTypes || src.wine_types ? (Array.isArray(src.wineTypes || src.wine_types) ? (src.wineTypes || src.wine_types) : String(src.wineTypes || src.wine_types).split(',')) : undefined,
        sweetness: src.sweetness || src.sugar,
        bodyStyle: src.bodyStyle || src.body_style || src.body,
        acidity: src.acidity,
        tannin: src.tannin,
        grapes: src.grapes || src.varietals ? (Array.isArray(src.grapes || src.varietals) ? (src.grapes || src.varietals) : String(src.grapes || src.varietals).split(',')) : undefined,
        regions: src.regions || src.region ? (Array.isArray(src.regions || src.region) ? (src.regions || src.region) : String(src.regions || src.region).split(',')) : undefined,
        flavors: src.flavors || src.flavor_notes ? (Array.isArray(src.flavors || src.flavor_notes) ? (src.flavors || src.flavor_notes) : String(src.flavors || src.flavor_notes).split(',')) : undefined,
      });

      res.status(200).json({ status: 'success', data: results });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getSimilarWines(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const limit = parseInt(req.query.limit as string) || 4;
      const similar = await recommendationService.getSimilarWines(id, limit);
      res.status(200).json({ status: 'success', data: similar });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Records interaction on specific wine (Phase 17 Requirement 5: POST /api/wines/:wineId/interactions)
   */
  async recordWineInteraction(req: Request, res: Response) {
    try {
      const wineId = req.params.wineId as string;
      const user = (req as any).user;
      const userId = user?.id || req.body.userId || req.body.user_id || 'anonymous-user';
      const interaction = await interactionService.recordInteraction(userId, {
        wineId,
        interactionType: req.body.interactionType || req.body.interaction_type || req.body.type,
        metadata: req.body.metadata,
      });
      cacheService.invalidateInteractionSummary(userId);
      res.status(201).json({ status: 'success', data: interaction });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  /**
   * Unified, Recommendation-Aware Catalogue Endpoint (Phase 17 Requirement 1, 2, 3, 6, 7, 8)
   */
  async getAllWines(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, parseInt(req.query.limit as string) || 12);
      const rawSort = (req.query.sort as string || req.query.sortBy as string || 'recommended').toLowerCase().trim();
      
      const user = (req as any).user;
      const userId = user?.id || (req.query.userId as string) || (req.query.user_id as string);

      // Filter params
      const typeFilter = (req.query.type || req.query.wineType || req.query.wine_type) as string;
      const minPrice = req.query.minPrice || req.query.min_price ? parseFloat(req.query.minPrice as string || req.query.min_price as string) : undefined;
      const maxPrice = req.query.maxPrice || req.query.max_price ? parseFloat(req.query.maxPrice as string || req.query.max_price as string) : undefined;
      const priceRange = (req.query.priceRange || req.query.price_range) as string;
      const minRating = req.query.rating || req.query.minRating || req.query.min_rating ? parseFloat(req.query.rating as string || req.query.minRating as string || req.query.min_rating as string) : undefined;
      const vintage = req.query.vintage || req.query.year ? String(req.query.vintage || req.query.year) : undefined;
      const foodPairing = (req.query.foodPairing || req.query.food_pairing) as string;
      const search = ((req.query.q || req.query.search || '') as string).toLowerCase().trim();

      // 1. Fetch raw wines from database
      const rawWines = await wineService.getAllWines();

      // 2. Apply mandatory filters first (Requirement 2 & Phase 15 Rule 4)
      const candidates = (rawWines || []).filter((wine: any) => {
        // Price filter
        if (priceRange) {
          const [minStr, maxStr] = priceRange.split('-');
          const min = parseFloat(minStr);
          const max = parseFloat(maxStr);
          if (!isNaN(min) && (wine.price || 0) < min) return false;
          if (!isNaN(max) && (wine.price || 0) > max) return false;
        }
        if (minPrice !== undefined && (wine.price || 0) < minPrice) return false;
        if (maxPrice !== undefined && (wine.price || 0) > maxPrice) return false;

        // Type filter
        if (typeFilter && typeFilter !== 'all' && typeFilter !== 'ALL') {
          const wType = (wine.wine_type || wine.type || '').toLowerCase();
          if (!wType.includes(typeFilter.toLowerCase())) return false;
        }

        // Rating filter
        if (minRating !== undefined) {
          const effectiveRating = (wine.rating || 85) <= 10 ? (wine.rating || 8.5) * 10 : (wine.rating || 85);
          const targetRating = minRating <= 10 ? minRating * 10 : minRating;
          if (effectiveRating < targetRating) return false;
        }

        // Vintage filter
        if (vintage) {
          const wineYear = wine.vintage || wine.year;
          if (vintage === '2021-older') {
            if (wineYear > 2021) return false;
          } else if (wineYear !== parseInt(vintage)) {
            return false;
          }
        }

        // Food pairing
        if (foodPairing) {
          const pairings = Array.isArray(wine.food_pairing || wine.foodPairings) 
            ? (wine.food_pairing || wine.foodPairings) 
            : [wine.food_pairing || wine.foodPairings || ''];
          const hasMatch = pairings.some((p: string) => String(p).toLowerCase().includes(foodPairing.toLowerCase()));
          if (!hasMatch) return false;
        }

        // Search query
        if (search) {
          const nameMatch = (wine.name || '').toLowerCase().includes(search);
          const wineryMatch = (wine.wineries?.name || wine.winery_name || wine.manufacturer || '').toLowerCase().includes(search);
          const grapeMatch = (wine.grape_variety || wine.grapeVariety || '').toLowerCase().includes(search);
          if (!nameMatch && !wineryMatch && !grapeMatch) return false;
        }

        return true;
      });

      // 3. Sorting & Personalization
      type FormattedItem = {
        wine: any;
        recommendation?: {
          label: string | null;
          reasons: string[];
        } | null;
      };

      let formattedList: FormattedItem[] = [];

      if (rawSort === 'price_asc' || rawSort === 'priceasc') {
        candidates.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
        formattedList = candidates.map((w: any) => ({ wine: w, recommendation: null }));
      } else if (rawSort === 'price_desc' || rawSort === 'pricedesc') {
        candidates.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
        formattedList = candidates.map((w: any) => ({ wine: w, recommendation: null }));
      } else if (rawSort === 'newest' || rawSort === 'year') {
        candidates.sort((a: any, b: any) => (b.vintage || b.year || 0) - (a.vintage || a.year || 0));
        formattedList = candidates.map((w: any) => ({ wine: w, recommendation: null }));
      } else if (rawSort === 'rating') {
        candidates.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
        formattedList = candidates.map((w: any) => ({ wine: w, recommendation: null }));
      } else if (rawSort === 'popular') {
        candidates.sort((a: any, b: any) => (b.review_count || b.reviews || 0) - (a.review_count || a.reviews || 0));
        formattedList = candidates.map((w: any) => ({ wine: w, recommendation: null }));
      } else if (rawSort === 'all' || rawSort === 'browseall' || rawSort === 'browse_all') {
        formattedList = candidates.map((w: any) => ({ wine: w, recommendation: null }));
      } else {
        // =========================================================================
        // RECOMMENDED SORT (Requirement 2 & 3: Personalized or Cold-Start)
        // =========================================================================
        try {
          // Fetch user preferences & interaction history if user ID provided (Cached with TTL)
          let userPrefs = null;
          if (userId) {
            try {
              userPrefs = cacheService.getPreferences(userId);
              if (!userPrefs) {
                userPrefs = await userService.getPreferences(userId);
                if (userPrefs) cacheService.setPreferences(userId, userPrefs, 30);
              }
            } catch (e) {
              // Graceful fallback
            }
          }

          const userInteractions = {
            liked: new Set<string>(),
            disliked: new Set<string>(),
            wishlisted: new Set<string>(),
            purchased: new Set<string>(),
            viewed: new Set<string>(),
          };

          if (userId) {
            try {
              let summary = cacheService.getInteractionSummary(userId);
              if (!summary) {
                summary = await interactionService.getUserInteractionSummary(userId);
                if (summary) cacheService.setInteractionSummary(userId, summary, 15);
              }
              summary.likedWineIds.forEach((id: string) => userInteractions.liked.add(id));
              summary.dislikedWineIds.forEach((id: string) => userInteractions.disliked.add(id));
              summary.wishlistedWineIds.forEach((id: string) => userInteractions.wishlisted.add(id));
              summary.purchasedWineIds.forEach((id: string) => userInteractions.purchased.add(id));
              summary.viewedWineIds.forEach((id: string) => userInteractions.viewed.add(id));
            } catch (e) {
              // Graceful fallback
            }
          }

          // Compute signal weights for implicit preferences
          const grapeWeights: Record<string, number> = {};
          const flavorWeights: Record<string, number> = {};
          let totalPositiveWeight = 0;

          candidates.forEach((w: any) => {
            const idStr = String(w.id);
            let wWeight = 0;
            if (userInteractions.purchased.has(idStr)) wWeight += 3.0;
            if (userInteractions.wishlisted.has(idStr)) wWeight += 2.0;
            if (userInteractions.liked.has(idStr)) wWeight += 2.0;
            if (userInteractions.viewed.has(idStr) && userInteractions.viewed.size >= 3) wWeight += 0.3;

            if (wWeight > 0) {
              totalPositiveWeight += wWeight;
              const g = (w.grape_variety || w.grapeVariety || '').toLowerCase();
              if (g) grapeWeights[g] = (grapeWeights[g] || 0) + wWeight;
              const flavors = Array.isArray(w.flavors || w.tasteNotes) ? (w.flavors || w.tasteNotes) : [];
              flavors.forEach((f: string) => {
                const fl = String(f).toLowerCase();
                flavorWeights[fl] = (flavorWeights[fl] || 0) + wWeight;
              });
            }
          });

          // Use In-Engine Vector Space & Cosine Similarity ML Recommender
          const mlResults = mlRecommenderService.rankWines(
            candidates,
            userPrefs,
            userInteractions
          );

          formattedList = mlResults.map(r => ({
            wine: {
              ...r.wine,
              matchPercentage: r.matchPercentage,
              cosineSimilarity: r.cosineSimilarity
            },
            recommendation: r.recommendation
          }));
        } catch (recError) {
          // Graceful fallback to popularity / rating sort on recommendation failure (Requirement 8)
          console.warn('[VinoSphere] Recommendation generation fallback:', recError);
          candidates.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
          formattedList = candidates.map((w: any) => ({
            wine: w,
            recommendation: {
              label: 'POPULAR_CHOICE',
              reasons: ['Estate vintage with strong sommelier rating']
            }
          }));
        }
      }

      // 4. Pagination (Requirement 7)
      const total = formattedList.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = formattedList.slice((page - 1) * limit, page * limit);

      res.status(200).json({
        status: 'success',
        data: {
          wines: paginated,
          pagination: {
            page,
            limit,
            total,
            totalPages,
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async getWineById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const wine = await wineService.getWineById(id);
      res.status(200).json({ status: 'success', data: wine });
    } catch (error: any) {
      res.status(404).json({ status: 'error', message: error.message });
    }
  }

  async createWine(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (!userWineryId) {
          return res.status(403).json({ status: 'error', message: 'No estate associated with this winery account' });
        }
        req.body.winery_id = userWineryId;
      }

      const wine = await wineService.createWine(req.body);
      cacheService.invalidateWines();
      res.status(201).json({ status: 'success', data: wine });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async updateWine(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existing = await wineService.getWineById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: `Wine with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (existing.winery_id !== userWineryId) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to update another winery estate\'s wines.' });
        }
        delete req.body.winery_id;
      }

      const wine = await wineService.updateWine(id, req.body);
      cacheService.invalidateWines();
      res.status(200).json({ status: 'success', data: wine });
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async deleteWine(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const existing = await wineService.getWineById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: `Wine with ID ${id} not found` });
      }

      const user = (req as any).user;
      const role = (user?.role || user?.app_metadata?.role || '').toLowerCase();
      const userWineryId = user?.wineryId || user?.app_metadata?.winery_id || user?.user_metadata?.winery_id || user?.user_metadata?.wineryId;

      if (role !== 'admin' && role !== 'superadmin') {
        if (existing.winery_id !== userWineryId) {
          return res.status(403).json({ status: 'error', message: 'Access denied: You are not authorized to delete another winery estate\'s wines.' });
        }
      }

      await wineService.deleteWine(id);
      cacheService.invalidateWines();
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ status: 'error', message: error.message });
    }
  }
}

export const wineController = new WineController();
