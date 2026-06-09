import { notifyDataChanged } from '../data/dataBus';

/**
 * Tutor lock/unlock overrides, per learner. The default progression is the
 * automatic Barton mastery-gate (see levelGate.ts); a signed-in tutor can
 * override it for a specific student — force-unlock a level (e.g. they've been
 * assessed elsewhere) or lock a level/game (pause it, or have them redo it).
 * Stored locally per learner; reactive via notifyDataChanged.
 */
export type LockState = 'lock' | 'unlock';

export interface Overrides {
  levels: Record<number, LockState>;
  games: Record<string, LockState>;
}

const key = (learnerId: string) => `ll:${learnerId}:overrides`;
const EMPTY: Overrides = { levels: {}, games: {} };

export function loadOverrides(learnerId: string): Overrides {
  try {
    const v = JSON.parse(localStorage.getItem(key(learnerId)) ?? 'null');
    if (v && typeof v === 'object') return { levels: v.levels ?? {}, games: v.games ?? {} };
  } catch { /* ignore */ }
  return { levels: {}, games: {} };
}

function save(learnerId: string, o: Overrides): void {
  try {
    // prune empties so the record stays tidy
    const tidy: Overrides = { levels: { ...o.levels }, games: { ...o.games } };
    if (Object.keys(tidy.levels).length === 0 && Object.keys(tidy.games).length === 0) {
      localStorage.removeItem(key(learnerId));
    } else {
      localStorage.setItem(key(learnerId), JSON.stringify(tidy));
    }
  } catch { /* ignore */ }
  notifyDataChanged();
}

export function levelOverrideOf(learnerId: string, level: number): LockState | undefined {
  return loadOverrides(learnerId).levels[level];
}
export function gameOverrideOf(learnerId: string, gameId: string): LockState | undefined {
  return loadOverrides(learnerId).games[gameId];
}

/** Set (or clear, when `state` is null) a level's tutor override. */
export function setLevelOverride(learnerId: string, level: number, state: LockState | null): void {
  const o = loadOverrides(learnerId);
  if (state === null) delete o.levels[level];
  else o.levels[level] = state;
  save(learnerId, o);
}

/** Set (or clear) a game's tutor override. */
export function setGameOverride(learnerId: string, gameId: string, state: LockState | null): void {
  const o = loadOverrides(learnerId);
  if (state === null) delete o.games[gameId];
  else o.games[gameId] = state;
  save(learnerId, o);
}

export { EMPTY as EMPTY_OVERRIDES };
