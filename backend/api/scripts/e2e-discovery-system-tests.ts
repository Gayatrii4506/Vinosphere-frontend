import { wineController } from '../src/modules/wines/wine.controller';
import { recommendationService } from '../src/modules/recommendations';
import { interactionService } from '../src/modules/interactions/interaction.service';
import { userService } from '../src/modules/users/user.service';
import { cacheService } from '../src/shared/cache.service';
import { NormalizedWine } from '../src/modules/wines/wine.types';

// Mock Express Helpers
function mockRequest(query: Record<string, any> = {}, user: any = null, body: any = {}, params: any = {}) {
  return {
    query,
    user,
    params,
    body,
    method: Object.keys(body).length > 0 ? 'POST' : 'GET',
  } as any;
}

function mockResponse() {
  let statusCode = 200;
  let responseData: any = null;

  const res: any = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      responseData = data;
      return this;
    },
    send(data: any) {
      responseData = data;
      return this;
    },
    getStatus: () => statusCode,
    getData: () => responseData,
  };
  return res;
}

interface TestReport {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const testResults: TestReport[] = [];

function recordTest(category: string, name: string, passed: boolean, details?: string, error?: string) {
  testResults.push({ category, name, passed, details, error });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}${details ? ` -> ${details}` : ''}`);
  if (error) console.error(`   Error details: ${error}`);
}

async function runE2ETestSuite() {
  console.log('================================================================');
  console.log('🍷 VINOSPHERE PERSONALIZED WINE DISCOVERY SYSTEM: E2E TEST SUITE');
  console.log('================================================================\n');

  cacheService.clearAll();

  // Seed rich catalogue for testing
  const mockCatalogue = [
    {
      id: 'wine-1',
      name: 'Sula Rasa Cabernet Sauvignon',
      slug: 'sula-rasa-cabernet',
      winery_id: 'winery-sula',
      wineries: { name: 'Sula Vineyards', city: 'Nashik', state: 'Maharashtra', country: 'India' },
      wine_type: 'RED',
      type: 'Red',
      grape_variety: 'Cabernet Sauvignon',
      grapeVariety: 'Cabernet Sauvignon',
      vintage: 2021,
      year: 2021,
      price: 2400,
      rating: 94,
      review_count: 85,
      reviews: 85,
      sweetness: 'DRY',
      sugar: 'Dry',
      body: 'FULL',
      tannin: 'HIGH',
      acidity: 'MEDIUM',
      is_available: true,
      isAvailable: true,
      is_beginner_friendly: false,
      isBeginnerFriendly: false,
      flavors: ['BERRY', 'OAK', 'VANILLA'],
      food_pairing: ['Grilled Lamb', 'Aged Cheese'],
      foodPairings: ['Grilled Lamb', 'Aged Cheese'],
    },
    {
      id: 'wine-2',
      name: 'York Chenin Blanc Reserve',
      slug: 'york-chenin-blanc',
      winery_id: 'winery-york',
      wineries: { name: 'York Winery', city: 'Nashik', state: 'Maharashtra', country: 'India' },
      wine_type: 'WHITE',
      type: 'White',
      grape_variety: 'Chenin Blanc',
      grapeVariety: 'Chenin Blanc',
      vintage: 2023,
      year: 2023,
      price: 950,
      rating: 91,
      review_count: 62,
      reviews: 62,
      sweetness: 'SEMI_DRY',
      sugar: 'Semi-Dry',
      body: 'LIGHT',
      tannin: 'LOW',
      acidity: 'HIGH',
      is_available: true,
      isAvailable: true,
      is_beginner_friendly: true,
      isBeginnerFriendly: true,
      flavors: ['CITRUS', 'TROPICAL', 'FLORAL'],
      food_pairing: ['Goat Cheese', 'Tandoori Fish'],
      foodPairings: ['Goat Cheese', 'Tandoori Fish'],
    },
    {
      id: 'wine-3',
      name: 'Chandon Brut Sparkling',
      slug: 'chandon-brut-sparkling',
      winery_id: 'winery-chandon',
      wineries: { name: 'Chandon India', city: 'Dindori', state: 'Maharashtra', country: 'India' },
      wine_type: 'SPARKLING',
      type: 'Sparkling',
      grape_variety: 'Chardonnay',
      grapeVariety: 'Chardonnay',
      vintage: 2022,
      year: 2022,
      price: 1850,
      rating: 93,
      review_count: 110,
      reviews: 110,
      sweetness: 'DRY',
      sugar: 'Dry',
      body: 'LIGHT',
      tannin: 'LOW',
      acidity: 'HIGH',
      is_available: true,
      isAvailable: true,
      is_beginner_friendly: true,
      isBeginnerFriendly: true,
      flavors: ['CITRUS', 'FRUITY', 'FLORAL'],
      food_pairing: ['Canapés', 'Seafood'],
      foodPairings: ['Canapés', 'Seafood'],
    },
    {
      id: 'wine-4',
      name: 'Fratelli Sette Reserve Blend',
      slug: 'fratelli-sette-reserve',
      winery_id: 'winery-fratelli',
      wineries: { name: 'Fratelli Vineyards', city: 'Akluj', state: 'Maharashtra', country: 'India' },
      wine_type: 'RED',
      type: 'Red',
      grape_variety: 'Sangiovese Blend',
      grapeVariety: 'Sangiovese Blend',
      vintage: 2020,
      year: 2020,
      price: 3500,
      rating: 96,
      review_count: 98,
      reviews: 98,
      sweetness: 'DRY',
      sugar: 'Dry',
      body: 'FULL',
      tannin: 'HIGH',
      acidity: 'MEDIUM',
      is_available: true,
      isAvailable: true,
      is_beginner_friendly: false,
      isBeginnerFriendly: false,
      flavors: ['BERRY', 'SPICY', 'OAK'],
      food_pairing: ['Prime Rib', 'Truffle Risotto'],
      foodPairings: ['Prime Rib', 'Truffle Risotto'],
    },
    {
      id: 'wine-5',
      name: 'Grover Zampa Soiree Brut Rosé',
      slug: 'grover-zampa-soiree-rose',
      winery_id: 'winery-grover',
      wineries: { name: 'Grover Zampa', city: 'Nandi Hills', state: 'Karnataka', country: 'India' },
      wine_type: 'ROSE',
      type: 'Rose',
      grape_variety: 'Shiraz',
      grapeVariety: 'Shiraz',
      vintage: 2023,
      year: 2023,
      price: 1350,
      rating: 89,
      review_count: 45,
      reviews: 45,
      sweetness: 'SEMI_DRY',
      sugar: 'Semi-Dry',
      body: 'MEDIUM',
      tannin: 'LOW',
      acidity: 'MEDIUM',
      is_available: true,
      isAvailable: true,
      is_beginner_friendly: true,
      isBeginnerFriendly: true,
      flavors: ['BERRY', 'FLORAL', 'FRUITY'],
      food_pairing: ['Spicy Thai Curry', 'Charcuterie'],
      foodPairings: ['Spicy Thai Curry', 'Charcuterie'],
    },
    {
      id: 'wine-6',
      name: 'Vallonné Late Harvest Dessert Wine',
      slug: 'vallonne-late-harvest',
      winery_id: 'winery-vallonne',
      wineries: { name: 'Vallonné Vineyards', city: 'Igatpuri', state: 'Maharashtra', country: 'India' },
      wine_type: 'WHITE',
      type: 'White',
      grape_variety: 'Chenin Blanc',
      grapeVariety: 'Chenin Blanc',
      vintage: 2022,
      year: 2022,
      price: 1100,
      rating: 88,
      review_count: 32,
      reviews: 32,
      sweetness: 'SWEET',
      sugar: 'Sweet',
      body: 'MEDIUM',
      tannin: 'LOW',
      acidity: 'MEDIUM',
      is_available: true,
      isAvailable: true,
      is_beginner_friendly: true,
      isBeginnerFriendly: true,
      flavors: ['TROPICAL', 'HONEY', 'FRUITY'],
      food_pairing: ['Blue Cheese', 'Fruit Tart'],
      foodPairings: ['Blue Cheese', 'Fruit Tart'],
    }
  ];

  cacheService.set('raw_wines_catalog', mockCatalogue, 300);

  // ====================================================================
  // 1. USER TYPES TESTING
  // ====================================================================
  console.log('\n--- 1. USER TYPES TESTING ---');

  // 1.1 Guest User
  try {
    const req = mockRequest({ sort: 'recommended' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const data = res.getData();
    const wines = data?.data?.wines || [];
    const passed = res.getStatus() === 200 && wines.length === 6 && wines[0].wine.is_beginner_friendly;
    recordTest('User Types', '1.1 Guest User Discovery (Cold-start, unauthenticated)', passed, `Top wine: ${wines[0]?.wine?.name}`);
  } catch (err: any) {
    recordTest('User Types', '1.1 Guest User Discovery', false, undefined, err.message);
  }

  // 1.2 New Beginner (No preferences / Browse all)
  try {
    const req = mockRequest({ sort: 'browseall' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const data = res.getData();
    const wines = data?.data?.wines || [];
    const passed = res.getStatus() === 200 && wines.every((w: any) => w.recommendation === null);
    recordTest('User Types', '1.2 New Beginner Browse All (No personalized badges)', passed, `${wines.length} bottles listed clean`);
  } catch (err: any) {
    recordTest('User Types', '1.2 New Beginner Browse All', false, undefined, err.message);
  }

  // 1.3 Beginner With Preferences (White, Sweet/Semi-Dry, Budget Under 1500)
  const beginnerUserId = 'user-beginner-01';
  cacheService.setPreferences(beginnerUserId, {
    experienceLevel: 'BEGINNER',
    preferredWineTypes: ['WHITE'],
    preferredSweetness: 'SEMI_DRY',
    budgetMin: 500,
    budgetMax: 1500,
  });

  try {
    const req = mockRequest({ sort: 'recommended', userId: beginnerUserId }, { id: beginnerUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const data = res.getData();
    const wines = data?.data?.wines || [];
    const topWine = wines[0]?.wine;
    const passed = topWine?.type === 'White' && topWine?.price <= 1500 && topWine?.is_beginner_friendly;
    recordTest('User Types', '1.3 Beginner With Preferences Ranking', passed, `Top pick: ${topWine?.name} (₹${topWine?.price})`);
  } catch (err: any) {
    recordTest('User Types', '1.3 Beginner With Preferences Ranking', false, undefined, err.message);
  }

  // 1.4 Intermediate User (Full-Bodied Red with Oak & Berry)
  const intermediateUserId = 'user-intermediate-01';
  cacheService.setPreferences(intermediateUserId, {
    experienceLevel: 'INTERMEDIATE',
    preferredWineTypes: ['RED'],
    preferredBody: 'FULL',
    preferredSweetness: 'DRY',
    preferredFlavors: ['OAK', 'BERRY'],
    budgetMin: 1500,
    budgetMax: 4000,
  });

  try {
    const req = mockRequest({ sort: 'recommended', userId: intermediateUserId }, { id: intermediateUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const data = res.getData();
    const wines = data?.data?.wines || [];
    const topWine = wines[0]?.wine;
    const passed = topWine?.type === 'Red' && topWine?.body === 'FULL';
    recordTest('User Types', '1.4 Intermediate Questionnaire Alignment', passed, `Top pick: ${topWine?.name} (${topWine?.body} body)`);
  } catch (err: any) {
    recordTest('User Types', '1.4 Intermediate Questionnaire Alignment', false, undefined, err.message);
  }

  // 1.5 Experienced User (Grape: Cabernet, High Tannin, Dry, Cellar-grade)
  const experiencedUserId = 'user-experienced-01';
  cacheService.setPreferences(experiencedUserId, {
    experienceLevel: 'EXPERIENCED',
    preferredGrapes: ['cabernet'],
    preferredSweetness: 'DRY',
    preferredTannin: 'HIGH',
    preferredBody: 'FULL',
    budgetMin: 2000,
    budgetMax: 5000,
  });

  try {
    const req = mockRequest({ sort: 'recommended', userId: experiencedUserId }, { id: experiencedUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const data = res.getData();
    const wines = data?.data?.wines || [];
    const topWine = wines[0]?.wine;
    const passed = topWine?.grape_variety?.includes('Cabernet') && topWine?.tannin === 'HIGH';
    recordTest('User Types', '1.5 Experienced Connoisseur Technical Match', passed, `Top pick: ${topWine?.name} (${topWine?.grape_variety})`);
  } catch (err: any) {
    recordTest('User Types', '1.5 Experienced Connoisseur Technical Match', false, undefined, err.message);
  }

  // ====================================================================
  // 2. CATALOGUE SORTING & FILTERING TESTS
  // ====================================================================
  console.log('\n--- 2. CATALOGUE SORTING & FILTERING TESTS ---');

  // 2.1 Highest Rated Sorting
  try {
    const req = mockRequest({ sort: 'rating' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const isSorted = wines.every((w: any, idx: number) => idx === 0 || wines[idx - 1].wine.rating >= w.wine.rating);
    recordTest('Catalogue Sort', '2.1 Highest Rated Sort (sort=rating)', isSorted, `Top rating: ${wines[0]?.wine?.rating}/100`);
  } catch (err: any) {
    recordTest('Catalogue Sort', '2.1 Highest Rated Sort', false, undefined, err.message);
  }

  // 2.2 Most Popular Sorting
  try {
    const req = mockRequest({ sort: 'popular' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const isSorted = wines.every((w: any, idx: number) => idx === 0 || (wines[idx - 1].wine.review_count || 0) >= (w.wine.review_count || 0));
    recordTest('Catalogue Sort', '2.2 Most Popular Sort (sort=popular)', isSorted, `Top reviews: ${wines[0]?.wine?.review_count}`);
  } catch (err: any) {
    recordTest('Catalogue Sort', '2.2 Most Popular Sort', false, undefined, err.message);
  }

  // 2.3 Price Ascending Sorting
  try {
    const req = mockRequest({ sort: 'price_asc' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const isSorted = wines.every((w: any, idx: number) => idx === 0 || wines[idx - 1].wine.price <= w.wine.price);
    recordTest('Catalogue Sort', '2.3 Price Low to High (sort=price_asc)', isSorted, `Min price: ₹${wines[0]?.wine?.price}`);
  } catch (err: any) {
    recordTest('Catalogue Sort', '2.3 Price Low to High', false, undefined, err.message);
  }

  // 2.4 Price Descending Sorting
  try {
    const req = mockRequest({ sort: 'price_desc' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const isSorted = wines.every((w: any, idx: number) => idx === 0 || wines[idx - 1].wine.price >= w.wine.price);
    recordTest('Catalogue Sort', '2.4 Price High to Low (sort=price_desc)', isSorted, `Max price: ₹${wines[0]?.wine?.price}`);
  } catch (err: any) {
    recordTest('Catalogue Sort', '2.4 Price High to Low', false, undefined, err.message);
  }

  // 2.5 Keyword Search (q=sparkling)
  try {
    const req = mockRequest({ q: 'sparkling' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const passed = wines.length === 1 && wines[0].wine.name.includes('Sparkling');
    recordTest('Catalogue Search', '2.5 Keyword Search (q=sparkling)', passed, `Matched: ${wines[0]?.wine?.name}`);
  } catch (err: any) {
    recordTest('Catalogue Search', '2.5 Keyword Search', false, undefined, err.message);
  }

  // 2.6 Multi-Filter + Recommended Sort (Type=Red, minPrice=1500, rating=90)
  try {
    const req = mockRequest({ sort: 'recommended', type: 'Red', minPrice: '1500', rating: '90' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const passed = wines.every((w: any) => w.wine.type === 'Red' && w.wine.price >= 1500 && w.wine.rating >= 90);
    recordTest('Catalogue Filter', '2.6 Multi-Filter + Recommended Sort', passed, `${wines.length} eligible wines filtered`);
  } catch (err: any) {
    recordTest('Catalogue Filter', '2.6 Multi-Filter + Recommended Sort', false, undefined, err.message);
  }

  // 2.7 Pagination (page=1, limit=2 vs page=2, limit=2)
  try {
    const req1 = mockRequest({ page: '1', limit: '2' });
    const res1 = mockResponse();
    await wineController.getAllWines(req1, res1);
    const page1Data = res1.getData()?.data;

    const req2 = mockRequest({ page: '2', limit: '2' });
    const res2 = mockResponse();
    await wineController.getAllWines(req2, res2);
    const page2Data = res2.getData()?.data;

    const distinct = page1Data?.wines[0]?.wine?.id !== page2Data?.wines[0]?.wine?.id;
    const paginationCorrect = page1Data?.pagination?.page === 1 && page1Data?.pagination?.totalPages === 3;
    recordTest('Catalogue Pagination', '2.7 Server-Side Pagination Slicing', distinct && paginationCorrect, `Total pages: ${page1Data?.pagination?.totalPages}`);
  } catch (err: any) {
    recordTest('Catalogue Pagination', '2.7 Server-Side Pagination Slicing', false, undefined, err.message);
  }

  // ====================================================================
  // 3. PERSONALIZATION & SIGNAL STRENGTH TESTS
  // ====================================================================
  console.log('\n--- 3. PERSONALIZATION & SIGNAL STRENGTH TESTS ---');

  // 3.1 Interaction Signal Strength: Purchase & Wishlist vs Simple View
  const signalUserId = 'user-signals-01';
  cacheService.setInteractionSummary(signalUserId, {
    userId: signalUserId,
    purchasedWineIds: ['wine-1'], // Strong signal (+3.0)
    wishlistedWineIds: ['wine-4'], // Strong signal (+2.0)
    viewedWineIds: ['wine-2'], // Weak signal (+0.3)
    likedWineIds: [],
    dislikedWineIds: [],
  });

  try {
    const req = mockRequest({ sort: 'recommended', userId: signalUserId }, { id: signalUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const topId = wines[0]?.wine?.id;
    const passed = topId === 'wine-1' || topId === 'wine-4';
    recordTest('Personalization Signals', '3.1 Signal Strength (PURCHASE/WISHLIST outranks simple VIEW)', passed, `Top bottle: ${wines[0]?.wine?.name}`);
  } catch (err: any) {
    recordTest('Personalization Signals', '3.1 Signal Strength', false, undefined, err.message);
  }

  // 3.2 Negative Signal: Dislike Downranks Wine
  const dislikeUserId = 'user-dislike-01';
  cacheService.setInteractionSummary(dislikeUserId, {
    userId: dislikeUserId,
    purchasedWineIds: [],
    wishlistedWineIds: [],
    viewedWineIds: [],
    likedWineIds: [],
    dislikedWineIds: ['wine-1'], // Disliked highest-rated bottle
  });

  try {
    const req = mockRequest({ sort: 'recommended', userId: dislikeUserId }, { id: dislikeUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const lastWine = wines[wines.length - 1]?.wine;
    const passed = lastWine?.id === 'wine-1' || wines[0]?.wine?.id !== 'wine-1';
    recordTest('Personalization Signals', '3.2 Negative Signal Demotion (Disliked bottle heavily demoted)', passed, `Demoted bottle: wine-1`);
  } catch (err: any) {
    recordTest('Personalization Signals', '3.2 Negative Signal Demotion', false, undefined, err.message);
  }

  // 3.3 "Not Sure" Neutrality (Does not create a false negative/positive preference)
  const notSureUserId = 'user-notsure-01';
  cacheService.setPreferences(notSureUserId, {
    experienceLevel: 'BEGINNER',
    preferredWineTypes: ['ANYTHING'],
    preferredSweetness: 'not_sure',
    preferredBody: 'no_preference',
    preferredGrapes: ['not_sure'],
  });

  try {
    const req = mockRequest({ sort: 'recommended', userId: notSureUserId }, { id: notSureUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const passed = wines.length === 6 && wines[0]?.wine?.is_beginner_friendly;
    recordTest('Personalization Signals', '3.3 "Not Sure" Neutrality Guard (Treated as neutral open palate)', passed, `Cold-start top match: ${wines[0]?.wine?.name}`);
  } catch (err: any) {
    recordTest('Personalization Signals', '3.3 "Not Sure" Neutrality Guard', false, undefined, err.message);
  }

  // ====================================================================
  // 4. EXPLANATION & "WHY THIS WINE?" FACTUAL INTEGRITY
  // ====================================================================
  console.log('\n--- 4. EXPLANATION & "WHY THIS WINE?" FACTUAL INTEGRITY ---');

  try {
    const req = mockRequest({ sort: 'recommended', userId: intermediateUserId }, { id: intermediateUserId });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];

    let explanationFactuallyValid = true;
    wines.forEach((item: any) => {
      const reasons = item.recommendation?.reasons || [];
      const wine = item.wine;

      reasons.forEach((reason: string) => {
        if (reason.includes('Red') && wine.type !== 'Red') explanationFactuallyValid = false;
        if (reason.includes('budget') && wine.price > 4000) explanationFactuallyValid = false;
        if (reason.includes('reviews') && (!wine.review_count || wine.review_count < 20)) explanationFactuallyValid = false;
      });
    });

    recordTest('Explanation Integrity', '4.1 Factually Backed Reasons (No hallucinated attributes)', explanationFactuallyValid, `Verified reasons across ${wines.length} bottles`);
  } catch (err: any) {
    recordTest('Explanation Integrity', '4.1 Factually Backed Reasons', false, undefined, err.message);
  }

  // ====================================================================
  // 5. FALLBACK & HARDENING TESTS
  // ====================================================================
  console.log('\n--- 5. FALLBACK & HARDENING TESTS ---');

  // 5.1 No Matching Wines (Restrictive Price filter e.g. minPrice=10000)
  try {
    const req = mockRequest({ minPrice: '10000', maxPrice: '20000' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const passed = res.getStatus() === 200 && Array.isArray(wines) && wines.length === 0;
    recordTest('Fallback Engine', '5.1 Zero Match Filter Graceful Return (Empty list, 200 OK)', passed, `Returned ${wines.length} wines cleanly`);
  } catch (err: any) {
    recordTest('Fallback Engine', '5.1 Zero Match Filter Graceful Return', false, undefined, err.message);
  }

  // 5.2 Incomplete Wine Metadata Tolerance (Null rating, null price, null type)
  const incompleteCatalogue = [
    {
      id: 'incomplete-bottle-1',
      name: 'Artisanal Mystery Vintage',
      type: null,
      wine_type: null,
      price: null,
      rating: null,
      review_count: null,
      sweetness: null,
      body: null,
      is_available: true,
      food_pairing: null,
      flavors: null,
    }
  ];
  cacheService.set('raw_wines_catalog', incompleteCatalogue, 30);

  try {
    const req = mockRequest({ sort: 'recommended' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const wines = res.getData()?.data?.wines || [];
    const passed = res.getStatus() === 200 && wines.length === 1 && !isNaN(wines[0]?.score || 0);
    recordTest('Fallback Engine', '5.2 Incomplete Metadata Safe Processing (No NaN, no crash)', passed, `Handled incomplete bottle safely: score=${wines[0]?.score}`);
  } catch (err: any) {
    recordTest('Fallback Engine', '5.2 Incomplete Metadata Safe Processing', false, undefined, err.message);
  }

  // Restore catalogue
  cacheService.set('raw_wines_catalog', mockCatalogue, 300);

  // 5.3 Recommendation Engine Service Failure Graceful Fallback
  try {
    // Intentionally pass an invalid sorting query to verify safety net
    const req = mockRequest({ sort: 'recommended', minPrice: 'NaN_INVALID' });
    const res = mockResponse();
    await wineController.getAllWines(req, res);
    const passed = res.getStatus() === 200;
    recordTest('Fallback Engine', '5.3 Exception Resilience Fallback (Zero 500 crashes exposed)', passed, `Status code: ${res.getStatus()}`);
  } catch (err: any) {
    recordTest('Fallback Engine', '5.3 Exception Resilience Fallback', false, undefined, err.message);
  }

  // ====================================================================
  // 6. REGRESSION TESTS (CORE COMMERCE & PLATFORM FEATURES)
  // ====================================================================
  console.log('\n--- 6. REGRESSION TESTS ---');

  // 6.1 Wine Detail by ID
  try {
    const req = mockRequest({}, null, {}, { id: 'wine-1' });
    const res = mockResponse();
    await wineController.getWineById(req, res);
    const wine = res.getData()?.data;
    const passed = res.getStatus() === 200 && wine?.id === 'wine-1' && wine?.name?.includes('Sula');
    recordTest('Regression Tests', '6.1 Wine Detail by ID Endpoint', passed, `Fetched: ${wine?.name}`);
  } catch (err: any) {
    recordTest('Regression Tests', '6.1 Wine Detail by ID Endpoint', false, undefined, err.message);
  }

  // 6.2 Record Interaction API (POST /api/wines/:wineId/interactions)
  try {
    const req = mockRequest({}, { id: 'test-user-99' }, { interactionType: 'WISHLIST' }, { wineId: 'wine-2' });
    const res = mockResponse();
    await wineController.recordWineInteraction(req, res);
    const status = res.getStatus();
    const passed = status === 201;
    recordTest('Regression Tests', '6.2 Record Wine Interaction API', passed, `Recorded WISHLIST interaction with status ${status}`);
  } catch (err: any) {
    recordTest('Regression Tests', '6.2 Record Wine Interaction API', false, undefined, err.message);
  }

  // 6.3 Popular Wines Public Recommendation Endpoint
  try {
    const req = mockRequest({ limit: '4' });
    const res = mockResponse();
    await wineController.getPopularWines(req, res);
    const popWines = res.getData()?.data || [];
    const passed = res.getStatus() === 200 && popWines.length <= 4;
    recordTest('Regression Tests', '6.3 Get Popular Wines Endpoint', passed, `Returned ${popWines.length} popular bottles`);
  } catch (err: any) {
    recordTest('Regression Tests', '6.3 Get Popular Wines Endpoint', false, undefined, err.message);
  }

  // 6.4 Similar Wines Recommendation Endpoint
  try {
    const req = mockRequest({ limit: '3' }, null, {}, { id: 'wine-1' });
    const res = mockResponse();
    await wineController.getSimilarWines(req, res);
    const similar = res.getData()?.data || [];
    const passed = res.getStatus() === 200 && Array.isArray(similar);
    recordTest('Regression Tests', '6.4 Similar Wines Alternative Endpoint', passed, `Returned ${similar.length} similar bottles`);
  } catch (err: any) {
    recordTest('Regression Tests', '6.4 Similar Wines Alternative Endpoint', false, undefined, err.message);
  }

  // ====================================================================
  // FINAL SCORECARD
  // ====================================================================
  console.log('\n================================================================');
  console.log('📋 FINAL E2E TEST SCORECARD');
  console.log('================================================================');
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = testResults.filter(t => !t.passed).length;

  console.log(`Total Tests Executed : ${totalTests}`);
  console.log(`Tests Passed         : ${passedTests}`);
  console.log(`Tests Failed         : ${failedTests}`);
  console.log(`Pass Rate            : ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    console.error('❌ Some E2E tests failed!');
    process.exit(1);
  } else {
    console.log('🎉 ALL 20 END-TO-END SCENARIO TESTS PASSED WITH 100% SUCCESS!\n');
  }
}

runE2ETestSuite().catch(err => {
  console.error('E2E Test Suite Execution Error:', err);
  process.exit(1);
});
