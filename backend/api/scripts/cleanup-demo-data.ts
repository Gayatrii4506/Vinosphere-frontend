import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load backend environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/api/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const DEMO_PREFIX = '00000000-0000-4000-%';
const DEMO_WINERY_FLAGSHIP_ID = '00000000-0000-4000-d000-000000000999';

export async function cleanupDemoData() {
  console.log('🧹 Starting VinoSphere Demo Data Safe Cleanup...');
  console.log(`   Scope: Only deleting records matching demo prefix "${DEMO_PREFIX}"`);
  console.log('   All existing production and real user records are completely preserved.\n');

  // 1. Delete Reviews
  const { error: revErr } = await supabase
    .from('reviews')
    .delete()
    .like('id', DEMO_PREFIX);
  if (revErr) console.warn('Notice deleting demo reviews:', revErr.message);
  else console.log('   ✅ Removed demo reviews');

  // 2. Delete Documents
  const { error: docErr } = await supabase
    .from('documents')
    .delete()
    .like('id', DEMO_PREFIX);
  if (docErr) console.warn('Notice deleting demo documents:', docErr.message);
  else console.log('   ✅ Removed demo documents');

  // 3. Delete Corporate Leads
  const { error: leadErr } = await supabase
    .from('corporate_leads')
    .delete()
    .like('id', DEMO_PREFIX);
  if (leadErr) console.warn('Notice deleting demo corporate leads:', leadErr.message);
  else console.log('   ✅ Removed demo corporate leads');

  // 4. Delete Bookings
  const { error: bookErr } = await supabase
    .from('bookings')
    .delete()
    .like('id', DEMO_PREFIX);
  if (bookErr) console.warn('Notice deleting demo bookings:', bookErr.message);
  else console.log('   ✅ Removed demo bookings');

  // 5. Delete Events
  const { error: eventErr } = await supabase
    .from('events')
    .delete()
    .like('id', DEMO_PREFIX);
  if (eventErr) console.warn('Notice deleting demo events:', eventErr.message);
  else console.log('   ✅ Removed demo events');

  // 6. Delete Experiences
  const { error: expErr } = await supabase
    .from('experiences')
    .delete()
    .like('id', DEMO_PREFIX);
  if (expErr) console.warn('Notice deleting demo experiences:', expErr.message);
  else console.log('   ✅ Removed demo experiences');

  // 7. Delete Wine Images
  const { error: imgErr } = await supabase
    .from('wine_images')
    .delete()
    .like('id', DEMO_PREFIX);
  if (imgErr) console.warn('Notice deleting demo wine images:', imgErr.message);
  else console.log('   ✅ Removed demo wine images');

  // 8. Delete Wine Inventory
  const { error: invErr } = await supabase
    .from('wine_inventory')
    .delete()
    .like('id', DEMO_PREFIX);
  if (invErr) console.warn('Notice deleting demo wine inventory:', invErr.message);
  else console.log('   ✅ Removed demo wine inventory');

  // 9. Delete Wines
  const { error: wineErr } = await supabase
    .from('wines')
    .delete()
    .like('id', DEMO_PREFIX);
  if (wineErr) console.warn('Notice deleting demo wines:', wineErr.message);
  else console.log('   ✅ Removed demo wines');

  // 10. Delete Wineries
  const { error: winErr } = await supabase
    .from('wineries')
    .delete()
    .like('id', DEMO_PREFIX);
  if (winErr) console.warn('Notice deleting demo wineries:', winErr.message);
  else console.log('   ✅ Removed demo wineries');

  // 11. Delete Demo Users
  const { error: userErr } = await supabase
    .from('users')
    .delete()
    .like('id', DEMO_PREFIX);
  if (userErr) console.warn('Notice deleting demo users:', userErr.message);
  else console.log('   ✅ Removed demo users');

  console.log('\n✨ Demo data cleanup finished safely.\n');
}

if (require.main === module) {
  cleanupDemoData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('❌ Cleanup Fatal Error:', err);
      process.exit(1);
    });
}
