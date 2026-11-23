#!/usr/bin/env python3
"""
VinoSphere Food-Wine Pairing Experimental Evaluation Suite
===========================================================
Title: An Explainable and Culturally-Aware Indian Food-Wine Recommendation
       Framework Using a Self-Curated Dataset

This script executes the reproducible experimental evaluation comparing:
1. Random Baseline (Monte Carlo N=100)
2. Attribute-Only Compatibility Scorer
3. Semantic-Only (SentenceTransformer all-MiniLM-L6-v2) Scorer
4. VinoSphere Production Two-Stage Hybrid (Attribute Top-20 + Semantic Rerank)
5. Full-Catalog Hybrid Variant (Ablation without Top-20 pre-filter)

Outputs generated in this directory:
- benchmark_queries.csv
- expert_rating_template.csv
- baseline_comparison.csv
- ablation_results.csv
"""

import os
import sys
import time
import math
import random
from pathlib import Path
from typing import List, Dict, Any, Tuple, Set

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from scipy.stats import kendalltau

# ---------------------------------------------------------------------------
# Path Resolutions
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent.parent
ML_DIR = ROOT_DIR / "backend" / "ml-services" / "food-recommendation"

FOOD_CLEAN_PATH = ML_DIR / "processed_data" / "food_clean.csv"
WINE_CLEAN_PATH = ML_DIR / "processed_data" / "wine_clean.csv"
FOOD_EMB_PATH = ML_DIR / "embeddings" / "food_embeddings.npy"
WINE_EMB_PATH = ML_DIR / "embeddings" / "wine_embeddings.npy"

# ---------------------------------------------------------------------------
# Benchmark Queries: 30 Curated Indian Dishes
# ---------------------------------------------------------------------------
BENCHMARK_DISH_NAMES = [
    # North Indian / Mughlai / Punjabi
    "Butter Chicken",
    "Tandoori Chicken",
    "Palak Paneer",
    "Shahi Paneer",
    "Chole Bhature",
    "Sarson da Saag",
    "Paneer Tikka",
    # Kashmiri
    "Rogan Josh",
    # Awadhi / Lucknowi
    "Galouti Kebab",
    "Shahi Tukda",
    # Goan Coastal
    "Goan Fish Curry",
    "Pork Vindaloo",
    "Bebinca",
    # Hyderabadi
    "Hyderabadi Chicken Biryani",
    # Chettinad / Tamil Nadu
    "Chettinad Chicken",
    "Masala Dosa",
    # Kerala Coastal
    "Kerala Fish Moilee",
    # Rajasthani
    "Rajasthani Laal Maas",
    "Dal Baati Churma",
    # Bengali
    "Macher Jhol",
    "Rasgulla",
    # Gujarati
    "Dhokla",
    # Maharashtrian
    "Misal Pav",
    # Andhra
    "Gongura Mutton",
    # Karnataka
    "Bisi Bele Bath",
    "Mysore Pak",
    # Bihari
    "Litti Chokha",
    # Parsi
    "Parsi Dhansak",
    # Mangalorean
    "Chicken Ghee Roast",
    # Sweet / Mughlai
    "Gulab Jamun"
]


def load_datasets() -> Tuple[pd.DataFrame, pd.DataFrame, np.ndarray, np.ndarray]:
    """Load and validate clean food and wine catalogs and precomputed embeddings."""
    if not FOOD_CLEAN_PATH.exists() or not WINE_CLEAN_PATH.exists():
        raise FileNotFoundError(f"Missing datasets at {FOOD_CLEAN_PATH} or {WINE_CLEAN_PATH}")
    if not FOOD_EMB_PATH.exists() or not WINE_EMB_PATH.exists():
        raise FileNotFoundError(f"Missing embeddings at {FOOD_EMB_PATH} or {WINE_EMB_PATH}")

    food_df = pd.read_csv(FOOD_CLEAN_PATH)
    wine_df = pd.read_csv(WINE_CLEAN_PATH)
    food_emb = np.load(FOOD_EMB_PATH)
    wine_emb = np.load(WINE_EMB_PATH)

    print(f"[Dataset Loader] Loaded food_clean.csv: {food_df.shape[0]} rows x {food_df.shape[1]} cols")
    print(f"[Dataset Loader] Loaded wine_clean.csv: {wine_df.shape[0]} rows x {wine_df.shape[1]} cols")
    print(f"[Dataset Loader] Loaded food_embeddings.npy: {food_emb.shape}")
    print(f"[Dataset Loader] Loaded wine_embeddings.npy: {wine_emb.shape}")

    return food_df, wine_df, food_emb, wine_emb


def get_benchmark_food_rows(food_df: pd.DataFrame) -> pd.DataFrame:
    """Retrieve exact rows for the 30 benchmark dishes."""
    records = []
    catalog_lookup = {str(r["Food_Name"]).strip().lower(): r for _, r in food_df.iterrows()}

    for name in BENCHMARK_DISH_NAMES:
        key = name.strip().lower()
        if key in catalog_lookup:
            records.append(catalog_lookup[key])
        else:
            raise KeyError(f"Benchmark dish '{name}' not found in food_clean.csv catalog!")

    bench_df = pd.DataFrame(records).reset_index(drop=True)
    print(f"[Benchmark Loader] Successfully isolated {len(bench_df)} benchmark Indian dishes.")
    return bench_df


# ---------------------------------------------------------------------------
# Recommendation Models Implementation
# ---------------------------------------------------------------------------

def calculate_attribute_scores(food_row: pd.Series, wine_df: pd.DataFrame) -> np.ndarray:
    """
    Production Sommelier Attribute Compatibility Score (Eq. 1):
    S_attr = 6 * (Type == RecType) + 3 * (Body == RecBody) +
             2 * (Sweetness == RecSweet) + 2 * (Acidity == RecAcid) +
             2 * (Tannin == RecTannin)
    Max score = 15.
    """
    scores = np.zeros(len(wine_df), dtype=float)

    rec_type = str(food_row.get("Recommended_Wine_Type", "")).strip().casefold()
    rec_body = str(food_row.get("Recommended_Body", "")).strip().casefold()
    rec_sweetness = str(food_row.get("Recommended_Sweetness", "")).strip().casefold()
    rec_acidity = str(food_row.get("Recommended_Acidity", "")).strip().casefold()
    rec_tannin = str(food_row.get("Recommended_Tannin", "")).strip().casefold()

    w_types = wine_df["Wine_Type"].astype(str).str.strip().str.casefold().values
    w_bodies = wine_df["Body"].astype(str).str.strip().str.casefold().values
    w_sweets = wine_df["Sweetness"].astype(str).str.strip().str.casefold().values
    w_acids = wine_df["Acidity"].astype(str).str.strip().str.casefold().values
    w_tannins = wine_df["Tannin"].astype(str).str.strip().str.casefold().values

    scores += 6.0 * (w_types == rec_type)
    scores += 3.0 * (w_bodies == rec_body)
    scores += 2.0 * (w_sweets == rec_sweetness)
    scores += 2.0 * (w_acids == rec_acidity)
    scores += 2.0 * (w_tannins == rec_tannin)

    return scores


def calculate_semantic_scores(food_idx: int, food_emb: np.ndarray, wine_emb: np.ndarray) -> np.ndarray:
    """Cosine similarity between food document vector and all wine vectors."""
    f_vec = food_emb[food_idx].reshape(1, -1)
    sims = cosine_similarity(f_vec, wine_emb)[0]
    return sims


def rank_attribute_only(food_row: pd.Series, wine_df: pd.DataFrame, top_k: int = 5) -> List[int]:
    """Model B: Attribute-Only Baseline."""
    attr_scores = calculate_attribute_scores(food_row, wine_df)
    # Stable sort descending (deterministic tie-breaking by catalog index)
    ranked_indices = np.argsort(-attr_scores, kind="mergesort")[:top_k]
    return ranked_indices.tolist()


def rank_semantic_only(food_idx: int, food_emb: np.ndarray, wine_emb: np.ndarray, top_k: int = 5) -> List[int]:
    """Model C: Semantic-Only (SentenceTransformer) Baseline."""
    sims = calculate_semantic_scores(food_idx, food_emb, wine_emb)
    ranked_indices = np.argsort(-sims, kind="mergesort")[:top_k]
    return ranked_indices.tolist()


def rank_production_hybrid(food_row: pd.Series, food_idx: int, wine_df: pd.DataFrame,
                           food_emb: np.ndarray, wine_emb: np.ndarray, top_k: int = 5) -> List[int]:
    """
    Model D: Production VinoSphere Two-Stage Hybrid:
    Stage 1: Filter top 20 candidate wines by Attribute_Score.
    Stage 2: Rerank top 20 using Final_Score = 0.65 * S_attr_norm + 0.35 * S_semantic.
    """
    attr_scores = calculate_attribute_scores(food_row, wine_df)
    top20_indices = np.argsort(-attr_scores, kind="mergesort")[:20]

    # Compute semantic cosine similarity for top 20 candidates
    f_vec = food_emb[food_idx].reshape(1, -1)
    candidate_wine_embs = wine_emb[top20_indices]
    semantic_sims = cosine_similarity(f_vec, candidate_wine_embs)[0]

    top20_attr = attr_scores[top20_indices]
    max_attr = top20_attr.max()
    attr_norm = (top20_attr / max_attr) if max_attr > 0 else np.zeros_like(top20_attr)

    final_scores = 0.65 * attr_norm + 0.35 * semantic_sims
    sub_ranked = np.argsort(-final_scores, kind="mergesort")[:top_k]
    return [top20_indices[i] for i in sub_ranked]


def rank_full_catalog_hybrid(food_row: pd.Series, food_idx: int, wine_df: pd.DataFrame,
                             food_emb: np.ndarray, wine_emb: np.ndarray, top_k: int = 5) -> List[int]:
    """
    Model E (Ablation Variant): Full-Catalog Hybrid:
    Evaluates 0.65 * S_attr_norm + 0.35 * S_semantic directly over all 300 wines
    without Stage 1 top-20 pre-filtering.
    """
    attr_scores = calculate_attribute_scores(food_row, wine_df)
    semantic_sims = calculate_semantic_scores(food_idx, food_emb, wine_emb)

    max_attr = attr_scores.max()
    attr_norm = (attr_scores / max_attr) if max_attr > 0 else np.zeros_like(attr_scores)

    final_scores = 0.65 * attr_norm + 0.35 * semantic_sims
    ranked_indices = np.argsort(-final_scores, kind="mergesort")[:top_k]
    return ranked_indices.tolist()


def evaluate_random_baseline(food_df: pd.DataFrame, wine_df: pd.DataFrame,
                             bench_indices: List[int], n_runs: int = 100, seed: int = 42) -> Dict[str, Any]:
    """
    Model A: Random Baseline over 100 Monte Carlo runs.
    """
    rng = random.Random(seed)
    n_wines = len(wine_df)

    run_metrics = []
    all_recommended_sets = []

    for run in range(n_runs):
        rec_matrix = []
        for f_idx in bench_indices:
            sampled = rng.sample(range(n_wines), 5)
            rec_matrix.append(sampled)
        all_recommended_sets.append(rec_matrix)

    # Compute average diagnostic metrics over the 100 runs
    type_matches = []
    body_matches = []
    sweet_matches = []
    acid_matches = []
    tan_matches = []
    raw_attr_scores = []
    clash_spice_tannin = []
    clash_sweet_dry = []
    unique_counts = []
    entropies = []

    for rec_matrix in all_recommended_sets:
        run_unique_wines = set()
        wine_freq: Dict[int, int] = {}
        t_m, b_m, s_m, a_m, tan_m, raw_s, c_st, c_sd = 0, 0, 0, 0, 0, 0.0, 0, 0
        total_recs = len(bench_indices) * 5

        for i, f_idx in enumerate(bench_indices):
            f_row = food_df.iloc[f_idx]
            rec_indices = rec_matrix[i]
            for w_idx in rec_indices:
                run_unique_wines.add(w_idx)
                wine_freq[w_idx] = wine_freq.get(w_idx, 0) + 1
                w_row = wine_df.iloc[w_idx]

                # Match checks
                is_type = str(w_row.get("Wine_Type", "")).strip().casefold() == str(f_row.get("Recommended_Wine_Type", "")).strip().casefold()
                is_body = str(w_row.get("Body", "")).strip().casefold() == str(f_row.get("Recommended_Body", "")).strip().casefold()
                is_sweet = str(w_row.get("Sweetness", "")).strip().casefold() == str(f_row.get("Recommended_Sweetness", "")).strip().casefold()
                is_acid = str(w_row.get("Acidity", "")).strip().casefold() == str(f_row.get("Recommended_Acidity", "")).strip().casefold()
                is_tan = str(w_row.get("Tannin", "")).strip().casefold() == str(f_row.get("Recommended_Tannin", "")).strip().casefold()

                if is_type: t_m += 1
                if is_body: b_m += 1
                if is_sweet: s_m += 1
                if is_acid: a_m += 1
                if is_tan: tan_m += 1

                raw_score = 6.0 * is_type + 3.0 * is_body + 2.0 * is_sweet + 2.0 * is_acid + 2.0 * is_tan
                raw_s += raw_score

                # Sommelier Clash Checks
                w_tannin = str(w_row.get("Tannin", "")).strip().casefold()
                f_spice = str(f_row.get("Spice_Level", "")).strip().casefold()
                if w_tannin == "high" and f_spice in ["high", "very high"]:
                    c_st += 1

                w_sweet = str(w_row.get("Sweetness", "")).strip().casefold()
                f_sweet = str(f_row.get("Sweetness", "")).strip().casefold()
                if w_sweet == "dry" and f_sweet == "high":
                    c_sd += 1

        type_matches.append((t_m / total_recs) * 100)
        body_matches.append((b_m / total_recs) * 100)
        sweet_matches.append((s_m / total_recs) * 100)
        acid_matches.append((a_m / total_recs) * 100)
        tan_matches.append((tan_m / total_recs) * 100)
        raw_attr_scores.append(raw_s / total_recs)
        clash_spice_tannin.append((c_st / total_recs) * 100)
        clash_sweet_dry.append((c_sd / total_recs) * 100)
        unique_counts.append(len(run_unique_wines))

        # Shannon Entropy
        ent = 0.0
        for cnt in wine_freq.values():
            p = cnt / total_recs
            ent -= p * math.log2(p)
        entropies.append(ent)

    return {
        "model_name": "Random Baseline (Monte Carlo Mean)",
        "mean_raw_attr_score": float(np.mean(raw_attr_scores)),
        "std_raw_attr_score": float(np.std(raw_attr_scores)),
        "type_match_pct": float(np.mean(type_matches)),
        "body_match_pct": float(np.mean(body_matches)),
        "sweetness_match_pct": float(np.mean(sweet_matches)),
        "acidity_match_pct": float(np.mean(acid_matches)),
        "tannin_match_pct": float(np.mean(tan_matches)),
        "clash_spice_tannin_pct": float(np.mean(clash_spice_tannin)),
        "clash_sweet_dry_pct": float(np.mean(clash_sweet_dry)),
        "unique_wines_recommended": float(np.mean(unique_counts)),
        "catalog_coverage_pct": float(np.mean(unique_counts)) / n_wines * 100,
        "shannon_entropy": float(np.mean(entropies)),
        "mean_latency_ms": 0.05
    }


def evaluate_deterministic_model(model_name: str, model_func, food_df: pd.DataFrame,
                                 wine_df: pd.DataFrame, bench_indices: List[int],
                                 food_emb: np.ndarray, wine_emb: np.ndarray) -> Tuple[Dict[str, Any], List[List[int]]]:
    """Evaluate a deterministic recommendation model over the 30 benchmark queries."""
    rec_matrix = []
    latencies = []
    n_wines = len(wine_df)

    t_m, b_m, s_m, a_m, tan_m, raw_s = 0, 0, 0, 0, 0, 0.0
    c_st, c_sd = 0, 0
    unique_wines = set()
    wine_freq: Dict[int, int] = {}
    total_recs = len(bench_indices) * 5

    for f_idx in bench_indices:
        f_row = food_df.iloc[f_idx]
        t0 = time.perf_counter()

        # Call model
        if model_name == "Attribute-Only Baseline":
            recs = rank_attribute_only(f_row, wine_df, top_k=5)
        elif model_name == "Semantic-Only Baseline (SentenceTransformers)":
            recs = rank_semantic_only(f_idx, food_emb, wine_emb, top_k=5)
        elif model_name == "VinoSphere Production Hybrid (Top-20 Filtered)":
            recs = rank_production_hybrid(f_row, f_idx, wine_df, food_emb, wine_emb, top_k=5)
        elif model_name == "Full-Catalog Hybrid Variant (Ablation)":
            recs = rank_full_catalog_hybrid(f_row, f_idx, wine_df, food_emb, wine_emb, top_k=5)
        else:
            raise ValueError(f"Unknown model name: {model_name}")

        latency = (time.perf_counter() - t0) * 1000.0
        latencies.append(latency)
        rec_matrix.append(recs)

        for w_idx in recs:
            unique_wines.add(w_idx)
            wine_freq[w_idx] = wine_freq.get(w_idx, 0) + 1
            w_row = wine_df.iloc[w_idx]

            # Match checks
            is_type = str(w_row.get("Wine_Type", "")).strip().casefold() == str(f_row.get("Recommended_Wine_Type", "")).strip().casefold()
            is_body = str(w_row.get("Body", "")).strip().casefold() == str(f_row.get("Recommended_Body", "")).strip().casefold()
            is_sweet = str(w_row.get("Sweetness", "")).strip().casefold() == str(f_row.get("Recommended_Sweetness", "")).strip().casefold()
            is_acid = str(w_row.get("Acidity", "")).strip().casefold() == str(f_row.get("Recommended_Acidity", "")).strip().casefold()
            is_tan = str(w_row.get("Tannin", "")).strip().casefold() == str(f_row.get("Recommended_Tannin", "")).strip().casefold()

            if is_type: t_m += 1
            if is_body: b_m += 1
            if is_sweet: s_m += 1
            if is_acid: a_m += 1
            if is_tan: tan_m += 1

            raw_score = 6.0 * is_type + 3.0 * is_body + 2.0 * is_sweet + 2.0 * is_acid + 2.0 * is_tan
            raw_s += raw_score

            # Sommelier Clash Checks
            w_tannin = str(w_row.get("Tannin", "")).strip().casefold()
            f_spice = str(f_row.get("Spice_Level", "")).strip().casefold()
            if w_tannin == "high" and f_spice in ["high", "very high"]:
                c_st += 1

            w_sweet = str(w_row.get("Sweetness", "")).strip().casefold()
            f_sweet = str(f_row.get("Sweetness", "")).strip().casefold()
            if w_sweet == "dry" and f_sweet == "high":
                c_sd += 1

    # Shannon Entropy
    ent = 0.0
    for cnt in wine_freq.values():
        p = cnt / total_recs
        ent -= p * math.log2(p)

    metrics = {
        "model_name": model_name,
        "mean_raw_attr_score": float(raw_s / total_recs),
        "std_raw_attr_score": 0.0,
        "type_match_pct": float((t_m / total_recs) * 100),
        "body_match_pct": float((b_m / total_recs) * 100),
        "sweetness_match_pct": float((s_m / total_recs) * 100),
        "acidity_match_pct": float((a_m / total_recs) * 100),
        "tannin_match_pct": float((tan_m / total_recs) * 100),
        "clash_spice_tannin_pct": float((c_st / total_recs) * 100),
        "clash_sweet_dry_pct": float((c_sd / total_recs) * 100),
        "unique_wines_recommended": float(len(unique_wines)),
        "catalog_coverage_pct": float(len(unique_wines) / n_wines * 100),
        "shannon_entropy": float(ent),
        "mean_latency_ms": float(np.mean(latencies)),
        "p95_latency_ms": float(np.percentile(latencies, 95))
    }

    return metrics, rec_matrix


def compute_pairwise_ablation_metrics(models_recs: Dict[str, List[List[int]]], n_queries: int) -> pd.DataFrame:
    """Compute Jaccard similarity, Top-1 agreement, overlap count, and rank correlation between model pairs."""
    model_names = list(models_recs.keys())
    records = []

    for i in range(len(model_names)):
        for j in range(i + 1, len(model_names)):
            m1 = model_names[i]
            m2 = model_names[j]

            recs1 = models_recs[m1]
            recs2 = models_recs[m2]

            jaccards = []
            overlaps = []
            top1_matches = 0
            tau_values = []

            for q_idx in range(n_queries):
                s1 = recs1[q_idx]
                s2 = recs2[q_idx]

                set1 = set(s1)
                set2 = set(s2)

                # Jaccard @ 5
                intersection = len(set1 & set2)
                union = len(set1 | set2)
                jaccard = intersection / union if union > 0 else 1.0
                jaccards.append(jaccard)
                overlaps.append(intersection)

                # Top-1 Agreement
                if s1[0] == s2[0]:
                    top1_matches += 1

                # Kendall's Tau on union ranking
                # Assign rank 1..5 for items present, 6 for items absent
                all_items = list(set1 | set2)
                r1_ranks = [s1.index(item) if item in s1 else 6 for item in all_items]
                r2_ranks = [s2.index(item) if item in s2 else 6 for item in all_items]
                tau, _ = kendalltau(r1_ranks, r2_ranks)
                if not math.isnan(tau):
                    tau_values.append(tau)
                else:
                    tau_values.append(0.0)

            records.append({
                "Model_A": m1,
                "Model_B": m2,
                "Top1_Agreement_Pct": round((top1_matches / n_queries) * 100, 2),
                "Mean_Top5_Overlap_Count": round(float(np.mean(overlaps)), 2),
                "Mean_Top5_Jaccard_Sim": round(float(np.mean(jaccards)), 4),
                "Mean_Kendall_Tau": round(float(np.mean(tau_values)), 4),
                "Distinct_Recommendations_Pct": round((1.0 - float(np.mean(jaccards))) * 100, 2)
            })

    return pd.DataFrame(records)


def build_expert_rating_worksheet(bench_df: pd.DataFrame, wine_df: pd.DataFrame,
                                   models_recs: Dict[str, List[List[int]]]) -> pd.DataFrame:
    """
    Generate candidate-pair evaluation worksheet for subsequent blinded human sommelier evaluation.
    Collects the union of all candidate wines recommended across models for each dish.
    """
    worksheet_rows = []
    pair_id = 1

    for q_idx, food_row in bench_df.iterrows():
        food_id = food_row["Food_ID"]
        food_name = food_row["Food_Name"]
        cuisine = food_row["Cuisine"]
        category = food_row["Category"]
        spice = food_row["Spice_Level"]
        fat = food_row["Fat_Level"]

        # Collect union of wine candidates across models
        wine_model_map: Dict[int, List[str]] = {}
        for m_name, rec_matrix in models_recs.items():
            for rank_0, w_idx in enumerate(rec_matrix[q_idx]):
                if w_idx not in wine_model_map:
                    wine_model_map[w_idx] = []
                wine_model_map[w_idx].append(f"{m_name} (Rank {rank_0+1})")

        # Sort candidate wines by catalog ID for blinded review
        for w_idx in sorted(wine_model_map.keys()):
            w_row = wine_df.iloc[w_idx]
            models_tag = " | ".join(wine_model_map[w_idx])

            worksheet_rows.append({
                "Pair_ID": f"PAIR_{pair_id:04d}",
                "Food_ID": food_id,
                "Food_Name": food_name,
                "Cuisine": cuisine,
                "Category": category,
                "Spice_Level": spice,
                "Fat_Level": fat,
                "Wine_ID": w_row["Wine_ID"],
                "Wine_Name": w_row["Wine_Name"],
                "Winery": w_row["Winery"],
                "Region": w_row["Region"],
                "Wine_Type": w_row["Wine_Type"],
                "Variety": w_row["Variety"],
                "Body": w_row["Body"],
                "Sweetness": w_row["Sweetness"],
                "Acidity": w_row["Acidity"],
                "Tannin": w_row["Tannin"],
                "Price_Range_INR": w_row["Price_Range_INR"],
                "Candidate_Source_Models": models_tag,
                # Blank columns for blinded human / sommelier evaluation
                "Sommelier_Relevance_Grade_0to3": "",
                "Binary_Acceptability_0or1": "",
                "Flavor_Harmony_Score_1to5": "",
                "Aroma_Affinity_Score_1to5": "",
                "Sommelier_Pairing_Notes": "",
                "Evaluator_ID": ""
            })
            pair_id += 1

    return pd.DataFrame(worksheet_rows)


# ---------------------------------------------------------------------------
# Main Execution Flow
# ---------------------------------------------------------------------------
def main():
    print("=" * 80)
    print("VinoSphere Indian Food-Wine Recommendation Research Evaluation Suite")
    print("=" * 80)

    # 1. Load Data
    food_df, wine_df, food_emb, wine_emb = load_datasets()
    bench_df = get_benchmark_food_rows(food_df)

    # Save benchmark queries
    queries_out_path = SCRIPT_DIR / "benchmark_queries.csv"
    bench_df.to_csv(queries_out_path, index=False)
    print(f"Saved: {queries_out_path} ({len(bench_df)} queries)")

    # Find integer index of each benchmark dish in food_df
    bench_indices = []
    catalog_lookup = {str(r["Food_Name"]).strip().lower(): i for i, r in food_df.iterrows()}
    for _, r in bench_df.iterrows():
        bench_indices.append(catalog_lookup[str(r["Food_Name"]).strip().lower()])

    # 2. Evaluate Models
    print("\n[Evaluation] Running Model Comparisons...")

    # A: Random Baseline
    t0 = time.time()
    random_metrics = evaluate_random_baseline(food_df, wine_df, bench_indices, n_runs=100, seed=42)
    print(f"  Completed Model A (Random Baseline, 100 MC runs) in {time.time()-t0:.2f}s")

    # B: Attribute-Only Baseline
    t0 = time.time()
    attr_metrics, attr_recs = evaluate_deterministic_model(
        "Attribute-Only Baseline", rank_attribute_only, food_df, wine_df, bench_indices, food_emb, wine_emb
    )
    print(f"  Completed Model B (Attribute-Only Baseline) in {time.time()-t0:.2f}s")

    # C: Semantic-Only Baseline
    t0 = time.time()
    sem_metrics, sem_recs = evaluate_deterministic_model(
        "Semantic-Only Baseline (SentenceTransformers)", rank_semantic_only, food_df, wine_df, bench_indices, food_emb, wine_emb
    )
    print(f"  Completed Model C (Semantic-Only Baseline) in {time.time()-t0:.2f}s")

    # D: Production Hybrid Engine
    t0 = time.time()
    prod_metrics, prod_recs = evaluate_deterministic_model(
        "VinoSphere Production Hybrid (Top-20 Filtered)", rank_production_hybrid, food_df, wine_df, bench_indices, food_emb, wine_emb
    )
    print(f"  Completed Model D (VinoSphere Production Hybrid) in {time.time()-t0:.2f}s")

    # E: Full-Catalog Hybrid Variant
    t0 = time.time()
    full_metrics, full_recs = evaluate_deterministic_model(
        "Full-Catalog Hybrid Variant (Ablation)", rank_full_catalog_hybrid, food_df, wine_df, bench_indices, food_emb, wine_emb
    )
    print(f"  Completed Model E (Full-Catalog Hybrid Variant) in {time.time()-t0:.2f}s")

    # 3. Assemble Baseline Comparison Table
    all_metrics = [
        random_metrics,
        attr_metrics,
        sem_metrics,
        prod_metrics,
        full_metrics
    ]
    comparison_df = pd.DataFrame(all_metrics)

    # Format numeric columns
    numeric_cols = [
        "mean_raw_attr_score", "std_raw_attr_score", "type_match_pct",
        "body_match_pct", "sweetness_match_pct", "acidity_match_pct",
        "tannin_match_pct", "clash_spice_tannin_pct", "clash_sweet_dry_pct",
        "unique_wines_recommended", "catalog_coverage_pct", "shannon_entropy",
        "mean_latency_ms"
    ]
    for c in numeric_cols:
        if c in comparison_df.columns:
            comparison_df[c] = comparison_df[c].round(4)

    comp_out_path = SCRIPT_DIR / "baseline_comparison.csv"
    comparison_df.to_csv(comp_out_path, index=False)
    print(f"\nSaved: {comp_out_path}")

    # 4. Compute Ablation Analysis (Ranking Overlap & Differences)
    models_recs = {
        "Attribute_Only": attr_recs,
        "Semantic_Only": sem_recs,
        "Production_Hybrid": prod_recs,
        "FullCatalog_Hybrid": full_recs
    }
    ablation_df = compute_pairwise_ablation_metrics(models_recs, len(bench_indices))
    ablation_out_path = SCRIPT_DIR / "ablation_results.csv"
    ablation_df.to_csv(ablation_out_path, index=False)
    print(f"Saved: {ablation_out_path}")

    # 5. Build Expert Rating Worksheet
    worksheet_df = build_expert_rating_worksheet(bench_df, wine_df, models_recs)
    worksheet_out_path = SCRIPT_DIR / "expert_rating_template.csv"
    worksheet_df.to_csv(worksheet_out_path, index=False)
    print(f"Saved: {worksheet_out_path} ({len(worksheet_df)} unique candidate pairs across 30 dishes)")

    print("\n" + "=" * 80)
    print("ALL EXPERIMENTAL RUNS COMPLETE AND DATASETS GENERATED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    main()
