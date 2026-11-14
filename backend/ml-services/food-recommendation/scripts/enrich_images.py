#!/usr/bin/env python3
# scripts/enrich_images.py
# ---------------------------------------------------------------------------
# Unified image enrichment script for VinoSphere food and wine datasets.
#
# Usage
# -----
#   # Enrich both datasets (sample of 10 each — for testing)
#   python scripts/enrich_images.py --target both --limit 10
#
#   # Enrich only foods missing images
#   python scripts/enrich_images.py --target food
#
#   # Enrich only wines missing images
#   python scripts/enrich_images.py --target wine
#
#   # Also clear and re-check existing URLs (removes broken ones first)
#   python scripts/enrich_images.py --target both --validate-existing
#
# What it modifies
# ----------------
#   processed_data/food_clean.csv   (adds/fills image_url column)
#   processed_data/wine_clean.csv   (adds/fills image_url column)
#   datasets/food_dataset.csv       (synced from food_clean.csv)
#   datasets/wine_dataset.csv       (synced from wine_clean.csv)
#
# Backups are created before writing:
#   processed_data/food_clean.csv.bak
#   processed_data/wine_clean.csv.bak
#
# Image source: Wikipedia REST API + Wikimedia Commons (no API key required).
# ---------------------------------------------------------------------------

from __future__ import annotations

import argparse
import logging
import shutil
import sys
import time
from pathlib import Path
from typing import Optional

import pandas as pd

# ---------------------------------------------------------------------------
# Path setup — allow running from any working directory
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR   = SCRIPT_DIR.parent

# Load .env before importing services
from dotenv import load_dotenv
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file, override=True)

sys.path.insert(0, str(BASE_DIR))

from services.image_service import (
    enrich_food_image,
    enrich_wine_image,
    verify_image_url,
)

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.WARNING,   # Keep service-level logs quiet; use print for progress
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Dataset paths
# ---------------------------------------------------------------------------
FOOD_CLEAN_PATH    = BASE_DIR / "processed_data" / "food_clean.csv"
WINE_CLEAN_PATH    = BASE_DIR / "processed_data" / "wine_clean.csv"
FOOD_DATASET_PATH  = BASE_DIR / "datasets"        / "food_dataset.csv"
WINE_DATASET_PATH  = BASE_DIR / "datasets"        / "wine_dataset.csv"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_str(val) -> str:
    """Normalize cell value to empty string if null/nan."""
    s = str(val).strip()
    return "" if s.lower() in ("nan", "none", "") else s


def _backup(csv_path: Path) -> None:
    bak = csv_path.with_suffix(".csv.bak")
    shutil.copy2(csv_path, bak)
    print(f"  Backup: {bak.name}")


def _ensure_image_url_col(df: pd.DataFrame) -> pd.DataFrame:
    if "image_url" not in df.columns:
        df["image_url"] = ""
    df["image_url"] = (
        df["image_url"]
        .fillna("")
        .astype(str)
        .apply(lambda v: "" if v.strip().lower() in ("nan", "none") else v.strip())
    )
    return df


def _sync_image_url(primary_df: pd.DataFrame, secondary_df: pd.DataFrame, name_col: str) -> pd.DataFrame:
    """Copy image_url values from primary to secondary CSV, matching on name."""
    secondary_df = _ensure_image_url_col(secondary_df)
    url_map = (
        primary_df
        .assign(_key=primary_df[name_col].str.strip())
        .set_index("_key")["image_url"]
        .to_dict()
    )

    def _lookup(row: pd.Series) -> str:
        existing = str(row.get("image_url", "")).strip()
        if existing and existing.lower() not in ("nan", "none", ""):
            return existing
        return url_map.get(str(row.get(name_col, "")).strip(), "")

    secondary_df["image_url"] = secondary_df.apply(_lookup, axis=1)
    return secondary_df


# ---------------------------------------------------------------------------
# Core enrichment logic
# ---------------------------------------------------------------------------

def enrich_csv(
    csv_path: Path,
    name_col: str,
    search_fn,               # callable(name, **kwargs) → Optional[str]
    row_kwargs_fn,           # callable(row) → dict of extra kwargs for search_fn
    label: str,
    limit: Optional[int] = None,
    validate_existing: bool = False,
) -> dict:
    """
    Load a CSV, enrich missing image_url values, save back.

    Args:
        csv_path:          Path to the primary CSV to enrich.
        name_col:          Column holding the entity name (Food_Name / Wine_Name).
        search_fn:         Function that takes name + kwargs and returns Optional[str].
        row_kwargs_fn:     Function that extracts extra kwargs from a DataFrame row.
        label:             Human-readable label for progress printing ("FOOD" / "WINE").
        limit:             If set, only process first N missing rows.
        validate_existing: If True, re-validate existing URLs and clear broken ones first.

    Returns:
        dict with stats.
    """
    df = pd.read_csv(csv_path)
    df = _ensure_image_url_col(df)

    total_rows    = len(df)
    already_valid = 0
    invalid_cleared = 0

    # ── Step 1: Optionally validate existing URLs ──────────────────────────
    if validate_existing:
        print(f"\n  [{label}] Validating existing URLs...")
        existing_mask = df["image_url"] != ""
        existing_rows = df[existing_mask]
        for df_idx, row in existing_rows.iterrows():
            url = row["image_url"]
            if verify_image_url(url):
                already_valid += 1
            else:
                df.at[df_idx, "image_url"] = ""
                invalid_cleared += 1
        print(f"  [{label}] Valid: {already_valid} | Cleared broken: {invalid_cleared}")
    else:
        # Count existing without re-validating
        already_valid = (df["image_url"] != "").sum()

    # ── Step 2: Identify rows that need images ─────────────────────────────
    needs_mask = df["image_url"] == ""
    names_to_process = df[needs_mask][name_col].dropna().unique().tolist()

    if limit:
        names_to_process = names_to_process[:limit]

    total_to_process = len(names_to_process)

    print(f"\n{'='*62}")
    print(f"  {label} Image Enrichment — {total_to_process} items to process")
    print(f"  (Already valid: {already_valid} | Invalid cleared: {invalid_cleared})")
    print(f"{'='*62}\n")

    found   = 0
    failed  = 0
    url_cache: dict[str, str] = {}

    for i, name in enumerate(names_to_process, start=1):
        name_clean = _safe_str(name)
        if not name_clean:
            continue

        print(f"[{i}/{total_to_process}] {name_clean}", end="", flush=True)
        print(" ... Searching...", end="", flush=True)

        # Use per-session cache to avoid duplicate API calls
        if name_clean in url_cache:
            url = url_cache[name_clean]
            status = "Cached ✓" if url else "Cached (no image)"
        else:
            # Get first matching row for extra kwargs
            matching = df[df[name_col].str.strip() == name_clean]
            kwargs = row_kwargs_fn(matching.iloc[0]) if not matching.empty else {}

            url = search_fn(name_clean, **kwargs)
            url_cache[name_clean] = url if url else ""

            if url:
                status = "Found image [OK]"
                found += 1
            else:
                status = "No image found"
                failed += 1

        print(f"\r[{i}/{total_to_process}] {name_clean} ... {status}", flush=True)

        # Apply URL to all matching rows in this CSV
        if url:
            mask = df[name_col].str.strip() == name_clean
            df.loc[mask, "image_url"] = url

    # Collect names still missing after this run
    still_missing = df[df["image_url"] == ""][name_col].dropna().unique().tolist()

    return {
        "df":              df,
        "total_rows":      total_rows,
        "already_valid":   already_valid,
        "new_added":       found,
        "failed":          failed,
        "invalid_cleared": invalid_cleared,
        "still_missing":   still_missing,
        "name_col":        name_col,
    }


# ---------------------------------------------------------------------------
# Food-specific helpers
# ---------------------------------------------------------------------------

def _food_search(name: str, cuisine: str = "", category: str = "") -> Optional[str]:
    return enrich_food_image(name, cuisine=cuisine, category=category)


def _food_row_kwargs(row: pd.Series) -> dict:
    return {
        "cuisine":  _safe_str(row.get("Cuisine", "")),
        "category": _safe_str(row.get("Category", "")),
    }


# ---------------------------------------------------------------------------
# Wine-specific helpers
# ---------------------------------------------------------------------------

def _wine_search(name: str, winery: str = "", variety: str = "") -> Optional[str]:
    return enrich_wine_image(name, winery=winery, variety=variety)


def _wine_row_kwargs(row: pd.Series) -> dict:
    return {
        "winery":  _safe_str(row.get("Winery", "")),
        "variety": _safe_str(row.get("Variety", "")),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Enrich VinoSphere food and wine datasets with validated image URLs.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Test: enrich 10 foods + 10 wines
  python scripts/enrich_images.py --target both --limit 10

  # Enrich all missing food images
  python scripts/enrich_images.py --target food

  # Enrich all wines, also clearing broken existing URLs
  python scripts/enrich_images.py --target wine --validate-existing

  # Full run: both datasets, re-validate everything
  python scripts/enrich_images.py --target both --validate-existing
        """,
    )
    parser.add_argument(
        "--target",
        choices=["food", "wine", "both"],
        default="both",
        help="Which dataset to enrich (default: both)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Process only first N missing items per dataset (test mode)",
    )
    parser.add_argument(
        "--validate-existing",
        action="store_true",
        default=False,
        help="Re-validate existing URLs before enriching; clears broken ones",
    )
    args = parser.parse_args()

    all_stats: dict[str, dict] = {}

    # ── FOOD ──────────────────────────────────────────────────────────────
    if args.target in ("food", "both"):
        if not FOOD_CLEAN_PATH.exists():
            print(f"[ERROR] Food CSV not found: {FOOD_CLEAN_PATH}")
            sys.exit(1)

        _backup(FOOD_CLEAN_PATH)
        result = enrich_csv(
            csv_path=FOOD_CLEAN_PATH,
            name_col="Food_Name",
            search_fn=_food_search,
            row_kwargs_fn=_food_row_kwargs,
            label="FOOD",
            limit=args.limit,
            validate_existing=args.validate_existing,
        )
        enriched_food_df = result["df"]
        enriched_food_df.to_csv(FOOD_CLEAN_PATH, index=False)
        print(f"\n  Saved -> {FOOD_CLEAN_PATH.name}")

        # Sync to raw dataset
        if FOOD_DATASET_PATH.exists():
            _backup(FOOD_DATASET_PATH)
            raw = pd.read_csv(FOOD_DATASET_PATH)
            synced = _sync_image_url(enriched_food_df, raw, "Food_Name")
            synced.to_csv(FOOD_DATASET_PATH, index=False)
            print(f"  Synced -> {FOOD_DATASET_PATH.name}")

        all_stats["FOOD"] = result

    # ── WINE ──────────────────────────────────────────────────────────────
    if args.target in ("wine", "both"):
        if not WINE_CLEAN_PATH.exists():
            print(f"[ERROR] Wine CSV not found: {WINE_CLEAN_PATH}")
            sys.exit(1)

        _backup(WINE_CLEAN_PATH)
        result = enrich_csv(
            csv_path=WINE_CLEAN_PATH,
            name_col="Wine_Name",
            search_fn=_wine_search,
            row_kwargs_fn=_wine_row_kwargs,
            label="WINE",
            limit=args.limit,
            validate_existing=args.validate_existing,
        )
        enriched_wine_df = result["df"]
        enriched_wine_df.to_csv(WINE_CLEAN_PATH, index=False)
        print(f"\n  Saved -> {WINE_CLEAN_PATH.name}")

        if WINE_DATASET_PATH.exists():
            _backup(WINE_DATASET_PATH)
            raw = pd.read_csv(WINE_DATASET_PATH)
            synced = _sync_image_url(enriched_wine_df, raw, "Wine_Name")
            synced.to_csv(WINE_DATASET_PATH, index=False)
            print(f"  Synced -> {WINE_DATASET_PATH.name}")

        all_stats["WINE"] = result

    # ── Final Summary ──────────────────────────────────────────────────
    print(f"\n{'='*62}")
    print("  ENRICHMENT COMPLETE")
    print(f"{'='*62}")
    for label, stats in all_stats.items():
        total      = stats["total_rows"]
        with_image = total - len(stats["still_missing"])
        pct        = (with_image / total * 100) if total else 0
        print(f"\n  [{label}]")
        print(f"    Total rows          : {total}")
        print(f"    Images present now  : {with_image}  ({pct:.1f}% coverage)")
        print(f"    Already had image   : {stats['already_valid']}")
        print(f"    Newly added         : {stats['new_added']}")
        print(f"    Still missing       : {len(stats['still_missing'])}")
        print(f"    Invalid URLs cleared: {stats['invalid_cleared']}")

        missing = stats["still_missing"]
        if missing:
            print(f"\n    ── Entries still without an image ({len(missing)}) ──")
            for name in missing:
                print(f"      • {name}")
        else:
            print(f"\n    ✓ All {label.lower()} entries have images!")

    print(f"\n  Image URLs stored in image_url column of each CSV.")
    print(f"  Sources: Wikipedia, TheMealDB, OpenFoodFacts, Wikidata, Unsplash.")
    print(f"{'='*62}\n")


if __name__ == "__main__":
    main()
