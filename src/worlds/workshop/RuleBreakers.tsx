import { WorkshopPick, type PickRound } from './WorkshopPick';
import { buildRuleRounds } from '../../content/packs/level3';
import { ruleKey } from '../../mastery/skills';

/** Rule Breakers — hear a short-vowel word, pick the correct ending (-ck, or the
 *  doubled FLOSS f/l/s/z). Enactive mastery: apply the rule, it works every time. */
export function RuleBreakers({ learnerId = 'guest' }: { learnerId?: string }) {
  const makeRounds = (): PickRound[] => buildRuleRounds(6).map((r) => ({
    word: r.word, emoji: r.emoji, stem: r.stem, options: r.options, correct: r.ending, skillKey: ruleKey(r.rule),
  }));
  return (
    <WorkshopPick
      learnerId={learnerId}
      gameId="rule-breakers"
      badge="📏 Rule Breakers"
      intro="Hear the word — which ending follows the rule? 📏"
      finishSay="Patch knows the rule now — and it works every single time. 📏"
      makeRounds={makeRounds}
    />
  );
}
