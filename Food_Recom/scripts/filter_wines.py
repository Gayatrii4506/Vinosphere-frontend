import pandas as pd

# Load datasets
food_df = pd.read_csv("processed_data/food_clean.csv")
wine_df = pd.read_csv("processed_data/wine_clean.csv")


def filter_wines(food_name):
    # Find the food
    food = food_df[
        food_df["Food_Name"].str.lower() == food_name.lower()
    ]

    if len(food) == 0:
        print("Food not found!")
        return pd.DataFrame()

    food = food.iloc[0]

    filtered = wine_df.copy()

    # -----------------------------
    # 1. Wine Type (Strict)
    # -----------------------------
    filtered = filtered[
        filtered["Wine_Type"].str.lower()
        == str(food["Recommended_Wine_Type"]).lower()
    ]

    # -----------------------------
    # 2. Body (Strict)
    # -----------------------------
    filtered = filtered[
        filtered["Body"].str.lower()
        == str(food["Recommended_Body"]).lower()
    ]

    # -----------------------------
    # 3. Sweetness (Strict)
    # -----------------------------
    filtered = filtered[
        filtered["Sweetness"].str.lower()
        == str(food["Recommended_Sweetness"]).lower()
    ]

    # -----------------------------
    # 4. Acidity (Strict)
    # -----------------------------
    filtered = filtered[
        filtered["Acidity"].str.lower()
        == str(food["Recommended_Acidity"]).lower()
    ]

    # -----------------------------
    # 5. Tannin (Strict)
    # -----------------------------
    filtered = filtered[
        filtered["Tannin"].str.lower()
        == str(food["Recommended_Tannin"]).lower()
    ]

    return filtered


if __name__ == "__main__":

    wines = filter_wines("Butter Chicken")

    print("\nTotal Wines Found:", len(wines))

    print(
        wines[
            [
                "Wine_Name",
                "Wine_Type",
                "Body",
                "Sweetness",
                "Acidity",
                "Tannin",
            ]
        ]
    )