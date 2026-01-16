import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';

const supabaseUrl = env.supabaseUrl();
const supabaseServiceKey = env.supabaseServiceRoleKey();
const supabaseAnonKey = env.supabaseAnonKey();

// Service client for admin operations (bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client for client-side operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Note: Direct SQL queries should use Supabase client methods
// The Supabase client handles all database operations
