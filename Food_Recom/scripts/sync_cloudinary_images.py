#!/usr/bin/env python3
"""
Fetch ALL food & wine images from Cloudinary with display_name metadata,
build name->URL maps, and update the CSV datasets.
"""
import os
import sys
import json
from pathlib import Path

try:
    import cloudinary
    import cloudinary.api
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cloudinary", "-q"])
    import cloudinary
    import cloudinary.api

import pandas as pd

cloudinary.config(
    cloud_name="xfklkvdc",
    api_key=os.getenv("CLOUDINARY_API_KEY", "859612827577413"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET", "2Ssu66uaYlNspzWWLpPKDuZJ6fs"),
    secure=True,
)

BASE_DIR = Path(__file__).resolve().parent
# Handle running from scratch dir or from Food_Recom/scripts
if (BASE_DIR.parent / "processed_data").exists():
    FOOD_RECOM_DIR = BASE_DIR.parent
elif (BASE_DIR.parent.parent / "Food_Recom").exists():
    FOOD_RECOM_DIR = BASE_DIR.parent.parent / "Food_Recom"
else:
    FOOD_RECOM_DIR = Path(r"c:\Users\Gayatri\OneDrive\Desktop\FYP\good ui\Food_Recom")

FOOD_CSV = FOOD_RECOM_DIR / "processed_data" / "food_clean.csv"
WINE_CSV = FOOD_RECOM_DIR / "processed_data" / "wine_clean.csv"
FOOD_DATASET_CSV = FOOD_RECOM_DIR / "datasets" / "food_dataset.csv"
WINE_DATASET_CSV = FOOD_RECOM_DIR / "datasets" / "wine_dataset.csv"


def fetch_all_from_asset_folder(folder_path):
    """Fetch ALL images from a Cloudinary asset folder with display_name."""
    all_resources = []
    next_cursor = None
    page = 0
    while True:
        page += 1
        kwargs = {"max_results": 500, "tags": True, "context": True}
        if next_cursor:
            kwargs["next_cursor"] = next_cursor
        try:
            result = cloudinary.api.resources_by_asset_folder(folder_path, **kwargs)
        except Exception as e:
            print("ERROR fetching %s: %s" % (folder_path, e))
            return []
        resources = result.get("resources", [])
        all_resources.extend(resources)
        total = result.get("total_count", "?")
        print("  %s page %d: got %d (total in folder: %s)" % (folder_path, page, len(resources), total))
        next_cursor = result.get("next_cursor")
        if not next_cursor or not resources:
            break
    return all_resources


def build_name_url_map(resources):
    """Build a display_name -> URL mapping from Cloudinary resources."""
    name_map = {}
    for r in resources:
        display_name = r.get("display_name", "")
        url = r.get("secure_url", "")
        if display_name and url and display_name != r.get("public_id", ""):
            name_map[display_name] = url
    return name_map


def normalize_name(name):
    """Normalize a name for fuzzy matching."""
    import re
    s = str(name).strip().lower()
    # Replace special chars
    s = s.replace("_", " ").replace("-", " ")
    # Remove accents for matching (simple approach)
    replacements = {
        "e": "e", "a": "a", "i": "i", "o": "o", "u": "u",
    }
    # Remove extra whitespace
    s = re.sub(r"\s+", " ", s).strip()
    return s


def match_food_images(food_df, food_map):
    """Match food names from CSV to Cloudinary display_name -> URL."""
    matched = 0
    unmatched = []

    # Build normalized lookup
    norm_map = {}
    for display_name, url in food_map.items():
        norm = normalize_name(display_name)
        norm_map[norm] = url

    for idx, row in food_df.iterrows():
        food_name = str(row["Food_Name"]).strip()
        food_norm = normalize_name(food_name)

        # Direct match
        if food_norm in norm_map:
            food_df.at[idx, "image_url"] = norm_map[food_norm]
            matched += 1
            continue

        # Try partial matching
        found = False
        for norm_key, url in norm_map.items():
            if food_norm in norm_key or norm_key in food_norm:
                food_df.at[idx, "image_url"] = url
                matched += 1
                found = True
                break

        if not found:
            unmatched.append(food_name)

    return food_df, matched, unmatched


def match_wine_images(wine_df, wine_map):
    """Match wine names from CSV to Cloudinary display_name -> URL."""
    matched = 0
    unmatched = []

    # Build normalized lookup
    norm_map = {}
    for display_name, url in wine_map.items():
        norm = normalize_name(display_name)
        norm_map[norm] = url

    for idx, row in wine_df.iterrows():
        wine_name = str(row["Wine_Name"]).strip()
        wine_norm = normalize_name(wine_name)

        # Direct match
        if wine_norm in norm_map:
            wine_df.at[idx, "image_url"] = str(norm_map[wine_norm])
            matched += 1
            continue

        # Try matching by removing common words and checking parts
        found = False
        for norm_key, url in norm_map.items():
            # Check if normalized wine name words are in the key
            if wine_norm in norm_key or norm_key in wine_norm:
                wine_df.at[idx, "image_url"] = url
                matched += 1
                found = True
                break

        if not found:
            # Try word-overlap matching (at least 2 shared significant words)
            wine_words = set(wine_norm.split()) - {"wine", "the", "de", "la", "le", "du", "des", "a", "an"}
            for norm_key, url in norm_map.items():
                key_words = set(norm_key.split()) - {"wine", "the", "de", "la", "le", "du", "des", "a", "an"}
                shared = wine_words & key_words
                if len(shared) >= 2 and len(shared) >= len(wine_words) * 0.5:
                    wine_df.at[idx, "image_url"] = str(url)
                    matched += 1
                    found = True
                    break

        if not found:
            unmatched.append(wine_name)

    return wine_df, matched, unmatched


def main():
    print("=" * 70)
    print("  Cloudinary Image Sync - Food & Wine")
    print("=" * 70)
    print()

    # 1. Fetch from Cloudinary
    print("Step 1: Fetching images from Cloudinary...")
    food_resources = fetch_all_from_asset_folder("Vinosphere/food")
    wine_resources = fetch_all_from_asset_folder("Vinosphere/wines")

    # 2. Build name->URL maps
    food_map = build_name_url_map(food_resources)
    wine_map = build_name_url_map(wine_resources)

    print()
    print("  Food images with display_name: %d / %d" % (len(food_map), len(food_resources)))
    print("  Wine images with display_name: %d / %d" % (len(wine_map), len(wine_resources)))

    # Save the maps for reference
    maps_output = {
        "food_map": food_map,
        "wine_map": wine_map,
    }
    maps_file = FOOD_RECOM_DIR / "processed_data" / "cloudinary_name_url_maps.json"
    with open(maps_file, "w", encoding="utf-8") as f:
        json.dump(maps_output, f, indent=2, ensure_ascii=False)
    print("  Saved maps to: %s" % maps_file.name)

    # 3. Load CSVs
    print()
    print("Step 2: Matching images to CSV entries...")

    if FOOD_CSV.exists():
        food_df = pd.read_csv(FOOD_CSV)
        if "image_url" not in food_df.columns:
            food_df["image_url"] = ""
        food_df, food_matched, food_unmatched = match_food_images(food_df, food_map)
        food_df.to_csv(FOOD_CSV, index=False)
        print()
        print("  FOOD: Matched %d / %d" % (food_matched, len(food_df)))
        print("  Unmatched foods (%d):" % len(food_unmatched))
        for name in food_unmatched[:20]:
            print("    - %s" % name)
        if len(food_unmatched) > 20:
            print("    ... and %d more" % (len(food_unmatched) - 20))

        # Sync to datasets/food_dataset.csv
        if FOOD_DATASET_CSV.exists():
            ds_df = pd.read_csv(FOOD_DATASET_CSV)
            if "image_url" not in ds_df.columns:
                ds_df["image_url"] = ""
            url_lookup = dict(zip(food_df["Food_Name"].str.strip(), food_df["image_url"].fillna("")))
            ds_df["image_url"] = ds_df["Food_Name"].str.strip().map(url_lookup).fillna("")
            ds_df.to_csv(FOOD_DATASET_CSV, index=False)
            print("  Synced -> %s" % FOOD_DATASET_CSV.name)
    else:
        print("  FOOD CSV not found: %s" % FOOD_CSV)

    if WINE_CSV.exists():
        wine_df = pd.read_csv(WINE_CSV)
        if "image_url" not in wine_df.columns:
            wine_df["image_url"] = ""
        wine_df["image_url"] = wine_df["image_url"].fillna("").astype(str)
        wine_df, wine_matched, wine_unmatched = match_wine_images(wine_df, wine_map)
        wine_df.to_csv(WINE_CSV, index=False)
        print()
        print("  WINE: Matched %d / %d" % (wine_matched, len(wine_df)))
        print("  Unmatched wines (%d):" % len(wine_unmatched))
        for name in wine_unmatched[:20]:
            print("    - %s" % name)
        if len(wine_unmatched) > 20:
            print("    ... and %d more" % (len(wine_unmatched) - 20))

        # Sync to datasets/wine_dataset.csv
        if WINE_DATASET_CSV.exists():
            ds_df = pd.read_csv(WINE_DATASET_CSV)
            if "image_url" not in ds_df.columns:
                ds_df["image_url"] = ""
            url_lookup = dict(zip(wine_df["Wine_Name"].str.strip(), wine_df["image_url"].fillna("")))
            ds_df["image_url"] = ds_df["Wine_Name"].str.strip().map(url_lookup).fillna("")
            ds_df.to_csv(WINE_DATASET_CSV, index=False)
            print("  Synced -> %s" % WINE_DATASET_CSV.name)
    else:
        print("  WINE CSV not found: %s" % WINE_CSV)

    # Summary
    print()
    print("=" * 70)
    print("  SYNC COMPLETE")
    print("=" * 70)
    print("  Food: %d matched out of %d CSV entries (%d Cloudinary images)" % (
        food_matched if FOOD_CSV.exists() else 0,
        len(food_df) if FOOD_CSV.exists() else 0,
        len(food_map),
    ))
    print("  Wine: %d matched out of %d CSV entries (%d Cloudinary images)" % (
        wine_matched if WINE_CSV.exists() else 0,
        len(wine_df) if WINE_CSV.exists() else 0,
        len(wine_map),
    ))
    print("=" * 70)
    print()


if __name__ == "__main__":
    main()
