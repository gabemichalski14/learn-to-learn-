/**
 * Learner profiles — the keystone of the platform's data layer. A tutor uses one
 * device for many students, so everything (progress, stickers, best times, the
 * session log) is keyed per learner id. Local-only today; the same shape syncs
 * to a center backend later (each learner would also carry a center/class id).
 */
import { stableRead } from './data/stableRead';
import { notifyDataChanged } from './data/dataBus';

export interface Learner {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  cloudId?: string;
}

const LEARNERS_KEY = 'll-learners';
const CURRENT_KEY = 'll-current';
const COLORS = ['#12b3a8', '#ff7aa2', '#8a6bff', '#2bb8e6', '#ffb01f', '#33c27a', '#ff7a4d', '#d069e0'];

function rawOf(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * The roster. Memoized on the raw stored string so repeated reads return a
 * STABLE array reference until the data actually changes — `getLearner(id)`
 * therefore also returns a stable learner object. This is what keeps the value
 * safe to use in React dependency arrays (see data/stableRead.ts). Callers must
 * treat the result as read-only (derive with map/filter/sort, never mutate).
 */
export function loadLearners(): Learner[] {
  const raw = rawOf(LEARNERS_KEY);
  return stableRead<Learner[]>('learners', raw ?? '∅', () => {
    if (!raw) return [];
    try {
      const list = JSON.parse(raw) as Learner[];
      return Array.isArray(list) ? list.filter((l) => l && typeof l.id === 'string') : [];
    } catch {
      return [];
    }
  });
}

function persist(list: Learner[]): void {
  try {
    localStorage.setItem(LEARNERS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

/** Set the cloud learner uuid for a local profile (idempotent). */
export function setCloudId(localId: string, cloudId: string): void {
  const list = loadLearners();
  const target = list.find((x) => x.id === localId);
  if (target && target.cloudId !== cloudId) {
    // Rebuild immutably — never mutate the shared (cached) array in place.
    persist(list.map((x) => (x.id === localId ? { ...x, cloudId } : x)));
  }
}

const RECENT_KEY = 'll-recent';
function readRecent(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '{}'); } catch { return {}; }
}
/** Stamp a learner as just-active (drives the picker's sort order). */
export function markRecentlyActive(localId: string): void {
  try {
    const m = readRecent();
    m[localId] = Date.now();
    localStorage.setItem(RECENT_KEY, JSON.stringify(m));
  } catch { /* ignore */ }
  notifyDataChanged();
}
/** Learners sorted most-recently-active first (for the student picker). */
export function recentlyActiveOrder(list: Learner[]): Learner[] {
  const m = readRecent();
  return [...list].sort((a, b) => (m[b.id] ?? 0) - (m[a.id] ?? 0));
}

export function setCurrentLearnerId(id: string): void {
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

export function getCurrentLearnerId(): string | null {
  let id: string | null = null;
  try {
    id = localStorage.getItem(CURRENT_KEY);
  } catch {
    id = null;
  }
  const list = loadLearners();
  if (id && list.some((l) => l.id === id)) return id;
  return list[0]?.id ?? null;
}

export function getLearner(id: string | null): Learner | undefined {
  if (!id) return undefined;
  return loadLearners().find((l) => l.id === id);
}

export function addLearner(name: string, opts?: { color?: string; setCurrent?: boolean }): Learner {
  const list = loadLearners();
  const learner: Learner = {
    id: 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: name.trim() || `Player ${list.length + 1}`,
    color: opts?.color ?? COLORS[list.length % COLORS.length],
    createdAt: new Date().toISOString(),
  };
  persist([...list, learner]);
  if (opts?.setCurrent !== false) setCurrentLearnerId(learner.id);
  return learner;
}

export function renameLearner(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  persist(loadLearners().map((l) => (l.id === id ? { ...l, name: trimmed } : l)));
}

/** Sync a local profile's display fields from the cloud (no-op if unchanged). */
export function updateLearnerMeta(id: string, meta: { name?: string; color?: string }): void {
  const list = loadLearners();
  const t = list.find((l) => l.id === id);
  if (!t) return;
  const name = meta.name?.trim() || t.name;
  const color = meta.color || t.color;
  if (name === t.name && color === t.color) return;
  persist(list.map((l) => (l.id === id ? { ...l, name, color } : l)));
}

/** Remove a learner and all of their stored data (progress + session log). */
export function removeLearner(id: string): void {
  const list = loadLearners().filter((l) => l.id !== id);
  persist(list);
  try {
    ['earned', 'best', 'sessions', 'log'].forEach((suffix) => localStorage.removeItem(`ll:${id}:${suffix}`));
    if (localStorage.getItem(CURRENT_KEY) === id) {
      if (list[0]) setCurrentLearnerId(list[0].id);
      else localStorage.removeItem(CURRENT_KEY);
    }
  } catch {
    /* ignore */
  }
}

/** Ensure at least one learner exists; returns the current learner. */
export function ensureLearner(): Learner {
  const list = loadLearners();
  if (list.length === 0) return addLearner('Player 1');
  const id = getCurrentLearnerId();
  return list.find((l) => l.id === id) ?? list[0];
}

/** Initials for a compact avatar, e.g. "Ava B" → "AB". */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?';
}
