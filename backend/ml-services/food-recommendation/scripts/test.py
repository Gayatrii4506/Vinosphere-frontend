import os
import pandas as pd

# ======================================================
# FILE PATHS
# ======================================================

INPUT_FILE = "datasets/food_dataset.csv"
OUTPUT_FILE = "processed_data/food_clean.csv"

# ======================================================
# LOAD DATA
# ======================================================

df = pd.read_csv(INPUT_FILE)

print("=" * 60)
print("FOOD DATASET PREPROCESSING")
print("=" * 60)

print(f"\nInitial Rows : {len(df)}")

# ======================================================
# REMOVE EXTRA SPACES
# ======================================================

for col in df.columns:
    if df[col].dtype == "object":
        df[col] = df[col].astype(str).str.strip()

# ======================================================
# REMOVE DUPLICATES
# ======================================================

before = len(df)
df = df.drop_duplicates(subset=["Food_ID"])
print(f"\nDuplicate Food_ID Removed : {before-len(df)}")

before = len(df)
df = df.drop_duplicates(subset=["Food_Name"])
print(f"Duplicate Food_Name Removed : {before-len(df)}")

# ======================================================
# STANDARDIZE BODY
# ======================================================

body_map = {
    "Light-Medium": "Medium",
    "Medium-Light": "Medium",
    "Medium-Full": "Full",
    "Full-Medium": "Full"
}

df["Recommended_Body"] = (
    df["Recommended_Body"]
    .replace(body_map)
    .fillna("Medium")
)

# ======================================================
# STANDARDIZE SWEETNESS
# ======================================================

sweetness_map = {
    "Off dry": "Off-Dry",
    "Off-dry": "Off-Dry",
    "Semi Sweet": "Off-Dry",
    "Semi-Sweet": "Off-Dry"
}

df["Recommended_Sweetness"] = (
    df["Recommended_Sweetness"]
    .replace(sweetness_map)
    .fillna("Dry")
)

# ======================================================
# STANDARDIZE ACIDITY
# ======================================================

df["Recommended_Acidity"] = (
    df["Recommended_Acidity"]
    .fillna("Medium")
)

# ======================================================
# STANDARDIZE TANNIN
# ======================================================

tannin_map = {
    "Low-Medium": "Medium",
    "Medium-Low": "Medium",
    "Medium-High": "High"
}

df["Recommended_Tannin"] = (
    df["Recommended_Tannin"]
    .replace(tannin_map)
    .fillna("Medium")
)

# ======================================================
# FILL MISSING SPICE LEVEL
# ======================================================

df["Spice_Level"] = (
    df["Spice_Level"]
    .replace("", pd.NA)
    .fillna("Medium")
)

# ======================================================
# NORMALIZE WINE TYPE
# ======================================================

def normalize_wine_type(value):

    if pd.isna(value):
        return "Red"

    value = str(value).strip().lower()

    # Already correct
    if value == "red":
        return "Red"

    if value == "white":
        return "White"

    if value in ["rosé", "rose"]:
        return "Rosé"

    if value == "sparkling":
        return "Sparkling"

    if value == "dessert":
        return "Dessert"

    # RED
    if any(word in value for word in [
        "cabernet","merlot","pinot noir","pinotage",
        "shiraz","syrah","malbec","barbera",
        "chianti","zinfandel","gamay",
        "grenache","tempranillo","douro",
        "agiorgitiko","côtes du rhône"
    ]):
        return "Red"

    # WHITE
    if any(word in value for word in [
        "chardonnay","sauvignon","riesling",
        "chenin","viognier","pinot gris",
        "grüner","verdicchio","vermentino",
        "assyrtiko","muscat","moscatel"
    ]):
        return "White"

    # ROSÉ
    if "rosé" in value or "rose" in value:
        return "Rosé"

    # SPARKLING
    if any(word in value for word in [
        "sparkling","champagne","prosecco","cava"
    ]):
        return "Sparkling"

    # DESSERT
    if any(word in value for word in [
        "dessert",
        "port",
        "sherry",
        "late harvest",
        "tokaji",
        "moscato"
    ]):
        return "Dessert"

    return "Red"


df["Recommended_Wine_Type"] = (
    df["Recommended_Wine_Type"]
    .apply(normalize_wine_type)
)

# ======================================================
# VALIDATE
# ======================================================

allowed = ["Red","White","Rosé","Sparkling","Dessert"]

invalid = df.loc[
    ~df["Recommended_Wine_Type"].isin(allowed),
    ["Food_Name","Recommended_Wine_Type"]
]

print("\nInvalid Wine Types Remaining:")
print(len(invalid))

# ======================================================
# MISSING VALUES
# ======================================================

print("\nRemaining Missing Values\n")
print(df.isnull().sum())

# ======================================================
# UNIQUE VALUES
# ======================================================

print("\nWine Types")
print(df["Recommended_Wine_Type"].unique())

print("\nBody")
print(df["Recommended_Body"].unique())

print("\nSweetness")
print(df["Recommended_Sweetness"].unique())

print("\nAcidity")
print(df["Recommended_Acidity"].unique())

print("\nTannin")
print(df["Recommended_Tannin"].unique())

# ======================================================
# SAVE
# ======================================================

os.makedirs("processed_data", exist_ok=True)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "="*60)
print("Food Dataset Saved Successfully!")
print("="*60)
print(f"Rows : {len(df)}")
print(f"Saved : {OUTPUT_FILE}")