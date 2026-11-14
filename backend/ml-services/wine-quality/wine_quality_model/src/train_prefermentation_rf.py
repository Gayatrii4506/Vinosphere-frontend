"""
Train Random Forest Model for Pre-Fermentation Grape Quality Prediction
Dataset: 'wine quality using grape.csv'
"""

import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

def print_terminal_metrics_table(y_test, y_pred, y_test_score, y_pred_score):
    acc = accuracy_score(y_test, y_pred)
    prec_weighted = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec_weighted = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1_weighted = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    prec_macro = precision_score(y_test, y_pred, average='macro', zero_division=0)
    rec_macro = recall_score(y_test, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)

    r2 = r2_score(y_test_score, y_pred_score)
    mae = mean_absolute_error(y_test_score, y_pred_score)
    mse = mean_squared_error(y_test_score, y_pred_score)
    rmse = np.sqrt(mse)

    print("\n" + "=" * 76)
    print("      PRE-FERMENTATION MODEL EVALUATION METRICS SUMMARY TABLE")
    print("=" * 76)
    print(f"{'Metric':<34} | {'Raw Score':<18} | {'Percentage / Unit':<18}")
    print("-" * 76)
    print(f"{'Overall Classification Accuracy':<34} | {acc:<18.4f} | {acc * 100:>6.2f}%")
    print(f"{'Weighted Precision':<34} | {prec_weighted:<18.4f} | {prec_weighted * 100:>6.2f}%")
    print(f"{'Weighted Recall':<34} | {rec_weighted:<18.4f} | {rec_weighted * 100:>6.2f}%")
    print(f"{'Weighted F1-Score':<34} | {f1_weighted:<18.4f} | {f1_weighted * 100:>6.2f}%")
    print(f"{'Macro Precision':<34} | {prec_macro:<18.4f} | {prec_macro * 100:>6.2f}%")
    print(f"{'Macro Recall':<34} | {rec_macro:<18.4f} | {rec_macro * 100:>6.2f}%")
    print(f"{'Macro F1-Score':<34} | {f1_macro:<18.4f} | {f1_macro * 100:>6.2f}%")
    print("-" * 76)
    print(f"{'Regression R2 Score':<34} | {r2:<18.4f} | {r2 * 100:>6.2f}% (Variance)")
    print(f"{'Mean Absolute Error (MAE)':<34} | {mae:<18.4f} | {mae:>6.4f} pts")
    print(f"{'Mean Squared Error (MSE)':<34} | {mse:<18.4f} | {mse:>6.4f}")
    print(f"{'Root Mean Squared Error (RMSE)':<34} | {rmse:<18.4f} | {rmse:>6.4f} pts")
    print("=" * 76)

    # Class-wise Table
    labels = sorted(list(np.unique(y_test)))
    cm = confusion_matrix(y_test, y_pred, labels=labels)
    
    print("\n" + "=" * 76)
    print("                  CLASS-WISE PERFORMANCE BREAKDOWN")
    print("=" * 76)
    print(f"{'Category Class':<18} | {'Precision':<12} | {'Recall':<12} | {'F1-Score':<12} | {'Support':<10}")
    print("-" * 76)
    for lbl in labels:
        p = precision_score(y_test == lbl, y_pred == lbl, zero_division=0)
        r = recall_score(y_test == lbl, y_pred == lbl, zero_division=0)
        f = f1_score(y_test == lbl, y_pred == lbl, zero_division=0)
        sup = (y_test == lbl).sum()
        print(f"{lbl:<18} | {p:<12.4f} | {r:<12.4f} | {f:<12.4f} | {sup:<10} samples")
    print("-" * 76)
    print(f"{'Macro Average':<18} | {prec_macro:<12.4f} | {rec_macro:<12.4f} | {f1_macro:<12.4f} | {len(y_test):<10} samples")
    print(f"{'Weighted Average':<18} | {prec_weighted:<12.4f} | {rec_weighted:<12.4f} | {f1_weighted:<12.4f} | {len(y_test):<10} samples")
    print("=" * 76)

    # Confusion Matrix Table
    print("\n" + "=" * 76)
    print("                     CONFUSION MATRIX TABLE")
    print("=" * 76)
    header = f"{'Actual \\ Predicted':<20} | " + " | ".join([f"{lbl:>10}" for lbl in labels])
    print(header)
    print("-" * 76)
    for idx, actual_lbl in enumerate(labels):
        row_vals = " | ".join([f"{cm[idx, j]:>10}" for j in range(len(labels))])
        print(f"{actual_lbl:<20} | {row_vals}")
    print("=" * 76 + "\n")


def train_pre_fermentation_rf():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    csv_path = os.path.join(base_dir, 'wine quality using grape.csv')
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV not found at {csv_path}")
        return

    df = pd.read_csv(csv_path)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns.")
    print("Columns:", list(df.columns))

    # Feature columns
    feature_cols = [
        'Brix_TSS', 'pH', 'Titratable_Acidity_g_L', 'Glucose_Fructose_g_L',
        'YAN_mg_L', 'Malic_Acid_g_L', 'Tartaric_Acid_g_L', 'Total_Phenolics_mg_L'
    ]

    # Clean / prepare features
    X = df[feature_cols].copy()
    y_score = df['Wine_Quality_Score'].copy()
    y_cat = df['Wine_Quality_Category'].copy()

    # Train Regressor for numeric Score
    X_train, X_test, y_train_score, y_test_score = train_test_split(
        X, y_score, test_size=0.2, random_state=42
    )

    rf_regressor = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        random_state=42
    )
    rf_regressor.fit(X_train, y_train_score)
    y_pred_score = rf_regressor.predict(X_test)

    # Feature importances
    importances = dict(zip(feature_cols, rf_regressor.feature_importances_))

    # Train Classifier for Category
    X_train_c, X_test_c, y_train_cat, y_test_cat = train_test_split(
        X, y_cat, test_size=0.2, random_state=42, stratify=y_cat
    )
    rf_classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        random_state=42
    )
    rf_classifier.fit(X_train_c, y_train_cat)
    y_pred_cat = rf_classifier.predict(X_test_c)

    # PRINT BEAUTIFUL TERMINAL SUMMARY TABLES
    print_terminal_metrics_table(y_test_cat, y_pred_cat, y_test_score, y_pred_score)

    # Save models
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    pkl_path = os.path.join(models_dir, 'prefermentation_rf_model.pkl')
    joblib.dump({
        'regressor': rf_regressor,
        'classifier': rf_classifier,
        'feature_cols': feature_cols,
        'feature_importances': importances
    }, pkl_path)
    print(f"[OK] Saved trained model to: {pkl_path}")

    # Export decision tree rules / linear surrogate for frontend JS engine
    trees = []
    for tree in rf_regressor.estimators_[:15]:
        tree_dict = {
            'children_left': tree.tree_.children_left.tolist(),
            'children_right': tree.tree_.children_right.tolist(),
            'feature': tree.tree_.feature.tolist(),
            'threshold': tree.tree_.threshold.tolist(),
            'value': tree.tree_.value.squeeze().tolist()
        }
        trees.append(tree_dict)

    export_data = {
        'feature_cols': feature_cols,
        'feature_importances': importances,
        'trees': trees
    }

    json_path = os.path.join(models_dir, 'prefermentation_rf_trees.json')
    with open(json_path, 'w') as f:
        json.dump(export_data, f, indent=2)
    print(f"[OK] Exported tree rules JSON to: {json_path}")

if __name__ == '__main__':
    train_pre_fermentation_rf()
