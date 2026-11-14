# services/food_image_matcher.py
# ---------------------------------------------------------------------------
# High-precision Food Image Matcher for Cloudinary Library.
#
# RULES:
#   1. Exact / Specific Food Name -> Exact Image
#   2. Handles Unicode accents (e.g. "Croquetas de Jamón" == "croquetas de jamon",
#      "Fideuà" == "fideua").
#   3. NO generic category/cuisine/protein fallback (e.g. no mapping all chicken
#      dishes to "chicken curry", no mapping all rice dishes to "rice").
#   4. If an exact/specific image does NOT exist in the Cloudinary library,
#      return None (JSON null) so the frontend displays the placeholder.
#   5. Every unique dish receives its own distinct photo.
# ---------------------------------------------------------------------------

import re
import unicodedata
import logging
from typing import Dict, Any, Optional, List, Tuple

from services.cloudinary_image_library import CloudinaryImageLibrary

logger = logging.getLogger(__name__)

# Stopwords to remove when comparing significant tokens
STOPWORDS = {"and", "with", "the", "in", "of", "a", "an", "on", "de", "al", "la", "da", "di", "du"}

# Generic category words that should NEVER be used as coarse single-token fallbacks
GENERIC_DISALLOW_SINGLE_TOKENS = {
    "food", "dish", "curry", "rice", "casserole", "soup", "stew",
    "sweets", "street", "fine", "dining", "gravy", "roast", "grilled"
}


def strip_accents(text: str) -> str:
    """Strip accents: e.g. 'Jamón' -> 'Jamon', 'Fideuà' -> 'Fideua'."""
    nfkd = unicodedata.normalize('NFKD', str(text))
    return "".join([c for c in nfkd if not unicodedata.combining(c)])


def normalize_name(text: str) -> str:
    """Normalize text into lowercase unaccented alphanumeric with single spaces."""
    unaccented = strip_accents(text)
    cleaned = re.sub(r"[^\w\s]", " ", unaccented.lower())
    return " ".join(cleaned.split())


def extract_significant_tokens(text: str) -> List[str]:
    """Extract ordered non-stopword tokens."""
    unaccented = strip_accents(text)
    tokens = re.findall(r"[a-z0-9]+", unaccented.lower())
    return [t for t in tokens if t not in STOPWORDS]


class FoodImageMatcher:
    """
    Strict / Exact Food Image Matcher.
    Only returns a Cloudinary secure_url if there is an exact or high-confidence
    specific dish match in the Cloudinary library. Otherwise returns None.
    """

    def __init__(self, image_library: CloudinaryImageLibrary) -> None:
        self._library = image_library
        self._cache: Dict[str, Optional[str]] = {}
        self.refresh()

    def refresh(self) -> None:
        """Refresh image entries from the library and rebuild index."""
        self._image_entries: List[Dict[str, Any]] = self._library.get_image_entries()
        for entry in self._image_entries:
            entry["_norm"] = normalize_name(entry["normalized"])
            entry["_tokens"] = extract_significant_tokens(entry["normalized"])
            entry["_token_set"] = set(entry["_tokens"])
        self._cache.clear()

    def clear_cache(self) -> None:
        self._cache.clear()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def match(self, food_record: Dict[str, Any]) -> Optional[str]:
        """
        Return exact matching Cloudinary secure_url, or None if no exact image exists.
        """
        food_name = str(food_record.get("food_name", food_record.get("Food_Name", ""))).strip()
        if not food_name:
            return None

        cache_key = food_name.lower()
        if cache_key in self._cache:
            return self._cache[cache_key]

        url, _, _ = self._find_exact_match(food_name)
        self._cache[cache_key] = url
        return url

    def match_with_tier(self, food_record: Dict[str, Any]) -> Tuple[Optional[str], int, str]:
        """
        Return (url, match_type_code, matched_image_name) for diagnostics.
        """
        food_name = str(food_record.get("food_name", food_record.get("Food_Name", ""))).strip()
        if not food_name:
            return None, 0, ""

        return self._find_exact_match(food_name)

    # ------------------------------------------------------------------
    # Exact Matching Engine
    # ------------------------------------------------------------------
    def _find_exact_match(self, food_name: str) -> Tuple[Optional[str], int, str]:
        if not self._image_entries:
            return None, 0, ""

        norm_food = normalize_name(food_name)
        food_tokens = extract_significant_tokens(food_name)
        food_token_set = set(food_tokens)

        # --------------------------------------------------------------
        # Priority 1: Exact full normalized string match
        # e.g. "Nihari" == "nihari"
        #      "Bengali Kosha Mangsho" == "bengali kosha mangsho"
        #      "Croquetas de Jamón" == "croquetas de jamon"
        #      "Fideuà" == "fideua"
        # --------------------------------------------------------------
        for entry in self._image_entries:
            if norm_food == entry["_norm"]:
                return entry["secure_url"], 1, entry["normalized"]

        # --------------------------------------------------------------
        # Priority 2: Multi-word exact phrase match
        # e.g. "Sol Kadhi" <-> "malvani sol kadhi"
        #      "Litti Chokha" <-> "bihari litti chokha"
        #      "Pyaaz Kachori" <-> "rajasthani pyaaz kachori"
        #      "Vada Pav" <-> "maharashtrian vada pav"
        # --------------------------------------------------------------
        for entry in self._image_entries:
            img_norm = entry["_norm"]
            if " " in img_norm:
                # Case A: image phrase is contained within food name (e.g. "litti chokha" in "bihari litti chokha")
                if re.search(r"\b" + re.escape(img_norm) + r"\b", norm_food):
                    return entry["secure_url"], 2, entry["normalized"]
                # Case B: food name phrase is contained within image name (e.g. "sol kadhi" in "malvani sol kadhi")
                if " " in norm_food and re.search(r"\b" + re.escape(norm_food) + r"\b", img_norm):
                    return entry["secure_url"], 2, entry["normalized"]

        # --------------------------------------------------------------
        # Priority 3: Distinct specific single-dish token match
        # For unique dish names like "biryani", "dosa", "idli", "samosa",
        # "pizza", "pasta", "ramen", "risotto", "tacos", "sushi", "hummus",
        # "kebab", "shawarma", "enchilada", "dumplings", "roti", "dhokla",
        # "dhuska", "escargots", "cannoli", "kunefe", "shakshuka", etc.
        # --------------------------------------------------------------
        for entry in self._image_entries:
            img_norm = entry["_norm"]
            if " " not in img_norm and img_norm not in GENERIC_DISALLOW_SINGLE_TOKENS:
                # Check direct token membership
                if img_norm in food_token_set:
                    return entry["secure_url"], 3, entry["normalized"]
                # Check singular/plural (e.g. "taco" <-> "tacos", "dumpling" <-> "dumplings")
                if len(img_norm) >= 4:
                    for ft in food_token_set:
                        if ft == img_norm or ft == img_norm + "s" or img_norm == ft + "s":
                            return entry["secure_url"], 3, entry["normalized"]

        # No exact match found -> return None
        return None, 0, ""
