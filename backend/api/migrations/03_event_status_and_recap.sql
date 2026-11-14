-- ====================================================================
-- VinoSphere Migration: Event Status, Turnout & Past Event Social Proof
-- ====================================================================
-- NOTE: This migration is OPTIONAL.
-- The application is designed to automatically persist these fields 
-- inside the 'host_info' JSONB column and 'tags' array even without 
-- running this migration.
--
-- Run this in your Supabase SQL Editor if you want dedicated, first-class 
-- columns on the 'events' table for direct querying and indexing.
-- ====================================================================

-- 1. Add event_status column ('upcoming', 'ongoing', 'past')
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_status TEXT DEFAULT 'upcoming';

-- 2. Add turnout_count column (number of guests who attended past events)
ALTER TABLE events ADD COLUMN IF NOT EXISTS turnout_count INTEGER DEFAULT NULL;

-- 3. Add rating column (overall event rating out of 5)
ALTER TABLE events ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT NULL;

-- 4. Add recap_notes column (post-event notes and summary)
ALTER TABLE events ADD COLUMN IF NOT EXISTS recap_notes TEXT DEFAULT NULL;

-- 5. Add reviews column (JSONB array of attendee reviews [{author, avatar, rating, date, comment}])
ALTER TABLE events ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]'::jsonb;

-- 6. Add index for faster filtering between upcoming and past events
CREATE INDEX IF NOT EXISTS idx_events_event_status ON events(event_status);

-- 7. Sync existing past events based on event_date
UPDATE events 
SET event_status = 'past' 
WHERE event_date < CURRENT_DATE AND (event_status IS NULL OR event_status = 'upcoming');
