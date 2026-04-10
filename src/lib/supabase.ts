import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// For development without env vars, use placeholder values
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);

// Check if environment variables are properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (typeof window !== 'undefined' && !isSupabaseConfigured) {
  console.warn('⚠️ Supabase environment variables not configured. Auth and database features will not work. See .env.local');
}
