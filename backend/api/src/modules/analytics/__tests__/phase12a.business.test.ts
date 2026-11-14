/**
 * Phase 12A: Business Analytics Test Suite
 * ==========================================
 * Tests precision business analytics metrics, period comparisons, zero handling,
 * capacity utilization, corporate lead breakdown, gross booking value, trend detection,
 * deduplication, winery isolation, and LLM fallback.
 * 
 * ALL test data uses isolated synthetic IDs with prefix '__test_phase12a_'.
 * Cleanup runs before and after the suite.
 */

import { supabaseAdmin as supabase } from '../../../config/supabase';
import { AnalyticsService } from '../analytics.service';
import { RecommendationService } from '../recommendation.service';
import { InsightEngine } from '../insight.engine';

const TEST_WINERY_A = '00000000-0000-4000-a000-000000000010';
const TEST_WINERY_B = '00000000-0000-4000-a000-000000000020';
const TEST_WINERY_ZERO = '00000000-0000-4000-a000-000000000030';

const TEST_EVENT_A = '00000000-0000-4000-e000-000000000001';
const TEST_EXPERIENCE_A = '00000000-0000-4000-f000-000000000001';
const TEST_USER = '2eaca3d1-cdf9-46b7-ba45-91a4c6eda59c';

const analyticsService = new AnalyticsService();

async function seedTestEntities() {
  await supabase.from('wineries').upsert([
    { id: TEST_WINERY_A, name: 'Test Business Winery A', slug: 'test-biz-a-phase12a' },
    { id: TEST_WINERY_B, name: 'Test Business Winery B', slug: 'test-biz-b-phase12a' },
    { id: TEST_WINERY_ZERO, name: 'Test Business Winery Zero', slug: 'test-biz-zero-phase12a' }
  ], { onConflict: 'id' });

  await supabase.from('events').upsert([
    { id: TEST_EVENT_A, winery_id: TEST_WINERY_A, title: 'Grand Harvest Tasting', event_date: new Date().toISOString().split('T')[0], capacity: 50, price: 1000, publish_status: 'published' }
  ], { onConflict: 'id' });

  await supabase.from('experiences').upsert([
    { id: TEST_EXPERIENCE_A, winery_id: TEST_WINERY_A, title: 'Cellar Tour & Tasting', capacity: 20, price: 500, publish_status: 'published' }
  ], { onConflict: 'id' });
}

async function cleanupTestData() {
  const wineryIds = [TEST_WINERY_A, TEST_WINERY_B, TEST_WINERY_ZERO];
  
  await supabase.from('recommendations').delete().in('winery_id', wineryIds);
  await supabase.from('bookings').delete().in('winery_id', wineryIds);
  await supabase.from('corporate_leads').delete().in('winery_id', wineryIds);
  await supabase.from('events').delete().in('winery_id', wineryIds);
  await supabase.from('experiences').delete().in('winery_id', wineryIds);
}

describe('Phase 12A: Business Analytics Test Suite', () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await cleanupTestData();
    await seedTestEntities();
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  }, 30000);

  // -----------------------------------------------------------------------
  // Scenario 1: Zero Data
  // -----------------------------------------------------------------------
  describe('Scenario 1 — Zero Data', () => {
    test('returns finite values, no NaN, no Infinity, zero counts', async () => {
      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_ZERO, 7);

      expect(biz.eventBookings.current).toBe(0);
      expect(biz.eventBookings.previous).toBe(0);
      expect(biz.eventBookings.absoluteChange).toBe(0);
      expect(biz.eventBookings.percentageChange).toBeNull();
      expect(Number.isNaN(biz.eventBookings.absoluteChange)).toBe(false);

      expect(biz.eventGuests.current).toBe(0);
      expect(biz.eventCapacityUtilization.current).toBe(0);
      expect(biz.eventGrossBookingValue.current).toBe(0);

      expect(biz.experienceBookings.current).toBe(0);
      expect(biz.experienceGuests.current).toBe(0);
      expect(biz.experienceGrossBookingValue.current).toBe(0);

      expect(biz.totalGrossBookingValue.current).toBe(0);
      expect(biz.corporateInquiries.current).toBe(0);
      expect(biz.corporateStatusBreakdown).toEqual({ pending: 0, approved: 0, rejected: 0 });
      expect(biz.corporateAvgExpectedGuests).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 2: Insufficient Data
  // -----------------------------------------------------------------------
  describe('Scenario 2 — Insufficient Data', () => {
    test('small observation count returns insufficient_data', () => {
      const insight: any = InsightEngine.detectTrend(
        'event',
        TEST_WINERY_A,
        'event_bookings',
        1, // below min threshold of 2
        0,
        { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
      );

      expect(insight.status).toBe('insufficient_data');
      expect(insight.reason).toContain('Not enough observations');
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 3: Stable Event Bookings
  // -----------------------------------------------------------------------
  describe('Scenario 3 — Stable Event Bookings', () => {
    test('Current = 25, Previous = 23 -> stable / no action', () => {
      const insight: any = InsightEngine.detectTrend(
        'event',
        TEST_WINERY_A,
        'event_bookings',
        25,
        23,
        { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
      );

      expect(insight.rule_id).toBe('STABLE_NO_ACTION');
      expect(insight.detection_condition).toBe('stable');
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 4: Increasing Event Bookings
  // -----------------------------------------------------------------------
  describe('Scenario 4 — Increasing Event Bookings', () => {
    test('Current = 50, Previous = 20 -> RISING_EVENT_BOOKINGS', () => {
      const insight: any = InsightEngine.detectTrend(
        'event',
        TEST_WINERY_A,
        'event_bookings',
        50,
        20,
        { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
      );

      expect(insight.rule_id).toBe('RISING_EVENT_BOOKINGS');
      expect(insight.detection_condition).toBe('increasing event bookings');
      expect(insight.percentage_change).toBe(150);
      expect(insight.absolute_change).toBe(30);

      const recText = InsightEngine.generateRecommendation(insight.rule_id);
      expect(recText).toContain('Event bookings increased');
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 5: Decreasing Event Bookings
  // -----------------------------------------------------------------------
  describe('Scenario 5 — Decreasing Event Bookings', () => {
    test('Current = 20, Previous = 50 -> FALLING_EVENT_BOOKINGS', () => {
      const insight: any = InsightEngine.detectTrend(
        'event',
        TEST_WINERY_A,
        'event_bookings',
        20,
        50,
        { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
      );

      expect(insight.rule_id).toBe('FALLING_EVENT_BOOKINGS');
      expect(insight.detection_condition).toBe('decreasing event bookings');
      expect(insight.percentage_change).toBe(-60);
      expect(insight.absolute_change).toBe(-30);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 6: Experience Bookings
  // -----------------------------------------------------------------------
  describe('Scenario 6 — Experience Bookings', () => {
    test('RISING and FALLING experience bookings trend rules', () => {
      const rising: any = InsightEngine.detectTrend('experience', TEST_WINERY_A, 'experience_bookings', 15, 8, { current: 'C', comparison: 'P' });
      expect(rising.rule_id).toBe('RISING_EXPERIENCE_BOOKINGS');

      const falling: any = InsightEngine.detectTrend('experience', TEST_WINERY_A, 'experience_bookings', 6, 12, { current: 'C', comparison: 'P' });
      expect(falling.rule_id).toBe('FALLING_EXPERIENCE_BOOKINGS');
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 7: Guest Counts (`guests` column compliance)
  // -----------------------------------------------------------------------
  describe('Scenario 7 — Guest Counts Column Compliance', () => {
    test('verifies guests is queried correctly from DB bookings', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 4, total_amount: 4000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventGuests.current).toBe(4);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 8: Event Capacity Utilization
  // -----------------------------------------------------------------------
  describe('Scenario 8 — Event Capacity Utilization', () => {
    test('calculates 0%, partial capacity %, and full capacity % mathematically', async () => {
      const date = new Date().toISOString();

      // 0 guests
      let biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventCapacityUtilization.current).toBe(0);

      // Partial capacity: 25 guests out of 50 capacity = 50%
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 25, total_amount: 25000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventCapacityUtilization.current).toBe(50);

      // Full capacity: add 25 more guests = 50 guests / 50 capacity = 100%
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 25, total_amount: 25000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventCapacityUtilization.current).toBe(100);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 9: Paid Revenue (Gross Booking Value)
  // -----------------------------------------------------------------------
  describe('Scenario 9 — Paid Revenue', () => {
    test('paid eligible booking contributes total_amount', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 2, total_amount: 2000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventGrossBookingValue.current).toBe(2000);
      expect(biz.totalGrossBookingValue.current).toBe(2000);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 10: Cancelled Booking
  // -----------------------------------------------------------------------
  describe('Scenario 10 — Cancelled Booking Exclusion', () => {
    test('cancelled booking is excluded from counts and revenue', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 10, total_amount: 10000, booking_status: 'cancelled', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventBookings.current).toBe(0);
      expect(biz.eventGuests.current).toBe(0);
      expect(biz.eventGrossBookingValue.current).toBe(0);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 11: Refunded Booking
  // -----------------------------------------------------------------------
  describe('Scenario 11 — Refunded Booking Exclusion', () => {
    test('refunded booking does not contribute to paid Gross Booking Value', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 2, total_amount: 2000, booking_status: 'confirmed', payment_status: 'refunded', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventGrossBookingValue.current).toBe(0);
      expect(biz.totalGrossBookingValue.current).toBe(0);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 12: Pending Payment
  // -----------------------------------------------------------------------
  describe('Scenario 12 — Pending Payment Exclusion', () => {
    test('pending payment booking is excluded from paid Gross Booking Value', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 2, total_amount: 2000, booking_status: 'pending', payment_status: 'pending', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventBookings.current).toBe(1); // booking exists
      expect(biz.eventGrossBookingValue.current).toBe(0); // but unpaid revenue is 0

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 13: Experience Revenue
  // -----------------------------------------------------------------------
  describe('Scenario 13 — Experience Revenue', () => {
    test('experience booking revenue verified separately', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, experience_id: TEST_EXPERIENCE_A, guests: 3, total_amount: 1500, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.experienceBookings.current).toBe(1);
      expect(biz.experienceGuests.current).toBe(3);
      expect(biz.experienceGrossBookingValue.current).toBe(1500);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 14: Combined Gross Booking Value (No Double Counting)
  // -----------------------------------------------------------------------
  describe('Scenario 14 — Combined Gross Booking Value', () => {
    test('combines event + experience amounts without double counting', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 2, total_amount: 2000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date },
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, experience_id: TEST_EXPERIENCE_A, guests: 4, total_amount: 3000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      // Total GBV must equal 2000 + 3000 = 5000 exactly
      expect(biz.totalGrossBookingValue.current).toBe(5000);
      expect(biz.eventGrossBookingValue.current).toBe(2000);
      expect(biz.experienceGrossBookingValue.current).toBe(3000);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 15: Corporate Lead Status Breakdown
  // -----------------------------------------------------------------------
  describe('Scenario 15 — Corporate Lead Status Breakdown', () => {
    test('counts pending, approved, rejected status breakdown correctly', async () => {
      const date = new Date().toISOString();
      await supabase.from('corporate_leads').insert([
        { winery_id: TEST_WINERY_A, company_name: 'Corp A', status: 'pending', expected_guests: 50, created_at: date },
        { winery_id: TEST_WINERY_A, company_name: 'Corp B', status: 'approved', expected_guests: 100, created_at: date },
        { winery_id: TEST_WINERY_A, company_name: 'Corp C', status: 'rejected', expected_guests: 20, created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.corporateInquiries.current).toBe(3);
      expect(biz.corporateStatusBreakdown).toEqual({ pending: 1, approved: 1, rejected: 1 });

      await supabase.from('corporate_leads').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 16: Corporate Expected Guests Average
  // -----------------------------------------------------------------------
  describe('Scenario 16 — Corporate Expected Guests Average', () => {
    test('calculates average expected guests accurately', async () => {
      const date = new Date().toISOString();
      await supabase.from('corporate_leads').insert([
        { winery_id: TEST_WINERY_A, company_name: 'Corp 1', status: 'pending', expected_guests: 50, created_at: date },
        { winery_id: TEST_WINERY_A, company_name: 'Corp 2', status: 'pending', expected_guests: 150, created_at: date }
      ]);

      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.corporateAvgExpectedGuests).toBe(100); // (50 + 150) / 2 = 100

      await supabase.from('corporate_leads').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 17: Previous Period = 0
  // -----------------------------------------------------------------------
  describe('Scenario 17 — Previous Period = 0', () => {
    test('percentage change is null when previous period is 0, avoiding NaN/Infinity', async () => {
      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.eventBookings.previous).toBe(0);
      expect(biz.eventBookings.percentageChange).toBeNull();
      expect(Number.isNaN(biz.eventBookings.percentageChange)).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 18: Winery Isolation
  // -----------------------------------------------------------------------
  describe('Scenario 18 — Winery Isolation', () => {
    test('Winery A data never appears in Winery B analytics', async () => {
      const date = new Date().toISOString();
      await supabase.from('bookings').insert([
        { user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 10, total_amount: 10000, booking_status: 'confirmed', payment_status: 'paid', booking_date: date.split('T')[0], created_at: date }
      ]);

      const bizB = await analyticsService.getBusinessAnalytics(TEST_WINERY_B, 7);
      expect(bizB.eventBookings.current).toBe(0);
      expect(bizB.eventGrossBookingValue.current).toBe(0);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 19: Recommendation Deduplication
  // -----------------------------------------------------------------------
  describe('Scenario 19 — Recommendation Deduplication', () => {
    test('same metric, rule, and week context does not create duplicate recommendation', async () => {
      const currentDate = new Date().toISOString();
      const prevDate = new Date(Date.now() - 10 * 86400 * 1000).toISOString();

      // Current period: 10 bookings
      for (let i = 0; i < 10; i++) {
        await supabase.from('bookings').insert([{ user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 2, total_amount: 2000, booking_status: 'confirmed', payment_status: 'paid', booking_date: currentDate.split('T')[0], created_at: currentDate }]);
      }
      // Previous period: 2 bookings
      for (let i = 0; i < 2; i++) {
        await supabase.from('bookings').insert([{ user_id: TEST_USER, winery_id: TEST_WINERY_A, event_id: TEST_EVENT_A, guests: 2, total_amount: 2000, booking_status: 'confirmed', payment_status: 'paid', booking_date: prevDate.split('T')[0], created_at: prevDate }]);
      }

      // First run
      const res1 = await RecommendationService.processBusinessInsights(TEST_WINERY_A);
      const created1 = res1.filter((r: any) => r.status === 'recommendation_created');
      expect(created1.length).toBeGreaterThanOrEqual(1);

      // Second run
      const res2 = await RecommendationService.processBusinessInsights(TEST_WINERY_A);
      const created2 = res2.filter((r: any) => r.status === 'recommendation_created');
      const dups2 = res2.filter((r: any) => r.status === 'duplicate_ignored');

      expect(created2.length).toBe(0);
      expect(dups2.length).toBeGreaterThanOrEqual(1);

      await supabase.from('bookings').delete().eq('winery_id', TEST_WINERY_A);
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 20: LLM Fallback
  // -----------------------------------------------------------------------
  describe('Scenario 20 — LLM Fallback', () => {
    test('LLM fallback text contains exact evidence values, no raw SQL or fake numbers', async () => {
      const insight: any = InsightEngine.detectTrend('event', TEST_WINERY_A, 'event_bookings', 50, 20, { current: 'C', comparison: 'P' });
      const recText = InsightEngine.generateRecommendation(insight.rule_id);
      const explanation = await RecommendationService.generateLLMExplanation(insight, recText);

      expect(explanation).toContain('event_bookings');
      expect(explanation).toContain('150%');
      expect(explanation).not.toContain('SELECT');
      expect(explanation).not.toContain('public.bookings');
    });
  });

  // -----------------------------------------------------------------------
  // Scenario 21: Complete Pipeline Trace
  // -----------------------------------------------------------------------
  describe('Scenario 21 — Complete Pipeline Trace', () => {
    test('traces bookings -> metric aggregation -> comparison -> trend -> recommendation', async () => {
      const currentDate = new Date().toISOString();
      const prevDate = new Date(Date.now() - 10 * 86400 * 1000).toISOString();

      for (let i = 0; i < 15; i++) {
        await supabase.from('corporate_leads').insert([{ winery_id: TEST_WINERY_A, company_name: `Corp ${i}`, status: 'pending', expected_guests: 20, created_at: currentDate }]);
      }
      for (let i = 0; i < 3; i++) {
        await supabase.from('corporate_leads').insert([{ winery_id: TEST_WINERY_A, company_name: `Old Corp ${i}`, status: 'pending', expected_guests: 20, created_at: prevDate }]);
      }

      // 2. Business Analytics Aggregation
      const biz = await analyticsService.getBusinessAnalytics(TEST_WINERY_A, 7);
      expect(biz.corporateInquiries.current).toBe(15);
      expect(biz.corporateInquiries.previous).toBe(3);
      expect(biz.corporateInquiries.absoluteChange).toBe(12);
      expect(biz.corporateInquiries.percentageChange).toBe(400);

      // 3. Recommendation Pipeline
      const results = await RecommendationService.processBusinessInsights(TEST_WINERY_A);
      const corpRec = results.find((r: any) => r.data?.rule_id === 'RISING_CORPORATE_INQUIRIES');
      expect(corpRec).toBeDefined();
      expect(corpRec.data.recommendation_text).toContain('Corporate inquiries increased');

      await supabase.from('corporate_leads').delete().eq('winery_id', TEST_WINERY_A);
    });
  });
});
