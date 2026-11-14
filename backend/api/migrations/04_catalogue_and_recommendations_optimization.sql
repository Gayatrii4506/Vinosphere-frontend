-- ====================================================================
-- VinoSphere Migration: Catalogue, Wishlist & Recommendation Optimization
-- Schema-Accurate & Production-Ready
-- ====================================================================

-- 1. Create wishlist table if not exists with RLS permissions
CREATE TABLE IF NOT EXISTS wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    wine_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_wine_wishlist UNIQUE (user_id, wine_id)
);

-- Enable RLS on wishlist
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full CRUD on their own wishlist entries
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'wishlist' AND policyname = 'Users can view their own wishlist'
    ) THEN
        CREATE POLICY "Users can view their own wishlist"
        ON wishlist FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'wishlist' AND policyname = 'Users can insert their own wishlist'
    ) THEN
        CREATE POLICY "Users can insert their own wishlist"
        ON wishlist FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'wishlist' AND policyname = 'Users can delete their own wishlist'
    ) THEN
        CREATE POLICY "Users can delete their own wishlist"
        ON wishlist FOR DELETE
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Create user_interactions table for ML & journey logging
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    wine_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_interactions
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_interactions' AND policyname = 'Users can view their own interactions'
    ) THEN
        CREATE POLICY "Users can view their own interactions"
        ON user_interactions FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_interactions' AND policyname = 'Users can insert their own interactions'
    ) THEN
        CREATE POLICY "Users can insert their own interactions"
        ON user_interactions FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Indexes for Wishlist & Interactions
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_wine_id ON wishlist(wine_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_created ON user_interactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_type ON user_interactions(user_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_wine_id ON user_interactions(wine_id);

-- 4. Index frequently queried columns on wines table (Actual schema fields)
CREATE INDEX IF NOT EXISTS idx_wines_winery_id ON wines(winery_id);
CREATE INDEX IF NOT EXISTS idx_wines_wine_type ON wines(wine_type);
CREATE INDEX IF NOT EXISTS idx_wines_grape_variety ON wines(grape_variety);
CREATE INDEX IF NOT EXISTS idx_wines_vintage ON wines(vintage);

-- 5. Index wine_inventory for fast catalogue filtering, stock & pricing lookups
CREATE INDEX IF NOT EXISTS idx_wine_inventory_wine_id ON wine_inventory(wine_id);
CREATE INDEX IF NOT EXISTS idx_wine_inventory_price ON wine_inventory(price);
CREATE INDEX IF NOT EXISTS idx_wine_inventory_status_stock ON wine_inventory(publish_status, stock_quantity);
CREATE INDEX IF NOT EXISTS idx_wine_inventory_composite ON wine_inventory(publish_status, price);

-- 6. Index users table for preference and recommendation lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_experience_level ON users(experience_level);
