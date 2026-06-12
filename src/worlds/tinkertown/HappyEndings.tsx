import { AffixSnapGame } from './AffixSnapGame';
import { buildSuffixRounds, type SuffixRound } from '../../content/packs/level5';

/**
 * Happy Endings — Sprig's Level 5 SUFFIX game. A base word arrives with a JOB shown
 * as a picture; the child snaps on the ending whose job matches (meaning-first, not
 * spelling). The whole game loop lives in the shared AffixSnapGame; this supplies
 * only the suffix specifics. Logs affix:suffix.
 */
export function HappyEndings({ learnerId = 'guest' }: { learnerId?: string }) {
  return (
    <AffixSnapGame<SuffixRound>
      learnerId={learnerId}
      config={{
        gameId: 'l5-suffix',
        skill: 'affix:suffix',
        badge: <>➕ Happy Endings · Level 5</>,
        hint: 'Snap on the ending that does the job! ⚙️',
        help: <>⚙️ An ending changes the word's job — jump → jumping (doing it now).</>,
        finishTitle: 'Every part snapped on!',
        finishSay: 'Sprig loves how you matched each ending to its job. ⚙️',
        build: () => buildSuffixRounds(6),
        answerOf: (r) => r.suffix,
        optionsOf: (r) => r.options,
        baseOf: (r) => r.base,
        wordOf: (r) => r.word,
        renderTarget: (r) => (
          <>
            <p className="tt-base" aria-label={`the word ${r.base}`}>{r.base}</p>
            <p className="tt-job"><span className="tt-job__emoji" aria-hidden="true">{r.jobEmoji}</span>make it mean: <b>{r.job}</b></p>
          </>
        ),
        optionLabel: (o) => `‑${o}`,
        renderBuilt: (r) => (<>{r.base}<span className="tt-built__add">{r.suffix}</span></>),
      }}
    />
  );
}
