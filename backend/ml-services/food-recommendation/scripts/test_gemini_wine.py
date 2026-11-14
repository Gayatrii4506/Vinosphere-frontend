import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT_DIR))

from services.recommendation_engine import RecommendationEngine

def test_unknown_wine():
    engine = RecommendationEngine()
    
    # Test unknown wine name
    wine_name = "Château Margaux Premier Grand Cru"
    print(f"\n--- Testing Unknown Wine: '{wine_name}' ---")
    recommendations = engine.recommend_foods(wine_name)
    print(f"Returned {len(recommendations) if recommendations else 0} recommendations for '{wine_name}':")
    for r in recommendations:
        print(" ", r)

    # Verify persistent learned_wines.csv contents
    learned_csv = ROOT_DIR / "datasets" / "learned_wines.csv"
    if learned_csv.exists():
        print(f"\nlearned_wines.csv size: {learned_csv.stat().st_size} bytes")
        with open(learned_csv, "r", encoding="utf-8") as f:
            print("Content:\n", f.read())

if __name__ == "__main__":
    test_unknown_wine()
