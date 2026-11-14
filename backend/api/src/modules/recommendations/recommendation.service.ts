import { db } from '../../adapters/database';
import { normalizeWineList, normalizeWine } from '../wines/wine-normalizer';
import { NormalizedWine, WineType, SweetnessLevel, BodyLevel } from '../wines/wine.types';
import { interactionService } from '../interactions/interaction.service';
import { userService } from '../users/user.service';
import { cacheService } from '../../shared/cache.service';
import { RecommendationRequest, RecommendationResult } from './recommendation.types';

export class RecommendationService {
  /**
   * Fetches all wines with inventory, images, and wineries from database.
   * Utilizes in-memory TTL caching to avoid repeated full table scans.
   */
  private async getAllNormalizedWines(): Promise<NormalizedWine[]> {
    const cached = cacheService.getNormalizedWines();
    if (cached) return cached;

    const selectQuery =
      '*, wineries(name, city, state, country), wine_inventory(price, stock_quantity, publish_status), wine_images(image_url, is_primary)';
    const rawWines = await db.findWithRelations('wines', selectQuery);
    const normalized = normalizeWineList(rawWines || []);
    cacheService.setNormalizedWines(normalized, 60);
    return normalized;
  }

  /**
   * Calculates a Bayesian confidence-weighted popularity score.
   * Formula: WeightedScore = (v * R + m * C) / (v + m)
   * where:
   *  v = review count
   *  R = wine rating (e.g. 85-98)
   *  m = minimum review threshold (15)
   *  C = global average rating (88)
   */
  public calculatePopularityScore(wine: NormalizedWine): number {
    const v = wine.reviewCount || 10;
    const R = wine.rating || 85;
    const m = 15;
    const C = 88;

    // Bayesian weighted score (yields ~82-96)
    const bayesianScore = (v * R + m * C) / (v + m);

    // Beginner friendliness bonus for crowd-pleasers
    let bonus = 0;
    if (wine.isBeginnerFriendly) bonus += 2;
    if (wine.sweetness === 'SEMI_DRY' || wine.sweetness === 'SWEET') bonus += 1;
    if (wine.tannin === 'LOW' && wine.wineType === 'RED') bonus += 1;

    return Math.min(99, Math.round(bayesianScore + bonus));
  }

  /**
   * Returns top popular wines ranked by Bayesian confidence score.
   */
  public async getPopularWines(limit = 8): Promise<RecommendationResult[]> {
    const allWines = await this.getAllNormalizedWines();
    const available = allWines.filter((w) => w.isAvailable);

    const scored = available.map((wine) => {
      const popScore = this.calculatePopularityScore(wine);
      const reasons: string[] = [];

      if (wine.reviewCount >= 20) {
        reasons.push(`Top-rated community favorite with ${wine.reviewCount} sommelier reviews`);
      } else if (wine.isBeginnerFriendly) {
        reasons.push('Highly approachable crowd-pleaser with smooth fruit profile');
      } else {
        reasons.push('Renowned estate vintage with exceptional character');
      }

      let highlightBadge: string | undefined;
      if (popScore >= 92) highlightBadge = 'Popular Choice';
      else if (wine.isBeginnerFriendly) highlightBadge = 'Beginner Friendly';

      return {
        wine,
        matchScore: popScore,
        matchReason: reasons[0],
        highlightBadge,
      };
    });

    // Sort by match score descending
    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  }

  /**
   * Core rule-based recommendation engine.
   * Handles:
   * 1. Completely new users (popular fallback or path selection)
   * 2. Beginner users (simple palate questions, non-technical)
   * 3. Intermediate users (style, body, sweetness, flavor notes, occasion, budget)
   * 4. Experienced users (grape/varietal, technical acidity/tannin/body/sweetness, terroir, budget)
   */
  public async getPersonalizedRecommendations(
    req: RecommendationRequest
  ): Promise<RecommendationResult[]> {
    const allWines = await this.getAllNormalizedWines();
    const available = allWines.filter((w) => w.isAvailable);

    // If completely new user or popular beginner path, return Bayesian popular wines
    if (req.beginnerPath === 'popular') {
      return await this.getPopularWines(req.limit || 8);
    }

    // Determine experience level
    const exp = req.experienceLevel || 'BEGINNER';
    const taste = (req.tasteAppealing || '').toLowerCase();
    const targetTypes = (req.wineTypes || []).map((t) => t.toUpperCase());
    const grapesPref = (req.grapes || []).map((g) => g.toLowerCase());
    const sweetnessPref = (req.sweetness || '').toLowerCase();
    const bodyStylePref = (req.bodyStyle || '').toLowerCase();
    const acidityPref = (req.acidity || '').toLowerCase();
    const tanninPref = (req.tannin || '').toLowerCase();
    const regionPrefs = (req.regions || []).map((r) => r.toLowerCase());
    const flavorPrefs = (req.flavors || []).map((f) => f.toLowerCase());
    const occasion = (req.occasion || '').toLowerCase();
    const budget = req.budget || '';

    // 1. Fetch user wishlist / interaction history if user ID provided (Cached with 15s TTL)
    const userInteractions = {
      liked: new Set<string>(),
      disliked: new Set<string>(),
      wishlisted: new Set<string>(),
      purchased: new Set<string>(),
      viewed: new Set<string>(),
    };

    if (req.userId) {
      try {
        let summary = cacheService.getInteractionSummary(req.userId);
        if (!summary) {
          summary = await interactionService.getUserInteractionSummary(req.userId);
          cacheService.setInteractionSummary(req.userId, summary, 15);
        }
        summary.likedWineIds.forEach((id: string) => userInteractions.liked.add(id));
        summary.dislikedWineIds.forEach((id: string) => userInteractions.disliked.add(id));
        summary.wishlistedWineIds.forEach((id: string) => userInteractions.wishlisted.add(id));
        summary.purchasedWineIds.forEach((id: string) => userInteractions.purchased.add(id));
        summary.viewedWineIds.forEach((id: string) => userInteractions.viewed.add(id));
      } catch (err) {
        // Fallback gracefully
      }
    }

    // 2. Behavioral Interaction Signal Aggregation (Phase 16)
    const grapeWeights: Record<string, number> = {};
    const flavorWeights: Record<string, number> = {};
    const typeWeights: Record<string, number> = {};
    let totalPositiveWeight = 0;

    for (const w of available) {
      let wWeight = 0;
      if (userInteractions.purchased.has(w.id)) wWeight += 3.0;
      if (userInteractions.wishlisted.has(w.id)) wWeight += 2.0;
      if (userInteractions.liked.has(w.id)) wWeight += 2.0;
      if (userInteractions.viewed.has(w.id) && userInteractions.viewed.size >= 3) wWeight += 0.3;

      if (wWeight > 0) {
        totalPositiveWeight += wWeight;
        if (w.grapeVariety) {
          const g = w.grapeVariety.toLowerCase();
          grapeWeights[g] = (grapeWeights[g] || 0) + wWeight;
        }
        if (w.wineType) {
          typeWeights[w.wineType] = (typeWeights[w.wineType] || 0) + wWeight;
        }
        (w.flavors || []).forEach((f) => {
          flavorWeights[f] = (flavorWeights[f] || 0) + wWeight;
        });
      }

      if (userInteractions.disliked.has(w.id)) {
        if (w.wineType) {
          typeWeights[w.wineType] = (typeWeights[w.wineType] || 0) - 2.0;
        }
      }
    }

    const hasSufficientBehavioralEvidence = totalPositiveWeight >= 2.0;

    const scoredResults: RecommendationResult[] = available.map((wine) => {
      let score = 50; // Base score
      const reasons: string[] = [];

      // 1. Popularity Baseline (+10 to +25 pts)
      const popScore = this.calculatePopularityScore(wine);
      score += Math.round((popScore - 80) * 0.8);

      // 2. Experience Level Alignment
      if (exp === 'BEGINNER') {
        if (wine.isBeginnerFriendly) {
          score += 20;
          reasons.push('Approachable fruit-forward palate with smooth finish');
        }
        if (wine.tannin === 'HIGH') {
          score -= 25;
        }
        if (wine.sweetness === 'SWEET' || wine.sweetness === 'SEMI_DRY') {
          score += 10;
        }
      } else if (exp === 'INTERMEDIATE') {
        if (bodyStylePref) {
          if (bodyStylePref.includes('light')) {
            if (wine.body === 'LIGHT' || wine.wineType === 'SPARKLING' || wine.wineType === 'WHITE') {
              score += 18;
              reasons.push('Light & refreshing style matching your preference');
            }
          } else if (bodyStylePref.includes('medium') || bodyStylePref.includes('smooth')) {
            if (wine.body === 'MEDIUM') {
              score += 18;
              reasons.push('Smooth & balanced profile with harmonious texture');
            }
          } else if (bodyStylePref.includes('bold') || bodyStylePref.includes('rich')) {
            if (wine.body === 'FULL' || wine.tannin === 'HIGH') {
              score += 18;
              reasons.push('Rich & bold full-bodied character');
            }
          }
        } else {
          if (wine.body === 'MEDIUM' || wine.body === 'FULL') {
            score += 10;
          }
        }

        if (sweetnessPref) {
          if (sweetnessPref.includes('dry') && !sweetnessPref.includes('semi')) {
            if (wine.sweetness === 'DRY') {
              score += 15;
              reasons.push('Crisp dry finish');
            } else {
              score -= 10;
            }
          } else if (sweetnessPref.includes('semi') || sweetnessPref.includes('off')) {
            if (wine.sweetness === 'SEMI_DRY') {
              score += 15;
              reasons.push('Gentle natural sweetness balancing acidity');
            }
          } else if (sweetnessPref.includes('sweet')) {
            if (wine.sweetness === 'SWEET') {
              score += 15;
              reasons.push('Luscious dessert sweetness');
            }
          }
        }

        if (flavorPrefs.length > 0) {
          flavorPrefs.forEach((fl) => {
            if (fl.includes('berry') || fl.includes('fruit')) {
              if (wine.flavors.includes('BERRY') || wine.flavors.includes('FRUITY')) {
                score += 10;
                reasons.push('Dark berry and fresh fruit aromas');
              }
            }
            if (fl.includes('citrus') || fl.includes('tropical')) {
              if (wine.flavors.includes('CITRUS') || wine.flavors.includes('TROPICAL')) {
                score += 10;
                reasons.push('Vibrant citrus & tropical fruit notes');
              }
            }
            if (fl.includes('oak') || fl.includes('vanilla') || fl.includes('spice')) {
              if (wine.flavors.includes('OAK') || wine.flavors.includes('VANILLA') || wine.flavors.includes('SPICY')) {
                score += 10;
                reasons.push('Warm oak, vanilla and spice complexity');
              }
            }
            if (fl.includes('floral') || fl.includes('herb')) {
              if (wine.flavors.includes('FLORAL') || wine.flavors.includes('HERBAL')) {
                score += 10;
                reasons.push('Delicate floral and herbal bouquet');
              }
            }
            if (fl.includes('earth') || fl.includes('mineral')) {
              if (wine.flavors.includes('EARTHY')) {
                score += 10;
                reasons.push('Nuanced mineral and terroir depth');
              }
            }
          });
        }
      } else if (exp === 'EXPERIENCED') {
        if (grapesPref.length > 0 && !grapesPref.includes('no_preference') && !grapesPref.includes('all')) {
          let grapeMatched = false;
          const wineGrape = (wine.grapeVariety || '').toLowerCase();
          for (const g of grapesPref) {
            if (
              (g.includes('cabernet') && (wineGrape.includes('cabernet') || wineGrape.includes('shiraz') || wineGrape.includes('syrah'))) ||
              (g.includes('shiraz') && (wineGrape.includes('shiraz') || wineGrape.includes('syrah'))) ||
              (g.includes('pinot') && (wineGrape.includes('pinot') || wineGrape.includes('noir'))) ||
              (g.includes('zinfandel') && wineGrape.includes('zinfandel')) ||
              (g.includes('sauvignon') && wineGrape.includes('sauvignon')) ||
              (g.includes('chenin') && wineGrape.includes('chenin')) ||
              (g.includes('chardonnay') && wineGrape.includes('chardonnay')) ||
              (g.includes('viognier') && wineGrape.includes('viognier')) ||
              (g.includes('sangiovese') && wineGrape.includes('sangiovese')) ||
              (g.includes('merlot') && wineGrape.includes('merlot'))
            ) {
              grapeMatched = true;
              break;
            }
          }
          if (grapeMatched) {
            score += 20;
            reasons.push(`Showcases ${wine.grapeVariety || 'varietal'} varietal character`);
          }
        }

        if (bodyStylePref && bodyStylePref !== 'no_preference') {
          if (bodyStylePref.includes('light') && wine.body === 'LIGHT') {
            score += 15;
            reasons.push('Light-bodied precision');
          } else if (bodyStylePref.includes('medium') && wine.body === 'MEDIUM') {
            score += 15;
            reasons.push('Balanced medium-bodied structure');
          } else if ((bodyStylePref.includes('full') || bodyStylePref.includes('bold')) && wine.body === 'FULL') {
            score += 15;
            reasons.push('Full-bodied depth and concentration');
          }
        }

        if (tanninPref && tanninPref !== 'no_preference') {
          if (tanninPref.includes('high') && wine.tannin === 'HIGH') {
            score += 15;
            reasons.push('Structured, age-worthy tannins');
          } else if (tanninPref.includes('medium') && wine.tannin === 'MEDIUM') {
            score += 15;
            reasons.push('Supple, balanced tannin integration');
          } else if (tanninPref.includes('low') && wine.tannin === 'LOW') {
            score += 15;
            reasons.push('Silky, low-tannin elegance');
          }
        }

        if (acidityPref && acidityPref !== 'no_preference') {
          if (acidityPref.includes('high') && wine.acidity === 'HIGH') {
            score += 15;
            reasons.push('Vibrant, high-toned acidity');
          } else if (acidityPref.includes('medium') && wine.acidity === 'MEDIUM') {
            score += 15;
            reasons.push('Harmonious, well-integrated acidity');
          } else if (acidityPref.includes('low') && wine.acidity === 'LOW') {
            score += 15;
            reasons.push('Soft, rounded acidity profile');
          }
        }

        if (sweetnessPref && sweetnessPref !== 'no_preference') {
          if (sweetnessPref.includes('dry') && !sweetnessPref.includes('semi') && wine.sweetness === 'DRY') {
            score += 15;
            reasons.push('Bone-dry precision with crisp finish');
          } else if ((sweetnessPref.includes('semi') || sweetnessPref.includes('off')) && wine.sweetness === 'SEMI_DRY') {
            score += 15;
            reasons.push('Refined off-dry balance');
          } else if (sweetnessPref.includes('sweet') && wine.sweetness === 'SWEET') {
            score += 15;
            reasons.push('Complex late-harvest sweetness');
          }
        }

        if (regionPrefs.length > 0 && !regionPrefs.includes('no_preference')) {
          const wineryCity = (wine.wineryCity || '').toLowerCase();
          const wineryState = (wine.wineryState || '').toLowerCase();
          const wineryName = (wine.wineryName || '').toLowerCase();
          let regionMatched = false;
          for (const reg of regionPrefs) {
            if (reg.includes('nashik') && (wineryCity.includes('nashik') || wineryCity.includes('dindori') || wineryName.includes('sula') || wineryName.includes('york') || wineryName.includes('chandon') || wineryName.includes('vallonnee'))) {
              regionMatched = true;
              break;
            }
            if (reg.includes('nandi') && (wineryState.includes('karnataka') || wineryCity.includes('nandi') || wineryCity.includes('bangalore') || wineryName.includes('grover'))) {
              regionMatched = true;
              break;
            }
            if ((reg.includes('akluj') || reg.includes('baramati')) && (wineryCity.includes('akluj') || wineryCity.includes('baramati') || wineryCity.includes('solapur') || wineryName.includes('fratelli'))) {
              regionMatched = true;
              break;
            }
          }
          if (regionMatched) {
            score += 14;
            reasons.push(`Authentic ${wine.wineryCity || wine.wineryName} terroir expression`);
          }
        }

        if (wine.price >= 1500 || wine.name.toLowerCase().includes('reserve')) {
          score += 18;
          reasons.push('Cellar-worthy reserve with deep structure');
        }
      }

      if (taste) {
        if (taste.includes('fruity')) {
          if (wine.flavors.includes('FRUITY') || wine.flavors.includes('BERRY') || wine.flavors.includes('CITRUS')) {
            score += 15;
            reasons.push('Bursting with fresh fruit and berry notes');
          }
        }
        if (taste.includes('rich') || taste.includes('smooth')) {
          if (wine.body === 'FULL' || wine.flavors.includes('VANILLA') || wine.flavors.includes('OAK')) {
            score += 15;
            reasons.push('Velvety texture with warm oak and vanilla notes');
          }
        }
        if (taste.includes('light') || taste.includes('refreshing')) {
          if (wine.body === 'LIGHT' || wine.wineType === 'SPARKLING' || wine.wineType === 'WHITE') {
            score += 15;
            reasons.push('Crisp, vibrant, and thirst-quenching profile');
          }
        }
        if (taste.includes('sweet')) {
          if (wine.sweetness === 'SWEET' || wine.sweetness === 'SEMI_DRY') {
            score += 18;
            reasons.push('Gentle sweetness that softens and delights');
          }
        }
      }

      if (targetTypes.length > 0 && !targetTypes.includes('ANYTHING')) {
        if (targetTypes.includes(wine.wineType)) {
          score += 18;
          reasons.push(`Matches your preference for ${wine.wineType.toLowerCase()} wines`);
        } else {
          score -= 15;
        }
      }

      if (occasion) {
        if (occasion.includes('food') || occasion.includes('pairing')) {
          if (wine.foodPairings.length > 0 || wine.occasions.includes('CASUAL_DINING')) {
            score += 10;
            reasons.push('Excellent food pairing versatility');
          }
        }
        if (occasion.includes('celebration')) {
          if (wine.wineType === 'SPARKLING' || wine.occasions.includes('CELEBRATION')) {
            score += 16;
            reasons.push('Perfect celebratory bottle with fine effervescence');
          }
        }
        if (occasion.includes('date') || occasion.includes('romantic')) {
          if (wine.occasions.includes('ROMANTIC_DINNER')) {
            score += 12;
            reasons.push('Ideal romantic evening choice');
          }
        }
        if (occasion.includes('gift')) {
          if (wine.price >= 1200 || wine.occasions.includes('GIFTING')) {
            score += 12;
            reasons.push('Distinguished estate presentation for gifting');
          }
        }
      }

      if (budget) {
        if (budget.includes('500') && !budget.includes('1000')) {
          if (wine.price <= 750) score += 15;
          else score -= 15;
        } else if (budget.includes('500') && budget.includes('1000')) {
          if (wine.price >= 500 && wine.price <= 1000) score += 15;
        } else if (budget.includes('1000') && (budget.includes('1800') || budget.includes('2000'))) {
          if (wine.price >= 950 && wine.price <= 1850) score += 15;
        } else if (budget.includes('1800') || budget.includes('2000') || budget.includes('3500')) {
          if (wine.price >= 1600) score += 15;
        }
      }

      if (userInteractions.purchased.has(wine.id)) {
        score += 30;
        reasons.push('Previously ordered & enjoyed by you');
      } else if (userInteractions.wishlisted.has(wine.id)) {
        score += 22;
        reasons.push('Saved in your wishlist favorites');
      } else if (userInteractions.liked.has(wine.id)) {
        score += 18;
        reasons.push('Liked in your tasting profile');
      } else if (userInteractions.viewed.has(wine.id)) {
        score += 4;
      }

      if (userInteractions.disliked.has(wine.id)) {
        score -= 40;
      }

      if (hasSufficientBehavioralEvidence && !userInteractions.disliked.has(wine.id)) {
        if (wine.grapeVariety) {
          const g = wine.grapeVariety.toLowerCase();
          if ((grapeWeights[g] || 0) >= 2.0 && (!grapesPref || grapesPref.length === 0)) {
            score += 12;
            reasons.push(`Showcases ${wine.grapeVariety}, matching styles you've enjoyed`);
          }
        }

        let matchedFlavorCount = 0;
        (wine.flavors || []).forEach((fl) => {
          if ((flavorWeights[fl] || 0) >= 2.0) {
            matchedFlavorCount++;
          }
        });
        if (matchedFlavorCount > 0 && flavorPrefs.length === 0) {
          score += Math.min(12, matchedFlavorCount * 6);
          reasons.push('Features flavor profile aligned with your recent favorites');
        }

        if (wine.wineType && (typeWeights[wine.wineType] || 0) <= -4.0) {
          score -= 18;
        }
      }

      const finalScore = Math.min(99, Math.max(60, score));
      const matchReason =
        reasons.length > 0
          ? reasons.slice(0, 2).join(' • ')
          : 'Curated selection matching your exploration profile';

      let highlightBadge: string | undefined;
      if (finalScore >= 94) highlightBadge = 'Top Match';
      else if (wine.isBeginnerFriendly && exp === 'BEGINNER') highlightBadge = 'Beginner Friendly';
      else if (wine.price >= 1800) highlightBadge = 'Reserve Selection';

      return {
        wine,
        matchScore: finalScore,
        matchReason,
        highlightBadge,
      };
    });

    scoredResults.sort((a, b) => b.matchScore - a.matchScore);
    return scoredResults.slice(0, req.limit || 8);
  }

  /**
   * Recommendation method that loads user preferences and combines with overrides.
   */
  public async recommendWines(
    userId?: string,
    options: {
      limit?: number;
      occasion?: string;
      budget?: string;
      forceExperienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';
      tasteAppealing?: string;
      wineTypes?: string[];
      sweetness?: string;
      bodyStyle?: string;
      acidity?: string;
      tannin?: string;
      grapes?: string[];
      regions?: string[];
      flavors?: string[];
    } = {}
  ): Promise<RecommendationResult[]> {
    let experienceLevel = options.forceExperienceLevel;
    let wineTypes = options.wineTypes;
    let sweetness = options.sweetness;
    let bodyStyle = options.bodyStyle;
    let acidity = options.acidity;
    let tannin = options.tannin;
    let grapes = options.grapes;
    let regions = options.regions;
    let flavors = options.flavors;
    let occasion = options.occasion;
    let budget = options.budget;

    if (userId) {
      try {
        let profile = cacheService.getPreferences(userId);
        if (!profile) {
          profile = await userService.getPreferences(userId);
          if (profile) cacheService.setPreferences(userId, profile, 30);
        }
        if (profile) {
          if (!experienceLevel) experienceLevel = profile.experienceLevel;
          if (!wineTypes || wineTypes.length === 0) wineTypes = profile.preferredWineTypes;
          if (!sweetness && profile.preferredSweetness && profile.preferredSweetness !== 'ALL') {
            sweetness = profile.preferredSweetness;
          }
          if (!bodyStyle && profile.preferredBody && profile.preferredBody !== 'ALL') {
            bodyStyle = profile.preferredBody;
          }
          if (!acidity && profile.preferredAcidity && profile.preferredAcidity !== 'ALL') {
            acidity = profile.preferredAcidity;
          }
          if (!tannin && profile.preferredTannin && profile.preferredTannin !== 'ALL') {
            tannin = profile.preferredTannin;
          }
          if ((!grapes || grapes.length === 0) && (profile.preferredGrapes?.length ?? 0) > 0) {
            grapes = profile.preferredGrapes;
          }
          if ((!regions || regions.length === 0) && (profile.preferredRegions?.length ?? 0) > 0) {
            regions = profile.preferredRegions;
          }
          if ((!flavors || flavors.length === 0) && (profile.preferredFlavors?.length ?? 0) > 0) {
            flavors = profile.preferredFlavors;
          }
          if (!occasion && (profile.preferredOccasions?.length ?? 0) > 0) {
            occasion = profile.preferredOccasions[0];
          }
          if (!budget && (profile.budgetMin !== null || profile.budgetMax !== null)) {
            if (profile.budgetMin !== null && profile.budgetMax !== null) {
              budget = `${profile.budgetMin}_${profile.budgetMax}`;
            } else if (profile.budgetMin !== null) {
              budget = `above_${profile.budgetMin}`;
            } else if (profile.budgetMax !== null) {
              budget = `under_${profile.budgetMax}`;
            }
          }
        }
      } catch (err) {
        // Fallback to defaults
      }
    }

    return await this.getPersonalizedRecommendations({
      userId,
      experienceLevel,
      tasteAppealing: options.tasteAppealing,
      wineTypes,
      sweetness,
      bodyStyle,
      acidity,
      tannin,
      grapes,
      regions,
      flavors,
      occasion,
      budget,
      limit: options.limit || 8,
    });
  }

  /**
   * Returns similar wines based on varietal, sweetness, body, and acidity.
   */
  public async getSimilarWines(wineId: string, limit = 4): Promise<NormalizedWine[]> {
    const allWines = await this.getAllNormalizedWines();
    const target = allWines.find((w) => w.id === wineId);
    if (!target) return allWines.slice(0, limit);

    const candidates = allWines.filter((w) => w.id !== wineId && w.isAvailable);

    const scored = candidates.map((cand) => {
      let simScore = 0;
      if (cand.wineType === target.wineType) simScore += 30;
      if (cand.grapeVariety && target.grapeVariety && cand.grapeVariety.toLowerCase().includes(target.grapeVariety.toLowerCase())) {
        simScore += 25;
      }
      if (cand.sweetness === target.sweetness) simScore += 15;
      if (cand.body === target.body) simScore += 15;
      if (cand.acidity === target.acidity) simScore += 10;

      const commonFlavors = cand.flavors.filter((f) => target.flavors.includes(f));
      simScore += commonFlavors.length * 5;

      return { candidate: cand, simScore };
    });

    scored.sort((a, b) => b.simScore - a.simScore);
    return scored.slice(0, limit).map((s) => s.candidate);
  }
}

export const recommendationService = new RecommendationService();
