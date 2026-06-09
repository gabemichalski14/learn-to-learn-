import { notifyDataChanged } from '../data/dataBus';

/**
 * Which levels a learner has formally PASSED — i.e. cleared the end-of-level
 * post-test ("checkpoint"). This is the official Barton gate: a level is passed
 * only once the checkpoint is cleared (reaching 95% in-game mastery merely makes
 * the checkpoint *available*). Stored per learner; reactive.
 */
const key = (learnerId: string) => `ll:${learnerId}:passed`;

function load(learnerId: string): Record<number, true> {
  try {
    const v = JSON.parse(localStorage.getItem(key(learnerId)) ?? 'null');
    return v && typeof v === 'object' ? v : {};
  } catch {
    return {};
  }
}

export function isCheckpointPassed(learnerId: string, level: number): boolean {
  return load(learnerId)[level] === true;
}

export function markCheckpointPassed(learnerId: string, level: number): void {
  const map = load(learnerId);
  if (map[level]) return;
  map[level] = true;
  try { localStorage.setItem(key(learnerId), JSON.stringify(map)); } catch { /* ignore */ }
  notifyDataChanged();
}

export function clearCheckpoints(learnerId: string): void {
  try { localStorage.removeItem(key(learnerId)); } catch { /* ignore */ }
  notifyDataChanged();
}
