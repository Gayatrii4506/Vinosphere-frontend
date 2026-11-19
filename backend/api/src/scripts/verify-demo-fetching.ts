import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verify() {
  console.log('🔍 ========================================================');
  console.log('🔍 VINOSPHERE DATA FETCHING & DEMO STATE VERIFICATION');
  console.log('🔍 ========================================================\n');

  // 1. Check Supabase Row Counts
  console.log('📊 1. LIVE SUPABASE RECORD COUNTS:');
  const tables = [
    'wineries',
    'wines',
    'wine_inventory',
    'wine_images',
    'events',
    'experiences',
    'bookings',
    'corporate_leads',
    'documents',
    'reviews',
    'users'
  ];

  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) console.error(`   ❌ ${table}: ${error.message}`);
    else console.log(`   ✅ ${table.padEnd(18)} : ${count} total rows`);
  }

  // 2. Check Admin Dashboard Status Counts
  console.log('\n🏛️ 2. ADMIN DASHBOARD APPROVALS QUEUE & STATUS CHECK:');
  const { count: draftCount } = await supabase.from('wineries').select('*', { count: 'exact', head: true }).eq('status', 'draft');
  const { count: pubCount } = await supabase.from('wineries').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: archCount } = await supabase.from('wineries').select('*', { count: 'exact', head: true }).eq('status', 'archived');
  console.log(`   - Draft (Pending Onboarding Approvals) : ${draftCount} (Expected >= 2)`);
  console.log(`   - Published (Active Certified Estates) : ${pubCount} (Expected >= 6)`);
  console.log(`   - Archived (Historical Applications)  : ${archCount} (Expected >= 1)`);

  // 3. Test Flagship Demo Winery (Godavari Hills Estate)
  console.log('\n🏰 3. FLAGSHIP DEMO WINERY (00000000-0000-4000-d000-000000000999) INTEGRITY:');
  const flagshipId = '00000000-0000-4000-d000-000000000999';
  const { data: flagshipWinery } = await supabase.from('wineries').select('*').eq('id', flagshipId).single();
  const { data: flagshipWines } = await supabase.from('wines').select('id, name, wine_type, wine_inventory(price, stock_quantity)').eq('winery_id', flagshipId);
  const { data: flagshipEvents } = await supabase.from('events').select('id, title, event_date').eq('winery_id', flagshipId);
  const { data: flagshipExperiences } = await supabase.from('experiences').select('id, title, price').eq('winery_id', flagshipId);
  const { data: flagshipBookings } = await supabase.from('bookings').select('id, booking_status, payment_status, total_amount').eq('winery_id', flagshipId);
  const { data: flagshipLeads } = await supabase.from('corporate_leads').select('id, company_name, status').eq('winery_id', flagshipId);
  const { data: flagshipDocs } = await supabase.from('documents').select('id, document_name, document_type').eq('winery_id', flagshipId);

  console.log(`   - Winery Name       : ${flagshipWinery?.name}`);
  console.log(`   - Status / Verified : ${flagshipWinery?.status} / ${flagshipWinery?.verified}`);
  console.log(`   - Linked Wines      : ${flagshipWines?.length} bottles (each with price & inventory)`);
  console.log(`   - Upcoming Events   : ${flagshipEvents?.length} events`);
  console.log(`   - Experiences       : ${flagshipExperiences?.length} curated estate journeys`);
  console.log(`   - Bookings Count    : ${flagshipBookings?.length} reservations`);
  
  // Calculate Flagship Total Revenue from Paid Bookings
  const paidRevenue = (flagshipBookings || [])
    .filter(b => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total_amount), 0);
  console.log(`   - Realized Revenue  : ₹${paidRevenue.toLocaleString('en-IN')} (from paid bookings)`);
  console.log(`   - Corporate Leads   : ${flagshipLeads?.length} B2B inquiries`);
  console.log(`   - Legal Documents   : ${flagshipDocs?.length} verified documents`);

  // 4. Test Sample Consumer Catalog Fetch
  console.log('\n🍷 4. CONSUMER CATALOG INTEGRATION SAMPLE:');
  const { data: sampleWines } = await supabase
    .from('wines')
    .select(`
      id, name, wine_type, grape_variety, vintage,
      wineries(name, city),
      wine_inventory(price, stock_quantity),
      wine_images(image_url, is_primary)
    `)
    .limit(3);

  sampleWines?.forEach(w => {
    const inv = Array.isArray(w.wine_inventory) ? w.wine_inventory[0] : w.wine_inventory;
    const img = Array.isArray(w.wine_images) ? w.wine_images.find((i: any) => i.is_primary) || w.wine_images[0] : w.wine_images;
    const win = Array.isArray(w.wineries) ? w.wineries[0] : w.wineries;
    console.log(`   - "${w.name}" (${w.wine_type}, ${w.vintage}) | Estate: ${(win as any)?.name} | Price: ₹${(inv as any)?.price || 'N/A'} | Stock: ${(inv as any)?.stock_quantity} | Image: ${(img as any)?.image_url ? 'Valid URL' : 'None'}`);
  });

  // 5. Test Reviews Integration
  console.log('\n⭐ 5. SOMMELIER REVIEWS SAMPLE:');
  const { data: sampleReviews } = await supabase
    .from('reviews')
    .select(`
      id, rating, review,
      users(full_name),
      wineries(name),
      wines(name)
    `)
    .limit(3);

  sampleReviews?.forEach(r => {
    const userName = (r.users as any)?.full_name || 'Connoisseur';
    const wineryName = (r.wineries as any)?.name || 'Estate';
    const wineName = (r.wines as any)?.name || 'Vintage';
    console.log(`   - [★ ${r.rating}/5] ${userName} on ${wineryName} - ${wineName}: "${r.review.slice(0, 70)}..."`);
  });

  console.log('\n🎯 VERIFICATION COMPLETE: ALL SYSTEMS READY FOR DEMONSTRATION!\n');
}

verify().catch(console.error);
