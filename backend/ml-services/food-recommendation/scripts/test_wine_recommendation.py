import sys
from pathlib import Path

# Add project root to path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from services.recommendation_engine import RecommendationEngine

def test_recommendations():
    print("Initializing RecommendationEngine...")
    engine = RecommendationEngine()

    print("\n--- Test 1: Food -> Wine (Known Food: Butter Chicken) ---")
    wines = engine.recommend_wines("Butter Chicken")
    print(f"Returned {len(wines) if wines else 0} wine recommendations:")
    for w in wines[:3]:
        print(" ", w)

    print("\n--- Test 2: Wine -> Food (Known Wine: Sula Riesling) ---")
    foods = engine.recommend_foods("Sula Riesling")
    print(f"Returned {len(foods) if foods else 0} food recommendations:")
    for f in foods:
        print(" ", f)

    print("\n--- Test 3: Wine -> Food (Known Wine: Grover Zampa La Reserve) ---")
    foods_grover = engine.recommend_foods("Grover Zampa La Reserve")
    print(f"Returned {len(foods_grover) if foods_grover else 0} food recommendations:")
    for f in foods_grover:
        print(" ", f)

if __name__ == "__main__":
    test_recommendations()
