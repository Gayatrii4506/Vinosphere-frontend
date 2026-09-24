import os
import faiss
import numpy as np

# Create output folder
os.makedirs("faiss_index", exist_ok=True)

# Load embeddings
food_embeddings = np.load("embeddings/food_embeddings.npy")
wine_embeddings = np.load("embeddings/wine_embeddings.npy")

# Convert to float32 (required by FAISS)
food_embeddings = food_embeddings.astype("float32")
wine_embeddings = wine_embeddings.astype("float32")

# Normalize embeddings for cosine similarity
faiss.normalize_L2(food_embeddings)
faiss.normalize_L2(wine_embeddings)

# Create indices
food_index = faiss.IndexFlatIP(food_embeddings.shape[1])
wine_index = faiss.IndexFlatIP(wine_embeddings.shape[1])

# Add embeddings
food_index.add(food_embeddings)
wine_index.add(wine_embeddings)

# Save indices
faiss.write_index(food_index, "faiss_index/food.index")
faiss.write_index(wine_index, "faiss_index/wine.index")

print("Food vectors:", food_index.ntotal)
print("Wine vectors:", wine_index.ntotal)

print("\n✅ FAISS indices created successfully!")