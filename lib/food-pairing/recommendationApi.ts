// lib/food-pairing/recommendationApi.ts
// ---------------------------------------------------------------------------
// API service layer for VinoSphere Food & Wine Recommendation Backend
// ---------------------------------------------------------------------------

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
// GET /food-categories
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/food-categories`)
  if (!response.ok) {
    throw new Error(`Failed to load food categories: ${response.status} ${response.statusText}`)
  }
  const data = await response.json()
  return data.categories || []
}

// ---------------------------------------------------------------------------
// GET /foods?category=Chicken
// ---------------------------------------------------------------------------
export async function getFoods(category: string): Promise<FoodCategoryItem[]> {
  const params = new URLSearchParams({ category })
  const response = await fetch(`${API_BASE_URL}/foods?${params}`)
  if (!response.ok) {
    throw new Error(`Failed to load dishes for "${category}": ${response.status} ${response.statusText}`)
  }
  const data = await response.json()
  return data.foods || []
}

// ---------------------------------------------------------------------------
// GET /wine-types
// ---------------------------------------------------------------------------
export async function getWineTypes(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/wine-types`)
  if (!response.ok) {
    throw new Error(`Failed to load wine types: ${response.status}`)
  }
  const data = await response.json()
  return data.wine_types || []
}

// ---------------------------------------------------------------------------
// GET /wines?wine_type=White
// ---------------------------------------------------------------------------
export async function getWinesByType(wineType?: string): Promise<any[]> {
  const url = wineType 
    ? `${API_BASE_URL}/wines?${new URLSearchParams({ wine_type: wineType })}`
    : `${API_BASE_URL}/wines`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load wines: ${response.status}`)
  }
  const data = await response.json()
  return data.wines || []
}

// ---------------------------------------------------------------------------
// POST /recommend (Food → Wine)
// ---------------------------------------------------------------------------
export async function fetchFoodRecommendations(foodName: string): Promise<WineRecommendation[]> {
  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ food_name: foodName }),
  })

  if (!response.ok) {
    let errMsg = `Recommendation API returned ${response.status}: ${response.statusText}`
    try {
      const errData = await response.json()
      if (errData.detail && errData.detail.error) {
        errMsg = errData.detail.error
      } else if (errData.detail) {
        errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail)
      }
    } catch {
      // fallback to statusText
    }
    throw new Error(errMsg)
  }

  const data = await response.json()
  return data.recommendations || []
}

// ---------------------------------------------------------------------------
// POST /recommend-food (Wine → Food)
// ---------------------------------------------------------------------------
export async function fetchWineRecommendations(wineName: string): Promise<FoodRecommendation[]> {
  const response = await fetch(`${API_BASE_URL}/recommend-food`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wine_name: wineName }),
  })

  if (!response.ok) {
    let errMsg = `Recommendation API returned ${response.status}: ${response.statusText}`
    try {
      const errData = await response.json()
      if (errData.detail && errData.detail.error) {
        errMsg = errData.detail.error
      } else if (errData.detail) {
        errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail)
      }
    } catch {
      // fallback to statusText
    }
    throw new Error(errMsg)
  }

  const data = await response.json()
  return data.recommendations || []
}
