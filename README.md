# 🍇 VinoSphere Consumer Discovery Platform (`Vinosphere-good-ui`)

The **VinoSphere Consumer Discovery Platform** is a luxury Next.js web application engineered for wine lovers, travelers, and connoisseurs. It integrates personalized AI recommendations, sensory taste onboarding, interactive enological laboratory quality audits, and seamless vineyard experience bookings.

---

## 🚀 Key Consumer Features

### 1. 👤 32D Personalized Palate Profiler & Recommendations
* **Palate Discovery Quiz**: Multi-step interactive taste wizard capturing wine styles (Red, White, Rosé, Sparkling, Dessert), sweetness tolerance, body weight, acidity, tannin sensitivity, and flavor note affinities.
* **Continuous Vector Space Model**: Vectorizes user taste profiles against catalog bottles in a 32-dimensional normalized latent space.
* **Real-time Behavioral Drift**: Dynamically refines recommendations based on user interactions (+3.0 purchases, +2.0 wishlist, +1.8 likes, +0.3 views, -4.0 dislikes).
* **Explainable Sommelier Notes**: Transparent feature attributions highlighting exact sensory matches (e.g., *"Features your preferred full-bodied dry profile with dark blackberry notes"*).

### 2. 🧪 Consumer Wine Quality Lab
* **Laboratory Assay Explorer**: Explore physicochemical parameters (Alcohol ABV, Volatile Acidity, Free $\text{SO}_2$, pH, Density) with real-time ML quality grading (**84.87% Accuracy**).
* **Chemical Balance Index ($0-100\%$)**: Visual radar gauges showing how balanced each bottle is.

### 3. 🍽️ Food & Wine Pairing Explorer
* **Gastronomic Pairing Engine**: Browse pairings for 12 culinary categories across Indian cuisine (Butter Chicken, Biryani, Paneer Tikka) and global gastronomy (Seafood, Lamb, Pasta, Artisan Cheeses, Chocolate).

### 4. 🎟️ Winery Discovery & Interactive Bookings
* **Winery Catalog Browser**: Filter partner estates by region (Nashik, Nandi Hills, etc.), amenities, and terroir.
* **Curated Experiences & Events**: Book vineyard tours, masterclass tastings, and harvest dinners with instant QR ticket confirmation.
* **Wishlist & Tasting Journal**: Save favorite bottles and track personal tasting notes.

---

## 📁 Directory Structure

```text
Vinosphere-good-ui/
├── app/                      # Next.js App Router
│   ├── discover/             # Wine catalog & winery directory
│   ├── events/               # Vineyard tours & calendar events
│   ├── lab/                  # Consumer Wine Quality Lab
│   ├── pairing/              # Food & Wine Pairing Guide
│   ├── profile/              # User account & taste preferences
│   ├── wishlist/             # Saved bottles & wishlist
│   ├── layout.tsx            # Base root layout wrapper
│   └── page.tsx              # Luxury consumer homepage
├── components/               # Reusable UI Components
│   ├── catalog/              # Wine cards, filter bars & detail modals
│   ├── events/               # Experience cards, map drawers & BookingModal
│   ├── home/                 # Hero video banner, Sustainability, Occasions
│   ├── lab/                  # Interactive Wine Quality Lab widgets
│   ├── layout/               # Global Navbar & Newsletter footer
│   └── profile/              # TasteProfileEditor & WinePreferencesWizard
├── constants/                # Configuration & event types
├── context/                  # WishlistContext & User session state
├── lib/                      # Client utilities & recommendation connectors
│   ├── api-config.ts         # REST API URL resolution (Port 5000)
│   ├── recommendations/      # Client-side recommendation connectors
│   └── supabase/             # Supabase client bindings
├── public/                   # Media assets, photography & vector icons
├── package.json
└── tsconfig.json
```

---

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Installation
```bash
npm install
```

### 3. Environment Setup (`.env.local`)
Create a `.env.local` file in the `Vinosphere-good-ui` root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Running the Platform

#### 🌟 1-Command Full Stack Startup (Recommended)
Starts Backend API (Port 5000), Winery Portal (Port 3001), and Consumer App (Port 3002) simultaneously:
```bash
npm run dev:all
```

#### 📌 Starting Individual Services

| Goal | Command | Local URL |
| :--- | :--- | :--- |
| **Entire Platform (All Services)** | `npm run dev:all` | All services below |
| **Consumer Application** | `npm run dev` | `http://localhost:3002` |
| **Winery Management Dashboard** | `npm run dev:winery` | `http://localhost:3001` |
| **Backend Express REST API** | `npm run dev:backend` | `http://localhost:5000` |
| **Food Pairing Recommender** | `npm run dev:pairing` | `http://localhost:5173` |

---

## 🧪 Testing

Run backend unit and integration test suites:
```bash
npm run test:backend
```

---

## 🔗 Platform Integration
* Consumes **Backend API** (`http://localhost:5000`) for 32D vectorized recommendations, ML quality assays, and reservation transactions.
* Reflects live updates published from the **Winery Management Dashboard** (`http://localhost:3001`).
