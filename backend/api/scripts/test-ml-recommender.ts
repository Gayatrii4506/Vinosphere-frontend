import { wineToVector, userPreferencesToVector, cosineSimilarity, normalizeVector, mlRecommenderService } from '../src/modules/recommendations';

console.log('================================================================');
console.log('🤖 VINOSPHERE VECTOR ML RECOMMENDER BENCHMARK & UNIT SUITE');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string, detail?: string) {
  if (condition) {
    console.log(`✅ [ML Test] ${name}${detail ? ` -> ${detail}` : ''}`);
    passed++;
  } else {
    console.log(`❌ [ML Test] ${name}${detail ? ` -> ${detail}` : ''}`);
    failed++;
  }
}

// Mock dataset
const wines = [
  {
    id: 'w-cabernet',
    name: 'Sula Rasa Cabernet Sauvignon',
    wine_type: 'RED',
    grape_variety: 'Cabernet Sauvignon',
    sweetness: 'DRY',
    body: 'FULL',
    flavors: ['blackberry', 'oak', 'vanilla'],
    price: 2400,
    rating: 94,
    reviews: 85
  },
  {
    id: 'w-chenin',
    name: 'York Chenin Blanc Reserve',
    wine_type: 'WHITE',
    grape_variety: 'Chenin Blanc',
    sweetness: 'SEMI_DRY',
    body: 'LIGHT',
    flavors: ['citrus', 'tropical', 'honey'],
    price: 950,
    rating: 89,
    reviews: 45,
    is_beginner_friendly: true
  },
  {
    id: 'w-shiraz',
    name: 'Fratelli Sette Reserve Blend',
    wine_type: 'RED',
    grape_variety: 'Sangiovese Blend',
    sweetness: 'DRY',
    body: 'FULL',
    flavors: ['dark berry', 'smoke', 'chocolate', 'oak'],
    price: 3500,
    rating: 96,
    reviews: 110
  }
];

// Test 1: Feature Vectorization & L2 Normalization
const cabVec = wineToVector(wines[0]);
const l2Norm = Math.sqrt(cabVec.reduce((sum, v) => sum + v * v, 0));
assert(cabVec.length === 32, '1.1 Vector Dimensionality', `Length = ${cabVec.length}D`);
assert(Math.abs(l2Norm - 1.0) < 0.001, '1.2 L2 Unit Vector Normalization', `||V|| = ${l2Norm.toFixed(4)}`);

// Test 2: Cosine Similarity Properties
const cheninVec = wineToVector(wines[1]);
const selfSim = cosineSimilarity(cabVec, cabVec);
const crossSim = cosineSimilarity(cabVec, cheninVec);
assert(Math.abs(selfSim - 1.0) < 0.0001, '2.1 Self Cosine Similarity', `Sim(A, A) = ${selfSim.toFixed(4)}`);
assert(crossSim < 0.60 && crossSim >= 0.0, '2.2 Orthogonal Style Divergence', `Sim(Red, White) = ${crossSim.toFixed(4)}`);

// Test 3: User Preference Vector Generation
const redLoverPrefs = {
  preferredWineTypes: ['RED'],
  preferredSweetness: 'DRY',
  preferredBody: 'FULL',
  preferredGrapes: ['cabernet'],
  preferredFlavors: ['oak', 'blackberry'],
  budgetMin: 1500,
  budgetMax: 3000
};
const userVec = userPreferencesToVector(redLoverPrefs);
const cabMatch = cosineSimilarity(userVec, cabVec);
const cheninMatch = cosineSimilarity(userVec, cheninVec);
assert(cabMatch > 0.75, '3.1 High Semantic Palate Match', `Cabernet Cosine Sim = ${cabMatch.toFixed(4)}`);
assert(cabMatch > cheninMatch, '3.2 Proper Taste Discrimination', `Cabernet (${cabMatch.toFixed(2)}) > Chenin (${cheninMatch.toFixed(2)})`);

// Test 4: Dynamic Palate Shift via Interactions
const emptyInteractions = {
  purchased: new Set<string>(),
  wishlisted: new Set<string>(),
  liked: new Set<string>(),
  disliked: new Set<string>(),
  viewed: new Set<string>()
};

const initialRankings = mlRecommenderService.rankWines(wines, redLoverPrefs, emptyInteractions);
assert(initialRankings[0].wine.id === 'w-cabernet', '4.1 Base Explicit Ranking Top Match', `${initialRankings[0].wine.name} (${initialRankings[0].matchPercentage}%)`);

// Now user purchases Chenin Blanc multiple times
const shiftedInteractions = {
  purchased: new Set<string>(['w-chenin']),
  wishlisted: new Set<string>(['w-chenin']),
  liked: new Set<string>(),
  disliked: new Set<string>(['w-cabernet']), // user disliked Cabernet
  viewed: new Set<string>()
};

const shiftedRankings = mlRecommenderService.rankWines(wines, redLoverPrefs, shiftedInteractions);
assert(shiftedRankings[0].wine.id === 'w-chenin', '4.2 Dynamic Vector Shift Post-Interaction', `Top pick shifted to ${shiftedRankings[0].wine.name}`);
assert(shiftedRankings[shiftedRankings.length - 1].wine.id === 'w-cabernet', '4.3 Negative Repulsion Demotion', `Disliked Cabernet pushed to bottom`);

// Test 5: Latency Benchmark
const start = performance.now();
for (let i = 0; i < 500; i++) {
  mlRecommenderService.rankWines(wines, redLoverPrefs, shiftedInteractions);
}
const elapsed = performance.now() - start;
const perCallMs = elapsed / 500;
assert(perCallMs < 0.5, '5.1 In-Engine Inference Latency Benchmark', `${perCallMs.toFixed(3)} ms per request (500 iterations)`);

console.log('\n================================================================');
console.log(`📋 BENCHMARK SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log('================================================================\n');

if (failed > 0) process.exit(1);
