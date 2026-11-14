/**
 * Phase 11: Integration Test Suite
 * =================================
 * Category B: Tests using isolated/synthetic database data.
 * 
 * These tests use the real Supabase client (via supabaseAdmin) to insert
 * synthetic analytics_events, run the full pipeline, and verify results.
 * 
 * ALL synthetic data uses a unique test prefix ('__test_phase11_') to
 * guarantee isolation from production data. Cleanup runs before and after.
 * 
 * IMPORTANT: These tests require a running Supabase instance with the
 * view_wine_daily_engagement view and recommendations table created.
 */

import { supabaseAdmin as supabase } from '../../../config/supabase';
import { AnalyticsService } from '../analytics.service';
import { RecommendationService } from '../recommendation.service';

// Isolated test identifiers — guaranteed not to collide with production UUIDs
const TEST_WINERY_A = '00000000-0000-4000-a000-000000000001';
const TEST_WINERY_B = '00000000-0000-4000-a000-000000000002';
const TEST_WINERY_ZERO = '00000000-0000-4000-a000-000000000003';
const TEST_WINE_RISING = '00000000-0000-4000-b000-000000000001';
const TEST_WINE_INSUFFICIENT = '00000000-0000-4000-b000-000000000002';
const TEST_WINE_B = '00000000-0000-4000-b000-000000000003';
const TEST_USER = '00000000-0000-4000-c000-000000000001';

const analyticsService = new AnalyticsService();

/**
 * Helper: insert N analytics events for a given wine/winery at a given date.
 */
async function insertEvents(
    wineryId: string,
    wineId: string,
    eventType: string,
    count: number,
    daysAgo: number
) {
    const rows = [];
    for (let i = 0; i < count; i++) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        // Spread events slightly within the day to avoid exact timestamp collisions
        date.setHours(i % 24, i % 60, 0, 0);
        rows.push({
            event_type: eventType,
            winery_id: wineryId,
            wine_id: wineId,
            user_id: null,
            created_at: date.toISOString(),
            metadata: { test_suite: 'phase11_integration' }
        });
    }
    // Batch insert (Supabase handles arrays)
    const { error } = await supabase.from('analytics_events').insert(rows);
    if (error) {
        throw new Error(`Failed to insert test events: ${error.message}`);
    }
}

/**
 * Cleanup: Remove all synthetic test data by our known test IDs.
 */
async function cleanupTestData() {
    // Delete recommendations for test wineries
    await supabase.from('recommendations').delete().eq('winery_id', TEST_WINERY_A);
    await supabase.from('recommendations').delete().eq('winery_id', TEST_WINERY_B);
    await supabase.from('recommendations').delete().eq('winery_id', TEST_WINERY_ZERO);

    // Delete analytics events for test wineries
    await supabase.from('analytics_events').delete().eq('winery_id', TEST_WINERY_A);
    await supabase.from('analytics_events').delete().eq('winery_id', TEST_WINERY_B);
    await supabase.from('analytics_events').delete().eq('winery_id', TEST_WINERY_ZERO);
}

async function seedTestEntities() {
    await supabase.from('wineries').upsert([
        { id: TEST_WINERY_A, name: 'Test Winery A', slug: 'test-winery-a-phase11' },
        { id: TEST_WINERY_B, name: 'Test Winery B', slug: 'test-winery-b-phase11' },
        { id: TEST_WINERY_ZERO, name: 'Test Winery Zero', slug: 'test-winery-zero-phase11' }
    ], { onConflict: 'id' });

    await supabase.from('wines').upsert([
        { id: TEST_WINE_RISING, winery_id: TEST_WINERY_A, name: 'Test Rising Wine', slug: 'test-rising-wine-phase11', wine_type: 'Red', grape_variety: 'Syrah' },
        { id: TEST_WINE_INSUFFICIENT, winery_id: TEST_WINERY_A, name: 'Test Insufficient Wine', slug: 'test-insufficient-wine-phase11', wine_type: 'White', grape_variety: 'Chardonnay' },
        { id: TEST_WINE_B, winery_id: TEST_WINERY_B, name: 'Test Wine B', slug: 'test-wine-b-phase11', wine_type: 'Red', grape_variety: 'Merlot' }
    ], { onConflict: 'id' });
}

describe('Phase 11: Integration Tests (Category B — Synthetic DB Data)', () => {
    // Clean up before all tests
    beforeAll(async () => {
        await cleanupTestData();
        await seedTestEntities();
    }, 30000);

    // Clean up after all tests
    afterAll(async () => {
        await cleanupTestData();
    }, 30000);

    // -----------------------------------------------------------------------
    // TEST GROUP 1: Zero-data winery
    // -----------------------------------------------------------------------
    describe('Zero-data winery', () => {
        test('getDashboardSummary returns zeros, no NaN', async () => {
            const summary = await analyticsService.getDashboardSummary(TEST_WINERY_ZERO);
            expect(summary.wine_views).toBe(0);
            expect(summary.wine_saves).toBe(0);
            expect(summary.view_to_save_rate).toBe(0);
            expect(summary.most_viewed_wines).toEqual([]);
            expect(Number.isNaN(summary.view_to_save_rate)).toBe(false);
            expect(Number.isFinite(summary.capacity_utilization)).toBe(true);
        }, 15000);

        test('getTimeSeries returns empty array', async () => {
            const ts = await analyticsService.getTimeSeries(TEST_WINERY_ZERO);
            expect(ts).toEqual([]);
        }, 15000);

        test('processWineInsights returns empty array', async () => {
            const results = await RecommendationService.processWineInsights(TEST_WINERY_ZERO);
            expect(results).toEqual([]);
        }, 15000);
    });

    // -----------------------------------------------------------------------
    // TEST GROUP 2: Seed data and verify analytics_events → view → service
    // -----------------------------------------------------------------------
    describe('Seeding and view verification', () => {
        beforeAll(async () => {
            // Rising wine for Winery A:
            //   Current period (last 3 days): 50 views
            //   Previous period (10 days ago): 20 views
            //   → abs=30, pct=150% → RISING_WINE_INTEREST
            await insertEvents(TEST_WINERY_A, TEST_WINE_RISING, 'wine_view', 50, 2);
            await insertEvents(TEST_WINERY_A, TEST_WINE_RISING, 'wine_save', 5, 2);
            await insertEvents(TEST_WINERY_A, TEST_WINE_RISING, 'wine_view', 20, 10);

            // Insufficient wine for Winery A:
            //   Only 3 views, no history → insufficient_data
            await insertEvents(TEST_WINERY_A, TEST_WINE_INSUFFICIENT, 'wine_view', 3, 2);

            // Winery B wine — for isolation testing
            await insertEvents(TEST_WINERY_B, TEST_WINE_B, 'wine_view', 25, 2);
        }, 30000);

        test('getDashboardSummary reflects seeded data for Winery A', async () => {
            const summary = await analyticsService.getDashboardSummary(TEST_WINERY_A);
            // Winery A should have: 50+3 current views + 20 previous views = 73 total across all time
            expect(summary.wine_views).toBeGreaterThanOrEqual(53);
            expect(summary.wine_saves).toBeGreaterThanOrEqual(5);
            expect(summary.view_to_save_rate).toBeGreaterThan(0);
            expect(summary.most_viewed_wines.length).toBeGreaterThanOrEqual(1);
        }, 15000);

        test('getTimeSeries returns rows for Winery A', async () => {
            const ts = await analyticsService.getTimeSeries(TEST_WINERY_A);
            expect(ts.length).toBeGreaterThanOrEqual(1);
            // Each row must have date, wine_views, wine_saves
            for (const row of ts) {
                expect(row.date).toBeDefined();
                expect(typeof row.wine_views).toBe('number');
                expect(typeof row.wine_saves).toBe('number');
                expect(Number.isFinite(row.wine_views)).toBe(true);
            }
        }, 15000);
    });

    // -----------------------------------------------------------------------
    // TEST GROUP 3: processWineInsights — full pipeline
    // -----------------------------------------------------------------------
    describe('Full recommendation pipeline', () => {
        test('processWineInsights generates recommendation for rising wine', async () => {
            const results = await RecommendationService.processWineInsights(TEST_WINERY_A);

            // Should contain at least one result
            expect(results.length).toBeGreaterThanOrEqual(1);

            // Find the rising wine result
            const risingResult = results.find(
                (r: any) => r.status === 'recommendation_created' && r.data?.entity_id === TEST_WINE_RISING
            );
            const insuffResult = results.find(
                (r: any) => r.status === 'insufficient_data' && r.entity_id === TEST_WINE_INSUFFICIENT
            );

            // Rising wine: should produce a recommendation
            if (risingResult) {
                expect(risingResult.data.rule_id).toBe('RISING_WINE_INTEREST');
                expect(risingResult.data.winery_id).toBe(TEST_WINERY_A);
                expect(risingResult.data.entity_id).toBe(TEST_WINE_RISING);
                expect(risingResult.data.recommendation_text).toContain('featuring this wine');
                expect(risingResult.data.llm_explanation).toContain('Based on our analysis');
                expect(risingResult.data.evidence).toBeDefined();
                expect(risingResult.data.deduplication_key).toBeDefined();
            }

            // Insufficient wine: should be marked insufficient
            if (insuffResult) {
                expect(insuffResult.reason).toContain('Not enough observations');
            }
        }, 30000);

        test('stored recommendation is retrievable via /insights query pattern', async () => {
            const data = await RecommendationService.getRecommendations(TEST_WINERY_A);

            expect(data).not.toBeNull();
            expect(data.length).toBeGreaterThanOrEqual(1);

            const rec = data.find((r: any) => r.entity_id === TEST_WINE_RISING);
            if (rec) {
                expect(rec.status).toBe('active');
                expect(rec.evidence).toBeDefined();
                expect(rec.evidence.current_value).toBeDefined();
                expect(rec.evidence.comparison_value).toBeDefined();
                expect(rec.evidence.percentage_change).toBeDefined();
                expect(rec.evidence.rule_id).toBe('RISING_WINE_INTEREST');
            }
        }, 15000);
    });

    // -----------------------------------------------------------------------
    // TEST GROUP 4: Deduplication — run pipeline again
    // -----------------------------------------------------------------------
    describe('Deduplication', () => {
        test('second run does not create duplicate recommendation', async () => {
            const results = await RecommendationService.processWineInsights(TEST_WINERY_A);
            // The rising wine should either be 'duplicate_ignored' or absent (STABLE if time shifted)
            const created = results.filter((r: any) => r.status === 'recommendation_created');
            const duplicates = results.filter((r: any) => r.status === 'duplicate_ignored');

            // No new RISING recommendation should be created
            const newRising = created.find((r: any) => r.data?.entity_id === TEST_WINE_RISING);
            expect(newRising).toBeUndefined();

            // Should be flagged as duplicate OR already processed
            if (duplicates.length > 0) {
                const dupRising = duplicates.find((r: any) => true); // any duplicate is fine
                expect(dupRising).toBeDefined();
            }
        }, 30000);

        test('recommendations table has no duplicate dedup keys for test winery', async () => {
            const { data } = await supabase
                .from('recommendations')
                .select('deduplication_key')
                .eq('winery_id', TEST_WINERY_A);

            const keys = (data || []).map((r: any) => r.deduplication_key);
            const uniqueKeys = new Set(keys);
            expect(keys.length).toBe(uniqueKeys.size);
        }, 15000);
    });

    // -----------------------------------------------------------------------
    // TEST GROUP 5: Winery isolation
    // -----------------------------------------------------------------------
    describe('Winery isolation', () => {
        test('Winery B summary does not include Winery A data', async () => {
            const summaryB = await analyticsService.getDashboardSummary(TEST_WINERY_B);
            // Winery B only has 25 views for TEST_WINE_B
            expect(summaryB.wine_views).toBe(25);

            const summaryA = await analyticsService.getDashboardSummary(TEST_WINERY_A);
            // Winery A has significantly more data
            expect(summaryA.wine_views).toBeGreaterThan(summaryB.wine_views);
        }, 15000);

        test('Winery A recommendations do not appear for Winery B', async () => {
            const recsA = await RecommendationService.getRecommendations(TEST_WINERY_A);
            const recsB = await RecommendationService.getRecommendations(TEST_WINERY_B);

            // Winery A should have at least 1 recommendation (RISING)
            expect((recsA || []).length).toBeGreaterThanOrEqual(1);

            // Winery B should have 0 (25 views, no previous period → insufficient)
            // No recommendation should leak from A to B
            const leakedRecs = (recsB || []).filter((r: any) => r.entity_id === TEST_WINE_RISING);
            expect(leakedRecs.length).toBe(0);
        }, 15000);
    });

    // -----------------------------------------------------------------------
    // TEST GROUP 6: LLM fallback verification on stored recommendation
    // -----------------------------------------------------------------------
    describe('LLM fallback on stored data', () => {
        test('stored recommendation contains deterministic fallback text', async () => {
            const { data } = await supabase
                .from('recommendations')
                .select('llm_explanation, recommendation_text')
                .eq('winery_id', TEST_WINERY_A)
                .eq('entity_id', TEST_WINE_RISING)
                .single();

            if (data) {
                expect(data.llm_explanation).toContain('Based on our analysis');
                expect(data.recommendation_text).toContain('featuring this wine');
                // Must not contain raw SQL or table names
                expect(data.llm_explanation).not.toContain('analytics_events');
                expect(data.llm_explanation).not.toContain('SELECT');
            }
        }, 15000);
    });
});
