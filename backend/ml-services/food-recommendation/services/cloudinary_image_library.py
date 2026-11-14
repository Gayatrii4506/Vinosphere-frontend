# services/cloudinary_image_library.py
# ---------------------------------------------------------------------------
# Fetches all food images from a Cloudinary folder, normalizes filenames,
# and caches them in memory. The folder is the single source of truth —
# no manual JSON mappings required.
#
# Exposes:
#   get_all_images()     → dict of normalized_name → image info
#   get_image_by_name()  → lookup a single image by normalized name
#   get_fallback_url()   → URL for the fallback/default food image
#   refresh()            → re-fetch from Cloudinary (manual cache bust)
# ---------------------------------------------------------------------------

import os
import re
import logging
from pathlib import PurePosixPath
from typing import Dict, Optional, Any

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


class CloudinaryImageLibrary:
    """
    In-memory cache of all food images stored in a single Cloudinary folder.

    Images are fetched once at instantiation via the Cloudinary Admin API
    and cached. Subsequent lookups are pure dict lookups — no API calls.
    Call ``refresh()`` to re-fetch after uploading new images.
    """

    def __init__(self, folder: Optional[str] = None) -> None:
        self._folder = folder or os.getenv("CLOUDINARY_FOOD_FOLDER", "food_images")
        self._images: Dict[str, Dict[str, Any]] = {}
        self._fallback_url: str = ""
        self._configured = False

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
                "Cloudinary credentials not configured. "
                "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and "
                "CLOUDINARY_API_SECRET in .env — image library will be empty."
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
        logger.info("Cloudinary configured: cloud_name=%s, folder=%s", cloud_name, self._folder)

    # ------------------------------------------------------------------
    # Fetch & normalize
    # ------------------------------------------------------------------
    def _load_images(self) -> None:
        """Fetch all resources from the Cloudinary folder with pagination."""
        import cloudinary.api

        self._images.clear()
        self._fallback_url = ""

        logger.info("Fetching images from Cloudinary folder '%s' ...", self._folder)

        folder_candidates = [
            self._folder,
            f"Vinosphere/{self._folder}" if not self._folder.startswith("Vinosphere") else self._folder,
            self._folder.replace("Vinosphere/", "") if self._folder.startswith("Vinosphere/") else self._folder,
        ]
        # Remove duplicates while preserving order
        seen_folders = set()
        unique_folders = []
        for f in folder_candidates:
            if f and f not in seen_folders:
                seen_folders.add(f)
                unique_folders.append(f)

        resources = []
        
        # Strategy 1: resources_by_asset_folder
        for f in unique_folders:
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
                    logger.info("Fetched %d images via asset_folder '%s'", len(resources), f)
                    break
            except Exception as exc:
                logger.debug("resources_by_asset_folder failed for '%s': %s", f, exc)

        # Strategy 2: resources with prefix (classic folder paths)
        if not resources:
            for f in unique_folders:
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
                        logger.info("Fetched %d images via prefix '%s/'", len(resources), f)
                        break
                except Exception as exc:
                    logger.debug("resources with prefix failed for '%s': %s", f, exc)

        # Process all fetched resources
        for res in resources:
            public_id: str = res.get("public_id", "")
            secure_url: str = res.get("secure_url", res.get("url", ""))
            fmt: str = res.get("format", "jpg")

            # Extract the raw name from display_name, filename, or public_id
            raw_name = res.get("display_name") or res.get("filename") or PurePosixPath(public_id).name
            normalized = self._normalize(str(raw_name))

            entry = {
                "public_id": public_id,
                "secure_url": secure_url,
                "format": fmt,
                "raw_filename": raw_name,
                "normalized": normalized,
                "tokens": set(normalized.split()),
            }

            self._images[normalized] = entry

            # Detect fallback image
            if any(kw in str(raw_name).lower() for kw in ("fallback", "default", "placeholder")):
                self._fallback_url = secure_url

        # If no explicit fallback image was tagged, use generic food images if available (e.g. thali, street food, grilled food)
        if not self._fallback_url and self._images:
            for generic_candidate in ["thali", "street food", "grilled food", "rice", "dal"]:
                if generic_candidate in self._images:
                    self._fallback_url = self._images[generic_candidate]["secure_url"]
                    break
            if not self._fallback_url:
                # pick the first available image as fallback
                self._fallback_url = next(iter(self._images.values()))["secure_url"]

        logger.info(
            "Cloudinary image library loaded: %d images cached (fallback=%s)",
            len(self._images),
            "yes" if self._fallback_url else "no",
        )

    # ------------------------------------------------------------------
    # Normalization helper
    # ------------------------------------------------------------------
    @staticmethod
    def _normalize(name: str) -> str:
        """
        Normalize a Cloudinary filename to a human-readable search key.

        Examples:
            indian_chicken_curry  →  indian chicken curry
            italian-pizza         →  italian pizza
            thai_green_curry_02   →  thai green curry
        """
        # Remove file extension if present
        name = re.sub(r"\.\w{2,4}$", "", name)
        # Replace underscores, hyphens with spaces
        name = re.sub(r"[_\-]+", " ", name)
        # Strip trailing numbers (e.g. "curry 02" → "curry")
        name = re.sub(r"\s+\d+\s*$", "", name)
        # Collapse whitespace and lowercase
        return " ".join(name.lower().split())

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def get_all_images(self) -> Dict[str, Dict[str, Any]]:
        """Return the full image cache: { normalized_name → image_info }."""
        return dict(self._images)

    def get_image_names(self) -> list[str]:
        """Return all normalized image names."""
        return list(self._images.keys())

    def get_image_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Exact lookup by normalized name."""
        return self._images.get(self._normalize(name))

    def get_image_entries(self) -> list[Dict[str, Any]]:
        """Return all image entries as a list."""
        return list(self._images.values())

    def get_fallback_url(self) -> str:
        """Return the fallback/default image URL (empty string if none)."""
        return self._fallback_url

    def is_configured(self) -> bool:
        """Return True if Cloudinary credentials were loaded successfully."""
        return self._configured

    def refresh(self) -> int:
        """Re-fetch images from Cloudinary. Returns the new image count."""
        if not self._configured:
            self._configure_cloudinary()
        if self._configured:
            self._load_images()
        return len(self._images)
