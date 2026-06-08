import { notifyDataChanged } from './dataBus';

/**
 * A tiny per-learner counter of "chats with Pip" (taps that make the buddy
 * speak) — powers the friendly "Most chats with Pip" leaderboard. Local-only,
 * loop-safe (read/write at click time), and bounded so it can't grow unbounded.
 */
const key = (learnerId: string) => `ll:${learnerId}:pipchats`;

export function pipChats(learnerId: string): number {
  try {
    const n = parseInt(localStorage.getItem(key(learnerId)) ?? '0', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function bumpPipChat(learnerId: string): void {
  try {
    localStorage.setItem(key(learnerId), String(Math.min(99999, pipChats(learnerId) + 1)));
    notifyDataChanged();
  } catch {
    /* ignore — a cosmetic counter */
  }
}
