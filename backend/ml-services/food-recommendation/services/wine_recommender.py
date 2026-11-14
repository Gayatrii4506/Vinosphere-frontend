# services/wine_recommender.py
# ---------------------------------------------------------------------------
# Reverse Recommendation Pipeline (Wine → Food)
# ---------------------------------------------------------------------------

from typing import Optional, List, Dict, Any
from services.recommendation_engine import RecommendationEngine


class FoodRecommender:
    """
    Recommends top compatible food dishes for a given wine.
    Wraps the unified RecommendationEngine.
    """

    def __init__(self, engine: Optional[RecommendationEngine] = None, wine_catalog_service: Optional[Any] = None) -> None:
        if engine:
            self.engine = engine
        else:
            self.engine = RecommendationEngine(wine_catalog_service=wine_catalog_service)

    def recommend(self, wine_name: str) -> Optional[List[Dict[str, Any]]]:
        """Recommend top foods for a given wine name."""
        return self.engine.recommend_foods(wine_name)
