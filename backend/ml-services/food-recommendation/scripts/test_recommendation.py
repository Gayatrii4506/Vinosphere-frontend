import faiss
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# ==========================
# Load Model
# ==========================

print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# ==========================
# Load Dataset
# ==========================

food_df = pd.read_csv("processed_data/food_documents.csv")
wine_df = pd.read_csv("processed_data/wine_documents.csv")

# ==========================
# Load FAISS Index
# ==========================

wine_index = faiss.read_index("faiss_index/wine.index")

# ==========================
# User Input
# ==========================

food_name = input("\nEnter a food name: ")

# ==========================
# Find Food
# ==========================

result = food_df[
    food_df["Food_Name"].str.lower() == food_name.lower()
]

if len(result) == 0:
    print("\nFood not found!")
    exit()

food_document = result.iloc[0]["document"]

# ==========================
# Generate Query Embedding
# ==========================

query_embedding = model.encode(
    [food_document],
    convert_to_numpy=True
).astype("float32")

faiss.normalize_L2(query_embedding)

# ==========================
# Search Top 5 Wines
# ==========================

k = 5

scores, indices = wine_index.search(query_embedding, k)

print("\nTop Wine Recommendations\n")

for score, idx in zip(scores[0], indices[0]):

    wine = wine_df.iloc[idx]

    print("=" * 50)

    print("Wine:", wine["Wine_Name"])
    print("Winery:", wine["Winery"])
    print("Type:", wine["Wine_Type"])
    print("Variety:", wine["Variety"])
    print("Similarity:", round(float(score), 3))