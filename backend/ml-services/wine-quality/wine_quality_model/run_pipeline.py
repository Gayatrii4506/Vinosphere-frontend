"""
Master Pipeline Script for Wine Quality Prediction Project
Executes end-to-end ML Pipeline: Data Loading, Merging, Cleaning, EDA,
Feature Engineering, Train-Test Split, Multi-Metric Candidate Selection on X_train,
Held-Out Test Evaluation, ROC Plotting, and Model Exporting.
"""

import os
import sys

os.environ["LOKY_MAX_CPU_COUNT"] = "4"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Ensure src/ is on python path
src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from preprocessing import load_datasets, merge_datasets, clean_data, prepare_features_and_target, BINARY_LABELS
from eda import generate_eda
from train import split_data, train_baseline_model, train_ensemble_model, save_model_artifact
from evaluate import evaluate_model, plot_confusion_matrix, plot_roc_curve, analyze_feature_importance, generate_evaluation_report
from predict import predict_wine_quality


def main():
    print("\n" + "=" * 75, flush=True)
    print("VINOSPHERE WINE QUALITY PREDICTION ML PIPELINE", flush=True)
    print("=" * 75, flush=True)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    red_csv = os.path.join(base_dir, 'data', 'winequality-red.csv')
    white_csv = os.path.join(base_dir, 'data', 'winequality-white.csv')
    
    plots_dir = os.path.join(base_dir, 'outputs', 'plots')
    reports_dir = os.path.join(base_dir, 'outputs', 'reports')
    model_path = os.path.join(base_dir, 'models', 'wine_quality_model.pkl')

    # STEP 1: Load Datasets
    df_red, df_white = load_datasets(red_csv, white_csv)

    # STEP 2: Merge Datasets & Assign wine_type
    df_merged = merge_datasets(df_red, df_white)

    # STEP 3: Data Cleaning
    cleaning_report = os.path.join(reports_dir, 'data_cleaning_report.md')
    df_clean = clean_data(df_merged, report_output_path=cleaning_report)

    # STEP 4: Exploratory Data Analysis (EDA)
    print("\n" + "=" * 60, flush=True)
    print("STEP 4: EXPLORATORY DATA ANALYSIS (EDA)", flush=True)
    print("=" * 60, flush=True)
    eda_report_file = os.path.join(reports_dir, 'eda_report.md')
    if not os.path.exists(eda_report_file):
        generate_eda(df_clean, output_dir=plots_dir, report_dir=reports_dir)
    else:
        print("[OK] EDA reports and plots already up-to-date.", flush=True)

    # STEP 5: Binary Target Formulation & Feature Engineering
    X, y = prepare_features_and_target(df_clean, target_mode='binary', use_domain_features=True)

    # STEP 6: Stratified Train-Test Split (80% Train, 20% Held-Out Test)
    X_train, X_test, y_train, y_test = split_data(X, y, test_size=0.20, random_state=42)

    # STEP 7: Train Baseline Random Forest
    baseline_rf = train_baseline_model(X_train, y_train, random_state=42)

    # STEP 8: Candidate Model Selection (5-Fold Stratified CV on X_train only)
    best_ensemble, meta_info = train_ensemble_model(X_train, y_train, random_state=42, selection_metric='macro_f1')

    # STEP 9: Evaluation on Strictly Held-Out Test Set
    try:
        print("\n--- Evaluating Baseline Random Forest Model on Test Set ---", flush=True)
        baseline_metrics = evaluate_model(baseline_rf, X_test, y_test)

        print(f"\n--- Evaluating Final {meta_info['best_architecture']} Model on Test Set ---", flush=True)
        try:
            tuned_metrics = evaluate_model(best_ensemble, X_test, y_test)
        except Exception as err:
            import traceback
            print(f"\n[EXPLICIT ERROR IN EVALUATE_MODEL]: {err}", flush=True)
            traceback.print_exc()
            sys.exit(1)

        # Save Confusion Matrix Plot
        print("\n--- Saving Confusion Matrix Plot ---", flush=True)
        cm_plot_path = os.path.join(plots_dir, 'confusion_matrix.png')
        plot_confusion_matrix(tuned_metrics['confusion_matrix'], labels=tuned_metrics['labels'], output_path=cm_plot_path)

        # Save ROC Curve Plot
        print("\n--- Saving ROC Curve Plot ---", flush=True)
        roc_plot_path = os.path.join(plots_dir, 'roc_curve.png')
        plot_roc_curve(y_test, tuned_metrics['y_prob'], model_name=meta_info['best_architecture'], output_path=roc_plot_path)

        # STEP 10: Feature Importance Analysis (Strictly on X_train)
        print("\n--- Performing Feature Importance Analysis ---", flush=True)
        fi_plot_path = os.path.join(plots_dir, 'feature_importance.png')
        importance_df, corr_series = analyze_feature_importance(best_ensemble, X_train, y_train, output_path=fi_plot_path)

        # STEP 11: Save Best Model Artifact
        print("\n--- Saving Model Artifact ---", flush=True)
        save_model_artifact(best_ensemble, model_path=model_path)

        # STEP 12: Generate Comprehensive Evaluation Report
        print("\n--- Generating Model Evaluation Report ---", flush=True)
        eval_report_path = os.path.join(reports_dir, 'model_evaluation_report.md')
        generate_evaluation_report(baseline_metrics, tuned_metrics, meta_info, importance_df, corr_series, output_path=eval_report_path)

        # STEP 13: Verify Inference Engine
        print("\n" + "=" * 60, flush=True)
        print("INFERENCE ENGINE VERIFICATION", flush=True)
        print("=" * 60, flush=True)
        sample_input = {
            'fixed acidity': 7.0,
            'volatile acidity': 0.22,
            'citric acid': 0.38,
            'residual sugar': 3.2,
            'chlorides': 0.038,
            'free sulfur dioxide': 35.0,
            'total sulfur dioxide': 110.0,
            'density': 0.9920,
            'pH': 3.20,
            'sulphates': 0.58,
            'alcohol': 12.5
        }
        pred_res = predict_wine_quality(sample_input, wine_type='White', model_path=model_path)
        print("Sample White Wine Prediction Result:", flush=True)
        print(f"  Predicted Quality:    {pred_res['predicted_quality']}", flush=True)
        print(f"  Tier Badge:           {pred_res['tier_badge']}", flush=True)
        print(f"  Confidence Score:     {pred_res['confidence_score']*100:.2f}%", flush=True)
        print(f"  Premium Probability:  {pred_res['premium_probability']*100:.2f}%", flush=True)
        print(f"  Class Probabilities:  {pred_res['class_probabilities']}", flush=True)
        print(f"  Diagnostic Tier:      {pred_res['diagnostic_tier']}", flush=True)

        print("\n" + "=" * 75, flush=True)
        print(f"[OK] PIPELINE COMPLETED SUCCESSFULLY! HELD-OUT TEST ACCURACY: {tuned_metrics['accuracy']*100:.2f}% | MACRO F1: {tuned_metrics['f1_macro']:.4f}", flush=True)
        print("=" * 75, flush=True)
    except Exception as e:
        import traceback
        print("\n[ERROR] Exception encountered during evaluation/reporting pipeline:", flush=True)
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
