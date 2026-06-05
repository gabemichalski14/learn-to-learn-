/**
 * Per-learner progress: earned achievement ids, best finish time, sessions
 * completed. All keys are namespaced by learner id (`ll:<id>:…`) so a tutor's
 * device cleanly separates students. A future backend syncs this same shape.
 */

const k = (learnerId: string, suffix: string) => `ll:${learnerId}:${suffix}`;

export interface Progress {
  earned: string[];
  bestMs: number | null;
  sessions: number;
}

export interface FinishResult {
  bestMs: number;
  isBest: boolean;
  sessions: number;
}

function readNumber(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function loadEarned(learnerId: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(k(learnerId, 'earned')) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function addEarned(learnerId: string, ids: string[]): string[] {
  const merged = Array.from(new Set([...loadEarned(learnerId), ...ids]));
  try {
    localStorage.setItem(k(learnerId, 'earned'), JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  return merged;
}

export function loadProgress(learnerId: string): Progress {
  return {
    earned: loadEarned(learnerId),
    bestMs: readNumber(k(learnerId, 'best')),
    sessions: readNumber(k(learnerId, 'sessions')) ?? 0,
  };
}

export function recordFinish(learnerId: string, elapsedMs: number): FinishResult {
  const prevBest = readNumber(k(learnerId, 'best'));
  const prevSessions = readNumber(k(learnerId, 'sessions')) ?? 0;
  const ms = Math.max(0, Math.round(elapsedMs));

  const isBest = prevBest != null && ms < prevBest;
  const bestMs = prevBest == null ? ms : Math.min(prevBest, ms);
  const sessions = prevSessions + 1;

  try {
    localStorage.setItem(k(learnerId, 'best'), String(bestMs));
    localStorage.setItem(k(learnerId, 'sessions'), String(sessions));
  } catch {
    /* ignore */
  }

  return { bestMs, isBest, sessions };
}

/** Milliseconds → "M:SS". */
export function formatTime(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
