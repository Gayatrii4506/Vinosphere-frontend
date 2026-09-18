# VinoSphere Analytics Module — Showcase & Demonstration Walkthrough Guide

## Overview & Demo Goal
This document provides a complete step-by-step demonstration walkthrough for showcasing the **VinoSphere Analytics Engine** and **Winery Performance Dashboard**. 

The analytics system enables winery managers to understand customer engagement, evaluate experience and event booking performance, monitor corporate inquiries, track Gross Booking Value (GBV), and receive deterministic, evidence-backed business recommendations.

---

## Controlled Showcase Environment Setup

The showcase uses a dedicated, isolated synthetic demo winery dataset:
* **Demo Winery Name**: `VinoSphere Analytics Demo Winery`
* **Demo Winery ID**: `00000000-0000-4000-d000-000000000999`
* **Demo Winery Slug**: `vinosphere-analytics-demo-winery`

### Quick CLI Commands

#### 1. Seed Demo Dataset
```bash
cd vinosphere-backend
npx ts-node scripts/seed-demo-analytics.ts
```

#### 2. Run Verification Test Suite
```bash
npx jest src/modules/analytics/__tests__/phase12d.demo.test.ts
```

#### 3. Reset / Remove Demo Dataset
```bash
npx ts-node scripts/seed-demo-analytics.ts --reset
```

---

## 10-Step Demonstration Walkthrough

### Step 1: Open Winery Dashboard & Login
1. Navigate to the Winery Dashboard (`http://localhost:3000` or production URL).
2. Select or set active winery ID to the demo winery: `00000000-0000-4000-d000-000000000999`.

### Step 2: Navigate to Analytics Tab
1. Click on **Analytics** in the main navigation sidebar.
2. Observe the instant, smooth loading of real backend metrics fetched from `/api/analytics/business?winery_id=00000000-0000-4000-d000-000000000999&period_days=7`.

### Step 3: Showcase Wine Engagement Analytics
1. Scroll to **Wine Engagement & Behavioral Insight**.
2. **Explain**:
   * **Wine Views**: Total times wines were viewed (e.g. 45+ views).
   * **Wine Saves**: User bookmarking/saving interest (e.g. 1 save).
   * **View-to-Save Rate**: Quantifies visitor intent conversion.
   * **Top Wines List**: Shows individual wine performance (e.g. *Reserve Cabernet Sauvignon 2021* viewed 25 times with 4.0% save rate).

### Step 4: Showcase Business Performance Summary
1. Highlight the 4 top KPI Cards:
   * **Event Bookings**: 12 total bookings (+140.0% vs previous period).
   * **Experience Bookings**: 9 total bookings (+125.0% vs previous period).
   * **Corporate Inquiries**: 4 inquiries.
   * **Gross Booking Value (GBV)**: ₹46,300 (+131.5% vs previous period).
2. **Data Honesty Note**: Point out that the system strictly reports **Gross Booking Value** — representing eligible paid event and experience bookings recorded through VinoSphere — avoiding unsubstantiated claims like "Total Winery Revenue".

### Step 5: Showcase Booking Performance & Capacity Utilization
1. Examine the **Booking Performance** card.
2. **Explain**:
   * **Event Guests**: 41 guests across active published events.
   * **Combined Event Capacity**: 75 max capacity (Event 1: 40, Event 2: 35).
   * **Capacity Utilization**: Computed automatically by backend as `41 / 75 × 100 = 54.67%`.
   * Point out that cancelled, refunded, or pending unpaid bookings are excluded from revenue math, demonstrating strict filtering integrity.

### Step 6: Showcase Corporate Inquiries Breakdown
1. Examine the **Corporate Inquiries & Leads** card.
2. **Explain**:
   * Total Inquiries: 4.
   * **Status Breakdown**: Pending: 1 | Approved: 2 | Rejected: 1.
   * **Average Expected Guests**: `(50 + 35 + 75 + 20) / 4 = 45.0 guests`.
   * **Revenue Integrity**: Approved corporate inquiries represent pipeline potential but do NOT add sales revenue to GBV until paid.

### Step 7: Showcase Current vs. Previous Period Comparison
1. Switch between time horizons using the **7d / 30d / 90d** time filter.
2. Observe how period comparison calculates:
   * **Current Value**: e.g., ₹46,300 GBV.
   * **Previous Value**: e.g., ₹20,000 GBV.
   * **Absolute Change**: +₹26,300.
   * **Percentage Change**: `+131.5%`.
   * **Trend Indicator**: Visual green badge `+131.5%` computed safely without producing `NaN` or `Infinity`.

### Step 8: Showcase Deterministic Insight Detection
1. Scroll to the **Observed Insights** section.
2. **Explain**:
   * The system evaluates data sufficiency (verifying minimum observation thresholds before drawing conclusions).
   * It detects specific patterns naturally (e.g. `RISING_GROSS_BOOKING_VALUE`, `RISING_EVENT_BOOKINGS`, `HIGH_VIEWS_LOW_SAVES`).

### Step 9: Showcase Business Recommendations & Deduplication
1. Scroll to the **Actionable Recommendations** card.
2. **Explain**:
   * Recommendations are deterministically generated from detected insights.
   * Each recommendation includes a clear title, category, rule ID, and LLM-assisted explanation fallback.
   * **Deduplication Safeguard**: Re-running recommendation checks will not spam duplicate cards; existing active recommendations are preserved.

### Step 10: Demonstrate Empty / Insufficient Data Case
1. Change winery selection to an empty winery ID (e.g. `00000000-0000-4000-c000-000000000001`).
2. **Explain**:
   * The dashboard gracefully displays `0` values with `Insufficient Data` indicators.
   * The system deliberately avoids making unsupported or speculative conclusions when evidence is sparse.

---

## Core System Architecture Flow

The entire analytics pipeline operates under a strict, validated data flow:

```
User Behaviour (Views/Saves)
       ↓
Analytics Events & Bookings DB
       ↓
Validated Metric Engine (GBV, Capacity, Period Math)
       ↓
Data Sufficiency Checks
       ↓
Pattern Detection (Insight Engine)
       ↓
Deterministic Recommendation Engine (with LLM Fallback)
       ↓
Winery Dashboard UI
       ↓
Potential Winery Management Action
```

> **Important Distinction**:
> The system architecture guarantees:
> **Observed Metrics → Data-Driven Recommendations**
> 
> The system does NOT claim:
> *Recommendation → Guaranteed Revenue Increase*
> 
> It provides winery operators with evidence-based clarity and actionable direction.
---
## Production Safety & Cleanup

All demonstration data is strictly isolated to winery ID `00000000-0000-4000-d000-000000000999`.

To reset or remove all demo records safely at any time:
```bash
npx ts-node scripts/seed-demo-analytics.ts --reset
```
This cleanup script deletes **ONLY** records belonging to the demo winery ID and never touches production data or other test wineries.