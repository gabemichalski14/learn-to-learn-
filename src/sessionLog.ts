/**
 * Tutor-facing session log: one record per completed game session, recorded
 * quietly so a center can track a student's progress over time.
 *
 * This is intentionally GAME-AGNOSTIC — every game we build should log through
 * `logSession()` with the same shape, so the tutor dashboard works across the
 * whole platform. (Today it's local-only; a future backend can sync these
 * records to a per-student / per-center history without changing game code.)
 */

export interface SessionRecord {
  id: string;
  /** Which game produced this (e.g. 'beginning-sounds'). */
  game: string;
  /** Optional Barton placement, for when packs become lesson-aware. */
  level?: number;
  lesson?: number;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationMs: number;
  /** Rounds/pages completed. */
  rounds: number;
  /** Total items answered across the session. */
  items: number;
  /** Total incorrect attempts across the session. */
  wrongAttempts: number;
  /** 0..1 — items / (items + wrongAttempts); a first-pass correctness proxy. */
  accuracy: number;
}

const LOG_KEY = 'll-sessionlog';
const MAX_RECORDS = 1000;

export function loadSessionLog(): SessionRecord[] {
  try {
    const v = JSON.parse(localStorage.getItem(LOG_KEY) ?? '[]');
    return Array.isArray(v) ? (v as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

/** Append one completed session. Returns the stored record (with id). */
export function logSession(rec: Omit<SessionRecord, 'id'>): SessionRecord {
  const full: SessionRecord = { ...rec, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  try {
    const log = loadSessionLog();
    log.push(full);
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-MAX_RECORDS)));
  } catch {
    /* ignore */
  }
  return full;
}

export function clearSessionLog(): void {
  try {
    localStorage.removeItem(LOG_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Cross-round accumulator for the session in progress. A game's screen remounts
 * per page, so it reports each finished round here; the running totals survive
 * remounts (module scope) and reset when a new session id appears.
 */
let pending: { sessionId: number; wrong: number; items: number } | null = null;

export function noteRound(sessionId: number, wrong: number, items: number): { wrong: number; items: number } {
  if (!pending || pending.sessionId !== sessionId) pending = { sessionId, wrong: 0, items: 0 };
  pending.wrong += wrong;
  pending.items += items;
  return { wrong: pending.wrong, items: pending.items };
}

/** Build a CSV string of the whole log (for the tutor to export/save). */
export function sessionLogCsv(records: SessionRecord[]): string {
  const head = ['date', 'game', 'level', 'lesson', 'duration_sec', 'rounds', 'items', 'wrong', 'accuracy_pct'];
  const rows = records.map((r) => [
    r.endedAt,
    r.game,
    r.level ?? '',
    r.lesson ?? '',
    Math.round(r.durationMs / 1000),
    r.rounds,
    r.items,
    r.wrongAttempts,
    Math.round(r.accuracy * 100),
  ]);
  return [head, ...rows].map((cols) => cols.join(',')).join('\n');
}
