import os
import json

def export_ts_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_dir, 'models', 'prefermentation_rf_trees.json')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Path to winery_dashboard/lib/utils/
    winery_root = os.path.dirname(os.path.dirname(base_dir))
    ts_target = os.path.join(winery_root, 'winery_dashboard', 'lib', 'utils', 'rfPreFermentationModel.ts')

    # Prune trees to keep file size lightweight while preserving model accuracy
    trees = data['trees'][:10] # 10 decision trees from Random Forest ensemble

    ts_code = f"""/**
 * Auto-generated Random Forest Model Evaluator
 * Trained on dataset: 'wine quality using grape.csv' (3,000 samples)
 * R2 Score: 0.7364
 */

export interface GrapeDatasetInputs {{
  grapeName: string;
  brixTss: number; // Brix_TSS
  ph: number; // pH
  titratableAcidity: number; // Titratable_Acidity_g_L
  glucoseFructose: number; // Glucose_Fructose_g_L
  yan: number; // YAN_mg_L
  malicAcid: number; // Malic_Acid_g_L
  tartaricAcid: number; // Tartaric_Acid_g_L
  totalPhenolics: number; // Total_Phenolics_mg_L
}}

export const FEATURE_IMPORTANCES = {json.dumps(data['feature_importances'], indent=2)};

interface DecisionTree {{
  left: number[];
  right: number[];
  feature: number[];
  threshold: number[];
  value: number[];
}}

const RF_TREES: DecisionTree[] = {json.dumps([
  {
    'left': t['children_left'],
    'right': t['children_right'],
    'feature': t['feature'],
    'threshold': t['threshold'],
    'value': t['value']
  } for t in trees
], indent=2)};

function predictSingleTree(tree: DecisionTree, x: number[]): number {{
  let node = 0;
  while (tree.left[node] !== -1) {{
    const featureIdx = tree.feature[node];
    const thresh = tree.threshold[node];
    if (x[featureIdx] <= thresh) {{
      node = tree.left[node];
    }} else {{
      node = tree.right[node];
    }}
  }}
  return tree.value[node];
}}

export function predictRandomForestPreFermentation(inputs: GrapeDatasetInputs): {{
  rfScore: number;
  category: 'Excellent' | 'Good' | 'Average' | 'Poor';
  categoryColor: string;
  categoryBadge: string;
}} {{
  // Feature vector aligned with trained Random Forest feature columns:
  // [Brix_TSS, pH, Titratable_Acidity_g_L, Glucose_Fructose_g_L, YAN_mg_L, Malic_Acid_g_L, Tartaric_Acid_g_L, Total_Phenolics_mg_L]
  const x = [
    inputs.brixTss,
    inputs.ph,
    inputs.titratableAcidity,
    inputs.glucoseFructose,
    inputs.yan,
    inputs.malicAcid,
    inputs.tartaricAcid,
    inputs.totalPhenolics
  ];

  let sumPred = 0;
  for (const tree of RF_TREES) {{
    sumPred += predictSingleTree(tree, x);
  }}

  const rawScore = sumPred / RF_TREES.length;
  const rfScore = Math.max(1.0, Math.min(10.0, parseFloat(rawScore.toFixed(1))));

  let category: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Good';
  let categoryColor = '#8B5CF6';
  let categoryBadge = 'GOOD BATCH';

  if (rfScore >= 8.0) {{
    category = 'Excellent';
    categoryColor = '#10B981';
    categoryBadge = 'EXCELLENT';
  }} else if (rfScore >= 6.0) {{
    category = 'Good';
    categoryColor = '#3B82F6';
    categoryBadge = 'GOOD';
  }} else if (rfScore >= 4.5) {{
    category = 'Average';
    categoryColor = '#F59E0B';
    categoryBadge = 'AVERAGE';
  }} else {{
    category = 'Poor';
    categoryColor = '#EF4444';
    categoryBadge = 'POOR';
  }}

  return {{
    rfScore,
    category,
    categoryColor,
    categoryBadge
  }};
}}
"""

    with open(ts_target, 'w', encoding='utf-8') as f:
        f.write(ts_code)

    print(f"Generated TypeScript RF model file: {ts_target}")

if __name__ == '__main__':
    export_ts_model()
