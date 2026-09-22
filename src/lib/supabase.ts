import { createClient } from '@supabase/supabase-js';

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined;
const procEnv = typeof globalThis !== 'undefined' && (globalThis as any).process ? (globalThis as any).process.env : undefined;

const supabaseUrl =
  metaEnv?.VITE_SUPABASE_URL ||
  procEnv?.VITE_SUPABASE_URL ||
  'https://placeholder-project.supabase.co';

const supabaseAnonKey =
  metaEnv?.VITE_SUPABASE_ANON_KEY ||
  procEnv?.VITE_SUPABASE_ANON_KEY ||
  'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  (metaEnv?.VITE_SUPABASE_URL || procEnv?.VITE_SUPABASE_URL) &&
  (metaEnv?.VITE_SUPABASE_ANON_KEY || procEnv?.VITE_SUPABASE_ANON_KEY)
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

