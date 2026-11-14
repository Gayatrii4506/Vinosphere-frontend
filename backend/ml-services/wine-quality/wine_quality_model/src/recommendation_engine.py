"""
AI Wine Quality Recommendation Engine & Analysis Report Generator
Evaluates physicochemical parameters against high-quality wine benchmarks (Quality >= 7)
to produce actionable winemaking guidance and a complete wine diagnostic report.
"""

from typing import Dict, Any, List

BENCHMARKS = {
    'Red': {
        'fixed acidity': {'min': 7.0, 'ideal_min': 8.0, 'ideal_max': 9.5, 'max': 12.0, 'unit': 'g/dm³'},
        'volatile acidity': {'min': 0.15, 'ideal_min': 0.25, 'ideal_max': 0.45, 'max': 0.60, 'unit': 'g/dm³'},
        'citric acid': {'min': 0.15, 'ideal_min': 0.25, 'ideal_max': 0.50, 'max': 0.65, 'unit': 'g/dm³'},
        'residual sugar': {'min': 1.5, 'ideal_min': 1.8, 'ideal_max': 3.5, 'max': 6.0, 'unit': 'g/dm³'},
        'chlorides': {'min': 0.040, 'ideal_min': 0.050, 'ideal_max': 0.080, 'max': 0.100, 'unit': 'g/dm³'},
        'free sulfur dioxide': {'min': 8.0, 'ideal_min': 12.0, 'ideal_max': 22.0, 'max': 35.0, 'unit': 'mg/dm³'},
        'total sulfur dioxide': {'min': 20.0, 'ideal_min': 28.0, 'ideal_max': 48.0, 'max': 80.0, 'unit': 'mg/dm³'},
        'density': {'min': 0.9930, 'ideal_min': 0.9945, 'ideal_max': 0.9970, 'max': 0.9995, 'unit': 'g/cm³'},
        'pH': {'min': 3.10, 'ideal_min': 3.22, 'ideal_max': 3.42, 'max': 3.65, 'unit': ''},
        'sulphates': {'min': 0.55, 'ideal_min': 0.65, 'ideal_max': 0.88, 'max': 1.10, 'unit': 'g/dm³'},
        'alcohol': {'min': 9.5, 'ideal_min': 11.2, 'ideal_max': 13.5, 'max': 15.0, 'unit': '% vol'}
    },
    'White': {
        'fixed acidity': {'min': 5.5, 'ideal_min': 6.2, 'ideal_max': 7.6, 'max': 9.0, 'unit': 'g/dm³'},
        'volatile acidity': {'min': 0.12, 'ideal_min': 0.18, 'ideal_max': 0.32, 'max': 0.42, 'unit': 'g/dm³'},
        'citric acid': {'min': 0.20, 'ideal_min': 0.28, 'ideal_max': 0.45, 'max': 0.60, 'unit': 'g/dm³'},
        'residual sugar': {'min': 1.2, 'ideal_min': 2.0, 'ideal_max': 8.5, 'max': 18.0, 'unit': 'g/dm³'},
        'chlorides': {'min': 0.025, 'ideal_min': 0.032, 'ideal_max': 0.052, 'max': 0.075, 'unit': 'g/dm³'},
        'free sulfur dioxide': {'min': 18.0, 'ideal_min': 28.0, 'ideal_max': 48.0, 'max': 65.0, 'unit': 'mg/dm³'},
        'total sulfur dioxide': {'min': 80.0, 'ideal_min': 105.0, 'ideal_max': 155.0, 'max': 200.0, 'unit': 'mg/dm³'},
        'density': {'min': 0.9900, 'ideal_min': 0.9912, 'ideal_max': 0.9942, 'max': 0.9980, 'unit': 'g/cm³'},
        'pH': {'min': 3.00, 'ideal_min': 3.10, 'ideal_max': 3.30, 'max': 3.48, 'unit': ''},
        'sulphates': {'min': 0.38, 'ideal_min': 0.45, 'ideal_max': 0.62, 'max': 0.80, 'unit': 'g/dm³'},
        'alcohol': {'min': 9.5, 'ideal_min': 11.0, 'ideal_max': 13.2, 'max': 14.8, 'unit': '% vol'}
    }
}


def _safe_float(val: Any, default: float = 0.0) -> float:
    """Helper to safely convert any value to float without raising TypeError."""
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def get_quality_tier(quality_val: Any) -> Dict[str, str]:
    """
    Returns metadata for 3 commercial tiers:
    - Tier 2 / Score >= 7: Premium High Quality
    - Tier 1 / Score 5-6: Commercial Standard
    - Tier 0 / Score <= 4: Subpar / Low Grade
    """
    try:
        val = int(quality_val)
    except (ValueError, TypeError):
        val = 1

    if val == 2 or val >= 7:
        return {'title': 'Premium High Quality (Grade 7-9)', 'badge': 'High / Premium', 'color': '#10b981', 'tier_code': 2}
    elif val == 1 or val in [5, 6]:
        return {'title': 'Good Commercial Quality (Grade 5-6)', 'badge': 'Medium / Standard', 'color': '#8b5cf6', 'tier_code': 1}
    else:
        return {'title': 'Subpar / Defective Batch (Grade 3-4)', 'badge': 'Low / Subpar', 'color': '#ef4444', 'tier_code': 0}


def generate_recommendations(features: Dict[str, Any], wine_type: str) -> List[Dict[str, Any]]:
    type_key = 'White' if str(wine_type).strip().capitalize() in ['White', '1'] else 'Red'
    bm = BENCHMARKS[type_key]
    recs = []

    # 1. Volatile Acidity Check (Vinegar Spoilage Risk)
    va = _safe_float(features.get('volatile acidity'), 0.35)
    if va > bm['volatile acidity']['ideal_max']:
        severity = 'Critical' if va > bm['volatile acidity']['max'] else 'Warning'
        recs.append({
            'feature': 'Volatile Acidity',
            'current_value': f"{va:.2f} g/dm³",
            'target_range': f"{bm['volatile acidity']['ideal_min']} - {bm['volatile acidity']['ideal_max']} g/dm³",
            'status': severity,
            'impact': 'High',
            'issue': 'Elevated acetic acid levels impart a vinegary smell and harsh pungent finish.',
            'action': 'Implement reverse osmosis filtration, strictly prevent oxygen exposure during transfer, increase cold settling, and maintain active SO₂ protection to halt Acetobacter growth.',
            'score_boost': '+0.8 to +1.4 Quality Points'
        })
    elif va < bm['volatile acidity']['min']:
        recs.append({
            'feature': 'Volatile Acidity',
            'current_value': f"{va:.2f} g/dm³",
            'target_range': f"{bm['volatile acidity']['ideal_min']} - {bm['volatile acidity']['ideal_max']} g/dm³",
            'status': 'Warning',
            'impact': 'Low',
            'issue': 'Extremely low volatile acidity can lead to a flat, overly sterile sensory profile.',
            'action': 'Allow mild controlled esterification during early aging to build complexity.',
            'score_boost': '+0.2 Quality Points'
        })

    # 2. Alcohol Content Check (Structural Body & Mouthfeel)
    alc = _safe_float(features.get('alcohol'), 11.5)
    if alc < bm['alcohol']['ideal_min']:
        recs.append({
            'feature': 'Alcohol Content',
            'current_value': f"{alc:.1f}%",
            'target_range': f"{bm['alcohol']['ideal_min']} - {bm['alcohol']['ideal_max']}%",
            'status': 'Critical' if alc < bm['alcohol']['min'] else 'Warning',
            'impact': 'High',
            'issue': 'Low alcohol weakens body, mouthfeel, and warm sensory perception, reducing aging potential.',
            'action': 'Perform controlled pre-fermentation chaptalization (sugar addition) or harvest at higher °Brix in future vintages to achieve balanced target ethanol (~11.5% - 12.5%).',
            'score_boost': '+0.7 to +1.2 Quality Points'
        })

    # 3. Sulphates Check (Antioxidant & Tannin Preservation)
    sulph = _safe_float(features.get('sulphates'), 0.65)
    if sulph < bm['sulphates']['ideal_min']:
        recs.append({
            'feature': 'Sulphates',
            'current_value': f"{sulph:.2f} g/dm³",
            'target_range': f"{bm['sulphates']['ideal_min']} - {bm['sulphates']['ideal_max']} g/dm³",
            'status': 'Warning',
            'impact': 'Medium',
            'issue': 'Insufficient sulphates reduce antioxidant protection and diminish fruit aroma longevity.',
            'action': 'Supplement with small additions of potassium sulfate or potassium metabisulfite to protect wine integrity.',
            'score_boost': '+0.4 to +0.6 Quality Points'
        })

    # 4. Free SO2 Protection
    free_so2 = _safe_float(features.get('free sulfur dioxide'), 20.0)
    if free_so2 < bm['free sulfur dioxide']['ideal_min']:
        recs.append({
            'feature': 'Free SO₂',
            'current_value': f"{free_so2:.1f} mg/dm³",
            'target_range': f"{bm['free sulfur dioxide']['ideal_min']} - {bm['free sulfur dioxide']['ideal_max']} mg/dm³",
            'status': 'Warning',
            'impact': 'High' if free_so2 < bm['free sulfur dioxide']['min'] else 'Medium',
            'issue': 'Low free SO₂ leaves wine vulnerable to oxidation and premature browning.',
            'action': 'Add potassium metabisulfite (KMBS) post-fermentation to boost molecular SO₂ for oxidation defense.',
            'score_boost': '+0.5 to +0.8 Quality Points'
        })

    # 5. pH and Acidity Balance
    ph = _safe_float(features.get('pH'), 3.30)
    if ph > bm['pH']['ideal_max']:
        recs.append({
            'feature': 'pH Level',
            'current_value': f"{ph:.2f}",
            'target_range': f"{bm['pH']['ideal_min']} - {bm['pH']['ideal_max']}",
            'status': 'Warning',
            'impact': 'Medium',
            'issue': 'Elevated pH reduces tart freshness and weakens SO₂ effectiveness.',
            'action': 'Perform acidification with tartaric acid prior to bottling to drop pH into optimal range.',
            'score_boost': '+0.4 to +0.7 Quality Points'
        })
    elif ph < bm['pH']['ideal_min']:
        recs.append({
            'feature': 'pH Level',
            'current_value': f"{ph:.2f}",
            'target_range': f"{bm['pH']['ideal_min']} - {bm['pH']['ideal_max']}",
            'status': 'Warning',
            'impact': 'Medium',
            'issue': 'Excessively low pH creates overly sharp, sour sensory notes.',
            'action': 'Encourage partial malolactic fermentation (MLF) or use potassium carbonate for mild deacidification.',
            'score_boost': '+0.3 to +0.5 Quality Points'
        })

    # 6. Citric Acid Enhancement
    citric = _safe_float(features.get('citric acid'), 0.30)
    if citric < bm['citric acid']['ideal_min']:
        recs.append({
            'feature': 'Citric Acid',
            'current_value': f"{citric:.2f} g/dm³",
            'target_range': f"{bm['citric acid']['ideal_min']} - {bm['citric acid']['ideal_max']} g/dm³",
            'status': 'Optimal' if len(recs) > 3 else 'Warning',
            'impact': 'Low',
            'issue': 'Low citric acid leads to lack of crisp citrus brightness in taste finish.',
            'action': 'Add food-grade citric acid in small dosages (0.1 - 0.2 g/L) post-MLF to brighten acidity.',
            'score_boost': '+0.2 Quality Points'
        })

    # Sort recommendations by impact (High -> Medium -> Low)
    impact_order = {'High': 0, 'Medium': 1, 'Low': 2}
    recs.sort(key=lambda r: impact_order.get(r['impact'], 3))

    return recs


def generate_complete_report(input_features: Dict[str, Any], predicted_quality: int, confidence: float, wine_type: str) -> Dict[str, Any]:
    type_key = 'White' if str(wine_type).strip().capitalize() in ['White', '1'] else 'Red'
    bm = BENCHMARKS[type_key]

    score_acc = 0.0
    total_weights = 0.0
    weights = {
        'alcohol': 2.5, 'volatile acidity': 2.5, 'sulphates': 2.0,
        'free sulfur dioxide': 1.5, 'pH': 1.5, 'total sulfur dioxide': 1.0,
        'fixed acidity': 1.0, 'citric acid': 1.0, 'chlorides': 1.0,
        'residual sugar': 1.0, 'density': 1.0
    }

    param_details = []
    for key, raw_val in input_features.items():
        if key not in bm:
            continue
        cfg = bm[key]
        val = _safe_float(raw_val, (cfg['ideal_min'] + cfg['ideal_max']) / 2.0)
        
        w = weights.get(key, 1.0)
        total_weights += w

        ideal_mid = (cfg['ideal_min'] + cfg['ideal_max']) / 2.0
        range_half = (cfg['ideal_max'] - cfg['ideal_min']) / 2.0
        if range_half == 0:
            range_half = 1.0

        dist = abs(val - ideal_mid)
        if cfg['ideal_min'] <= val <= cfg['ideal_max']:
            feat_score = 100.0
            status = 'Optimal'
        elif cfg['min'] <= val <= cfg['max']:
            feat_score = max(50.0, 100.0 - ((dist - range_half) / range_half) * 35.0)
            status = 'Warning'
        else:
            feat_score = max(10.0, 50.0 - ((dist - range_half) / range_half) * 40.0)
            status = 'Critical'

        score_acc += feat_score * w

        param_details.append({
            'key': key,
            'name': key.title(),
            'value': float(val),
            'ideal_min': cfg['ideal_min'],
            'ideal_max': cfg['ideal_max'],
            'unit': cfg['unit'],
            'status': status,
            'score': round(feat_score, 1)
        })

    balance_index = round(score_acc / total_weights, 1) if total_weights > 0 else 75.0
    tier = get_quality_tier(predicted_quality)
    recs = generate_recommendations(input_features, type_key)

    va = _safe_float(input_features.get('volatile acidity'), 0.35)
    alc = _safe_float(input_features.get('alcohol'), 11.5)
    free_so2 = _safe_float(input_features.get('free sulfur dioxide'), 20.0)
    ph = _safe_float(input_features.get('pH'), 3.30)

    risks = {
        'spoilage_risk': 'High' if va > bm['volatile acidity']['max'] else ('Moderate' if va > bm['volatile acidity']['ideal_max'] else 'Low'),
        'oxidation_risk': 'High' if free_so2 < bm['free sulfur dioxide']['min'] else ('Moderate' if free_so2 < bm['free sulfur dioxide']['ideal_min'] else 'Low'),
        'microbial_risk': 'High' if ph > bm['pH']['max'] else ('Moderate' if ph > bm['pH']['ideal_max'] else 'Low'),
        'body_balance': 'Optimal' if alc >= bm['alcohol']['ideal_min'] else 'Weak / Low Ethanol'
    }

    summary = (
        f"This sample is classified as {type_key} Wine with a predicted Quality Score of {predicted_quality}/10 ({tier['title']}) "
        f"at {confidence * 100:.1f}% confidence. Its overall Chemical Balance Index is {balance_index}%. "
    )
    if recs:
        summary += f"We identified {len(recs)} target parameters for winemaking optimization, with the primary bottleneck being {recs[0]['feature']}."
    else:
        summary += "All key chemical parameters are within optimal high-quality benchmark targets."

    return {
        'summary': summary,
        'predicted_quality': predicted_quality,
        'confidence_score': round(confidence * 100, 1),
        'tier': tier,
        'chemical_balance_index': balance_index,
        'wine_type': type_key,
        'parameter_details': param_details,
        'recommendations': recs,
        'risks': risks
    }
