/**
 * Single source of truth for a learner's local progress: which achievement
 * stickers they've earned, their best finish time, and sessions completed.
 * Kept in one small place so a future tutoring-center leaderboard / dashboard
 * can read/sync from it without touching game code.
 */

const BEST_KEY = 'll-besttime';
const SESSIONS_KEY = 'll-sessions';
const EARNED_KEY = 'll-achievements';

export interface Progress {
  /** Ids of earned achievement stickers (see achievements.ts). */
  earned: string[];
  /** Fastest finish in ms, or null if no session finished yet. */
  bestMs: number | null;
  /** Total sessions finished (all themes). */
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

export function loadEarned(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Merge newly-earned ids into the stored set; returns the full earned list. */
export function addEarned(ids: string[]): string[] {
  const merged = Array.from(new Set([...loadEarned(), ...ids]));
  try {
    localStorage.setItem(EARNED_KEY, JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  return merged;
}

export function loadProgress(): Progress {
  return { earned: loadEarned(), bestMs: readNumber(BEST_KEY), sessions: readNumber(SESSIONS_KEY) ?? 0 };
}

export interface FinishResult {
  bestMs: number;
  /** True only when this run beat a previous best (never on the very first run). */
  isBest: boolean;
  sessions: number;
}

/** Record a finished session's time + count (achievements are handled separately). */
export function recordFinish(elapsedMs: number): FinishResult {
  const prevBest = readNumber(BEST_KEY);
  const prevSessions = readNumber(SESSIONS_KEY) ?? 0;
  const ms = Math.max(0, Math.round(elapsedMs));

  const isBest = prevBest != null && ms < prevBest;
  const bestMs = prevBest == null ? ms : Math.min(prevBest, ms);
  const sessions = prevSessions + 1;

  try {
    localStorage.setItem(BEST_KEY, String(bestMs));
    localStorage.setItem(SESSIONS_KEY, String(sessions));
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
