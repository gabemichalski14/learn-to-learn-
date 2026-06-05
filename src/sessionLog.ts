/**
 * Per-learner session log: one record per completed game session. Game-agnostic
 * — EVERY game must log through `logSession()`. Keyed per learner id so the
 * tutor dashboard / leaderboard / reports are all per-student.
 */

export interface SessionRecord {
  id: string;
  game: string;
  level?: number;
  lesson?: number;
  startedAt: string; // ISO
  endedAt: string; // ISO
  durationMs: number;
  rounds: number;
  items: number;
  wrongAttempts: number;
  accuracy: number; // 0..1
}

const logKey = (learnerId: string) => `ll:${learnerId}:log`;
const MAX_RECORDS = 1000;

export function loadSessionLog(learnerId: string): SessionRecord[] {
  try {
    const v = JSON.parse(localStorage.getItem(logKey(learnerId)) ?? '[]');
    return Array.isArray(v) ? (v as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function logSession(learnerId: string, rec: Omit<SessionRecord, 'id'>): SessionRecord {
  const full: SessionRecord = { ...rec, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  try {
    const log = loadSessionLog(learnerId);
    log.push(full);
    localStorage.setItem(logKey(learnerId), JSON.stringify(log.slice(-MAX_RECORDS)));
  } catch {
    /* ignore */
  }
  return full;
}

export function clearSessionLog(learnerId: string): void {
  try {
    localStorage.removeItem(logKey(learnerId));
  } catch {
    /* ignore */
  }
}

/** CSV of a learner's log (for the tutor to export/save). */
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

/**
 * Cross-round accumulator for the session in progress. Transient (module scope),
 * not learner-keyed — it just survives the per-page remount and resets on a new
 * session id.
 */
let pending: { sessionId: number; wrong: number; items: number } | null = null;

export function noteRound(sessionId: number, wrong: number, items: number): { wrong: number; items: number } {
  if (!pending || pending.sessionId !== sessionId) pending = { sessionId, wrong: 0, items: 0 };
  pending.wrong += wrong;
  pending.items += items;
  return { wrong: pending.wrong, items: pending.items };
}
