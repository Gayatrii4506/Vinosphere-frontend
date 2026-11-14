import os
import pandas as pd

# ----------------------------
# Create output folder
# ----------------------------
os.makedirs("processed_data", exist_ok=True)

# ----------------------------
# Load datasets
# ----------------------------
food_df = pd.read_csv("datasets/food_dataset.csv")
wine_df = pd.read_csv("datasets/wine_dataset.csv")

print("========== ORIGINAL DATA ==========")
print("Food:", food_df.shape)
print("Wine:", wine_df.shape)

# ----------------------------
# FOOD DATA CLEANING
# ----------------------------

# Remove duplicate food names
food_df = food_df.drop_duplicates(subset=["Food_Name"])

# Fill missing values
food_df = food_df.fillna("Unknown")

# Standardize categorical columns
food_columns = [
    "Spice_Level",
    "Fat_Level",
    "Sweetness",
    "Acidity",
    "Saltiness",
    "Umami",
    "Texture",
    "Cooking_Method",
    "Flavor_Intensity",
    "Recommended_Wine_Type",
    "Recommended_Body",
    "Recommended_Sweetness",
    "Recommended_Acidity",
    "Recommended_Tannin"
]

for col in food_columns:
    if col in food_df.columns:
        food_df[col] = (
            food_df[col]
            .astype(str)
            .str.strip()
            .str.title()
        )

# Reassign Food_ID
food_df["Food_ID"] = range(1, len(food_df) + 1)

# ----------------------------
# WINE DATA CLEANING
# ----------------------------

# Remove duplicate Wine + Winery combinations
wine_df = wine_df.drop_duplicates(subset=["Wine_Name", "Winery"])

wine_df = wine_df.fillna("Unknown")

wine_columns = [
    "Wine_Type",
    "Body",
    "Sweetness",
    "Acidity",
    "Tannin",
    "Oak_Aged",
    "Availability"
]

for col in wine_columns:
    if col in wine_df.columns:
        wine_df[col] = (
            wine_df[col]
            .astype(str)
            .str.strip()
            .str.title()
        )

# Reassign Wine_ID
wine_df["Wine_ID"] = [
    f"W{i:03d}" for i in range(1, len(wine_df) + 1)
]

# ----------------------------
# Save cleaned datasets
# ----------------------------

food_df.to_csv(
    "processed_data/food_clean.csv",
    index=False
)

wine_df.to_csv(
    "processed_data/wine_clean.csv",
    index=False
)

print("\n========== CLEANED DATA ==========")
print("Food:", food_df.shape)
print("Wine:", wine_df.shape)

print("\n✅ Clean datasets saved successfully!")