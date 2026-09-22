# services/food_catalog_service.py
# ---------------------------------------------------------------------------
# Derives clean, human-readable food categories and dish lists from food_clean.csv
# and datasets/learned_foods.csv.
#
# Uses a multi-attribute taxonomy classification engine (dish names, main ingredients,
# protein metadata, meal types, and vegetarian status) to place every dish into
# exactly one display category.
# ---------------------------------------------------------------------------

import re
import os
import pandas as pd
from pathlib import Path

# Ordered display list — controls the pill order returned to the frontend
CATEGORY_DISPLAY_ORDER = [
    "Chicken",
    "Mutton & Lamb",
    "Beef & Pork",
    "Seafood",
    "Paneer & Cheese",
    "Vegetarian",
    "Eggs",
    "Rice & Biryani",
    "Street Food & Snacks",
    "Desserts",
    "Duck",
    "Other",
]

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "processed_data" / "food_clean.csv"
LEARNED_CSV_PATH = BASE_DIR / "datasets" / "learned_foods.csv"


def _has_word(text: str, words: list[str]) -> bool:
    """Check if any word in `words` appears as a distinct word in `text`."""
    for w in words:
        if re.search(r"\b" + re.escape(w) + r"\b", text):
            return True
    return False


def classify_dish(row: pd.Series) -> str:
    """
    Classify a dish row into exactly one display category based on
    dish name, ingredients, protein metadata, category, and vegetarian status.
    """
    name = str(row.get("Food_Name", "")).strip()
    name_l = name.lower()
    ingredients = str(row.get("Main_Ingredients", "")).lower() if pd.notna(row.get("Main_Ingredients")) else ""
    protein = str(row.get("Protein", "")).lower() if pd.notna(row.get("Protein")) else ""
    cat_raw = str(row.get("Category", "")).lower() if pd.notna(row.get("Category")) else ""
    meal_type = str(row.get("Meal_Type", "")).lower() if pd.notna(row.get("Meal_Type")) else ""
    veg = str(row.get("Vegetarian", "")).strip().lower() == "yes"

    # Explicit dish overrides for known edge cases
    if any(k in name_l for k in ["appam with stew", "kerala appam with stew"]):
        return "Street Food & Snacks"
    if name_l == "avgolemono soup":
        return "Eggs"
    if name_l == "couscous royale":
        return "Street Food & Snacks"
    if name_l == "farofa":  # Contains bacon bits
        return "Beef & Pork"
    if name_l in ["french onion soup", "sichuan hot pot"]:
        return "Beef & Pork"
    if name_l == "miso soup":
        return "Seafood"
    if name_l in ["modur pulav", "kashmiri modur pulao"]:
        return "Rice & Biryani"
    if name_l == "escargots de bourgogne":
        return "Seafood"

    # 1. Duck
    if _has_word(name_l, ["duck"]) or _has_word(protein, ["duck"]) or (_has_word(ingredients, ["duck"]) and "sauce" not in name_l):
        return "Duck"

    # 2. Rice & Biryani
    rice_words = [
        "biryani", "biriyani", "pulao", "pulav", "fried rice", "risotto", "paella", "jambalaya",
        "koshari", "tehri", "khichdi", "curd rice", "lemon rice", "tamarind rice",
        "puliyodarai", "bisi bele bath", "jeera rice", "chawal", "jollof rice",
        "modur pulav", "arroz", "nasi goreng", "nasi lemak", "pilaf", "pulihora", "pakhala bhata",
        "yangzhou fried rice", "bibimbap", "com tam", "sawhchiar", "mujadara", "chirashi", "unagi don",
    ]
    if _has_word(name_l, rice_words) or (cat_raw in ["rice", "rice dish", "rice dishes"] and "rice" in ingredients):
        return "Rice & Biryani"

    # 3. Desserts
    dessert_names = [
        "gulab jamun", "rasgulla", "mishti doi", "mysore pak", "bebinca", "phirni", "kheer",
        "baklava", "tiramisu", "churros", "gelato", "crème brûlée", "creme brulee", "key lime pie",
        "turkish kunefe", "payasam", "kulfi", "halwa", "jalebi", "laddoo", "ladoo", "modak",
        "rasmalai", "puran poli", "rabri", "falooda", "ghevar", "double ka meetha", "basundi",
        "sandesh", "imarti", "malpua", "shrikhand", "chhena gaja", "pitha", "gajar halwa",
        "soan papdi", "kalakand", "gujiya", "rosogolla", "chocolate", "ice cream",
        "pudding", "tart", "sweet", "brownie", "mousse", "donut", "doughnut",
        "waffle", "soufflé", "souffle", "cheesecake", "cannoli", "macaron", "panna cotta",
        "shahi tukda", "pedha", "peda", "barfi", "burfi", "payas", "apfelstrudel",
        "black forest cake", "brigadeiro", "clafoutis aux cerises", "crema catalana", "eton mess",
        "galaktoboureko", "mango sticky rice", "mawa kachori", "pastel de nata", "sticky toffee pudding",
        "tarte tatin", "tres leches cake", "turkish delight",
    ]
    if (meal_type == "dessert" or cat_raw in ["dessert", "desserts"] or _has_word(name_l, dessert_names)) and name_l not in ["cornish pasty", "shepherd's pie", "quiche lorraine", "spanakopita", "pretzel with mustard", "manakish za'atar", "pão de queijo"]:
        if veg or not _has_word(name_l, ["chicken", "beef", "pork", "mutton", "lamb", "fish", "prawn", "shrimp"]):
            return "Desserts"

    # 4. Seafood
    seafood_words = [
        "fish", "prawn", "prawns", "shrimp", "shrimps", "lobster", "crab", "crabs",
        "clam", "clams", "octopus", "squid", "eel", "salmon", "cod", "anchovy", "anchovies",
        "sea bass", "hilsa", "tuna", "ceviche", "caldeirada", "marisco", "otak-otak",
        "vatapá", "vatapa", "macher", "masor", "pomfret", "surmai", "rohu", "katla",
        "calamari", "mussel", "mussels", "scallop", "scallops", "caviar", "oyster", "oysters",
        "ilish", "chingri", "chepala", "bangda", "solkadhi prawns", "royyala", "chungdi", "gambas", "snail", "escargot",
    ]
    if _has_word(name_l, seafood_words) or _has_word(protein, ["fish", "prawn", "shrimp", "lobster", "crab", "clam", "octopus", "eel", "seafood", "anchovy", "cod", "sea bass", "tuna", "hilsa", "snail"]):
        return "Seafood"

    # 5. Chicken
    if _has_word(name_l, ["chicken", "murg", "murgh"]) or _has_word(protein, ["chicken"]):
        if "duck" not in name_l and "mutton" not in name_l and "lamb" not in name_l:
            return "Chicken"

    # 6. Mutton & Lamb
    if _has_word(name_l, ["mutton", "lamb", "goat", "gosht", "rogan josh", "galouti", "seekh kebab", "haleem", "salli boti", "laal maas", "kosha mangsho"]) or _has_word(protein, ["mutton", "lamb"]):
        return "Mutton & Lamb"

    # 7. Beef & Pork
    beef_pork_words = [
        "beef", "pork", "bacon", "ham", "sausage", "brisket", "vindaloo", "ropa vieja",
        "asado", "steak", "bangers", "pandi curry", "chouriço", "chorizo", "pide",
        "goulash", "borscht", "lomo saltado", "bobotie", "cheesesteak", "carnitas",
        "prosciutto", "pancetta", "pork vindaloo", "goan pork vindaloo", "bulgogi",
        "samgyeopsal", "tonkatsu", "char siu", "pork belly", "ribeye", "picanha",
    ]
    if (_has_word(name_l, beef_pork_words) or _has_word(protein, ["beef", "pork", "veal", "ham", "bacon", "chorizo"])) and name_l not in ["himachali dham", "himachali dham (rajma madra)", "khaman dhokla"]:
        if veg is False:
            return "Beef & Pork"

    # 8. Paneer & Cheese
    paneer_cheese_words = ["paneer", "cheese", "khachapuri", "halloumi", "quesadilla", "queso", "mozzarella", "ricotta", "feta", "parmesan", "fondue", "palak paneer", "paneer tikka", "shahi paneer", "chiles rellenos"]
    if _has_word(name_l, paneer_cheese_words) or _has_word(protein, ["paneer", "cottage cheese"]) or (_has_word(protein, ["cheese", "feta", "parmesan", "ricotta"]) and veg):
        if not _has_word(name_l, ["pizza", "burger", "pasta"]):
            return "Paneer & Cheese"

    # 9. Eggs
    if (_has_word(name_l, ["egg", "eggs", "omelette", "bhurji", "frittata", "shakshouka", "shakshuka", "tamagoyaki"]) or protein in ["egg", "eggs", "egg/dairy", "dairy/egg"]) and not veg:
        if not _has_word(name_l, ["cake", "pie", "tart", "pudding", "custard", "noodle", "ramen", "pad thai"]):
            return "Eggs"

    # 10. Street Food & Snacks
    snack_words = [
        "pani puri", "samosa", "vada pav", "pav bhaji", "bhel puri", "chaat", "kachori",
        "momos", "spring roll", "spring rolls", "taco", "tacos", "nachos", "fries", "currywurst",
        "acarajé", "acaraje", "pakora", "pakoda", "bhajji", "bhajia", "dhokla", "khandvi",
        "misal pav", "dosa", "idli", "uttapam", "appam", "roll", "rolls", "sandwich",
        "croquette", "falafel", "hummus", "pita", "empanada", "dim sum",
        "bao", "gyoza", "skewers", "satay", "pretzel", "simit", "bruschetta",
        "patatas bravas", "bafauri", "dabeli", "dahi bhalla", "muthiya", "litti chokha",
        "ragi mudde", "akki roti", "thepla", "koki", "chilka roti", "sarva pindi",
        "bruschetta al pomodoro", "elote", "guacamole", "handvo", "stuffed grape leaves",
        "medu vada", "melitzanosalata", "sopes", "tzatziki with pita", "zaalouk", "pão de queijo",
        "cornish pasty", "spanakopita", "manakish za'atar", "pretzel with mustard", "chow mein", "kathi roll",
        "kothu parotta",
    ]
    if cat_raw in ["street food", "snack", "snacks"] or _has_word(name_l, snack_words):
        return "Street Food & Snacks"

    # 11. Vegetarian
    if veg or "plant" in protein or "lentil" in protein or "dal" in protein or "veg" in protein:
        return "Vegetarian"

    return "Other"


class FoodCatalogService:
    """
    Provides food categories and dish lists derived dynamically from
    food_clean.csv and datasets/learned_foods.csv.
    """

    def __init__(self) -> None:
        self.reload()

    def reload(self) -> None:
        """Reload datasets and rebuild category map."""
        base_df = pd.read_csv(CSV_PATH)
        if LEARNED_CSV_PATH.exists() and os.path.getsize(LEARNED_CSV_PATH) > 0:
            try:
                learned_df = pd.read_csv(LEARNED_CSV_PATH)
                self._df = pd.concat([base_df, learned_df], ignore_index=True)
            except Exception:
                self._df = base_df
        else:
            self._df = base_df

        self._category_map: dict[str, list[str]] = self._build_map()

    # ------------------------------------------------------------------
    def _build_map(self) -> dict[str, list[str]]:
        """Group Food_Name values by display category after classification."""
        mapping: dict[str, list[str]] = {}
        # Also build _row_lookup for full-object access
        self._row_lookup: dict[str, dict] = {}

        for _, row in self._df.iterrows():
            name = str(row["Food_Name"]).strip()
            if not name:
                continue
            cat = classify_dish(row)
            mapping.setdefault(cat, [])
            if name not in mapping[cat]:
                mapping[cat].append(name)

            # Store full row data for image/metadata lookups
            if name not in self._row_lookup:
                # Normalise image_url
                img = str(row.get("image_url", "")).strip()
                if img.lower() in ("nan", "none", ""):
                    img = None
                self._row_lookup[name] = {
                    "food_name": name,
                    "cuisine": str(row.get("Cuisine", "")).strip(),
                    "category": cat,
                    "vegetarian": str(row.get("Vegetarian", "")).strip(),
                    "spice_level": str(row.get("Spice_Level", "")).strip(),
                    "image_url": img,
                }

        # Sort dishes alphabetically within each category and eliminate duplicates
        for cat in mapping:
            mapping[cat] = sorted(list(set(mapping[cat])))
        return mapping

    # ------------------------------------------------------------------
    def get_categories(self) -> list[str]:
        """
        Return all 12 display categories in exact CATEGORY_DISPLAY_ORDER.
        """
        return list(CATEGORY_DISPLAY_ORDER)

    # ------------------------------------------------------------------
    def get_foods_by_category(self, category: str) -> list[str]:
        """
        Return the sorted list of dish NAMES (strings) for a given category.
        Preserved for backward compatibility.
        Returns an empty list if the category is unknown.
        """
        return self._category_map.get(category, [])

    # ------------------------------------------------------------------
    def get_foods_by_category_objects(self, category: str) -> list[dict]:
        """
        Return full dish objects for a given category.
        Each object has: food_name, cuisine, category, vegetarian,
                         spice_level, image_url (None if not yet enriched).
        Returns an empty list if the category is unknown.
        """
        names = self._category_map.get(category, [])
        return [self._row_lookup[n] for n in names if n in self._row_lookup]

    # ------------------------------------------------------------------
    def get_image_url(self, food_name: str) -> str | None:
        """
        Return the image_url for a specific food name, or None if unavailable.
        """
        entry = self._row_lookup.get(food_name.strip())
        return entry["image_url"] if entry else None

    # ------------------------------------------------------------------
    def update_image_url(self, food_name: str, image_url: str) -> None:
        """
        Update image_url in the in-memory row lookup.
        Called by the background image-enrichment thread when a new URL is found.
        """
        name = food_name.strip()
        if name in self._row_lookup:
            self._row_lookup[name]["image_url"] = image_url if image_url else None

    # ------------------------------------------------------------------
    def get_food_record(self, food_name: str) -> pd.Series | None:
        """
        Return the full pandas Series for a given food name.
        """
        name = food_name.strip()
        rows = self._df[self._df["Food_Name"].str.strip() == name]
        if not rows.empty:
            return rows.iloc[0]
        return None
