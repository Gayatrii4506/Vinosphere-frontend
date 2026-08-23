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

### 4. Running Locally
Launch the Next.js development server:
```bash
npm run dev
```
The application will listen on **`http://localhost:3002`**.


---

## 🌐 Overall Project Architecture & Run Guide

VinoSphere is structured as a multi-repository ecosystem composed of three independent applications:

```
VinoSphere/ (Project Root)
├── vinosphere-backend/     # Express REST API Backend [Port 5000]
├── winery_dashboard/       # Winery Manager Portal [Port 3001]
└── Vinosphere-good-ui/     # Consumer Discovery & Booking App [Port 3002]
```

### ⚡ Port & Technology Matrix

| Service | Directory | Tech Stack | Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Backend API** | `vinosphere-backend` | Node.js, Express, TypeScript, Supabase, Nodemailer | `5000` | REST API endpoints, security auth middlewares, DB triggers & email generation. |
| **Winery Portal** | `winery_dashboard` | Next.js (App Router), TypeScript, Tailwind CSS | `3001` | Management dashboard for wineries to post offerings & monitor reservations. |
| **Consumer App** | `Vinosphere-good-ui` | Next.js (App Router), TypeScript, Vanilla CSS | `3002` | Public booking web portal for wine lovers to buy tickets & view offerings. |

### 🏃 How to Run the Entire Ecosystem Concurrently

To start the entire platform, open three terminal windows and run the setup/start commands in each corresponding directory:

#### Terminal 1: Backend API
```bash
cd vinosphere-backend
npm run dev
```

#### Terminal 2: Winery Dashboard
```bash
cd winery_dashboard
npm run dev
```

#### Terminal 3: Consumer Discovery Platform
```bash
cd Vinosphere-good-ui
npm run dev
```

Once running:
* Browse catalog & book tickets: **`http://localhost:3002`**
* Review reservations & add offerings: **`http://localhost:3001`**
* Backend API endpoints: **`http://localhost:5000`**
