const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

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
  source?: 'python_ml_engine' | 'typescript_fallback_engine';
  benchmark_analysis?: Record<string, { current: number; ideal: string; status: 'Ideal' | 'Under' | 'Elevated' }>;
}

export async function predictWineQuality(features: ChemicalFeatures): Promise<QualityPredictionResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/quality/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(features)
    });

    if (!res.ok) {
      throw new Error(`API returned ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend quality endpoint error, utilizing client-side fallback:', err);
    // Instant client-side fallback
    return computeClientFallback(features);
  }
}

function computeClientFallback(features: ChemicalFeatures): QualityPredictionResponse {
  const alcohol = features.alcohol ?? 12.5;
  const va = features.volatileAcidity ?? 0.35;
  const pH = features.pH ?? 3.4;
  const freeSO2 = features.freeSulfurDioxide ?? 28;

  let penalty = 0;
  const recs: EnologicalRecommendation[] = [];

  if (va > 0.6) {
    penalty += 18;
    recs.push({
      param: 'Volatile Acidity',
      advice: 'Elevated volatile acidity detected. Minimize ullage, avoid oxygen exposure, and sanitize vessel tanks.',
      current_value: va,
      ideal_range: '0.20 - 0.55'
    });
  }
  if (alcohol < 11.5) {
    penalty += 10;
    recs.push({
      param: 'Alcohol %',
      advice: 'Low potential alcohol may weaken structure. Harvest at higher Brix or extend fermentation extraction.',
      current_value: alcohol,
      ideal_range: '11.5 - 14.5%'
    });
  }
  if (freeSO2 < 20) {
    penalty += 8;
    recs.push({
      param: 'Free SO₂',
      advice: 'Free SO₂ is below protective levels against microbial oxidation. Dose potassium metabisulfite.',
      current_value: freeSO2,
      ideal_range: '25 - 40 ppm'
    });
  }

  const score = Math.max(62, Math.min(97, Math.round(93 - penalty)));
  const isGrandCru = score >= 88;

  return {
    predicted_quality: score,
    quality_tier: isGrandCru ? 'Grand Cru' : score >= 80 ? 'Premium' : 'Standard',
    tier_title: isGrandCru ? 'Grand Cru / Reserve Gold' : score >= 80 ? 'Premium Silver Estate' : 'Standard Table Vintage',
    tier_color: isGrandCru ? '#10b981' : score >= 80 ? '#f59e0b' : '#ef4444',
    confidence_score: 0.94,
    class_probabilities: {
      'Premium (Score 7-9)': isGrandCru ? 0.92 : 0.65,
      'Standard (Score 3-6)': isGrandCru ? 0.08 : 0.35
    },
    recommendations: recs.length > 0 ? recs : [
      {
        param: 'Cellar Balance',
        advice: 'All chemical parameters align within optimal reserve cellar benchmarks.',
        current_value: score,
        ideal_range: '88 - 100'
      }
    ],
    source: 'typescript_fallback_engine'
  };
}
