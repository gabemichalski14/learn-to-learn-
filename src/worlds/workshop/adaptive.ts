import { loadMastery, scoreOf } from '../../mastery/mastery';
import type { WeightOf } from '../../content/packs/level3';

/**
 * Adaptive round-selection weight for the Level 3 games. The learner's soft spots
 * come up more often, mastered skills less — keeping practice near the productive
 * ~85% zone instead of pure random. Unseen skills get a moderate weight so new
 * blends/digraphs/rules still get introduced.
 *   unseen → 2 · mastered → 1 · weakest → up to 5
 */
export function l3WeightOf(learnerId: string): WeightOf {
  const mastery = loadMastery(learnerId);
  return (skill) => {
    const s = mastery[skill];
    if (!s || s.attempts < 1) return 2;
    return Math.min(5, Math.max(1, Math.round((1 - scoreOf(s)) * 4) + 1));
  };
}
