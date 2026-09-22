import os
import pandas as pd

os.makedirs("processed_data", exist_ok=True)

food_df = pd.read_csv("processed_data/food_clean.csv")
wine_df = pd.read_csv("processed_data/wine_clean.csv")

# =========================
# FOOD DOCUMENTS
# =========================

food_documents = []

for _, row in food_df.iterrows():

    document = f"""
{row['Food_Name']} is a {row['Cuisine']} {row['Category']} commonly served as {row['Meal_Type']}.

It is {'vegetarian' if str(row['Vegetarian']).lower() == 'yes' else 'non-vegetarian'} and its primary protein source is {row['Protein']}.

The dish is prepared using {row['Cooking_Method']} cooking techniques and contains ingredients such as {row['Main_Ingredients']}.

Its flavor profile includes {row['Dominant_Flavors']} with a {row['Flavor_Intensity']} intensity.

It has a {row['Texture']} texture, {row['Spice_Level']} spice level, {row['Fat_Level']} fat content, {row['Sweetness']} sweetness, {row['Acidity']} acidity, {row['Saltiness']} saltiness and {row['Umami']} umami characteristics.

The ideal wine pairing is a {row['Recommended_Wine_Type']} wine with {row['Recommended_Body']} body, {row['Recommended_Sweetness']} sweetness, {row['Recommended_Acidity']} acidity and {row['Recommended_Tannin']} tannins.

This pairing enhances both the food and wine by balancing richness, acidity, texture and overall flavor.
"""

    food_documents.append(" ".join(document.split()))

food_df["document"] = food_documents

food_df.to_csv(
    "processed_data/food_documents.csv",
    index=False
)

# =========================
# WINE DOCUMENTS
# =========================

wine_documents = []

for _, row in wine_df.iterrows():

    document = f"""
{row['Wine_Name']} is an Indian {row['Wine_Type']} wine produced by {row['Winery']} in {row['Region']}.

It is made from {row['Variety']} grapes.

This wine has a {row['Body']} body with {row['Sweetness']} sweetness, {row['Acidity']} acidity and {row['Tannin']} tannins.

Its alcohol content is {row['Alcohol_Percentage']}.

The wine offers aromas of {row['Aroma_Notes']} and flavors of {row['Flavor_Notes']}.

It pairs particularly well with {row['Food_Categories']} and cuisines such as {row['Best_With_Cuisines']}.

The wine is described as: {row['Description']}.
"""

    wine_documents.append(" ".join(document.split()))

wine_df["document"] = wine_documents

wine_df.to_csv(
    "processed_data/wine_documents.csv",
    index=False
)

print("Food Documents:", len(food_documents))
print("Wine Documents:", len(wine_documents))
print("Documents regenerated successfully!")