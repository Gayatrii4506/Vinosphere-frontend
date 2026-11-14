import { NormalizedWine } from '../wines/wine.types';

export interface RecommendationRequest {
  userId?: string;
  experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERIENCED';
  beginnerPath?: 'popular' | 'discover' | 'explore';
  tasteAppealing?: string;
  wineTypes?: string[];
  sweetness?: string;
  bodyStyle?: string;
  acidity?: string;
  tannin?: string;
  grapes?: string[];
  regions?: string[];
  flavors?: string[];
  occasion?: string;
  budget?: string;
  interest?: string;
  limit?: number;
}

export interface RecommendationResult {
  wine: NormalizedWine;
  matchScore: number; // 0-100
  matchReason: string;
  highlightBadge?: string;
}

export interface MLRecommendationResult {
  wine: any;
  cosineSimilarity: number;
  matchPercentage: number;
  finalScore: number;
  recommendation: {
    label: string | null;
    reasons: string[];
    matchConfidence: string;
  };
}

export interface UserInteractionData {
  purchased: Set<string>;
  wishlisted: Set<string>;
  liked: Set<string>;
  disliked: Set<string>;
  viewed: Set<string>;
}
