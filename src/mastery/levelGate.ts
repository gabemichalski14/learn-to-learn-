import { loadMastery, scoreOf, type MasteryMap, type SkillStat } from './mastery';
import { parseSkillKey } from './skills';

/**
 * Mastery-gated progression — the Barton rule: a student starts at Level 1 and
 * cannot move to the next level until the current one is passed at **true
 * mastery (~95% accuracy)**. This module computes, from the learner's real
 * practice data, whether a level is passed and therefore whether the next is
 * unlocked. (The friendly post-test "checkpoint" — phase 1b — will become the
 * formal confirmation that flips a level to passed; until then we use in-game
 * mastery, which research endorses as valid "stealth assessment".)
 */
export const PASS_BAR = 0.95; // Barton "true mastery"
const RATED_MIN = 5; // attempts before a skill is rated (matches mastery.ts)

/** The rated skill-stats that a level is built around. */
function levelSkillStats(map: MasteryMap, level: number): SkillStat[] {
  if (level === 1) {
    // Level 1 = phonemic awareness — a single oral PA skill.
    const s = map['pa:segment'];
    return s ? [s] : [];
  }
  if (level === 2) {
    // Level 2 = letter sounds: first / last / medial.
    return Object.entries(map)
      .filter(([k]) => {
        const p = parseSkillKey(k);
        return !!p && (p.target === 'beginning' || p.target === 'ending' || p.target === 'medial');
      })
      .map(([, s]) => s);
  }
  return []; // Levels 3+ have no live games yet
}

export interface LevelGate {
  /** how many of the level's skills are rated (≥ RATED_MIN attempts) */
  rated: number;
  /** 0..1 — the weakest rated skill's recency-weighted score (the gating value) */
  mastery: number;
  /** true once there's enough evidence AND every rated skill clears the 95% bar */
  passed: boolean;
}

/** Gate status for a level from the learner's real practice data. */
export function levelGate(learnerId: string, level: number): LevelGate {
  const map = loadMastery(learnerId);
  const stats = levelSkillStats(map, level).filter((s) => s.attempts >= RATED_MIN);
  if (stats.length === 0) return { rated: 0, mastery: 0, passed: false };
  const mastery = Math.min(...stats.map(scoreOf));
  // Breadth check: L2 must show mastery across its three sound positions, so
  // require evidence in ≥3 skills; L1's single PA skill needs just itself.
  const enough = level === 1 ? stats.length >= 1 : stats.length >= 3;
  return { rated: stats.length, mastery, passed: enough && mastery >= PASS_BAR };
}

export function isLevelPassed(learnerId: string, level: number): boolean {
  return levelGate(learnerId, level).passed;
}

/** Level 1 is always open; every later level needs the previous one passed. */
export function isLevelUnlocked(learnerId: string, level: number): boolean {
  if (level <= 1) return true;
  return isLevelPassed(learnerId, level - 1);
}
