"""
Flask Web Application for Wine Quality Prediction
Provides an interactive REST API endpoint and a modern Web UI dashboard with 90%+ Accuracy.
"""

import os
from flask import Flask, request, jsonify, render_template_string
from predict import predict_wine_quality

app = Flask(__name__)

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Wine Quality Predictor | 90%+ Accuracy</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-gradient: linear-gradient(135deg, #090d16 0%, #17153b 50%, #2e0249 100%);
            --card-bg: rgba(22, 27, 46, 0.75);
            --border-color: rgba(255, 255, 255, 0.12);
            --accent-purple: #9333ea;
            --accent-pink: #ec4899;
            --accent-green: #10b981;
            --accent-blue: #38bdf8;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background: var(--bg-gradient);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 30px 15px;
        }

        .container {
            width: 100%;
            max-width: 1050px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            border-radius: 28px;
            padding: 45px;
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.65);
        }

        header {
            text-align: center;
            margin-bottom: 35px;
        }

        .badge-tag {
            display: inline-block;
            background: rgba(147, 51, 234, 0.25);
            border: 1px solid rgba(168, 85, 247, 0.5);
            color: #c084fc;
            padding: 6px 16px;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }

        header h1 {
            font-size: 2.7rem;
            font-weight: 800;
            background: linear-gradient(to right, #c084fc, #f472b6, #38bdf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 8px;
        }

        header p {
            color: var(--text-muted);
            font-size: 1.1rem;
        }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 22px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .input-group label {
            font-size: 0.88rem;
            font-weight: 600;
            color: #cbd5e1;
            display: flex;
            justify-content: space-between;
        }

        .input-group input, .input-group select {
            background: rgba(15, 23, 42, 0.65);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 13px 16px;
            color: #ffffff;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }

        .input-group input:focus, .input-group select:focus {
            border-color: var(--accent-purple);
            box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.3);
        }

        .btn-submit {
            grid-column: 1 / -1;
            margin-top: 15px;
            background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
            border: none;
            border-radius: 16px;
            padding: 18px;
            font-size: 1.15rem;
            font-weight: 700;
            color: white;
            cursor: pointer;
            transition: all 0.25s ease;
            box-shadow: 0 10px 25px -5px rgba(236, 72, 153, 0.4);
        }

        .btn-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 30px -5px rgba(236, 72, 153, 0.6);
        }

        .result-card {
            margin-top: 35px;
            background: rgba(15, 23, 42, 0.85);
            border: 1px solid rgba(147, 51, 234, 0.35);
            border-radius: 22px;
            padding: 30px;
            display: none;
            animation: fadeIn 0.4s ease-in-out forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            margin-bottom: 20px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .score-badge {
            font-size: 2.2rem;
            font-weight: 800;
            color: #10b981;
        }

        .confidence {
            font-size: 1.3rem;
            font-weight: 700;
            color: #38bdf8;
        }

        .probs-list {
            margin-top: 15px;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
        }

        .prob-chip {
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            padding: 10px 18px;
            border-radius: 12px;
            font-size: 0.95rem;
        }

        .recommendations-box {
            margin-top: 25px;
            background: rgba(30, 41, 59, 0.5);
            border-radius: 14px;
            padding: 20px;
            border-left: 4px solid var(--accent-purple);
        }

        .recommendations-box h4 {
            color: #f472b6;
            margin-bottom: 10px;
            font-size: 1.05rem;
        }

        .rec-item {
            margin: 8px 0;
            font-size: 0.92rem;
            color: #cbd5e1;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="badge-tag">High-Accuracy 90%+ Stacking Ensemble</div>
            <h1>🍷 AI Wine Quality Predictor</h1>
            <p>Production Enological Decision Engine & Physicochemical Fermentation Analytics</p>
        </header>

        <form id="predictionForm" class="grid">
            <div class="input-group">
                <label for="wine_type">Wine Type</label>
                <select id="wine_type" name="wine_type">
                    <option value="Red">Red Wine</option>
                    <option value="White" selected>White Wine</option>
                </select>
            </div>
            <div class="input-group">
                <label for="alcohol">Alcohol (% vol)</label>
                <input type="number" step="0.1" id="alcohol" name="alcohol" value="12.0" required>
            </div>
            <div class="input-group">
                <label for="volatile_acidity">Volatile Acidity (g/dm³)</label>
                <input type="number" step="0.01" id="volatile_acidity" name="volatile acidity" value="0.25" required>
            </div>
            <div class="input-group">
                <label for="citric_acid">Citric Acid (g/dm³)</label>
                <input type="number" step="0.01" id="citric_acid" name="citric acid" value="0.36" required>
            </div>
            <div class="input-group">
                <label for="residual_sugar">Residual Sugar (g/dm³)</label>
                <input type="number" step="0.1" id="residual_sugar" name="residual sugar" value="3.5" required>
            </div>
            <div class="input-group">
                <label for="chlorides">Chlorides (g/dm³)</label>
                <input type="number" step="0.001" id="chlorides" name="chlorides" value="0.040" required>
            </div>
            <div class="input-group">
                <label for="free_sulfur_dioxide">Free SO₂ (mg/dm³)</label>
                <input type="number" step="1" id="free_sulfur_dioxide" name="free sulfur dioxide" value="32" required>
            </div>
            <div class="input-group">
                <label for="total_sulfur_dioxide">Total SO₂ (mg/dm³)</label>
                <input type="number" step="1" id="total_sulfur_dioxide" name="total sulfur dioxide" value="115" required>
            </div>
            <div class="input-group">
                <label for="density">Density (g/cm³)</label>
                <input type="number" step="0.0001" id="density" name="density" value="0.9930" required>
            </div>
            <div class="input-group">
                <label for="pH">pH</label>
                <input type="number" step="0.01" id="pH" name="pH" value="3.25" required>
            </div>
            <div class="input-group">
                <label for="sulphates">Sulphates (g/dm³)</label>
                <input type="number" step="0.01" id="sulphates" name="sulphates" value="0.55" required>
            </div>
            <div class="input-group">
                <label for="fixed_acidity">Fixed Acidity (g/dm³)</label>
                <input type="number" step="0.1" id="fixed_acidity" name="fixed acidity" value="7.2" required>
            </div>

            <button type="submit" class="btn-submit">Predict Wine Quality Tier</button>
        </form>

        <div id="resultCard" class="result-card">
            <div class="result-header">
                <div>
                    <h3 style="color: #94a3b8; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px;">Quality Classification</h3>
                    <div class="score-badge" id="scoreBadge">Premium (7-9)</div>
                    <div id="tierTitle" style="color: #c084fc; font-weight: 600; font-size: 1.1rem; margin-top: 4px;">Grand Reserve Quality</div>
                </div>
                <div style="text-align: right;">
                    <div class="confidence" id="confidenceVal">94.8% Confidence</div>
                    <small style="color: var(--text-muted);">90%+ Stacking Ensemble</small>
                </div>
            </div>

            <h4 style="margin-top: 15px; font-size: 0.95rem; color: #cbd5e1;">Ensemble Probability Distribution:</h4>
            <div class="probs-list" id="probsList"></div>

            <div class="recommendations-box" id="recBox">
                <h4>🧪 AI Enological Recommendations:</h4>
                <div id="recList"></div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('predictionForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {};
            formData.forEach((value, key) => {
                if (key === 'wine_type') {
                    data[key] = value;
                } else {
                    data[key] = parseFloat(value);
                }
            });

            try {
                const response = await fetch('/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    document.getElementById('scoreBadge').textContent = result.predicted_quality;
                    document.getElementById('scoreBadge').style.color = result.tier_color || '#10b981';
                    document.getElementById('tierTitle').textContent = result.tier_title;
                    document.getElementById('confidenceVal').textContent = `${(result.confidence_score * 100).toFixed(1)}% Confidence`;

                    const probsList = document.getElementById('probsList');
                    probsList.innerHTML = '';
                    for (const [tierName, prob] of Object.entries(result.class_probabilities)) {
                        const chip = document.createElement('div');
                        chip.className = 'prob-chip';
                        chip.innerHTML = `<strong>${tierName}:</strong> ${(prob * 100).toFixed(1)}%`;
                        probsList.appendChild(chip);
                    }

                    const recList = document.getElementById('recList');
                    recList.innerHTML = '';
                    if (result.recommendations && result.recommendations.length > 0) {
                        result.recommendations.forEach(r => {
                            const p = document.createElement('div');
                            p.className = 'rec-item';
                            p.innerHTML = `• <strong>${r.param}:</strong> ${r.advice} <em>(Current: ${r.current_value}, Target: ${r.ideal_range})</em>`;
                            recList.appendChild(p);
                        });
                    } else {
                        recList.innerHTML = '<div class="rec-item">✅ All physicochemical markers align with high-quality reserve standards!</div>';
                    }

                    document.getElementById('resultCard').style.display = 'block';
                } else {
                    alert('Prediction Error: ' + result.error);
                }
            } catch (err) {
                alert('Network Error: ' + err.message);
            }
        });
    </script>
</body>
</html>
"""

from recommendation_engine import BENCHMARKS

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


@app.route('/')
def home():
    """Renders interactive Dashboard."""
    return render_template_string(HTML_TEMPLATE)


@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for container / production monitoring."""
    return jsonify({
        "status": "healthy",
        "service": "vinosphere-wine-quality-ml",
        "version": "1.0.0"
    }), 200


@app.route('/api/benchmarks', methods=['GET'])
def api_benchmarks():
    """Endpoint to return high-quality wine benchmark ranges."""
    return jsonify(BENCHMARKS)


@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def api_predict():
    """REST API endpoint for wine quality prediction, AI recommendations & complete report."""
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input JSON provided'}), 400

        wine_type = data.get('wine_type', 'Red')
        
        # Parse and sanitize chemical features dict
        features = {}
        for k, v in data.items():
            if k == 'wine_type':
                continue
            try:
                features[k] = float(v) if v is not None else 0.0
            except (ValueError, TypeError):
                features[k] = 0.0

        result = predict_wine_quality(input_features=features, wine_type=wine_type)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    debug_mode = os.environ.get('FLASK_DEBUG', 'false').lower() in ('true', '1', 't')
    print(f"Starting Wine Quality Prediction Flask Web Server on http://127.0.0.1:{port} (debug={debug_mode})")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
