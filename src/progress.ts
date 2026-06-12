/**
 * Per-learner progress: earned achievement ids, best finish time, sessions
 * completed. All keys are namespaced by learner id (`ll:<id>:…`) so a tutor's
 * device cleanly separates students. A future backend syncs this same shape.
 */

import { stableRead } from './data/stableRead';
import { notifyDataChanged } from './data/dataBus';
import { syncReviewOnSessionEnd } from './world/memory/reviewStore';

const k = (learnerId: string, suffix: string) => `ll:${learnerId}:${suffix}`;

function rawOf(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

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

/** Earned achievement ids — memoized on the raw string for a stable reference
 *  (safe as a React dependency; see data/stableRead.ts). */
export function loadEarned(learnerId: string): string[] {
  const raw = rawOf(k(learnerId, 'earned'));
  return stableRead<string[]>(`earned:${learnerId}`, raw ?? '∅', () => {
    try {
      const parsed = JSON.parse(raw ?? '[]');
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });
}

export function addEarned(learnerId: string, ids: string[]): string[] {
  const merged = Array.from(new Set([...loadEarned(learnerId), ...ids]));
  try {
    localStorage.setItem(k(learnerId, 'earned'), JSON.stringify(merged));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
  return merged;
}

/** A learner's progress snapshot — memoized on the raw stored values so the same
 *  object reference is returned until something actually changes. Stable to use
 *  in render and dependency arrays. */
export function loadProgress(learnerId: string): Progress {
  const earnedRaw = rawOf(k(learnerId, 'earned')) ?? '';
  const bestRaw = rawOf(k(learnerId, 'best')) ?? '';
  const sessRaw = rawOf(k(learnerId, 'sessions')) ?? '';
  return stableRead<Progress>(
    `progress:${learnerId}`,
    `${earnedRaw}|${bestRaw}|${sessRaw}`,
    () => ({
      earned: loadEarned(learnerId),
      bestMs: readNumber(k(learnerId, 'best')),
      sessions: readNumber(k(learnerId, 'sessions')) ?? 0,
    }),
  );
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
  notifyDataChanged();

  // Memory engine: a session just ended — enroll newly-mastered skills into spaced
  // review and mint interleave pairs from captured confusions (local-first,
  // idempotent). Surfacing them to the learner is the deferred "garden tending"
  // warm-up (B3); this only populates the review store.
  syncReviewOnSessionEnd(learnerId);

  return { bestMs, isBest, sessions };
}

/** Milliseconds → "M:SS". */
export function formatTime(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
