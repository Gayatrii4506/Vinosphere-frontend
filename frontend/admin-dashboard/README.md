# Vinosphere Admin Dashboard

A modern administrative dashboard for managing wineries, wines, bookings, experiences, events, users, reviews, and pending winery approvals. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide icons, Recharts, and Supabase.

---

## Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18 or later) installed.

### 2. Navigate to Directory
From the root repository directory:
```bash
cd admin_dashboard
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env.local` file in the `admin_dashboard` directory:
```bash
cp .env.example .env.local
```
Or manually create `.env.local` with your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # optional: needed for admin user actions
```

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or whichever port Next.js starts on if port 3000 is occupied).

---

## Production Build & Verification

To verify or run a production build:
```bash
npm run build
npm run start
```

---

## Available Pages & Features
- **Overview (`/`)**: Real-time KPI cards (Users, Wineries, Wines, Events, Bookings, Revenue), activity feeds, and charts.
- **Wineries (`/wineries`)**: List of registered wineries, approval status, search & filters.
- **Approvals (`/approvals`)**: Review and approve/reject pending winery onboarding requests.
- **Wines (`/wines`)**: Wine catalog management across wineries.
- **Experiences (`/experiences`)**: Wine tasting tours and visitor experiences.
- **Bookings (`/bookings`)**: Reservation management and status tracking.
- **Events (`/events`)**: Scheduled winery events and attendance tracking.
- **Reviews (`/reviews`)**: Moderation for user ratings and reviews.
- **Users (`/users`)**: User accounts, roles, and status management.
