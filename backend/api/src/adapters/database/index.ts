import { supabaseAdmin } from '../../config/supabase';
import { SupabaseAdapter } from './SupabaseAdapter';
import { IDatabaseAdapter } from './IDatabaseAdapter';

// Instantiate the Supabase Adapter with our admin client
const db: IDatabaseAdapter = new SupabaseAdapter(supabaseAdmin);

export { db };
