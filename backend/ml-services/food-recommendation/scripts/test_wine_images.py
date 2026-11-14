# scripts/test_wine_images.py
# ---------------------------------------------------------------------------
# Diagnostic script: tests the WineImageMatcher against the full wine dataset
# and produces a match report with coverage statistics.
#
# Usage:
#   python scripts/test_wine_images.py
# ---------------------------------------------------------------------------

import sys
import os

# Fix Windows console encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Ensure project root is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.wine_image_matcher import WineImageMatcher, normalize_wine_name
from services.wine_catalog_service import WineCatalogService


def main():
    print("=" * 80)
    print("WINE IMAGE MATCHING — DIAGNOSTIC REPORT")
    print("=" * 80)

    # Initialize services
    print("\n[1] Loading WineCatalogService...")
    catalog = WineCatalogService()
    all_wines = catalog.get_all_wines()
    print(f"    Total wines in catalog: {len(all_wines)}")

    print("\n[2] Loading WineImageMatcher (fetching from Cloudinary)...")
    matcher = WineImageMatcher()
    all_images = matcher.get_all_images()
    print(f"    Total images in Cloudinary wine-images folder: {len(all_images)}")

    # Print all Cloudinary image filenames and their normalized forms
    print("\n" + "-" * 80)
    print("CLOUDINARY WINE IMAGES (normalized)")
    print("-" * 80)
    for norm_key, entry in sorted(all_images.items()):
        print(f"  {entry['raw_filename']:<50} → {norm_key}")

    # Generate match report
    print("\n[3] Running match report...")
    report = matcher.get_match_report(all_wines)

    # Print full match table
    print("\n" + "=" * 120)
    print(f"{'Wine Name':<55} | {'Cloudinary Filename':<35} | {'Match Status':<12} | Image URL")
    print("-" * 120)

    for detail in report["details"]:
        wine_name = detail["wine_name"][:54]
        cf = (detail["cloudinary_filename"] or "—")[:34]
        status = detail["match_status"]
        url = (detail["image_url"] or "—")[:60]
        status_icon = "[OK]" if status == "matched" else "[--]"
        print(f"  {status_icon} {wine_name:<53} | {cf:<35} | {status:<12} | {url}")

    # Coverage summary
    print("\n" + "=" * 80)
    print("COVERAGE SUMMARY")
    print("=" * 80)
    print(f"  Total wines in dataset:     {report['total_wines']}")
    print(f"  Wines WITH images:          {report['matched']}")
    print(f"  Wines WITHOUT images:       {report['unmatched']}")
    print(f"  Coverage percentage:        {report['coverage_pct']}%")

    # Unmatched Cloudinary images (images uploaded but not matching any wine)
    if report["unmatched_images"]:
        print(f"\n  ⚠ Cloudinary images NOT matching any wine ({len(report['unmatched_images'])}):")
        for img in report["unmatched_images"]:
            print(f"    - {img['raw_filename']} (normalized: {img['normalized']})")

    # Show name matching failures for debugging
    unmatched_wines = [d for d in report["details"] if d["match_status"] == "no_image"]
    if unmatched_wines:
        print(f"\n  Wines without matching images ({len(unmatched_wines)}):")
        for d in unmatched_wines[:20]:  # Show first 20
            print(f"    - {d['wine_name']} (normalized: {d['normalized_wine']})")
        if len(unmatched_wines) > 20:
            print(f"    ... and {len(unmatched_wines) - 20} more")

    print("\n" + "=" * 80)
    print("DONE")
    print("=" * 80)


if __name__ == "__main__":
    main()
