# 🍇 VinoSphere Platform

> **Intelligent Wine Discovery, Enological Quality Assurance & Winery Operations Management Ecosystem**

VinoSphere is a full-stack, enterprise-grade viticulture and enological platform designed for consumers, winery estate operators, and platform administrators. Built as a unified modern monorepo, VinoSphere bridges machine-learning-driven sensory recommendations, laboratory physicochemical quality audits, and end-to-end vineyard tourism operations.

---

## 🏛️ System Architecture

```text
                                  ┌──────────────────────────┐
                                  │      VinoSphere Web      │
                                  │       Architecture       │
                                  └────────────┬─────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐         ┌─────────────────────┐
    │  Consumer Discovery │         │   Winery Dashboard  │         │   Admin Dashboard   │
    │  (frontend/consumer)│         │ (frontend/winery)   │         │ (frontend/admin)    │
    │    Next.js (App)    │         │    Next.js (App)    │         │    Next.js (App)    │
    └──────────┬──────────┘         └──────────┬──────────┘         └──────────┬──────────┘
               │                               │                               │
               └───────────────────────┬───────┴───────────────────────────────┘
                                       │
                                       ▼
                     ┌───────────────────────────────────┐
                     │         Backend REST API          │
                     │           (backend/api)           │
                     │    Express + TypeScript + JWT     │
                     └─────────────────┬─────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
          ┌─────────────────────┐             ┌─────────────────────┐
          │ Supabase PostgreSQL │             │ ML / AI Services    │
          │   Auth & Database   │             │ (backend/ml-serv.)  │
          │ (Row-Level Security)│             │ CatBoost + FastAPI  │
          └─────────────────────┘             └─────────────────────┘
```

---

## 📦 Core Applications & Modules

### 1. 🍷 Consumer Discovery Platform (`frontend/consumer`)
* **32D Palate Profiler**: Multi-dimensional sensory onboarding wizard capturing sweetness, acidity, tannins, body, and flavor preferences mapped into a 32-dimensional continuous latent space.
* **Explainable Sommelier Recommendations**: Feature-attribution recommender explaining why specific bottles match the user's palate.
* **Wine Quality Assay Lab**: Visual laboratory explorer analyzing physicochemical characteristics (Alcohol ABV, Volatile Acidity, Free $\text{SO}_2$, pH, Density) backed by ML grading (**84.87% accuracy**).
* **Gastronomic Pairing Guide**: Dynamic pairings for 12 culinary categories covering regional Indian dishes and international gastronomy.
* **Vineyard Tourism & Bookings**: Estate discovery by terroir/region, experience bookings, and QR-ticket generation.
* **User Cellar & Wishlist**: Personal cellar collection, wishlist, and tasting journal with real-time preference drift tracking.

### 2. 🏰 Winery Operations Dashboard (`frontend/winery-dashboard`)
* **Estate Management**: Winery story, terroir profiling, geo-coordinates, awards, and certifications.
* **Catalog & Laboratory Management**: Direct wine management with vintage specs, pricing, and laboratory assay attributes.
* **Experiences & Events**: Scheduling, ticket pricing, and capacity allocation for cellar door tastings and masterclasses.
* **Corporate Leads CRM**: Tailored B2B pipeline tracking corporate retreats, bulk orders, and private events with status workflows (`New Inquiry`, `Proposal Sent`, `Accepted`, `Rejected`).
* **Executive Analytics & Reporting**: Real-time Gross Booking Value (GBV) breakdown, attendance rates, view-to-save conversion metrics, and 1-click PDF/CSV report exports.

### 3. 🛡️ Platform Administration Portal (`frontend/admin-dashboard`)
* **Winery Approvals**: Rigorous KYC verification pipeline for newly registered viticulture estates.
* **Catalog Oversight**: Wine compliance, laboratory assay validation, and estate listing audits.
* **User & Role Governance**: Centralized RBAC management across Consumers, Winery Managers, and Platform Admins.
* **Platform Health**: Global booking transactions, platform commission analytics, and review moderation.

### 4. ⚙️ Backend API Service (`backend/api`)
* **Framework**: Express.js with TypeScript and structured routing.
* **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) and JWT authentication.
* **Business Analytics Engine**: High-performance aggregation pipeline for time-series views, saves, booking conversions, and GBV metrics.
* **Enterprise Security**: Helmet HTTP headers, CORS origin whitelisting, request rate limiting, and Pino structured logging.

### 5. 🤖 Machine Learning Services (`backend/ml-services`)
* **Wine Quality Prediction**: CatBoost / Scikit-Learn ensemble trained on extensive physicochemical assays to predict bottle quality.
* **Gastronomic Pairing Engine**: FastAPI service providing food-to-wine pairing affinities based on sensory chemical balance.

### 6. 📊 Academic Research & Testing Suite (`FYP_Testing_Documentation`, `results`)
* Comprehensive test automation matrices and traceability reports for Final Year Project (FYP) academic review.
* Empirical experimental validation datasets, evaluation scripts, and LaTeX documentation.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **Python**: 3.10+ (for ML services)

### Installation

Clone the repository and install root workspace dependencies:
```bash
git clone https://github.com/Gayatrii4506/Vinosphere-good-ui.git
cd Vinosphere-good-ui
npm install
```

---

## 💻 Running the Platform Locally

### 🌟 1-Command Full Stack Startup (Recommended)
Launch all core services simultaneously (Backend API, Winery Dashboard, Admin Dashboard, and Consumer App):
```bash
npm run dev:all
```

### 📌 Starting Individual Services

| Application / Service | Port | Dev Command | Build Command |
| :--- | :---: | :--- | :--- |
| **Consumer Frontend** | `3000` | `npm run dev:consumer` | `npm run build:consumer` |
| **Winery Dashboard** | `3001` | `npm run dev:winery` | `npm run build:winery` |
| **Admin Dashboard** | `3002` | `npm run dev:admin` | `npm run build:admin` |
| **Backend REST API** | `5000` | `npm run dev:backend` | `npm run build:backend` |
| **Food Recommendation API**| `8000` | `npm run dev:food-api` | — |

---

## 🔐 Environment Variables

### Consumer Application (`frontend/consumer/.env.local`)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Winery Dashboard (`frontend/winery-dashboard/.env.local`)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_ANALYTICS_DEMO_MODE=true
```

### Admin Dashboard (`frontend/admin-dashboard/.env.local`)
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
```

### Backend API (`backend/api/.env`)
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 🧪 Testing & Verification

Run tests and builds across each application:

```bash
# Verify TypeScript and Next.js production builds
npm run build:consumer
npm run build:winery
npm run build:admin
npm run build:backend

# Run backend test suite
npm run test:backend

# Seed sample winery analytics data
npm run seed:sula
```

---

## 🌐 Production Deployment

The frontend applications are optimized for deployment on **Vercel** with dedicated Root Directories:

| Application | Vercel Root Directory | Production URL |
| :--- | :--- | :--- |
| **Consumer App** | `frontend/consumer` | `https://vinosphere-frontend.vercel.app` |
| **Winery Dashboard** | `frontend/winery-dashboard` | Configurable per estate |
| **Admin Dashboard** | `frontend/admin-dashboard` | Dedicated administrative domain |

### Supabase Redirects Configuration
Ensure the following redirect URLs are whitelisted in **Supabase Auth > URL Configuration**:
* `https://vinosphere-frontend.vercel.app/auth/callback`
* `https://vinosphere-frontend.vercel.app/auth/confirm`
* `http://localhost:3000/auth/callback`
* `http://localhost:3000/auth/confirm`

---

## 📄 License
This project is developed as an academic Final Year Project (FYP) for Viticulture Discovery, Sensory Profiling, and Estate Operations Management.
All rights reserved.
