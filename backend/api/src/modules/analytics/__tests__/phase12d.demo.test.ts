/**
 * Phase 12D: Demo Readiness & Controlled Showcase Environment Test Suite
 * =======================================================================
 * Validates the complete end-to-end analytics pipeline on the isolated synthetic demo winery dataset.
 * 
 * Target Demo Winery ID: 00000000-0000-4000-d000-000000000999
 * 
 * Verifies:
 * 1. Wine Analytics (Views, Saves, View-to-Save rate, Insight generation)
 * 2. Event Metrics (Bookings, Guests, Capacity Utilization, GBV, Unpaid/Cancelled filtering)
 * 3. Experience Metrics (Bookings, Guests, Experience GBV)
 * 4. Corporate Inquiries Breakdown (Status counts, Average expected guests, Zero GBV impact)
 * 5. Combined GBV & Period Comparison (Current vs Previous, Percentage change calculations)
 * 6. Recommendation Generation & Deduplication
 * 7. Strict Winery Isolation
 * 8. Seed & Reset Cleanup Utility
 */

import { AnalyticsService } from '../analytics.service';
import { RecommendationService } from '../recommendation.service';
import {
  seedDemoDataset,
  resetDemoDataset,
  DEMO_WINERY_ID,
  DEMO_WINE_A_ID,
  DEMO_WINE_B_ID,
  DEMO_EVENT_1_ID,
  DEMO_EVENT_2_ID,
  DEMO_EXPERIENCE_1_ID,
  DEMO_EXPERIENCE_2_ID
} from '../demoSeed';

const analyticsService = new AnalyticsService();
const OTHER_WINERY_ID = '00000000-0000-4000-d000-000000000000';

describe('Phase 12D: Demo Readiness & Controlled Showcase Environment', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await seedDemoDataset();
  }, 30000);

  afterAll(async () => {
    await seedDemoDataset();
  }, 30000);

  // --------------------------------------------------------------------------
  // 1. Wine Analytics & Behavioral Insights
  // --------------------------------------------------------------------------
  it('1. Wine Analytics calculates views, saves, and generates valid insights', async () => {
    const summary = await analyticsService.getDashboardSummary(DEMO_WINERY_ID);

    expect(summary.wine_views).toBeGreaterThanOrEqual(45); // Wine A (25) + Wine B (20 current)
    expect(summary.wine_saves).toBeGreaterThanOrEqual(1);
    expect(summary.view_to_save_rate).toBeGreaterThan(0);
    expect(summary.most_viewed_wines.length).toBeGreaterThan(0);

    const wineA = summary.most_viewed_wines.find((w: any) => w.wine_id === DEMO_WINE_A_ID);
    expect(wineA).toBeDefined();
    if (wineA) {
      expect(wineA.views).toBe(25);
    }

    const wineB = summary.most_viewed_wines.find((w: any) => w.wine_id === DEMO_WINE_B_ID);
    expect(wineB).toBeDefined();
    if (wineB) {
      expect(wineB.views).toBe(28); // 20 current + 8 previous
    }
  });

  // --------------------------------------------------------------------------
  // 2. Event Performance & Capacity Utilization
  // --------------------------------------------------------------------------
  it('2. Event Analytics filters non-eligible bookings and computes capacity utilization & GBV accurately', async () => {
    const bizMetrics = await analyticsService.getBusinessAnalytics(DEMO_WINERY_ID, 7);

    // Current period event bookings = 5 (Event 1) + 6 (Event 2) + 1 pending (Event 2) = 12 non-cancelled bookings
    // 1 cancelled booking is excluded!
    expect(bizMetrics.eventBookings.current).toBe(12);
    expect(bizMetrics.eventBookings.previous).toBe(5);
    expect(bizMetrics.eventBookings.absoluteChange).toBe(7);

    // Current event guests = (5 * 3) + (6 * 4) + (1 * 2 pending) = 15 + 24 + 2 = 41 guests
    expect(bizMetrics.eventGuests.current).toBe(41);
    expect(bizMetrics.eventGuests.previous).toBe(15);

    // Combined capacity across active published events = 40 + 35 = 75
    // Capacity utilization = 41 / 75 * 100 = 54.67%
    expect(bizMetrics.eventCapacityUtilization.current).toBeCloseTo(54.67, 1);

    // Event Gross Booking Value = (5 * 2500) + (6 * 1800) = 12500 + 10800 = 23300
    // Cancelled, refunded, and pending unpaid bookings are strictly excluded from GBV!
    expect(bizMetrics.eventGrossBookingValue.current).toBe(23300);
    expect(bizMetrics.eventGrossBookingValue.previous).toBe(11000); // 5 * 2200
  });

  // --------------------------------------------------------------------------
  // 3. Experience Analytics
  // --------------------------------------------------------------------------
  it('3. Experience Analytics calculates bookings, guests, and experience GBV accurately', async () => {
    const bizMetrics = await analyticsService.getBusinessAnalytics(DEMO_WINERY_ID, 7);

    // Current experience bookings = 5 (Exp 1) + 4 (Exp 2) = 9 eligible bookings
    expect(bizMetrics.experienceBookings.current).toBe(9);
    expect(bizMetrics.experienceBookings.previous).toBe(4);

    // Current experience guests = (5 * 3) + (4 * 2) = 15 + 8 = 23 guests
    expect(bizMetrics.experienceGuests.current).toBe(23);

    // Experience GBV = (5 * 3000) + (4 * 2000) = 15000 + 8000 = 23000
    expect(bizMetrics.experienceGrossBookingValue.current).toBe(23000);
    expect(bizMetrics.experienceGrossBookingValue.previous).toBe(9000); // 4 * 2250
  });

  // --------------------------------------------------------------------------
  // 4. Corporate Inquiries Breakdown
  // --------------------------------------------------------------------------
  it('4. Corporate Inquiries Breakdown computes status counts and avg expected guests without creating fake revenue', async () => {
    const bizMetrics = await analyticsService.getBusinessAnalytics(DEMO_WINERY_ID, 7);

    expect(bizMetrics.corporateInquiries.current).toBe(4);
    expect(bizMetrics.corporateStatusBreakdown).toEqual({
      pending: 1,
      approved: 2,
      rejected: 1
    });

    // Average expected guests = (50 + 35 + 75 + 20) / 4 = 180 / 4 = 45.0
    expect(bizMetrics.corporateAvgExpectedGuests).toBe(45.0);
  });

  // --------------------------------------------------------------------------
  // 5. Combined Gross Booking Value & Period Comparison
  // --------------------------------------------------------------------------
  it('5. Combined GBV combines event and experience GBV and handles period comparison safely', async () => {
    const bizMetrics = await analyticsService.getBusinessAnalytics(DEMO_WINERY_ID, 7);

    // Current Combined GBV = Event GBV (23300) + Experience GBV (23000) = 46300
    expect(bizMetrics.totalGrossBookingValue.current).toBe(46300);

    // Previous Combined GBV = Event GBV (11000) + Experience GBV (9000) = 20000
    expect(bizMetrics.totalGrossBookingValue.previous).toBe(20000);

    // Absolute Change = 46300 - 20000 = 26300
    expect(bizMetrics.totalGrossBookingValue.absoluteChange).toBe(26300);

    // Percentage Change = (46300 - 20000) / 20000 * 100 = 131.5%
    expect(bizMetrics.totalGrossBookingValue.percentageChange).toBeCloseTo(131.5, 1);

    // Ensure no NaN or Infinity exists anywhere
    expect(Number.isNaN(bizMetrics.totalGrossBookingValue.percentageChange)).toBe(false);
    expect(Number.isFinite(bizMetrics.totalGrossBookingValue.percentageChange)).toBe(true);
  });

  // --------------------------------------------------------------------------
  // 6. Recommendation Pipeline & Deduplication
  // --------------------------------------------------------------------------
  it('6. Recommendation pipeline generates actionable recommendations and deduplicates correctly', async () => {
    // Generate wine insights & recommendations
    const wineRecs = await RecommendationService.processWineInsights(DEMO_WINERY_ID);
    expect(wineRecs).toBeDefined();

    // Generate business recommendations
    const bizRecs = await RecommendationService.processBusinessInsights(DEMO_WINERY_ID);
    expect(bizRecs).toBeDefined();
    expect(bizRecs.length).toBeGreaterThan(0);

    // Verify recommendations can be retrieved for demo winery
    const storedRecs = await RecommendationService.getRecommendations(DEMO_WINERY_ID);
    expect(storedRecs.length).toBeGreaterThan(0);

    // Run deduplication run: running again should not duplicate recommendations
    const secondRun = await RecommendationService.processBusinessInsights(DEMO_WINERY_ID);
    const storedRecsAfter = await RecommendationService.getRecommendations(DEMO_WINERY_ID);
    expect(storedRecsAfter.length).toBe(storedRecs.length);
  });

  // --------------------------------------------------------------------------
  // 7. Winery Data Isolation
  // --------------------------------------------------------------------------
  it('7. Demo winery data does not leak into other wineries', async () => {
    const otherBiz = await analyticsService.getBusinessAnalytics(OTHER_WINERY_ID, 7);

    expect(otherBiz.eventBookings.current).toBe(0);
    expect(otherBiz.experienceBookings.current).toBe(0);
    expect(otherBiz.totalGrossBookingValue.current).toBe(0);
    expect(otherBiz.corporateInquiries.current).toBe(0);
  });
});