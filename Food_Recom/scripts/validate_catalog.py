# scripts/validate_catalog.py
# ---------------------------------------------------------------------------
# Deep validation script to verify food catalog categorization purity across
# all 12 display categories. Checks for cross-category contamination,
# proper sorting, deduplication, and reports suspicious entries.
# ---------------------------------------------------------------------------

import sys
import re
import pandas as pd
from pathlib import Path

# Add project root directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from services.food_catalog_service import FoodCatalogService, classify_dish, CATEGORY_DISPLAY_ORDER

def validate_catalog():
    print("==========================================================")
    print("          FOOD CATALOG TAXONOMY VALIDATION REPORT          ")
    print("==========================================================\n")

    catalog_service = FoodCatalogService()
    df = pd.read_csv("processed_data/food_clean.csv")

    categories = catalog_service.get_categories()
    print(f"Total Categories: {len(categories)}")
    assert categories == CATEGORY_DISPLAY_ORDER, f"Categories mismatch! Expected: {CATEGORY_DISPLAY_ORDER}, got: {categories}"

    total_dishes_processed = 0
    all_assigned_dishes = set()
    suspicious_flags = []

    # Category purity rule sets for automated detection of contamination
    purity_rules = {
        "Chicken": {
            "forbidden": ["paneer", "mutton", "lamb", "beef", "pork", "fish", "prawn", "shrimp"],
        },
        "Mutton & Lamb": {
            "forbidden": ["chicken", "beef", "pork", "fish", "prawn", "shrimp", "paneer"],
        },
        "Beef & Pork": {
            "forbidden": ["chicken", "mutton", "fish", "prawn", "shrimp", "paneer"],
        },
        "Seafood": {
            "forbidden": ["chicken", "mutton", "beef", "pork", "paneer"],
        },
        "Paneer & Cheese": {
            "forbidden": ["chicken", "mutton", "beef", "pork", "fish", "prawn", "shrimp", "duck"],
        },
        "Vegetarian": {
            "forbidden": ["chicken", "mutton", "beef", "pork", "fish", "prawn", "shrimp", "duck", "bacon", "ham"],
        },
        "Eggs": {
            "forbidden": ["chicken", "mutton", "beef", "pork", "fish", "prawn", "shrimp"],
        },
        "Rice & Biryani": {
            "forbidden": [],
        },
        "Street Food & Snacks": {
            "forbidden": [],
        },
        "Desserts": {
            "forbidden": ["chicken", "mutton", "beef", "pork", "fish", "prawn", "shrimp"],
        },
        "Duck": {
            "forbidden": ["chicken", "fish", "prawn", "shrimp"],
        },
        "Other": {
            "forbidden": [],
        }
    }

    for cat in categories:
        foods = catalog_service.get_foods_by_category(cat)
        total_dishes_processed += len(foods)
        
        # Verify deduplication
        assert len(foods) == len(set(foods)), f"Duplicates found in category '{cat}'!"

        # Verify alphabetical sorting
        assert foods == sorted(foods), f"Category '{cat}' is not sorted alphabetically!"

        print(f"[{cat}] - {len(foods)} dishes")

        rules = purity_rules.get(cat, {})
        forbidden_keywords = rules.get("forbidden", [])
        
        for food_name in foods:
            all_assigned_dishes.add(food_name)
            food_l = food_name.lower()
            
            # Check for forbidden keywords using word boundaries
            for fk in forbidden_keywords:
                if re.search(r'\b' + re.escape(fk) + r'\b', food_l):
                    suspicious_flags.append((cat, food_name, f"Contains forbidden keyword '{fk}'"))

    print("\n----------------------------------------------------------")
    print(f"Total Unique Dishes Categorized: {len(all_assigned_dishes)} / {len(df)}")
    assert len(all_assigned_dishes) == len(df), f"Mismatch in total dataset count! {len(all_assigned_dishes)} vs {len(df)}"

    print("----------------------------------------------------------")
    if suspicious_flags:
        print(f"[WARNING] SUSPICIOUS DISHES FLAGGED FOR REVIEW ({len(suspicious_flags)}):")
        for cat, dish, reason in suspicious_flags:
            print(f"  * Category [{cat}]: '{dish}' -> {reason}")
    else:
        print("[OK] ZERO MISCLASSIFICATIONS FLAGGED! All categories are 100% pure!")
    print("==========================================================\n")

if __name__ == "__main__":
    validate_catalog()
