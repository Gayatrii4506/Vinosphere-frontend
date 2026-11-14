import os
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# Create output directory
os.makedirs("embeddings", exist_ok=True)

# Load datasets
food_df = pd.read_csv("processed_data/food_documents.csv")
wine_df = pd.read_csv("processed_data/wine_documents.csv")

# Load embedding model
print("Loading embedding model...")
model = SentenceTransformer("all-MiniLM-L6-v2")

# Generate embeddings
print("Generating food embeddings...")
food_embeddings = model.encode(
    food_df["document"].tolist(),
    convert_to_numpy=True,
    show_progress_bar=True
)

print("Generating wine embeddings...")
wine_embeddings = model.encode(
    wine_df["document"].tolist(),
    convert_to_numpy=True,
    show_progress_bar=True
)

# Save embeddings
np.save("embeddings/food_embeddings.npy", food_embeddings)
np.save("embeddings/wine_embeddings.npy", wine_embeddings)

print("\nEmbedding Shapes:")
print("Food:", food_embeddings.shape)
print("Wine:", wine_embeddings.shape)

print("\n✅ Embeddings generated successfully!")