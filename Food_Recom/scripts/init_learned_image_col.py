import pandas as pd
from pathlib import Path

paths = [
    Path("Food_Recom/datasets/learned_foods.csv"),
    Path("Food_Recom/datasets/learned_wines.csv"),
]

for p in paths:
    if p.exists():
        try:
            df = pd.read_csv(p)
            if "image_url" not in df.columns:
                df["image_url"] = None
                df.to_csv(p, index=False)
                print(f"Added image_url to {p.name} ({len(df)} rows)")
            else:
                print(f"{p.name}: already has image_url ({len(df)} rows)")
        except Exception as e:
            print(f"{p.name}: error - {e}")
    else:
        print(f"{p.name}: does not exist (will be created by Gemini on first unknown dish)")
