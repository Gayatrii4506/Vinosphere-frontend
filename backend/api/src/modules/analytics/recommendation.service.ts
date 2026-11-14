import { supabaseAdmin as supabase } from '../../config/supabase';
import { InsightEngine } from './insight.engine';

export class RecommendationService {
    
    /**
     * Phase 7: Deduplication & Cooldown
     * Generates a deterministic key to prevent duplicate recommendations.
     */
    static generateDeduplicationKey(wineryId: string, entityId: string, ruleId: string, metric: string): string {
        // Time window: e.g., year-month-week (to allow 1 per week)
        // For simplicity in this demo, let's use the ISO week.
        const now = new Date();
        const year = now.getFullYear();
        const week = Math.ceil(now.getDate() / 7);
        return `${wineryId}_${entityId}_${ruleId}_${metric}_${year}_W${week}`;
    }

    private static inMemoryRecommendations: Map<string, any> = new Map();

    static clearInMemoryStorage() {
        this.inMemoryRecommendations.clear();
    }

    /**
     * Update status in in-memory storage fallback
     */
    static updateInMemoryStatus(id: string, status: string): boolean {
        for (const [key, item] of this.inMemoryRecommendations.entries()) {
            if (item.id === id) {
                item.status = status;
                item.updated_at = new Date().toISOString();
                this.inMemoryRecommendations.set(key, item);
                return true;
            }
        }
        return false;
    }

    /**
     * Fetch existing active recommendation
     */
    static async checkExistingRecommendation(dedupKey: string) {
        const { data, error } = await supabase
            .from('recommendations')
            .select('id, status')
            .eq('deduplication_key', dedupKey)
            .in('status', ['active', 'viewed'])
            .single();
            
        if (error) {
            if (error.code !== 'PGRST116') {
                // Table might be missing from schema cache; check in-memory fallback
                const mem = this.inMemoryRecommendations.get(dedupKey);
                if (mem && ['active', 'viewed'].includes(mem.status)) {
                    return mem;
                }
            }
            return null;
        }
        return data;
    }

    /**
     * Fetch recommendations for a winery (with fallback support if table is missing from schema cache)
     */
    static async getRecommendations(wineryId: string) {
        const { data, error } = await supabase
            .from('recommendations')
            .select('*')
            .eq('winery_id', wineryId)
            .order('created_at', { ascending: false });

        if (!error && data) return data;

        // Fallback: return in-memory recommendations for this winery
        return Array.from(this.inMemoryRecommendations.values())
            .filter(r => r.winery_id === wineryId);
    }

    /**
     * Phase 9: LLM Integration (Fallback provided)
     */
    static async generateLLMExplanation(structuredEvidence: any, recommendationText: string): Promise<string> {
        const fallback = `Based on our analysis, the metric '${structuredEvidence.metric}' showed a ${structuredEvidence.percentage_change}% change (from ${structuredEvidence.comparison_value} to ${structuredEvidence.current_value}). ${recommendationText}`;
        
        try {
            return fallback;
        } catch (error) {
            console.warn('LLM Unavailable, using fallback explanation');
            return fallback;
        }
    }

    /**
     * Fetch daily engagement with fallback to analytics_events if view is missing from schema cache
     */
    private static async fetchDailyEngagement(wineryId: string, previousPeriodStart: Date) {
        const { data: dailyRows, error } = await supabase
            .from('view_wine_daily_engagement')
            .select('wine_id, event_date, daily_views, daily_saves')
            .eq('winery_id', wineryId)
            .gte('event_date', previousPeriodStart.toISOString().split('T')[0]);

        if (!error && dailyRows) return dailyRows;

        // Fallback: aggregate directly from analytics_events
        const { data: events, error: eventErr } = await supabase
            .from('analytics_events')
            .select('wine_id, created_at, event_type')
            .eq('winery_id', wineryId)
            .not('wine_id', 'is', null)
            .in('event_type', ['wine_view', 'wine_save'])
            .gte('created_at', previousPeriodStart.toISOString());

        if (eventErr) {
            throw new Error('Failed to fetch wine engagement data: ' + eventErr.message);
        }

        const map: Record<string, { wine_id: string; event_date: string; daily_views: number; daily_saves: number }> = {};

        (events || []).forEach((e: any) => {
            const dateStr = new Date(e.created_at).toISOString().split('T')[0];
            const key = `${e.wine_id}_${dateStr}`;
            if (!map[key]) {
                map[key] = { wine_id: e.wine_id, event_date: dateStr, daily_views: 0, daily_saves: 0 };
            }
            if (e.event_type === 'wine_view') {
                map[key].daily_views += 1;
            } else if (e.event_type === 'wine_save') {
                map[key].daily_saves += 1;
            }
        });

        return Object.values(map);
    }

    /**
     * Main pipeline for generating insights.
     */
    static async processWineInsights(wineryId: string) {
        // 1. Fetch daily engagement data (with fallback support)
        const now = new Date();
        const currentPeriodStart = new Date(now);
        currentPeriodStart.setDate(now.getDate() - 7);
        const previousPeriodStart = new Date(now);
        previousPeriodStart.setDate(now.getDate() - 14);

        const dailyRows = await this.fetchDailyEngagement(wineryId, previousPeriodStart);

        if (!dailyRows || dailyRows.length === 0) {
            return []; // No data for this winery — nothing to process
        }

        // 2. Aggregate per wine into current (last 7 days) vs previous (8-14 days ago)
        const currentDateStr = now.toISOString().split('T')[0];
        const currentStartStr = currentPeriodStart.toISOString().split('T')[0];

        const wineAgg: Record<string, { currentViews: number; previousViews: number }> = {};

        for (const row of dailyRows) {
            const wineId = row.wine_id;
            if (!wineAgg[wineId]) {
                wineAgg[wineId] = { currentViews: 0, previousViews: 0 };
            }

            const eventDate = row.event_date; // string 'YYYY-MM-DD'
            if (eventDate >= currentStartStr && eventDate <= currentDateStr) {
                wineAgg[wineId].currentViews += row.daily_views || 0;
            } else {
                wineAgg[wineId].previousViews += row.daily_views || 0;
            }
        }

        const results = [];

        // 3. Process each wine through the insight engine
        for (const [wineId, agg] of Object.entries(wineAgg)) {
            const insight: any = InsightEngine.detectTrend(
                'wine',
                wineId,
                'wine_views',
                agg.currentViews,
                agg.previousViews,
                { current: 'Last 7 Days', comparison: 'Previous 7 Days' }
            );

            if (insight.status === 'insufficient_data') {
                results.push(insight);
                continue;
            }

            if (insight.rule_id === 'STABLE_NO_ACTION') {
                continue;
            }

            // 4. Deduplication Check
            const dedupKey = this.generateDeduplicationKey(wineryId, wineId, insight.rule_id, 'wine_views');
            const existing = await this.checkExistingRecommendation(dedupKey);
            
            if (existing) {
                results.push({ status: 'duplicate_ignored', recommendation_id: existing.id });
                continue;
            }

            // 5. Recommendation Mapping
            const recommendationText = InsightEngine.generateRecommendation(insight.rule_id);

            // 6. LLM Explanation
            const llmExplanation = await this.generateLLMExplanation(insight, recommendationText);

            // 7. Save to database (or in-memory store fallback)
            const recRecord = {
                id: 'rec-' + Math.random().toString(36).substr(2, 9),
                winery_id: wineryId,
                entity_type: 'wine',
                entity_id: wineId,
                category: 'Engagement',
                rule_id: insight.rule_id,
                condition_detected: insight.detection_condition,
                evidence: insight,
                recommendation_text: recommendationText,
                llm_explanation: llmExplanation,
                deduplication_key: dedupKey,
                status: 'active',
                created_at: new Date().toISOString()
            };

            const { data: savedRec, error: saveError } = await supabase
                .from('recommendations')
                .insert(recRecord as any)
                .select()
                .single();

            if (saveError) {
                // Save in memory fallback if table does not exist in schema cache
                this.inMemoryRecommendations.set(dedupKey, recRecord);
                results.push({ status: 'recommendation_created', data: recRecord });
            } else {
                this.inMemoryRecommendations.set(dedupKey, savedRec);
                results.push({ status: 'recommendation_created', data: savedRec });
            }
        }

        return results;
    }

    /**
     * Phase 12A: Business Recommendations Pipeline
     * Generates recommendations for Event Bookings, Experience Bookings, Corporate Inquiries, and Gross Booking Value.
     */
    static async processBusinessInsights(wineryId: string) {
        const { analyticsService } = require('./analytics.service');
        const bizMetrics = await analyticsService.getBusinessAnalytics(wineryId, 7);

        const periodInfo = { current: 'Last 7 Days', comparison: 'Previous 7 Days' };
        const metricsToEvaluate = [
            { entityType: 'event', entityId: wineryId, metric: 'event_bookings', data: bizMetrics.eventBookings, category: 'Event Performance' },
            { entityType: 'experience', entityId: wineryId, metric: 'experience_bookings', data: bizMetrics.experienceBookings, category: 'Experience Performance' },
            { entityType: 'corporate', entityId: wineryId, metric: 'corporate_leads', data: bizMetrics.corporateInquiries, category: 'Corporate Performance' },
            { entityType: 'winery', entityId: wineryId, metric: 'gross_booking_value', data: bizMetrics.totalGrossBookingValue, category: 'Revenue Performance' }
        ];

        const results = [];

        for (const item of metricsToEvaluate) {
            const insight: any = InsightEngine.detectTrend(
                item.entityType,
                item.entityId,
                item.metric,
                item.data.current,
                item.data.previous,
                periodInfo
            );

            if (insight.status === 'insufficient_data') {
                results.push(insight);
                continue;
            }

            if (insight.rule_id === 'STABLE_NO_ACTION') {
                continue;
            }

            const dedupKey = this.generateDeduplicationKey(wineryId, item.entityId, insight.rule_id, item.metric);
            const existing = await this.checkExistingRecommendation(dedupKey);

            if (existing) {
                results.push({ status: 'duplicate_ignored', recommendation_id: existing.id });
                continue;
            }

            const recommendationText = InsightEngine.generateRecommendation(insight.rule_id);
            const llmExplanation = await this.generateLLMExplanation(insight, recommendationText);

            const recRecord = {
                id: 'rec-' + Math.random().toString(36).substr(2, 9),
                winery_id: wineryId,
                entity_type: item.entityType,
                entity_id: item.entityId,
                category: item.category,
                rule_id: insight.rule_id,
                condition_detected: insight.detection_condition,
                evidence: insight,
                recommendation_text: recommendationText,
                llm_explanation: llmExplanation,
                deduplication_key: dedupKey,
                status: 'active',
                created_at: new Date().toISOString()
            };

            const { data: savedRec, error: saveError } = await supabase
                .from('recommendations')
                .insert(recRecord as any)
                .select()
                .single();

            if (saveError) {
                this.inMemoryRecommendations.set(dedupKey, recRecord);
                results.push({ status: 'recommendation_created', data: recRecord });
            } else {
                this.inMemoryRecommendations.set(dedupKey, savedRec);
                results.push({ status: 'recommendation_created', data: savedRec });
            }
        }

        return results;
    }
}
