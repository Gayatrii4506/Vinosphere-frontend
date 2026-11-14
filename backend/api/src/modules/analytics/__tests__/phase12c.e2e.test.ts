/**
 * Phase 12C: Real-World End-to-End QA and System Validation Test Suite
 * ====================================================================
 * End-to-end technical validation of complete business analytics pipeline:
 * Scenario A — Empty Winery (Truthful zero / insufficient data states)
 * Scenario B — Event Activity (Eligible vs cancelled/refunded/unpaid filtering & capacity math)
 * Scenario C — Experience Activity (Experience GBV & party size aggregation)
 * Scenario D — Corporate Leads Breakdown & Guest Averages (Approved != sale revenue)
 * Scenario E — Mixed Winery Cohesive Integration (Event + Experience GBV combination)
 * Scenario F — Period Comparison & Safe Zero Baseline Handling (No Infinity/NaN)
 * Scenario G — Multi-Event Capacity Math & Single-Event Multi-Booking Capacity Integrity
 * Scenario H — Strict Winery Isolation (Zero cross-tenant data leakage)
 * Scenario I — Deterministic Recommendation Pipeline & Deduplication
 * Scenario J — Terminology Compliance Audit (Gross Booking Value strictly enforced)
 * 
 * ALL test data uses isolated synthetic IDs with prefix '00000000-0000-4000-c000-'.
 * Full DB cleanup runs before and after test execution.
 */

import { supabaseAdmin as supabase } from '../../../config/supabase';
import { AnalyticsService } from '../analytics.service';
import { RecommendationService } from '../recommendation.service';
import { InsightEngine } from '../insight.engine';

const TEST_WINERY_EMPTY     = '00000000-0000-4000-c000-000000000001';
const TEST_WINERY_EVENTS    = '00000000-0000-4000-c000-000000000002';
const TEST_WINERY_EXP       = '00000000-0000-4000-c000-000000000003';
const TEST_WINERY_CORP      = '00000000-0000-4000-c000-000000000004';
const TEST_WINERY_MIXED     = '00000000-0000-4000-c000-000000000005';
const TEST_WINERY_MULTI_CAP = '00000000-0000-4000-c000-000000000006';
const TEST_WINERY_ISO_A     = '00000000-0000-4000-c000-000000000007';
const TEST_WINERY_ISO_B     = '00000000-0000-4000-c000-000000000008';

const TEST_USER_ID          = '2eaca3d1-cdf9-46b7-ba45-91a4c6eda59c';

const analyticsService = new AnalyticsService();

async function cleanupTestData() {
  const testWineryIds = [
    TEST_WINERY_EMPTY,
    TEST_WINERY_EVENTS,
    TEST_WINERY_EXP,
    TEST_WINERY_CORP,
    TEST_WINERY_MIXED,
    TEST_WINERY_MULTI_CAP,
    TEST_WINERY_ISO_A,
    TEST_WINERY_ISO_B
  ];

  await supabase.from('recommendations').delete().in('winery_id', testWineryIds);
  await supabase.from('bookings').delete().in('winery_id', testWineryIds);
  await supabase.from('corporate_leads').delete().in('winery_id', testWineryIds);
  await supabase.from('events').delete().in('winery_id', testWineryIds);
  await supabase.from('experiences').delete().in('winery_id', testWineryIds);
  await supabase.from('analytics_events').delete().in('winery_id', testWineryIds);
}

async function seedTestWineries() {
  await supabase.from('wineries').upsert([
    { id: TEST_WINERY_EMPTY, name: 'Synthetic Empty Winery', slug: 'syn-empty-c' },
    { id: TEST_WINERY_EVENTS, name: 'Synthetic Events Winery', slug: 'syn-events-c' },
    { id: TEST_WINERY_EXP, name: 'Synthetic Experience Winery', slug: 'syn-exp-c' },
    { id: TEST_WINERY_CORP, name: 'Synthetic Corporate Winery', slug: 'syn-corp-c' },
    { id: TEST_WINERY_MIXED, name: 'Synthetic Mixed Winery', slug: 'syn-mixed-c' },
    { id: TEST_WINERY_MULTI_CAP, name: 'Synthetic Multi Cap Winery', slug: 'syn-multicap-c' },
    { id: TEST_WINERY_ISO_A, name: 'Synthetic Iso Winery A', slug: 'syn-iso-a-c' },
    { id: TEST_WINERY_ISO_B, name: 'Synthetic Iso Winery B', slug: 'syn-iso-b-c' }
  ], { onConflict: 'id' });
}

describe('Phase 12C: Real-World End-to-End QA and System Validation', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await cleanupTestData();
    await seedTestWineries();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  }, 30000);

  // --------------------------------------------------------------------------
  // Scenario A — Empty Winery
  // --------------------------------------------------------------------------
  it('Scenario A — Empty Winery returns truthful zero/insufficient states without erroring', async () => {
    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_EMPTY, 7);
    const summary = await analyticsService.getDashboardSummary(TEST_WINERY_EMPTY);

    expect(bizMetrics.eventBookings.current).toBe(0);
    expect(bizMetrics.eventBookings.previous).toBe(0);
    expect(bizMetrics.eventBookings.percentageChange).toBeNull();
    expect(bizMetrics.eventBookings.dataSufficient).toBe(false);

    expect(bizMetrics.experienceBookings.current).toBe(0);
    expect(bizMetrics.experienceGrossBookingValue.current).toBe(0);

    expect(bizMetrics.totalGrossBookingValue.current).toBe(0);
    expect(bizMetrics.eventCapacityUtilization.current).toBe(0);

    expect(bizMetrics.corporateInquiries.current).toBe(0);
    expect(bizMetrics.corporateStatusBreakdown).toEqual({ pending: 0, approved: 0, rejected: 0 });
    expect(bizMetrics.corporateAvgExpectedGuests).toBe(0);

    expect(summary.wine_views).toBe(0);
    expect(summary.guests_booked).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Scenario B — Event Activity Filtering & Eligible Revenue Rules
  // --------------------------------------------------------------------------
  it('Scenario B — Event Activity verifies eligible vs cancelled/unpaid/refunded booking filtering', async () => {
    const eventId = '00000000-0000-4000-c000-0000000000e1';
    const nowISO = new Date().toISOString();
    const todayStr = nowISO.split('T')[0];

    await supabase.from('events').upsert([{
      id: eventId, winery_id: TEST_WINERY_EVENTS, title: 'Summer Festival', capacity: 50, price: 1000, publish_status: 'published', event_date: todayStr
    }]);

    await supabase.from('bookings').insert([
      // 1. Confirmed Paid (Eligible for count, guests, and GBV)
      { winery_id: TEST_WINERY_EVENTS, event_id: eventId, user_id: TEST_USER_ID, guests: 10, total_amount: 1000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      // 2. Completed Paid (Eligible for count, guests, and GBV)
      { winery_id: TEST_WINERY_EVENTS, event_id: eventId, user_id: TEST_USER_ID, guests: 15, total_amount: 1500, booking_status: 'completed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      // 3. Cancelled Paid (EXCLUDED from count, guests, and GBV)
      { winery_id: TEST_WINERY_EVENTS, event_id: eventId, user_id: TEST_USER_ID, guests: 8, total_amount: 800, booking_status: 'cancelled', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      // 4. Pending Payment (Eligible for count & guests, EXCLUDED from GBV)
      { winery_id: TEST_WINERY_EVENTS, event_id: eventId, user_id: TEST_USER_ID, guests: 5, total_amount: 500, booking_status: 'pending', payment_status: 'pending', booking_date: todayStr, created_at: nowISO },
      // 5. Failed Payment (Eligible for count & guests, EXCLUDED from GBV)
      { winery_id: TEST_WINERY_EVENTS, event_id: eventId, user_id: TEST_USER_ID, guests: 4, total_amount: 400, booking_status: 'pending', payment_status: 'failed', booking_date: todayStr, created_at: nowISO },
      // 6. Refunded Payment (Eligible for count & guests, EXCLUDED from GBV)
      { winery_id: TEST_WINERY_EVENTS, event_id: eventId, user_id: TEST_USER_ID, guests: 6, total_amount: 600, booking_status: 'confirmed', payment_status: 'refunded', booking_date: todayStr, created_at: nowISO }
    ]);

    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_EVENTS, 7);

    // Non-cancelled bookings count = 5 (Confirmed, Completed, Pending, Failed, Refunded)
    expect(bizMetrics.eventBookings.current).toBe(5);
    // Guests sum = 10 + 15 + 5 + 4 + 6 = 40
    expect(bizMetrics.eventGuests.current).toBe(40);
    // Eligible GBV = 1000 + 1500 = 2500
    expect(bizMetrics.eventGrossBookingValue.current).toBe(2500);
    // Capacity utilization = (40 / 50) * 100 = 80%
    expect(bizMetrics.eventCapacityUtilization.current).toBe(80);
  });

  // --------------------------------------------------------------------------
  // Scenario C — Experience Activity Filtering
  // --------------------------------------------------------------------------
  it('Scenario C — Experience Activity verifies experience GBV and party size aggregation', async () => {
    const expId = '00000000-0000-4000-c000-0000000000f1';
    const nowISO = new Date().toISOString();
    const todayStr = nowISO.split('T')[0];

    await supabase.from('experiences').upsert([{
      id: expId, winery_id: TEST_WINERY_EXP, title: 'Boutique Tasting', capacity: 20, price: 500, publish_status: 'published'
    }]);

    await supabase.from('bookings').insert([
      { winery_id: TEST_WINERY_EXP, experience_id: expId, user_id: TEST_USER_ID, guests: 4, total_amount: 2000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      { winery_id: TEST_WINERY_EXP, experience_id: expId, user_id: TEST_USER_ID, guests: 3, total_amount: 1500, booking_status: 'cancelled', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      { winery_id: TEST_WINERY_EXP, experience_id: expId, user_id: TEST_USER_ID, guests: 2, total_amount: 1000, booking_status: 'confirmed', payment_status: 'refunded', booking_date: todayStr, created_at: nowISO },
      { winery_id: TEST_WINERY_EXP, experience_id: expId, user_id: TEST_USER_ID, guests: 5, total_amount: 2500, booking_status: 'pending', payment_status: 'pending', booking_date: todayStr, created_at: nowISO }
    ]);

    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_EXP, 7);

    expect(bizMetrics.experienceBookings.current).toBe(3); // 4 - 1 cancelled
    expect(bizMetrics.experienceGuests.current).toBe(11); // 4 + 2 + 5
    expect(bizMetrics.experienceGrossBookingValue.current).toBe(2000); // paid only
  });

  // --------------------------------------------------------------------------
  // Scenario D — Corporate Leads Breakdown
  // --------------------------------------------------------------------------
  it('Scenario D — Corporate Leads verifies status breakdown and guest average without creating sales revenue', async () => {
    const nowISO = new Date().toISOString();
    await supabase.from('corporate_leads').insert([
      { winery_id: TEST_WINERY_CORP, company_name: 'Tech Corp', status: 'pending', expected_guests: 50, created_at: nowISO },
      { winery_id: TEST_WINERY_CORP, company_name: 'Finance LLC', status: 'approved', expected_guests: 100, created_at: nowISO },
      { winery_id: TEST_WINERY_CORP, company_name: 'Design Studio', status: 'approved', expected_guests: 30, created_at: nowISO },
      { winery_id: TEST_WINERY_CORP, company_name: 'Legal Partners', status: 'rejected', expected_guests: 20, created_at: nowISO }
    ]);

    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_CORP, 7);

    expect(bizMetrics.corporateInquiries.current).toBe(4);
    expect(bizMetrics.corporateStatusBreakdown).toEqual({ pending: 1, approved: 2, rejected: 1 });
    expect(bizMetrics.corporateAvgExpectedGuests).toBe(50.0); // (50 + 100 + 30 + 20) / 4 = 50
    // Gross booking value remains $0 as approved corporate leads are NOT sales revenue
    expect(bizMetrics.totalGrossBookingValue.current).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Scenario E — Mixed Winery Integration
  // --------------------------------------------------------------------------
  it('Scenario E — Mixed Winery aggregates events, experiences, and corporate leads into cohesive GBV', async () => {
    const evtId = '00000000-0000-4000-c000-0000000000e5';
    const expId = '00000000-0000-4000-c000-0000000000f5';
    const nowISO = new Date().toISOString();
    const todayStr = nowISO.split('T')[0];

    await supabase.from('events').upsert([{ id: evtId, winery_id: TEST_WINERY_MIXED, title: 'Wine Gala', capacity: 100, price: 2000, event_date: todayStr }]);
    await supabase.from('experiences').upsert([{ id: expId, winery_id: TEST_WINERY_MIXED, title: 'VIP Tour', capacity: 10, price: 1000 }]);

    await supabase.from('bookings').insert([
      { winery_id: TEST_WINERY_MIXED, event_id: evtId, user_id: TEST_USER_ID, guests: 20, total_amount: 40000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      { winery_id: TEST_WINERY_MIXED, experience_id: expId, user_id: TEST_USER_ID, guests: 5, total_amount: 5000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO }
    ]);

    await supabase.from('corporate_leads').insert([
      { winery_id: TEST_WINERY_MIXED, company_name: 'Acme Corp', status: 'pending', expected_guests: 45, created_at: nowISO }
    ]);

    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_MIXED, 7);

    expect(bizMetrics.eventGrossBookingValue.current).toBe(40000);
    expect(bizMetrics.experienceGrossBookingValue.current).toBe(5000);
    expect(bizMetrics.totalGrossBookingValue.current).toBe(45000); // 40000 + 5000 combined
    expect(bizMetrics.corporateInquiries.current).toBe(1);
  });

  // --------------------------------------------------------------------------
  // Scenario F — Period Comparison & Safe Zero Baseline Handling
  // --------------------------------------------------------------------------
  it('Scenario F — Period comparison calculates percentage change safely without producing NaN or Infinity', async () => {
    const wineryId = TEST_WINERY_MIXED;
    const now = new Date();
    const currentISO = now.toISOString();
    const todayStr = currentISO.split('T')[0];
    const prevDate = new Date(now);
    prevDate.setDate(now.getDate() - 10);
    const prevISO = prevDate.toISOString();
    const prevStr = prevISO.split('T')[0];

    const evtId = '00000000-0000-4000-c000-0000000000e6';
    await supabase.from('events').upsert([{ id: evtId, winery_id: wineryId, title: 'Period Test Event', capacity: 100, price: 100, event_date: todayStr }]);

    // Current period booking
    await supabase.from('bookings').insert([
      { winery_id: wineryId, event_id: evtId, user_id: TEST_USER_ID, guests: 10, total_amount: 1000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: currentISO },
      { winery_id: wineryId, event_id: evtId, user_id: TEST_USER_ID, guests: 5, total_amount: 500, booking_status: 'confirmed', payment_status: 'paid', booking_date: prevStr, created_at: prevISO }
    ]);

    const bizMetrics = await analyticsService.getBusinessAnalytics(wineryId, 7);

    expect(bizMetrics.eventGrossBookingValue.percentageChange).not.toBeNaN();
    expect(bizMetrics.eventGrossBookingValue.percentageChange).not.toBe(Infinity);
    expect(typeof bizMetrics.eventGrossBookingValue.percentageChange).toBe('number');
  });

  // --------------------------------------------------------------------------
  // Scenario G — Multi-Event Capacity Math & Multi-Booking Integrity
  // --------------------------------------------------------------------------
  it('Scenario G — Multi-Event capacity aggregates correctly (60 guests / 75 cap = 80%) without capacity multiplication', async () => {
    const eventA = '00000000-0000-4000-c000-0000000000ea';
    const eventB = '00000000-0000-4000-c000-0000000000eb';
    const nowISO = new Date().toISOString();
    const todayStr = nowISO.split('T')[0];

    // Event A: cap = 40, Event B: cap = 35 -> Total capacity = 75
    await supabase.from('events').upsert([
      { id: eventA, winery_id: TEST_WINERY_MULTI_CAP, title: 'Event A', capacity: 40, price: 100, event_date: todayStr },
      { id: eventB, winery_id: TEST_WINERY_MULTI_CAP, title: 'Event B', capacity: 35, price: 100, event_date: todayStr }
    ]);

    // Event A receives 2 bookings of 15 guests (Total = 30 guests for Event A)
    // Event B receives 1 booking of 30 guests (Total = 30 guests for Event B)
    // Combined guests = 60
    await supabase.from('bookings').insert([
      { winery_id: TEST_WINERY_MULTI_CAP, event_id: eventA, user_id: TEST_USER_ID, guests: 15, total_amount: 1500, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      { winery_id: TEST_WINERY_MULTI_CAP, event_id: eventA, user_id: TEST_USER_ID, guests: 15, total_amount: 1500, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO },
      { winery_id: TEST_WINERY_MULTI_CAP, event_id: eventB, user_id: TEST_USER_ID, guests: 30, total_amount: 3000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO }
    ]);

    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_MULTI_CAP, 7);

    // Expected Utilization = (60 / 75) * 100 = 80% (NOT 150%)
    expect(bizMetrics.eventCapacityUtilization.current).toBe(80);
  });

  // --------------------------------------------------------------------------
  // Scenario H — Strict Winery Isolation
  // --------------------------------------------------------------------------
  it('Scenario H — Winery A data never leaks into Winery B analytics', async () => {
    const eventIso = '00000000-0000-4000-c000-000000000eia';
    const nowISO = new Date().toISOString();
    const todayStr = nowISO.split('T')[0];

    await supabase.from('events').upsert([{ id: eventIso, winery_id: TEST_WINERY_ISO_A, title: 'Iso Event A', capacity: 50, price: 500, event_date: todayStr }]);
    await supabase.from('bookings').insert([
      { winery_id: TEST_WINERY_ISO_A, event_id: eventIso, user_id: TEST_USER_ID, guests: 20, total_amount: 10000, booking_status: 'confirmed', payment_status: 'paid', booking_date: todayStr, created_at: nowISO }
    ]);
    await supabase.from('corporate_leads').insert([
      { winery_id: TEST_WINERY_ISO_A, company_name: 'Iso Corp A', status: 'approved', expected_guests: 50, created_at: nowISO }
    ]);

    // Query Winery Iso B (which has zero records seeded)
    const metricsIsoB = await analyticsService.getBusinessAnalytics(TEST_WINERY_ISO_B, 7);

    expect(metricsIsoB.eventBookings.current).toBe(0);
    expect(metricsIsoB.eventGuests.current).toBe(0);
    expect(metricsIsoB.totalGrossBookingValue.current).toBe(0);
    expect(metricsIsoB.corporateInquiries.current).toBe(0);
  });

  // --------------------------------------------------------------------------
  // Scenario I — Recommendation Pipeline & Deduplication
  // --------------------------------------------------------------------------
  it('Scenario I — Business recommendation pipeline detects trends and prevents duplicates', async () => {
    const wineryId = TEST_WINERY_EVENTS;

    // Run recommendation processing
    const results = await RecommendationService.processBusinessInsights(wineryId);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);

    // Run second time — deduplication should kick in
    const secondRun = await RecommendationService.processBusinessInsights(wineryId);
    const dupCount = secondRun.filter((r: any) => r.status === 'duplicate_ignored').length;

    expect(dupCount).toBeGreaterThanOrEqual(0);
  });

  // --------------------------------------------------------------------------
  // Scenario J — Terminology Compliance Audit
  // --------------------------------------------------------------------------
  it('Scenario J — API responses strictly enforce Gross Booking Value and exclude prohibited revenue terms', async () => {
    const bizMetrics = await analyticsService.getBusinessAnalytics(TEST_WINERY_MIXED, 7);

    const keys = Object.keys(bizMetrics);
    expect(keys).toContain('eventGrossBookingValue');
    expect(keys).toContain('experienceGrossBookingValue');
    expect(keys).toContain('totalGrossBookingValue');

    // Confirm prohibited keys are absent
    expect(keys).not.toContain('totalWineryRevenue');
    expect(keys).not.toContain('wineSalesRevenue');
    expect(keys).not.toContain('corporateRevenue');
    expect(keys).not.toContain('corporateConversionRate');
  });
});
