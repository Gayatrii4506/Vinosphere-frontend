# services/wine_image_matcher.py
# ---------------------------------------------------------------------------
# Fetches all wine images from a Cloudinary folder (wine-images),
# normalizes filenames, and matches them EXACTLY to Wine_Name values
# in the wine dataset.
#
# RULES:
#   1. Exact match ONLY after normalization.
#   2. Normalization: lowercase, replace spaces/hyphens with underscores,
#      remove unnecessary punctuation, collapse repeated underscores.
#   3. NO matching by grape variety, wine type, red/white/rosé, or brand alone.
#   4. If no exact match → return None (null). NEVER assign unrelated image.
#
# Exposes:
#   get_image_url(wine_name)  → secure_url or None
#   get_match_report()        → list of dicts with match diagnostics
#   refresh()                 → re-fetch from Cloudinary
# ---------------------------------------------------------------------------

import os
import re
import logging
from pathlib import PurePosixPath
from typing import Dict, Optional, Any, List

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def normalize_wine_name(name: str) -> str:
    """
    Normalize a wine name or Cloudinary filename for exact comparison.

    Steps:
      1. Remove file extension if present
      2. Lowercase
      3. Replace spaces, hyphens, dots with underscores
      4. Remove all non-alphanumeric / non-underscore characters
      5. Collapse repeated underscores
      6. Strip leading/trailing underscores

    Examples:
        "Sula Riesling"                     → "sula_riesling"
        "sula_riesling.jpg"                 → "sula_riesling"
        "Vinsura Shiraz"                    → "vinsura_shiraz"
        "Charosa Single Vineyard Riesling"  → "charosa_single_vineyard_riesling"
        "Grover Zampa La Réserve Rouge"     → "grover_zampa_la_reserve_rouge"
        "Fratelli J'Noon Shiraz-Sangiovese" → "fratelli_jnoon_shiraz_sangiovese"
    """
    # Remove file extension
    name = re.sub(r"\.\w{2,4}$", "", name)
    # Lowercase
    name = name.lower()
    # Replace spaces, hyphens, dots, en-dash, em-dash with underscore
    name = re.sub(r"[\s\-\.–—]+", "_", name)
    # Remove accents: é→e, è→e, ô→o, etc.
    import unicodedata
    nfkd = unicodedata.normalize("NFKD", name)
    name = "".join(c for c in nfkd if not unicodedata.combining(c))
    # Remove all non-alphanumeric, non-underscore characters (apostrophes, quotes, etc.)
    name = re.sub(r"[^a-z0-9_]", "", name)
    # Collapse repeated underscores
    name = re.sub(r"_+", "_", name)
    # Strip leading/trailing underscores
    name = name.strip("_")
    return name


WINERY_PREFIXES = [
    "sula_vineyards_", "sula_",
    "grover_zampa_vineyards_", "grover_zampa_", "grover_",
    "fratelli_wines_", "fratelli_",
    "vallonne_vineyards_", "vallonne_",
    "vinsura_winery_", "vinsura_",
    "charosa_vineyards_", "charosa_",
    "york_winery_", "york_",
    "krsma_estates_", "krsma_",
    "chateau_indage_",
    "four_seasons_vineyards_", "four_seasons_",
    "good_earth_winery_", "good_earth_",
    "reveilo_wines_", "reveilo_",
    "soul_tree_wines_", "soul_tree_",
    "seven_peaks_winery_", "seven_peaks_",
    "pinnacle_vineyards_", "pinnacle_",
    "chandon_india_", "domaine_chandon_", "chandon_",
    "big_banyan_wines_", "big_banyan_",
    "arra_wines_", "arra_",
    "renaissance_wines_", "renaissance_",
    "nine_hills_",
    "flamingo_wines_", "flamingo_",
]

GENERIC_VARIETIES = {
    "shiraz", "cabernet_sauvignon", "sauvignon_blanc", "chenin_blanc",
    "chardonnay", "merlot", "pinot_noir", "syrah", "malbec",
    "riesling", "viognier", "sangiovese", "tempranillo", "zinfandel",
    "moscato", "rose", "red", "white", "sparkling", "dessert",
}


class WineImageMatcher:
    """
    Matches Cloudinary wine image filenames to Wine_Name values
    in the wine dataset using strict normalized exact matching,
    with winery-prefix normalization fallback.
    """

    def __init__(self, wine_folder: Optional[str] = None) -> None:
        self._folder = wine_folder or os.getenv("CLOUDINARY_WINE_FOLDER", "wine-images")
        self._configured = False
        # Maps normalized_name → { public_id, secure_url, raw_filename, normalized }
        self._images: Dict[str, Dict[str, Any]] = {}

        self._configure_cloudinary()
        if self._configured:
            self._load_images()

    # ------------------------------------------------------------------
    # Cloudinary SDK configuration
    # ------------------------------------------------------------------
    def _configure_cloudinary(self) -> None:
        """Configure the Cloudinary SDK from environment variables."""
        cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "")
        api_key = os.getenv("CLOUDINARY_API_KEY", "")
        api_secret = os.getenv("CLOUDINARY_API_SECRET", "")

        if not cloud_name or cloud_name == "your_cloud_name":
            logger.warning(
                "Cloudinary credentials not configured — wine image matcher will be empty."
            )
            self._configured = False
            return

        import cloudinary
        cloudinary.config(
            cloud_name=cloud_name,
            api_key=api_key,
            api_secret=api_secret,
            secure=True,
        )
        self._configured = True
        logger.info(
            "WineImageMatcher: Cloudinary configured — cloud=%s, folder=%s",
            cloud_name, self._folder,
        )

    # ------------------------------------------------------------------
    # Fetch & normalize Cloudinary images
    # ------------------------------------------------------------------
    def _load_images(self) -> None:
        """Fetch all wine images from the Cloudinary folder with pagination."""
        import cloudinary.api

        self._images.clear()

        logger.info("WineImageMatcher: Fetching images from folder '%s' ...", self._folder)

        # Try multiple folder path candidates (asset folder vs prefix)
        folder_candidates = list(dict.fromkeys([
            self._folder,
            f"Vinosphere/{self._folder}" if not self._folder.startswith("Vinosphere") else self._folder,
            self._folder.replace("Vinosphere/", "") if self._folder.startswith("Vinosphere/") else self._folder,
        ]))

        resources: List[Dict[str, Any]] = []

        # Strategy 1: resources_by_asset_folder
        for f in folder_candidates:
            try:
                next_cursor = None
                while True:
                    params: Dict[str, Any] = {"max_results": 500}
                    if next_cursor:
                        params["next_cursor"] = next_cursor
                    res_data = cloudinary.api.resources_by_asset_folder(f, **params)
                    batch = res_data.get("resources", [])
                    resources.extend(batch)
                    next_cursor = res_data.get("next_cursor")
                    if not next_cursor:
                        break
                if resources:
                    logger.info("WineImageMatcher: Fetched %d images via asset_folder '%s'", len(resources), f)
                    break
            except Exception as exc:
                logger.debug("WineImageMatcher: asset_folder failed for '%s': %s", f, exc)

        # Strategy 2: resources with prefix
        if not resources:
            for f in folder_candidates:
                try:
                    next_cursor = None
                    while True:
                        params = {
                            "type": "upload",
                            "prefix": f + "/",
                            "max_results": 500,
                            "resource_type": "image",
                        }
                        if next_cursor:
                            params["next_cursor"] = next_cursor
                        res_data = cloudinary.api.resources(**params)
                        batch = res_data.get("resources", [])
                        resources.extend(batch)
                        next_cursor = res_data.get("next_cursor")
                        if not next_cursor:
                            break
                    if resources:
                        logger.info("WineImageMatcher: Fetched %d images via prefix '%s/'", len(resources), f)
                        break
                except Exception as exc:
                    logger.debug("WineImageMatcher: prefix failed for '%s': %s", f, exc)

        # Process fetched resources
        for res in resources:
            public_id: str = res.get("public_id", "")
            secure_url: str = res.get("secure_url", res.get("url", ""))

            # Extract raw filename from display_name, filename, or public_id
            raw_name = res.get("display_name") or res.get("filename") or PurePosixPath(public_id).name
            normalized = normalize_wine_name(str(raw_name))

            if not normalized:
                continue

            self._images[normalized] = {
                "public_id": public_id,
                "secure_url": secure_url,
                "format": res.get("format", "jpg"),
                "raw_filename": raw_name,
                "normalized": normalized,
            }

        logger.info(
            "WineImageMatcher: %d wine images loaded and indexed.", len(self._images)
        )

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def get_image_entry(self, wine_name: str) -> Optional[Dict[str, Any]]:
        """
        Return the Cloudinary image dict for a wine, or None if no match.
        Priority:
        1. Exact normalized match
        2. Winery-prefix normalization fallback
        """
        if not wine_name or not self._images:
            return None

        normalized = normalize_wine_name(wine_name)

        # 1. Exact match (Priority 1)
        entry = self._images.get(normalized)
        if entry:
            return entry

        # 2. Winery-prefix normalization fallback
        # Case A: wine_name has winery prefix (e.g. "sula_rasa_shiraz"), image is named without it ("rasa_shiraz")
        for pfx in WINERY_PREFIXES:
            if normalized.startswith(pfx):
                stripped = normalized[len(pfx):]
                if stripped and stripped not in GENERIC_VARIETIES and stripped in self._images:
                    return self._images[stripped]

        # Case B: wine_name has no winery prefix (e.g. "rasa_shiraz"), image is named with winery prefix ("sula_rasa_shiraz")
        for pfx in WINERY_PREFIXES:
            prefixed = f"{pfx}{normalized}"
            if prefixed in self._images:
                return self._images[prefixed]

        return None

    def get_image_url(self, wine_name: str) -> Optional[str]:
        """
        Return the Cloudinary secure_url for a wine, or None if no match.
        """
        entry = self.get_image_entry(wine_name)
        if entry:
            return entry["secure_url"]
        return None


    def get_all_images(self) -> Dict[str, Dict[str, Any]]:
        """Return the full image index: { normalized_name → image_info }."""
        return dict(self._images)

    def is_configured(self) -> bool:
        """Return True if Cloudinary credentials were loaded."""
        return self._configured

    def refresh(self) -> int:
        """Re-fetch images from Cloudinary. Returns the new image count."""
        if not self._configured:
            self._configure_cloudinary()
        if self._configured:
            self._load_images()
        return len(self._images)

    def get_match_report(self, wine_names: List[str]) -> Dict[str, Any]:
        """
        Generate a diagnostic match report for a list of wine names.

        Returns:
            {
                "total_wines": int,
                "matched": int,
                "unmatched": int,
                "coverage_pct": float,
                "details": [
                    {
                        "wine_name": str,
                        "normalized_wine": str,
                        "cloudinary_filename": str | None,
                        "image_url": str | None,
                        "match_status": "matched" | "no_image",
                    }
                ],
                "unmatched_images": [ ... ]  # Cloudinary images not matched to any wine
            }
        """
        details = []
        matched_count = 0
        matched_image_keys = set()

        for wn in wine_names:
            norm = normalize_wine_name(wn)
            entry = self.get_image_entry(wn)
            if entry:
                matched_count += 1
                matched_image_keys.add(entry["normalized"])
                details.append({
                    "wine_name": wn,
                    "normalized_wine": norm,
                    "cloudinary_filename": entry["raw_filename"],
                    "image_url": entry["secure_url"],
                    "match_status": "matched",
                })
            else:
                details.append({
                    "wine_name": wn,
                    "normalized_wine": norm,
                    "cloudinary_filename": None,
                    "image_url": None,
                    "match_status": "no_image",
                })


        # Find Cloudinary images not matched to any wine
        unmatched_images = []
        for key, entry in self._images.items():
            if key not in matched_image_keys:
                unmatched_images.append({
                    "normalized": key,
                    "raw_filename": entry["raw_filename"],
                    "secure_url": entry["secure_url"],
                })

        total = len(wine_names)
        return {
            "total_wines": total,
            "matched": matched_count,
            "unmatched": total - matched_count,
            "coverage_pct": round((matched_count / total * 100) if total > 0 else 0, 1),
            "details": details,
            "unmatched_images": unmatched_images,
        }
