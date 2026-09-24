#!/usr/bin/env python3
# scripts/enrich_images_wikipedia.py
# ---------------------------------------------------------------------------
# Enriches food_clean.csv and wine_clean.csv with image_url values by
# querying the Wikipedia REST API for page thumbnails.
#
# WHY WIKIPEDIA:
#   - Completely free, no API key required
#   - Returns direct HTTPS image URLs usable in <img> tags
#   - Wikimedia license (CC BY-SA) – attribution note: "Images via Wikipedia"
#   - Stable, reliable URLs hosted on upload.wikimedia.org
#
# USAGE:
#   python scripts/enrich_images_wikipedia.py --target food   [--limit N]
#   python scripts/enrich_images_wikipedia.py --target wine   [--limit N]
#   python scripts/enrich_images_wikipedia.py --target both   [--limit N]
#   python scripts/enrich_images_wikipedia.py --target both   (all rows)
#
# WHAT IT MODIFIES:
#   processed_data/food_clean.csv  ← adds/fills image_url column
#   processed_data/wine_clean.csv  ← adds/fills image_url column
#
# Backups are written to:
#   processed_data/food_clean.csv.bak
#   processed_data/wine_clean.csv.bak
#
# REQUIREMENTS:
#   pip install requests pandas
#   (no API key needed)
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
import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
BASE_DIR   = SCRIPT_DIR.parent
FOOD_CSV   = BASE_DIR / "processed_data" / "food_clean.csv"
WINE_CSV   = BASE_DIR / "processed_data" / "wine_clean.csv"

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Wikipedia REST API settings
# ---------------------------------------------------------------------------
WIKI_API   = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
WIKI_THUMB = "https://en.wikipedia.org/w/api.php"
DELAY      = 0.5   # seconds between requests (polite crawling)

SESSION = requests.Session()
SESSION.headers.update({
    "User-Agent": "VinoSphere/1.0 (educational project; python-requests)",
    "Accept": "application/json",
})


def _wiki_thumbnail_for_query(query: str) -> Optional[str]:
    """
    Try to find a Wikipedia thumbnail for a single query string.
    Returns URL string or None.
    """
    time.sleep(DELAY)
    # 1. Try exact title
    title = query.replace(" ", "_")
    try:
        resp = SESSION.get(WIKI_API.format(title=title), timeout=8)
        if resp.status_code == 200:
            thumb = resp.json().get("thumbnail", {}).get("source")
            if thumb:
                return thumb
    except Exception:
        pass

    # 2. Try MediaWiki search
    try:
        time.sleep(DELAY)
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "srlimit": 1,
            "format": "json",
            "srprop": "",
        }
        resp = SESSION.get(WIKI_THUMB, params=params, timeout=8)
        if resp.status_code == 200:
            results = resp.json().get("query", {}).get("search", [])
            if results:
                page_title = results[0]["title"].replace(" ", "_")
                time.sleep(DELAY)
                resp2 = SESSION.get(WIKI_API.format(title=page_title), timeout=8)
                if resp2.status_code == 200:
                    thumb = resp2.json().get("thumbnail", {}).get("source")
                    if thumb:
                        return thumb
    except Exception:
        pass

    return None


def _wiki_thumbnail(queries: list[str]) -> Optional[str]:
    """
    Try a list of queries in order, returning the first URL found.
    """
    for q in queries:
        if not q.strip():
            continue
        url = _wiki_thumbnail_for_query(q.strip())
        if url:
            return url
    return None


def _safe_str(val) -> str:
    """Normalize cell value to empty string if null/nan."""
    s = str(val).strip()
    return "" if s.lower() in ("nan", "none", "") else s


# ---------------------------------------------------------------------------
# Main enrichment functions
# ---------------------------------------------------------------------------

def enrich_csv(
    csv_path: Path,
    name_col: str,
    query_fn,
    label: str,
    limit: Optional[int] = None,
) -> dict:
    """
    Load a CSV, add image_url column if missing, populate empty cells.
    Saves back in-place (with .bak backup).

    query_fn(row) → search query string
    """
    df = pd.read_csv(csv_path)

    if "image_url" not in df.columns:
        df["image_url"] = ""
        log.info(f"[{label}] Added image_url column")
    else:
        df["image_url"] = df["image_url"].fillna("").astype(str)
        df["image_url"] = df["image_url"].apply(
            lambda v: "" if str(v).strip().lower() in ("nan", "none") else str(v).strip()
        )

    # Identify rows needing images
    needs_image = df[df["image_url"] == ""].copy()
    log.info(f"[{label}] {len(needs_image)} rows missing image_url (out of {len(df)} total)")

    if limit:
        needs_image = needs_image.head(limit)
        log.info(f"[{label}] --limit {limit}: processing {len(needs_image)} rows")

    # Per-name cache to avoid duplicate API calls
    name_to_url: dict[str, str] = {}

    found = 0
    missing = 0

    print(f"\n{'='*62}")
    print(f"  {label} Image Enrichment via Wikipedia — {len(needs_image)} rows")
    print(f"{'='*62}\n")

    for idx, (df_idx, row) in enumerate(needs_image.iterrows(), start=1):
        name = _safe_str(row.get(name_col, ""))
        if not name:
            continue

        print(f"[{idx}/{len(needs_image)}] {name}", end=" ... ", flush=True)

        # Check per-session cache
        if name in name_to_url:
            url = name_to_url[name]
            label_str = "cached"
        else:
            query = query_fn(row)
            url = _wiki_thumbnail(query)
            name_to_url[name] = url or ""
            label_str = "found" if url else "no image"

        if url:
            df.at[df_idx, "image_url"] = url
            found += 1
            print(f"OK ({label_str})")
        else:
            missing += 1
            print(f"-- ({label_str})")

    # Backup + save
    bak = csv_path.with_suffix(".csv.bak")
    shutil.copy2(csv_path, bak)
    df.to_csv(csv_path, index=False)
    log.info(f"[{label}] Saved to {csv_path.name} (backup: {bak.name})")

    return {"found": found, "missing": missing, "total": len(needs_image)}


# ---------------------------------------------------------------------------
# Query functions for food and wine
# ---------------------------------------------------------------------------

def food_query_fn(row: pd.Series) -> str:
    return _safe_str(row.get("Food_Name", ""))


def food_queries(row: pd.Series) -> list[str]:
    """
    Build a priority-ordered list of Wikipedia queries for a food dish.
    More specific queries first, broader fallbacks last.
    """
    name    = _safe_str(row.get("Food_Name", ""))
    cuisine = _safe_str(row.get("Cuisine", ""))
    cat     = _safe_str(row.get("Category", ""))
    protein = _safe_str(row.get("Protein", ""))

    queries = []
    if name:
        queries.append(name)                         # "Butter Chicken"
        if cuisine:
            queries.append(f"{name} {cuisine}")     # "Butter Chicken Punjabi"
        queries.append(f"{name} dish")               # "Butter Chicken dish"
        queries.append(f"{name} Indian food")        # "Butter Chicken Indian food"
        if cat:
            queries.append(f"{name} {cat}")         # "Butter Chicken Curry"
    return queries


def wine_queries(row: pd.Series) -> list[str]:
    """
    Build a priority-ordered list of Wikipedia queries for a wine.
    """
    wine_name = _safe_str(row.get("Wine_Name", ""))
    winery    = _safe_str(row.get("Winery", ""))
    region    = _safe_str(row.get("Region", ""))
    variety   = _safe_str(row.get("Variety", ""))

    queries = []
    if wine_name:
        queries.append(wine_name)                    # "Sula Sauvignon Blanc"
    if winery:
        queries.append(winery)                       # "Sula Vineyards" → often has Wikipedia page
    if variety:
        queries.append(f"{variety} wine")            # "Sauvignon Blanc wine"
    if region:
        queries.append(f"{region} wine region")      # "Nashik wine region"
    return queries


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Enrich food and wine datasets with Wikipedia thumbnail image URLs."
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
        help="Only process the first N missing rows (test mode)",
    )
    args = parser.parse_args()

    results: dict[str, dict] = {}

    if args.target in ("food", "both"):
        if not FOOD_CSV.exists():
            print(f"[ERROR] Food CSV not found: {FOOD_CSV}")
            sys.exit(1)
        results["food"] = enrich_csv(
            csv_path=FOOD_CSV,
            name_col="Food_Name",
            query_fn=food_queries,
            label="FOOD",
            limit=args.limit,
        )

    if args.target in ("wine", "both"):
        if not WINE_CSV.exists():
            print(f"[ERROR] Wine CSV not found: {WINE_CSV}")
            sys.exit(1)
        results["wine"] = enrich_csv(
            csv_path=WINE_CSV,
            name_col="Wine_Name",
            query_fn=wine_queries,
            label="WINE",
            limit=args.limit,
        )

    # Summary
    print(f"\n{'='*62}")
    print("  ENRICHMENT COMPLETE")
    print(f"{'='*62}")
    for target, stats in results.items():
        print(f"  {target.upper():6s}  found={stats['found']}  missing={stats['missing']}  total={stats['total']}")
    print(f"\n  Image URLs stored in: image_url column of each CSV.")
    print(f"  Attribution: Images sourced from Wikipedia (CC BY-SA).")
    print(f"{'='*62}\n")


if __name__ == "__main__":
    main()
