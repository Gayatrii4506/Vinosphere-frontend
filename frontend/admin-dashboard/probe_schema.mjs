import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE URL or KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
  const tablesToTry = ['users', 'profiles', 'wineries', 'wines', 'events', 'experiences', 'bookings', 'reviews', 'ai_logs'];
  const schema = {};

  for (const table of tablesToTry) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      schema[table] = { error: error.message };
    } else {
      schema[table] = { 
        exists: true, 
        sample: data.length > 0 ? Object.keys(data[0]) : "empty but exists" 
      };
    }
  }

  console.log(JSON.stringify(schema, null, 2));
}

inspectSchema();
