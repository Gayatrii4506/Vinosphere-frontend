import {
  wineToVector,
  userPreferencesToVector,
  cosineSimilarity,
  normalizeVector,
  getFeatureAttributions,
  VECTOR_LENGTH
} from './vectorizer';
import { cacheService } from '../../shared/cache.service';
import { MLRecommendationResult, UserInteractionData } from './recommendation.types';

export class MLRecommenderService {
  /**
   * Generates or retrieves cached feature vector for a wine.
   */
  getWineVector(wine: any): number[] {
    const wineId = wine.id;
    const cacheKey = `wine_vec:${wineId}`;
    const cached = cacheService.get<number[]>(cacheKey);
    if (cached && cached.length === VECTOR_LENGTH) return cached;

    const vec = wineToVector(wine);
    cacheService.set(cacheKey, vec, 300);
    return vec;
  }

  /**
   * Constructs the dynamic Multi-Dimensional User Palate Vector.
   * Combines explicit quiz priors with real-time weighted interaction shifts.
   */
  buildUserPalateVector(
    userPrefs: any,
    interactions: UserInteractionData,
    candidateWinesMap: Map<string, any>
  ): { userVector: number[]; hasSufficientData: boolean } {
    let baseVec = userPreferencesToVector(userPrefs);
    const hasExplicit = userPrefs && (
      (userPrefs.preferredWineTypes && userPrefs.preferredWineTypes.length > 0) ||
      (userPrefs.favorite_types && userPrefs.favorite_types.length > 0) ||
      userPrefs.preferredSweetness ||
      userPrefs.preferredBody ||
      (userPrefs.preferredGrapes && userPrefs.preferredGrapes.length > 0) ||
      (userPrefs.preferredFlavors && userPrefs.preferredFlavors.length > 0)
    );

    const accumulatedVector = [...baseVec];
    let totalInteractionWeight = 0;

    // Helper to add weighted wine vector to user palate
    const addInteractionVector = (wineId: string, weight: number) => {
      const wine = candidateWinesMap.get(wineId);
      if (!wine) return;
      const wineVec = this.getWineVector(wine);
      for (let i = 0; i < VECTOR_LENGTH; i++) {
        accumulatedVector[i] += wineVec[i] * weight;
      }
      totalInteractionWeight += Math.abs(weight);
    };

    // 1. Purchases (Strong positive signal: +3.0)
    interactions.purchased.forEach(id => addInteractionVector(id, 3.0));

    // 2. Wishlist (Strong intent signal: +2.0)
    interactions.wishlisted.forEach(id => addInteractionVector(id, 2.0));

    // 3. Likes (Direct positive taste feedback: +1.8)
    interactions.liked.forEach(id => addInteractionVector(id, 1.8));

    // 4. Views (Mild interest: +0.3)
    interactions.viewed.forEach(id => addInteractionVector(id, 0.3));

    // 5. Dislikes (Negative repulsion vector: -4.0)
    interactions.disliked.forEach(id => addInteractionVector(id, -4.0));

    const hasSufficientData = !!hasExplicit || totalInteractionWeight >= 1.8;
    const finalNormalizedVector = normalizeVector(accumulatedVector);

    return {
      userVector: finalNormalizedVector,
      hasSufficientData
    };
  }

  /**
   * Ranks candidate wines using Cosine Similarity Vector Space Model.
   */
  rankWines(
    candidates: any[],
    userPrefs: any,
    interactions: UserInteractionData
  ): MLRecommendationResult[] {
    if (!candidates || candidates.length === 0) return [];

    // Map candidates by ID for fast lookup
    const winesMap = new Map<string, any>();
    candidates.forEach(w => winesMap.set(String(w.id), w));

    // Build the user's dynamic taste vector
    const { userVector, hasSufficientData } = this.buildUserPalateVector(
      userPrefs,
      interactions,
      winesMap
    );

    const budgetMin = userPrefs?.budgetMin ?? userPrefs?.budget_min ?? 0;
    const budgetMax = userPrefs?.budgetMax ?? userPrefs?.budget_max ?? Infinity;
    const isBeginner = String(userPrefs?.experienceLevel || userPrefs?.experience_level || '').toUpperCase() === 'BEGINNER';

    const scored: MLRecommendationResult[] = candidates.map(wine => {
      const wineIdStr = String(wine.id);
      const wineVec = this.getWineVector(wine);

      // 1. Vector Cosine Similarity
      const cosSim = cosineSimilarity(userVector, wineVec);

      // 2. Bayesian Popularity Baseline (neutral prior R=88, m=15)
      const reviews = wine.review_count ?? wine.reviews ?? 0;
      const rating = (wine.rating || 85) <= 10 ? (wine.rating || 8.5) * 10 : (wine.rating || 85);
      const bayesianPop = (reviews * rating + 15 * 88) / (reviews + 15); // 75..100 scale

      // 3. Budget Fit Factor
      const price = wine.price || 1200;
      let budgetScore = 10;
      if (budgetMax !== Infinity && budgetMax > 0) {
        if (price >= budgetMin && price <= budgetMax) budgetScore = 20;
        else if (price < budgetMin) budgetScore = 14;
        else budgetScore = Math.max(0, 20 - ((price - budgetMax) / budgetMax) * 15);
      } else if (isBeginner && price <= 1500) {
        budgetScore = 18;
      }

      // 4. Behavioral Boost / Penalty
      let interactionBonus = 0;
      if (interactions.disliked.has(wineIdStr)) interactionBonus = -50;
      else if (interactions.purchased.has(wineIdStr)) interactionBonus = 25;
      else if (interactions.wishlisted.has(wineIdStr)) interactionBonus = 18;
      else if (interactions.liked.has(wineIdStr)) interactionBonus = 15;

      // 5. Final Composite Score
      // If user has sufficient preference data, Cosine Similarity carries 55% weight
      let finalScore = 0;
      if (hasSufficientData) {
        finalScore = (cosSim * 55) + (bayesianPop * 0.30) + budgetScore + interactionBonus;
      } else {
        // Cold-Start: Rely more on Bayesian Quality and Beginner Friendliness
        const beginnerBonus = (wine.is_beginner_friendly || wine.isBeginnerFriendly) ? 8 : 0;
        finalScore = (bayesianPop * 0.70) + (cosSim * 20) + budgetScore + beginnerBonus + interactionBonus;
      }

      // Scaled Match Percentage (e.g. 94%)
      const matchPct = Math.round(Math.max(50, Math.min(99, (cosSim * 50) + (bayesianPop * 0.40) + (budgetScore * 0.5))));

      // 6. Explainable Sommelier Attributions
      const reasons = getFeatureAttributions(userVector, wineVec, wine);

      // 7. Recommendation Label & Confidence Tier
      let label: string | null = null;
      if (interactions.disliked.has(wineIdStr)) {
        label = 'DISLIKED';
      } else if (interactions.purchased.has(wineIdStr) || interactions.wishlisted.has(wineIdStr) || interactions.liked.has(wineIdStr)) {
        label = 'MATCHES_YOUR_TASTE';
      } else if (hasSufficientData && cosSim >= 0.72 && finalScore >= 75) {
        label = 'MATCHES_YOUR_TASTE';
      } else if (hasSufficientData && cosSim >= 0.55) {
        label = 'PARTIAL_MATCH';
      } else if (reviews >= 25 || rating >= 92) {
        label = 'POPULAR_CHOICE';
      } else if (wine.is_beginner_friendly || wine.isBeginnerFriendly) {
        label = 'BEGINNER_FRIENDLY';
      } else {
        label = null;
      }

      let matchConfidence = 'High Confidence';
      if (matchPct < 70) matchConfidence = 'Fair Match';
      else if (matchPct < 85) matchConfidence = 'Strong Match';
      else matchConfidence = 'Top Match';

      return {
        wine,
        cosineSimilarity: parseFloat(cosSim.toFixed(4)),
        matchPercentage: matchPct,
        finalScore: parseFloat(finalScore.toFixed(2)),
        recommendation: {
          label,
          reasons,
          matchConfidence
        }
      };
    });

    // Sort by final ML score descending
    return scored.sort((a, b) => b.finalScore - a.finalScore);
  }
}

export const mlRecommenderService = new MLRecommenderService();
