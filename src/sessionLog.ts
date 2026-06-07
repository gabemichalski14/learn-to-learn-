/**
 * Per-learner session log: one record per completed game session. Game-agnostic
 * — EVERY game must log through `logSession()`. Keyed per learner id so the
 * tutor dashboard / leaderboard / reports are all per-student.
 */
import { enqueueSession } from './data/cloudSync';
import { stableRead } from './data/stableRead';
import { notifyDataChanged } from './data/dataBus';

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

/** Memoized on the raw string → stable reference (safe in render & deps). */
export function loadSessionLog(learnerId: string): SessionRecord[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(logKey(learnerId));
  } catch {
    raw = null;
  }
  return stableRead<SessionRecord[]>(`sessionlog:${learnerId}`, raw ?? '∅', () => {
    try {
      const v = JSON.parse(raw ?? '[]');
      return Array.isArray(v) ? (v as SessionRecord[]) : [];
    } catch {
      return [];
    }
  });
}

export function logSession(learnerId: string, rec: Omit<SessionRecord, 'id'>): SessionRecord {
  const full: SessionRecord = { ...rec, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
  try {
    // Build a new array (never mutate the cached/shared one).
    const log = [...loadSessionLog(learnerId), full];
    localStorage.setItem(logKey(learnerId), JSON.stringify(log.slice(-MAX_RECORDS)));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
  // Queue for cloud sync (durable; no-op effect until flushed when signed in).
  // Static import is safe: cloudSync's back-reference to this module is type-only,
  // and it lazy-loads the heavy Supabase SDK itself, so this adds no bundle weight.
  enqueueSession(learnerId, rec);
  return full;
}

export function clearSessionLog(learnerId: string): void {
  try {
    localStorage.removeItem(logKey(learnerId));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

/**
 * Escape one CSV cell: quote when it contains a comma/quote/newline, and
 * neutralise spreadsheet formula injection — a leading = + - @ (or tab/CR) is
 * prefixed with a single quote so Excel/Sheets treat it as text, never a
 * formula. Defence-in-depth: today's columns are app-controlled values, but
 * this keeps exports safe if free-text columns (e.g. names) are added later.
 */
function csvCell(value: string | number): string {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
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
  return [head, ...rows].map((cols) => cols.map(csvCell).join(',')).join('\n');
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
