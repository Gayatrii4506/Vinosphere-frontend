#!/usr/bin/env python3
"""
fetch_all_cloudinary_images.py
──────────────────────────────
Fetch ALL images uploaded to the Cloudinary account (cloud name: xfklkvdc)
and print them grouped by folder (wine / food / UI / other).

Usage:
    python scripts/fetch_all_cloudinary_images.py

Requires CLOUDINARY_URL env var OR CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
CLOUDINARY_API_SECRET env vars (or they can be set interactively).

pip install cloudinary   (if not installed)
"""

from __future__ import annotations
import os
import sys
import json
from pathlib import Path
from collections import defaultdict

try:
    import cloudinary
    import cloudinary.api
except ImportError:
    print("Installing cloudinary package...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "cloudinary", "-q"])
    import cloudinary
    import cloudinary.api

# ─── Configuration ──────────────────────────────────────────────────────────
CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME", "xfklkvdc")
API_KEY = os.getenv("CLOUDINARY_API_KEY", "")
API_SECRET = os.getenv("CLOUDINARY_API_SECRET", "")
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL", "")

if CLOUDINARY_URL:
    cloudinary.config(cloudinary_url=CLOUDINARY_URL)
elif API_KEY and API_SECRET:
    cloudinary.config(
        cloud_name=CLOUD_NAME,
        api_key=API_KEY,
        api_secret=API_SECRET,
        secure=True,
    )
else:
    print("=" * 60)
    print("  Cloudinary API credentials not found in environment.")
    print("  Please enter them below (from Cloudinary Dashboard):")
    print("=" * 60)
    api_key = input("  CLOUDINARY_API_KEY: ").strip()
    api_secret = input("  CLOUDINARY_API_SECRET: ").strip()
    if not api_key or not api_secret:
        print("\n[ERROR] API key and secret are required to fetch from Cloudinary.")
        print("  Go to: https://console.cloudinary.com/settings/api-keys")
        sys.exit(1)
    cloudinary.config(
        cloud_name=CLOUD_NAME,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )


def fetch_all_resources():
    """Fetch all image resources from Cloudinary, handling pagination."""
    all_resources = []
    next_cursor = None

    print("\n  Fetching images from Cloudinary...")
    page = 0

    while True:
        page += 1
        print(f"  Page {page}...", end="", flush=True)

        kwargs = {
            "resource_type": "image",
            "max_results": 500,
            "type": "upload",
        }
        if next_cursor:
            kwargs["next_cursor"] = next_cursor

        try:
            result = cloudinary.api.resources(**kwargs)
        except cloudinary.exceptions.AuthorizationRequired:
            print("\n[ERROR] Invalid Cloudinary API credentials. Check your API key and secret.")
            sys.exit(1)
        except Exception as e:
            print(f"\n[ERROR] {e}")
            sys.exit(1)

        resources = result.get("resources", [])
        all_resources.extend(resources)
        print(f" got {len(resources)} images")

        next_cursor = result.get("next_cursor")
        if not next_cursor or not resources:
            break

    return all_resources


def categorize_images(resources):
    """Group images by folder and type (wine/food/UI/other)."""
    by_folder = defaultdict(list)
    wine_images = []
    food_images = []
    ui_images = []
    other_images = []

    for r in resources:
        public_id = r.get("public_id", "")
        secure_url = r.get("secure_url", "")
        folder = r.get("folder", "") or "(root)"
        fmt = r.get("format", "")
        width = r.get("width", 0)
        height = r.get("height", 0)
        created = r.get("created_at", "")
        bytes_size = r.get("bytes", 0)

        info = {
            "public_id": public_id,
            "url": secure_url,
            "folder": folder,
            "format": fmt,
            "dimensions": f"{width}x{height}",
            "size_kb": round(bytes_size / 1024, 1),
            "created_at": created,
        }

        by_folder[folder].append(info)

        pid_lower = public_id.lower()
        if any(kw in pid_lower for kw in ["wine", "bottle", "winery", "sula", "york", "soma", "chandon", "vallonne", "grover", "charosa", "fratelli", "krsma", "cabernet", "shiraz", "merlot", "chardonnay", "sauvignon", "zinfandel", "pinot", "syrah", "brut", "rosé", "rose"]):
            wine_images.append(info)
        elif any(kw in pid_lower for kw in ["food", "meal", "dish", "cuisine", "recipe", "biryani", "curry", "tikka", "masala", "paneer", "dal", "naan", "samosa", "dosa"]):
            food_images.append(info)
        elif any(kw in pid_lower for kw in ["hero", "banner", "category", "gallery", "experience", "event", "brand", "logo", "bg", "background", "ui", "design", "untitled"]):
            ui_images.append(info)
        else:
            other_images.append(info)

    return by_folder, wine_images, food_images, ui_images, other_images


def print_section(title, images):
    """Print a formatted section of images."""
    print(f"\n{'-' * 70}")
    print(f"  {title}  ({len(images)} images)")
    print(f"{'-' * 70}")
    if not images:
        print("  (none)")
        return
    for i, img in enumerate(images, 1):
        print(f"\n  [{i}] {img['public_id']}")
        print(f"      URL: {img['url']}")
        print(f"      Format: {img['format']} | Size: {img['dimensions']} | {img['size_kb']} KB")
        print(f"      Uploaded: {img['created_at']}")


def main():
    resources = fetch_all_resources()

    if not resources:
        print("\n  No images found in Cloudinary account.")
        return

    print(f"\n{'=' * 70}")
    print(f"  TOTAL IMAGES IN CLOUDINARY: {len(resources)}")
    print(f"  Cloud Name: {CLOUD_NAME}")
    print(f"{'=' * 70}")

    by_folder, wine_images, food_images, ui_images, other_images = categorize_images(resources)

    # ── Print by folder ──────────────────────────────────────────────────
    print(f"\n{'=' * 70}")
    print(f"  IMAGES BY FOLDER")
    print(f"{'=' * 70}")
    for folder in sorted(by_folder.keys()):
        imgs = by_folder[folder]
        print(f"\n  [FOLDER] {folder} ({len(imgs)} images)")
        for img in imgs:
            print(f"     - {img['public_id']} -> {img['url']}")

    # ── Print categorized ────────────────────────────────────────────────
    print_section("[WINE] WINE IMAGES", wine_images)
    print_section("[FOOD] FOOD IMAGES", food_images)
    print_section("[UI] UI / DESIGN IMAGES", ui_images)
    print_section("[OTHER] OTHER IMAGES", other_images)

    # ── Summary ──────────────────────────────────────────────────────────
    print(f"\n{'=' * 70}")
    print(f"  SUMMARY")
    print(f"{'=' * 70}")
    print(f"  Total images:     {len(resources)}")
    print(f"  Wine images:      {len(wine_images)}")
    print(f"  Food images:      {len(food_images)}")
    print(f"  UI/Design images: {len(ui_images)}")
    print(f"  Other images:     {len(other_images)}")
    print(f"  Folders:          {len(by_folder)}")
    print(f"{'=' * 70}\n")

    # ── Save full list to JSON ───────────────────────────────────────────
    output_dir = Path(__file__).resolve().parent.parent / "processed_data"
    output_dir.mkdir(exist_ok=True)
    output_file = output_dir / "cloudinary_all_images.json"

    output = {
        "total": len(resources),
        "cloud_name": CLOUD_NAME,
        "wine_images": wine_images,
        "food_images": food_images,
        "ui_images": ui_images,
        "other_images": other_images,
        "by_folder": {k: v for k, v in sorted(by_folder.items())},
    }
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"  Full list saved to: {output_file}")
    print(f"  You can import this JSON to use the URLs in your project.\n")


if __name__ == "__main__":
    main()
