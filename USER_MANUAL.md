# VinoSphere — Comprehensive System User Manual
**Educational Capstone Project / B.Tech Final Year Project (FYP)**  
*An Intelligent Wine Tourism, Cellar Management, and AI Sommelier Ecosystem*

---

## Document Control & Overview

| Field | Details |
| :--- | :--- |
| **Project Title** | **VinoSphere** (Intelligent Wine Tourism & AI Sommelier Ecosystem) |
| **Document Type** | Comprehensive Multi-Stakeholder User Manual & Operational Guide |
| **Target Audience** | Academic Evaluators, Project Reviewers, Consumers, Wineries, and Platform Administrators |
| **System Architecture** | Next.js 15/16 (App Router), Express TypeScript API, FastAPI ML Microservices, Supabase PostgreSQL |
| **AI/ML Models** | Sentence-Transformers (`all-MiniLM-L6-v2`) with FAISS for Semantic Food-Wine Pairing; Scikit-Learn physicochemical Wine Quality Predictor |

---

## Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Tri-Stakeholder Ecosystem Overview](#2-tri-stakeholder-ecosystem-overview)
3. [Section I: Consumer Portal User Manual](#section-i-consumer-portal-user-manual)
   - 1.1 Account Creation & Taste Profiling Onboarding
   - 1.2 Wine Discovery & Sensory Filtering
   - 1.3 AI-Powered Food & Wine Pairing Engine (Sommelier Flow)
   - 1.4 Winery Exploration & Terroir Insights
   - 1.5 Booking Vineyard Experiences & Tasting Events
   - 1.6 Personal Digital Cellar & Wishlist Management
   - 1.7 Community Reviews & Sensory Feedback
4. [Section II: Winery Management Dashboard Manual](#section-ii-winery-management-dashboard-manual)
   - 2.1 Estate Profile & Terroir Narrative Setup
   - 2.2 Wine Catalog & Sensory Profile Management
   - 2.3 Wine Quality Assay Lab (Machine Learning Quality Prediction)
   - 2.4 Tourism Experiences & Tasting Journeys Creation
   - 2.5 Event Scheduling & Ticketing
   - 2.6 Visitor Reservations & On-Site Check-In
   - 2.7 B2B & Corporate Lead Actioning
   - 2.8 Review Monitoring & Brand Engagement
   - 2.9 Winery Business Analytics & Viticulture EDA Layer
   - 2.10 Compliance & Certification Document Vault
5. [Section III: Platform Administrator Dashboard Manual](#section-iii-platform-administrator-dashboard-manual)
   - 3.1 Platform Overview & Real-Time KPI Metrics
   - 3.2 Winery Onboarding & Legal Verification Workflow
   - 3.3 Global Wine Catalog Auditing
   - 3.4 Experience & Event Moderation
   - 3.5 Global Reservation Auditing & Revenue Tracking
   - 3.6 Content Moderation & Community Review Oversight
   - 3.7 User & Role-Based Access Control (RBAC) Management
   - 3.8 Cross-Platform Analytics & Ecosystem Health
6. [Section IV: Quick-Start Demonstration Guide for Evaluators](#section-iv-quick-start-demonstration-guide-for-evaluators)
   - 4.1 Running the Unified Development Environment
   - 4.2 Seed Data & Demo User Credentials
   - 4.3 End-to-End Evaluation Walkthrough Script (Viva Demo Flow)
   - 4.4 System Troubleshooting & FAQs

---

## 1. Executive Summary & System Architecture

**VinoSphere** is an end-to-end digital platform designed to bridge viticulture tourism, consumer education, and estate management. Traditional winery management suffers from fragmented booking workflows, lack of data-driven quality insights, and a steep knowledge curve for everyday wine enthusiasts. VinoSphere solves this through three tailored portals connected to a unified PostgreSQL backend and dual machine-learning services:

```
                                  +---------------------------------------+
                                  |         VinoSphere Ecosystem          |
                                  +---------------------------------------+
                                                     |
         +-------------------------------------------+-------------------------------------------+
         |                                           |                                           |
+-------------------+                       +-------------------+                       +-------------------+
|  Consumer Portal  |                       | Winery Dashboard  |                       |  Admin Dashboard  |
|  (Port: 3000/3002)|                       |    (Port: 3001)   |                       |    (Port: 3003)   |
+-------------------+                       +-------------------+                       +-------------------+
         |                                           |                                           |
         +-------------------------------------------+-------------------------------------------+
                                                     |
                                   +----------------------------------+
                                   | Express REST API (Node/TS :5000) |
                                   +----------------------------------+
                                     /                              \
                                    /                                \
            +-------------------------------+          +-------------------------------+
            |  FastAPI AI Microservice     |          |  Supabase PostgreSQL Database  |
            |  - Food-Wine Pairing (FAISS)  |          |  - Row-Level Security (RLS)    |
            |  - Quality Prediction Lab     |          |  - Real-time Subscriptions     |
            +-------------------------------+          +-------------------------------+
```

---

## 2. Tri-Stakeholder Ecosystem Overview

| Feature / Capability | Consumer Perspective | Winery Perspective | Admin Perspective |
| :--- | :---: | :---: | :---: |
| **Primary Goal** | Discover, learn, pair food & wine, book tours | Showcase estate, optimize yields, manage guests | Ensure platform integrity, safety & compliance |
| **Wine Catalog** | Browse, filter, search, save to cellar | Add, update, set sensory traits, track stock | Audit catalog, moderate varietal claims |
| **AI Food Pairing** | Select dish, get sommelier pairings & scores | View pairing tags matching estate wines | Monitor recommendation latency & logs |
| **Quality Lab** | Consume certified quality badges & ratings | Input physicochemical data & run ML prediction | Oversee quality distribution across regions |
| **Experiences & Tours** | Browse packages, book slots, receive confirmation | Create tasting flights, set slots, check in visitors | Audit booking volumes & revenue share |
| **Events** | RSVP, book event tickets, receive calendar reminders | Create harvest festivals, manage capacities | Oversee event safety guidelines & approvals |
| **Reviews & Feedback** | Post star ratings, write tasting impressions | Respond directly to consumer feedback | Moderate inappropriate or fraudulent reviews |
| **Account & Security** | Manage personal profile & taste preferences | Update estate profile, upload legal licenses | Manage user roles, approve/reject winery KYC |

---

## Section I: Consumer Portal User Manual

The **Consumer Portal** is designed for wine enthusiasts, novices, and tourists looking to explore wines, understand tasting notes, discover estate journeys, and pair dishes intelligently.

### 1.1 Account Creation & Taste Profiling Onboarding
1. **Accessing the Portal**: Open `http://localhost:3000` (or `http://localhost:3002`).
2. **Registration / Login**: Click **Sign In** on the top navigation bar. Enter your email and password, or proceed via OAuth.
3. **Taste Profiling Questionnaire**:
   - Upon first sign-in, new consumers are prompted with the **Onboarding Quiz**.
   - **Select Knowledge Level**: Choose between *Beginner*, *Intermediate*, or *Connoisseur*.
   - **Select Preferred Wine Styles**: Check preferred wine categories (e.g., *Crisp Whites*, *Full-Bodied Reds*, *Sparkling*, *Rosé*, *Dessert*).
   - **Primary Interest**: Indicate your main interest (e.g., *Vineyard Tours*, *Food & Wine Pairing*, *Cellar Collecting*).
   - Click **Save Preferences**. The recommendation algorithm tailors all future recommendations to this profile.

### 1.2 Wine Discovery & Sensory Filtering
1. **Navigate to Discover**: Click **Discover > Wine Catalog** in the top navigation (`/discover/wines`).
2. **Search & Keywords**: Enter winery names, grape varietals (e.g., *Cabernet Sauvignon*, *Chenin Blanc*, *Shiraz*), or regions into the search bar.
3. **Multi-Parameter Sensory Filtering**:
   - **Wine Type**: Toggle Red, White, Rosé, or Sparkling.
   - **Body**: Filter from Light, Medium, to Full-bodied.
   - **Sweetness**: Adjust from Bone-Dry to Sweet.
   - **Acidity & Tannin**: Use interactive chips to match your palate.
   - **Price Range**: Slide minimum and maximum budget caps.
4. **Wine Detail View**: Click on any wine card to view its technical card:
   - Alcohol by Volume (ABV %), Vintage Year, Region & Terroir.
   - Detailed Sommelier Tasting Notes (Aromas, Palate, Finish).
   - Suggested Serving Temperature & Recommended Glassware.

### 1.3 AI-Powered Food & Wine Pairing Engine (Sommelier Flow)
1. **Open Food Pairing**: Click **Food Pairing** in the main navigation (`/food-pairing`).
2. **Step 1: Choose Food Category**: Select a culinary category (e.g., *Indian Curries*, *Grilled Poultry*, *Seafood*, *Pastas*, *Desserts*).
3. **Step 2: Choose Dish**: Select a specific dish (e.g., *Butter Chicken*, *Goan Fish Curry*, *Paneer Tikka*, *Truffle Risotto*).
4. **Step 3: Generate Pairings**: Click **Find Perfect Pairings**.
5. **Evaluating the AI Recommendations**:
   - The system queries the Sentence-Transformer semantic embedding service and calculates cosine similarity.
   - The screen renders the **Top 5 Matching Wines**, ranked with a **Compatibility Score (%)**.
   - Read the **Sommelier Logic Rationale** explaining *why* the pairing succeeds (e.g., *"The high acidity of Chenin Blanc cuts through the creamy richness of the tomato gravy"*).
6. **Direct Action**: Click **View Wine Details** or **Save to Cellar** directly from the pairing card.

### 1.4 Winery Exploration & Terroir Insights
1. **Navigate to Wineries**: Click **Discover > Wineries** (`/wineries`).
2. **Browse Estates**: View curated vineyard cards showcasing estate imagery, location (e.g., *Nashik Valley, Maharashtra*), and signature grape varietals.
3. **Inspect Winery Page (`/wineries/[id]`)**:
   - **Estate Narrative**: Read the founding story, philosophy, and microclimate characteristics.
   - **Available Tours & Masterclasses**: View open experiences with transparent pricing.
   - **Featured Wine Flights**: Inspect wines poured exclusively at the vineyard cellar door.
   - **Contact & Visiting Hours**: Check operational days, open hours, and map coordinates.

### 1.5 Booking Vineyard Experiences & Tasting Events
1. **Selecting an Experience**: From any winery page or the **Events & Tastings** page (`/events`), choose an experience (e.g., *Sunset Vineyard Tour & 5-Wine Flight*).
2. **Select Date & Time Slot**: Use the interactive calendar to pick your visit date and preferred tasting session.
3. **Guest Count**: Specify the number of attendees (Adults / Designated Drivers).
4. **Checkout & Confirmation**:
   - Review booking summary, cancellation terms, and total fees.
   - Click **Confirm Reservation**.
   - An instant digital booking pass with a unique **Booking Reference ID** is generated and saved under your Profile.

### 1.6 Personal Digital Cellar & Wishlist Management
1. **Accessing Your Cellar**: Click the **Bookmark / Heart** icon in the navbar (`/cellar`).
2. **Organize Wines**:
   - **Wishlist**: Wines you desire to taste or purchase during your next winery trip.
   - **Tasted & Rated**: Wines you have experienced, accompanied by your personal rating (1-5 stars) and private tasting notes.
3. **Quick Export / Sharing**: Share your cellar selections with travel companions or sommelier guides.

### 1.7 Community Reviews & Sensory Feedback
1. Navigate to any visited wine or estate.
2. Scroll to the **Reviews & Ratings** section.
3. Click **Write a Review**:
   - Assign a star rating (1 to 5).
   - Enter your headline and detailed feedback regarding palate, service, or atmosphere.
   - Click **Submit Review**. The review is posted following administrative automated moderation.

---

## Section II: Winery Management Dashboard Manual

The **Winery Management Dashboard** (`http://localhost:3001`) serves winemakers, estate managers, and hospitality directors. It provides tools for viticulture cataloging, AI laboratory assays, visitor operations, and business intelligence.

### 2.1 Estate Profile & Terroir Narrative Setup
1. **Navigation**: From the dashboard sidebar, select **My Winery**.
2. **Brand & Identity**:
   - Update **Estate Name**, **Slug**, and **Tagline**.
   - Upload high-resolution **Cover Hero Banner** and **Winery Logo**.
3. **Terroir & Viticulture Narrative**:
   - Enter **Soil Composition** (e.g., *Volcanic clay with decomposed gravel*).
   - Enter **Elevation**, **Annual Rainfall**, and **Microclimate Description**.
4. **Location & Logistics**:
   - Set physical address, latitude/longitude pin, visiting hours, and primary contact email/phone for visitor enquiries.
5. Click **Save Narrative Changes**.

### 2.2 Wine Catalog & Sensory Profile Management
1. **Navigation**: Click **Wine Catalog** on the sidebar.
2. **Adding a New Wine**:
   - Click **+ Add Wine** in the top action header.
   - **Basic Metadata**: Enter Wine Name, Vintage Year, Wine Type (Red, White, Rosé, Sparkling), and Varietal Blend (e.g., *85% Cabernet Sauvignon, 15% Merlot*).
   - **Commercial Details**: Set Volume (ml), Alcohol Content (ABV %), Retail/Tasting Room Price, and Current Stock Inventory.
   - **Sensory Character Matrix**: Configure qualitative sliders for:
     - *Body* (Light, Medium, Full)
     - *Sweetness* (Bone-Dry, Dry, Off-Dry, Semi-Sweet, Sweet)
     - *Acidity* (Low, Medium, High)
     - *Tannin* (Low, Supple, Firm, Grippy)
   - **Tasting Notes**: Provide detailed descriptors for Nose (aromas), Palate, and Recommended Food Pairings.
   - **Bottle Imagery**: Upload transparent PNG bottle photography.
   - Click **Publish Wine to Catalog**.
3. **Editing / Retiring Wines**: Use the **Edit (Pencil)** icon to update vintage stock or the **Trash** icon to archive out-of-stock vintages.

### 2.3 Wine Quality Assay Lab (Machine Learning Quality Prediction)
1. **Navigation**: Select **Quality Lab** from the sidebar.
2. **Purpose**: Enables estate enologists to simulate and validate wine quality before bottling based on laboratory chemistry and harvest parameters.
3. **Entering Physicochemical Metrics**:
   - **Fixed Acidity & Volatile Acidity (g/dm³)**: Measures tartaric vs. acetic acid levels.
   - **Citric Acid & Residual Sugar (g/dm³)**: Defines freshness and sweetness balance.
   - **Chlorides & Free / Total Sulfur Dioxide ($SO_2$)**: Tracks preservation and sanitation standards.
   - **Density ($g/cm^3$) & pH Level**: Validates fermentation completion and microbial stability.
   - **Sulphates & Alcohol by Volume (ABV %)**: Critical drivers for mouthfeel and preservation.
4. **Running the Assay**:
   - Click **Run Quality Assay Prediction**.
   - The ML inference engine processes the chemical vector through trained regression and classification models.
5. **Interpreting Results**:
   - **Predicted Quality Score**: Displays a rating out of 10 (e.g., *8.4 / 10 - Premium Reserve Grade*).
   - **Sensory Balance Diagnostics**: Identifies deviations (e.g., *"Elevated Volatile Acidity detected - risk of vinegar notes"*).
   - **Actionable Enology Recommendation**: Provides correction advice (e.g., *"Adjust tartaric acid addition prior to malolactic fermentation"*).

### 2.4 Tourism Experiences & Tasting Journeys Creation
1. **Navigation**: Click **Experiences** from the sidebar.
2. **Creating an Experience**:
   - Click **+ Add Experience**.
   - Enter **Experience Title** (e.g., *Winemaker's Reserve Barrel Tasting*).
   - Select **Category** (*Guided Vineyard Tour*, *Cellar Masterclass*, *Wine & Cheese Pairing*).
   - Set **Duration** (e.g., *90 Minutes*) and **Price per Person** (₹).
   - Specify **Maximum Capacity per Slot** (e.g., *15 guests*).
   - Attach **Featured Wine Flight**: Pick which cataloged wines are served during the tour.
   - Upload high-resolution promotional imagery.
   - Click **Save & Activate Experience**.

### 2.5 Event Management
1. **Navigation**: Select **Events** from the sidebar.
2. **Scheduling Winery Events**:
   - Click **+ New Event**.
   - Specify Event Name (e.g., *Annual Grape Stomping Harvest Fest*), Start Date, End Date, and Venue area.
   - Set ticket tiers, total capacity, and entry fees.
   - Publish event; it immediately populates the consumer-facing discovery feed.

### 2.6 Visitor Reservations & On-Site Check-In
1. **Navigation**: Select **Bookings** from the sidebar.
2. **Managing Guest Pipeline**:
   - View scheduled reservations sorted by date, visitor name, and experience.
   - Status indicators: `Confirmed`, `Checked-In`, `Completed`, `Cancelled`.
3. **On-Site Guest Arrival**:
   - When guests arrive at the estate cellar door, verify their Booking ID.
   - Click **Check-In Guest**. The booking status updates in real-time, logging the arrival timestamp in the backend.

### 2.7 B2B & Corporate Lead Actioning
1. **Navigation**: Select **Corporate Leads** from the sidebar.
2. **Review Inquiries**: View inbound requests from corporate groups, private weddings, or institutional buyers requesting private estate buyouts.
3. **Actioning Leads**:
   - View requested dates, estimated headcount, and budget notes.
   - Mark status as `New`, `In Negotiation`, `Approved`, or `Declined`.

### 2.8 Review Monitoring & Brand Engagement
1. **Navigation**: Select **Reviews & Ratings** from the sidebar.
2. **Analyzing Visitor Sentiment**: View average star ratings and latest customer feedback.
3. **Replying to Reviews**: Click **Reply**, compose an official winery response thanking the guest or addressing concerns, and click **Publish Response**.

### 2.9 Winery Business Analytics & Viticulture EDA Layer
1. **Navigation**: Select **Analytics** or **EDA Layer**.
2. **Key Metrics Tracked**:
   - Total Gross Booking Revenue (Monthly / Annual).
   - Footfall Trends: Visitor counts segmented by weekdays vs. weekends.
   - Top-Performing Tasting Flights & Most Wishlisted Wines.
   - Customer Origin Demographics (e.g., Mumbai, Pune, Bangalore).
3. **EDA Viticulture Analysis**: Visualizations comparing grape harvest metrics, yield efficiency, and correlation between alcohol content and customer rating.

### 2.10 Compliance & Certification Document Vault
1. **Navigation**: Click **Documents** from the sidebar.
2. **Upload Legal Credentials**: Upload PDF scans of FSSAI Food Safety Licenses, State Excise Winery Permits, and Organic Agriculture Certifications.
3. Documents uploaded here are submitted to the Platform Admin for verification.

---

## Section III: Platform Administrator Dashboard Manual

The **Platform Administrator Dashboard** (`http://localhost:3003`) is restricted to super-administrators and academic project evaluators to oversee regulatory compliance, system health, user management, and catalog integrity.

### 3.1 Platform Overview & Real-Time KPI Metrics
1. **Navigation**: Access the root dashboard overview (`/`).
2. **Global Real-Time KPI Cards**:
   - **Total Registered Users**: Overall consumer accounts.
   - **Active Wineries & Vineyards**: Approved, operating estates.
   - **Total Cataloged Wines**: Live commercial and reserve wine records.
   - **Total Bookings & Reservations**: Completed and upcoming tourist visits.
   - **Pending Winery Approvals**: Count of onboarded wineries awaiting inspection.
   - **Global Platform GMV / Revenue**: Cumulative transaction value.
3. **Live Activity Feed**: Real-time websocket stream capturing new consumer sign-ups, ticket purchases, and estate submissions.

### 3.2 Winery Onboarding & Legal Verification Workflow
1. **Navigation**: Select **Approvals** from the top/sidebar navigation (`/approvals`).
2. **Reviewing Applications**:
   - Estates that complete onboarding default to `Draft` or `Pending` status.
   - Click on any pending winery application to inspect their submission package:
     - Corporate Entity Details and Physical Location.
     - Terroir Claims and Vineyard Acreage.
     - Uploaded Excise and Health Safety Licensing Documents.
3. **Approval Decision**:
   - **Approve**: Click **Approve Winery**. The estate is granted active platform status, published to the consumer portal, and allowed to accept bookings.
   - **Request Revisions**: Send feedback requesting clearer documentation.
   - **Reject**: Decline applications that fail licensing or authenticity checks.

### 3.3 Global Wine Catalog Auditing
1. **Navigation**: Select **Wines** (`/wines`).
2. **Platform-Wide Catalog Oversight**:
   - Filter wines across all registered wineries.
   - Inspect varietal claims, vintage validity, and ABV compliance.
   - Edit or delist any wine violating platform standards with one click.

### 3.4 Experience & Event Moderation
1. **Navigation**: Select **Experiences** (`/experiences`) or **Events** (`/events`).
2. **Auditing Tourist Offerings**:
   - Inspect pricing integrity, duration, and safety disclosures.
   - Moderate or unpublish any event that breaches capacity or alcohol service guidelines.

### 3.5 Global Reservation Auditing & Revenue Tracking
1. **Navigation**: Select **Bookings** (`/bookings`).
2. **Transaction Monitoring**:
   - Audit all reservation transactions, fee breakdowns, and refund/cancellation requests.
   - Track platform commission metrics and estate payout balances.

### 3.6 Content Moderation & Community Review Oversight
1. **Navigation**: Select **Reviews** (`/reviews`).
2. **Managing Moderation Queue**:
   - View all consumer ratings and comments across wines and wineries.
   - Use automated filters to detect profanity, harassment, or spam.
   - Click **Delete Review** to excise fraudulent or non-compliant comments.

### 3.7 User & Role-Based Access Control (RBAC) Management
1. **Navigation**: Select **Users** (`/users`).
2. **Role Hierarchy**:
   - `user`: Standard consumer with cellar, booking, and review privileges.
   - `winery_admin`: Restricted to their affiliated `winery_id` estate management.
   - `platform_admin`: Super-admin with platform-wide read/write/moderation privileges.
3. **User Operations**:
   - Search users by name or email.
   - Upgrade/downgrade roles (e.g., promote an estate manager to `winery_admin`).
   - Temporarily suspend or deactivate accounts.

### 3.8 Cross-Platform Analytics & Ecosystem Health
1. **Navigation**: Select **Analytics** (`/analytics`).
2. **System Health & Viticulture Insights**:
   - User growth and platform engagement rate over time.
   - Regional distribution of wine tourism demand.
   - AI Food Pairing API latency and query volume analytics.

---

## Section IV: Quick-Start Demonstration Guide for Evaluators

This section is prepared for **academic supervisors, external examiners, and presentation juries** to run and evaluate the complete project locally.

### 4.1 Running the Unified Development Environment

From the root project directory (`good ui`), launch all services concurrently using the built-in orchestration script:

```bash
# 1. Install root dependencies (if not already installed)
npm install

# 2. Launch all 5 micro-services simultaneously:
npm run dev:all
```

#### Services Started by `npm run dev:all`:

| Service Identifier | Technology | URL / Local Port | Description |
| :--- | :--- | :--- | :--- |
| **BACKEND** | Express / Node.js | `http://localhost:5000` | Core REST API & Business Logic |
| **FOOD-API** | FastAPI / Python | `http://localhost:8000` | AI Semantic Pairing Microservice (Docs: `/docs`) |
| **CONSUMER** | Next.js App Router | `http://localhost:3000` | Consumer Exploration & Booking Portal |
| **WINERY** | Next.js App Router | `http://localhost:3001` | Winery Management & Quality Lab Dashboard |
| **ADMIN** | Next.js App Router | `http://localhost:3003` | Platform Super-Admin Governance Portal |

> *Note: If individual dashboards are run independently, use `npm run dev:consumer`, `npm run dev:winery`, `npm run dev:admin`, `npm run dev:backend`, and `npm run dev:food-api`.*

### 4.2 Seed Data & Demo User Credentials

The database contains pre-configured demonstration accounts seeded via `demo_data_seed.sql`:

| Role | Demo Email | Password | Persona & Scope |
| :--- | :--- | :--- | :--- |
| **Winery Admin** | `estate@godavarihills.in` | `DemoPass123!` | Rajesh Godavari (Estate Manager at Godavari Hills Estate) |
| **Consumer (Advanced)** | `ananya.sharma@demo.vinosphere.in` | `DemoPass123!` | Ananya Sharma (Mumbai – Food Pairing & Tasting enthusiast) |
| **Consumer (Connoisseur)**| `vikram.singhania@demo.vinosphere.in`| `DemoPass123!` | Vikram Singhania (Pune – Collector & Red Wine enthusiast) |
| **Platform Super Admin** | `admin@vinosphere.in` | `AdminSecurePass123!`| Super Administrator (Full platform access) |

---

### 4.3 End-to-End Evaluation Walkthrough Script (Viva Demo Flow)

During project evaluation or viva examinations, perform this seamless 5-step walkthrough to demonstrate all three perspectives:

```
[Step 1: Winery Perspective] 
  Estate Manager logs in -> Adds new Reserve Wine -> Runs ML Quality Assay -> Schedules Vineyard Tasting Tour
      |
      v
[Step 2: Admin Perspective]
  Super Admin opens Admin Dashboard -> Audits newly submitted winery/wine -> Approves onboarding & sets live
      |
      v
[Step 3: Consumer Perspective]
  Consumer browses Wine Catalog -> Uses AI Food-to-Wine Sommelier (e.g. Butter Chicken) -> Inspects Pairing Score
      |
      v
[Step 4: Booking & Check-In Lifecycle]
  Consumer books the Vineyard Tasting Tour -> Winery Dashboard receives booking in real-time -> Checks in guest
      |
      v
[Step 5: Analytics & Governance]
  Winery views updated revenue & footfall -> Admin verifies platform KPIs & review moderation
```

#### Step-by-Step Viva Execution:
1. **Act I (Winery)**: Open `http://localhost:3001`. Login as `estate@godavarihills.in`.
   - Open **Quality Lab**. Input chemical parameters (Acidity: 7.2, pH: 3.4, Alcohol: 13.5%, Sulphates: 0.65).
   - Click **Run Quality Assay Prediction**. Observe predicted score (e.g., 8.2 / 10).
   - Go to **Wine Catalog** and confirm the wine is cataloged.
2. **Act II (Admin)**: Open `http://localhost:3003`.
   - View real-time KPI overview showing current counts of wineries, wines, and reservations.
   - Open **Approvals** to inspect verified estate status.
3. **Act III (Consumer)**: Open `http://localhost:3000`.
   - Navigate to **Food Pairing** (`/food-pairing`). Select *Indian Curries* -> *Butter Chicken*.
   - Click **Find Perfect Pairings**. Observe the top 5 wines recommended by the FAISS semantic engine with sommelier rationale.
   - Navigate to **Wineries** -> Select an estate -> Click **Book Tour**. Complete a sample reservation.
4. **Act IV (Closing the Loop)**: Return to Winery Dashboard (`http://localhost:3001`) -> **Bookings**. Observe the new reservation and click **Check-In Guest**.

---

### 4.4 System Troubleshooting & FAQs

- **Q: Port 3000 is occupied by another process.**  
  *Next.js will automatically prompt or assign the next available port (e.g. 3002). Check terminal output for exact assigned ports.*
- **Q: The AI Food Pairing returns a network error.**  
  *Ensure the Python virtual environment is activated and the FastAPI server is running on port 8000 (`uvicorn api.main:app --reload --port 8000`). Verify dependencies with `pip install -r backend/ml-services/food-recommendation/requirements.txt`.*
- **Q: How are database credentials configured?**  
  *The system uses Supabase PostgreSQL. Check `.env.local` files in `backend/api`, `frontend/consumer`, `frontend/winery-dashboard`, and `frontend/admin-dashboard` for matching `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.*

---

*Authored for the VinoSphere Final Year Capstone Project Defense & Evaluation.*  
*All Rights Reserved © 2026 VinoSphere Team.*
