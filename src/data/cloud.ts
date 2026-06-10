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

/** Intent decides what the signup trigger does: make a new center (owner), or
 *  join an existing center as a tutor/parent (no center — redeem a code after). */
export type SignUpIntent = 'new_center' | 'join_tutor' | 'join_parent';

export async function signUp(
  email: string,
  password: string,
  opts?: { centerName?: string; intent?: SignUpIntent; name?: string },
) {
  const intent: SignUpIntent = opts?.intent ?? 'new_center';
  const data: Record<string, string> = { intent };
  if (opts?.centerName) data.center_name = opts.centerName;
  if (opts?.name) data.name = opts.name; // → redeem_invite stores it on tutors/guardians
  return (await client()).auth.signUp({ email, password, options: { data } });
}

/** Redeem a one-time invite code (server-validated, single-use, expiring).
 *  Returns 'ok' | 'invalid' | 'used' | 'expired'. Call after sign-up/in for a
 *  joining tutor or parent. */
export async function redeemInvite(code: string): Promise<string> {
  const { data, error } = await (await client()).rpc('redeem_invite', { p_code: code.trim().toUpperCase() });
  if (error) throw error;
  return (data as string) ?? 'invalid';
}

/** The signed-in user's role, derived from server tables (never JWT metadata). */
export async function getRole(): Promise<'owner' | 'tutor' | 'parent' | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data: u } = await supabase.auth.getUser();
  const uid = u.user?.id;
  if (!uid) return null;
  const { data: t } = await supabase.from('tutors').select('role').eq('id', uid).maybeSingle();
  if (t?.role) return t.role === 'owner' ? 'owner' : 'tutor';
  const { data: g } = await supabase.from('guardians').select('user_id').eq('user_id', uid).limit(1);
  return g && g.length > 0 ? 'parent' : null;
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

// ---------- password reset ----------
/** Email a reset link; clicking it returns the user to #/account in recovery mode. */
export async function requestPasswordReset(email: string) {
  const redirectTo = `${window.location.origin}${window.location.pathname}#/account`;
  return (await client()).auth.resetPasswordForEmail(email.trim(), { redirectTo });
}

/** Set a new password for the recovering (or signed-in) user. */
export async function updatePassword(password: string) {
  return (await client()).auth.updateUser({ password });
}

/** Fire when the user lands via a reset link (Supabase emits PASSWORD_RECOVERY).
 *  Deferred (setTimeout 0) to dodge the auth-lock deadlock. Returns unsubscribe. */
export function onPasswordRecovery(cb: () => void): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  void getSupabase().then((supabase) => {
    if (!supabase || cancelled) return;
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setTimeout(cb, 0);
    });
    unsub = () => data.subscription.unsubscribe();
  });
  return () => { cancelled = true; unsub?.(); };
}

export function onAuthChange(cb: (signedIn: boolean) => void): () => void {
  let unsub: (() => void) | null = null;
  let cancelled = false;
  void getSupabase().then((supabase) => {
    if (!supabase || cancelled) return;
    // IMPORTANT: defer the callback. supabase-js holds its auth lock while it
    // emits this event, so calling any auth method (getUser/getSession) from
    // here synchronously deadlocks — sign-in then hangs forever. setTimeout(0)
    // runs consumers AFTER the lock is released. (Documented supabase footgun.)
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setTimeout(() => cb(!!session), 0);
    });
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

/** Owner creates a new student in their center (first name / initials only). */
export async function createLearner(displayName: string, color: string): Promise<string> {
  const centerId = await currentCenterId();
  if (!centerId) throw new Error('No center');
  return upsertLearner(centerId, { display_name: displayName, color });
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

/** Rename a learner (owner edits a student's display name). */
export async function renameLearner(id: string, displayName: string) {
  const { error } = await (await client()).from('learners').update({ display_name: displayName }).eq('id', id);
  if (error) throw error;
}

/** A free-text, STAFF-ONLY note on a student (owner or assigned tutor). Lives in
 *  its own `staff_notes` table so guardians can't read it (the learners read
 *  policy includes guardians; see the migration). Isolated so the rest of the
 *  app is unaffected before that migration runs. */
export async function getLearnerNote(id: string): Promise<string> {
  const { data, error } = await (await client()).from('staff_notes').select('body').eq('learner_id', id).maybeSingle();
  if (error) throw error;
  return (data?.body as string | null) ?? '';
}
export async function setLearnerNote(id: string, note: string) {
  const { error } = await (await client()).from('staff_notes').upsert({ learner_id: id, body: note }, { onConflict: 'learner_id' });
  if (error) throw error;
}

/** Hard-delete a learner + all their data (cascades to sessions/skill_events/
 *  achievements/assignments). Used by the owner to honor a deletion request. */
export async function deleteLearner(id: string) {
  const { error } = await (await client()).from('learners').delete().eq('id', id);
  if (error) throw error;
}

// ---------- guardians (a student's linked parents) ----------
export interface CloudGuardian { user_id: string; created_at: string; name: string | null }
export async function listGuardians(learnerId: string): Promise<CloudGuardian[]> {
  const { data, error } = await (await client()).from('guardians').select('user_id, created_at, name').eq('learner_id', learnerId);
  if (error) throw error;
  return (data ?? []) as CloudGuardian[];
}
export async function deleteGuardian(userId: string, learnerId: string) {
  const { error } = await (await client()).from('guardians').delete().eq('user_id', userId).eq('learner_id', learnerId);
  if (error) throw error;
}

// ---------- tutors + assignments (owner admin) ----------
export interface CloudTutor { id: string; name: string | null; role: string }
export async function listTutors(): Promise<CloudTutor[]> {
  const { data, error } = await (await client()).from('tutors').select('id, name, role');
  if (error) throw error;
  return (data ?? []) as CloudTutor[];
}

export interface CloudAssignment { learner_id: string; tutor_id: string; relation: 'primary' | 'substitute'; expires_at: string | null }
export async function listAssignments(): Promise<CloudAssignment[]> {
  const { data, error } = await (await client()).from('learner_tutors').select('learner_id, tutor_id, relation, expires_at');
  if (error) throw error;
  return (data ?? []) as CloudAssignment[];
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

// ---------- skill events (append-only per-answer log) ----------
export interface CloudSkillEvent {
  learner_id: string;
  skill_key: string;
  correct: boolean;
  game?: string;
  at: string; // ISO
  // optional enrichment (nullable columns — see 2026-06-10-skill-events-enrichment.sql)
  chosen?: string;
  first_try?: boolean;
  latency_ms?: number;
  replays?: number;
  level?: number;
  lesson?: number;
}

export async function insertSkillEvents(rows: CloudSkillEvent[]) {
  if (rows.length === 0) return;
  const { error } = await (await client()).from('skill_events').insert(rows);
  if (error) throw error;
}

export interface EnrichedSkillEvent {
  skill_key: string; correct: boolean; at: string; game: string | null;
  chosen: string | null; first_try: boolean | null; latency_ms: number | null;
  replays: number | null; level: number | null; lesson: number | null;
}
export async function listSkillEvents(learnerId: string, sinceISO?: string) {
  let q = (await client()).from('skill_events')
    .select('skill_key, correct, at, game, chosen, first_try, latency_ms, replays, level, lesson')
    .eq('learner_id', learnerId);
  if (sinceISO) q = q.gte('at', sinceISO);
  const { data, error } = await q.order('at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as EnrichedSkillEvent[];
}

// ---------- leaderboard / stats ----------
export async function leaderboard() {
  const { data, error } = await (await client()).from('learner_stats').select('*');
  if (error) throw error;
  return data ?? [];
}

// ---------- invites (owner issues; parent/tutor redeems) ----------
/** A short, human-shareable, unguessable code (no ambiguous chars). */
function randCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  let s = '';
  for (const n of arr) s += alphabet[n % alphabet.length];
  return `${s.slice(0, 4)}-${s.slice(4, 8)}`;
}

/** Owner issues a one-time invite. `learnerId` required for kind='parent';
 *  `email` + `name` are remembered so the pending list reads as a person. */
export async function createInviteCode(kind: 'parent' | 'tutor', learnerId?: string, email?: string, name?: string, ttlDays = 14): Promise<string> {
  const centerId = await currentCenterId();
  if (!centerId) throw new Error('No center');
  const code = randCode();
  const expires_at = new Date(Date.now() + ttlDays * 86_400_000).toISOString();
  const base = { code, kind, center_id: centerId, learner_id: learnerId ?? null, expires_at };
  const supabase = await client();
  let { error } = await supabase.from('invite_codes').insert({ ...base, email: email?.trim() || null, name: name?.trim() || null });
  // Pre-migration fallback: if the email/name columns don't exist yet, store without them.
  if (error && /email|name|column/i.test(error.message)) ({ error } = await supabase.from('invite_codes').insert(base));
  if (error) throw error;
  return code;
}

export interface CloudInvite { code: string; kind: 'parent' | 'tutor'; email: string | null; name: string | null; learner_id: string | null; expires_at: string }
/** Pending (unredeemed, unexpired) invites for the owner's center. Filter by
 *  kind and/or learner. Drops off automatically once redeem sets used_at. */
export async function listPendingInvites(kind?: 'parent' | 'tutor', learnerId?: string): Promise<CloudInvite[]> {
  const supabase = await client();
  const nowISO = new Date().toISOString();
  const run = (cols: string) => {
    let q = supabase.from('invite_codes').select(cols).is('used_at', null).gt('expires_at', nowISO);
    if (kind) q = q.eq('kind', kind);
    if (learnerId) q = q.eq('learner_id', learnerId);
    return q.order('expires_at', { ascending: true });
  };
  let { data, error } = await run('code, kind, email, name, learner_id, expires_at');
  if (error && /email|name|column/i.test(error.message)) ({ data, error } = await run('code, kind, learner_id, expires_at'));
  if (error) throw error;
  return (data ?? []) as unknown as CloudInvite[];
}

/** A friendly label for a pending invite: the name the owner typed, else a name
 *  derived from the email (jane.doe@… → "Jane Doe"), else a plain fallback. */
export function inviteLabel(inv: { name?: string | null; email?: string | null }): string {
  const name = inv.name?.trim();
  if (name) return name;
  const email = inv.email?.trim();
  if (!email) return 'Invite sent';
  const local = (email.split('@')[0] || '').replace(/[._+-]+/g, ' ').trim();
  const words = local.split(/\s+/).filter(Boolean);
  return words.length ? words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : email;
}

/** Owner cancels a pending invite (revoke / before resending). */
export async function deleteInviteCode(code: string) {
  const { error } = await (await client()).from('invite_codes').delete().eq('code', code);
  if (error) throw error;
}

// ---------- assignment (owner) ----------
export async function assignTutor(learnerId: string, tutorId: string, relation: 'primary' | 'substitute' = 'primary', expiresAt?: string) {
  const { error } = await (await client()).from('learner_tutors')
    .upsert({ learner_id: learnerId, tutor_id: tutorId, relation, expires_at: expiresAt ?? null });
  if (error) throw error;
}

export async function unassignTutor(learnerId: string, tutorId: string) {
  const { error } = await (await client()).from('learner_tutors').delete().eq('learner_id', learnerId).eq('tutor_id', tutorId);
  if (error) throw error;
}

// ---------- deletion requests (COPPA — easy to find for both parties) ----------
export interface DeletionRequest { id: string; learner_id: string; requested_at: string; status: string; note?: string }

/** Parent asks for their child's data to be deleted (owner confirms the actual delete). */
export async function requestDeletion(learnerId: string, note?: string) {
  const { error } = await (await client()).from('deletion_requests').insert({ learner_id: learnerId, note: note ?? null });
  if (error) throw error;
}

/** Owner inbox: open deletion requests for the center. */
export async function listDeletionRequests(): Promise<DeletionRequest[]> {
  const { data, error } = await (await client()).from('deletion_requests')
    .select('id, learner_id, requested_at, status, note').eq('status', 'open').order('requested_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DeletionRequest[];
}

/** Owner resolves a request (done = actioned, dismissed = declined). */
export async function resolveDeletion(id: string, status: 'done' | 'dismissed') {
  const { data: u } = await (await client()).auth.getUser();
  const { error } = await (await client()).from('deletion_requests')
    .update({ status, resolved_by: u.user?.id, resolved_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
