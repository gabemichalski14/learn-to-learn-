/**
 * Learner profiles — the keystone of the platform's data layer. A tutor uses one
 * device for many students, so everything (progress, stickers, best times, the
 * session log) is keyed per learner id. Local-only today; the same shape syncs
 * to a center backend later (each learner would also carry a center/class id).
 */
export interface Learner {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

const LEARNERS_KEY = 'll-learners';
const CURRENT_KEY = 'll-current';
const COLORS = ['#12b3a8', '#ff7aa2', '#8a6bff', '#2bb8e6', '#ffb01f', '#33c27a', '#ff7a4d', '#d069e0'];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadLearners(): Learner[] {
  const list = readJSON<Learner[]>(LEARNERS_KEY, []);
  return Array.isArray(list) ? list.filter((l) => l && typeof l.id === 'string') : [];
}

function persist(list: Learner[]): void {
  try {
    localStorage.setItem(LEARNERS_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function setCurrentLearnerId(id: string): void {
  try {
    localStorage.setItem(CURRENT_KEY, id);
  } catch {
    /* ignore */
  }
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

export function addLearner(name: string): Learner {
  const list = loadLearners();
  const learner: Learner = {
    id: 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: name.trim() || `Player ${list.length + 1}`,
    color: COLORS[list.length % COLORS.length],
    createdAt: new Date().toISOString(),
  };
  persist([...list, learner]);
  setCurrentLearnerId(learner.id);
  return learner;
}

export function renameLearner(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  persist(loadLearners().map((l) => (l.id === id ? { ...l, name: trimmed } : l)));
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
