#!/usr/bin/env python3
# scripts/add_food_images.py
# ---------------------------------------------------------------------------
# Enriches the food dataset CSV files with image_url values from Unsplash.
#
# Usage
# -----
#   # Test mode: process only 10 unique foods
#   python scripts/add_food_images.py --limit 10
#
#   # Process only rows where image_url is still empty
#   python scripts/add_food_images.py --missing-only
#
#   # Full dataset (all unique foods)
#   python scripts/add_food_images.py
#
# What it modifies
# ----------------
#   processed_data/food_clean.csv   ← primary file used by the engine
#   datasets/food_dataset.csv       ← original dataset kept in sync
#
# Backups are created before any write:
#   processed_data/food_clean.csv.bak
#   datasets/food_dataset.csv.bak
#
# Prerequisites
# -------------
#   pip install requests pandas python-dotenv
#   UNSPLASH_ACCESS_KEY must be set in Food_Recom/.env
# ---------------------------------------------------------------------------

from __future__ import annotations

import argparse
import logging
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Optional

import pandas as pd
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Path setup — allow running from any working directory
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPT_DIR.parent

# Load .env
env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path, override=True)

# Put the project root on sys.path so we can import services/
sys.path.insert(0, str(BASE_DIR))

from services.image_service import search_food_image, validate_image_url

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Dataset paths
# ---------------------------------------------------------------------------
FOOD_CLEAN_PATH = BASE_DIR / "processed_data" / "food_clean.csv"
FOOD_DATASET_PATH = BASE_DIR / "datasets" / "food_dataset.csv"

# Column name for food names in both CSVs
FOOD_NAME_COLUMN = "Food_Name"
IMAGE_URL_COLUMN = "image_url"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _backup(csv_path: Path) -> None:
    """Create a .bak copy of the CSV before modifying it."""
    bak_path = csv_path.with_suffix(".csv.bak")
    shutil.copy2(csv_path, bak_path)
    logger.info(f"Backup created: {bak_path}")


def _detect_food_name_column(df: pd.DataFrame) -> str:
    """Auto-detect the food name column in the dataframe."""
    candidates = [FOOD_NAME_COLUMN, "food_name", "name", "dish_name", "Food", "dish"]
    for col in candidates:
        if col in df.columns:
            return col
    raise ValueError(
        f"Cannot find a food-name column in dataset. "
        f"Available columns: {list(df.columns)}"
    )


def _ensure_image_url_column(df: pd.DataFrame) -> pd.DataFrame:
    """Add image_url column if it does not exist."""
    if IMAGE_URL_COLUMN not in df.columns:
        df[IMAGE_URL_COLUMN] = ""
    else:
        # Normalise NaN → empty string
        df[IMAGE_URL_COLUMN] = df[IMAGE_URL_COLUMN].fillna("").astype(str)
    return df


def _load_csv_safely(path: Path) -> Optional[pd.DataFrame]:
    """Load a CSV with error handling. Returns None if file is missing/corrupt."""
    if not path.exists():
        logger.warning(f"File not found, skipping: {path}")
        return None
    try:
        df = pd.read_csv(path)
        logger.info(f"Loaded {len(df)} rows from {path.name}")
        return df
    except Exception as exc:
        logger.error(f"Failed to read {path}: {exc}")
        return None


# ---------------------------------------------------------------------------
# Core enrichment logic
# ---------------------------------------------------------------------------

def enrich_food_csv(
    df: pd.DataFrame,
    name_col: str,
    limit: Optional[int] = None,
    missing_only: bool = False,
) -> tuple[pd.DataFrame, dict]:
    """
    Add or fill the image_url column for unique food names.

    Returns:
        (enriched_df, stats_dict)
    """
    df = _ensure_image_url_column(df)

    # Collect unique food names that need processing
    if missing_only:
        needs_image = df[df[IMAGE_URL_COLUMN].str.strip() == ""][name_col].dropna().unique().tolist()
        logger.info(f"--missing-only mode: {len(needs_image)} foods without image_url")
    else:
        needs_image = df[name_col].dropna().unique().tolist()
        logger.info(f"Unique foods in dataset: {len(needs_image)}")

    if limit:
        needs_image = needs_image[:limit]
        logger.info(f"--limit {limit} applied: processing {len(needs_image)} foods")

    # Build url_cache from rows that already have a URL (avoids re-searching)
    url_cache: dict[str, str] = {}
    existing_mask = df[IMAGE_URL_COLUMN].str.strip() != ""
    for _, row in df[existing_mask].iterrows():
        food_name = str(row[name_col]).strip()
        url = str(row[IMAGE_URL_COLUMN]).strip()
        if food_name and url:
            url_cache[food_name] = url

    # Stats
    total = len(needs_image)
    found = 0
    missing = 0
    api_calls = 0
    reused = 0

    print(f"\n{'='*60}")
    print(f"  Food Image Enrichment — {total} unique foods to process")
    print(f"{'='*60}\n")

    for i, food_name in enumerate(needs_image, start=1):
        food_name_clean = str(food_name).strip()
        if not food_name_clean:
            continue

        print(f"Processing {i}/{total}: {food_name_clean}", end=" ... ", flush=True)

        # Check in-process cache first
        if food_name_clean in url_cache:
            url = url_cache[food_name_clean]
            if url:
                print("Existing URL reused")
                reused += 1
                found += 1
            else:
                print("Previously searched — no image")
                missing += 1
            # Apply to all matching rows
            mask = df[name_col].str.strip() == food_name_clean
            df.loc[mask, IMAGE_URL_COLUMN] = url
            continue

        # Call image service (Unsplash)
        url = search_food_image(food_name_clean)
        api_calls += 1

        if url and validate_image_url(url):
            print(f"Image found")
            url_cache[food_name_clean] = url
            found += 1
        else:
            print("No image found")
            url_cache[food_name_clean] = ""
            missing += 1
            url = ""

        # Apply to all matching rows (handles duplicates in CSV)
        mask = df[name_col].str.strip() == food_name_clean
        df.loc[mask, IMAGE_URL_COLUMN] = url

    stats = {
        "total_foods": total,
        "images_found": found,
        "images_missing": missing,
        "api_requests_made": api_calls,
        "existing_urls_reused": reused,
    }
    return df, stats


def sync_image_url_to_secondary(primary_df: pd.DataFrame, secondary_df: pd.DataFrame, name_col: str) -> pd.DataFrame:
    """
    Copy image_url values from the primary (enriched) dataframe to the
    secondary dataframe, matching on food name.
    """
    secondary_df = _ensure_image_url_column(secondary_df)
    url_map = primary_df.set_index(primary_df[name_col].str.strip())[IMAGE_URL_COLUMN].to_dict()

    def _lookup(row: pd.Series) -> str:
        name = str(row.get(name_col, "")).strip()
        existing = str(row.get(IMAGE_URL_COLUMN, "")).strip()
        if existing:
            return existing
        return url_map.get(name, "")

    secondary_df[IMAGE_URL_COLUMN] = secondary_df.apply(_lookup, axis=1)
    return secondary_df


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Enrich food dataset CSVs with Unsplash image URLs."
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Process only the first N unique foods (test mode).",
    )
    parser.add_argument(
        "--missing-only",
        action="store_true",
        default=False,
        help="Only process foods that do not yet have an image_url.",
    )
    args = parser.parse_args()

    # Verify API key is present
    if not os.getenv("UNSPLASH_ACCESS_KEY", "").strip():
        print("\n[ERROR] UNSPLASH_ACCESS_KEY is not set in .env")
        print("  Get a free key at https://unsplash.com/developers")
        print("  Then add to Food_Recom/.env:")
        print("    UNSPLASH_ACCESS_KEY=your_key_here\n")
        sys.exit(1)

    # ── Load primary CSV (food_clean.csv) ──────────────────────────────────
    clean_df = _load_csv_safely(FOOD_CLEAN_PATH)
    if clean_df is None:
        logger.error("Cannot proceed without processed_data/food_clean.csv")
        sys.exit(1)

    name_col = _detect_food_name_column(clean_df)
    logger.info(f"Food name column detected: '{name_col}'")

    # ── Backup before modifying ────────────────────────────────────────────
    _backup(FOOD_CLEAN_PATH)

    # ── Enrich food_clean.csv ──────────────────────────────────────────────
    enriched_clean_df, stats = enrich_food_csv(
        clean_df,
        name_col=name_col,
        limit=args.limit,
        missing_only=args.missing_only,
    )
    enriched_clean_df.to_csv(FOOD_CLEAN_PATH, index=False)
    logger.info(f"Saved enriched dataset to {FOOD_CLEAN_PATH}")

    # ── Sync to food_dataset.csv ───────────────────────────────────────────
    dataset_df = _load_csv_safely(FOOD_DATASET_PATH)
    if dataset_df is not None:
        _backup(FOOD_DATASET_PATH)
        synced_df = sync_image_url_to_secondary(enriched_clean_df, dataset_df, name_col)
        synced_df.to_csv(FOOD_DATASET_PATH, index=False)
        logger.info(f"Synced image URLs to {FOOD_DATASET_PATH}")

    # ── Print summary ──────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("  ENRICHMENT COMPLETE")
    print(f"{'='*60}")
    print(f"  Total foods processed : {stats['total_foods']}")
    print(f"  Images found          : {stats['images_found']}")
    print(f"  Images missing        : {stats['images_missing']}")
    print(f"  API requests made     : {stats['api_requests_made']}")
    print(f"  Existing URLs reused  : {stats['existing_urls_reused']}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
