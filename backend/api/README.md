# 🍇 VinoSphere REST API & Machine Learning Backend (`vinosphere-backend`)

The **VinoSphere Backend** is a high-performance Express & TypeScript REST API service integrated with Python Machine Learning pipelines, Supabase PostgreSQL persistence, Cloudinary asset pipelines, and automated Nodemailer ticket delivery.

---

## 🚀 Core Backend Modules & Services

### 1. 🧪 AI Wine Quality Assessment Engine (`/api/v1/quality`)
* **Soft-Voting Ensemble Model**: Analyzes 11 chemical assays + 6 domain interaction ratios to classify wine batches as **Standard Commercial** vs. **Premium Grand Reserve** (**84.87% Accuracy**, **86.79% ROC-AUC**).
* **Pre-Fermentation Grape Must Regressor**: Continuous quality score estimation ($0-10$) based on harvest must parameters (Brix, pH, TA, YAN, Phenolics, Malic Acid).
* **Enological Diagnostic Engine**: Computes Chemical Balance Index ($0-100\%$) and detects 4 critical winemaking risks (Vinegar Spoilage, Oxidation, Microbial Instability, Low Ethanol Deficit) with corrective cellar advice.

### 2. 👤 32D Latent Vector Space Recommendation Engine (`/api/v1/recommendations`)
* **Vector Transformation**: Maps wines and user taste preferences into a normalized 32D continuous vector space (Style, Sweetness, Body, Acidity, Tannins, 12 TF-IDF flavor notes, Grapes, and Price Indices).
* **Dynamic Taste Drift**: Real-time behavioral vector updates (+3.0 purchases, +2.0 wishlist, +1.8 likes, +0.3 views, -4.0 dislikes).
* **Hybrid Scoring**: Blends Cosine Similarity (55%), Bayesian Popularity Prior (30%), and Budget Alignment.
* **Explainable AI**: Sommelier feature attributions explaining exact sensory matches.

### 3. 📊 Winery Business Intelligence & Event Telemetry (`/api/v1/analytics`)
* **Data Sufficiency Gate**: Heuristic minimum observation thresholds preventing spurious statistical alerts.
* **Deterministic Pattern Detection**: Period-over-period comparative window analysis with automated actionable business guidance.
* **Executive PDF Reporting**: Automated monthly & quarterly commercial report generation.

### 4. 🎟️ Secure Reservations & QR Ticket Delivery (`/api/v1/bookings`)
* Transaction safety, customer relation resolution, and asynchronous HTML ticket dispatch with unique QR validation codes.

---

## 📁 Directory Structure

```text
vinosphere-backend/
├── scripts/                          # Database seeding & migration scripts
├── src/
│   ├── adapters/                     # Database & media storage wrappers
│   │   ├── database/SupabaseAdapter.ts
│   │   └── storage/CloudinaryAdapter.ts
│   ├── config/                       # Logger, Cloudinary, and Supabase client configs
│   ├── middleware/                   # JWT auth guard, error handling, rate limiting
│   ├── modules/                      # Domain-driven architecture
│   │   ├── admin/                    # Platform administration & KPIs
│   │   ├── analytics/                # Telemetry, Data Sufficiency & Insight Engine
│   │   ├── auth/                     # Authentication & JWT session validation
│   │   ├── bookings/                 # Reservations, transactions & QR tickets
│   │   ├── discovery/                # Public catalog feeds
│   │   ├── events/                   # Winery events & itineraries
│   │   ├── experiences/              # Tastings & estate tours
│   │   ├── quality/                  # Laboratory quality assessment service
│   │   ├── recommendations/          # 32D Vectorizer & Hybrid RecSys
│   │   ├── uploads/                  # Cloudinary image pipelines
│   │   ├── users/                    # Consumer accounts & taste profiles
│   │   ├── wineries/                 # Estate profiles & geo-locations
│   │   └── wines/                    # Wine inventory & catalog CRUD
│   ├── routes/                       # Express v1 master route dispatcher
│   ├── shared/                       # In-memory cache & email utilities
│   ├── app.ts                        # Express application configuration
│   └── server.ts                     # Server listener (Port 5000)
├── wine_quality/                     # Machine Learning Core Subsystem
│   └── wine_quality_model/
│       ├── data/                     # UCI Red & White datasets, Must dataset
│       ├── models/                   # Serialized model artifacts (.pkl, .json)
│       ├── outputs/reports/          # Markdown evaluation & cleaning reports
│       ├── src/                      # Python ML scripts (train, evaluate, predict)
│       └── run_pipeline.py           # End-to-end ML pipeline runner
├── openapi.json                      # OpenAPI / Swagger API schema
├── package.json
└── tsconfig.json
```

---

## 🛠️ API Endpoints Summary (`/api/v1`)

| Endpoint Prefix | Methods | Description |
| :--- | :--- | :--- |
| `/api/v1/wines` | `GET`, `POST`, `PUT`, `DELETE` | Wine inventory management, details, and filtering. |
| `/api/v1/recommendations` | `POST`, `GET` | 32D Vectorized taste matching, dynamic palate shifts, top picks. |
| `/api/v1/quality` | `POST` | Laboratory physicochemical quality assay evaluation & report. |
| `/api/v1/analytics` | `GET`, `POST` | Telemetry event ingestion, data sufficiency checks, insights & PDF reports. |
| `/api/v1/bookings` | `GET`, `POST` | Reservation checkout, transaction safety, ticket generation. |
| `/api/v1/experiences` | `GET`, `POST` | Winery tasting & tour management. |
| `/api/v1/events` | `GET`, `POST` | Calendar events & ticket scheduling. |
| `/api/v1/wineries` | `GET`, `POST`, `PUT` | Estate profile information & cellar listings. |
| `/api/v1/users` | `GET`, `PUT` | User profiles & taste preference onboarding quiz. |
| `/api/v1/uploads` | `POST` | Cloudinary asset media upload. |

---

## ⚙️ Installation & Running

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Environment Configuration (`.env`)
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP Email (Optional - falls back to Ethereal in development)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
```

### 3. Launch Development Server
```bash
npm run dev
```
*(Server listens on `http://localhost:5000`)*

---

## 🧪 Machine Learning Training Commands

```bash
cd wine_quality/wine_quality_model

# 1. Run Complete Quality Training Pipeline & Generate Evaluation Reports
python run_pipeline.py

# 2. Train Pre-Fermentation Harvest Must Model
python src/train_prefermentation_rf.py
```
