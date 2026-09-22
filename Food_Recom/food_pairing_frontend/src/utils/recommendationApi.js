// src/utils/recommendationApi.js
// ---------------------------------------------------------------------------
// API service layer for all backend calls.
// ---------------------------------------------------------------------------

const API_BASE_URL = "http://127.0.0.1:8000";

// ---------------------------------------------------------------------------
// GET /food-categories
// ---------------------------------------------------------------------------
export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/food-categories`);
  if (!response.ok) {
    throw new Error(
      `Failed to load food categories: ${response.status} ${response.statusText}`
    );
  }
  const data = await response.json();
  return data.categories || [];
}

// ---------------------------------------------------------------------------
// GET /foods?category=Chicken
// ---------------------------------------------------------------------------
export async function getFoods(category) {
  const params = new URLSearchParams({ category });
  const response = await fetch(`${API_BASE_URL}/foods?${params}`);
  if (!response.ok) {
    throw new Error(
      `Failed to load dishes for "${category}": ${response.status} ${response.statusText}`
    );
  }
  const data = await response.json();
  return data.foods || [];
}

// ---------------------------------------------------------------------------
// GET /wine-types
// ---------------------------------------------------------------------------
export async function getWineTypes() {
  const response = await fetch(`${API_BASE_URL}/wine-types`);
  if (!response.ok) {
    throw new Error(`Failed to load wine types: ${response.status}`);
  }
  const data = await response.json();
  return data.wine_types || [];
}

// ---------------------------------------------------------------------------
// GET /wines?wine_type=White
// ---------------------------------------------------------------------------
export async function getWinesByType(wineType) {
  const params = new URLSearchParams({ wine_type: wineType });
  const response = await fetch(`${API_BASE_URL}/wines?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to load wines for "${wineType}": ${response.status}`);
  }
  const data = await response.json();
  return data.wines || [];
}

// ---------------------------------------------------------------------------
// POST /recommend  (Food → Wine)
// ---------------------------------------------------------------------------
export async function fetchFoodRecommendations(foodName) {
  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ food_name: foodName }),
  });

  if (!response.ok) {
    let errMsg = `Recommendation API returned ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.detail && errData.detail.error) {
        errMsg = errData.detail.error;
      } else if (errData.detail) {
        errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.recommendations || [];
}

// ---------------------------------------------------------------------------
// POST /recommend-food  (Wine → Food)
// ---------------------------------------------------------------------------
export async function fetchWineRecommendations(wineName) {
  const response = await fetch(`${API_BASE_URL}/recommend-food`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wine_name: wineName }),
  });

  if (!response.ok) {
    let errMsg = `Recommendation API returned ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      if (errData.detail && errData.detail.error) {
        errMsg = errData.detail.error;
      } else if (errData.detail) {
        errMsg = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
      }
    } catch (e) {}
    throw new Error(errMsg);
  }

  const data = await response.json();
  return data.recommendations || [];
}
