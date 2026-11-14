-- Migration to create the analytics_events table for tracking user interactions and insights

CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    wine_id UUID REFERENCES public.wines(id) ON DELETE CASCADE,
    winery_id UUID REFERENCES public.wineries(id) ON DELETE CASCADE,
    entity_id UUID, -- For generic items like events, experiences
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes to improve query performance for analytics aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_winery_id ON public.analytics_events(winery_id);
CREATE INDEX IF NOT EXISTS idx_analytics_wine_id ON public.analytics_events(wine_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events(created_at);

-- Set up Row Level Security (RLS) if required
-- ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- Note: Depending on existing configurations, you may want to restrict access so wineries can only read their own winery_id events.
