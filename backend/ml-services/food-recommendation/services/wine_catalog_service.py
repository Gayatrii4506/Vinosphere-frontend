# services/wine_catalog_service.py
# ---------------------------------------------------------------------------
# Derives clean, human-readable wine categories and wine lists from wine_clean.csv
# and datasets/learned_wines.csv.
# ---------------------------------------------------------------------------

import os
import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "processed_data" / "wine_clean.csv"
LEARNED_CSV_PATH = BASE_DIR / "datasets" / "learned_wines.csv"

WINE_TYPES_ORDER = ["Red", "White", "Rosé", "Sparkling", "Dessert"]


class WineCatalogService:
    """
    Provides wine types and lists derived dynamically from wine_clean.csv
    and datasets/learned_wines.csv.
    """

    def __init__(self) -> None:
        self.reload()

    def reload(self) -> None:
        """Reload datasets and rebuild category/type map."""
        base_df = pd.read_csv(CSV_PATH)
        if LEARNED_CSV_PATH.exists() and os.path.getsize(LEARNED_CSV_PATH) > 0:
            try:
                learned_df = pd.read_csv(LEARNED_CSV_PATH)
                self._df = pd.concat([base_df, learned_df], ignore_index=True)
            except Exception:
                self._df = base_df
        else:
            self._df = base_df

        # Clean duplicates
        self._df = self._df.drop_duplicates(subset=["Wine_Name"], keep="first")
        self._type_map: Dict[str, List[str]] = self._build_map()

    def _build_map(self) -> Dict[str, List[str]]:
        """Group Wine_Name values by Wine_Type."""
        mapping: Dict[str, List[str]] = {}
        for _, row in self._df.iterrows():
            name = str(row.get("Wine_Name", "")).strip()
            wtype = str(row.get("Wine_Type", "")).strip().capitalize()
            if not name or not wtype:
                continue
            mapping.setdefault(wtype, [])
            if name not in mapping[wtype]:
                mapping[wtype].append(name)

        for wtype in mapping:
            mapping[wtype] = sorted(list(set(mapping[wtype])))
        return mapping

    def get_wine_types(self) -> List[str]:
        """Return unique wine types present or default ordered list."""
        present = set(self._type_map.keys())
        ordered = [t for t in WINE_TYPES_ORDER if t in present]
        extra = sorted(list(present - set(WINE_TYPES_ORDER)))
        return ordered + extra

    def get_wines_by_type(self, wine_type: str) -> List[str]:
        """Return sorted list of wine names for a given wine type."""
        wt_cap = wine_type.strip().capitalize()
        return self._type_map.get(wt_cap, [])

    def get_all_wines(self) -> List[str]:
        """Return sorted list of all wine names in catalog."""
        names = set(self._df["Wine_Name"].dropna().str.strip())
        return sorted(list(names))
