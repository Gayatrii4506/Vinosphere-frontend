# VinoSphere Indian Food–Wine Pairing: Research Evaluation Protocol
## Methodological Framework, Experimental Design & Reproducibility Guidelines

**Paper Working Title**: *An Explainable and Culturally-Aware Indian Food–Wine Recommendation Framework Using a Self-Curated Dataset*  
**Research Unit**: Experimental Recommender Systems & Computational Gastronomy Laboratory  
**Directory Location**: `research_experiments/food_wine_pairing_2026/`  
**Date**: October 2026  

---

## 1. Research Objectives & Problem Statement

Standard computational gastronomy frameworks and commercial wine recommendation applications (e.g., Vivino, Delectable, CellarTracker) are overwhelmingly calibrated toward Western culinary paradigms. These systems assume mild spice palates, simple fats, and Western cooking techniques (e.g., roasting, pan-searing), which fail to model the complex gustatory dimensions of sub-regional Indian cuisine—such as capsaicin pungency, ghee/dairy emulsion, complex masala layering, and strict vegetarian/Jain dietary constraints.

The objective of this experimental evaluation is to establish a **reproducible, scientifically defensible empirical baseline** for the VinoSphere Food–Wine Recommendation Framework.

### Core Research Questions (RQs):
- **RQ1 (Enological Rule Consistency)**: Does the hybrid framework maintain strict sommelier compatibility constraints across diverse sub-regional Indian dishes compared to random and unconstrained semantic embeddings?
- **RQ2 (Ablation & Ranking Dynamics)**: How does the incorporation of dense SentenceTransformer semantic embeddings ($35\%$) alter candidate ranking relative to discrete rule-based attribute matching ($65\%$)? Does semantic reranking enhance recommendation diversity or introduce enological clashes?
- **RQ3 (Two-Stage vs. Full-Catalog Reranking)**: Does the production two-stage pipeline (filtering top-20 attribute candidates prior to semantic reranking) provide superior enological safety compared to unconstrained full-catalog hybrid scoring?
- **RQ4 (Catalog Coverage & Entropy)**: Does hybrid scoring mitigate the catalog starvation problem inherent in deterministic rule-based systems?

---

## 2. Dataset Verification & Provenance (Task 1)

All experiments operate strictly on the processed datasets and embeddings located in `backend/ml-services/food-recommendation/`:

### 2.1. Verified Catalog Dimensions
1. **Food Catalog (`processed_data/food_clean.csv`)**:
   - **Total Records**: Exactly **499 rows** $\times$ **27 columns**.
   - **Authentic Indian Regional Dishes**: Exactly **186 curated regional dishes ($37.3\%$)** spanning 15+ recognized sub-regional culinary traditions (Punjabi, Tamil Nadu, Bengali, Gujarati, Maharashtrian, Rajasthani, Karnataka, Kerala, Andhra, Mughlai, Kashmiri, Goan, Hyderabadi, Chettinad, Bihari, Assamese, Odia, Parsi, Sindhi).
   - **International Comparison Dishes**: Exactly **313 dishes ($62.7\%$)** covering 10 major global cuisines (Italian, Chinese, Japanese, American, French, Mexican, Thai, Greek, Spanish, Korean).
   - **Dietary Breakdown**: 223 Vegetarian dishes, 276 Non-Vegetarian dishes.
   - **Completeness**: 0 duplicates across `Food_Name` or `Food_ID`. Missing values: $0\%$ in all 26 culinary and enological attribute columns (`image_url` missing in 358 rows).
2. **Wine Catalog (`processed_data/wine_clean.csv`)**:
   - **Total Records**: Exactly **300 commercial Indian wines** $\times$ **26 columns**.
   - **Estate Provenance**: Authentic commercial labels from **22 verified Indian wineries** (Sula Vineyards: 29, Grover Zampa Vineyards: 23, York Winery: 19, Fratelli Wines: 18, Chandon India: 15, KRSMA Estates, Charosa Vineyards, Reveilo Wines, Vallonné Vineyards, Big Banyan Wines, Four Seasons, Chateau Indage, etc.).
   - **Viticultural Terroir**: Domestic production concentrated in Maharashtra ($n=264$, Nashik/Dindori/Akluj/Sangli/Pune) and Karnataka ($n=36$, Nandi Hills/Hampi Hills/Doddaballapur).
   - **Enological Styles**: Red ($101$), White ($81$), Sparkling ($48$), Rosé ($45$), Dessert ($25$).
   - **Completeness**: 0 duplicates across `Wine_Name` or `Wine_ID`. Missing values: $0\%$ in all 25 enological columns (`image_url` missing in 54 rows).
3. **Dense Precomputed Embeddings**:
   - `embeddings/food_embeddings.npy`: Shape $(499, 384)$, float32, L2-normalized.
   - `embeddings/wine_embeddings.npy`: Shape $(300, 384)$, float32, L2-normalized.
   - Model: `sentence-transformers/all-MiniLM-L6-v2` (384-dimensional dense representation).

### 2.2. Discrepancies Noted from Previous Audits
- **`learned_foods.csv` Tokenizer Inconsistency**: The dynamic cache file header has 8 columns, while Gemini append operations write 26 columns. In production, this causes a pandas `ParserError` that is silently trapped under `try...except`, defaulting back to `food_clean.csv`. For experimental purity, our evaluation suite bypasses the dynamic cache and queries the clean, verified catalog directly.
- **Annotated Target Labels**: The `Recommended_Wine_*` fields in `food_clean.csv` represent curated enological targets derived from sommelier literature, **not empirical double-blind human panel ratings**.

---

## 3. Evaluation Dataset: 30 Benchmark Indian Dishes (Task 2)

To ensure comprehensive cultural, sensory, and enological coverage, **30 representative Indian dishes** were isolated from `food_clean.csv`. The selection is saved to [`benchmark_queries.csv`](file:///c:/Users/Gayatri/OneDrive/Desktop/FYP/good%20ui/research_experiments/food_wine_pairing_2026/benchmark_queries.csv).

### Table 1: Benchmark Query Distribution Across Sensory & Cultural Dimensions

| Dish Name | Regional Cuisine | Preparation Category | Protein Foundation | Spice Level | Fat Level | Curated Target Style |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Butter Chicken** | Punjabi | Curry | Chicken | Medium | High | Off-Dry White (Med Body) |
| **Tandoori Chicken** | Punjabi | Starter / Tandoor | Chicken | Medium | Medium | Dry Red / Rosé (Med Body) |
| **Palak Paneer** | Punjabi | Curry | Paneer | Mild | High | Crisp White / Light Red |
| **Shahi Paneer** | Mughlai | Curry | Paneer | Mild | High | Off-Dry White (Med Body) |
| **Chole Bhature** | Punjabi | Street Food / Snack | Chickpeas | High | Medium | Off-Dry White / Sparkling |
| **Sarson da Saag** | Punjabi | Main Course | Mustard Greens | Medium | High | Earthy Red / Rich White |
| **Paneer Tikka** | Punjabi | Starter / Tandoor | Paneer | Medium | Medium | Rosé / Crisp White |
| **Rogan Josh** | Kashmiri | Curry | Mutton / Lamb | Medium | High | Dry Full Red |
| **Galouti Kebab** | Awadhi | Starter | Mutton / Lamb | Mild | High | Full Bodied Oaked Red |
| **Shahi Tukda** | Awadhi | Dessert | Bread / Milk | Low | High | Sweet Dessert Wine |
| **Goan Fish Curry** | Goan Coastal | Curry / Seafood | Fish | High | Medium | Crisp High-Acid White |
| **Pork Vindaloo** | Goan Coastal | Curry | Pork | Very High | High | Off-Dry White / Crisp Rosé |
| **Bebinca** | Goan Coastal | Dessert | Coconut / Egg | Low | High | Sweet Fortified / Dessert |
| **Hyderabadi Chicken Biryani**| Hyderabadi | Rice & Biryani | Chicken | High | Medium | Off-Dry White / Fruity Red |
| **Chettinad Chicken** | Chettinad | Curry | Chicken | Very High | Medium | Aromatic Off-Dry White |
| **Masala Dosa** | Tamil Nadu | Breakfast / Snack | Rice & Lentil | Medium | Low | Crisp Sparkling / Dry White |
| **Kerala Fish Moilee** | Kerala Coastal | Curry / Seafood | Fish | Mild | Medium | Crisp Aromatic White |
| **Rajasthani Laal Maas** | Rajasthani | Curry | Mutton | High | High | Bold Tannic Red |
| **Dal Baati Churma** | Rajasthani | Main Course | Lentils & Flour | Medium | High | Medium Bodied Red |
| **Macher Jhol** | Bengali | Curry / Seafood | Fish | Medium | Low | Light Dry White |
| **Rasgulla** | Bengali | Dessert | Chhena | Low | Low | Sparkling / Sweet White |
| **Dhokla** | Gujarati | Snack | Fermented Gram | Mild | Low | Brut Sparkling |
| **Misal Pav** | Maharashtrian | Street Food | Sprouts | High | Medium | Sparkling / Off-Dry White |
| **Gongura Mutton** | Andhra | Curry | Mutton | High | Medium | Medium-Full Acidic Red |
| **Bisi Bele Bath** | Karnataka | Rice Dish | Lentils & Rice | Medium | Medium | Fruity Red / Off-Dry White |
| **Mysore Pak** | Karnataka | Dessert | Gram Flour & Ghee | Low | High | Sweet Dessert Wine |
| **Litti Chokha** | Bihari | Main Course | Gram Flour | Medium | Medium | Earthy Medium Red |
| **Parsi Dhansak** | Parsi | Curry / Lentils | Mutton | Medium | Medium | Medium Bodied Red |
| **Chicken Ghee Roast** | Mangalorean | Roast / Starter | Chicken | High | High | Off-Dry White / Fruity Red |
| **Gulab Jamun** | Mughlai | Dessert | Khoya / Dairy | Low | High | Sweet Dessert Wine |

---

## 4. Evaluation Ethics & Ground Truth Policy

### 4.1. Strict Prohibition of Circular Ground Truth
In machine learning evaluation, a critical methodological failure is **circular evaluation**—evaluating a model against labels generated by the model itself, or treating the model's training heuristics as objective ground truth.

- **Prohibition 1**: We do NOT report Precision@K, Recall@K, or NDCG@K using the food-side `Recommended_Wine_*` annotations as ground truth without explicitly identifying them as **internal rule-consistency diagnostics**.
- **Prohibition 2**: We do NOT use the hybrid model's recommendations to generate synthetic ground-truth ratings.
- **Prohibition 3**: We do NOT fabricate or simulate human sommelier ratings.

### 4.2. Human-in-the-Loop Sommelier Evaluation Protocol
To bridge the gap between algorithmic diagnostics and certified sensory validation, this suite generates a standardized, candidate-pair evaluation worksheet: [`expert_rating_template.csv`](file:///c:/Users/Gayatri/OneDrive/Desktop/FYP/good%20ui/research_experiments/food_wine_pairing_2026/expert_rating_template.csv).
- **Structure**: Contains **416 unique (Food, Wine) candidate dyads** recommended in the top-5 across all evaluated models for the 30 benchmark queries.
- **Blinding Protocol**: Model identities are removed. Evaluators are presented with full food attributes (spice, fat, cooking method) and full wine attributes (grape, acidity, body, sweetness, tannin, price).
- **Grading Scale for Expert Review**:
  1. `Sommelier_Relevance_Grade_0to3`:
     - `0`: Incompatible / Harsh Clash (e.g., high tannin red with fiery vindaloo).
     - `1`: Tolerable / Neutral (does not clash, but does not elevate).
     - `2`: Harmonious / Good Sommelier Match (balanced acid/sweetness/weight).
     - `3`: Exemplary / Benchmark Pairing (congruent flavors, ideal palate cleanse).
  2. `Binary_Acceptability_0or1`: Binary clinical acceptability threshold ($\ge 2 \rightarrow 1, < 2 \rightarrow 0$).
  3. `Flavor_Harmony_Score_1to5` & `Aroma_Affinity_Score_1to5`: Continuous sensory scales.

---

## 5. Model Definitions & Baseline Formulations (Task 3)

All models rank candidates from the identical catalog of $M = 300$ commercial Indian wines.

### 5.1. Model A: Random Ranking Baseline (Monte Carlo $N=100$)
For each benchmark query, 5 wines are sampled uniformly at random without replacement from the 300-wine catalog. To obtain statistically stable estimates, the procedure is repeated across $N=100$ independent random seeds ($S \in [1, 100]$), reporting the mean and standard deviation.

### 5.2. Model B: Attribute-Only Compatibility Scorer
Evaluates candidates strictly using the heuristic sommelier compatibility function:
$$S_{\text{attr}}(w, f) = 6 \cdot \mathbb{I}[T_w = T_f^*] + 3 \cdot \mathbb{I}[B_w = B_f^*] + 2 \cdot \mathbb{I}[S_w = S_f^*] + 2 \cdot \mathbb{I}[A_w = A_f^*] + 2 \cdot \mathbb{I}[\text{Tan}_w = \text{Tan}_f^*]$$
Candidates are sorted descending by $S_{\text{attr}}(w, f)$, with deterministic tie-breaking based on catalog order. Semantic embeddings are completely omitted.

### 5.3. Model C: Semantic-Only (SentenceTransformer) Scorer
Evaluates candidates strictly via dense document embedding similarity:
$$S_{\text{semantic}}(w, f) = \frac{\mathbf{e}_f \cdot \mathbf{e}_w}{\|\mathbf{e}_f\|_2 \|\mathbf{e}_w\|_2}$$
where $\mathbf{e}_f, \mathbf{e}_w \in \mathbb{R}^{384}$ are generated by `all-MiniLM-L6-v2`. Candidates are sorted descending by $S_{\text{semantic}}$ across the full 300-wine catalog. Attribute compatibility rules are completely omitted.

### 5.4. Model D: VinoSphere Production Two-Stage Hybrid Engine
Reflects the actual production microservice in [`recommendation_engine.py`](file:///c:/Users/Gayatri/OneDrive/Desktop/FYP/good%20ui/backend/ml-services/food-recommendation/services/recommendation_engine.py):
- **Stage 1 (Heuristic Candidate Selection)**: Evaluates $S_{\text{attr}}(w, f)$ across all 300 wines and isolates the top $K_1 = 20$ candidates ($\mathcal{W}_{\text{top20}}$).
- **Stage 2 (Semantic Reranking & Fusion)**: Computes $S_{\text{semantic}}(w, f)$ for $w \in \mathcal{W}_{\text{top20}}$ and normalizes attribute scores:
  $$S_{\text{attr\_norm}}(w, f) = \frac{S_{\text{attr}}(w, f)}{\max_{w' \in \mathcal{W}_{\text{top20}}} S_{\text{attr}}(w', f)}$$
  $$S_{\text{final}}(w, f) = 0.65 \cdot S_{\text{attr\_norm}}(w, f) + 0.35 \cdot S_{\text{semantic}}(w, f)$$
  Returns the top $K=5$ wines maximizing $S_{\text{final}}$.

### 5.5. Model E: Full-Catalog Hybrid Variant (Ablation)
Computes $S_{\text{final}}(w, f) = 0.65 \cdot S_{\text{attr\_norm}}(w, f) + 0.35 \cdot S_{\text{semantic}}(w, f)$ directly over all $M=300$ wines without Stage 1 candidate pre-filtering. This tests whether pre-filtering to top-20 unnecessarily restricts semantic search.

---

## 6. Evaluation Metrics & Diagnostic Formulations (Task 4 & 5)

Where independent sommelier ratings are pending, models are compared across four objective diagnostic dimensions:

### 6.1. Enological Rule Consistency Diagnostics
1. **Target Wine Style Match Rate ($\%$)**:
   $$\text{StyleMatchRate} = \frac{1}{|Q| \cdot K} \sum_{q \in Q} \sum_{k=1}^K \mathbb{I}[T_{w_{q, k}} = T_{f_q}^*] \times 100\%$$
2. **Structural Attribute Match Rates ($\%$)**: Body, Sweetness, Acidity, Tannin match percentages.
3. **Mean Attribute Compatibility Score ($\bar{S}_{\text{attr}} \in [0, 15]$)**:
   $$\bar{S}_{\text{attr}} = \frac{1}{|Q| \cdot K} \sum_{q \in Q} \sum_{k=1}^K S_{\text{attr}}(w_{q, k}, f_q)$$
4. **Sommelier Clash Rate ($\%$)**:
   - *Spice–Tannin Clash*: High-tannin wine paired with high-spice dish ($\text{Tan}_w = \text{High} \land \text{Spice}_f \in \{\text{High}, \text{Very High}\}$). Tannins react astringently with capsaicin, amplifying chemical burning sensations.
   - *Sweet–Dry Clash*: Dry wine paired with sweet dessert dish ($S_w = \text{Dry} \land \text{Sweetness}_f = \text{High}$). Renders the wine unpleasantly sour and astringent.

### 6.2. Ablation & Ranking Overlap Diagnostics
1. **Top-1 Exact Agreement Rate ($\%$)**:
   $$\text{Agreement@1}(M_1, M_2) = \frac{1}{|Q|} \sum_{q \in Q} \mathbb{I}[R_{M_1}(q, 1) = R_{M_2}(q, 1)] \times 100\%$$
2. **Mean Top-5 Jaccard Similarity**:
   $$\bar{J}@5(M_1, M_2) = \frac{1}{|Q|} \sum_{q \in Q} \frac{|R_{M_1}@5(q) \cap R_{M_2}@5(q)|}{|R_{M_1}@5(q) \cup R_{M_2}@5(q)|}$$
3. **Mean Top-5 Overlap Count**: Number of shared wines in top-5 ($[0, 5]$).
4. **Kendall's Rank Correlation Coefficient ($\tau$)**: Rank concordance on candidate pairings.

### 6.3. Diversity & Catalog Utilization Diagnostics
1. **Unique Wines Recommended ($U_{|Q|}$)**: Distinct wine count across all 150 recommendation slots ($30 \times 5$).
2. **Catalog Coverage ($\%$)**: $U_{|Q|} / 300 \times 100\%$.
3. **Shannon Recommendation Entropy ($H$)**:
   $$H = -\sum_{i=1}^{M} p_i \log_2 p_i \quad \text{where } p_i = \frac{\text{Count}(w_i)}{\sum_j \text{Count}(w_j)}$$

### 6.4. Computational Efficiency
- **Mean Query Latency (ms)** & **95th Percentile Latency (ms)** measured over all 30 queries.

---

## 7. Execution & Reproducibility Instructions

To execute the complete experimental suite from the repository root:

```bash
# 1. Activate the Python virtual environment
.\backend\ml-services\food-recommendation\venv\Scripts\activate

# 2. Install dependencies (if not already installed)
pip install -r research_experiments/food_wine_pairing_2026/requirements.txt

# 3. Execute the reproducibility script
python research_experiments/food_wine_pairing_2026/reproduce_experiments.py
```

The script will recompute all baseline rankings, compute ablation metrics, verify catalog invariants, and overwrite:
- `research_experiments/food_wine_pairing_2026/benchmark_queries.csv`
- `research_experiments/food_wine_pairing_2026/expert_rating_template.csv`
- `research_experiments/food_wine_pairing_2026/baseline_comparison.csv`
- `research_experiments/food_wine_pairing_2026/ablation_results.csv`

*(End of Evaluation Protocol)*
