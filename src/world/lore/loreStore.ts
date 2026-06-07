/**
 * The lore store — the ONLY persisted piece of the narrative system. Everything
 * else (named plantings, story stage logic, which line to say) is DERIVED from
 * mastery + this small record of "what the learner has already been shown / how
 * bonded they are." Per-learner, keyed `ll:<id>:lore`.
 *
 * Loop-safe by construction: reads go through `stableRead` (same stable ref until
 * the raw string changes); writes happen only at event time and call
 * `notifyDataChanged()`, which wakes `useLore` via the reactive store. Never read
 * or write this during render.
 */
import { useDataVersion } from '../../data/store';
import { stableRead } from '../../data/stableRead';
import { notifyDataChanged } from '../../data/dataBus';

export type StoryStage = 'dormant' | 'arrived' | 'healing' | 'healed' | 'resident';

export interface StoryRecord {
  stage: StoryStage;
  introducedAt?: number; // epoch ms, set once when the creature first arrives
  healedAt?: number;     // epoch ms, set once when the sound is recovered
}

export interface LoreState {
  /** Beat ids already shown once (new-bloom beats, story beats) so they don't repeat. */
  acknowledged: string[];
  /** Per-story progress. */
  stories: Record<string, StoryRecord>;
  /** Per-character interaction counter → bond tier (see characters.ts). Never decays. */
  bonds: Record<string, number>;
  /** Ring buffer of recently-shown line ids → the no-immediate-repeat rule. */
  recentLines: string[];
  /** Current chapter (the journey layer). Seam for the chapters pass. */
  chapterId?: string;
}

const RECENT_CAP = 12;
const EMPTY: LoreState = { acknowledged: [], stories: {}, bonds: {}, recentLines: [] };
const key = (learnerId: string) => `ll:${learnerId}:lore`;

function parse(raw: string | null): LoreState {
  if (!raw) return EMPTY;
  try {
    const v = JSON.parse(raw) as Partial<LoreState> | null;
    if (!v || typeof v !== 'object') return EMPTY;
    return {
      acknowledged: Array.isArray(v.acknowledged) ? v.acknowledged : [],
      stories: v.stories && typeof v.stories === 'object' ? v.stories : {},
      bonds: v.bonds && typeof v.bonds === 'object' ? v.bonds : {},
      recentLines: Array.isArray(v.recentLines) ? v.recentLines : [],
      chapterId: typeof v.chapterId === 'string' ? v.chapterId : undefined,
    };
  } catch {
    return EMPTY;
  }
}

/** Stable-ref read of the learner's lore (safe to call in render via useLore). */
export function loadLore(learnerId: string): LoreState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(learnerId));
  } catch {
    raw = null;
  }
  return stableRead<LoreState>(`lore:${learnerId}`, raw ?? '∅', () => parse(raw));
}

function save(learnerId: string, state: LoreState): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify(state));
  } catch {
    /* ignore quota/availability */
  }
  notifyDataChanged();
}

// ---- Mutators (event-time only) --------------------------------------------

/** Mark a one-time beat as shown. Idempotent. */
export function acknowledge(learnerId: string, id: string): void {
  const s = loadLore(learnerId);
  if (s.acknowledged.includes(id)) return;
  save(learnerId, { ...s, acknowledged: [...s.acknowledged, id] });
}

export function isAcknowledged(learnerId: string, id: string): boolean {
  return loadLore(learnerId).acknowledged.includes(id);
}

/** Deepen a bond (an interaction with a character). Never decays. */
export function bumpBond(learnerId: string, characterId: string, by = 1): void {
  const s = loadLore(learnerId);
  save(learnerId, { ...s, bonds: { ...s.bonds, [characterId]: (s.bonds[characterId] ?? 0) + by } });
}

export function bondOf(learnerId: string, characterId: string): number {
  return loadLore(learnerId).bonds[characterId] ?? 0;
}

/** Advance a story to a stage, stamping introducedAt/healedAt once. */
export function setStoryStage(learnerId: string, storyId: string, stage: StoryStage, stampNow?: number): void {
  const s = loadLore(learnerId);
  const prev = s.stories[storyId] ?? { stage: 'dormant' as StoryStage };
  const rec: StoryRecord = { ...prev, stage };
  const now = stampNow ?? Date.now();
  if (stage === 'arrived' && rec.introducedAt == null) rec.introducedAt = now;
  if (stage === 'healed' && rec.healedAt == null) rec.healedAt = now;
  save(learnerId, { ...s, stories: { ...s.stories, [storyId]: rec } });
}

/** Record a shown line id (most-recent at the end, capped). */
export function pushRecentLine(learnerId: string, lineId: string): void {
  const s = loadLore(learnerId);
  const recentLines = [...s.recentLines.filter((x) => x !== lineId), lineId].slice(-RECENT_CAP);
  save(learnerId, { ...s, recentLines });
}

export function setChapter(learnerId: string, chapterId: string): void {
  const s = loadLore(learnerId);
  if (s.chapterId === chapterId) return;
  save(learnerId, { ...s, chapterId });
}

export function clearLore(learnerId: string): void {
  try {
    localStorage.removeItem(key(learnerId));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

/** Reactive lore for the current learner (re-renders on any local write). */
export function useLore(learnerId: string): LoreState {
  useDataVersion();
  return loadLore(learnerId);
}
