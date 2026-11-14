-- Phase 3: Analytics Aggregation Views
-- These views provide real-time aggregation of behavioural events, replacing the need for complex cron-based syncs.

-- View: Wine Daily Engagement
-- Provides daily grain aggregation for robust time-series and trend detection.
CREATE OR REPLACE VIEW public.view_wine_daily_engagement AS
SELECT 
    wine_id,
    winery_id,
    DATE(created_at) as event_date,
    COUNT(*) FILTER (WHERE event_type = 'wine_view') AS daily_views,
    COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'wine_view') AS daily_unique_viewers,
    COUNT(*) FILTER (WHERE event_type = 'wine_save') AS daily_saves
FROM 
    public.analytics_events
WHERE 
    wine_id IS NOT NULL
GROUP BY 
    wine_id, winery_id, DATE(created_at);

-- View: Event Performance
-- Joins events with bookings to calculate capacity utilization and booking revenue.
CREATE OR REPLACE VIEW public.view_event_performance AS
WITH event_bookings AS (
    SELECT 
        event_id,
        COALESCE(SUM(guests), 0) AS total_guests_booked,
        COALESCE(SUM(total_amount), 0) AS total_booking_revenue
    FROM 
        public.bookings
    WHERE
        booking_status != 'cancelled'
    GROUP BY 
        event_id
)
SELECT 
    e.id AS event_id,
    e.winery_id,
    e.title,
    e.event_date,
    e.capacity AS max_capacity,
    COALESCE(b.total_guests_booked, 0) AS total_guests_booked,
    COALESCE(b.total_booking_revenue, 0) AS total_revenue,
    CASE 
        WHEN e.capacity > 0 THEN (COALESCE(b.total_guests_booked, 0)::FLOAT / e.capacity::FLOAT) * 100 
        ELSE 0 
    END AS capacity_utilization_percent,
    (SELECT COUNT(*) FROM public.analytics_events a WHERE a.entity_id = e.id AND a.event_type = 'event_view') AS total_views
FROM 
    public.events e
LEFT JOIN 
    event_bookings b ON e.id = b.event_id;

-- Table: Recommendations
-- Stores the deterministic rules and LLM explanations for wineries.
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    winery_id UUID NOT NULL REFERENCES public.wineries(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'wine', 'event', 'winery'
    entity_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    rule_id VARCHAR(50) NOT NULL,
    condition_detected VARCHAR(255) NOT NULL,
    evidence JSONB NOT NULL,
    recommendation_text TEXT NOT NULL,
    llm_explanation TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'viewed', 'accepted', 'dismissed', 'completed', 'expired'
    deduplication_key VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_at TIMESTAMP WITH TIME ZONE,
    observed_outcome JSONB,
    UNIQUE(deduplication_key)
);

-- RLS for recommendations
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Wineries can view their own recommendations" 
ON public.recommendations FOR SELECT 
USING (winery_id = auth.uid()); -- assuming winery users authenticate and their uid matches winery_id, or they belong to it.

CREATE POLICY "Wineries can update their own recommendations (status)" 
ON public.recommendations FOR UPDATE
USING (winery_id = auth.uid());
