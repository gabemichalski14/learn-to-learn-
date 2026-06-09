import { parseSkillKey, type SkillKey } from './skills';
import type { SoundTarget } from '../domain/types';

export interface SkillStat {
  attempts: number;
  correct: number;
  recent: number[]; // last K results, 1 = correct, 0 = wrong (oldest -> newest)
  lastSeen: number; // epoch ms
  /** Times the learner re-heard this sound/word (local enrichment — uncertainty signal). */
  replays?: number;
  /** Rolling-mean response time in ms (local enrichment; only for sequential games). */
  avgMs?: number;
  /** How many attempts contributed to avgMs. */
  timed?: number;
}

export type MasteryMap = Record<SkillKey, SkillStat>;

export interface FocusArea {
  skillKey: SkillKey;
  score: number;   // 0..1 rolling
  attempts: number;
}

export const K = 10; // rolling window (also used by masteryFromEvents)
const RATED_MIN = 5;       // attempts before a skill is rated
const IMPROVE_BELOW = 0.8; // score under this = needs work
const key = (learnerId: string) => `ll:${learnerId}:mastery`;

export function loadMastery(learnerId: string): MasteryMap {
  try {
    const v = JSON.parse(localStorage.getItem(key(learnerId)) ?? '{}');
    return v && typeof v === 'object' ? (v as MasteryMap) : {};
  } catch {
    return {};
  }
}

function save(learnerId: string, map: MasteryMap): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

/** Record ONE per-item result (called once per item per round, on first attempt).
 *  `ms` (optional) is the learner's response time for this item; when present and
 *  sane it folds into a rolling-mean `avgMs` (used by the tutor view, never to
 *  pressure the learner — we have no timers in the kid UI). */
export function recordItem(learnerId: string, skillKey: SkillKey, correct: boolean, ms?: number): void {
  const map = loadMastery(learnerId);
  const s = map[skillKey] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
  s.attempts += 1;
  if (correct) s.correct += 1;
  s.recent.push(correct ? 1 : 0);
  if (s.recent.length > K) s.recent = s.recent.slice(-K);
  s.lastSeen = Date.now();
  if (typeof ms === 'number' && isFinite(ms) && ms > 0 && ms < 120000) {
    const timed = (s.timed ?? 0) + 1;
    const prev = s.avgMs ?? ms;
    s.avgMs = Math.round(prev + (ms - prev) / timed); // running mean
    s.timed = timed;
  }
  map[skillKey] = s;
  save(learnerId, map);
}

/** Record that the learner re-heard a sound/word (a soft "I'm not sure" signal). */
export function recordReplay(learnerId: string, skillKey: SkillKey): void {
  if (!skillKey) return;
  const map = loadMastery(learnerId);
  const s = map[skillKey] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
  s.replays = (s.replays ?? 0) + 1;
  map[skillKey] = s;
  save(learnerId, map);
}

/** Recency-weighted accuracy over the rolling window. Unseen skills score 1 (solid). */
export function scoreOf(s: SkillStat | undefined): number {
  if (!s || s.recent.length === 0) return 1;
  let num = 0;
  let den = 0;
  s.recent.forEach((val, i) => {
    const w = i + 1; // newer answers weigh more
    num += w * val;
    den += w;
  });
  return den === 0 ? 1 : num / den;
}

export function masteryScore(learnerId: string, skillKey: SkillKey): number {
  return scoreOf(loadMastery(learnerId)[skillKey]);
}

/** Rank a mastery map's rated, weak skills (weakest first), capped at n. */
export function rankAreas(map: MasteryMap, n = 3): FocusArea[] {
  return Object.entries(map)
    .filter(([, s]) => s.attempts >= RATED_MIN)
    .map(([skillKey, s]) => ({ skillKey, score: scoreOf(s), attempts: s.attempts, lastSeen: s.lastSeen }))
    .filter((a) => a.score < IMPROVE_BELOW)
    .sort((a, b) => a.score - b.score || b.lastSeen - a.lastSeen)
    .slice(0, n)
    .map(({ skillKey, score, attempts }) => ({ skillKey, score, attempts }));
}

/**
 * Rated, weak skills (weakest first), drawn from whatever the learner has
 * actually practiced.
 *
 * NOTE (Phase 1, intentional deviation from the design spec §4): the spec calls
 * for restricting this to skills introduced at/below the learner's *current
 * lesson* (via `soundsThrough`). We defer that scoping until placement is
 * tutor-settable (Phase 3): placement defaults to Level 1 / Lesson 1, Level 1 is
 * oral (no letter sounds), and the only live games train Level-2 sounds — so
 * lesson-scoping now would always blank the list. Ranking by what's actually
 * been practiced is the meaningful behavior for Phase 1.
 */
export function areasToImprove(learnerId: string, n = 3): FocusArea[] {
  return rankAreas(loadMastery(learnerId), n);
}

/**
 * The learner's weakest *rated, weak* sound for a given target (beginning /
 * ending / medial), restricted to sounds that exist in `pool` (the pack's
 * sounds). Drives gentle adaptive practice: a normal session auto-weights toward
 * this sound. Returns undefined when nothing's rated weak yet (→ stay random).
 */
export function weakestSoundForTarget(map: MasteryMap, target: SoundTarget, pool: string[]): string | undefined {
  const cands = Object.entries(map)
    .map(([k, s]) => ({ p: parseSkillKey(k), s }))
    .filter((x) => x.p != null && x.p.target === target && pool.includes(x.p.soundId))
    .filter((x) => x.s.attempts >= RATED_MIN && scoreOf(x.s) < IMPROVE_BELOW)
    .map((x) => ({ sound: x.p!.soundId, score: scoreOf(x.s), lastSeen: x.s.lastSeen }))
    .sort((a, b) => a.score - b.score || b.lastSeen - a.lastSeen);
  return cands[0]?.sound;
}

export function clearMastery(learnerId: string): void {
  try {
    localStorage.removeItem(key(learnerId));
  } catch {
    /* ignore */
  }
}
