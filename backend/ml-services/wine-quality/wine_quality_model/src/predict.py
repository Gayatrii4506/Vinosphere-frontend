"""
Prediction Module for Wine Quality Pipeline
Provides predict_wine_quality() for production inference and Flask API backend integration,
delivering high-accuracy Premium Classification alongside 3-Tier Enological Diagnostics.
"""

import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, Union

from preprocessing import add_domain_features, BINARY_LABELS, TIER_LABELS
from recommendation_engine import generate_recommendations, generate_complete_report, get_quality_tier


def load_trained_model(model_path: str = None) -> Any:
    """
    Loads the saved Joblib ensemble model.
    """
    if model_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'models', 'wine_quality_model.pkl')

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained model file not found at: {model_path}")

    model = joblib.load(model_path)
    return model


def predict_wine_quality(
    input_features: Dict[str, Any], 
    wine_type: Union[str, int] = "Red", 
    model_path: str = None
) -> Dict[str, Any]:
    """
    Predict Wine Quality (Premium [7-9] vs Standard [3-6]), 
    Probabilities, Diagnostic Tiers, AI Enological Recommendations, and Diagnostic Report.
    """
    # 1. Encode wine_type
    if isinstance(wine_type, str):
        type_str = wine_type.strip().capitalize()
        encoded_type = 0 if type_str == 'Red' else 1
    else:
        encoded_type = int(wine_type)
        type_str = "Red" if encoded_type == 0 else "White"

    # 2. Build feature input row with base 11 chemical metrics + wine_type
    base_inputs = {
        'fixed acidity': float(input_features.get('fixed acidity', 7.0)),
        'volatile acidity': float(input_features.get('volatile acidity', 0.3)),
        'citric acid': float(input_features.get('citric acid', 0.3)),
        'residual sugar': float(input_features.get('residual sugar', 2.0)),
        'chlorides': float(input_features.get('chlorides', 0.05)),
        'free sulfur dioxide': float(input_features.get('free sulfur dioxide', 30.0)),
        'total sulfur dioxide': float(input_features.get('total sulfur dioxide', 115.0)),
        'density': float(input_features.get('density', 0.995)),
        'pH': float(input_features.get('pH', 3.2)),
        'sulphates': float(input_features.get('sulphates', 0.55)),
        'alcohol': float(input_features.get('alcohol', 11.5)),
        'wine_type': encoded_type
    }

    raw_df = pd.DataFrame([base_inputs])
    
    # 3. Add domain engineered interaction & polynomial features
    engineered_df = add_domain_features(raw_df)

    # 4. Load trained model & Predict
    model = load_trained_model(model_path)
    decision_thresh = float(getattr(model, 'decision_threshold', 0.50))
    
    # Align feature columns expected by the trained model
    if hasattr(model, 'feature_names_in_'):
        expected_cols = list(model.feature_names_in_)
        engineered_df = engineered_df[expected_cols]
    
    # Extract Probabilities & Apply Decision Threshold
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(engineered_df)[0]
        classes = model.classes_
        prob_dict = {}
        for cls_idx, prob in zip(classes, probabilities):
            label = BINARY_LABELS.get(int(cls_idx), f"Class {cls_idx}")
            prob_dict[label] = round(float(prob), 4)
        max_confidence = round(float(np.max(probabilities)), 4)
        premium_prob = prob_dict.get(BINARY_LABELS[1], 0.0)
        predicted_class_idx = 1 if premium_prob >= decision_thresh else 0
    else:
        predicted_class_idx = int(model.predict(engineered_df)[0])
        prob_dict = {BINARY_LABELS[predicted_class_idx]: 1.0}
        max_confidence = 1.0
        premium_prob = 1.0 if predicted_class_idx == 1 else 0.0

    # Diagnostic tier assignment
    # If predicted premium (1), Tier is High (2). If standard (0), check volatile acidity / SO2 to identify Low (0) vs Medium (1)
    if predicted_class_idx == 1:
        diagnostic_tier_idx = 2
    else:
        # Standard: Check for defect markers (e.g. very high volatile acidity or low alcohol)
        va = base_inputs['volatile acidity']
        alc = base_inputs['alcohol']
        if (type_str == 'Red' and (va > 0.85 or alc < 9.0)) or (type_str == 'White' and (va > 0.55 or alc < 8.8)):
            diagnostic_tier_idx = 0  # Low / Subpar
        else:
            diagnostic_tier_idx = 1  # Medium / Table Wine

    tier_info = get_quality_tier(diagnostic_tier_idx)

    # Human-readable feature summary
    display_features = input_features.copy()
    display_features['wine_type'] = type_str

    # 5. Generate AI Recommendations & Diagnostic Report
    recommendations = generate_recommendations(input_features, type_str)
    
    # Estimate score range for report
    est_score = 4 if diagnostic_tier_idx == 0 else (6 if diagnostic_tier_idx == 1 else 8)
    complete_report = generate_complete_report(input_features, est_score, max_confidence, type_str)

    result = {
        'is_premium': bool(predicted_class_idx == 1),
        'predicted_class_code': predicted_class_idx,
        'predicted_quality': BINARY_LABELS.get(predicted_class_idx, 'Standard Commercial (3-6)'),
        'diagnostic_tier': TIER_LABELS.get(diagnostic_tier_idx, 'Medium (5-6)'),
        'tier_title': "Premium Grand Reserve Quality" if predicted_class_idx == 1 else ("Standard Commercial Quality" if diagnostic_tier_idx == 1 else "Subpar / Commercial Table Wine"),
        'tier_badge': "PREMIUM" if predicted_class_idx == 1 else ("STANDARD" if diagnostic_tier_idx == 1 else "SUBPAR"),
        'tier_color': "#10b981" if predicted_class_idx == 1 else ("#38bdf8" if diagnostic_tier_idx == 1 else "#f59e0b"),
        'confidence_score': max_confidence,
        'premium_probability': round(float(premium_prob), 4),
        'class_probabilities': prob_dict,
        'feature_values_used': display_features,
        'recommendations': recommendations,
        'complete_report': complete_report
    }

    return result


if __name__ == "__main__":
    sample_red_wine = {
        'fixed acidity': 7.4,
        'volatile acidity': 0.30,
        'citric acid': 0.45,
        'residual sugar': 2.2,
        'chlorides': 0.055,
        'free sulfur dioxide': 18.0,
        'total sulfur dioxide': 42.0,
        'density': 0.9945,
        'pH': 3.35,
        'sulphates': 0.72,
        'alcohol': 12.8
    }

    print("--- Sample Premium Red Wine Quality Prediction Test ---")
    prediction = predict_wine_quality(sample_red_wine, wine_type="Red")
    print(f"Predicted Quality:    {prediction['predicted_quality']}")
    print(f"Confidence Score:     {prediction['confidence_score']*100:.2f}%")
    print(f"Premium Probability:  {prediction['premium_probability']*100:.2f}%")
    print(f"Class Probabilities:  {prediction['class_probabilities']}")
