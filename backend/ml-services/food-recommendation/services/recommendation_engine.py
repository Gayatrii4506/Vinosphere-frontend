# services/recommendation_engine.py
# ---------------------------------------------------------------------------
# Unified Recommendation Engine supporting bidirectional pairings:
# 1. Food → Wine (recommend_wines)
# 2. Wine → Food (recommend_foods)
#
# Incorporates Gemini API fallback for unknown items, caching in learned CSVs,
# attribute compatibility scoring, and SentenceTransformer semantic ranking.
#
# Image enrichment:
#   - image_url is read from the enriched CSVs for all known foods/wines.
#   - Newly-learned Gemini items receive an image_url asynchronously
#     (background thread) so the recommendation itself never blocks.
# ---------------------------------------------------------------------------

import os
import re
import time
import threading
import logging
import unicodedata
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, List, Dict, Any
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import requests

def safe_str(val: Any, default: str = "") -> str:
    """Safely convert pandas value to string, converting NaNs to default."""
    return str(val).strip() if pd.notna(val) else default

from services.gemini_service import GeminiFoodService

# ---------------------------------------------------------------------------
# Image enrichment for newly learned foods/wines.
# Uses image_service.py which validates URLs before returning them.
# The recommendation itself is NOT blocked by the image lookup (background thread).
# ---------------------------------------------------------------------------
try:
    from services.image_service import ensure_image_for_food, ensure_image_for_wine
    _IMAGE_SERVICE_AVAILABLE = True
except ImportError:
    _IMAGE_SERVICE_AVAILABLE = False
    def ensure_image_for_food(*args, **kwargs): return None  # type: ignore
    def ensure_image_for_wine(*args, **kwargs): return None  # type: ignore


logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
FOOD_DATASET_PATH = BASE_DIR / "datasets" / "food_dataset.csv"
FOOD_CLEAN_PATH = BASE_DIR / "processed_data" / "food_clean.csv"
WINE_CLEAN_PATH = BASE_DIR / "processed_data" / "wine_clean.csv"
LEARNED_FOODS_PATH = BASE_DIR / "datasets" / "learned_foods.csv"
LEARNED_WINES_PATH = BASE_DIR / "datasets" / "learned_wines.csv"
FOOD_EMBEDDINGS_PATH = BASE_DIR / "embeddings" / "food_embeddings.npy"
WINE_EMBEDDINGS_PATH = BASE_DIR / "embeddings" / "wine_embeddings.npy"


def create_food_document(row: pd.Series) -> str:
    """Generate canonical document text for a food item."""
    is_veg = "vegetarian" if str(row.get("Vegetarian", "")).lower() == "yes" else "non-vegetarian"
    doc = f"""
{row.get('Food_Name', '')} is a {row.get('Cuisine', '')} {row.get('Category', '')} commonly served as {row.get('Meal_Type', '')}.

It is {is_veg} and its primary protein source is {row.get('Protein', '')}.

The dish is prepared using {row.get('Cooking_Method', '')} cooking techniques and contains ingredients such as {row.get('Main_Ingredients', '')}.

Its flavor profile includes {row.get('Dominant_Flavors', '')} with a {row.get('Flavor_Intensity', '')} intensity.

It has a {row.get('Texture', '')} texture, {row.get('Spice_Level', '')} spice level, {row.get('Fat_Level', '')} fat content, {row.get('Sweetness', '')} sweetness, {row.get('Acidity', '')} acidity, {row.get('Saltiness', '')} saltiness and {row.get('Umami', '')} umami characteristics.

The ideal wine pairing is a {row.get('Recommended_Wine_Type', '')} wine with {row.get('Recommended_Body', '')} body, {row.get('Recommended_Sweetness', '')} sweetness, {row.get('Recommended_Acidity', '')} acidity and {row.get('Recommended_Tannin', '')} tannins.

This pairing enhances both the food and wine by balancing richness, acidity, texture and overall flavor.
"""
    return " ".join(doc.split())


def create_wine_document(row: pd.Series) -> str:
    """Generate canonical document text for a wine item."""
    doc = f"""
{row.get('Wine_Name', '')} is an Indian {row.get('Wine_Type', '')} wine produced by {row.get('Winery', '')} in {row.get('Region', '')}.

It is made from {row.get('Variety', '')} grapes.

This wine has a {row.get('Body', '')} body with {row.get('Sweetness', '')} sweetness, {row.get('Acidity', '')} acidity and {row.get('Tannin', '')} tannins.

Its alcohol content is {row.get('Alcohol_Percentage', '')}.

The wine offers aromas of {row.get('Aroma_Notes', '')} and flavors of {row.get('Flavor_Notes', '')}.

It pairs particularly well with {row.get('Food_Categories', '')} and cuisines such as {row.get('Best_With_Cuisines', '')}.

The wine is described as: {row.get('Description', '')}.
"""
    return " ".join(doc.split())


class RecommendationEngine:

    def __init__(self, food_catalog_service: Optional[Any] = None, wine_catalog_service: Optional[Any] = None) -> None:
        print("Loading datasets in RecommendationEngine...")

        self.food_catalog_service = food_catalog_service
        self.wine_catalog_service = wine_catalog_service
        self.gemini_service = GeminiFoodService()

        # Load food base dataset (prefer full food_dataset.csv if available)
        if FOOD_DATASET_PATH.exists() and os.path.getsize(FOOD_DATASET_PATH) > 0:
            try:
                base_food_df = pd.read_csv(FOOD_DATASET_PATH)
            except Exception:
                base_food_df = pd.read_csv(FOOD_CLEAN_PATH)
        else:
            base_food_df = pd.read_csv(FOOD_CLEAN_PATH)

        # Load wine base dataset
        base_wine_df = pd.read_csv(WINE_CLEAN_PATH)

        # Load pre-computed embeddings
        self.food_embeddings = np.load(FOOD_EMBEDDINGS_PATH)
        self.wine_embeddings = np.load(WINE_EMBEDDINGS_PATH)

        print("Loading SentenceTransformer embedding model...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Combine food dataset with learned_foods.csv if present
        if LEARNED_FOODS_PATH.exists() and os.path.getsize(LEARNED_FOODS_PATH) > 0:
            try:
                learned_food_df = pd.read_csv(LEARNED_FOODS_PATH)
                self.food_df = pd.concat([base_food_df, learned_food_df], ignore_index=True)
            except Exception:
                self.food_df = base_food_df
        else:
            self.food_df = base_food_df

        # Align food embeddings for newly learned foods
        diff_food = len(self.food_df) - len(self.food_embeddings)
        if diff_food > 0:
            print(f"Computing embeddings for {diff_food} learned foods...")
            extra_food_docs = [create_food_document(self.food_df.iloc[i]) for i in range(len(self.food_embeddings), len(self.food_df))]
            extra_food_emb = self.model.encode(extra_food_docs, convert_to_numpy=True)
            self.food_embeddings = np.vstack([self.food_embeddings, extra_food_emb])

        # Combine wine dataset with learned_wines.csv if present
        if LEARNED_WINES_PATH.exists() and os.path.getsize(LEARNED_WINES_PATH) > 0:
            try:
                learned_wine_df = pd.read_csv(LEARNED_WINES_PATH)
                self.wine_df = pd.concat([base_wine_df, learned_wine_df], ignore_index=True)
            except Exception:
                self.wine_df = base_wine_df
        else:
            self.wine_df = base_wine_df

        # Align wine embeddings for newly learned wines
        diff_wine = len(self.wine_df) - len(self.wine_embeddings)
        if diff_wine > 0:
            print(f"Computing embeddings for {diff_wine} learned wines...")
            extra_wine_docs = [create_wine_document(self.wine_df.iloc[i]) for i in range(len(self.wine_embeddings), len(self.wine_df))]
            extra_wine_emb = self.model.encode(extra_wine_docs, convert_to_numpy=True)
            self.wine_embeddings = np.vstack([self.wine_embeddings, extra_wine_emb])

        print("RecommendationEngine initialized successfully.\n")

    def set_food_catalog_service(self, service: Any) -> None:
        self.food_catalog_service = service

    def set_wine_catalog_service(self, service: Any) -> None:
        self.wine_catalog_service = service

    # ---------------------------------------------------------------------------
    # Food Search & Food → Wine Recommendation
    # ---------------------------------------------------------------------------
    def _normalize_food_name(self, text: str) -> str:
        """Strip accents, lowercase, replace underscores/hyphens/punctuation with spaces, and collapse whitespace."""
        if not text:
            return ""
        text = str(text).lower()
        nfkd = unicodedata.normalize("NFKD", text)
        text = "".join(c for c in nfkd if not unicodedata.combining(c))
        text = re.sub(r"[^a-z0-9\s]", " ", text)
        return re.sub(r"\s+", " ", text).strip()

    def is_valid_food_query(self, food_name: str) -> bool:
        """
        Validate whether query looks like a legitimate food dish name
        or is invalid gibberish / random characters.
        """
        if not food_name or not isinstance(food_name, str):
            return False

        clean = food_name.strip()
        if len(clean) < 2 or len(clean) > 100:
            return False

        letters = re.sub(r"[^a-zA-Z]", "", clean)
        if len(letters) < 2:
            return False

        vowels = set("aeiouyAEIOUY")
        vowel_count = sum(1 for c in letters if c in vowels)

        if len(letters) >= 3 and vowel_count == 0:
            return False

        clean_lower = clean.lower()
        smashes = ["asdfgh", "sdfghj", "dfghjk", "fghjkl", "qwerty", "wertyu", "zxcvbn", "asdfasdf"]
        for s in smashes:
            if s in clean_lower:
                return False

        if re.search(r"(.)\1{4,}", clean_lower):
            return False

        words = re.findall(r"[a-zA-Z]+", clean)
        for w in words:
            w_lower = w.lower()
            w_vowels = sum(1 for c in w_lower if c in vowels)

            if len(w) >= 4 and w_vowels == 0:
                return False

            if len(w) >= 8 and (w_vowels / len(w)) < 0.18:
                return False

        return True


    def find_food(self, food_name: str) -> Optional[pd.Series]:
        """
        Search existing food dataset for a food item using robust multi-tier matching:
        1. Exact case-insensitive & trimmed match
        2. Exact normalized match (ignoring spaces, hyphens, underscores, punctuation)
        3. Substring normalized match
        4. Token subset / set matching
        5. Spelling variation & canonicalization matching
        """
        if not food_name or not food_name.strip():
            return None

        raw_clean = food_name.strip()
        raw_lower = raw_clean.lower()
        q_norm = self._normalize_food_name(food_name)
        if not q_norm:
            return None
        q_tokens = set(q_norm.split())

        # 1. Exact case-insensitive match on raw Food_Name
        matches = self.food_df[self.food_df["Food_Name"].astype(str).str.strip().str.lower() == raw_lower]
        if not matches.empty:
            return matches.iloc[0]

        # 2. Exact normalized match
        for _, row in self.food_df.iterrows():
            f_norm = self._normalize_food_name(row.get("Food_Name", ""))
            if f_norm == q_norm:
                return row

        # 3. Substring normalized match (e.g. "butter chicken" in "Butter Chicken" or "paneer butter masala")
        for _, row in self.food_df.iterrows():
            f_norm = self._normalize_food_name(row.get("Food_Name", ""))
            if f_norm and (q_norm == f_norm or q_norm in f_norm or (len(f_norm) >= 4 and f_norm in q_norm)):
                return row

        # 4. Token subset / set matching (e.g. 'chicken' and 'biryani' in 'Hyderabadi Chicken Biryani')
        if len(q_tokens) >= 1:
            for _, row in self.food_df.iterrows():
                f_norm = self._normalize_food_name(row.get("Food_Name", ""))
                f_tokens = set(f_norm.split())
                if q_tokens.issubset(f_tokens) or (len(f_tokens) > 1 and f_tokens.issubset(q_tokens)):
                    return row

        # 5. Spelling variation & canonicalization match (e.g. biriyani -> biryani, masalla -> masala, tika -> tikka)
        def canonicalize(text_norm: str) -> str:
            res = text_norm
            res = re.sub(r'biriyani|biriyany', 'biryani', res)
            res = re.sub(r'masalla|massala', 'masala', res)
            res = re.sub(r'\btika\b', 'tikka', res)
            res = re.sub(r'\bkurma\b', 'korma', res)
            res = re.sub(r'paneer|panir', 'paneer', res)
            return res

        canon_q = canonicalize(q_norm)
        canon_q_tokens = set(canon_q.split())

        for _, row in self.food_df.iterrows():
            f_norm = self._normalize_food_name(row.get("Food_Name", ""))
            canon_f = canonicalize(f_norm)
            canon_f_tokens = set(canon_f.split())

            if canon_q == canon_f or canon_q in canon_f or canon_f in canon_q:
                return row
            if canon_q_tokens.issubset(canon_f_tokens) or (len(canon_f_tokens) > 1 and canon_f_tokens.issubset(canon_q_tokens)):
                return row

        return None

    def score_wines(self, food: pd.Series) -> pd.DataFrame:
        """Score candidate wines against food attributes."""
        wines = self.wine_df.copy()
        wines["Attribute_Score"] = 0

        # Compatibility scoring rules
        wines.loc[wines["Wine_Type"] == food["Recommended_Wine_Type"], "Attribute_Score"] += 6
        wines.loc[wines["Body"] == food["Recommended_Body"], "Attribute_Score"] += 3
        wines.loc[wines["Sweetness"] == food["Recommended_Sweetness"], "Attribute_Score"] += 2
        wines.loc[wines["Acidity"] == food["Recommended_Acidity"], "Attribute_Score"] += 2
        wines.loc[wines["Tannin"] == food["Recommended_Tannin"], "Attribute_Score"] += 2

        return wines.sort_values(by="Attribute_Score", ascending=False).head(20)

    def semantic_rank_wines(self, food: pd.Series, candidate_wines: pd.DataFrame) -> pd.DataFrame:
        """Rerank top wine candidates using sentence transformer embeddings."""
        food_idx = food.name
        food_embedding = self.food_embeddings[food_idx].reshape(1, -1)

        candidate_indices = candidate_wines.index.tolist()
        candidate_embeddings = self.wine_embeddings[candidate_indices]

        similarities = cosine_similarity(food_embedding, candidate_embeddings)[0]

        candidate_wines = candidate_wines.copy()
        candidate_wines["Semantic_Score"] = similarities

        max_attr = candidate_wines["Attribute_Score"].max()
        candidate_wines["Attribute_Normalized"] = (
            candidate_wines["Attribute_Score"] / max_attr if max_attr > 0 else 0
        )

        candidate_wines["Final_Score"] = (
            0.65 * candidate_wines["Attribute_Normalized"] +
            0.35 * candidate_wines["Semantic_Score"]
        )

        return candidate_wines.sort_values(by="Final_Score", ascending=False).head(5)

    def _apply_personalization(self, candidates: pd.DataFrame, user_id: str, item_type: str = "wine") -> pd.DataFrame:
        """Boost scores based on user analytics preferences from Node backend."""
        if not user_id: return candidates
        try:
            # Assuming Node.js backend is running on 5000
            resp = requests.get(f"http://localhost:5000/api/v1/analytics/user/{user_id}/preferences", timeout=2)
            if resp.status_code == 200:
                prefs = resp.json().get("data", {})
                top_cats = prefs.get("top_categories", [])
                top_types = prefs.get("top_types", [])
                
                candidates = candidates.copy()
                boost_mask = pd.Series(False, index=candidates.index)
                
                if item_type == "wine":
                    if top_types:
                        for t in top_types[:3]:
                            boost_mask |= candidates["Wine_Type"].str.contains(t, case=False, na=False)
                
                # Apply a 15% boost to Final_Score if preferred
                candidates.loc[boost_mask, "Final_Score"] *= 1.15
                return candidates.sort_values(by="Final_Score", ascending=False)
        except Exception as e:
            logger.warning(f"Failed to fetch personalization for user {user_id}: {e}")
            
        return candidates

    def _persist_learned_food(self, food_dict: Dict[str, Any]) -> pd.Series:
        """
        Persist learned food to learned_foods.csv and memory state.
        After saving, triggers an asynchronous background thread to fetch
        an image URL from Unsplash and write it back to learned_foods.csv.
        The recommendation itself is NOT blocked by the image lookup.
        """
        food_dict["Food_ID"] = len(self.food_df) + 1
        new_row_df = pd.DataFrame([food_dict])

        LEARNED_FOODS_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not LEARNED_FOODS_PATH.exists() or os.path.getsize(LEARNED_FOODS_PATH) == 0:
            new_row_df.to_csv(LEARNED_FOODS_PATH, index=False)
        else:
            new_row_df.to_csv(LEARNED_FOODS_PATH, mode="a", header=False, index=False)

        new_idx = len(self.food_df)
        self.food_df = pd.concat([self.food_df, new_row_df], ignore_index=True)
        food_series = self.food_df.iloc[new_idx]

        doc_text = create_food_document(food_series)
        new_embedding = self.model.encode(doc_text, convert_to_numpy=True).reshape(1, -1)
        self.food_embeddings = np.vstack([self.food_embeddings, new_embedding])

        if self.food_catalog_service and hasattr(self.food_catalog_service, "reload"):
            self.food_catalog_service.reload()

        # ── Async image enrichment for newly learned food ──────────────────
        # Does NOT block the recommendation response.
        # Uses image_service.ensure_image_for_food which:
        #   1. Checks if a valid image already exists in the CSV
        #   2. Searches Wikipedia if not
        #   3. Validates the URL (HTTP 200 + Content-Type image/*)
        #   4. Saves the verified URL back to learned_foods.csv
        food_name = food_dict.get("Food_Name", "").strip()
        cuisine   = food_dict.get("Cuisine", "").strip()
        category  = food_dict.get("Category", "").strip()
        if food_name and _IMAGE_SERVICE_AVAILABLE:
            def _enrich_food_image_bg(name: str, cuis: str, cat: str,
                                      df_ref: pd.DataFrame, catalog_svc) -> None:
                try:
                    url = ensure_image_for_food(
                        name,
                        csv_path=str(LEARNED_FOODS_PATH),
                        cuisine=cuis,
                        category=cat,
                    )
                    if url:
                        logger.info(f"[ImageService] Enriched learned food '{name}' with image")
                        # Update in-memory dataframe
                        mem_mask = df_ref["Food_Name"].str.strip().str.lower() == name.lower()
                        df_ref.loc[mem_mask, "image_url"] = url
                        # Update catalog service in-memory lookup
                        if catalog_svc and hasattr(catalog_svc, "update_image_url"):
                            catalog_svc.update_image_url(name, url)
                    else:
                        logger.debug(f"[ImageService] No image found for learned food '{name}'")
                except Exception as exc:
                    logger.warning(f"[ImageService] Background image fetch failed for food '{name}': {exc}")

            t = threading.Thread(
                target=_enrich_food_image_bg,
                args=(food_name, cuisine, category, self.food_df, self.food_catalog_service),
                daemon=True,
            )
            t.start()

        return food_series

    def recommend_wines(self, food_name: str, user_id: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
        """Generate top 5 wine recommendations for a dish (Food → Wine)."""
        # 1. Search existing dataset first using robust normalization
        food = self.find_food(food_name)

        # 2. If not found in dataset, check if query is valid dish or gibberish
        if food is None:
            if not self.is_valid_food_query(food_name):
                logger.info(f"Invalid food query rejected without calling Gemini: '{food_name}'")
                print(f"Invalid food query rejected without calling Gemini: '{food_name}'")
                return None

            # 3. Only if query is a valid unknown dish, call Gemini API
            logger.info(f"Valid unknown dish: '{food_name}'. Calling Gemini API...")
            print(f"Valid unknown dish: '{food_name}'. Calling Gemini API...")
            gemini_data = self.gemini_service.analyze_food(food_name)
            if not gemini_data:
                logger.warning(f"Gemini analysis failed for food: '{food_name}'")
                print(f"Gemini analysis failed for food: '{food_name}'")
                return None
            food = self._persist_learned_food(gemini_data)

        candidates = self.score_wines(food)
        recommendations = self.semantic_rank_wines(food, candidates)
        if user_id:
            recommendations = self._apply_personalization(recommendations, user_id, "wine").head(5)

        results = []
        for _, wine in recommendations.iterrows():
            # Read image_url from the enriched wine CSV (null if not yet enriched)
            img = str(wine.get("image_url", "")).strip()
            image_url = None if img.lower() in ("nan", "none", "") else img
            results.append({
                "wine_name": safe_str(wine.get("Wine_Name")),
                "winery": safe_str(wine.get("Winery")),
                "wine_type": safe_str(wine.get("Wine_Type")),
                "variety": safe_str(wine.get("Variety")),
                "region": safe_str(wine.get("Region")),
                "body": safe_str(wine.get("Body")),
                "sweetness": safe_str(wine.get("Sweetness")),
                "acidity": safe_str(wine.get("Acidity")),
                "tannin": safe_str(wine.get("Tannin")),
                "score": round(float(wine["Final_Score"]), 3),
                "image_url": image_url,
            })
        return results

    # ---------------------------------------------------------------------------
    # Wine Search & Wine → Food Recommendation (Reverse Pipeline)
    # ---------------------------------------------------------------------------
    def _normalize_query(self, text: str) -> str:
        """Strip accents, lowercase, and clean non-alphanumeric characters."""
        text = str(text).lower()
        nfkd = unicodedata.normalize("NFKD", text)
        text = "".join(c for c in nfkd if not unicodedata.combining(c))
        return re.sub(r"[^a-z0-9\s]", " ", text).strip()

    def find_wine(self, wine_name: str) -> Optional[pd.Series]:
        """
        Search existing wine dataset for a wine item or wine type using multi-tier matching:
        1. Exact case-insensitive / normalized match
        2. Substring normalized match
        3. Token subset matching (e.g. 'sula' + 'shiraz' in 'Sula Rasa Shiraz')
        4. Grape variety match
        5. Wine type category match ('Red', 'White', 'Rosé', 'Sparkling', 'Dessert')
        """
        name_clean = wine_name.strip()
        name_lower = name_clean.lower()
        q_norm = self._normalize_query(wine_name)
        q_tokens = set(q_norm.split())

        # 1. Exact or substring match on raw Wine_Name
        matches = self.wine_df[
            self.wine_df["Wine_Name"].str.contains(name_clean, case=False, na=False)
        ]
        if not matches.empty:
            exact = matches[matches["Wine_Name"].str.lower() == name_lower]
            if not exact.empty:
                return exact.iloc[0]
            return matches.iloc[0]

        # 2. Exact normalized match
        for _, row in self.wine_df.iterrows():
            w_norm = self._normalize_query(row["Wine_Name"])
            if w_norm == q_norm:
                return row

        # 3. Substring normalized match
        for _, row in self.wine_df.iterrows():
            w_norm = self._normalize_query(row["Wine_Name"])
            if q_norm in w_norm or (len(w_norm) > 4 and w_norm in q_norm):
                return row

        # 4. Token subset matching (all search words present in wine name)
        if len(q_tokens) > 1:
            for _, row in self.wine_df.iterrows():
                w_tokens = set(self._normalize_query(row["Wine_Name"]).split())
                if q_tokens.issubset(w_tokens):
                    return row

        # 5. Grape / Variety match (e.g. 'shiraz', 'malbec', 'sauvignon blanc', 'cabernet')
        if q_norm:
            for _, row in self.wine_df.iterrows():
                v_norm = self._normalize_query(row.get("Variety", ""))
                if v_norm and (q_norm in v_norm or v_norm in q_norm):
                    return row

        # 6. Match by Wine_Type if name matches a wine type
        wt_map = {
            "red": "Red", "red wine": "Red",
            "white": "White", "white wine": "White",
            "rosé": "Rosé", "rose": "Rosé", "rosé wine": "Rosé", "rose wine": "Rosé",
            "sparkling": "Sparkling", "sparkling wine": "Sparkling",
            "dessert": "Dessert", "dessert wine": "Dessert"
        }
        if name_lower in wt_map:
            target_type = wt_map[name_lower]
            type_matches = self.wine_df[
                self.wine_df["Wine_Type"].astype(str).str.strip().str.lower() == target_type.lower()
            ]
            if not type_matches.empty:
                return type_matches.iloc[0]

        return None


    def score_foods(self, wine: pd.Series) -> pd.DataFrame:
        """Score candidate foods against wine attributes according to compatibility rules."""
        foods = self.food_df.copy()
        foods["Attribute_Score"] = 0.0

        wine_type = str(wine.get("Wine_Type", "")).strip().casefold()
        wine_body = str(wine.get("Body", "")).strip().casefold()
        wine_sweetness = str(wine.get("Sweetness", "")).strip().casefold()
        wine_acidity = str(wine.get("Acidity", "")).strip().casefold()
        wine_tannin = str(wine.get("Tannin", "")).strip().casefold()

        foods.loc[foods["Recommended_Wine_Type"].astype(str).str.strip().str.casefold() == wine_type, "Attribute_Score"] += 5.0
        foods.loc[foods["Recommended_Body"].astype(str).str.strip().str.casefold() == wine_body, "Attribute_Score"] += 2.0
        foods.loc[foods["Recommended_Sweetness"].astype(str).str.strip().str.casefold() == wine_sweetness, "Attribute_Score"] += 2.0
        foods.loc[foods["Recommended_Acidity"].astype(str).str.strip().str.casefold() == wine_acidity, "Attribute_Score"] += 1.0
        foods.loc[foods["Recommended_Tannin"].astype(str).str.strip().str.casefold() == wine_tannin, "Attribute_Score"] += 1.0

        # Return all candidate foods with compatible score (at least matching wine type)
        # to ensure full semantic search diversity across all cuisines and dishes
        compatible = foods[foods["Attribute_Score"] >= 5.0]
        if len(compatible) < 25:
            return foods.sort_values(by="Attribute_Score", ascending=False).head(80)
        return compatible

    def semantic_rank_foods(self, wine: pd.Series, candidate_foods: pd.DataFrame) -> pd.DataFrame:
        """Rerank top food candidates using semantic similarity embeddings."""
        wine_idx = int(wine.name) if isinstance(wine.name, (int, np.integer)) else 0
        if wine_idx < len(self.wine_embeddings):
            wine_embedding = self.wine_embeddings[wine_idx].reshape(1, -1)
        else:
            doc_text = create_wine_document(wine)
            wine_embedding = self.model.encode(doc_text, convert_to_numpy=True).reshape(1, -1)

        candidate_indices = candidate_foods.index.tolist()
        candidate_embeddings = self.food_embeddings[candidate_indices]

        similarities = cosine_similarity(wine_embedding, candidate_embeddings)[0]

        candidate_foods = candidate_foods.copy()
        candidate_foods["Semantic_Score"] = similarities

        max_attr = candidate_foods["Attribute_Score"].max()
        min_attr = candidate_foods["Attribute_Score"].min()
        if max_attr > min_attr:
            candidate_foods["Attribute_Normalized"] = (
                (candidate_foods["Attribute_Score"] - min_attr) / (max_attr - min_attr)
            )
        else:
            candidate_foods["Attribute_Normalized"] = 1.0

        candidate_foods["Final_Score"] = (
            0.50 * candidate_foods["Attribute_Normalized"] +
            0.50 * candidate_foods["Semantic_Score"]
        )

        return candidate_foods.sort_values(by="Final_Score", ascending=False).head(5)

    def _persist_learned_wine(self, wine_dict: Dict[str, Any]) -> pd.Series:
        """
        Persist learned wine to datasets/learned_wines.csv and update memory state.
        After saving, triggers an asynchronous background thread to fetch
        an image URL from Unsplash and write it back to learned_wines.csv.
        The recommendation itself is NOT blocked by the image lookup.
        """
        wine_dict["Wine_ID"] = f"LW{len(self.wine_df) + 1:03d}"
        new_row_df = pd.DataFrame([wine_dict])

        LEARNED_WINES_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not LEARNED_WINES_PATH.exists() or os.path.getsize(LEARNED_WINES_PATH) == 0:
            new_row_df.to_csv(LEARNED_WINES_PATH, index=False)
        else:
            new_row_df.to_csv(LEARNED_WINES_PATH, mode="a", header=False, index=False)

        new_idx = len(self.wine_df)
        self.wine_df = pd.concat([self.wine_df, new_row_df], ignore_index=True)
        wine_series = self.wine_df.iloc[new_idx]

        doc_text = create_wine_document(wine_series)
        new_embedding = self.model.encode(doc_text, convert_to_numpy=True).reshape(1, -1)
        self.wine_embeddings = np.vstack([self.wine_embeddings, new_embedding])

        if self.wine_catalog_service and hasattr(self.wine_catalog_service, "reload"):
            self.wine_catalog_service.reload()

        # ── Async image enrichment for newly learned wine ──────────────────
        # Uses image_service.ensure_image_for_wine which validates URLs before saving.
        wine_name = wine_dict.get("Wine_Name", "").strip()
        winery    = wine_dict.get("Winery", "").strip()
        variety   = wine_dict.get("Variety", "").strip()
        if wine_name and _IMAGE_SERVICE_AVAILABLE:
            def _enrich_wine_image_bg(name: str, winery_name: str, var: str,
                                      df_ref: pd.DataFrame) -> None:
                try:
                    url = ensure_image_for_wine(
                        name,
                        csv_path=str(LEARNED_WINES_PATH),
                        winery=winery_name,
                        variety=var,
                    )
                    if url:
                        logger.info(f"[ImageService] Enriched learned wine '{name}' with image")
                        mem_mask = df_ref["Wine_Name"].str.strip().str.lower() == name.lower()
                        df_ref.loc[mem_mask, "image_url"] = url
                    else:
                        logger.debug(f"[ImageService] No image found for learned wine '{name}'")
                except Exception as exc:
                    logger.warning(f"[ImageService] Background image fetch failed for wine '{name}': {exc}")

            t = threading.Thread(
                target=_enrich_wine_image_bg,
                args=(wine_name, winery, variety, self.wine_df),
                daemon=True,
            )
            t.start()

        return wine_series

    def recommend_foods(self, wine_name: str, user_id: Optional[str] = None) -> Optional[List[Dict[str, Any]]]:
        """Generate top 5 food recommendations for a wine (Wine → Food)."""
        wine = self.find_wine(wine_name)

        if wine is None:
            print(f"Unknown wine: '{wine_name}'. Calling Gemini API...")
            gemini_data = self.gemini_service.analyze_wine(wine_name)
            if not gemini_data:
                print(f"Gemini analysis failed for wine: '{wine_name}'")
                return None
            wine = self._persist_learned_wine(gemini_data)

        candidates = self.score_foods(wine)
        recommendations = self.semantic_rank_foods(wine, candidates)
        if user_id:
            # We don't have deep user preferences for food yet, but the mechanism is ready
            pass

        results = []
        for _, food in recommendations.iterrows():
            richness_val = food.get("Fat_Level", food.get("Richness", "Medium"))
            # Read image_url from the enriched food CSV (null if not yet enriched)
            img = str(food.get("image_url", "")).strip()
            image_url = None if img.lower() in ("nan", "none", "") else img
            results.append({
                "food_name": safe_str(food.get("Food_Name")),
                "cuisine": safe_str(food.get("Cuisine")),
                "category": safe_str(food.get("Category")),
                "protein": safe_str(food.get("Protein")),
                "spice_level": safe_str(food.get("Spice_Level")),
                "richness": safe_str(richness_val, "Medium"),
                "recommended_wine_type": safe_str(food.get("Recommended_Wine_Type")),
                "score": round(float(food["Final_Score"]), 2),
                "image_url": image_url,
            })
        return results
