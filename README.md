# VinoSphere Consumer Discovery Platform (`Vinosphere-good-ui`)

VinoSphere Consumer Discovery Platform is a premium Next.js client application designed for wine enthusiasts to browse partner wineries, discover curated winery experiences, explore upcoming special events, and purchase bookings.

---

## 🚀 Key Features

* **Winery Catalog Browser**: Browse comprehensive partner winery feeds, filtered by location, type, or region.
* **Curated Experiences & Events**: Special badges, localized dates, and structured itinerary timelines (for events) or featured vintages (for wine tastings).
* **Secure Reservation System**: An interactive details-drawer and booking modal that pulls guest counts, aggregates totals, resolves winery ownership, and completes mock checkout.
* **Authentication Integration**: Plugs directly into Supabase authentication to protect user booking sessions.
* **Transaction Feedback**: Visual checkout loader and instant confirmation ticket code displays.

---

## 📁 Folder Structure

```
Vinosphere-good-ui/
├── app/                  # Next.js App Router Pages
│   ├── events/           # Experiences & events discovery landing page
│   ├── layout.tsx        # Base root layout wrapper
│   └── page.tsx          # Consumer homepage
├── components/           # Reusable Client/Server UI Components
│   ├── events/           # BookingModal.tsx and detail card components
│   ├── home/             # Homepage sections (Hero, sustainability, favorites)
│   └── layout/           # Shared navigation bar and footer components
├── constants/            # Client configuration parameters and type interfaces
│   └── events.ts         # VinoSphereExperience definition
├── lib/                  # Shared utility methods & client state helpers
│   ├── supabase/         # Client-side Supabase initializer
│   └── utils.ts          # Stylesheet merge helpers (cn)
├── public/               # Asset folders (logos, SVG icons, images)
├── package.json          # Project dependencies and script controls
└── tsconfig.json         # TypeScript compiler configurations
```

---

## 🛠️ Getting Started

### 1. Prerequisites
Ensure you have **Node.js (v18+)** installed.

### 2. Installation
Run the following command in the project root:
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root folder and configure:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Running the Platform

You can run the entire platform with **a single command** or run individual modules separately from the root directory:

#### 🌟 1-Command Full Stack Startup (Recommended)
Starts Backend API, Winery Dashboard, and Consumer Application simultaneously:
```bash
npm run dev:all
```

#### 📌 Run Individual Modules (From Root Directory)

| Goal | Command | Local URL |
| :--- | :--- | :--- |
| **Entire Platform (All Services)** | `npm run dev:all` | All services below |
| **Winery Management Dashboard** | `npm run dev:winery` | `http://localhost:3001` |
| **Backend Express API** | `npm run dev:backend` | `http://localhost:5000` |
| **Consumer Application** | `npm run dev` | `http://localhost:3002` |
| **Wine Pairing Recommender** | `npm run dev:pairing` | `http://localhost:5173` |

#### 🧪 Running Backend Analytics Unit & Integration Tests

From **root directory**:
```bash
npm run test:backend
```

Or from inside `vinosphere-backend` folder:
```bash
cd vinosphere-backend
npm test
```
*Runs all analytics backend test suites across 7 test modules with `--runInBand` and `--forceExit`.*

---

## 🌐 Overall Project Architecture

VinoSphere is structured as a unified ecosystem:

```
VinoSphere/ (Project Root)
├── vinosphere-backend/                 # Express REST API Backend [Port 5000]
├── winery_dashboard/                   # Winery Manager Portal [Port 3001]
├── Food_Recom/food_pairing_frontend/   # Food & Wine Pairing Recommender [Port 5173]
└── (Root app)                          # Consumer Discovery & Booking App [Port 3002]
```

### ⚡ Service Matrix

| Service | Directory | Tech Stack | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `vinosphere-backend` | Node.js, Express, TypeScript, Supabase | `5000` | REST API endpoints, analytics engine, security auth middlewares & DB triggers. |
| **Winery Portal** | `winery_dashboard` | Next.js (App Router), TypeScript, Tailwind CSS | `3001` | Business intelligence dashboard for wineries to track KPIs, view automated recommendations & manage events. |
| **Consumer App** | Root directory | Next.js (App Router), TypeScript, Vanilla CSS | `3002` | Public web app for wine enthusiasts to browse wineries, discover wines & book experiences. |
| **Wine Pairing Engine** | `Food_Recom/food_pairing_frontend` | React, Vite, Tailwind CSS | `5173` | Interactive food and wine pairing recommendation interface. |

---

## 🏃 Quick Command Reference (Run from Root Directory)

```bash
# 1. Start everything together (Backend + Winery + Consumer App)
npm run dev:all

# 2. Start Winery Manager Portal only
npm run dev:winery

# 3. Start Backend API only
npm run dev:backend

# 4. Start Consumer App only
npm run dev

# 5. Run Backend Unit & Integration Tests
npm run test:backend
```

> ⚠️ **Note for Windows PowerShell Users**: In Windows PowerShell (5.1), chained commands with `&&` are not supported. Always run commands directly from the root project directory `good ui`, or execute `cd vinosphere-backend; npm test` using a semicolon `;`.

---

## 🛠️ Troubleshooting Common Errors

* **Error `EADDRINUSE: address already in use :::3001` or `:::5000`**:
  This happens if `npm run dev:all` or another dev server is already running in another terminal window or in the background. Close the other running server process or terminate active Node tasks in Task Manager before restarting.

* **Error `ReferenceError: authRoutes is not defined`**:
  This bug in `vinosphere-backend/src/routes/index.ts` has been fixed. Re-run `npm run dev:backend` or `npm run dev:all`.
