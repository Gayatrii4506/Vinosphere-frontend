/**
 * Vector Space Model & Feature Engineering for VinoSphere Wine ML Engine
 * 
 * Maps wines and user taste profiles into a 32-dimensional normalized vector space:
 * - [0..4]   Wine Style Dimensions: Red, White, Rosé, Sparkling, Dessert
 * - [5..8]   Structural Palate Dimensions: Sweetness, Body, Acidity, Tannin
 * - [9..20]  Semantic TF-IDF Tasting Notes: Berry, Oak/Vanilla, Citrus, Tropical, Floral, Herbal, Earthy/Mineral, Spice, Honey/Sweet, Smoke, Crisp/Fresh, Chocolate
 * - [21..28] Grape Varietal Encoding: Cabernet, Shiraz, Pinot Noir, Chenin Blanc, Chardonnay, Sauvignon Blanc, Sangiovese, Other
 * - [29..31] Market & Quality Scalers: Price Index, Beginner Friendliness, Sommelier Rating Baseline
 */

export const FEATURE_DIMENSIONS = [
  // Style (5)
  'style_red',
  'style_white',
  'style_rose',
  'style_sparkling',
  'style_dessert',
  // Palate Structure (4)
  'palate_sweetness',
  'palate_body',
  'palate_acidity',
  'palate_tannin',
  // Tasting Notes (12)
  'note_berry',
  'note_oak_vanilla',
  'note_citrus',
  'note_tropical',
  'note_floral',
  'note_herbal',
  'note_earthy_mineral',
  'note_spice',
  'note_honey_sweet',
  'note_smoke',
  'note_crisp_fresh',
  'note_chocolate',
  // Grape Varietal (8)
  'grape_cabernet',
  'grape_shiraz',
  'grape_pinot_noir',
  'grape_chenin_blanc',
  'grape_chardonnay',
  'grape_sauvignon_blanc',
  'grape_sangiovese',
  'grape_other',
  // Market & Context (3)
  'market_price_tier',
  'trait_beginner_friendly',
  'trait_sommelier_quality',
] as const;

export type FeatureDimension = typeof FEATURE_DIMENSIONS[number];
export const VECTOR_LENGTH = FEATURE_DIMENSIONS.length; // 32

/**
 * Normalizes a vector to unit length (L2 norm).
 */
export function normalizeVector(vec: number[]): number[] {
  let sumSq = 0;
  for (let i = 0; i < vec.length; i++) {
    sumSq += vec[i] * vec[i];
  }
  const mag = Math.sqrt(sumSq);
  if (mag === 0) return new Array(vec.length).fill(0);
  return vec.map(v => v / mag);
}

/**
 * Computes Cosine Similarity between two vectors: (A · B) / (||A|| * ||B||)
 * Guaranteed output in [-1, 1], typically [0, 1] for non-negative feature spaces.
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  if (v1.length !== v2.length || v1.length === 0) return 0;
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    mag1 += v1[i] * v1[i];
    mag2 += v2[i] * v2[i];
  }

  const denominator = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (denominator === 0) return 0;
  const sim = dotProduct / denominator;
  return Math.max(0, Math.min(1, sim)); // Clamped to [0, 1]
}

/**
 * Transforms a Wine object into a 32-dimensional feature vector.
 */
export function wineToVector(wine: any): number[] {
  const vec = new Array(VECTOR_LENGTH).fill(0);

  // 1. Style Dimensions [0..4]
  const wType = (wine.wine_type || wine.type || '').toUpperCase();
  if (wType.includes('RED')) vec[0] = 1.0;
  else if (wType.includes('WHITE')) vec[1] = 1.0;
  else if (wType.includes('ROSE') || wType.includes('ROSÉ')) vec[2] = 1.0;
  else if (wType.includes('SPARKLING')) vec[3] = 1.0;
  else if (wType.includes('DESSERT')) vec[4] = 1.0;

  // 2. Palate Structure [5..8]
  const sweetness = (wine.sweetness || wine.sugar || '').toUpperCase();
  if (sweetness.includes('DRY') && !sweetness.includes('SEMI')) vec[5] = 0.15;
  else if (sweetness.includes('SEMI') || sweetness.includes('OFF')) vec[5] = 0.55;
  else if (sweetness.includes('SWEET')) vec[5] = 0.90;
  else vec[5] = 0.40; // neutral

  const body = (wine.body || '').toUpperCase();
  if (body.includes('LIGHT')) vec[6] = 0.25;
  else if (body.includes('FULL') || body.includes('BOLD') || body.includes('RICH')) vec[6] = 0.85;
  else vec[6] = 0.55; // medium/balanced

  const acidity = (wine.acidity || '').toUpperCase();
  if (acidity.includes('LOW')) vec[7] = 0.25;
  else if (acidity.includes('HIGH') || acidity.includes('CRISP')) vec[7] = 0.80;
  else vec[7] = 0.50; // medium

  const tannin = (wine.tannin || '').toUpperCase();
  if (tannin.includes('LOW')) vec[8] = 0.20;
  else if (tannin.includes('HIGH')) vec[8] = 0.80;
  else vec[8] = 0.50; // medium

  // 3. Tasting Notes TF-IDF [9..20]
  const rawNotes = [
    ...(Array.isArray(wine.flavors) ? wine.flavors : []),
    ...(Array.isArray(wine.tasteNotes) ? wine.tasteNotes : []),
    ...(Array.isArray(wine.taste_notes) ? wine.taste_notes : []),
    ...(typeof wine.description === 'string' ? wine.description.split(/[\s,]+/) : [])
  ].map(n => String(n).toLowerCase());

  const hasNote = (keywords: string[]) => keywords.some(k => rawNotes.some(rn => rn.includes(k)));

  if (hasNote(['berry', 'cherry', 'currant', 'blackberry', 'plum', 'raspberry', 'fruit'])) vec[9] = 0.8;
  if (hasNote(['oak', 'vanilla', 'cedar', 'toast', 'butter', 'barrel'])) vec[10] = 0.8;
  if (hasNote(['citrus', 'lemon', 'lime', 'grapefruit'])) vec[11] = 0.8;
  if (hasNote(['tropical', 'pineapple', 'passion', 'mango', 'melon', 'guava'])) vec[12] = 0.8;
  if (hasNote(['floral', 'flower', 'blossom', 'rose', 'jasmine', 'violet'])) vec[13] = 0.7;
  if (hasNote(['herbal', 'herb', 'grass', 'mint', 'eucalyptus'])) vec[14] = 0.7;
  if (hasNote(['earthy', 'mineral', 'stone', 'flint', 'leather', 'truffle'])) vec[15] = 0.7;
  if (hasNote(['spicy', 'spice', 'pepper', 'cinnamon', 'clove'])) vec[16] = 0.7;
  if (hasNote(['honey', 'nectar', 'caramel', 'apricot'])) vec[17] = 0.8;
  if (hasNote(['smoke', 'tobacco', 'cigar', 'charcoal'])) vec[18] = 0.7;
  if (hasNote(['crisp', 'fresh', 'zippy', 'clean', 'vibrant'])) vec[19] = 0.7;
  if (hasNote(['chocolate', 'cocoa', 'mocha', 'coffee'])) vec[20] = 0.7;

  // 4. Grape Varietal [21..28]
  const grape = (wine.grape_variety || wine.grapeVariety || '').toLowerCase();
  if (grape.includes('cabernet')) vec[21] = 1.0;
  else if (grape.includes('shiraz') || grape.includes('syrah')) vec[22] = 1.0;
  else if (grape.includes('pinot noir')) vec[23] = 1.0;
  else if (grape.includes('chenin')) vec[24] = 1.0;
  else if (grape.includes('chardonnay')) vec[25] = 1.0;
  else if (grape.includes('sauvignon blanc')) vec[26] = 1.0;
  else if (grape.includes('sangiovese')) vec[27] = 1.0;
  else if (grape.length > 0) vec[28] = 0.8;

  // 5. Market & Quality Scalers [29..31]
  const price = wine.price || 1200;
  // Log-normalized price scaled 0..1 (min 300 to max 10,000)
  const normPrice = Math.min(1.0, Math.max(0, (Math.log10(price) - Math.log10(300)) / (Math.log10(8000) - Math.log10(300))));
  vec[29] = normPrice;

  const isBeginner = wine.is_beginner_friendly ?? wine.isBeginnerFriendly ?? (price <= 1500 && (wType.includes('WHITE') || sweetness.includes('SEMI')));
  vec[30] = isBeginner ? 0.9 : 0.2;

  const rating = wine.rating || 85;
  vec[31] = Math.min(1.0, Math.max(0, (rating - 75) / 25)); // 75-100 rating mapped to 0..1

  return normalizeVector(vec);
}

/**
 * Transforms User Explicit Preferences into a base 32-dimensional User Palate Vector.
 */
export function userPreferencesToVector(prefs: any): number[] {
  const vec = new Array(VECTOR_LENGTH).fill(0);
  if (!prefs) return vec;

  // 1. Preferred Wine Types [0..4]
  const types = (prefs.preferredWineTypes || prefs.favorite_types || []).map((t: string) => String(t).toUpperCase());
  const hasAnything = types.length === 0 || types.includes('ALL') || types.includes('ANYTHING') || types.includes('NO_PREFERENCE');

  if (hasAnything) {
    vec[0] = 0.5;
    vec[1] = 0.5;
    vec[2] = 0.4;
    vec[3] = 0.4;
  } else {
    if (types.some((t: string) => t.includes('RED'))) vec[0] = 1.0;
    if (types.some((t: string) => t.includes('WHITE'))) vec[1] = 1.0;
    if (types.some((t: string) => t.includes('ROSE') || t.includes('ROSÉ'))) vec[2] = 1.0;
    if (types.some((t: string) => t.includes('SPARKLING'))) vec[3] = 1.0;
    if (types.some((t: string) => t.includes('DESSERT'))) vec[4] = 1.0;
  }

  // 2. Sweetness [5]
  const sweetness = String(prefs.preferredSweetness || prefs.sweetness || '').toUpperCase();
  if (sweetness.includes('DRY') && !sweetness.includes('SEMI')) vec[5] = 0.15;
  else if (sweetness.includes('SEMI') || sweetness.includes('OFF')) vec[5] = 0.55;
  else if (sweetness.includes('SWEET')) vec[5] = 0.90;
  else vec[5] = 0.45; // neutral

  // 3. Body [6]
  const body = String(prefs.preferredBody || prefs.body_style || '').toUpperCase();
  if (body.includes('LIGHT')) vec[6] = 0.25;
  else if (body.includes('FULL') || body.includes('BOLD') || body.includes('RICH')) vec[6] = 0.85;
  else vec[6] = 0.55;

  // 4. Acidity & Tannin [7..8]
  const acidity = String(prefs.preferredAcidity || prefs.acidity || '').toUpperCase();
  if (acidity.includes('LOW')) vec[7] = 0.25;
  else if (acidity.includes('HIGH')) vec[7] = 0.80;
  else vec[7] = 0.50;

  const tannin = String(prefs.preferredTannin || prefs.tannin || '').toUpperCase();
  if (tannin.includes('LOW')) vec[8] = 0.20;
  else if (tannin.includes('HIGH')) vec[8] = 0.80;
  else vec[8] = 0.50;

  // 5. Palate Taste / Flavors [9..20]
  const tasteAppealing = String(prefs.taste_appealing || prefs.preferredTaste || '').toLowerCase();
  if (tasteAppealing.includes('fruit')) vec[9] = 0.8;
  if (tasteAppealing.includes('rich') || tasteAppealing.includes('smooth')) { vec[10] = 0.8; vec[6] = 0.8; }
  if (tasteAppealing.includes('light') || tasteAppealing.includes('refreshing')) { vec[19] = 0.8; vec[6] = 0.3; }
  if (tasteAppealing.includes('sweet')) vec[17] = 0.8;

  const flavors = (prefs.preferredFlavors || prefs.flavors || []).map((f: string) => String(f).toLowerCase());
  flavors.forEach((f: string) => {
    if (f.includes('berry') || f.includes('fruit')) vec[9] = 0.9;
    if (f.includes('oak') || f.includes('vanilla')) vec[10] = 0.9;
    if (f.includes('citrus')) vec[11] = 0.9;
    if (f.includes('tropical')) vec[12] = 0.9;
    if (f.includes('floral')) vec[13] = 0.8;
    if (f.includes('herb')) vec[14] = 0.8;
    if (f.includes('earth') || f.includes('mineral')) vec[15] = 0.8;
    if (f.includes('spice')) vec[16] = 0.8;
  });

  // 6. Grapes [21..28]
  const grapes = (prefs.preferredGrapes || prefs.grapes || []).map((g: string) => String(g).toLowerCase());
  grapes.forEach((g: string) => {
    if (g.includes('cabernet')) vec[21] = 1.0;
    if (g.includes('shiraz') || g.includes('syrah')) vec[22] = 1.0;
    if (g.includes('pinot noir')) vec[23] = 1.0;
    if (g.includes('chenin')) vec[24] = 1.0;
    if (g.includes('chardonnay')) vec[25] = 1.0;
    if (g.includes('sauvignon blanc')) vec[26] = 1.0;
    if (g.includes('sangiovese')) vec[27] = 1.0;
  });

  // 7. Budget & Experience [29..31]
  const targetBudget = prefs.budgetMax || prefs.budget_max || 2500;
  vec[29] = Math.min(1.0, Math.max(0, (Math.log10(targetBudget) - Math.log10(300)) / (Math.log10(8000) - Math.log10(300))));

  const expLevel = String(prefs.experienceLevel || prefs.experience_level || 'BEGINNER').toUpperCase();
  vec[30] = expLevel.includes('BEGINNER') ? 0.9 : expLevel.includes('INTER') ? 0.5 : 0.1;
  vec[31] = expLevel.includes('EXP') ? 0.9 : 0.5;

  return normalizeVector(vec);
}

/**
 * Human-readable feature attribution generator for explainable recommendations.
 */
export function getFeatureAttributions(userVec: number[], wineVec: number[], wine: any): string[] {
  const explanations: Array<{ score: number; text: string }> = [];

  // Style match
  for (let i = 0; i < 5; i++) {
    if (userVec[i] > 0.3 && wineVec[i] > 0.3) {
      const typeName = i === 0 ? 'Red' : i === 1 ? 'White' : i === 2 ? 'Rosé' : i === 3 ? 'Sparkling' : 'Dessert';
      explanations.push({ score: userVec[i] * wineVec[i] * 1.5, text: `Features your preferred ${typeName} style` });
    }
  }

  // Palate sweetness
  const sweetDiff = Math.abs(userVec[5] - wineVec[5]);
  if (sweetDiff < 0.25 && userVec[5] > 0) {
    const label = userVec[5] < 0.3 ? 'Crisp dry finish' : userVec[5] < 0.7 ? 'Balanced off-dry profile' : 'Luscious sweet palate';
    explanations.push({ score: (1 - sweetDiff) * 1.2, text: label });
  }

  // Palate body
  const bodyDiff = Math.abs(userVec[6] - wineVec[6]);
  if (bodyDiff < 0.25 && userVec[6] > 0) {
    const label = userVec[6] < 0.4 ? 'Light, refreshing body structure' : userVec[6] > 0.7 ? 'Full-bodied depth & richness' : 'Medium-bodied harmonious structure';
    explanations.push({ score: (1 - bodyDiff) * 1.2, text: label });
  }

  // Tasting notes overlaps
  const noteNames: Record<number, string> = {
    9: 'vibrant dark berry notes',
    10: 'toasted oak & warm vanilla nuances',
    11: 'zesty citrus freshness',
    12: 'lush tropical fruit notes',
    13: 'delicate floral aromas',
    14: 'subtle herbal notes',
    15: 'earthy mineral terroir',
    16: 'aromatic spice character',
    17: 'golden honey sweetness',
    18: 'smoky roasted complexity',
    19: 'crisp, refreshing finish',
    20: 'decadent dark chocolate notes'
  };

  for (let i = 9; i <= 20; i++) {
    const contribution = userVec[i] * wineVec[i];
    if (contribution > 0.15 && noteNames[i]) {
      explanations.push({ score: contribution * 1.4, text: `Showcases ${noteNames[i]}` });
    }
  }

  // Grape varietal match
  for (let i = 21; i <= 27; i++) {
    const contribution = userVec[i] * wineVec[i];
    if (contribution > 0.3) {
      explanations.push({ score: contribution * 1.8, text: `Showcases authentic ${wine.grape_variety || wine.grapeVariety || 'estate varietal'}` });
    }
  }

  // Quality & popularity fallback
  if (explanations.length === 0) {
    const reviews = wine.review_count ?? wine.reviews ?? 0;
    if (reviews >= 20) explanations.push({ score: 0.5, text: `Popular community choice with ${reviews} verified reviews` });
    else if (wine.is_beginner_friendly || wine.isBeginnerFriendly) explanations.push({ score: 0.5, text: 'Smooth, approachable fruit-forward profile' });
    else explanations.push({ score: 0.4, text: `Sommelier rated ${(wine.rating || 85) <= 10 ? wine.rating : ((wine.rating || 85) / 10).toFixed(1)}/10` });
  }

  // Sort by highest contributing score and take top 3
  return explanations
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(e => e.text);
}
