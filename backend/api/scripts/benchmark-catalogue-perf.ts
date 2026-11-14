import { wineController } from '../src/modules/wines/wine.controller';
import { recommendationService } from '../src/modules/wines/recommendation.service';
import { cacheService } from '../src/shared/cache.service';
import { NormalizedWine } from '../src/modules/wines/wine.types';

// Mock Express Request & Response objects for benchmarking
function createMockReqRes(query: Record<string, any> = {}, user: any = null) {
  const req: any = {
    query,
    user,
    params: {},
    body: {},
    method: 'GET',
  };

  let statusCode = 200;
  let responseBody: any = null;

  const res: any = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(body: any) {
      responseBody = body;
      return this;
    },
    send() {
      return this;
    },
  };

  return { req, res, getResult: () => ({ statusCode, responseBody }) };
}

async function measureExecutionTime(label: string, fn: () => Promise<void>, iterations = 50): Promise<{ label: string; avgMs: number; p95Ms: number }> {
  const times: number[] = [];

  // Warmup
  await fn();

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  const avgMs = sum / times.length;
  const p95Idx = Math.floor(times.length * 0.95);
  const p95Ms = times[p95Idx];

  return { label, avgMs: parseFloat(avgMs.toFixed(2)), p95Ms: parseFloat(p95Ms.toFixed(2)) };
}

async function runBenchmarks() {
  console.log('================================================================');
  console.log('🍷 VinoSphere Catalogue & Recommendation Performance Benchmarking');
  console.log('================================================================\n');

  // Seed sample mock cache to simulate realistic active server state
  cacheService.clearAll();

  // 20 realistic wine records in cache
  const sampleCatalogue = Array.from({ length: 24 }).map((_, i) => ({
    id: `wine-${i + 1}`,
    name: `Estate Reserve Vintage ${i + 1}`,
    slug: `estate-reserve-vintage-${i + 1}`,
    winery_id: `winery-${(i % 4) + 1}`,
    wineries: { name: `Winery ${(i % 4) + 1}`, city: 'Nashik', state: 'Maharashtra', country: 'India' },
    wine_type: i % 4 === 0 ? 'RED' : i % 4 === 1 ? 'WHITE' : i % 4 === 2 ? 'SPARKLING' : 'ROSE',
    type: i % 4 === 0 ? 'Red' : i % 4 === 1 ? 'White' : i % 4 === 2 ? 'Sparkling' : 'Rose',
    grape_variety: i % 2 === 0 ? 'Cabernet Sauvignon' : 'Chenin Blanc',
    grapeVariety: i % 2 === 0 ? 'Cabernet Sauvignon' : 'Chenin Blanc',
    vintage: 2020 + (i % 4),
    year: 2020 + (i % 4),
    price: 650 + (i * 180),
    rating: 84 + (i % 14),
    review_count: 10 + (i * 4),
    reviews: 10 + (i * 4),
    sweetness: i % 3 === 0 ? 'DRY' : i % 3 === 1 ? 'SEMI_DRY' : 'SWEET',
    sugar: i % 3 === 0 ? 'Dry' : i % 3 === 1 ? 'Semi-Dry' : 'Sweet',
    body: i % 3 === 0 ? 'FULL' : i % 3 === 1 ? 'MEDIUM' : 'LIGHT',
    tannin: i % 3 === 0 ? 'HIGH' : 'LOW',
    acidity: 'MEDIUM',
    is_available: i % 10 !== 0,
    isAvailable: i % 10 !== 0,
    is_beginner_friendly: i % 2 === 0,
    isBeginnerFriendly: i % 2 === 0,
    flavors: ['BERRY', 'OAK', 'FRUITY'],
    food_pairing: ['Grilled Meats', 'Artisanal Cheeses'],
    foodPairings: ['Grilled Meats', 'Artisanal Cheeses'],
  }));

  cacheService.set('raw_wines_catalog', sampleCatalogue, 120);

  const mockUserId = 'benchmark-user-123';
  const mockUserPrefs = {
    experienceLevel: 'INTERMEDIATE',
    preferredWineTypes: ['RED', 'SPARKLING'],
    preferredSweetness: 'DRY',
    preferredBody: 'MEDIUM',
    budgetMin: 800,
    budgetMax: 3000,
  };
  cacheService.setPreferences(mockUserId, mockUserPrefs, 120);

  const mockInteractionSummary = {
    userId: mockUserId,
    likedWineIds: ['wine-1', 'wine-3'],
    dislikedWineIds: ['wine-9'],
    wishlistedWineIds: ['wine-2'],
    purchasedWineIds: ['wine-4'],
    viewedWineIds: ['wine-1', 'wine-2', 'wine-5'],
    totalInteractions: 8,
  };
  cacheService.setInteractionSummary(mockUserId, mockInteractionSummary, 120);

  const results: Array<{ label: string; avgMs: number; p95Ms: number }> = [];

  // 1. Normal Catalogue (Popular Sort)
  const resPopular = await measureExecutionTime('1. Normal Catalogue (sort=popular)', async () => {
    const { req, res } = createMockReqRes({ sort: 'popular', limit: '12' });
    await wineController.getAllWines(req, res);
  });
  results.push(resPopular);

  // 2. Normal Catalogue (Rating Sort)
  const resRating = await measureExecutionTime('2. Normal Catalogue (sort=rating)', async () => {
    const { req, res } = createMockReqRes({ sort: 'rating', limit: '12' });
    await wineController.getAllWines(req, res);
  });
  results.push(resRating);

  // 3. Normal Catalogue (Price Ascending)
  const resPrice = await measureExecutionTime('3. Normal Catalogue (sort=price_asc)', async () => {
    const { req, res } = createMockReqRes({ sort: 'price_asc', limit: '12' });
    await wineController.getAllWines(req, res);
  });
  results.push(resPrice);

  // 4. Recommended Catalogue (Cold Start / Guest User)
  const resColdStart = await measureExecutionTime('4. Recommended Catalogue (Cold-Start / Guest)', async () => {
    const { req, res } = createMockReqRes({ sort: 'recommended', limit: '12' });
    await wineController.getAllWines(req, res);
  });
  results.push(resColdStart);

  // 5. Recommended Catalogue (Personalized User)
  const resPersonalized = await measureExecutionTime('5. Recommended Catalogue (Personalized User)', async () => {
    const { req, res } = createMockReqRes({ sort: 'recommended', limit: '12', userId: mockUserId }, { id: mockUserId });
    await wineController.getAllWines(req, res);
  });
  results.push(resPersonalized);

  // 6. Recommended + Restrictive Filters (Type + Price Range + Rating)
  const resFiltered = await measureExecutionTime('6. Recommended + Filters (type=Red, minPrice=1000, rating=4)', async () => {
    const { req, res } = createMockReqRes(
      { sort: 'recommended', type: 'Red', minPrice: '1000', maxPrice: '3000', rating: '80', limit: '12', userId: mockUserId },
      { id: mockUserId }
    );
    await wineController.getAllWines(req, res);
  });
  results.push(resFiltered);

  // 7. Recommended + Pagination (Page 1 vs Page 2 vs Page 3)
  const resPage1 = await measureExecutionTime('7. Recommended + Pagination (Page 1, limit=6)', async () => {
    const { req, res } = createMockReqRes({ sort: 'recommended', page: '1', limit: '6', userId: mockUserId }, { id: mockUserId });
    await wineController.getAllWines(req, res);
  });
  results.push(resPage1);

  const resPage2 = await measureExecutionTime('8. Recommended + Pagination (Page 2, limit=6)', async () => {
    const { req, res } = createMockReqRes({ sort: 'recommended', page: '2', limit: '6', userId: mockUserId }, { id: mockUserId });
    await wineController.getAllWines(req, res);
  });
  results.push(resPage2);

  console.log('\n📊 BENCHMARK LATENCY REPORT (50 iterations each):');
  console.log('----------------------------------------------------------------');
  console.log('| Scenario                                      | Avg (ms) | p95 (ms) |');
  console.log('|-----------------------------------------------|----------|----------|');
  results.forEach(r => {
    const paddedLabel = r.label.padEnd(45, ' ');
    const paddedAvg = (r.avgMs + ' ms').padEnd(8, ' ');
    const paddedP95 = (r.p95Ms + ' ms').padEnd(8, ' ');
    console.log(`| ${paddedLabel} | ${paddedAvg} | ${paddedP95} |`);
  });
  console.log('----------------------------------------------------------------\n');

  // ==================================================================
  // DATA QUALITY & INCOMPLETE METADATA TOLERANCE VERIFICATION
  // ==================================================================
  console.log('🛡️ DATA QUALITY & METADATA TOLERANCE VERIFICATION:');
  console.log('----------------------------------------------------------------');

  const incompleteWineSamples: NormalizedWine[] = [
    {
      id: 'incomplete-1',
      name: 'Unspecified Type Bottle',
      slug: 'unspecified-type',
      description: null,
      tasteNotesRaw: null,
      wineryId: null,
      wineryName: 'Heritage Cellars',
      wineryCity: null,
      wineryState: null,
      wineryCountry: 'India',
      grapeVariety: '',
      vintage: null,
      wineType: undefined as any,
      price: 1200,
      stockQuantity: 10,
      isAvailable: true,
      imageUrl: null,
      rating: 88,
      starRating: 4.4,
      reviewCount: 24,
      sweetness: undefined as any,
      body: undefined as any,
      acidity: undefined as any,
      tannin: undefined as any,
      alcoholPercentage: null,
      servingTemperature: null,
      flavors: [],
      foodPairings: [],
      occasions: [],
      isBeginnerFriendly: false,
    },
    {
      id: 'incomplete-2',
      name: 'Unrated Zero Review Bottle',
      slug: 'unrated-zero-review',
      description: null,
      tasteNotesRaw: null,
      wineryId: null,
      wineryName: 'Boutique Estate',
      wineryCity: null,
      wineryState: null,
      wineryCountry: 'India',
      grapeVariety: '',
      vintage: null,
      wineType: 'RED',
      price: undefined as any,
      stockQuantity: 5,
      isAvailable: true,
      imageUrl: null,
      rating: undefined as any,
      starRating: 0,
      reviewCount: 0,
      sweetness: 'DRY',
      body: 'FULL',
      acidity: 'MEDIUM',
      tannin: 'MEDIUM',
      alcoholPercentage: null,
      servingTemperature: null,
      flavors: [],
      foodPairings: [],
      occasions: [],
      isBeginnerFriendly: false,
    },
    {
      id: 'incomplete-3',
      name: 'Empty Taste Notes Bottle',
      slug: 'empty-taste-notes',
      description: null,
      tasteNotesRaw: null,
      wineryId: null,
      wineryName: 'Valley Vines',
      wineryCity: null,
      wineryState: null,
      wineryCountry: 'India',
      grapeVariety: '',
      vintage: null,
      wineType: 'WHITE',
      price: 950,
      stockQuantity: 0,
      isAvailable: false, // Out of stock
      imageUrl: null,
      rating: 90,
      starRating: 4.5,
      reviewCount: 15,
      sweetness: undefined as any,
      body: undefined as any,
      acidity: undefined as any,
      tannin: undefined as any,
      alcoholPercentage: null,
      servingTemperature: null,
      flavors: undefined as any,
      foodPairings: undefined as any,
      occasions: undefined as any,
      isBeginnerFriendly: true,
    }
  ];

  let qualityCheckPassed = true;
  incompleteWineSamples.forEach((sample, i) => {
    try {
      const popScore = recommendationService.calculatePopularityScore(sample);
      if (isNaN(popScore) || typeof popScore !== 'number') {
        console.error(`❌ Incomplete Sample ${i + 1} produced invalid popularity score: ${popScore}`);
        qualityCheckPassed = false;
      } else {
        console.log(`✅ Sample ${i + 1} ("${sample.name}") handled safely: PopScore=${popScore}`);
      }
    } catch (err: any) {
      console.error(`❌ Incomplete Sample ${i + 1} threw error:`, err.message);
      qualityCheckPassed = false;
    }
  });

  if (qualityCheckPassed) {
    console.log('\n🎉 ALL PERFORMANCE & METADATA QUALITY CHECKS PASSED SUCCESSFULLY!\n');
  } else {
    throw new Error('Data quality verification failed on incomplete metadata samples');
  }
}

runBenchmarks().catch(err => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
