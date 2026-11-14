-- Phase 1: Indexes for analytics_events
-- These indexes are essential for the new PostgreSQL views that will aggregate behavioural data.

-- Create index on winery_id for fast winery-level aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_winery_id ON public.analytics_events(winery_id);

-- Create index on wine_id for fast wine-level aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_wine_id ON public.analytics_events(wine_id);

-- Create index on created_at for fast time-series queries and baseline comparisons
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Create composite index for the most common aggregation pattern (winery + time)
CREATE INDEX IF NOT EXISTS idx_analytics_events_winery_time ON public.analytics_events(winery_id, created_at);

-- Create composite index for wine + time
CREATE INDEX IF NOT EXISTS idx_analytics_events_wine_time ON public.analytics_events(wine_id, created_at);

-- Create index on event_type to quickly filter by views, saves, etc.
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
