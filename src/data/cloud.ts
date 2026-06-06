import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

/**
 * Cloud data adapter (Supabase). Mirrors the local data shapes so the existing
 * write-points (profiles / progress / sessionLog) can sync through it once a
 * tutor is signed in. Every call requires a configured + authed client; in
 * local mode these are simply never called.
 *
 * The client is fetched via `getSupabase()` (lazy SDK chunk), so nothing here
 * pulls `@supabase/supabase-js` into the main bundle.
 *
 * NOTE: these are written against the schema in supabase/schema.sql and will be
 * wired into the game write-points + load paths during live integration (once a
 * project + keys exist so it can be exercised end to end).
 */
async function client(): Promise<SupabaseClient> {
  const c = await getSupabase();
  if (!c) throw new Error('Supabase is not configured');
  return c;
}

// ---------- auth ----------
export async function signIn(email: string, password: string) {
  return (await client()).auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, centerName?: string) {
  return (await client()).auth.signUp({
    email,
    password,
    options: centerName ? { data: { center_name: centerName } } : undefined,
  });
}

export async function signOut() {
  return (await client()).auth.signOut();
}

export async function getCurrentUser() {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function onAuthChange(cb: (signedIn: boolean) => void): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  void getSupabase().then((supabase) => {
    if (!supabase || cancelled) return;
    const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(!!session));
    unsub = () => data.subscription.unsubscribe();
  });
  return () => {
    cancelled = true;
    unsub?.();
  };
}

// ---------- onboarding ----------
// A signup trigger (schema.sql) auto-creates the center + owner tutor, so the
// client just reads the center id.
export async function currentCenterId(): Promise<string | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data: user } = await supabase.auth.getUser();
  const uid = user.user?.id;
  if (!uid) return null;
  const { data } = await supabase.from('tutors').select('center_id').eq('id', uid).maybeSingle();
  return (data?.center_id as string) ?? null;
}

// ---------- learners ----------
export interface CloudLearner { id: string; display_name: string; color: string; archived: boolean }

export async function listLearners(): Promise<CloudLearner[]> {
  const { data, error } = await (await client()).from('learners').select('id, display_name, color, archived').eq('archived', false);
  if (error) throw error;
  return (data ?? []) as CloudLearner[];
}

export async function upsertLearner(centerId: string, learner: { id?: string; display_name: string; color: string }) {
  const { data, error } = await (await client()).from('learners').upsert({ center_id: centerId, ...learner }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function archiveLearner(id: string) {
  const { error } = await (await client()).from('learners').update({ archived: true }).eq('id', id);
  if (error) throw error;
}

// ---------- sessions ----------
export interface CloudSession {
  learner_id: string;
  center_id: string;
  game: string;
  level?: number;
  lesson?: number;
  started_at?: string;
  ended_at: string;
  duration_ms: number;
  rounds?: number;
  items?: number;
  wrong_attempts?: number;
  accuracy?: number;
}

export async function insertSession(session: CloudSession) {
  const { error } = await (await client()).from('sessions').insert(session);
  if (error) throw error;
}

export async function listSessions(learnerId: string) {
  const { data, error } = await (await client()).from('sessions').select('*').eq('learner_id', learnerId).order('ended_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---------- leaderboard / stats ----------
export async function leaderboard() {
  const { data, error } = await (await client()).from('learner_stats').select('*');
  if (error) throw error;
  return data ?? [];
}
