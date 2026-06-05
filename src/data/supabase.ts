import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client, built from public env vars (VITE_SUPABASE_URL / _ANON_KEY).
 * When they're absent the client is null and the whole app runs in LOCAL mode
 * exactly as before — cloud sync simply stays off until a project is configured.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;

export function isCloudConfigured(): boolean {
  return supabase !== null;
}
