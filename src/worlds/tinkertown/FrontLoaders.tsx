import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildPrefixRounds, type PrefixRound } from '../../content/packs/level5';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './tinkertown.css';

const ROUNDS = 6;
const SKILL = 'affix:prefix';
const HINT = 'Add the part to the FRONT that makes the meaning! 🔧';

/**
 * Front Loaders — Sprig's Level 5 PREFIX game. A base word + its picture (lock 🔒);
 * the child adds the prefix to the FRONT that makes the target meaning (open it →
 * un-). On a correct attach the word rebuilds (lock → unlock), the picture flips to
 * the new meaning, and the word is re-spoken. Front-attach (vs Happy Endings' end-
 * snap) makes prefix-vs-suffix a spatial contrast. Logs one affix:prefix per word.
 */
export function FrontLoaders({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(5); // Sprig
  const [rounds, setRounds] = useState<PrefixRound[]>(() => buildPrefixRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(HINT);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const roundWrongRef = useRef(0);
  const firstWrongRef = useRef<string | undefined>(undefined);
  const shownRef = useRef(0);
  const replaysRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); replaysRef.current = 0; say(round.base); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  const solved = round != null && picked === round.prefix;

  function choose(opt: string) {
    if (picked !== null || !round || finish || advancingRef.current) return;
    const correct = opt === round.prefix;
    setPicked(opt);
    if (correct) {
      advancingRef.current = true;
      const firstTry = roundWrongRef.current === 0;
      const chosen = firstWrongRef.current;
      const shown = shownRef.current;
      const replays = replaysRef.current;
      window.setTimeout(() => {
        const latencyMs = Date.now() - shown;
        recordItem(learnerId, SKILL, firstTry, latencyMs, firstTry ? undefined : chosen);
        logSkillEvent(learnerId, { skillKey: SKILL, correct: firstTry, at: Date.now(), game: 'l5-prefix', level: 5, firstTry: true, latencyMs, replays, chosen: firstTry ? undefined : chosen });
      }, 0);
      sfx.correct(); setMood('cheer');
      window.setTimeout(() => say(round.word), 360);
      if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => {
        setMood(null); setPicked(null);
        roundWrongRef.current = 0; firstWrongRef.current = undefined;
        if (ri + 1 >= rounds.length) finishSession(Date.now());
        else { setRi((n) => n + 1); setLine(HINT); }
      }, 1300);
    } else {
      wrongRef.current += 1; roundWrongRef.current += 1;
      if (firstWrongRef.current === undefined) firstWrongRef.current = opt;
      sfx.wrong(); setMood('wobble');
      if (character) setLine(reactionLine(character, 'wrong'));
      window.setTimeout(() => { setMood(null); setPicked(null); }, 800);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'l5-prefix', level: 5,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: rounds.length, items: rounds.length, wrongAttempts: wrongRef.current,
      accuracy: rounds.length / (rounds.length + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    roundWrongRef.current = 0; firstWrongRef.current = undefined; startRef.current = Date.now();
    setRounds(buildPrefixRounds(ROUNDS)); setFinish(null); setRi(0); setPicked(null); setLine(HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game tt"
      back={{ label: '← Tinker Town', onClick: () => goBack('#/level/5') }}
      badge={<>🔧 Front Loaders · Level 5</>}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Front parts, all on! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{character?.name ?? 'Sprig'} loves how one little part flipped the whole meaning. 🔧</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Build more 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/5')}>Back to Tinker Town</button>
            </div>
          </div>
        </div>
      ) : round ? (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Sprig'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood={mood} size={88} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <div className="tt-pic" aria-hidden="true">{solved ? round.meaningEmoji : round.baseEmoji}</div>
          <p className="tt-base" aria-label={`the word ${round.base}`}>{round.base}</p>
          <p className="tt-job"><span className="tt-job__emoji" aria-hidden="true">{round.meaningEmoji}</span>make it mean: <b>{round.meaning}</b></p>

          <div className="tt-opts" role="group" aria-label="prefixes to add to the front">
            {round.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`tt-part${picked === opt ? (opt === round.prefix ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null}
                onClick={() => choose(opt)}
                aria-label={`add the ${opt} prefix to the front`}
              >{opt}‑</button>
            ))}
          </div>

          <p className="tt-built" aria-live="polite">
            {solved ? <><span className="tt-built__add">{round.prefix}</span>{round.base}</> : ' '}
          </p>
          {solved && <button type="button" className="tt-hear" onClick={() => say(round.word)}>🔊 hear it</button>}

          <p className="tt-help">🔧 A part on the front flips the meaning — lock → unlock.</p>
        </div>
      ) : null}
    </GameShell>
  );
}
