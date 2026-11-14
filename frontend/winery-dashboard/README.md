# 🍇 VinoSphere Winery Dashboard (`winery_dashboard`)

The **VinoSphere Winery Dashboard** is an enterprise Next.js portal designed for vineyard managers, winemakers, and hospitality teams to oversee estate inventory, perform AI-assisted laboratory quality assays, monitor real-time visitor bookings, and receive automated business intelligence recommendations.

---

## 🚀 Key Features & Capabilities

### 1. 🧪 Interactive Wine Quality Assay Lab
* **Real-time Physicochemical Assay Simulator**: Interactive laboratory sliders for 11 finished wine assays and 8 pre-fermentation grape must parameters.
* **Instant ML Quality Certification**: Real-time batch quality classification (Standard Commercial vs. Premium Grand Reserve) with **84.87% Ensemble Accuracy**.
* **Chemical Balance Index & 4-Point Risk Monitor**: Live gauge tracking Vinegar Spoilage (Volatile Acidity), Premature Oxidation (Free $\text{SO}_2$), Microbial Instability (pH), and Low Ethanol Body Deficits.
* **Cellar Remediation Plans**: Instant actionable advice (e.g. KMBS additions in mg/L, tartaric acidification in g/L, reverse osmosis filtration).

### 2. 📊 Automated Winery Business Intelligence & Analytics
* **Operational KPI Dashboard**: Live tracking of gross booking value (GBV), visitor headcounts, active tasting reservations, and review ratings.
* **Data-Sufficiency-Gated Insights**: Automatically generates actionable advice when significant traffic trends ($\pm 25\% - 30\%$) are detected while filtering out small-sample statistical noise.
* **Executive PDF Report Export**: One-click generation of branded monthly commercial audit reports.

### 3. 🍷 Wine Inventory & Catalog Management
* **Flexible Bottle Publishing**: Full CRUD control with dynamic wine category dropdowns supporting custom `"Other"` manual category entries.
* **Batch Editing**: Modify pricing, tasting notes, grape varietals, and food pairing tags in real-time.

### 4. 🎟️ Segregated Experience & Event Creation Modals
* **Events Modal**: Date range scheduling, capacity limits, and structured hourly itineraries.
* **Experiences Modal**: Vineyard tour details, host bios, and featured tasting vintages.

---

## 📁 Directory Structure

```text
winery_dashboard/
├── app/                  # Next.js App Router
│   ├── favicon.ico
│   ├── globals.css       # Design tokens, typography & CSS variables
│   ├── layout.tsx        # Base root layout wrapper
│   └── page.tsx          # Main Winery Portal workspace & tab switcher
├── components/           # Modular UI Components
│   ├── analytics/        # Business Intelligence graphs, insights & KPI cards
│   ├── events/           # Event creation modals & management cards
│   ├── experiences/      # Vineyard tour creation modals & management cards
│   ├── home/             # Sustainability, occasion explorer & preview sections
│   ├── layout/           # Navigation bar & theme switchers
│   ├── wineries/         # Estate summary blocks & cellar settings
│   └── wines/            # Wine inventory, bottle addition & WineQualityAssayLab
├── lib/                  # Shared utilities
│   ├── api.ts            # REST API communication client (Port 5000)
│   ├── context/          # RoleContext & active session state
│   ├── mock-data/        # Development mock datasets
│   ├── supabaseClient.ts # Supabase DB client bindings
│   └── utils.ts          # Styling merge helpers
├── public/               # Static vectors & iconography
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
Create a `.env.local` file in the `winery_dashboard` root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Running the Dashboard
```bash
npm run dev
```
The application will start listening on **`http://localhost:3001`**.

---

## 🔗 Platform Integration
* Connects to **Backend API** on **`http://localhost:5000`** for laboratory quality assays, ML inference, and analytics insight streams.
* Changes published here reflect immediately in the public **Consumer Discovery Platform** on **`http://localhost:3002`**.
