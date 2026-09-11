// lib/food-pairing/recommendationApi.ts
// ---------------------------------------------------------------------------
// Resilient Sommelier & Recommendation API Service Layer for VinoSphere
// Works seamlessly both online (with FastAPI / ML microservice) and offline
// (with built-in Sommelier-grade pairing engine and curated Indian cuisine catalog).
// ---------------------------------------------------------------------------

import { wines as staticWines } from '@/constants/food-pairing/wines'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export interface FoodCategoryItem {
  food_name: string
  cuisine?: string
  category?: string
  vegetarian?: string
  spice_level?: string
  image_url?: string | null
}

export interface WineRecommendation {
  wine_name: string
  winery?: string
  wine_type?: string
  variety?: string
  region?: string
  body?: string
  sweetness?: string
  acidity?: string
  tannin?: string
  score: number
  price?: number
  rating?: number
  serving_temp?: string
  image_url?: string | null
  _foodName?: string
}

export interface FoodRecommendation {
  food_name: string
  cuisine?: string
  category?: string
  vegetarian?: string
  spice_level?: string
  score: number
  image_url?: string | null
  _wineName?: string
}

// ---------------------------------------------------------------------------
// Curated Fallback Catalogs
// ---------------------------------------------------------------------------
export const FALLBACK_CATEGORIES: string[] = [
  'Chicken',
  'Biryani',
  'Curry',
  'Paneer',
  'Seafood',
  'Lamb & Mutton',
  'Tandoori',
  'Vegetarian',
  'Pasta & Continental',
  'Dessert',
]

export const FALLBACK_FOODS_BY_CATEGORY: Record<string, FoodCategoryItem[]> = {
  Chicken: [
    { food_name: 'Butter Chicken', cuisine: 'Mughlai', category: 'Chicken', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken Tikka Masala', cuisine: 'North Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chettinad Chicken', cuisine: 'South Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Herb Roast Chicken', cuisine: 'Continental', category: 'Chicken', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chicken Korma', cuisine: 'Awadhi', category: 'Chicken', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Spicy Buffalo Wings', cuisine: 'American', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  Biryani: [
    { food_name: 'Hyderabadi Dum Mutton Biryani', cuisine: 'Hyderabadi', category: 'Biryani', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Awadhi Chicken Biryani', cuisine: 'Lucknowi', category: 'Biryani', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Royal Vegetable Dum Biryani', cuisine: 'Mughlai', category: 'Biryani', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Malabar Prawn Biryani', cuisine: 'Kerala Coastal', category: 'Biryani', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kolkatta Mutton Biryani', cuisine: 'Bengali', category: 'Biryani', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
  Curry: [
    { food_name: 'Dal Makhani', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Mutton Rogan Josh', cuisine: 'Kashmiri', category: 'Curry', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Goan Fish Curry', cuisine: 'Goan Coastal', category: 'Curry', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Thai Green Curry', cuisine: 'Pan-Asian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Palak Paneer', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
  ],
  Paneer: [
    { food_name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Kadai Paneer', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Palak Paneer', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Shahi Paneer', cuisine: 'Mughlai', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tawa Paneer Masala', cuisine: 'Punjabi', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  Seafood: [
    { food_name: 'Goan Prawn Curry', cuisine: 'Goan Coastal', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tawa Fried Pomfret', cuisine: 'Maharashtrian', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Grilled Salmon with Lemon Butter', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Fresh Oysters with Mignonette', cuisine: 'French', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Garlic Butter Prawns', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Crispy Fish & Chips', cuisine: 'British', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
  'Lamb & Mutton': [
    { food_name: 'Mutton Rogan Josh', cuisine: 'Kashmiri', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Roasted Lamb Chops with Rosemary', cuisine: 'Continental', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Lucknowi Galouti Kebab', cuisine: 'Awadhi', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Rajasthani Laal Maas', cuisine: 'Rajasthani', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Very Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Seekh Kebab', cuisine: 'Mughlai', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
  ],
  Tandoori: [
    { food_name: 'Tandoori Chicken', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Murgh Malai Tikka', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Prawns', cuisine: 'Coastal Indian', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Seekh Kebab', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Tandoori Soya Chaap', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
  ],
  Vegetarian: [
    { food_name: 'Dal Tadka with Cumin Basmati', cuisine: 'North Indian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Wild Mushroom Risotto with Truffle', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Caprese Salad with Buffalo Mozzarella', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Baingan Bharta', cuisine: 'North Indian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Medium', image_url: '/images/dish_isolated.png' },
    { food_name: 'Eggplant Parmesan', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Chana Masala', cuisine: 'Punjabi', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
  ],
  'Pasta & Continental': [
    { food_name: 'Spaghetti Carbonara', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: "Penne all'Arrabbiata", cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Spicy', image_url: '/images/dish_isolated.png' },
    { food_name: 'Pasta al Pesto Genovese', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Classic Cheeseburger', cuisine: 'American', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Grilled Ribeye Steak', cuisine: 'Continental', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
  Dessert: [
    { food_name: 'Dark Chocolate Fondant Cake', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Shahi Tukda with Rabdi', cuisine: 'Awadhi', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Classic Crème Brûlée', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Gulab Jamun with Roasted Pistachio', cuisine: 'North Indian', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
    { food_name: 'Fresh Berry Fruit Tart', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', image_url: '/images/dish_isolated.png' },
  ],
}

// Fast safe fetch with timeout to avoid browser hang or unhandled exceptions
async function safeFetchJson(url: string, options?: RequestInit, timeoutMs = 1500): Promise<any | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timer)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// GET /food-categories
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<string[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/food-categories`)
  if (data && Array.isArray(data.categories) && data.categories.length > 0) {
    return data.categories
  }
  return FALLBACK_CATEGORIES
}

// ---------------------------------------------------------------------------
// GET /foods?category=...
// ---------------------------------------------------------------------------
export async function getFoods(category: string): Promise<FoodCategoryItem[]> {
  const params = new URLSearchParams({ category })
  const data = await safeFetchJson(`${API_BASE_URL}/foods?${params}`)
  if (data && Array.isArray(data.foods) && data.foods.length > 0) {
    return data.foods
  }

  // Fallback match by category key
  if (FALLBACK_FOODS_BY_CATEGORY[category]) {
    return FALLBACK_FOODS_BY_CATEGORY[category]
  }

  // Fuzzy match category
  const lowerCat = (category || '').toLowerCase()
  for (const [key, items] of Object.entries(FALLBACK_FOODS_BY_CATEGORY)) {
    if (lowerCat.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerCat)) {
      return items
    }
  }

  // Default slice across popular dishes
  return [
    ...FALLBACK_FOODS_BY_CATEGORY.Chicken.slice(0, 2),
    ...FALLBACK_FOODS_BY_CATEGORY.Biryani.slice(0, 2),
    ...FALLBACK_FOODS_BY_CATEGORY.Paneer.slice(0, 2),
  ]
}

// ---------------------------------------------------------------------------
// GET /wine-types
// ---------------------------------------------------------------------------
export async function getWineTypes(): Promise<string[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/wine-types`)
  if (data && Array.isArray(data.wine_types) && data.wine_types.length > 0) {
    return data.wine_types
  }
  return ['Red', 'White', 'Rosé', 'Sparkling', 'Dessert']
}

// ---------------------------------------------------------------------------
// GET /wines?wine_type=...
// ---------------------------------------------------------------------------
export async function getWinesByType(wineType?: string): Promise<any[]> {
  const url = wineType
    ? `${API_BASE_URL}/wines?${new URLSearchParams({ wine_type: wineType })}`
    : `${API_BASE_URL}/wines`
  const data = await safeFetchJson(url)
  if (data && Array.isArray(data.wines) && data.wines.length > 0) {
    return data.wines
  }

  if (wineType) {
    const target = wineType.toLowerCase()
    return staticWines.filter((w) => w.type.toLowerCase() === target)
  }
  return staticWines
}

// ---------------------------------------------------------------------------
// POST /recommend (Food → Wine)
// ---------------------------------------------------------------------------
export async function fetchFoodRecommendations(foodName: string): Promise<WineRecommendation[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ food_name: foodName }),
  })

  if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    return data.recommendations
  }

  // Sommelier pairing engine fallback based on culinary affinities
  return computeFallbackWineRecommendations(foodName)
}

function computeFallbackWineRecommendations(foodName: string): WineRecommendation[] {
  const query = (foodName || '').toLowerCase()

  // Score static wines based on pairing rules
  const scored = staticWines.map((wine, index) => {
    let score = 0.82
    const wineType = wine.type.toLowerCase()
    const body = (wine.body || '').toLowerCase()
    const acidity = (wine.acidity || '').toLowerCase()
    const tannin = (wine.tannin || '').toLowerCase()
    const sweetness = (wine.sweetness || '').toLowerCase()
    const notes = (wine.flavorNotes || []).join(' ').toLowerCase()

    // 1. Red meats, lamb, mutton, steaks, kebabs -> Full-bodied, high-tannin reds
    if (query.match(/lamb|mutton|rogan|steak|ribeye|beef|kebab|seekh|laal maas/i)) {
      if (wineType === 'red' && (body === 'full' || tannin === 'high')) score += 0.14
      else if (wineType === 'red') score += 0.08
      else if (wineType === 'dessert' || wineType === 'fortified') score -= 0.15
    }
    // 2. Rich buttery gravies (Butter Chicken, Korma, Paneer Butter Masala, Alfredo)
    else if (query.match(/butter|makhani|korma|creamy|cream|alfredo|carbonara/i)) {
      if (wineType === 'white' && (body === 'full' || acidity === 'high')) score += 0.14 // Viognier, rich Chenin
      else if (wineType === 'red' && body === 'medium') score += 0.11 // Sangiovese, soft Shiraz
      else if (wineType === 'sparkling') score += 0.12 // cuts through fat
      else if (wineType === 'dessert') score -= 0.10
    }
    // 3. Seafood, fish, prawns, oysters, pomfret, sushi
    else if (query.match(/fish|prawn|seafood|salmon|oyster|pomfret|crab|lobster|sushi/i)) {
      if (wineType === 'white' && acidity === 'high') score += 0.15 // Sauvignon Blanc, crisp Chenin
      else if (wineType === 'sparkling') score += 0.14 // Brut, Champagne style
      else if (wineType === 'rosé') score += 0.10
      else if (wineType === 'red') score -= 0.15 // Tannins clash with fish oils
    }
    // 4. Spicy dishes (Chettinad, Laal Maas, Thai Curry, Buffalo Wings, Vindaloo)
    else if (query.match(/chettinad|spicy|chili|wings|vindaloo|thai green|kadai/i)) {
      if (sweetness === 'off-dry' || sweetness === 'sweet') score += 0.14 // Off-dry Chenin, Riesling
      else if (wineType === 'rosé' || wineType === 'sparkling') score += 0.11
      else if (wineType === 'red' && tannin === 'high') score -= 0.12 // Tannins amplify heat
    }
    // 5. Biryani & fragrant rice dishes
    else if (query.match(/biryani|pulao|rice/i)) {
      if (wineType === 'rosé') score += 0.15 // Rosé is the ultimate biryani match
      else if (wineType === 'red' && (wine.grape?.includes('Shiraz') || wine.grape?.includes('Sangiovese'))) score += 0.12
      else if (wineType === 'white' && (wine.grape?.includes('Chenin') || wine.grape?.includes('Riesling'))) score += 0.12
    }
    // 6. Desserts, chocolates, sweets, shahi tukda, cakes
    else if (query.match(/chocolate|dessert|cake|brulee|tart|tukda|gulab|sweet/i)) {
      if (wineType === 'dessert' || wineType === 'fortified') score += 0.16
      else if (wineType === 'red' && notes.includes('chocolate')) score += 0.08
      else if (wineType === 'white' && sweetness === 'dry') score -= 0.15
    }
    // 7. General vegetarian / paneer / mushroom / pasta
    else if (query.match(/paneer|vegetarian|mushroom|risotto|pasta|salad|eggplant/i)) {
      if (wineType === 'white' || wineType === 'rosé') score += 0.12
      else if (wineType === 'red' && (wine.grape?.includes('Sangiovese') || wine.grape?.includes('Merlot'))) score += 0.11
    } else {
      // General harmonious default
      if (wine.rating >= 4.2) score += 0.08
      else if (wine.rating >= 4.0) score += 0.05
    }

    // Small deterministic tiebreaker by index
    score += (index % 5) * 0.005
    const finalScore = Math.min(0.98, Math.max(0.75, Math.round(score * 100) / 100))

    return { wine, score: finalScore }
  })

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, 6).map(({ wine, score }) => ({
    wine_name: wine.name,
    winery: wine.winery,
    wine_type: wine.type.charAt(0).toUpperCase() + wine.type.slice(1),
    variety: wine.grape,
    region: wine.region,
    body: wine.body ? wine.body.charAt(0).toUpperCase() + wine.body.slice(1) : 'Medium',
    sweetness: wine.sweetness || 'Dry',
    acidity: wine.acidity || 'Medium',
    tannin: wine.tannin || 'Medium',
    score,
    price: wine.price,
    rating: wine.rating,
    serving_temp: wine.servingTemp,
    image_url: wine.wineImg || '/images/wine_isolated.png',
    _foodName: foodName,
  }))
}

// ---------------------------------------------------------------------------
// POST /recommend-food (Wine → Food)
// ---------------------------------------------------------------------------
export async function fetchWineRecommendations(wineName: string): Promise<FoodRecommendation[]> {
  const data = await safeFetchJson(`${API_BASE_URL}/recommend-food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wine_name: wineName }),
  })

  if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
    return data.recommendations
  }

  // Sommelier pairing engine fallback for Wine -> Food
  return computeFallbackFoodRecommendations(wineName)
}

function computeFallbackFoodRecommendations(wineName: string): FoodRecommendation[] {
  const q = (wineName || '').toLowerCase()

  // Match wine from catalogue or inspect its profile
  const matchedWine = staticWines.find((w) => w.name.toLowerCase().includes(q) || q.includes(w.name.toLowerCase()))

  const wineType = matchedWine ? matchedWine.type.toLowerCase() : q.includes('red') || q.includes('shiraz') || q.includes('cabernet') ? 'red' : q.includes('sauvignon') || q.includes('white') || q.includes('chenin') ? 'white' : q.includes('sparkling') || q.includes('brut') ? 'sparkling' : q.includes('rose') || q.includes('rosé') ? 'rosé' : q.includes('dessert') || q.includes('port') ? 'dessert' : 'red'

  const body = matchedWine ? matchedWine.body.toLowerCase() : 'medium'
  const grape = matchedWine ? (matchedWine.grape || '').toLowerCase() : q

  // 1. Full-bodied Reds (Shiraz, Cabernet, Malbec, Tempranillo)
  if (wineType === 'red' && (body === 'full' || grape.includes('shiraz') || grape.includes('cabernet') || grape.includes('tempranillo') || grape.includes('malbec'))) {
    return [
      { food_name: 'Mutton Rogan Josh', cuisine: 'Kashmiri', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Medium', score: 0.96, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Roasted Lamb Chops with Rosemary', cuisine: 'Continental', category: 'Lamb & Mutton', vegetarian: 'No', spice_level: 'Mild', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Hyderabadi Dum Mutton Biryani', cuisine: 'Hyderabadi', category: 'Biryani', vegetarian: 'No', spice_level: 'Spicy', score: 0.94, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Tandoori Seekh Kebab', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Grilled Ribeye Steak', cuisine: 'Continental', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', score: 0.92, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Dark Chocolate Fondant Cake', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', score: 0.88, image_url: '/images/dish_isolated.png', _wineName: wineName },
    ]
  }

  // 2. Medium/Light Reds (Sangiovese, Merlot, Pinot Noir, Sette)
  if (wineType === 'red') {
    return [
      { food_name: 'Awadhi Chicken Biryani', cuisine: 'Lucknowi', category: 'Biryani', vegetarian: 'No', spice_level: 'Mild', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Wild Mushroom Risotto with Truffle', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', score: 0.94, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Spaghetti Carbonara', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'No', spice_level: 'Mild', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Herb Roast Chicken', cuisine: 'Continental', category: 'Chicken', vegetarian: 'No', spice_level: 'Mild', score: 0.92, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', score: 0.91, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Eggplant Parmesan', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', score: 0.90, image_url: '/images/dish_isolated.png', _wineName: wineName },
    ]
  }

  // 3. Crisp Whites (Sauvignon Blanc, Pinot Grigio)
  if (wineType === 'white' && (grape.includes('sauvignon') || grape.includes('pinot grigio') || q.includes('sauvignon'))) {
    return [
      { food_name: 'Goan Fish Curry', cuisine: 'Goan Coastal', category: 'Curry', vegetarian: 'No', spice_level: 'Spicy', score: 0.96, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Tawa Fried Pomfret', cuisine: 'Maharashtrian', category: 'Seafood', vegetarian: 'No', spice_level: 'Spicy', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Fresh Oysters with Mignonette', cuisine: 'French', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Caprese Salad with Buffalo Mozzarella', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Grilled Salmon with Lemon Butter', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', score: 0.92, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Pasta al Pesto Genovese', cuisine: 'Italian', category: 'Pasta & Continental', vegetarian: 'Yes', spice_level: 'Mild', score: 0.91, image_url: '/images/dish_isolated.png', _wineName: wineName },
    ]
  }

  // 4. Aromatic & Off-dry Whites (Chenin Blanc, Viognier, Riesling, Chardonnay)
  if (wineType === 'white') {
    return [
      { food_name: 'Butter Chicken', cuisine: 'Mughlai', category: 'Chicken', vegetarian: 'No', spice_level: 'Medium', score: 0.96, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Paneer Butter Masala', cuisine: 'North Indian', category: 'Paneer', vegetarian: 'Yes', spice_level: 'Medium', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Garlic Butter Prawns', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', score: 0.94, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Murgh Malai Tikka', cuisine: 'Mughlai', category: 'Tandoori', vegetarian: 'No', spice_level: 'Mild', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Thai Green Curry', cuisine: 'Pan-Asian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Spicy', score: 0.92, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Palak Paneer', cuisine: 'North Indian', category: 'Curry', vegetarian: 'Yes', spice_level: 'Mild', score: 0.91, image_url: '/images/dish_isolated.png', _wineName: wineName },
    ]
  }

  // 5. Sparkling (Chandon Brut, Soirée, Casablanca)
  if (wineType === 'sparkling') {
    return [
      { food_name: 'Crispy Fish & Chips', cuisine: 'British', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', score: 0.96, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Tandoori Prawns', cuisine: 'Coastal Indian', category: 'Tandoori', vegetarian: 'No', spice_level: 'Medium', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Fresh Oysters with Mignonette', cuisine: 'French', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', score: 0.94, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Spicy Buffalo Wings', cuisine: 'American', category: 'Chicken', vegetarian: 'No', spice_level: 'Spicy', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Caprese Salad with Buffalo Mozzarella', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', score: 0.92, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Butter Chicken', cuisine: 'Mughlai', category: 'Chicken', vegetarian: 'No', spice_level: 'Medium', score: 0.91, image_url: '/images/dish_isolated.png', _wineName: wineName },
    ]
  }

  // 6. Rosé
  if (wineType === 'rosé') {
    return [
      { food_name: 'Royal Vegetable Dum Biryani', cuisine: 'Mughlai', category: 'Biryani', vegetarian: 'Yes', spice_level: 'Medium', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Paneer Tikka', cuisine: 'North Indian', category: 'Tandoori', vegetarian: 'Yes', spice_level: 'Medium', score: 0.94, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Grilled Salmon with Lemon Butter', cuisine: 'Continental', category: 'Seafood', vegetarian: 'No', spice_level: 'Mild', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Awadhi Chicken Biryani', cuisine: 'Lucknowi', category: 'Biryani', vegetarian: 'No', spice_level: 'Mild', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Chettinad Chicken', cuisine: 'South Indian', category: 'Chicken', vegetarian: 'No', spice_level: 'Very Spicy', score: 0.91, image_url: '/images/dish_isolated.png', _wineName: wineName },
      { food_name: 'Caprese Salad with Buffalo Mozzarella', cuisine: 'Italian', category: 'Vegetarian', vegetarian: 'Yes', spice_level: 'Mild', score: 0.90, image_url: '/images/dish_isolated.png', _wineName: wineName },
    ]
  }

  // 7. Dessert & Fortified
  return [
    { food_name: 'Shahi Tukda with Rabdi', cuisine: 'Awadhi', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', score: 0.97, image_url: '/images/dish_isolated.png', _wineName: wineName },
    { food_name: 'Dark Chocolate Fondant Cake', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', score: 0.96, image_url: '/images/dish_isolated.png', _wineName: wineName },
    { food_name: 'Classic Crème Brûlée', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', score: 0.95, image_url: '/images/dish_isolated.png', _wineName: wineName },
    { food_name: 'Gulab Jamun with Roasted Pistachio', cuisine: 'North Indian', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', score: 0.93, image_url: '/images/dish_isolated.png', _wineName: wineName },
    { food_name: 'Fresh Berry Fruit Tart', cuisine: 'French', category: 'Dessert', vegetarian: 'Yes', spice_level: 'Mild', score: 0.92, image_url: '/images/dish_isolated.png', _wineName: wineName },
  ]
}
