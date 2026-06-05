/**
 * Single source of truth for a learner's local progress: collected stickers,
 * best finish time, and sessions completed. Kept in one place (and in a small,
 * explicit shape) so a future tutoring-center leaderboard can read/sync from it
 * without touching game code.
 */

export const STICKERS = ['🌟', '🦄', '🌈', '🚀', '🦋', '🐬', '🌻', '🐢', '🎈', '🐱', '🦉', '🐠'];

const STICKER_KEY = 'll-stickers';
const BEST_KEY = 'll-besttime';
const SESSIONS_KEY = 'll-sessions';

export interface Progress {
  /** Every sticker ever awarded, in order (may repeat once all uniques are earned). */
  stickers: string[];
  /** Fastest finish in ms, or null if no session finished yet. */
  bestMs: number | null;
  /** Total sessions finished (all themes). */
  sessions: number;
}

export interface FinishResult {
  /** The sticker just awarded (null when not awarding, e.g. the Clean theme). */
  sticker: string | null;
  collection: string[];
  bestMs: number;
  /** True only when this run beat a previous best (never on the very first run). */
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

export function loadProgress(): Progress {
  let stickers: string[] = [];
  try {
    const raw = JSON.parse(localStorage.getItem(STICKER_KEY) ?? '[]');
    if (Array.isArray(raw)) stickers = raw.filter((x): x is string => typeof x === 'string');
  } catch {
    stickers = [];
  }
  return { stickers, bestMs: readNumber(BEST_KEY), sessions: readNumber(SESSIONS_KEY) ?? 0 };
}

/** Record a finished session: updates best time + session count, optionally awards a sticker. */
export function recordFinish(elapsedMs: number, awardSticker: boolean): FinishResult {
  const cur = loadProgress();
  const ms = Math.max(0, Math.round(elapsedMs));

  const isBest = cur.bestMs != null && ms < cur.bestMs;
  const bestMs = cur.bestMs == null ? ms : Math.min(cur.bestMs, ms);

  let sticker: string | null = null;
  let collection = cur.stickers;
  if (awardSticker) {
    sticker = STICKERS[cur.stickers.length % STICKERS.length];
    collection = [...cur.stickers, sticker];
  }

  const sessions = cur.sessions + 1;

  try {
    localStorage.setItem(BEST_KEY, String(bestMs));
    localStorage.setItem(SESSIONS_KEY, String(sessions));
    if (awardSticker) localStorage.setItem(STICKER_KEY, JSON.stringify(collection));
  } catch {
    /* ignore */
  }

  return { sticker, collection, bestMs, isBest, sessions };
}

/** Milliseconds → "M:SS". */
export function formatTime(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
