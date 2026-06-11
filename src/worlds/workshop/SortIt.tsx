import { WorkshopPick, type PickRound } from './WorkshopPick';
import { buildSortItRounds } from '../../content/packs/level3';
import { digraphKey } from '../../mastery/skills';
import { l3WeightOf } from './adaptive';

/** Sort It — hear a word, tap the digraph bin it belongs in (sh/ch/th/wh/ck/ng).
 *  A wrong tap logs the confused digraph → the dashboard's confusion engine. */
export function SortIt({ learnerId = 'guest' }: { learnerId?: string }) {
  const makeRounds = (): PickRound[] => buildSortItRounds(6, Math.random, l3WeightOf(learnerId)).map((r) => ({
    word: r.word, emoji: r.emoji, options: r.options, correct: r.digraph, skillKey: digraphKey(r.digraph),
  }));
  return (
    <WorkshopPick
      learnerId={learnerId}
      gameId="sort-it"
      badge="🗂️ Sort It"
      intro="Hear the word — which sound do you hear? Tap its bin. 🗂️"
      finishSay="Patch sorted every sound into just the right place. 🗂️"
      makeRounds={makeRounds}
    />
  );
}
