-- Migration: Winery Authentication & Profile Linkage
-- Adds winery_id reference to users table to support multi-tenant estate ownership

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS winery_id UUID REFERENCES wineries(id) ON DELETE SET NULL;

-- Ensure wineries table has all fields captured during the setup wizard
ALTER TABLE wineries
ADD COLUMN IF NOT EXISTS tagline TEXT,
ADD COLUMN IF NOT EXISTS established_year INT,
ADD COLUMN IF NOT EXISTS vineyard_area TEXT,
ADD COLUMN IF NOT EXISTS operating_hours TEXT,
ADD COLUMN IF NOT EXISTS price_range TEXT,
ADD COLUMN IF NOT EXISTS licenses JSONB DEFAULT '{}'::jsonb;
