import { getSupabase } from './supabase';
import * as cloud from './cloud';
import { getLearner } from '../profiles';
import type { SessionRecord } from '../sessionLog';
import { enqueue, flush, type OutboxItem } from './outbox';
import type { SkillEvent } from '../mastery/events';

/**
 * Offline-first cloud sync. The local store is always the source of truth for
 * the UI (synchronous reads); when a tutor is signed in, completed sessions are
 * ALSO pushed to Supabase. Everything here is fire-and-forget + guarded, so a
 * cloud hiccup (or being signed out) never affects local play.
 */
const MAP_KEY = 'll-cloudmap'; // localId -> cloud learner uuid

function loadMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) ?? '{}');
  } catch {
    return {};
  }
}
function saveMap(m: Record<string, string>) {
  try {
    localStorage.setItem(MAP_KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

async function signedIn(): Promise<boolean> {
  const supabase = await getSupabase();
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** Find (or create) the cloud learner row for a local learner id. */
async function ensureCloudLearner(localId: string, centerId: string): Promise<string | null> {
  const map = loadMap();
  if (map[localId]) return map[localId];
  const l = getLearner(localId);
  if (!l) return null;
  const cloudId = await cloud.upsertLearner(centerId, { display_name: l.name, color: l.color });
  map[localId] = cloudId;
  saveMap(map);
  return cloudId;
}

/** Enqueue one answer-event for cloud sync. Flushed on the next trigger
 *  (session finish / sign-in / startup) — no per-answer network call. */
export function logSkillEvent(localLearnerId: string, ev: SkillEvent): void {
  enqueue({ kind: 'skill_event', localLearnerId, payload: ev });
}

/** Enqueue a finished session and try to flush immediately. */
export function enqueueSession(localLearnerId: string, rec: Omit<SessionRecord, 'id'>): void {
  enqueue({ kind: 'session', localLearnerId, payload: rec });
  void flushOutbox();
}

let flushing = false;
/** Drain the outbox to Supabase. No-op unless signed in + a center exists.
 *  Guarded so overlapping triggers never double-process the queue. */
export function flushOutbox(): Promise<void> {
  return (async () => {
    if (flushing) return;
    flushing = true;
    try {
      if (!(await signedIn())) return;
      const centerId = await cloud.currentCenterId();
      if (!centerId) return;
      await flush(async (item: OutboxItem) => {
        const learnerId = await ensureCloudLearner(item.localLearnerId, centerId);
        if (!learnerId) return false;
        if (item.kind === 'skill_event') {
          const ev = item.payload as SkillEvent;
          await cloud.insertSkillEvents([{ learner_id: learnerId, skill_key: ev.skillKey, correct: ev.correct, at: new Date(ev.at).toISOString() }]);
          return true;
        }
        if (item.kind === 'session') {
          const r = item.payload as Omit<SessionRecord, 'id'>;
          await cloud.insertSession({
            learner_id: learnerId, center_id: centerId, game: r.game, level: r.level, lesson: r.lesson,
            started_at: r.startedAt, ended_at: r.endedAt, duration_ms: r.durationMs, rounds: r.rounds,
            items: r.items, wrong_attempts: r.wrongAttempts, accuracy: r.accuracy,
          });
          return true;
        }
        return true; // unknown kind: drop
      });
    } finally {
      flushing = false;
    }
  })().catch((e) => { console.warn('[cloud] flush failed:', e); });
}
