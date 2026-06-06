import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client, built lazily from public env vars (VITE_SUPABASE_URL /
 * _ANON_KEY). When they're absent `getSupabase()` resolves to null and the whole
 * app runs in LOCAL mode exactly as before — cloud sync simply stays off until a
 * project is configured.
 *
 * The SDK itself is loaded with a dynamic `import()` so `@supabase/supabase-js`
 * lands in its own lazy chunk: it's only fetched when a cloud feature is actually
 * used (signing in or syncing), never for the many learners who only play locally.
 * The type-only import above is erased at build time, so this module keeps no
 * static dependency on the SDK.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when the public env keys are present — a pure, synchronous check that
 * never pulls in the SDK, so callers can branch on it during render. */
export function isCloudConfigured(): boolean {
  return !!(url && anonKey);
}

let clientPromise: Promise<SupabaseClient | null> | null = null;

/**
 * Resolve the shared Supabase client, loading the SDK on first use and memoizing
 * the result. Resolves to null (no SDK fetched) when cloud isn't configured.
 */
export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isCloudConfigured()) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(url as string, anonKey as string),
    );
  }
  return clientPromise;
}
