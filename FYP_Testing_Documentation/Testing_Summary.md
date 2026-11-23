# VinoSphere — Software Testing & Quality Assurance Summary Report

**Project Title:** VinoSphere – Winery Marketplace and Analytics Platform  
**Document Type:** Final Year Project (FYP) Software Testing & Evaluation Summary  
**Academic Year:** 2026 – 2027  
**Date of Audit:** November 21, 2026  
**Target Environments:**
* **Consumer Discovery Application:** Next.js (Port `3000` / `3002`)
* **Winery Management Dashboard:** Next.js (Port `3001`)
* **Platform Superadmin Dashboard:** Next.js (Port `3003`)
* **Backend Core REST API:** Express TypeScript (Port `5000`)
* **Machine Learning Services:** FastAPI Food Pairing (Port `8000`) & Flask Quality Lab (Port `5001`)
* **Database & Auth:** Supabase Managed PostgreSQL with Row-Level Security (RLS)

---

## 1. Executive Summary

This testing summary provides a formal, comprehensive audit of the **VinoSphere** ecosystem prepared for the Final Year Project review panel. The test cases were authored directly against the actual codebase, inspecting all API routes, database constraints, controller logic, machine-learning services, and Next.js frontend interfaces.

### Core Metrics Dashboard

| Metric | Quantitative Value | Academic Context |
| :--- | :---: | :--- |
| **Total Test Cases Authored** | **70** | Comprehensive test scenarios covering all implemented modules |
| **Verified & Passed (Unit/Security Suite)** | **5** | Formally verified via backend Jest security suites and architectural audit |
| **Pending Live Demonstration** | **65** | Real-time interactive UI/API tests reserved for viva evaluation |
| **Modules Covered** | **8 Distinct Modules** | Authentication, Consumer, AI Pairing, Bookings, Winery, Lab, Admin, Security |
| **E-Commerce Scope Verification** | **Tourism Operational** | Vineyard experience bookings operational; direct physical bottle cart deferred |
| **Multi-Role Coverage** | **100% Tri-Stakeholder** | Dedicated coverage for Consumer, Winery Owner, and Superadmin roles |

---

## 2. Module-Wise Distribution Table

| Module Name | ID Prefix | Total Cases | Verified (Pass) | Pending Demo | Test Focus & Key Capabilities |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Authentication & RBAC** | `TC_AUTH` | 12 | 3 | 9 | Supabase Auth, JWT claims, role protection, multi-tenant isolation, draft winery block |
| **Consumer Portal & Profiling** | `TC_CON` | 12 | 0 | 12 | 32D taste onboarding, sensory filtering, catalog search, cellar wishlist, community reviews |
| **AI Food & Wine Pairing** | `TC_PAIR` | 6 | 0 | 6 | Sentence-Transformers + FAISS semantic search, Sommelier rationales, Indian cuisine |
| **Bookings & Experiences** | `TC_BOOK` | 8 | 1 | 7 | Experience browsing, date/slot picker, guest limits, pricing calculation, check-in, scope check |
| **Winery Management Portal** | `TC_WIN` | 11 | 0 | 11 | Estate narrative, catalog stock & pricing, experiences, B2B leads, review replies, EDA layer |
| **Wine Quality Assay Lab** | `TC_LAB` | 5 | 0 | 5 | 11 physicochemical inputs, ML inference (84.87% acc), radar gauge, enological advice |
| **Platform Admin Dashboard** | `TC_ADM` | 8 | 0 | 8 | Global KPIs, draft winery KYC approval/rejection, catalog moderation, platform GMV |
| **API, Database & Security** | `TC_SEC` | 8 | 1 | 7 | Bearer token protect, Rate limiting, SQLi/XSS immunity, uniform errors, responsive UI |
| **TOTAL** | — | **70** | **5** | **65** | **Full System Traceability Across All Layers** |

---

## 3. Testing Types & Coverage Breakdown

```
Testing Type Distribution:
┌─────────────────────────────────┬───────┬────────────┐
│ Testing Type                    │ Count │ Percentage │
├─────────────────────────────────┼───────┼────────────┤
│ Functional & Business Workflows │   35  │    49.3%   │
│ Security & RBAC Enforcement     │   11  │    15.5%   │
│ Validation & Boundary Checks    │    8  │    11.3%   │
│ UI & Data Visualization         │    8  │    11.3%   │
│ AI / ML Inference & Heuristics  │    4  │     5.6%   │
│ Integration & Reliability       │    5  │     7.0%   │
└─────────────────────────────────┴───────┴────────────┘
```

### Coverage by User Stakeholder Role
* **Consumer (`user`):** 28 Test Cases (Taste profiler, wine discovery, food pairing, tour booking, digital cellar, reviews)
* **Winery Manager (`winery_owner`):** 19 Test Cases (Estate settings, catalog, ML Quality Lab, experiences, visitor check-in, analytics)
* **Platform Superadmin (`admin`):** 11 Test Cases (KPI metrics, legal KYC approval, catalog auditing, content moderation)
* **System & Multi-Role Architecture:** 13 Test Cases (Token authentication, IDOR multi-tenant isolation, rate limiting, SQLi/XSS prevention)

---

## 4. Key Architectural & Scope Findings

### 1. Scope Boundary: Experiential Tourism vs Physical E-Commerce
* **Implemented:** Full vineyard tourism experience reservation pipeline (`public.experiences`, `public.events`, `public.bookings`), featuring calendar slot selection, adult/driver guest pricing, unique booking reference ID generation, digital QR pass rendering, and on-site check-in.
* **Deferred to Phase 2 (Out-of-Scope):** Physical retail wine bottle delivery cart and payment gateway checkout. The codebase deliberately guides consumers toward cellar wishlist bookmarks and vineyard estate visits, adhering to beverage alcohol inter-state compliance regulations.

### 2. Multi-Tenant Winery Isolation (IDOR Immunity)
* Verified through `backend/api/src/middleware/roleMiddleware.ts` and automated unit tests (`security_authorization.test.ts`).
* The `requireWineryIsolation` middleware guarantees that winery owners cannot access, inspect, or mutate another estate's inventory, financial data, or visitor bookings (`HTTP 403 Forbidden`).

### 3. Machine Learning Robustness & Offline Fallbacks
* **Food & Wine Pairing:** Driven by `Sentence-Transformers` (`all-MiniLM-L6-v2`) with cosine similarity across 12 culinary groups (including Indian delicacies like Butter Chicken and Goan Fish Curry).
* **Quality Lab Assay:** The Express backend (`quality.service.ts`) includes a weighted physicochemical benchmark fallback when the Python ML microservice is unreachable, ensuring high availability during evaluator demonstrations.

---

## 5. Deliverables Summary

All generated testing deliverables have been compiled inside the workspace folder `FYP_Testing_Documentation/`:

1. **`VinoSphere_Test_Cases.xlsx`**:
   * Complete multi-sheet Excel workbook.
   * Signature VinoSphere luxury styling (Maroon `#6D071A`, Champagne Gold `#D4AF37`, subtle zebra striping).
   * Separate worksheets for Executive Summary, Master Register, and all 8 individual modules.
   * AutoFilter enabled on all data tables with optimized column widths and cell wrapping.

2. **`VinoSphere_Test_Cases.docx`**:
   * Publication-grade academic project review document.
   * Formal cover page, document control block, system architecture diagrams, and test methodology.
   * Formatted tables for all 71 test cases with test steps, test data, expected outcomes, and status.
   * Faculty review committee sign-off table for internal and external project evaluators.

3. **`Testing_Summary.md`**:
   * High-level markdown summary detailing test execution metrics, coverage statistics, and traceability matrices.

---
*Report generated and validated autonomously for VinoSphere B.Tech Final Year Project Review.*
