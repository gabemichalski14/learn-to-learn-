import { AffixSnapGame } from './AffixSnapGame';
import { buildPrefixRounds, type PrefixRound } from '../../content/packs/level5';

/**
 * Front Loaders — Sprig's Level 5 PREFIX game. A base word + its picture; the child
 * adds the prefix to the FRONT that makes the target meaning (lock → unlock), and
 * the picture flips. Shares the AffixSnapGame loop; supplies only the prefix
 * specifics (front-attach label + the flipping meaning picture). Logs affix:prefix.
 */
export function FrontLoaders({ learnerId = 'guest' }: { learnerId?: string }) {
  return (
    <AffixSnapGame<PrefixRound>
      learnerId={learnerId}
      config={{
        gameId: 'l5-prefix',
        skill: 'affix:prefix',
        badge: <>🔧 Front Loaders · Level 5</>,
        hint: 'Add the part to the FRONT that makes the meaning! 🔧',
        help: <>🔧 A part on the front flips the meaning — lock → unlock.</>,
        finishTitle: 'Front parts, all on!',
        finishSay: 'Sprig loves how one little part flipped the whole meaning. 🔧',
        build: () => buildPrefixRounds(6),
        answerOf: (r) => r.prefix,
        optionsOf: (r) => r.options,
        baseOf: (r) => r.base,
        wordOf: (r) => r.word,
        renderTarget: (r, solved) => (
          <>
            <div className="tt-pic" aria-hidden="true">{solved ? r.meaningEmoji : r.baseEmoji}</div>
            <p className="tt-base" aria-label={`the word ${r.base}`}>{r.base}</p>
            <p className="tt-job"><span className="tt-job__emoji" aria-hidden="true">{r.meaningEmoji}</span>make it mean: <b>{r.meaning}</b></p>
          </>
        ),
        optionLabel: (o) => `${o}‑`,
        renderBuilt: (r) => (<><span className="tt-built__add">{r.prefix}</span>{r.base}</>),
      }}
    />
  );
}
