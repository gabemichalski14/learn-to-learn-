import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

/**
 * Cloud data adapter (Supabase). Mirrors the local data shapes so the existing
 * write-points (profiles / progress / sessionLog) can sync through it once a
 * tutor is signed in. Every call requires a configured + authed client; in
 * local mode these are simply never called.
 *
 * NOTE: these are written against the schema in supabase/schema.sql and will be
 * wired into the game write-points + load paths during live integration (once a
 * project + keys exist so it can be exercised end to end).
 */
function client(): SupabaseClient {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// ---------- auth ----------
export async function signIn(email: string, password: string) {
  return client().auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string) {
  return client().auth.signUp({ email, password });
}

export async function signOut() {
  return client().auth.signOut();
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export function onAuthChange(cb: (signedIn: boolean) => void): () => void {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(!!session));
  return () => data.subscription.unsubscribe();
}

// ---------- onboarding ----------
/** Ensure the signed-in user has a center + tutor row; returns the center id. */
export async function ensureCenter(centerName: string): Promise<string> {
  const c = client();
  const { data: user } = await c.auth.getUser();
  const uid = user.user?.id;
  if (!uid) throw new Error('not signed in');

  const { data: existing } = await c.from('tutors').select('center_id').eq('id', uid).maybeSingle();
  if (existing?.center_id) return existing.center_id as string;

  const { data: center, error: ce } = await c.from('centers').insert({ name: centerName }).select('id').single();
  if (ce) throw ce;
  const { error: te } = await c.from('tutors').insert({ id: uid, center_id: center.id, role: 'owner' });
  if (te) throw te;
  return center.id as string;
}

export async function currentCenterId(): Promise<string | null> {
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
  const { data, error } = await client().from('learners').select('id, display_name, color, archived').eq('archived', false);
  if (error) throw error;
  return (data ?? []) as CloudLearner[];
}

export async function upsertLearner(centerId: string, learner: { id?: string; display_name: string; color: string }) {
  const { data, error } = await client().from('learners').upsert({ center_id: centerId, ...learner }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

export async function archiveLearner(id: string) {
  const { error } = await client().from('learners').update({ archived: true }).eq('id', id);
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
  const { error } = await client().from('sessions').insert(session);
  if (error) throw error;
}

export async function listSessions(learnerId: string) {
  const { data, error } = await client().from('sessions').select('*').eq('learner_id', learnerId).order('ended_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---------- leaderboard / stats ----------
export async function leaderboard() {
  const { data, error } = await client().from('learner_stats').select('*');
  if (error) throw error;
  return data ?? [];
}
