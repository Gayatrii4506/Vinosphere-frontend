import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import WebSocket from 'ws';

/**
 * Supabase Admin Client
 * Uses the Service Role Key to bypass Row Level Security (RLS).
 * WARNING: Never expose this to the frontend. Use this ONLY for backend administrative tasks
 * or when the backend needs unfettered access to the database.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetch,
      headers: { 'x-my-custom-header': 'vinosphere-backend' },
    },
    realtime: {
      transport: WebSocket as any,
    }
  }
);
