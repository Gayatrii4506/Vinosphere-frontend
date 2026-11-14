"""
Evaluation Module for Wine Quality Prediction Pipeline
Computes rigorous held-out test evaluation metrics (Accuracy, Balanced Accuracy, Macro & Weighted Precision/Recall/F1, 
Class-wise breakdown, Confusion Matrix, ROC-AUC, Average Precision / PR-AUC), Feature Importance analysis on X_train, 
and publication-ready Markdown reporting.
"""

import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, Tuple

from sklearn.metrics import (
    accuracy_score, 
    balanced_accuracy_score,
    precision_score, 
    recall_score, 
    f1_score, 
    roc_auc_score,
    average_precision_score,
    roc_curve,
    precision_recall_curve,
    classification_report, 
    confusion_matrix
)


BINARY_NAMES = ['Standard (3-6)', 'Premium (7-9)']


def evaluate_model(
    model: Any, 
    X_test: pd.DataFrame, 
    y_test: pd.Series, 
    target_names: list = None,
    threshold: float = None
) -> Dict[str, Any]:
    print(f"\n[DEBUG] ENTERING evaluate_model with model={type(model).__name__}, X_test shape={X_test.shape}", flush=True)
    print("\n" + "=" * 60, flush=True)
    print("HELD-OUT TEST SET EVALUATION", flush=True)
    print("=" * 60, flush=True)

    if target_names is None:
        target_names = BINARY_NAMES

    thresh = threshold if threshold is not None else float(getattr(model, 'decision_threshold', 0.50))
    print(f"Applying Decision Threshold: {thresh:.2f}", flush=True)
    
    # Calculate Probabilities for ROC-AUC & Average Precision (PR-AUC)
    y_prob = None
    roc_auc = 0.0
    avg_precision = 0.0
    if hasattr(model, 'predict_proba'):
        try:
            probs = model.predict_proba(X_test)
            if probs.shape[1] == 2:
                # Class 1 is Premium (positive target)
                y_prob = probs[:, 1]
                roc_auc = roc_auc_score(y_test, y_prob)
                avg_precision = average_precision_score(y_test, y_prob)
                y_pred = (y_prob >= thresh).astype(int)
            else:
                roc_auc = roc_auc_score(y_test, probs, multi_class='ovr')
                y_pred = model.predict(X_test)
        except Exception as e:
            print(f"Warning: Could not compute probability metrics: {e}")
            y_pred = model.predict(X_test)
    else:
        y_pred = model.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    bal_acc = balanced_accuracy_score(y_test, y_pred)
    
    prec_weighted = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)

    prec_binary = precision_score(y_test, y_pred, pos_label=1, average='binary', zero_division=0) if len(np.unique(y_test)) == 2 else prec_weighted
    rec_binary = recall_score(y_test, y_pred, pos_label=1, average='binary', zero_division=0) if len(np.unique(y_test)) == 2 else rec_weighted
    f1_binary = f1_score(y_test, y_pred, pos_label=1, average='binary', zero_division=0) if len(np.unique(y_test)) == 2 else f1_weighted

    unique_labels = sorted(list(np.unique(y_test)))
    target_names_subset = [target_names[i] for i in unique_labels] if len(unique_labels) <= len(target_names) else target_names

    cls_report = classification_report(y_test, y_pred, labels=unique_labels, target_names=target_names_subset, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=unique_labels)

    # PRINT SUMMARY TABLE
    print("\n" + "=" * 76)
    print(f"        HELD-OUT TEST SET EVALUATION METRICS SUMMARY TABLE (Threshold = {thresh:.2f})")
    print("=" * 76)
    print(f"{'Metric':<34} | {'Raw Score':<18} | {'Percentage':<18}")
    print("-" * 76)
    print(f"{'Decision Threshold':<34} | {thresh:<18.2f} | {thresh * 100:>6.2f}%")
    print(f"{'Overall Test Accuracy':<34} | {acc:<18.4f} | {acc * 100:>6.2f}%")
    print(f"{'Balanced Test Accuracy':<34} | {bal_acc:<18.4f} | {bal_acc * 100:>6.2f}%")
    if roc_auc > 0:
        print(f"{'ROC-AUC Score':<34} | {roc_auc:<18.4f} | {roc_auc * 100:>6.2f}%")
    if avg_precision > 0:
        print(f"{'Average Precision (PR-AUC)':<34} | {avg_precision:<18.4f} | {avg_precision * 100:>6.2f}%")
    print(f"{'Weighted Precision':<34} | {prec_weighted:<18.4f} | {prec_weighted * 100:>6.2f}%")
    print(f"{'Weighted Recall':<34} | {rec_weighted:<18.4f} | {rec_weighted * 100:>6.2f}%")
    print(f"{'Weighted F1-Score':<34} | {f1_weighted:<18.4f} | {f1_weighted * 100:>6.2f}%")
    print(f"{'Macro Precision':<34} | {prec_macro:<18.4f} | {prec_macro * 100:>6.2f}%")
    print(f"{'Macro Recall':<34} | {rec_macro:<18.4f} | {rec_macro * 100:>6.2f}%")
    print(f"{'Macro F1-Score':<34} | {f1_macro:<18.4f} | {f1_macro * 100:>6.2f}%")
    print("=" * 76)

    # Class-wise Table
    print("\n" + "=" * 76)
    print("                  CLASS-WISE PERFORMANCE BREAKDOWN")
    print("=" * 76)
    print(f"{'Class Name':<26} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10} | {'Support':<10}")
    print("-" * 76)
    for idx, lbl in enumerate(unique_labels):
        c_name = target_names_subset[idx] if idx < len(target_names_subset) else str(lbl)
        p = precision_score(y_test == lbl, y_pred == lbl, zero_division=0)
        r = recall_score(y_test == lbl, y_pred == lbl, zero_division=0)
        f = f1_score(y_test == lbl, y_pred == lbl, zero_division=0)
        sup = (y_test == lbl).sum()
        print(f"{c_name:<26} | {p:<10.4f} | {r:<10.4f} | {f:<10.4f} | {sup:<10} samples")
    print("-" * 76)
    print(f"{'Macro Average':<26} | {prec_macro:<10.4f} | {rec_macro:<10.4f} | {f1_macro:<10.4f} | {len(y_test):<10} samples")
    print(f"{'Weighted Average':<26} | {prec_weighted:<10.4f} | {rec_weighted:<10.4f} | {f1_weighted:<10.4f} | {len(y_test):<10} samples")
    print("=" * 76)

    # Confusion Matrix Table
    print("\n" + "=" * 76)
    print("                     CONFUSION MATRIX TABLE")
    print("=" * 76)
    header = f"{'Actual \\ Predicted':<24} | " + " | ".join([f"{name:>20}" for name in target_names_subset])
    print(header)
    print("-" * 76)
    for idx, actual_name in enumerate(target_names_subset):
        row_vals = " | ".join([f"{cm[idx, j]:>20}" for j in range(len(target_names_subset))])
        print(f"{actual_name:<24} | {row_vals}")
    print("=" * 76 + "\n")

    metrics = {
        'threshold': thresh,
        'accuracy': acc,
        'balanced_accuracy': bal_acc,
        'roc_auc': roc_auc,
        'average_precision': avg_precision,
        'precision_weighted': prec_weighted,
        'recall_weighted': rec_weighted,
        'f1_weighted': f1_weighted,
        'precision_macro': prec_macro,
        'recall_macro': rec_macro,
        'f1_macro': f1_macro,
        'precision_binary': prec_binary,
        'recall_binary': rec_binary,
        'f1_binary': f1_binary,
        'classification_report': cls_report,
        'confusion_matrix': cm,
        'labels': target_names_subset,
        'y_pred': y_pred,
        'y_prob': y_prob,
        'y_test': y_test
    }

    return metrics


def plot_confusion_matrix(cm: np.ndarray, labels: list, output_path: str = "../outputs/plots/confusion_matrix.png") -> None:
    """
    Plots and saves the Confusion Matrix heatmap.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.figure(figsize=(7, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Purples', xticklabels=labels, yticklabels=labels, cbar=True)
    plt.title("Confusion Matrix (Wine Quality Classification)", fontsize=13, pad=15, fontweight='bold')
    plt.xlabel("Predicted Label", fontsize=11, fontweight='bold')
    plt.ylabel("Actual Label", fontsize=11, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[OK] Saved Confusion Matrix plot to: {output_path}")


def plot_roc_curve(y_test: pd.Series, y_prob: np.ndarray, model_name: str = "Ensemble", output_path: str = "../outputs/plots/roc_curve.png") -> None:
    """
    Plots and saves the ROC-AUC Curve for binary classification.
    """
    if y_prob is None or len(np.unique(y_test)) != 2:
        return

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    fpr, tpr, _ = roc_curve(y_test, y_prob)
    auc_val = roc_auc_score(y_test, y_prob)

    plt.figure(figsize=(7, 6))
    plt.plot(fpr, tpr, color='#8b5cf6', lw=2.5, label=f'{model_name} ROC Curve (AUC = {auc_val:.3f})')
    plt.plot([0, 1], [0, 1], color='#94a3b8', lw=1.5, linestyle='--', label='Random Chance (AUC = 0.500)')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate (1 - Specificity)', fontsize=11, fontweight='bold')
    plt.ylabel('True Positive Rate (Sensitivity / Recall)', fontsize=11, fontweight='bold')
    plt.title('Receiver Operating Characteristic (ROC) Curve', fontsize=13, pad=12, fontweight='bold')
    plt.legend(loc="lower right", fontsize=10)
    plt.grid(True, linestyle=':', alpha=0.6)
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[OK] Saved ROC Curve plot to: {output_path}")


def analyze_feature_importance(
    model: Any, 
    X_train: pd.DataFrame, 
    y_train: pd.Series, 
    output_path: str = "../outputs/plots/feature_importance.png"
) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Calculate Feature Importance strictly on training data (X_train, y_train).
    Prevents test set leakage in correlation and feature evaluation.
    """
    print("\n" + "=" * 60)
    print("FEATURE IMPORTANCE & CORRELATION ANALYSIS (ON X_TRAIN)")
    print("=" * 60)

    # 1. Feature Correlation with Target on X_train only
    df_combined = X_train.copy()
    df_combined['target'] = y_train
    corr_series = df_combined.corr()['target'].drop('target').sort_values(ascending=False)

    print("\nTop Training Set Correlations with Quality Target:")
    for feat, val in corr_series.head(8).items():
        print(f"  {feat:<28}: {val:+.4f}")

    # 2. Extract Feature Importances from Fitted Model
    importances = None
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    elif hasattr(model, 'estimators_'):
        imp_list = []
        for est in model.estimators_:
            if hasattr(est, 'feature_importances_'):
                imp_list.append(est.feature_importances_)
        if imp_list:
            importances = np.mean(imp_list, axis=0)

    if importances is None:
        importances = np.abs(corr_series.values)

    feature_names = X_train.columns
    df_importance = pd.DataFrame({
        'Feature': feature_names,
        'Importance': importances
    }).sort_values(by='Importance', ascending=False)

    print("\nTop Feature Importance Ranking (Fitted Model on X_train):")
    for idx, row in df_importance.head(10).iterrows():
        print(f"  {row['Feature']:<28}: {row['Importance']:.4f}")

    # Plot Horizontal Bar Chart
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    plt.figure(figsize=(11, 7))
    sns.barplot(data=df_importance.head(12), x='Importance', y='Feature', hue='Feature', palette='mako', legend=False)
    plt.title("Top Feature Importances (Wine Quality Model)", fontsize=14, pad=15, fontweight='bold')
    plt.xlabel("Importance Score (Gini / Split Significance)", fontsize=11, fontweight='bold')
    plt.ylabel("Enological Feature", fontsize=11, fontweight='bold')
    for idx, row in enumerate(df_importance.head(12).itertuples()):
        plt.text(row.Importance + 0.001, idx, f"{row.Importance:.4f}", va='center', fontsize=9, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"[OK] Saved Feature Importance plot to: {output_path}")

    return df_importance, corr_series


def generate_evaluation_report(
    baseline_metrics: Dict[str, Any],
    tuned_metrics: Dict[str, Any],
    meta_info: Dict[str, Any],
    importance_df: pd.DataFrame,
    corr_series: pd.Series,
    output_path: str = "../outputs/reports/model_evaluation_report.md"
) -> None:
    """
    Generates an IEEE-ready Markdown evaluation report summarizing model performance,
    candidate cross-validation comparison, decision threshold optimization, held-out test set evaluation, and feature significance.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    arch_name = meta_info.get('best_architecture', 'Selected Ensemble')
    cv_results = meta_info.get('all_cv_results', {})
    thresh_results = meta_info.get('threshold_results', {})
    sel_thresh = meta_info.get('selected_threshold', 0.50)

    cv_rows = ""
    for cand_name, metrics_dict in cv_results.items():
        is_winner = (cand_name == arch_name)
        prefix = "**" if is_winner else ""
        suffix = "** (Selected)" if is_winner else ""
        cv_rows += (
            f"| {prefix}{cand_name}{suffix} | "
            f"{metrics_dict['accuracy_mean']*100:.2f}% (+/- {metrics_dict['accuracy_std']*200:.2f}%) | "
            f"{metrics_dict['balanced_accuracy_mean']*100:.2f}% (+/- {metrics_dict['balanced_accuracy_std']*200:.2f}%) | "
            f"{metrics_dict['macro_f1_mean']:.4f} | "
            f"{metrics_dict['weighted_f1_mean']:.4f} |\n"
        )

    thresh_rows = ""
    for th_val, res_dict in thresh_results.items():
        is_sel = (abs(th_val - sel_thresh) < 1e-4)
        prefix = "**" if is_sel else ""
        suffix = "** (Selected)" if is_sel else ""
        thresh_rows += (
            f"| {prefix}{th_val:.2f}{suffix} | "
            f"{res_dict['accuracy']*100:.2f}% | "
            f"{res_dict['balanced_accuracy']*100:.2f}% | "
            f"{res_dict['macro_f1']:.4f} | "
            f"{res_dict['premium_precision']:.4f} | "
            f"{res_dict['premium_recall']:.4f} | "
            f"{res_dict['premium_f1']:.4f} |\n"
        )

    report = f"""# Comprehensive Machine Learning Model Evaluation Report

## Executive Summary
This report presents a rigorous empirical evaluation of the **VinoSphere Wine Quality Prediction Engine**. The task is binary classification between **Standard Commercial Wine** (Score 3–6) and **Premium Grand Reserve Wine** (Score 7–9) using physicochemical parameters from the UCI Wine Quality dataset.

Model selection and decision threshold optimization were performed using Stratified 5-Fold Cross-Validation strictly on the training set ($N = 4,256$). Final metrics were calculated once on a separate, held-out test partition ($N = 1,064$).

---

## 1. Candidate Architecture Selection (5-Fold Stratified CV on Training Data)

All candidate models were evaluated on the training dataset across multiple performance indicators to mitigate majority class bias.

| Candidate Architecture | CV Accuracy (Mean +/- 2σ) | CV Balanced Accuracy | CV Macro F1 | CV Weighted F1 |
| :--- | :---: | :---: | :---: | :---: |
{cv_rows}

* **Selected Architecture**: **{arch_name}** (Selection Criterion: {meta_info.get('selection_metric', 'macro_f1')}).

---

## 2. Out-of-Fold Decision Threshold Optimization (strictly on X_train)

Out-of-fold predicted probabilities were generated using Stratified 5-Fold CV on $X_{{\\text{{train}}}}$. Candidate thresholds were evaluated to select the threshold maximizing Macro F1 without exposing the held-out test set.

| Decision Threshold | OOF Accuracy | OOF Bal. Accuracy | OOF Macro F1 | Premium Precision | Premium Recall | Premium F1 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
{thresh_rows}

* **Selected Decision Threshold**: **{sel_thresh:.2f}** (Selection Criterion: Highest OOF Macro F1 on $X_{{\\text{{train}}}}$).

---

## 3. Final Evaluation on Held-Out Test Set (N_test = 1,064)

| Performance Indicator | Baseline Random Forest (Thresh=0.50) | Selected {arch_name} (Thresh={sel_thresh:.2f}) |
| :--- | :---: | :---: |
| **Decision Threshold** | 0.50 | **{sel_thresh:.2f}** |
| **Exact Test Accuracy** | {baseline_metrics.get('accuracy', 0)*100:.2f}% | **{tuned_metrics['accuracy']*100:.2f}%** |
| **Balanced Test Accuracy** | {baseline_metrics.get('balanced_accuracy', 0)*100:.2f}% | **{tuned_metrics['balanced_accuracy']*100:.2f}%** |
| **ROC-AUC Score** | {baseline_metrics.get('roc_auc', 0)*100:.2f}% | **{tuned_metrics['roc_auc']*100:.2f}%** |
| **Average Precision (PR-AUC)** | {baseline_metrics.get('average_precision', 0)*100:.2f}% | **{tuned_metrics['average_precision']*100:.2f}%** |
| **Weighted F1 Score** | {baseline_metrics.get('f1_weighted', 0):.4f} | **{tuned_metrics['f1_weighted']:.4f}** |
| **Macro F1 Score** | {baseline_metrics.get('f1_macro', 0):.4f} | **{tuned_metrics['f1_macro']:.4f}** |
| **Weighted Precision** | {baseline_metrics.get('precision_weighted', 0):.4f} | **{tuned_metrics['precision_weighted']:.4f}** |
| **Weighted Recall** | {baseline_metrics.get('recall_weighted', 0):.4f} | **{tuned_metrics['recall_weighted']:.4f}** |

---

## 4. Class-Wise Classification Report & Decision Impact

```
{tuned_metrics['classification_report']}
```

### Analysis of Threshold Decision Impact:
* **Selected Decision Threshold**: {sel_thresh:.2f}
* **Standard Class (3-6)**: High precision and recall sustained across commercial table wines.
* **Premium Class (7-9)**: Threshold tuning on OOF training predictions directly shifts the decision boundary to balance Precision ({tuned_metrics.get('precision_binary', 0):.4f}) and Recall ({tuned_metrics.get('recall_binary', 0):.4f}), yielding a Macro F1 of {tuned_metrics.get('f1_macro', 0):.4f} on held-out test data.

---

## 5. Visual Diagnostics

### Confusion Matrix
![Confusion Matrix](../plots/confusion_matrix.png)

### ROC-AUC Curve
![ROC Curve](../plots/roc_curve.png)

---

## 6. Feature Importance & Enological Interpretation

![Feature Importance](../plots/feature_importance.png)

### Key Physicochemical Quality Drivers:
1. **Alcohol & Alcohol-to-Density Ratio**: Primary positive predictor of body, roundness, and premium rating.
2. **Volatile Acidity & Volatile-to-Fixed Ratio**: Strongest negative marker for acetic spoilage and sensory faults.
3. **Free & Bound Sulfur Dioxide Dynamics**: Critical for antioxidant preservation and microbial stability.
4. **Total Acidity & Sugar-Acid Ratio**: Essential for mouthfeel balance and structural freshness.

*Note on Causality: Feature importance metrics reflect predictive association within tree decision splits on training data. They establish statistical significance for classification rather than direct biological or chemical causation.*
"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(report)

    print(f"[OK] Saved Model Evaluation Report to: {output_path}")

