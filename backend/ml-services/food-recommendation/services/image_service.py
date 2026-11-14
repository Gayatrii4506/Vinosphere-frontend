# services/image_service.py
# ---------------------------------------------------------------------------
# Robust multi-provider image search and validation service for VinoSphere.
#
# Provider chain (food):
#   1. Wikipedia REST summary (exact title match)
#   2. Wikipedia MediaWiki search
#   3. Wikimedia Commons file search
#   4. TheMealDB (free, no API key — great for Indian / international dishes)
#   5. Open Food Facts (free, no API key — packaged foods)
#   6. Unsplash (requires UNSPLASH_ACCESS_KEY — best food photography)
#
# Provider chain (wine):
#   1. Wikipedia REST summary
#   2. Wikipedia MediaWiki search
#   3. Wikimedia Commons file search
#   4. Wikidata SPARQL (structured wine/winery data)
#   5. Unsplash (requires UNSPLASH_ACCESS_KEY)
#
# URL validation:
#   - Wikimedia URLs: structural check (host + extension) — CDN blocks pings
#   - All other URLs: HTTP GET, status 200, Content-Type: image/*
#
# Public API
# ----------
#   verify_image_url(url)                           → bool
#   search_image(query)                             → Optional[str]
#   find_valid_image(queries)                       → Optional[str]
#   search_food_image(food_name, cuisine, category) → Optional[str]
#   search_wine_image(wine_name, winery, variety)   → Optional[str]
#   enrich_food_image(food_name, ...)               → Optional[str]
#   enrich_wine_image(wine_name, ...)               → Optional[str]
#   ensure_image_for_food(food_name, csv_path)      → Optional[str]
#   ensure_image_for_wine(wine_name, csv_path)      → Optional[str]
#
# No Gemini used here. All image lookup is via public APIs.
# ---------------------------------------------------------------------------

from __future__ import annotations

import logging
import os
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse, urlunparse, quote

import requests
from dotenv import load_dotenv, find_dotenv

# ---------------------------------------------------------------------------
# .env loading
# ---------------------------------------------------------------------------
_env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(_env_path, override=True)
else:
    load_dotenv(find_dotenv(), override=True)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY", "").strip()

# Timing / retry settings
_VALIDATE_TIMEOUT = 8       # seconds for URL validation requests
_SEARCH_TIMEOUT   = 10      # seconds for search API requests
_MAX_RETRIES      = 2
_REQUEST_DELAY    = 0.6     # seconds between Wikipedia API calls (polite crawling)
_VALIDATE_DELAY   = 0.2     # delay between validation requests

# ---------------------------------------------------------------------------
# Wikipedia / Wikimedia API endpoints
# ---------------------------------------------------------------------------
_WIKI_SUMMARY_API = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
_WIKI_SEARCH_API  = "https://en.wikipedia.org/w/api.php"
_WIKI_COMMONS_API = "https://commons.wikimedia.org/w/api.php"

# TheMealDB (free tier, no key)
_MEALDB_SEARCH_API = "https://www.themealdb.com/api/json/v1/1/search.php"

# Open Food Facts
_OFF_SEARCH_API = "https://world.openfoodfacts.org/cgi/search.pl"

# Unsplash
_UNSPLASH_SEARCH_API = "https://api.unsplash.com/search/photos"

# Wikidata SPARQL
_WIKIDATA_SPARQL_API = "https://query.wikidata.org/sparql"

# ---------------------------------------------------------------------------
# Shared session for connection reuse
# ---------------------------------------------------------------------------
_SESSION = requests.Session()
_SESSION.headers.update({
    "User-Agent": "VinoSphere/1.0 (educational project; python-requests; food-wine recommender)",
    "Accept-Language": "en-US,en;q=0.9",
})

# In-memory URL cache: normalised query → image URL (or "" for cache miss)
_image_cache: dict[str, str] = {}

_last_request_time: float = 0.0


def _throttle(delay: float = _REQUEST_DELAY) -> None:
    """Enforce minimum delay between API calls (polite crawling)."""
    global _last_request_time
    elapsed = time.monotonic() - _last_request_time
    if elapsed < delay:
        time.sleep(delay - elapsed)
    _last_request_time = time.monotonic()


# ===========================================================================
# URL Validation
# ===========================================================================

def _strip_tracking_params(url: str) -> str:
    """
    Remove Wikimedia tracking query parameters.
    Strip ALL query params for upload.wikimedia.org URLs.
    """
    try:
        parsed = urlparse(url)
        if "wikimedia.org" in parsed.netloc or "wikipedia.org" in parsed.netloc:
            return urlunparse(parsed._replace(query="", fragment=""))
        return url
    except Exception:
        return url


_TRUSTED_IMAGE_HOSTS = (
    "upload.wikimedia.org",
    "commons.wikimedia.org",
    "en.wikipedia.org",
)
_TRUSTED_IMAGE_EXTENSIONS = (".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg")


def _is_trusted_image_url(url: str) -> bool:
    """
    Structural check for URLs from trusted Wikimedia sources.
    CDN blocks programmatic pings; URLs from the API are guaranteed to exist.
    """
    try:
        parsed = urlparse(url)
        host = parsed.netloc.lower()
        path = parsed.path.lower()
        if any(trusted in host for trusted in _TRUSTED_IMAGE_HOSTS):
            return any(path.endswith(ext) for ext in _TRUSTED_IMAGE_EXTENSIONS)
        return False
    except Exception:
        return False


def verify_image_url(url: Optional[str]) -> bool:
    """
    Verify that a URL is a real, loadable image.

    - Wikimedia/Wikipedia URLs: structural check (host + image extension).
    - All other URLs: HTTP GET, status 200, Content-Type: image/*.

    Returns True when the URL is confirmed usable in an <img src> tag.
    """
    if not url or not isinstance(url, str):
        return False
    url = url.strip()
    if not url:
        return False
    if not (url.startswith("http://") or url.startswith("https://")):
        return False

    url = _strip_tracking_params(url)

    if _is_trusted_image_url(url):
        logger.debug(f"verify_image_url: trusted Wikimedia URL accepted: {url[:60]}")
        return True

    # Full HTTP validation for non-Wikimedia URLs
    for attempt in range(1, _MAX_RETRIES + 1):
        try:
            resp = _SESSION.get(
                url,
                timeout=_VALIDATE_TIMEOUT,
                allow_redirects=True,
                stream=True,
                headers={"Accept": "image/webp,image/apng,image/*,*/*;q=0.8"},
            )
            resp.close()

            if resp.status_code == 429:
                wait = 2.0 ** attempt
                logger.debug(f"verify_image_url: 429 rate limit, waiting {wait}s")
                time.sleep(wait)
                continue

            if resp.status_code != 200:
                logger.debug(f"verify_image_url: {resp.status_code} for {url[:60]}")
                return False

            content_type = resp.headers.get("Content-Type", "").lower()
            if not content_type.startswith("image/"):
                logger.debug(f"verify_image_url: non-image content-type '{content_type}'")
                return False

            return True

        except requests.exceptions.Timeout:
            logger.debug(f"verify_image_url: timeout (attempt {attempt}) for {url[:60]}")
            if attempt < _MAX_RETRIES:
                time.sleep(1.0)
        except requests.exceptions.ConnectionError as exc:
            logger.debug(f"verify_image_url: connection error: {exc}")
            return False
        except Exception as exc:
            logger.debug(f"verify_image_url: unexpected error: {exc}")
            return False

    return False


# ===========================================================================
# Provider 1 & 2 & 3: Wikipedia / Wikimedia Commons
# ===========================================================================

def _wiki_summary_image(title: str) -> Optional[str]:
    """Fetch image from Wikipedia REST summary API for an exact page title."""
    _throttle()
    clean_title = title.strip().replace(" ", "_")
    url = _WIKI_SUMMARY_API.format(title=quote(clean_title, safe="/_-"))
    try:
        resp = _SESSION.get(url, timeout=_SEARCH_TIMEOUT)
        if resp.status_code == 200:
            data = resp.json()
            orig = data.get("originalimage", {}).get("source")
            if orig:
                return _strip_tracking_params(orig)
            thumb = data.get("thumbnail", {}).get("source")
            if thumb:
                return _strip_tracking_params(thumb)
        return None
    except Exception as exc:
        logger.debug(f"_wiki_summary_image error for '{title}': {exc}")
        return None


def _wiki_search_image(query: str) -> Optional[str]:
    """Search Wikipedia for query, return thumbnail of best result."""
    _throttle()
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "srlimit": 3,
        "format": "json",
        "srprop": "",
    }
    try:
        resp = _SESSION.get(_WIKI_SEARCH_API, params=params, timeout=_SEARCH_TIMEOUT)
        if resp.status_code != 200:
            return None
        results = resp.json().get("query", {}).get("search", [])
        for result in results:
            page_title = result.get("title", "")
            if not page_title:
                continue
            img = _wiki_summary_image(page_title)
            if img:
                return img
        return None
    except Exception as exc:
        logger.debug(f"_wiki_search_image error for '{query}': {exc}")
        return None


def _commons_search_image(query: str) -> Optional[str]:
    """Search Wikimedia Commons for a file matching the query."""
    _throttle()
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": f"filetype:bitmap {query}",
        "gsrlimit": 3,
        "gsrnamespace": 6,
        "prop": "imageinfo",
        "iiprop": "url",
        "format": "json",
    }
    try:
        resp = _SESSION.get(_WIKI_COMMONS_API, params=params, timeout=_SEARCH_TIMEOUT)
        if resp.status_code != 200:
            return None
        pages = resp.json().get("query", {}).get("pages", {})
        for page in pages.values():
            imageinfo = page.get("imageinfo", [])
            if imageinfo:
                url = imageinfo[0].get("url")
                if url and "upload.wikimedia.org" in url:
                    return _strip_tracking_params(url)
        return None
    except Exception as exc:
        logger.debug(f"_commons_search_image error for '{query}': {exc}")
        return None


# ===========================================================================
# Provider 4: TheMealDB (food only, free, no key)
# ===========================================================================

def _themealdb_image(food_name: str) -> Optional[str]:
    """
    Query TheMealDB free API for a meal thumbnail.
    Returns strMealThumb URL if found and it passes HTTP validation.
    """
    try:
        resp = _SESSION.get(
            _MEALDB_SEARCH_API,
            params={"s": food_name},
            timeout=_SEARCH_TIMEOUT,
        )
        if resp.status_code != 200:
            return None
        meals = resp.json().get("meals") or []
        for meal in meals:
            thumb = meal.get("strMealThumb", "")
            if thumb and thumb.startswith("http"):
                # MealDB thumbnails are reliable HTTPS JPEG URLs
                if verify_image_url(thumb):
                    return thumb
        return None
    except Exception as exc:
        logger.debug(f"_themealdb_image error for '{food_name}': {exc}")
        return None


# ===========================================================================
# Provider 5: Open Food Facts (food only, free, no key)
# ===========================================================================

def _openfoodfacts_image(query: str) -> Optional[str]:
    """
    Search Open Food Facts for a product image.
    Best for packaged foods; lower value for restaurant dishes.
    """
    try:
        params = {
            "search_terms": query,
            "search_simple": 1,
            "action": "process",
            "json": 1,
            "page_size": 5,
            "fields": "image_url",
        }
        resp = _SESSION.get(_OFF_SEARCH_API, params=params, timeout=_SEARCH_TIMEOUT)
        if resp.status_code != 200:
            return None
        products = resp.json().get("products", [])
        for product in products:
            img = product.get("image_url", "")
            if img and img.startswith("http"):
                if verify_image_url(img):
                    return img
        return None
    except Exception as exc:
        logger.debug(f"_openfoodfacts_image error for '{query}': {exc}")
        return None


# ===========================================================================
# Provider 6: Wikidata SPARQL (wine/winery images)
# ===========================================================================

def _wikidata_wine_image(wine_name: str, variety: str = "") -> Optional[str]:
    """
    Query Wikidata SPARQL for a wine or winery image.
    Searches by wine/winery label (case-insensitive).
    """
    # Try wine label first, then grape variety
    terms = [wine_name]
    if variety and variety.lower() not in wine_name.lower():
        terms.append(variety)

    for term in terms:
        escaped = term.replace('"', '\\"').replace("\\", "\\\\")
        # SPARQL: find items labelled with the term, get their image (P18)
        sparql = f"""
SELECT ?image WHERE {{
  ?item rdfs:label "{escaped}"@en .
  ?item wdt:P18 ?image .
}}
LIMIT 3
"""
        try:
            resp = _SESSION.get(
                _WIKIDATA_SPARQL_API,
                params={"query": sparql, "format": "json"},
                headers={"Accept": "application/sparql-results+json"},
                timeout=_SEARCH_TIMEOUT,
            )
            if resp.status_code != 200:
                continue
            bindings = resp.json().get("results", {}).get("bindings", [])
            for b in bindings:
                img = b.get("image", {}).get("value", "")
                if img and img.startswith("http"):
                    clean = _strip_tracking_params(img)
                    if verify_image_url(clean):
                        return clean
        except Exception as exc:
            logger.debug(f"_wikidata_wine_image error for '{term}': {exc}")
            continue

    return None


def _wikidata_variety_image(variety: str) -> Optional[str]:
    """Query Wikidata for a grape variety image (fallback for wine)."""
    if not variety:
        return None
    escaped = variety.replace('"', '\\"')
    sparql = f"""
SELECT ?image WHERE {{
  ?item rdfs:label "{escaped}"@en .
  ?item wdt:P31/wdt:P279* wd:Q10978 .
  ?item wdt:P18 ?image .
}}
LIMIT 3
"""
    try:
        resp = _SESSION.get(
            _WIKIDATA_SPARQL_API,
            params={"query": sparql, "format": "json"},
            headers={"Accept": "application/sparql-results+json"},
            timeout=_SEARCH_TIMEOUT,
        )
        if resp.status_code != 200:
            return None
        bindings = resp.json().get("results", {}).get("bindings", [])
        for b in bindings:
            img = b.get("image", {}).get("value", "")
            if img and img.startswith("http"):
                clean = _strip_tracking_params(img)
                if verify_image_url(clean):
                    return clean
        return None
    except Exception as exc:
        logger.debug(f"_wikidata_variety_image error for '{variety}': {exc}")
        return None


# ===========================================================================
# Provider 7: Unsplash (optional, requires API key)
# ===========================================================================

def _unsplash_image(query: str) -> Optional[str]:
    """
    Search Unsplash for a photo matching the query.
    Silently skipped if UNSPLASH_ACCESS_KEY is not set.
    Returns a raw image URL (full-size) if found and valid.
    """
    if not UNSPLASH_ACCESS_KEY or UNSPLASH_ACCESS_KEY == "your_unsplash_access_key_here":
        return None
    try:
        resp = _SESSION.get(
            _UNSPLASH_SEARCH_API,
            params={
                "query": query,
                "per_page": 5,
                "orientation": "landscape",
                "content_filter": "high",
            },
            headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
            timeout=_SEARCH_TIMEOUT,
        )
        if resp.status_code != 200:
            return None
        results = resp.json().get("results", [])
        for photo in results:
            urls = photo.get("urls", {})
            # Prefer 'regular' (1080px) over 'full'
            img = urls.get("regular") or urls.get("full") or urls.get("small") or ""
            if img and img.startswith("http"):
                if verify_image_url(img):
                    return img
        return None
    except Exception as exc:
        logger.debug(f"_unsplash_image error for '{query}': {exc}")
        return None


# ===========================================================================
# Core search functions
# ===========================================================================

def search_image(query: str) -> Optional[str]:
    """
    Search for an image using Wikipedia/Wikimedia only (generic fallback).
    Falls back through:
      1. Wikipedia REST summary
      2. Wikipedia MediaWiki search
      3. Wikimedia Commons
    Returns the first found URL (not yet validated for non-Wikimedia URLs).
    """
    query = query.strip()
    if not query:
        return None

    img = _wiki_summary_image(query)
    if img:
        return img

    img = _wiki_search_image(query)
    if img:
        return img

    img = _commons_search_image(query)
    if img:
        return img

    return None


def find_valid_image(queries: list[str]) -> Optional[str]:
    """
    Try each query in order through ALL providers, validate each URL, and
    return the first URL that passes validation.

    Args:
        queries: Priority-ordered list of search strings.

    Returns:
        A verified image URL, or None.
    """
    seen_urls: set[str] = set()

    for query in queries:
        query = query.strip()
        if not query:
            continue

        cache_key = f"q:{query.lower()}"
        if cache_key in _image_cache:
            cached = _image_cache[cache_key]
            if cached:
                return cached
            continue

        logger.debug(f"find_valid_image: searching '{query}'")
        raw_url = search_image(query)

        if raw_url:
            clean_url = _strip_tracking_params(raw_url)
            if clean_url not in seen_urls:
                seen_urls.add(clean_url)
                if verify_image_url(clean_url):
                    _image_cache[cache_key] = clean_url
                    return clean_url
                else:
                    logger.debug(f"find_valid_image: validation failed for '{clean_url[:60]}'")

        _image_cache[cache_key] = ""

    return None


# ===========================================================================
# Food Image Search — multi-provider
# ===========================================================================

def search_food_image(
    food_name: str,
    cuisine: str = "",
    category: str = "",
) -> Optional[str]:
    """
    Search for a food image using the full multi-provider chain:
      1. Wikipedia (3 strategies)
      2. TheMealDB (free, excellent for Indian / world dishes)
      3. Open Food Facts (free)
      4. Unsplash (requires key, best photography)

    Returns a verified image URL or None.
    """
    food_name = food_name.strip()
    if not food_name:
        return None

    cache_key = f"food:{food_name.lower()}:{cuisine.lower()}:{category.lower()}"
    if cache_key in _image_cache:
        cached = _image_cache[cache_key]
        return cached if cached else None

    # ── Step 1: Wikipedia chain ───────────────────────────────────────────
    queries: list[str] = [food_name]
    queries.append(f"{food_name} dish")
    queries.append(f"{food_name} food")
    if cuisine:
        queries.append(f"{food_name} {cuisine}")
    queries.append(f"{food_name} Indian food")
    if category and category.lower() not in food_name.lower():
        queries.append(f"{food_name} {category}")

    url = find_valid_image(queries)
    if url:
        _image_cache[cache_key] = url
        return url

    # ── Step 2: TheMealDB ─────────────────────────────────────────────────
    logger.debug(f"search_food_image: trying TheMealDB for '{food_name}'")
    url = _themealdb_image(food_name)
    if url:
        _image_cache[cache_key] = url
        return url

    # Try simplified name (e.g. "Chicken Tikka Masala" → "Tikka Masala")
    parts = food_name.split()
    if len(parts) > 1:
        for i in range(1, len(parts)):
            short = " ".join(parts[i:])
            url = _themealdb_image(short)
            if url:
                _image_cache[cache_key] = url
                return url

    # ── Step 3: Open Food Facts ───────────────────────────────────────────
    logger.debug(f"search_food_image: trying OpenFoodFacts for '{food_name}'")
    url = _openfoodfacts_image(food_name)
    if url:
        _image_cache[cache_key] = url
        return url

    # ── Step 4: Unsplash ──────────────────────────────────────────────────
    if UNSPLASH_ACCESS_KEY and UNSPLASH_ACCESS_KEY != "your_unsplash_access_key_here":
        logger.debug(f"search_food_image: trying Unsplash for '{food_name}'")
        for q in [food_name, f"{food_name} food", f"{food_name} dish"]:
            url = _unsplash_image(q)
            if url:
                _image_cache[cache_key] = url
                return url

    _image_cache[cache_key] = ""
    return None


# ===========================================================================
# Wine Image Search — multi-provider
# ===========================================================================

def search_wine_image(
    wine_name: str,
    winery: Optional[str] = None,
    variety: Optional[str] = None,
) -> Optional[str]:
    """
    Search for a wine image using the full multi-provider chain:
      1. Wikipedia (3 strategies)
      2. Wikidata SPARQL (wine/winery structured data)
      3. Wikidata grape variety fallback
      4. Unsplash (requires key)

    Returns a verified image URL or None.
    """
    wine_name = wine_name.strip()
    if not wine_name:
        return None

    winery = winery.strip() if winery else ""
    variety = variety.strip() if variety else ""

    cache_key = f"wine:{wine_name.lower()}:{winery.lower()}:{variety.lower()}"
    if cache_key in _image_cache:
        cached = _image_cache[cache_key]
        return cached if cached else None

    # ── Step 1: Wikipedia chain ───────────────────────────────────────────
    queries: list[str] = [wine_name]
    if winery and winery.lower() not in wine_name.lower():
        queries.append(winery)
    if variety:
        queries.append(f"{variety} wine")
    queries.append(f"{wine_name} wine")
    if variety:
        queries.append(f"wine bottle {variety}")
        queries.append(variety)

    url = find_valid_image(queries)
    if url:
        _image_cache[cache_key] = url
        return url

    # ── Step 2: Wikidata SPARQL ───────────────────────────────────────────
    logger.debug(f"search_wine_image: trying Wikidata for '{wine_name}'")
    url = _wikidata_wine_image(wine_name, variety=variety)
    if url:
        _image_cache[cache_key] = url
        return url

    # Try winery on Wikidata
    if winery:
        url = _wikidata_wine_image(winery, variety=variety)
        if url:
            _image_cache[cache_key] = url
            return url

    # ── Step 3: Wikidata grape variety ────────────────────────────────────
    if variety:
        logger.debug(f"search_wine_image: trying Wikidata variety for '{variety}'")
        url = _wikidata_variety_image(variety)
        if url:
            _image_cache[cache_key] = url
            return url

    # ── Step 4: Unsplash ──────────────────────────────────────────────────
    if UNSPLASH_ACCESS_KEY and UNSPLASH_ACCESS_KEY != "your_unsplash_access_key_here":
        logger.debug(f"search_wine_image: trying Unsplash for '{wine_name}'")
        for q in [wine_name, f"{variety} wine" if variety else "wine bottle", "wine bottle"]:
            url = _unsplash_image(q)
            if url:
                _image_cache[cache_key] = url
                return url

    _image_cache[cache_key] = ""
    return None


# ===========================================================================
# High-level enrichment helpers (used by scripts + recommendation engine)
# ===========================================================================

def enrich_food_image(
    food_name: str,
    cuisine: str = "",
    category: str = "",
) -> Optional[str]:
    """
    Find a valid image URL for a food item.
    Wrapper around search_food_image; intended for enrichment scripts.
    """
    return search_food_image(food_name, cuisine=cuisine, category=category)


def enrich_wine_image(
    wine_name: str,
    winery: str = "",
    variety: str = "",
) -> Optional[str]:
    """
    Find a valid image URL for a wine.
    Wrapper around search_wine_image; intended for enrichment scripts.
    """
    return search_wine_image(wine_name, winery=winery, variety=variety)


def ensure_image_for_food(
    food_name: str,
    csv_path: Optional[str] = None,
    cuisine: str = "",
    category: str = "",
) -> Optional[str]:
    """
    Return a valid image URL for a food item, using cached CSV data when possible.

    1. If csv_path is provided and the food already has a valid image_url → return it
    2. If image_url is missing/broken → search + validate + optionally save to CSV
    3. If search fails → return None

    Does NOT call Gemini.
    """
    food_name = food_name.strip()
    if not food_name:
        return None

    if csv_path:
        try:
            import pandas as pd
            csv_file = Path(csv_path)
            if csv_file.exists() and csv_file.stat().st_size > 0:
                df = pd.read_csv(csv_file)
                if "image_url" in df.columns and "Food_Name" in df.columns:
                    mask = df["Food_Name"].str.strip().str.lower() == food_name.lower()
                    if mask.any():
                        existing = str(df.loc[mask, "image_url"].iloc[0]).strip()
                        if existing and existing.lower() not in ("nan", "none", ""):
                            clean = _strip_tracking_params(existing)
                            if verify_image_url(clean):
                                return clean
        except Exception as exc:
            logger.debug(f"ensure_image_for_food: CSV read error: {exc}")

    url = search_food_image(food_name, cuisine=cuisine, category=category)

    if url and csv_path:
        try:
            import pandas as pd
            csv_file = Path(csv_path)
            if csv_file.exists() and csv_file.stat().st_size > 0:
                df = pd.read_csv(csv_file)
                if "image_url" not in df.columns:
                    df["image_url"] = ""
                mask = df["Food_Name"].str.strip().str.lower() == food_name.lower()
                if mask.any():
                    df.loc[mask, "image_url"] = url
                    df.to_csv(csv_file, index=False)
                    logger.info(f"ensure_image_for_food: saved image URL for '{food_name}'")
        except Exception as exc:
            logger.debug(f"ensure_image_for_food: CSV write error: {exc}")

    return url


def ensure_image_for_wine(
    wine_name: str,
    csv_path: Optional[str] = None,
    winery: str = "",
    variety: str = "",
) -> Optional[str]:
    """
    Return a valid image URL for a wine, using cached CSV data when possible.
    Does NOT call Gemini.
    """
    wine_name = wine_name.strip()
    if not wine_name:
        return None

    if csv_path:
        try:
            import pandas as pd
            csv_file = Path(csv_path)
            if csv_file.exists() and csv_file.stat().st_size > 0:
                df = pd.read_csv(csv_file)
                if "image_url" in df.columns and "Wine_Name" in df.columns:
                    mask = df["Wine_Name"].str.strip().str.lower() == wine_name.lower()
                    if mask.any():
                        existing = str(df.loc[mask, "image_url"].iloc[0]).strip()
                        if existing and existing.lower() not in ("nan", "none", ""):
                            clean = _strip_tracking_params(existing)
                            if verify_image_url(clean):
                                return clean
        except Exception as exc:
            logger.debug(f"ensure_image_for_wine: CSV read error: {exc}")

    url = search_wine_image(wine_name, winery=winery, variety=variety)

    if url and csv_path:
        try:
            import pandas as pd
            csv_file = Path(csv_path)
            if csv_file.exists() and csv_file.stat().st_size > 0:
                df = pd.read_csv(csv_file)
                if "image_url" not in df.columns:
                    df["image_url"] = ""
                mask = df["Wine_Name"].str.strip().str.lower() == wine_name.lower()
                if mask.any():
                    df.loc[mask, "image_url"] = url
                    df.to_csv(csv_file, index=False)
                    logger.info(f"ensure_image_for_wine: saved image URL for '{wine_name}'")
        except Exception as exc:
            logger.debug(f"ensure_image_for_wine: CSV write error: {exc}")

    return url


# ===========================================================================
# Legacy compat aliases
# ===========================================================================
validate_image_url = verify_image_url


def preload_cache_from_dict(entries: dict[str, str]) -> None:
    """Pre-populate in-memory cache from a dict of {cache_key: url}."""
    _image_cache.update(entries)
