import { supabase } from './supabase';
import * as cloud from './cloud';
import { getLearner } from '../profiles';
import type { SessionRecord } from '../sessionLog';

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

/** Push one finished session to the cloud (no-op unless signed in). */
export function syncSession(localLearnerId: string, rec: Omit<SessionRecord, 'id'>): void {
  void (async () => {
    try {
      if (!(await signedIn())) return;
      const centerId = await cloud.currentCenterId();
      if (!centerId) return;
      const learnerId = await ensureCloudLearner(localLearnerId, centerId);
      if (!learnerId) return;
      await cloud.insertSession({
        learner_id: learnerId,
        center_id: centerId,
        game: rec.game,
        level: rec.level,
        lesson: rec.lesson,
        started_at: rec.startedAt,
        ended_at: rec.endedAt,
        duration_ms: rec.durationMs,
        rounds: rec.rounds,
        items: rec.items,
        wrong_attempts: rec.wrongAttempts,
        accuracy: rec.accuracy,
      });
    } catch {
      /* local already saved; cloud sync is best-effort */
    }
  })();
}
