# services/gemini_service.py
# ---------------------------------------------------------------------------
# Gemini API integration service for analyzing unknown food dishes.
# Queries Gemini for food understanding only (generating dataset attributes).
# ---------------------------------------------------------------------------

import os
import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any
from dotenv import load_dotenv, find_dotenv

# Robust .env loading
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path, override=True)
else:
    load_dotenv(find_dotenv(), override=True)

logger = logging.getLogger(__name__)

# Preferred models in order of availability
GEMINI_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-flash-latest",
]

REQUIRED_FIELDS = [
    "Food_Name",
    "Cuisine",
    "Meal_Type",
    "Category",
    "Vegetarian",
    "Vegan",
    "Jain",
    "Protein",
    "Main_Ingredients",
    "Spice_Level",
    "Fat_Level",
    "Sweetness",
    "Acidity",
    "Saltiness",
    "Umami",
    "Texture",
    "Cooking_Method",
    "Dominant_Flavors",
    "Flavor_Intensity",
    "Recommended_Wine_Type",
    "Recommended_Body",
    "Recommended_Sweetness",
    "Recommended_Acidity",
    "Recommended_Tannin",
    "Pairing_Reason",
]


class GeminiFoodService:
    """Service to analyze unknown food items using Google Gemini API."""

    def __init__(self) -> None:
        self.api_key = os.getenv("GEMINI_API_KEY")

    def _get_api_key(self) -> str:
        """Fetch API key dynamically from environment."""
        key = os.getenv("GEMINI_API_KEY") or self.api_key
        if not key:
            # Fallback re-read .env
            load_dotenv(env_path, override=True)
            key = os.getenv("GEMINI_API_KEY")
        if not key:
            raise ValueError("GEMINI_API_KEY is not configured in .env file.")
        return key

    def _call_gemini_api(self, food_name: str) -> str:
        """Execute Gemini API call using google.genai client."""
        api_key = self._get_api_key()

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = f"""You are a culinary expert and sommelier. Analyze the food dish '{food_name}'.
Return a structured JSON object with the following fields EXACTLY:
- Food_Name: string (properly capitalized name of the dish, e.g. "{food_name}")
- Cuisine: string (e.g. "North Indian", "Italian", "Mexican", "Japanese", "French", etc.)
- Meal_Type: string (e.g. "Dinner", "Lunch", "Breakfast", "Snack", "Dessert")
- Category: string (choose the best matching category from: "Chicken", "Mutton & Lamb", "Beef & Pork", "Seafood", "Paneer & Cheese", "Vegetarian", "Eggs", "Rice & Biryani", "Street Food & Snacks", "Desserts", "Duck", "Other")
- Vegetarian: string ("Yes" or "No")
- Vegan: string ("Yes" or "No")
- Jain: string ("Yes" or "No")
- Protein: string (primary protein source e.g. "Lentils", "Chicken", "Paneer", "Fish", "Beef", "Tofu", "Egg", "Gram Flour", etc.)
- Main_Ingredients: string (comma-separated list of main ingredients)
- Spice_Level: string ("Low", "Medium", or "High")
- Fat_Level: string ("Low", "Medium", or "High")
- Sweetness: string ("Dry", "Off-Dry", "Mild Sweet", or "Sweet")
- Acidity: string ("Low", "Medium", or "High")
- Saltiness: string ("Low", "Medium", or "High")
- Umami: string ("Low", "Medium", or "High")
- Texture: string (e.g. "Creamy", "Crispy", "Tender", "Chewy", "Rich")
- Cooking_Method: string (e.g. "Slow Cooked", "Grilled", "Fried", "Baked", "Steamed", "Simmered")
- Dominant_Flavors: string (comma-separated flavor notes e.g. "Butter, Cream, Spices")
- Flavor_Intensity: string ("Delicate", "Medium", or "Bold")
- Recommended_Wine_Type: string ("Red", "White", "Rosé", "Sparkling", or "Dessert")
- Recommended_Body: string ("Light", "Medium", or "Full")
- Recommended_Sweetness: string ("Dry", "Off-Dry", "Medium", or "Sweet")
- Recommended_Acidity: string ("Low", "Medium", or "High")
- Recommended_Tannin: string ("Low", "Medium", or "High")
- Pairing_Reason: string (detailed 2-3 sentence sommelier explanation of why this wine type/body/sweetness/acidity/tannin pairs with the dish)

Important: Return ONLY valid JSON matching this schema."""

        last_error = None
        for model in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                    ),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                logger.debug(f"Gemini model {model} failed: {e}")

        raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

    def _validate_data(self, data: Dict[str, Any], requested_name: str) -> Dict[str, Any]:
        """Validate that all required dataset fields exist in parsed JSON."""
        cleaned: Dict[str, Any] = {}
        for field in REQUIRED_FIELDS:
            val = data.get(field) or data.get(field.lower()) or data.get(field.replace("_", ""))
            if val is None or str(val).strip() == "":
                raise ValueError(f"Missing required field: {field}")
            cleaned[field] = str(val).strip()

        # Normalize Food_Name if needed
        if not cleaned["Food_Name"]:
            cleaned["Food_Name"] = requested_name.strip().title()

        return cleaned

    def analyze_food(self, food_name: str) -> Optional[Dict[str, Any]]:
        """
        Analyze an unknown dish using Gemini API.
        Includes single retry logic on invalid JSON or missing fields.
        """
        for attempt in range(1, 3):
            try:
                raw_json = self._call_gemini_api(food_name)
                # Strip markdown code fencing if returned
                if raw_json.startswith("```"):
                    lines = raw_json.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    raw_json = "\n".join(lines).strip()

                parsed = json.loads(raw_json)
                validated = self._validate_data(parsed, food_name)
                return validated
            except Exception as e:
                logger.warning(f"Gemini analysis attempt {attempt} failed for '{food_name}': {e}")
                if attempt == 2:
                    return None
        return None

    def _call_gemini_api_wine(self, wine_name: str) -> str:
        """Execute Gemini API call for wine analysis using google.genai client."""
        api_key = self._get_api_key()

        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        prompt = f"""You are a sommelier and wine expert. Analyze the wine '{wine_name}'.
Return a structured JSON object with the following fields EXACTLY:
- Wine_Name: string (properly capitalized name of the wine, e.g. "{wine_name}")
- Winery: string (winery/producer name)
- Region: string (wine region, e.g. "Nashik", "Bordeaux", "Napa Valley", "Tuscany", etc.)
- State: string (state/province, e.g. "Maharashtra", "California", "Tuscany", etc.)
- Country: string (country of origin, e.g. "India", "France", "USA", "Italy", etc.)
- Wine_Type: string (choose one from: "Red", "White", "Rosé", "Sparkling", or "Dessert")
- Variety: string (grape variety e.g. "Riesling", "Cabernet Sauvignon", "Chardonnay", "Shiraz", "Pinot Noir", etc.)
- Vintage: string or number (e.g. "2023", "2021", "NV")
- Body: string (choose one from: "Light", "Medium", or "Full")
- Sweetness: string (choose one from: "Dry", "Off-Dry", "Medium", or "Sweet")
- Acidity: string (choose one from: "Low", "Medium", or "High")
- Tannin: string (choose one from: "Low", "Medium", or "High")
- Alcohol_Percentage: string or number (e.g. "12.5")
- Oak_Aged: string ("Yes" or "No")
- Aroma_Notes: string (comma-separated aroma notes e.g. "Green apple, Lime, Petroleum, Floral")
- Flavor_Notes: string (comma-separated flavor notes e.g. "Crisp citrus, Peach, Mineral, Honey")
- Finish: string ("Short", "Medium", or "Long")
- Serving_Temperature: string (e.g. "8-10°C" or "16-18°C")
- Food_Categories: string (comma-separated categories e.g. "Seafood, Salads, Spicy Food, Poultry")
- Best_With_Cuisines: string (comma-separated cuisines e.g. "Indian, Thai, Continental")
- Price_Range_INR: string (approx price range e.g. "800-1200")
- Awards: string (e.g. "None listed" or award names)
- Availability: string ("Widely Available" or "Limited")
- Description: string (2-3 sentence sommelier summary of the wine's character and tasting notes)

Important: Return ONLY valid JSON matching this schema."""

        last_error = None
        for model in GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                    ),
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_error = e
                logger.debug(f"Gemini model {model} failed for wine: {e}")

        raise RuntimeError(f"All Gemini models failed for wine. Last error: {last_error}")

    def _validate_wine_data(self, data: Dict[str, Any], requested_name: str) -> Dict[str, Any]:
        """Validate that all required wine dataset fields exist in parsed JSON."""
        required = [
            "Wine_Name", "Winery", "Region", "State", "Country", "Wine_Type",
            "Variety", "Vintage", "Body", "Sweetness", "Acidity", "Tannin",
            "Alcohol_Percentage", "Oak_Aged", "Aroma_Notes", "Flavor_Notes",
            "Finish", "Serving_Temperature", "Food_Categories", "Best_With_Cuisines",
            "Price_Range_INR", "Awards", "Availability", "Description"
        ]
        cleaned: Dict[str, Any] = {}
        for field in required:
            val = data.get(field) or data.get(field.lower()) or data.get(field.replace("_", ""))
            if val is None or str(val).strip() == "":
                # Fallbacks for optional metadata if missing
                if field in ["State", "Awards", "Price_Range_INR"]:
                    val = "Unknown" if field != "Awards" else "None listed"
                elif field in ["Alcohol_Percentage"]:
                    val = "12.5"
                elif field in ["Vintage"]:
                    val = "2023"
                elif field in ["Oak_Aged"]:
                    val = "No"
                elif field in ["Finish"]:
                    val = "Medium"
                elif field in ["Serving_Temperature"]:
                    val = "8-10°C"
                elif field in ["Availability"]:
                    val = "Widely Available"
                else:
                    raise ValueError(f"Missing required wine field: {field}")
            cleaned[field] = str(val).strip()

        if not cleaned["Wine_Name"]:
            cleaned["Wine_Name"] = requested_name.strip().title()

        return cleaned

    def analyze_wine(self, wine_name: str) -> Optional[Dict[str, Any]]:
        """
        Analyze an unknown wine using Gemini API.
        Includes single retry logic on invalid JSON or missing fields.
        """
        for attempt in range(1, 3):
            try:
                raw_json = self._call_gemini_api_wine(wine_name)
                if raw_json.startswith("```"):
                    lines = raw_json.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    raw_json = "\n".join(lines).strip()

                parsed = json.loads(raw_json)
                validated = self._validate_wine_data(parsed, wine_name)
                return validated
            except Exception as e:
                logger.warning(f"Gemini wine analysis attempt {attempt} failed for '{wine_name}': {e}")
                if attempt == 2:
                    return None
        return None


# Alias for backward compatibility / clarity
GeminiWineService = GeminiFoodService

