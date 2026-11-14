export interface ChemicalFeatures {
  fixedAcidity?: number;
  volatileAcidity?: number;
  citricAcid?: number;
  residualSugar?: number;
  chlorides?: number;
  freeSulfurDioxide?: number;
  totalSulfurDioxide?: number;
  density?: number;
  pH?: number;
  sulphates?: number;
  alcohol?: number;
  wineType?: 'Red' | 'White' | 'Rosé';
  [key: string]: any;
}

export interface EnologicalRecommendation {
  param: string;
  advice: string;
  current_value: number;
  ideal_range: string;
}

export interface QualityPredictionResponse {
  predicted_quality: number;
  quality_tier: string;
  tier_title: string;
  tier_color: string;
  confidence_score: number;
  class_probabilities: Record<string, number>;
  recommendations: EnologicalRecommendation[];
  source: 'python_ml_engine' | 'typescript_fallback_engine';
  benchmark_analysis?: Record<string, { current: number; ideal: string; status: 'Ideal' | 'Under' | 'Elevated' }>;
}
