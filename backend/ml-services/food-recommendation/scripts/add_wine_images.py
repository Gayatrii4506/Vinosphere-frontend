#!/usr/bin/env python3
# scripts/add_wine_images.py
# ---------------------------------------------------------------------------
# Enriches the wine dataset CSV files with image_url values from Unsplash.
# Search queries are constructed from Wine_Name + Winery for better relevance.
#
# Usage
# -----
#   # Test mode: process only 10 unique wines
#   python scripts/add_wine_images.py --limit 10
#
#   # Process only rows where image_url is still empty
#   python scripts/add_wine_images.py --missing-only
#
#   # Full dataset (all unique wines)
#   python scripts/add_wine_images.py
#
# What it modifies
# ----------------
#   processed_data/wine_clean.csv   ← primary file used by the engine
#   datasets/wine_dataset.csv       ← original dataset kept in sync
#
# Backups are created before any write:
#   processed_data/wine_clean.csv.bak
#   datasets/wine_dataset.csv.bak
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
from pathlib import Path
from typing import Optional

import pandas as pd
from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Path setup
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR = SCRIPT_DIR.parent

env_path = BASE_DIR / ".env"
if env_path.exists():
    load_dotenv(env_path, override=True)

sys.path.insert(0, str(BASE_DIR))

from services.image_service import search_wine_image, validate_image_url

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
WINE_CLEAN_PATH = BASE_DIR / "processed_data" / "wine_clean.csv"
WINE_DATASET_PATH = BASE_DIR / "datasets" / "wine_dataset.csv"

WINE_NAME_COLUMN = "Wine_Name"
WINERY_COLUMN = "Winery"
IMAGE_URL_COLUMN = "image_url"


# ---------------------------------------------------------------------------
# Helpers (mirror of add_food_images.py)
# ---------------------------------------------------------------------------

def _backup(csv_path: Path) -> None:
    bak_path = csv_path.with_suffix(".csv.bak")
    shutil.copy2(csv_path, bak_path)
    logger.info(f"Backup created: {bak_path}")


def _detect_wine_name_column(df: pd.DataFrame) -> str:
    for col in [WINE_NAME_COLUMN, "wine_name", "name", "Wine", "wine"]:
        if col in df.columns:
            return col
    raise ValueError(
        f"Cannot find a wine-name column. Available: {list(df.columns)}"
    )


def _detect_winery_column(df: pd.DataFrame) -> Optional[str]:
    for col in [WINERY_COLUMN, "winery", "producer", "Producer", "brand"]:
        if col in df.columns:
            return col
    return None


def _ensure_image_url_column(df: pd.DataFrame) -> pd.DataFrame:
    if IMAGE_URL_COLUMN not in df.columns:
        df[IMAGE_URL_COLUMN] = ""
    else:
        df[IMAGE_URL_COLUMN] = df[IMAGE_URL_COLUMN].fillna("").astype(str)
    return df


def _load_csv_safely(path: Path) -> Optional[pd.DataFrame]:
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

def enrich_wine_csv(
    df: pd.DataFrame,
    name_col: str,
    winery_col: Optional[str],
    limit: Optional[int] = None,
    missing_only: bool = False,
) -> tuple[pd.DataFrame, dict]:
    """
    Add or fill the image_url column for unique wine names.
    Search query is: "{Wine_Name} {Winery} wine bottle"
    """
    df = _ensure_image_url_column(df)

    if missing_only:
        needs_image_mask = df[IMAGE_URL_COLUMN].str.strip() == ""
        unique_wines = df[needs_image_mask][name_col].dropna().unique().tolist()
        logger.info(f"--missing-only mode: {len(unique_wines)} wines without image_url")
    else:
        unique_wines = df[name_col].dropna().unique().tolist()
        logger.info(f"Unique wines in dataset: {len(unique_wines)}")

    if limit:
        unique_wines = unique_wines[:limit]
        logger.info(f"--limit {limit} applied: processing {len(unique_wines)} wines")

    # Build cache from rows that already have a URL
    url_cache: dict[str, str] = {}
    existing_mask = df[IMAGE_URL_COLUMN].str.strip() != ""
    for _, row in df[existing_mask].iterrows():
        wine_name = str(row[name_col]).strip()
        url = str(row[IMAGE_URL_COLUMN]).strip()
        if wine_name and url:
            url_cache[wine_name] = url

    # Stats
    total = len(unique_wines)
    found = 0
    missing = 0
    api_calls = 0
    reused = 0

    print(f"\n{'='*60}")
    print(f"  Wine Image Enrichment — {total} unique wines to process")
    print(f"{'='*60}\n")

    for i, wine_name in enumerate(unique_wines, start=1):
        wine_name_clean = str(wine_name).strip()
        if not wine_name_clean:
            continue

        print(f"Processing {i}/{total}: {wine_name_clean}", end=" ... ", flush=True)

        # Check in-process cache
        if wine_name_clean in url_cache:
            url = url_cache[wine_name_clean]
            if url:
                print("Existing URL reused")
                reused += 1
                found += 1
            else:
                print("Previously searched — no image")
                missing += 1
            mask = df[name_col].str.strip() == wine_name_clean
            df.loc[mask, IMAGE_URL_COLUMN] = url
            continue

        # Look up winery for this wine
        winery = ""
        if winery_col and winery_col in df.columns:
            matches = df[df[name_col].str.strip() == wine_name_clean]
            if not matches.empty:
                winery = str(matches.iloc[0].get(winery_col, "")).strip()

        # Call image service (Unsplash)
        url = search_wine_image(wine_name_clean, winery if winery else None)
        api_calls += 1

        if url and validate_image_url(url):
            print("Image found")
            url_cache[wine_name_clean] = url
            found += 1
        else:
            print("No image found")
            url_cache[wine_name_clean] = ""
            missing += 1
            url = ""

        # Apply to all matching rows
        mask = df[name_col].str.strip() == wine_name_clean
        df.loc[mask, IMAGE_URL_COLUMN] = url

    stats = {
        "total_wines": total,
        "images_found": found,
        "images_missing": missing,
        "api_requests_made": api_calls,
        "existing_urls_reused": reused,
    }
    return df, stats


def sync_image_url_to_secondary(primary_df: pd.DataFrame, secondary_df: pd.DataFrame, name_col: str) -> pd.DataFrame:
    """Copy image_url from primary to secondary dataframe, matching on wine name."""
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
        description="Enrich wine dataset CSVs with Unsplash image URLs."
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Process only the first N unique wines (test mode).",
    )
    parser.add_argument(
        "--missing-only",
        action="store_true",
        default=False,
        help="Only process wines that do not yet have an image_url.",
    )
    args = parser.parse_args()

    # Verify API key
    if not os.getenv("UNSPLASH_ACCESS_KEY", "").strip():
        print("\n[ERROR] UNSPLASH_ACCESS_KEY is not set in .env")
        print("  Get a free key at https://unsplash.com/developers")
        print("  Then add to Food_Recom/.env:")
        print("    UNSPLASH_ACCESS_KEY=your_key_here\n")
        sys.exit(1)

    # ── Load primary CSV ───────────────────────────────────────────────────
    clean_df = _load_csv_safely(WINE_CLEAN_PATH)
    if clean_df is None:
        logger.error("Cannot proceed without processed_data/wine_clean.csv")
        sys.exit(1)

    name_col = _detect_wine_name_column(clean_df)
    winery_col = _detect_winery_column(clean_df)
    logger.info(f"Wine name column: '{name_col}'  |  Winery column: '{winery_col}'")

    # ── Backup before modifying ────────────────────────────────────────────
    _backup(WINE_CLEAN_PATH)

    # ── Enrich wine_clean.csv ──────────────────────────────────────────────
    enriched_clean_df, stats = enrich_wine_csv(
        clean_df,
        name_col=name_col,
        winery_col=winery_col,
        limit=args.limit,
        missing_only=args.missing_only,
    )
    enriched_clean_df.to_csv(WINE_CLEAN_PATH, index=False)
    logger.info(f"Saved enriched dataset to {WINE_CLEAN_PATH}")

    # ── Sync to wine_dataset.csv ───────────────────────────────────────────
    dataset_df = _load_csv_safely(WINE_DATASET_PATH)
    if dataset_df is not None:
        _backup(WINE_DATASET_PATH)
        synced_df = sync_image_url_to_secondary(enriched_clean_df, dataset_df, name_col)
        synced_df.to_csv(WINE_DATASET_PATH, index=False)
        logger.info(f"Synced image URLs to {WINE_DATASET_PATH}")

    # ── Print summary ──────────────────────────────────────────────────────
    print(f"\n{'='*60}")
    print("  ENRICHMENT COMPLETE")
    print(f"{'='*60}")
    print(f"  Total wines processed : {stats['total_wines']}")
    print(f"  Images found          : {stats['images_found']}")
    print(f"  Images missing        : {stats['images_missing']}")
    print(f"  API requests made     : {stats['api_requests_made']}")
    print(f"  Existing URLs reused  : {stats['existing_urls_reused']}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
