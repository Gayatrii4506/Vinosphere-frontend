import { SupabaseAdapter } from '../adapters/database/SupabaseAdapter';
import { supabaseAdmin } from '../config/supabase';
import dotenv from 'dotenv';
dotenv.config();

async function inspectWineries() {
  const db = new SupabaseAdapter(supabaseAdmin);
  try {
    const wineries = await db.find('wineries');
    console.log("Current Wineries in Supabase:");
    wineries.forEach((w: any) => console.log(`ID: ${w.id} | Name: ${w.name} | Slug: ${w.slug}`));
    
    const wines = await db.find('wines');
    console.log(`\nTotal Wines in Supabase: ${wines.length}`);
    for (const w of wineries) {
      const wineryWines = wines.filter((wine: any) => wine.winery_id === w.id);
      console.log(`\nWinery: ${w.name} (${w.id}) -> ${wineryWines.length} wines`);
      wineryWines.forEach((wine: any) => console.log(`  - [${wine.id}] ${wine.name} (${wine.vintage || 'NV'}) - ₹${wine.price}`));
    }
  } catch (err) {
    console.error("Error inspecting wineries:", err);
  } finally {
    process.exit(0);
  }
}

inspectWineries();
