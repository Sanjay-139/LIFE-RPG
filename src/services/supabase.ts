import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Project Supabase instance credentials
const DEFAULT_SUPABASE_URL = 'https://gflefchhonmrvahyzfsl.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbGVmY2hob25tcnZhaHl6ZnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDQ3MjQsImV4cCI6MjEwNDc4MDcyNH0.BIPM8nGSvcfmAhdMMr2nVctoNrOh10nbsE7T2v4KWc8';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure supabaseUrl is a valid HTTP/HTTPS URL (protect against accidentally pasting postgresql:// connection strings)
const isValidHttpUrl =
  envUrl &&
  (envUrl.startsWith('https://') || envUrl.startsWith('http://')) &&
  !envUrl.includes('placeholder') &&
  !envUrl.includes('your-supabase-project');

const supabaseUrl = isValidHttpUrl ? envUrl : DEFAULT_SUPABASE_URL;

const supabaseAnonKey =
  envKey && !envKey.includes('placeholder') && !envKey.includes('your-anon-key')
    ? envKey
    : DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

