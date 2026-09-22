# 🍷 Food & Wine Pairing Recommendation System

An AI-powered food-to-wine pairing application built with **FastAPI** (backend) and **React + Vite** (frontend).

## ✨ Features

- **Two-step AI recommendation flow** — select a food category → pick a dish → get top 5 wine pairings
- **Semantic + attribute scoring** — combines rule-based sommelier logic with sentence-transformer embeddings
- **499 dishes × 500+ wines** — sourced from a curated Indian & international food/wine dataset
- **Dynamic food categories** — derived from the dataset automatically (no hardcoding)
- **Rich filter sidebar** — filter by wine type, price, flavour profile, cuisine, body, sweetness & more
- **Browse mode** — explore the full wine catalogue without selecting a dish

## 🏗️ Architecture

```
Food Category (GET /food-categories)
       ↓
Dish Selection (GET /foods?category=Chicken)
       ↓
POST /recommend  { food_name: "Butter Chicken" }
       ↓
Attribute scoring + semantic ranking (sentence-transformers + cosine similarity)
       ↓
Top 5 wine recommendations displayed as cards
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Pandas, sentence-transformers, scikit-learn, FAISS |
| Frontend | React 18, Vite, Vanilla CSS |
| ML Model | `all-MiniLM-L6-v2` (sentence-transformers) |
| Data | `food_clean.csv` (499 rows), `wine_clean.csv` |

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Gayatrii4506/food-recommendation.git
cd food-recommendation
```

### 2. Set up the Python backend

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 3. Start the FastAPI server

```bash
uvicorn api.main:app --reload
```

API will be available at `http://127.0.0.1:8000`
Interactive docs at `http://127.0.0.1:8000/docs`

### 4. Set up the React frontend

```bash
cd food_pairing_frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/food-categories` | List all food categories |
| `GET` | `/foods?category=Chicken` | List dishes in a category |
| `POST` | `/recommend` | Get top 5 wine pairings for a dish |

### Example

```bash
curl -X POST http://127.0.0.1:8000/recommend \
  -H "Content-Type: application/json" \
  -d '{"food_name": "Butter Chicken"}'
```

```json
{
  "food": "Butter Chicken",
  "recommendations": [
    {
      "wine_name": "Gewurztraminer",
      "winery": "...",
      "wine_type": "White",
      "variety": "Gewurztraminer",
      "region": "...",
      "body": "Medium",
      "sweetness": "Off-Dry",
      "acidity": "High",
      "tannin": "Low",
      "score": 0.81
    }
  ]
}
```

## 📁 Project Structure

```
food-recommendation/
├── api/
│   ├── main.py             # FastAPI app + CORS middleware
│   ├── routes.py           # All API endpoints
│   └── models.py           # Pydantic request models
├── services/
│   ├── recommender.py          # Attribute + semantic wine scorer
│   └── food_catalog_service.py # Dynamic category/dish builder
├── processed_data/
│   ├── food_clean.csv
│   └── wine_clean.csv
├── food_pairing_frontend/
│   ├── src/
│   │   ├── App.jsx                      # Main app with two-step flow
│   │   ├── components/
│   │   │   └── HeroLanding.jsx
│   │   ├── utils/
│   │   │   ├── recommendationApi.js     # API service layer
│   │   │   └── pairingEngine.js         # Local rule engine (browse mode)
│   │   └── data/
│   │       ├── wines.js
│   │       └── foods.js
│   └── package.json
└── requirements.txt
```

## 📝 Environment Variables

Create a `.env` file in the project root if needed (not committed):

```env
# Add any API keys or config here
```

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

## 📜 License

[MIT](LICENSE)
