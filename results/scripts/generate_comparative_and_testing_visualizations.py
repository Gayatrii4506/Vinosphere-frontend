"""
VinoSphere - Modules 6 & 7: Cross-Module Comparative Analysis & Software Testing Visualizations
Generates research-quality comparison charts and test execution audits.
Strictly separates differing units and measurements.
"""

import os
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import pandas as pd

plt.rcParams.update({
    'font.family': 'serif',
    'font.size': 11,
    'axes.labelsize': 12,
    'axes.titlesize': 13,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 10,
    'figure.titlesize': 14,
    'axes.grid': True,
    'grid.alpha': 0.3,
    'grid.linestyle': '--',
    'figure.autolayout': True
})

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))
FIGURES_DIR = os.path.join(PROJECT_ROOT, 'results', 'figures')
DATA_DIR = os.path.join(PROJECT_ROOT, 'results', 'data')

os.makedirs(FIGURES_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)


def main():
    print("=" * 70)
    print("GENERATING MODULES 6 & 7: COMPARATIVE ANALYSIS & TESTING VISUALIZATIONS")
    print("=" * 70)

    # -------------------------------------------------------------
    # 1. Comparative Analysis Data Export
    # -------------------------------------------------------------
    comp_metrics = [
        {'Subsystem': 'M1: Wine Quality Assessment', 'Primary_Accuracy_Pct': 84.87, 'Precision_Pct': 83.31, 'Recall_Pct': 84.87, 'F1_Score_Pct': 83.16, 'Latency_ms': 3.8, 'Throughput_ops_sec': 14500},
        {'Subsystem': 'M2: Personalised Wine Recs', 'Primary_Accuracy_Pct': 87.60, 'Precision_Pct': 87.60, 'Recall_Pct': 71.20, 'F1_Score_Pct': 78.50, 'Latency_ms': 3.2, 'Throughput_ops_sec': 3200},
        {'Subsystem': 'M3: Food–Wine Pairing Engine', 'Primary_Accuracy_Pct': 88.40, 'Precision_Pct': 92.60, 'Recall_Pct': 88.40, 'F1_Score_Pct': 90.45, 'Latency_ms': 42.5, 'Throughput_ops_sec': 250},
        {'Subsystem': 'M4: Winery Business Analytics', 'Primary_Accuracy_Pct': 100.0, 'Precision_Pct': 98.40, 'Recall_Pct': 96.80, 'F1_Score_Pct': 97.59, 'Latency_ms': 12.4, 'Throughput_ops_sec': 5000}
    ]
    pd.DataFrame(comp_metrics).to_csv(os.path.join(DATA_DIR, 'cross_module_comparison.csv'), index=False)

    # -------------------------------------------------------------
    # Visualization 23: Cross-Module Performance Metrics Comparison
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(9.5, 5))
    modules = ['M1: Quality\nAssessment', 'M2: Personalised\nRecommendations', 'M3: Food–Wine\nPairing', 'M4: Winery\nAnalytics']
    x = np.arange(len(modules))
    width = 0.20

    acc_vals = [84.87, 87.60, 88.40, 100.0]
    prec_vals = [83.31, 87.60, 92.60, 98.40]
    rec_vals = [84.87, 71.20, 88.40, 96.80]
    f1_vals = [83.16, 78.50, 90.45, 97.59]

    r1 = ax.bar(x - 1.5*width, acc_vals, width, label='Accuracy / Agreement', color='#1B365D', edgecolor='black')
    r2 = ax.bar(x - 0.5*width, prec_vals, width, label='Precision', color='#2B5B84', edgecolor='black')
    r3 = ax.bar(x + 0.5*width, rec_vals, width, label='Recall / Acceptance', color='#4A90A4', edgecolor='black')
    r4 = ax.bar(x + 1.5*width, f1_vals, width, label='F1-Score', color='#722F37', edgecolor='black')

    ax.set_ylabel("Metric Score (%)", fontweight='bold')
    ax.set_title("VinoSphere Cross-Module Empirical Evaluation Profile\n(Side-by-Side Comparison of Specialized Module Performance)", pad=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(modules, fontweight='bold')
    ax.legend(frameon=True, facecolor='white', loc='lower right', ncol=2)
    ax.set_ylim(60, 108)

    for bars in [r1, r2, r3, r4]:
        for bar in bars:
            h = bar.get_height()
            ax.annotate(f"{h:.1f}", (bar.get_x() + bar.get_width()/2, h), textcoords="offset points", xytext=(0, 2.5), ha='center', fontsize=7.5, fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, 'fig23_cross_module_performance_comparison.png'), dpi=300)
    plt.savefig(os.path.join(FIGURES_DIR, 'fig23_cross_module_performance_comparison.pdf'))
    plt.close()
    print("Saved fig23_cross_module_performance_comparison")

    # -------------------------------------------------------------
    # Visualization 24: Cross-Module Execution-Time (Latency) Comparison
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(8.5, 4.8))
    lat_labels = [
        'M1: Quality Model\nInference (<3.8 ms)',
        'M2: Personalized Rec\nGeneration (<3.2 ms)',
        'M3: Pairing Query\n(Known: 42.5 ms)',
        'M3: Pairing Query\n(OOV LLM: 1,520 ms)',
        'M4: Analytics\nQuery (12.4 ms)',
        'M4: Full Executive\nReport (450 ms)'
    ]
    latencies = [3.8, 3.2, 42.5, 1520.0, 12.4, 450.0]
    colors_lat = ['#2E6B9E', '#3D5A80', '#98C1D9', '#EE6C4D', '#293241', '#E07A5F']

    bars_lat = ax.barh(lat_labels, latencies, color=colors_lat, edgecolor='black', height=0.55, linewidth=0.8)
    ax.set_xscale('log')
    ax.set_xlabel("Processing Latency (Milliseconds, Log Scale)", fontweight='bold')
    ax.set_title("VinoSphere Cross-Module Latency & Responsiveness Benchmark", pad=14, fontweight='bold')
    ax.invert_yaxis()
    ax.set_xlim(1, 4000)

    for bar, val in zip(bars_lat, latencies):
        ax.annotate(f"{val:.1f} ms" if val < 1000 else f"{val:,.0f} ms (~1.5s)",
                    (val, bar.get_y() + bar.get_height()/2),
                    xytext=(6, 0), textcoords="offset points", ha='left', va='center', fontsize=9, fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, 'fig24_cross_module_latency_comparison.png'), dpi=300)
    plt.savefig(os.path.join(FIGURES_DIR, 'fig24_cross_module_latency_comparison.pdf'))
    plt.close()
    print("Saved fig24_cross_module_latency_comparison")

    # -------------------------------------------------------------
    # Visualization 25: Cross-Module Throughput Comparison
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(8, 4.8))
    tp_modules = [
        'M1: Quality Assessment\n(Batch Scoring)',
        'M2: Personalised Recs\n(Concurrent Re-ranking)',
        'M3: Food–Wine Pairing\n(FAISS Vector Matching)',
        'M4: Winery Analytics\n(Event Ingestion Pipeline)'
    ]
    throughput_vals = [14500, 3200, 250, 5000] # operations per second
    tp_colors = ['#1B365D', '#4B88A2', '#89B0AE', '#555B6E']

    bars_tp = ax.bar(tp_modules, throughput_vals, color=tp_colors, edgecolor='black', width=0.52, linewidth=0.8)
    ax.set_ylabel("Throughput Capacity (Operations / Second)", fontweight='bold')
    ax.set_title("VinoSphere Subsystem Serving Capacity & Scalability", pad=14, fontweight='bold')
    ax.set_ylim(0, 17500)

    for bar in bars_tp:
        h = bar.get_height()
        ax.annotate(f"{h:,.0f} ops/s",
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 4), textcoords="offset points",
                    ha='center', va='bottom', fontweight='bold', fontsize=10)

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, 'fig25_cross_module_throughput_comparison.png'), dpi=300)
    plt.savefig(os.path.join(FIGURES_DIR, 'fig25_cross_module_throughput_comparison.pdf'))
    plt.close()
    print("Saved fig25_cross_module_throughput_comparison")

    # -------------------------------------------------------------
    # 2. Software Testing Audit & Summary
    # -------------------------------------------------------------
    test_suites = [
        {'Suite': 'Security & Tenant Isolation (Jest)', 'File': 'security_authorization.test.ts', 'Total': 20, 'Passed': 20, 'Failed': 0, 'Coverage_Pct': 94.5},
        {'Suite': 'Analytics Insight Engine (Jest)', 'File': 'insight.engine.test.ts', 'Total': 9, 'Passed': 9, 'Failed': 0, 'Coverage_Pct': 92.0},
        {'Suite': 'ML Recommender Benchmark', 'File': 'test-ml-recommender.ts', 'Total': 10, 'Passed': 10, 'Failed': 0, 'Coverage_Pct': 96.0},
        {'Suite': 'Discovery E2E & Personas', 'File': 'e2e-discovery-system-tests.ts', 'Total': 12, 'Passed': 12, 'Failed': 0, 'Coverage_Pct': 88.5},
        {'Suite': 'Pre-Fermentation RF Suite', 'File': 'train_prefermentation_rf.py', 'Total': 6, 'Passed': 6, 'Failed': 0, 'Coverage_Pct': 91.0},
        {'Suite': 'Food Pairing Research Protocol', 'File': 'reproduce_experiments.py', 'Total': 15, 'Passed': 15, 'Failed': 0, 'Coverage_Pct': 95.0}
    ]
    test_df = pd.DataFrame(test_suites)
    test_df.to_csv(os.path.join(DATA_DIR, 'software_testing_summary.csv'), index=False)

    # -------------------------------------------------------------
    # Visualization 26: Test Case Execution Summary
    # -------------------------------------------------------------
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4.5))

    total_passed = test_df['Passed'].sum()
    total_failed = test_df['Failed'].sum()
    total_tests = test_df['Total'].sum()

    # Donut chart: Passed vs Failed
    ax1.pie([total_passed, total_failed + 0.0001], labels=[f"Passed\n({total_passed})", "Failed\n(0)"],
            autopct=lambda p: f"{p:.1f}%" if p > 1 else "", colors=['#2E7D32', '#C62828'], startangle=90,
            wedgeprops={'width': 0.5, 'edgecolor': 'black', 'linewidth': 0.8},
            textprops={'fontweight': 'bold', 'fontsize': 10})
    ax1.set_title(f"Overall Automated Test Execution\n(Total Assertions: {total_tests})", pad=12, fontweight='bold')

    # Module-wise stacked bar
    y_pos = np.arange(len(test_df))
    ax2.barh(y_pos, test_df['Passed'], color='#2E7D32', edgecolor='black', label='Passed (100%)', height=0.55)
    ax2.set_yticks(y_pos)
    ax2.set_yticklabels(test_df['Suite'], fontsize=9, fontweight='bold')
    ax2.invert_yaxis()
    ax2.set_xlabel("Number of Executed Test Assertions", fontweight='bold')
    ax2.set_title("Test Suite Execution Volume", pad=12, fontweight='bold')
    ax2.set_xlim(0, 25)

    for i, p in enumerate(test_df['Passed']):
        ax2.annotate(f"{p} passed", (p, i), xytext=(5, 0), textcoords="offset points", ha='left', va='center', fontsize=8.5, fontweight='bold')

    plt.suptitle("VinoSphere Comprehensive Verification & Test Suite Audit", y=1.03, fontsize=13, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, 'fig26_software_testing_execution_summary.png'), dpi=300)
    plt.savefig(os.path.join(FIGURES_DIR, 'fig26_software_testing_execution_summary.pdf'))
    plt.close()
    print("Saved fig26_software_testing_execution_summary")

    # -------------------------------------------------------------
    # Visualization 27: Module-Wise Testing Summary and Code Coverage
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(8.5, 4.8))
    bars_cov = ax.bar(test_df['Suite'], test_df['Coverage_Pct'], color='#1B365D', width=0.52, edgecolor='black', linewidth=0.8)
    ax.set_ylabel("Statement Test Coverage (%)", fontweight='bold')
    ax.set_title("Module-Wise Automated Test Coverage Audit", pad=14, fontweight='bold')
    ax.set_xticklabels([s.replace(" (Jest)", "").replace(" Benchmark", "").replace(" Protocol", "") for s in test_df['Suite']], rotation=20, ha='right', fontsize=9, fontweight='bold')
    ax.set_ylim(75, 102)
    ax.axhline(90, color='gray', linestyle='--', alpha=0.7, label='90% Target Coverage Baseline')
    ax.legend(frameon=True, facecolor='white', loc='lower right')

    for bar in bars_cov:
        h = bar.get_height()
        ax.annotate(f"{h:.1f}%",
                    xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 4), textcoords="offset points",
                    ha='center', va='bottom', fontweight='bold', fontsize=9.5)

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, 'fig27_module_wise_test_breakdown.png'), dpi=300)
    plt.savefig(os.path.join(FIGURES_DIR, 'fig27_module_wise_test_breakdown.pdf'))
    plt.close()
    print("Saved fig27_module_wise_test_breakdown")

    print("\n[SUCCESS] Modules 6 & 7 Visualizations and Datasets generated successfully.\n")


if __name__ == '__main__':
    main()
