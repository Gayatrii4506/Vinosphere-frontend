/**
 * Phase 11: Controlled Scenario Evaluation
 * =========================================
 * Isolated synthetic test suite for the VinoSphere Analytics Engine.
 * 
 * Tests are purely unit/integration tests against the deterministic logic
 * in InsightEngine and RecommendationService. No production data is touched.
 * 
 * All database-dependent tests mock Supabase entirely.
 */

import { InsightEngine, DataSufficiencyStatus } from '../insight.engine';
import { RecommendationService } from '../recommendation.service';

// ---------------------------------------------------------------------------
// SCENARIO 1: New / Insufficient Data — wine_views below threshold
// ---------------------------------------------------------------------------
describe('Scenario 1: Insufficient Data (wine_views below minimum)', () => {
    test('3 views, 0 saves, no history → insufficient_data', () => {
        const result = InsightEngine.checkSufficiency(
            'wine-new-001', 'wine_views', 3, 0
        );
        expect(result.status).toBe('insufficient_data');
        expect(result.observations).toBe(3);
        expect(result.reason).toContain('Not enough observations');
    });

    test('detectTrend returns insufficient_data without fabricating percentage', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-new-001', 'wine_views', 3, 0,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as DataSufficiencyStatus;

        expect(result.status).toBe('insufficient_data');
        // Must NOT contain percentage_change or detection_condition
        expect((result as any).percentage_change).toBeUndefined();
        expect((result as any).detection_condition).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 2: Zero Data — completely empty winery
// ---------------------------------------------------------------------------
describe('Scenario 2: Zero Data (no events at all)', () => {
    test('0 views, 0 history → insufficient_data, no NaN or Infinity', () => {
        const result = InsightEngine.checkSufficiency(
            'wine-zero-001', 'wine_views', 0, 0
        );
        expect(result.status).toBe('insufficient_data');
        expect(result.observations).toBe(0);
        expect(Number.isNaN(result.observations)).toBe(false);
        expect(Number.isFinite(result.observations)).toBe(true);
    });

    test('detectTrend with 0 current and 0 comparison → insufficient_data', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-zero-001', 'wine_views', 0, 0,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as DataSufficiencyStatus;

        expect(result.status).toBe('insufficient_data');
    });

    test('view_to_save_rate with 0 views (denominator) → insufficient_data, no division by zero', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-zero-002', 'view_to_save_rate', 5, 0,
            { current: 'saves', comparison: 'views' }
        ) as any;

        expect(result.status).toBe('insufficient_data');
        expect(result.reason).toContain('Denominator');
        // Must not produce NaN or Infinity
        expect((result as any).percentage_change).toBeUndefined();
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 3: Stable Behaviour — meets threshold but no significant change
// ---------------------------------------------------------------------------
describe('Scenario 3: Stable Behaviour', () => {
    test('25 current views, 23 previous views → stable, no recommendation', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-stable-001', 'wine_views', 25, 23,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        expect(result.rule_id).toBe('STABLE_NO_ACTION');
        expect(result.detection_condition).toBe('stable');
        expect(result.current_value).toBe(25);
        expect(result.comparison_value).toBe(23);
    });

    test('generateRecommendation for STABLE_NO_ACTION returns no-action text', () => {
        const text = InsightEngine.generateRecommendation('STABLE_NO_ACTION');
        expect(text).toContain('No action recommended');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 4: Rising Interest — meets both percentage and absolute thresholds
// ---------------------------------------------------------------------------
describe('Scenario 4: Rising Interest', () => {
    test('33 current, 20 previous → RISING_WINE_INTEREST', () => {
        // absoluteChange = 13, percentageChange = 65%
        // Threshold: percentageChange >= 30 AND absoluteChange >= 15
        // 13 < 15 → should NOT trigger RISING
        const result = InsightEngine.detectTrend(
            'wine', 'wine-rise-001', 'wine_views', 33, 20,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        // BUG CHECK: absoluteChange is 13, which is < 15
        // So this should actually be STABLE_NO_ACTION, not RISING
        if (result.rule_id === 'RISING_WINE_INTEREST') {
            // This would be a logic bug
            expect(result.absolute_change).toBeGreaterThanOrEqual(15);
        } else {
            expect(result.rule_id).toBe('STABLE_NO_ACTION');
        }
    });

    test('50 current, 20 previous → genuine rising (abs=30, pct=150%)', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-rise-002', 'wine_views', 50, 20,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        expect(result.rule_id).toBe('RISING_WINE_INTEREST');
        expect(result.detection_condition).toBe('increasing engagement');
        expect(result.absolute_change).toBe(30);
        expect(result.percentage_change).toBe(150);
    });

    test('recommendation text for RISING_WINE_INTEREST is actionable', () => {
        const text = InsightEngine.generateRecommendation('RISING_WINE_INTEREST');
        expect(text).toContain('featuring this wine');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 5: Falling Interest — meets both percentage and absolute thresholds
// ---------------------------------------------------------------------------
describe('Scenario 5: Falling Interest', () => {
    test('20 current, 50 previous → FALLING_WINE_INTEREST (abs=-30, pct=-60%)', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-fall-001', 'wine_views', 20, 50,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        expect(result.rule_id).toBe('FALLING_WINE_INTEREST');
        expect(result.detection_condition).toBe('decreasing engagement');
        expect(result.absolute_change).toBe(-30);
        expect(result.percentage_change).toBe(-60);
    });

    test('recommendation text for FALLING_WINE_INTEREST is actionable', () => {
        const text = InsightEngine.generateRecommendation('FALLING_WINE_INTEREST');
        expect(text).toContain('Investigate');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 6: High Views / Low Saves
// ---------------------------------------------------------------------------
describe('Scenario 6: High Views / Low Saves', () => {
    test('1 save, 60 views → HIGH_VIEWS_LOW_SAVE_RATE', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-hvls-001', 'view_to_save_rate', 1, 60,
            { current: 'saves', comparison: 'views' }
        ) as any;

        expect(result.rule_id).toBe('HIGH_VIEWS_LOW_SAVE_RATE');
        expect(result.detection_condition).toBe('high interest but weak conversion');
    });

    test('2 saves, 60 views → NOT HIGH_VIEWS_LOW_SAVE_RATE (currentValue >= 2)', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-hvls-002', 'view_to_save_rate', 2, 60,
            { current: 'saves', comparison: 'views' }
        ) as any;

        // currentValue (2) is NOT < 2, so this should not trigger HIGH_VIEWS_LOW_SAVE_RATE
        expect(result.rule_id).not.toBe('HIGH_VIEWS_LOW_SAVE_RATE');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 7: High Saves / Low Views
// ---------------------------------------------------------------------------
describe('Scenario 7: High Saves / Low Views', () => {
    test('15 saves, 10 views → HIGH_SAVES_LOW_VIEWS', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-hslv-001', 'view_to_save_rate', 15, 10,
            { current: 'saves', comparison: 'views' }
        ) as any;

        expect(result.rule_id).toBe('HIGH_SAVES_LOW_VIEWS');
        expect(result.detection_condition).toBe('high saves low views');
    });

    test('10 saves, 20 views → NOT HIGH_SAVES_LOW_VIEWS (views >= 20)', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-hslv-002', 'view_to_save_rate', 10, 20,
            { current: 'saves', comparison: 'views' }
        ) as any;

        // comparisonValue (20) is NOT < 20, so this should not trigger HIGH_SAVES_LOW_VIEWS
        expect(result.rule_id).not.toBe('HIGH_SAVES_LOW_VIEWS');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 8: Threshold Boundary Cases
// ---------------------------------------------------------------------------
describe('Scenario 8: Threshold Boundary Cases', () => {
    // wine_views sufficiency boundary: minimum 20
    test('wine_views: exactly 19 observations → insufficient', () => {
        const result = InsightEngine.checkSufficiency('wine-boundary-001', 'wine_views', 19, 10);
        expect(result.status).toBe('insufficient_data');
    });

    test('wine_views: exactly 20 observations → sufficient', () => {
        const result = InsightEngine.checkSufficiency('wine-boundary-002', 'wine_views', 20, 10);
        expect(result.status).toBe('sufficient');
    });

    // wine_saves sufficiency boundary: minimum 5
    test('wine_saves: exactly 4 observations → insufficient', () => {
        const result = InsightEngine.checkSufficiency('wine-boundary-003', 'wine_saves', 4, 0);
        expect(result.status).toBe('insufficient_data');
    });

    test('wine_saves: exactly 5 observations → sufficient', () => {
        const result = InsightEngine.checkSufficiency('wine-boundary-004', 'wine_saves', 5, 0);
        expect(result.status).toBe('sufficient');
    });

    // event_views sufficiency boundary: minimum 15
    test('event_views: exactly 14 → insufficient', () => {
        const result = InsightEngine.checkSufficiency('event-boundary-001', 'event_views', 14, 0);
        expect(result.status).toBe('insufficient_data');
    });

    test('event_views: exactly 15 → sufficient', () => {
        const result = InsightEngine.checkSufficiency('event-boundary-002', 'event_views', 15, 0);
        expect(result.status).toBe('sufficient');
    });

    // event_bookings sufficiency boundary: minimum 2
    test('event_bookings: exactly 1 → insufficient', () => {
        const result = InsightEngine.checkSufficiency('event-boundary-003', 'event_bookings', 1, 0);
        expect(result.status).toBe('insufficient_data');
    });

    test('event_bookings: exactly 2 → sufficient', () => {
        const result = InsightEngine.checkSufficiency('event-boundary-004', 'event_bookings', 2, 0);
        expect(result.status).toBe('sufficient');
    });

    // Rising interest boundary: percentageChange >= 30% AND absoluteChange >= 15
    test('wine_views: exactly 30% growth but absoluteChange=14 → STABLE (below abs threshold)', () => {
        // Need: absoluteChange=14, percentageChange=30%
        // If comparison = 46.67, current = 60.67 → messy. 
        // Let's use comparison=47, current=61 → abs=14, pct=29.8% → both fail
        // Better: comparison=100, current=130 → abs=30, pct=30% → both pass
        // To test the exact boundary where abs fails: comparison=47, current=61 → abs=14, pct≈29.8%
        // Let's just directly test: current=34, comparison=20 → abs=14, pct=70%
        const result = InsightEngine.detectTrend(
            'wine', 'wine-boundary-005', 'wine_views', 34, 20,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;
        // absoluteChange = 14, which is < 15 threshold
        expect(result.rule_id).toBe('STABLE_NO_ACTION');
    });

    test('wine_views: absoluteChange=15 but percentageChange=29% → STABLE (below pct threshold)', () => {
        // comparison=52, current=67 → abs=15, pct=28.8%
        const result = InsightEngine.detectTrend(
            'wine', 'wine-boundary-006', 'wine_views', 67, 52,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;
        expect(result.rule_id).toBe('STABLE_NO_ACTION');
    });

    test('wine_views: exactly abs=15 and pct=30% → RISING', () => {
        // comparison=50, current=65 → abs=15, pct=30%
        const result = InsightEngine.detectTrend(
            'wine', 'wine-boundary-007', 'wine_views', 65, 50,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;
        expect(result.rule_id).toBe('RISING_WINE_INTEREST');
    });

    // Falling interest boundary: percentageChange <= -30% AND absoluteChange <= -15
    test('wine_views: exactly abs=-15 and pct=-30% → FALLING', () => {
        // comparison=50, current=35 → abs=-15, pct=-30%
        const result = InsightEngine.detectTrend(
            'wine', 'wine-boundary-008', 'wine_views', 35, 50,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;
        expect(result.rule_id).toBe('FALLING_WINE_INTEREST');
    });

    test('wine_views history required: 20 current but 0 history → insufficient', () => {
        const result = InsightEngine.checkSufficiency('wine-boundary-009', 'wine_views', 20, 0);
        expect(result.status).toBe('insufficient_data');
        expect(result.reason).toContain('No historical comparison data');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 9: Event Performance (view_to_save_rate edge cases)
// ---------------------------------------------------------------------------
describe('Scenario 9: Event / Save Rate Edge Cases', () => {
    test('view_to_save_rate: exactly views=50, saves=1 → NOT triggered (views must be > 50)', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-evt-001', 'view_to_save_rate', 1, 50,
            { current: 'saves', comparison: 'views' }
        ) as any;
        // condition: comparisonValue > 50, so 50 should NOT trigger
        expect(result.rule_id).not.toBe('HIGH_VIEWS_LOW_SAVE_RATE');
    });

    test('view_to_save_rate: views=51, saves=1 → HIGH_VIEWS_LOW_SAVE_RATE', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-evt-002', 'view_to_save_rate', 1, 51,
            { current: 'saves', comparison: 'views' }
        ) as any;
        expect(result.rule_id).toBe('HIGH_VIEWS_LOW_SAVE_RATE');
    });

    test('view_to_save_rate: saves=9, views=19 → NOT HIGH_SAVES_LOW_VIEWS (saves must be >= 10)', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-evt-003', 'view_to_save_rate', 9, 19,
            { current: 'saves', comparison: 'views' }
        ) as any;
        expect(result.rule_id).not.toBe('HIGH_SAVES_LOW_VIEWS');
    });

    test('view_to_save_rate: saves=10, views=19 → HIGH_SAVES_LOW_VIEWS', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-evt-004', 'view_to_save_rate', 10, 19,
            { current: 'saves', comparison: 'views' }
        ) as any;
        expect(result.rule_id).toBe('HIGH_SAVES_LOW_VIEWS');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 10: Duplicate Recommendations (deduplication key)
// ---------------------------------------------------------------------------
describe('Scenario 10: Recommendation Deduplication', () => {
    test('same winery+entity+rule+metric in same week → identical dedup key', () => {
        const key1 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        const key2 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        expect(key1).toBe(key2);
    });

    test('different wineries → different dedup key', () => {
        const key1 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        const key2 = RecommendationService.generateDeduplicationKey(
            'winery-B', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        expect(key1).not.toBe(key2);
    });

    test('different entities → different dedup key', () => {
        const key1 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        const key2 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-2', 'RISING_WINE_INTEREST', 'wine_views'
        );
        expect(key1).not.toBe(key2);
    });

    test('different rules → different dedup key', () => {
        const key1 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        const key2 = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'FALLING_WINE_INTEREST', 'wine_views'
        );
        expect(key1).not.toBe(key2);
    });

    test('dedup key contains week-level time component', () => {
        const key = RecommendationService.generateDeduplicationKey(
            'winery-A', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        expect(key).toMatch(/_W\d+$/);
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 11: Winery Isolation (deduplication key scoping)
// ---------------------------------------------------------------------------
describe('Scenario 11: Winery Isolation', () => {
    test('Winery A dedup key never matches Winery B', () => {
        const keyA = RecommendationService.generateDeduplicationKey(
            'winery-AAA', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        const keyB = RecommendationService.generateDeduplicationKey(
            'winery-BBB', 'wine-1', 'RISING_WINE_INTEREST', 'wine_views'
        );
        expect(keyA).not.toBe(keyB);
        expect(keyA).toContain('winery-AAA');
        expect(keyB).toContain('winery-BBB');
        expect(keyA).not.toContain('winery-BBB');
    });

    test('checkSufficiency is entity-scoped, not winery-scoped', () => {
        const resultA = InsightEngine.checkSufficiency('wine-A1', 'wine_views', 25, 10);
        const resultB = InsightEngine.checkSufficiency('wine-B1', 'wine_views', 5, 10);
        expect(resultA.status).toBe('sufficient');
        expect(resultB.status).toBe('insufficient_data');
        // Entity IDs are properly tracked
        expect(resultA.entity_id).toBe('wine-A1');
        expect(resultB.entity_id).toBe('wine-B1');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 12: LLM Fallback
// ---------------------------------------------------------------------------
describe('Scenario 12: LLM Fallback', () => {
    test('generateLLMExplanation returns deterministic fallback text', async () => {
        const evidence = {
            entity_id: 'wine-llm-001',
            metric: 'wine_views',
            percentage_change: 65,
            current_value: 33,
            comparison_value: 20,
            detection_condition: 'increasing engagement',
            rule_id: 'RISING_WINE_INTEREST',
            data_sufficiency: { status: 'sufficient', observations: 33 }
        };
        const recommendationText = 'Feature this wine in upcoming tasting events.';
        const text = await RecommendationService.generateLLMExplanation(evidence, recommendationText);

        expect(text).toContain('Based on our analysis');
        expect(text).toContain('wine_views');
        expect(text).toContain('65');  // percentage_change
        expect(text).toContain('33');  // current_value
        expect(text).toContain('20');  // comparison_value
        expect(text).toContain('Feature this wine');
    });

    test('fallback does not contain raw database table names or SQL', async () => {
        const evidence = {
            metric: 'wine_views',
            percentage_change: 50,
            current_value: 30,
            comparison_value: 20
        };
        const text = await RecommendationService.generateLLMExplanation(evidence, 'Test.');
        expect(text).not.toContain('analytics_events');
        expect(text).not.toContain('SELECT');
        expect(text).not.toContain('FROM');
        expect(text).not.toContain('supabase');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 13: Complete Pipeline — Manual Trace (33 views / 3 saves scenario)
// ---------------------------------------------------------------------------
describe('Scenario 13: Complete Pipeline Trace (unit-level)', () => {
    const wineId = 'wine-pipeline-001';
    const currentViews = 33;
    const previousViews = 20;
    const currentSaves = 3;
    const previousSaves = 1;

    test('Step 1: Sufficiency check passes for current views', () => {
        const result = InsightEngine.checkSufficiency(wineId, 'wine_views', currentViews, previousViews);
        expect(result.status).toBe('sufficient');
    });

    test('Step 2: Trend detection produces structured evidence', () => {
        const result = InsightEngine.detectTrend(
            'wine', wineId, 'wine_views', currentViews, previousViews,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        expect(result.entity_id).toBe(wineId);
        expect(result.metric).toBe('wine_views');
        expect(result.current_value).toBe(33);
        expect(result.comparison_value).toBe(20);
        expect(result.absolute_change).toBe(13);
        expect(result.percentage_change).toBe(65);
        expect(result.period).toEqual({ current: 'Last 7 Days', comparison: 'Previous 7 Days' });
        expect(result.data_sufficiency.status).toBe('sufficient');
        expect(result.generated_at).toBeDefined();
    });

    test('Step 3: Rule assignment — 65% but abs=13 < 15 → STABLE', () => {
        const result = InsightEngine.detectTrend(
            'wine', wineId, 'wine_views', currentViews, previousViews,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        // absoluteChange = 13, which fails the >= 15 threshold
        // So the rule should be STABLE_NO_ACTION, NOT RISING_WINE_INTEREST
        expect(result.rule_id).toBe('STABLE_NO_ACTION');
    });

    test('Step 4: Recommendation mapping for the detected rule', () => {
        const result = InsightEngine.detectTrend(
            'wine', wineId, 'wine_views', currentViews, previousViews,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        const recommendation = InsightEngine.generateRecommendation(result.rule_id);
        expect(recommendation).toBeDefined();
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
    });

    test('Step 5: LLM explanation works for the detected evidence', async () => {
        const result = InsightEngine.detectTrend(
            'wine', wineId, 'wine_views', currentViews, previousViews,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        const recommendation = InsightEngine.generateRecommendation(result.rule_id);
        const explanation = await RecommendationService.generateLLMExplanation(result, recommendation);
        expect(explanation).toContain('Based on our analysis');
        expect(explanation).toContain('33');
        expect(explanation).toContain('20');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 14: Unknown metric fallback
// ---------------------------------------------------------------------------
describe('Scenario 14: Unknown / Unmapped Metrics', () => {
    test('unknown metric uses default threshold (10)', () => {
        const result = InsightEngine.checkSufficiency('entity-1', 'unknown_metric', 9, 5);
        expect(result.status).toBe('insufficient_data');
    });

    test('unknown metric at 10 observations → sufficient', () => {
        const result = InsightEngine.checkSufficiency('entity-2', 'unknown_metric', 10, 5);
        expect(result.status).toBe('sufficient');
    });

    test('unknown rule_id → default recommendation text', () => {
        const text = InsightEngine.generateRecommendation('NONEXISTENT_RULE');
        expect(text).toContain('No action recommended');
    });
});

// ---------------------------------------------------------------------------
// SCENARIO 15: Percentage calculation edge cases
// ---------------------------------------------------------------------------
describe('Scenario 15: Percentage Calculation Edge Cases', () => {
    test('comparison=0 with sufficient current views → 100% change', () => {
        // wine_views requires history, so 0 comparison means insufficient
        // Use wine_saves which does NOT require history
        const result = InsightEngine.detectTrend(
            'wine', 'wine-pct-001', 'wine_saves', 10, 0,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        // wine_saves min is 5, current=10 passes
        // comparisonValue=0, so percentageChange defaults to 100
        expect(result.percentage_change).toBe(100);
        expect(Number.isFinite(result.percentage_change)).toBe(true);
    });

    test('very large percentage change is still finite', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-pct-002', 'wine_saves', 1000, 1,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        expect(Number.isFinite(result.percentage_change)).toBe(true);
        expect(result.percentage_change).toBe(99900);
    });

    test('negative change produces negative percentage', () => {
        const result = InsightEngine.detectTrend(
            'wine', 'wine-pct-003', 'wine_saves', 5, 10,
            { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
        ) as any;

        expect(result.percentage_change).toBe(-50);
        expect(result.absolute_change).toBe(-5);
    });
});
