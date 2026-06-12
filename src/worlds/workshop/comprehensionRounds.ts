import { resolveInventory } from '../../reading/inventory';
import { composeUnit } from '../../reading/compose';
import { makeMeaningQuestion, type MeaningQuestion } from '../../reading/comprehend';

/**
 * Round builder for "What's It About?" (Level 3 comprehension). Each round is a
 * decodable sentence + a meaning question whose distractors share the answer's
 * category (animals vs animals…), so the child must understand the sentence, not
 * picture-match. Pure + deterministic; built entirely on the reading engine.
 */
export type ComprehensionRound = MeaningQuestion & {
  options: (MeaningQuestion['options'][number] & { emoji: string })[];
};

export function buildComprehensionRounds(n: number, rng: () => number = Math.random, level = 3): ComprehensionRound[] {
  const inv = resolveInventory(level);
  const rounds: ComprehensionRound[] = [];
  for (let guard = 0; rounds.length < n && guard < n * 30; guard++) {
    const unit = composeUnit(inv, 'sentence', rng);
    if (!unit) break;
    const q = makeMeaningQuestion(unit, inv, rng);
    // every option must be picturable for the tap-a-picture answer
    if (q && q.options.every((o) => !!o.emoji)) rounds.push(q as ComprehensionRound);
  }
  return rounds;
}
