# services/recommender.py
# ---------------------------------------------------------------------------
# Legacy wrapper for Food → Wine Recommendation Engine.
# Uses unified RecommendationEngine under the hood.
# ---------------------------------------------------------------------------

from typing import Optional, List, Dict, Any
from services.recommendation_engine import RecommendationEngine, create_food_document


class WineRecommender:
    """
    Food → Wine recommender preserving legacy signature.
    Delegates recommendation logic to RecommendationEngine.
    """

    def __init__(self, catalog_service: Optional[Any] = None, engine: Optional[RecommendationEngine] = None) -> None:
        if engine:
            self.engine = engine
        else:
            self.engine = RecommendationEngine(food_catalog_service=catalog_service)

    def set_catalog_service(self, catalog_service: Any) -> None:
        self.engine.set_food_catalog_service(catalog_service)

    def find_food(self, food_name: str) -> Optional[Any]:
        return self.engine.find_food(food_name)

    def recommend(self, food_name: str) -> Optional[List[Dict[str, Any]]]:
        return self.engine.recommend_wines(food_name)