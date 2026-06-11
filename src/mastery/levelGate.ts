import { loadMastery, scoreOf, type MasteryMap, type SkillStat } from './mastery';
import { parseSkillKey } from './skills';
import { levelOverrideOf, gameOverrideOf } from './tutorOverrides';
import { isCheckpointPassed } from './levelProgress';
import { levelOfGame } from '../games';

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
    // Level 1 = phonemic awareness — any oral PA skill the learner has practised
    // (segment via Tap It Out, compare via Same or Different?, …).
    return Object.entries(map).filter(([k]) => k.startsWith('pa:')).map(([, s]) => s);
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
  if (level === 3) {
    // Level 3 = Patch's Workshop: blends, digraphs, the ck/FLOSS rules, syllables.
    return Object.entries(map)
      .filter(([k]) => k.startsWith('blend:') || k.startsWith('digraph:') || k.startsWith('rule:') || k.startsWith('syll:'))
      .map(([, s]) => s);
  }
  return []; // Levels 4+ have no live games yet
}

export interface LevelGate {
  /** how many of the level's skills are rated (≥ RATED_MIN attempts) */
  rated: number;
  /** 0..1 — the weakest rated skill's recency-weighted score (the gating value) */
  mastery: number;
  /** true once there's enough evidence AND every rated skill clears the 95% bar —
   *  i.e. the learner is READY to attempt the end-of-level checkpoint */
  ready: boolean;
}

/** Mastery readiness for a level from the learner's real practice data. */
export function levelGate(learnerId: string, level: number): LevelGate {
  const map = loadMastery(learnerId);
  const stats = levelSkillStats(map, level).filter((s) => s.attempts >= RATED_MIN);
  if (stats.length === 0) return { rated: 0, mastery: 0, ready: false };
  const mastery = Math.min(...stats.map(scoreOf));
  // Breadth check: L2 must show mastery across its three sound positions, so
  // require evidence in ≥3 skills; L1's single PA skill needs just itself.
  const enough = level === 1 ? stats.length >= 1 : stats.length >= 3;
  return { rated: stats.length, mastery, ready: enough && mastery >= PASS_BAR };
}

/** The learner has practised to mastery → the level's checkpoint is now available. */
export function isLevelReady(learnerId: string, level: number): boolean {
  return levelGate(learnerId, level).ready;
}

/**
 * A level is PASSED only once its end-of-level checkpoint (post-test) is cleared.
 * Reaching 95% mastery makes the checkpoint available; clearing it is the formal
 * Barton confirmation that unlocks the next level.
 */
export function isLevelPassed(learnerId: string, level: number): boolean {
  return isCheckpointPassed(learnerId, level);
}

/**
 * Whether a level is open to the learner. A tutor override wins; otherwise Level
 * 1 is always open and every later level needs the previous one's checkpoint passed.
 */
export function isLevelUnlocked(learnerId: string, level: number): boolean {
  const ov = levelOverrideOf(learnerId, level);
  if (ov === 'unlock') return true;
  if (ov === 'lock') return false;
  if (level <= 1) return true;
  return isLevelPassed(learnerId, level - 1);
}

/** Whether a specific game is playable: its level must be unlocked AND the tutor
 *  must not have locked the game individually. */
export function isGameUnlocked(learnerId: string, gameId: string): boolean {
  const lvl = levelOfGame(gameId);
  if (lvl != null && !isLevelUnlocked(learnerId, lvl)) return false;
  return gameOverrideOf(learnerId, gameId) !== 'lock';
}
