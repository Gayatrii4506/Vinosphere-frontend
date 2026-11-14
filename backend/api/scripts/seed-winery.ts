import { SupabaseAdapter } from '../src/adapters/database/SupabaseAdapter';
import { supabaseAdmin } from '../src/config/supabase';
import dotenv from 'dotenv';
dotenv.config();

async function seedWinery() {
    const db = new SupabaseAdapter(supabaseAdmin);
    const sulaId = '11111111-1111-1111-1111-111111111111';
    
    // Check if it exists
    const existing = await db.find('wineries', { id: sulaId });
    if (existing && existing.length > 0) {
        console.log("Winery already exists:", existing[0]);
        return;
    }

    try {
        const winery = await db.create('wineries', {
            id: sulaId,
            name: 'Sula Vineyards',
            slug: 'sula-vineyards',
            description: 'India\'s most famous winery',
            location: 'Nashik, Maharashtra',
            status: 'published'
        });
        console.log("Created winery:", winery);
    } catch (e) {
        console.error("Error creating winery:", e);
    }
}

seedWinery();
