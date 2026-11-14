"""
Training Module for Wine Quality Prediction Pipeline
Implements Candidate Models (ExtraTrees / XGBoost / RandomForest / HistGradientBoosting / Soft-Voting Ensemble)
with Stratified 5-Fold Cross Validation on Training Data.
"""

import os
os.environ["LOKY_MAX_CPU_COUNT"] = "4"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import joblib
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate, cross_val_predict
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score
)
from sklearn.ensemble import (
    RandomForestClassifier, 
    ExtraTreesClassifier, 
    HistGradientBoostingClassifier, 
    VotingClassifier
)
from xgboost import XGBClassifier


def split_data(
    X: pd.DataFrame, 
    y: pd.Series, 
    test_size: float = 0.20, 
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Perform Stratified Train-Test Split (80% Train, 20% Test).
    """
    print("\n" + "=" * 60, flush=True)
    print("TRAIN-TEST SPLIT (80% TRAIN / 20% HELD-OUT TEST)", flush=True)
    print("=" * 60, flush=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    print(f"Total dataset size: {len(X)}", flush=True)
    print(f"Training set (80%): {X_train.shape[0]} samples", flush=True)
    print(f"Testing set  (20%): {X_test.shape[0]} samples (Held-out)", flush=True)

    counts = y_train.value_counts().sort_index().to_dict()
    print("Training set target distribution:", flush=True)
    for cls_idx, count in counts.items():
        print(f"  Class {cls_idx}: {count} samples ({count/len(y_train)*100:.1f}%)", flush=True)

    return X_train, X_test, y_train, y_test


def train_baseline_model(
    X_train: pd.DataFrame, 
    y_train: pd.Series, 
    random_state: int = 42
) -> RandomForestClassifier:
    """
    Train standard baseline Random Forest Classifier on X_train.
    """
    print("\n--- Training Baseline Random Forest Classifier ---", flush=True)
    rf_baseline = RandomForestClassifier(
        n_estimators=100,
        random_state=random_state
    )
    rf_baseline.fit(X_train, y_train)
    rf_baseline.decision_threshold = 0.50
    print("[OK] Baseline Random Forest Model trained on X_train.", flush=True)
    return rf_baseline


def optimize_decision_threshold(
    model: Any,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    cv: StratifiedKFold,
    candidate_thresholds: list = [0.35, 0.40, 0.45, 0.50, 0.55]
) -> Tuple[float, Dict[float, Dict[str, float]]]:
    """
    Generate out-of-fold predicted probabilities using stratified 5-fold cross-validation
    strictly on X_train. Evaluate candidate decision thresholds and select the optimal
    threshold based ONLY on Macro F1 score on out-of-fold predictions.
    """
    print("\n" + "=" * 60, flush=True)
    print("MODEL SELECTION STEP 2: DECISION THRESHOLD OPTIMIZATION (OOF CV ON X_TRAIN)", flush=True)
    print("=" * 60, flush=True)

    # 1. Out-of-fold predicted probabilities on X_train only
    oof_probs = cross_val_predict(model, X_train, y_train, cv=cv, method='predict_proba', n_jobs=1)[:, 1]

    threshold_results = {}
    best_thresh = 0.50
    best_macro_f1 = -1.0

    print(f"{'Threshold':<10} | {'Accuracy':<10} | {'Bal. Acc.':<10} | {'Macro F1':<10} | {'Prem. Prec.':<12} | {'Prem. Rec.':<12} | {'Prem. F1':<10}", flush=True)
    print("-" * 88, flush=True)

    for thresh in candidate_thresholds:
        oof_preds = (oof_probs >= thresh).astype(int)
        
        acc = accuracy_score(y_train, oof_preds)
        bal_acc = balanced_accuracy_score(y_train, oof_preds)
        macro_f1 = f1_score(y_train, oof_preds, average='macro', zero_division=0)
        
        p_prec = precision_score(y_train == 1, oof_preds == 1, zero_division=0)
        p_rec = recall_score(y_train == 1, oof_preds == 1, zero_division=0)
        p_f1 = f1_score(y_train == 1, oof_preds == 1, zero_division=0)

        threshold_results[thresh] = {
            'accuracy': acc,
            'balanced_accuracy': bal_acc,
            'macro_f1': macro_f1,
            'premium_precision': p_prec,
            'premium_recall': p_rec,
            'premium_f1': p_f1
        }

        if macro_f1 > best_macro_f1:
            best_macro_f1 = macro_f1
            best_thresh = thresh

    for thresh in candidate_thresholds:
        r = threshold_results[thresh]
        sel_str = " (Selected)" if thresh == best_thresh else ""
        print(
            f"{thresh:<10.2f} | {r['accuracy']*100:>8.2f}% | {r['balanced_accuracy']*100:>8.2f}% | "
            f"{r['macro_f1']:>10.4f} | {r['premium_precision']:>12.4f} | {r['premium_recall']:>12.4f} | {r['premium_f1']:>10.4f}{sel_str}",
            flush=True
        )

    print("-" * 88, flush=True)
    print(f"\n[OPTIMAL THRESHOLD] Selected Decision Threshold: {best_thresh:.2f} (OOF Macro F1: {best_macro_f1:.4f})", flush=True)

    return best_thresh, threshold_results


def train_ensemble_model(
    X_train: pd.DataFrame, 
    y_train: pd.Series, 
    random_state: int = 42,
    selection_metric: str = 'macro_f1'
) -> Tuple[Any, Dict[str, Any]]:
    """
    Train and cross-validate candidate classifiers on X_train:
    1. ExtraTreesClassifier
    2. XGBoost Classifier
    3. HistGradientBoostingClassifier
    4. Random Forest (Tuned)
    5. Soft-Voting Super Ensemble

    Evaluates candidates across Accuracy, Balanced Accuracy, Macro F1, and Weighted F1.
    Selects the best architecture based on selection_metric (default: 'macro_f1' to handle class imbalance).
    Optimizes decision threshold via OOF CV probabilities strictly on X_train.
    """
    print("\n" + "=" * 60, flush=True)
    print("MODEL SELECTION: 5-FOLD STRATIFIED CV ON TRAINING DATA", flush=True)
    print("=" * 60, flush=True)

    et_clf = ExtraTreesClassifier(
        n_estimators=150,
        max_depth=25,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=random_state,
        n_jobs=1
    )

    xgb_clf = XGBClassifier(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=random_state,
        eval_metric='logloss',
        n_jobs=1
    )

    hgb_clf = HistGradientBoostingClassifier(
        max_iter=150,
        learning_rate=0.08,
        max_depth=10,
        min_samples_leaf=15,
        random_state=random_state
    )

    rf_clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=25,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=random_state,
        n_jobs=1
    )

    voting_ensemble = VotingClassifier(
        estimators=[
            ('et', et_clf),
            ('rf', rf_clf),
            ('xgb', xgb_clf)
        ],
        voting='soft',
        weights=[3, 2, 2],
        n_jobs=1
    )

    candidates = {
        'ExtraTrees': et_clf,
        'RandomForest': rf_clf,
        'XGBoost': xgb_clf,
        'HistGradientBoosting': hgb_clf,
        'VotingEnsemble': voting_ensemble
    }

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    scoring = {
        'accuracy': 'accuracy',
        'balanced_accuracy': 'balanced_accuracy',
        'macro_f1': 'f1_macro',
        'weighted_f1': 'f1_weighted'
    }

    model_cv_results = {}
    best_name = None
    best_score = -1.0
    best_model = None

    print(f"Evaluating candidate architectures on X_train (5-Fold Stratified CV, Selection Metric: {selection_metric}):\n", flush=True)
    header = f"{'Architecture':<22} | {'Accuracy':<14} | {'Bal. Accuracy':<14} | {'Macro F1':<14} | {'Weighted F1':<14}"
    print(header, flush=True)
    print("-" * 88, flush=True)

    for name, model in candidates.items():
        res = cross_validate(model, X_train, y_train, cv=cv, scoring=scoring, n_jobs=1)
        
        acc_mean, acc_std = res['test_accuracy'].mean(), res['test_accuracy'].std()
        bal_mean, bal_std = res['test_balanced_accuracy'].mean(), res['test_balanced_accuracy'].std()
        macro_mean, macro_std = res['test_macro_f1'].mean(), res['test_macro_f1'].std()
        weight_mean, weight_std = res['test_weighted_f1'].mean(), res['test_weighted_f1'].std()

        model_cv_results[name] = {
            'accuracy_mean': acc_mean,
            'accuracy_std': acc_std,
            'balanced_accuracy_mean': bal_mean,
            'balanced_accuracy_std': bal_std,
            'macro_f1_mean': macro_mean,
            'macro_f1_std': macro_std,
            'weighted_f1_mean': weight_mean,
            'weighted_f1_std': weight_std
        }

        print(
            f"{name:<22} | {acc_mean*100:>5.2f}% (+/- {acc_std*200:>4.2f}%) | "
            f"{bal_mean*100:>5.2f}% (+/- {bal_std*200:>4.2f}%) | "
            f"{macro_mean:>6.4f} (+/- {macro_std:>5.4f}) | "
            f"{weight_mean:>6.4f} (+/- {weight_std:>5.4f})",
            flush=True
        )

        score_map = {
            'accuracy': acc_mean,
            'balanced_accuracy': bal_mean,
            'macro_f1': macro_mean,
            'weighted_f1': weight_mean
        }
        cand_score = score_map[selection_metric]

        if cand_score > best_score:
            best_score = cand_score
            best_name = name
            best_model = model

    print("-" * 88, flush=True)
    print(f"\n[WINNER] Selected Best Architecture by {selection_metric}: {best_name} ({best_score:.4f} CV Score)", flush=True)

    # Perform Decision Threshold Optimization strictly on X_train using OOF predictions
    best_threshold, threshold_results = optimize_decision_threshold(best_model, X_train, y_train, cv=cv)

    print(f"\nFitting final {best_name} model on complete X_train ({len(X_train)} samples)...", flush=True)
    best_model.fit(X_train, y_train)
    best_model.decision_threshold = best_threshold
    print(f"[OK] {best_name} fitted on X_train successfully with decision_threshold={best_threshold:.2f}.", flush=True)

    try:
        p_test = best_model.predict(X_train.iloc[:5])
        print(f"[OK] Test prediction on X_train succeeded: {p_test}", flush=True)
    except Exception as e:
        print(f"[ERROR] Test prediction on X_train failed: {e}", flush=True)

    meta_info = {
        'best_architecture': best_name,
        'selection_metric': selection_metric,
        'best_cv_score': best_score,
        'all_cv_results': model_cv_results,
        'selected_threshold': best_threshold,
        'threshold_results': threshold_results
    }

    return best_model, meta_info


def save_model_artifact(model: Any, model_path: str = "../models/wine_quality_model.pkl") -> None:
    """
    Save trained model using Joblib.
    """
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    joblib.dump(model, model_path)
    print(f"\n[OK] Saved model artifact to: {model_path}", flush=True)


if __name__ == "__main__":
    from preprocessing import load_datasets, merge_datasets, clean_data, prepare_features_and_target

    df_red, df_white = load_datasets("../data/winequality-red.csv", "../data/winequality-white.csv")
    df_merged = merge_datasets(df_red, df_white)
    df_clean = clean_data(df_merged)
    X, y = prepare_features_and_target(df_clean, target_mode='binary')

    X_train, X_test, y_train, y_test = split_data(X, y)
    best_model, meta = train_ensemble_model(X_train, y_train)
    save_model_artifact(best_model, "../models/wine_quality_model.pkl")
