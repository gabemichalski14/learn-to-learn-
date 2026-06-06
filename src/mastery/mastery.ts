import type { SkillKey } from './skills';

export interface SkillStat {
  attempts: number;
  correct: number;
  recent: number[]; // last K results, 1 = correct, 0 = wrong (oldest -> newest)
  lastSeen: number; // epoch ms
}

export type MasteryMap = Record<SkillKey, SkillStat>;

export interface FocusArea {
  skillKey: SkillKey;
  score: number;   // 0..1 rolling
  attempts: number;
}

const K = 10;              // rolling window
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

/** Record ONE per-item result (called once per item per round, on first attempt). */
export function recordItem(learnerId: string, skillKey: SkillKey, correct: boolean): void {
  const map = loadMastery(learnerId);
  const s = map[skillKey] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
  s.attempts += 1;
  if (correct) s.correct += 1;
  s.recent.push(correct ? 1 : 0);
  if (s.recent.length > K) s.recent = s.recent.slice(-K);
  s.lastSeen = Date.now();
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

/** Rated, weak skills (weakest first). */
export function areasToImprove(learnerId: string, n = 3): FocusArea[] {
  const map = loadMastery(learnerId);
  return Object.entries(map)
    .filter(([, s]) => s.attempts >= RATED_MIN)
    .map(([skillKey, s]) => ({ skillKey, score: scoreOf(s), attempts: s.attempts, lastSeen: s.lastSeen }))
    .filter((a) => a.score < IMPROVE_BELOW)
    .sort((a, b) => a.score - b.score || b.lastSeen - a.lastSeen)
    .slice(0, n)
    .map(({ skillKey, score, attempts }) => ({ skillKey, score, attempts }));
}

export function clearMastery(learnerId: string): void {
  try {
    localStorage.removeItem(key(learnerId));
  } catch {
    /* ignore */
  }
}
