-- Alter wineries table to add awards and timeline JSONB columns
ALTER TABLE wineries 
ADD COLUMN IF NOT EXISTS awards JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]'::jsonb;
