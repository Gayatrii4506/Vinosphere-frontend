from fastapi import APIRouter, HTTPException, Query
from api.models import FoodRequest, WineRequest
from services.food_catalog_service import FoodCatalogService
from services.wine_catalog_service import WineCatalogService
from services.recommendation_engine import RecommendationEngine
from services.cloudinary_image_library import CloudinaryImageLibrary
from services.food_image_matcher import FoodImageMatcher
from services.wine_image_matcher import WineImageMatcher

router = APIRouter()

# Instantiated once at startup
food_catalog = FoodCatalogService()
wine_catalog = WineCatalogService()
engine = RecommendationEngine(
    food_catalog_service=food_catalog,
    wine_catalog_service=wine_catalog
)

# Image services — Cloudinary folder is the single source of truth
image_library = CloudinaryImageLibrary()
image_matcher = FoodImageMatcher(image_library)

# Wine image matcher — reads from Cloudinary wine-images folder
wine_image_matcher = WineImageMatcher()


# ---------------------------------------------------------------------------
# GET /food-categories
# ---------------------------------------------------------------------------
@router.get("/food-categories")
def get_food_categories():
    categories = food_catalog.get_categories()
    return {"categories": categories}


# ---------------------------------------------------------------------------
# GET /foods?category=Chicken
#
# Returns full food objects so the frontend can display images and metadata.
#
# Response shape (each item):
#   {
#     "food_name": "Butter Chicken",
#     "cuisine": "Punjabi",
#     "category": "Chicken",
#     "vegetarian": "No",
#     "spice_level": "Medium",
#     "image_url": "https://upload.wikimedia.org/..."  <- null if not enriched yet
#   }
# ---------------------------------------------------------------------------
@router.get("/foods")
def get_foods(category: str = Query(..., description="Food category name")):
    foods = food_catalog.get_foods_by_category(category)
    if not foods:
        raise HTTPException(
            status_code=404,
            detail=f"No foods found for category '{category}'. "
                   f"Use GET /food-categories to list valid categories."
        )

    # Enrich each food name with an image_url from the Cloudinary matcher
    enriched = []
    for food_name in foods:
        # Look up full food record from the catalog's DataFrame for matching
        food_row = food_catalog.get_food_record(food_name)
        if food_row is not None:
            food_record = {
                "food_name": food_name,
                "cuisine": str(food_row.get("Cuisine", "")),
                "category": str(food_row.get("Category", "")),
                "protein": str(food_row.get("Protein", "")),
            }
            img_url = image_matcher.match(food_record)
        else:
            img_url = None

        enriched.append({"food_name": food_name, "image_url": img_url})

    return {"category": category, "foods": enriched}


# ---------------------------------------------------------------------------
# GET /wine-types
# ---------------------------------------------------------------------------
@router.get("/wine-types")
def get_wine_types():
    types = wine_catalog.get_wine_types()
    return {"wine_types": types}


# ---------------------------------------------------------------------------
# GET /wines?wine_type=White
#
# Returns full wine objects including image_url.
# ---------------------------------------------------------------------------
@router.get("/wines")
def get_wines(wine_type: str = Query(None, description="Wine type filter")):
    if wine_type:
        wine_names = wine_catalog.get_wines_by_type(wine_type)
    else:
        wine_names = wine_catalog.get_all_wines()

    df = wine_catalog._df
    results = []
    for wine_name in wine_names:
        rows = df[df["Wine_Name"].str.strip() == wine_name.strip()]
        if not rows.empty:
            row = rows.iloc[0]
            img = str(row.get("image_url", "")).strip()
            if img.lower() in ("nan", "none", ""):
                img = None
            results.append({
                "wine_name": wine_name,
                "winery": str(row.get("Winery", "")).strip(),
                "wine_type": str(row.get("Wine_Type", "")).strip(),
                "region": str(row.get("Region", "")).strip(),
                "variety": str(row.get("Variety", "")).strip(),
                "price_range_inr": str(row.get("Price_Range_INR", "")).strip(),
                "description": str(row.get("Description", "")).strip(),
                "image_url": img,
            })
        else:
            results.append({"wine_name": wine_name, "image_url": None})
    return {"wines": results}


# ---------------------------------------------------------------------------
# POST /recommend  (Food → Wine)
#
# Returns top 5 wine recommendations.  Each wine object includes image_url.
# image_url is None when the wine CSV has not yet been enriched.
# ---------------------------------------------------------------------------
@router.post("/recommend")
def recommend_wines(request: FoodRequest):
    if not request.food_name or not engine.is_valid_food_query(request.food_name):
        raise HTTPException(
            status_code=400,
            detail="Invalid food name. Please enter a valid dish name."
        )

    wines = engine.recommend_wines(request.food_name, user_id=request.user_id)
    if wines is None:
        raise HTTPException(
            status_code=400,
            detail="Invalid food name. Please enter a valid dish name."
        )

    # Attach Cloudinary image_url to each wine recommendation
    for wine in wines:
        wine["image_url"] = wine_image_matcher.get_image_url(wine["wine_name"])

    return {
        "food": request.food_name,
        "recommendations": wines   # each dict already contains image_url from engine
    }


# ---------------------------------------------------------------------------
# POST /recommend-food  (Wine → Food)
#
# Returns top 5 food recommendations.  Each food object includes image_url.
# ---------------------------------------------------------------------------
@router.post("/recommend-food")
def recommend_foods(request: WineRequest):
    import traceback
    try:
        foods = engine.recommend_foods(request.wine_name, user_id=request.user_id)
        if foods is None:
            raise HTTPException(
                status_code=400,
                detail={"error": "Unable to understand this wine."}
            )

        # Attach image_url to each food recommendation
        for food in foods:
            food["image_url"] = image_matcher.match(food)

        return {
            "wine": request.wine_name,
            "recommendations": foods   # each dict already contains image_url from engine
        }
    except Exception as e:
        error_msg = traceback.format_exc()
        print("ERROR IN recommend-food:", error_msg)
        raise HTTPException(
            status_code=500,
            detail={"error": str(e), "traceback": error_msg}
        )