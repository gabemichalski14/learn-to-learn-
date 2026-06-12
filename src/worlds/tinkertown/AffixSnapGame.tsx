import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
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

/**
 * AffixSnapGame — the shared "snap the right affix on" loop behind Sprig's Happy
 * Endings (suffixes) and Front Loaders (prefixes). They were ~90% identical; the
 * timer/ref/scoring/telemetry machinery now lives here ONCE (per the congruence
 * rule), so a fix lands in both — including `replays`, which is wired to a real
 * "hear it again" button (it was previously declared but never incremented).
 *
 * A game supplies only what differs: its data, the answer field, and how to render
 * the target (picture/job) + the option labels + the rebuilt word.
 */
export interface AffixGameConfig<R> {
  gameId: string;
  skill: string;
  badge: ReactNode;
  hint: string;
  help: ReactNode;
  finishTitle: string;
  finishSay: string;
  build: () => R[];
  answerOf: (r: R) => string;
  optionsOf: (r: R) => string[];
  baseOf: (r: R) => string; // the cue word played + re-heard
  wordOf: (r: R) => string; // the rebuilt word, re-spoken on a correct snap
  renderTarget: (r: R, solved: boolean) => ReactNode; // picture / job / meaning area
  optionLabel: (opt: string) => string; // `‑${o}` (suffix) or `${o}‑` (prefix)
  renderBuilt: (r: R) => ReactNode; // base+add or add+base, shown once solved
}

export function AffixSnapGame<R>({ learnerId = 'guest', config }: { learnerId?: string; config: AffixGameConfig<R> }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(5); // Sprig
  const [rounds, setRounds] = useState<R[]>(() => config.build());
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(config.hint);
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
  const answer = round != null ? config.answerOf(round) : '';
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); replaysRef.current = 0; say(config.baseOf(round)); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  const hearAgain = () => { if (round) { replaysRef.current += 1; say(config.baseOf(round)); sfx.tap(); } };
  const solved = round != null && picked === answer;

  function choose(opt: string) {
    if (picked !== null || !round || finish || advancingRef.current) return;
    const correct = opt === answer;
    setPicked(opt);
    if (correct) {
      advancingRef.current = true;
      const firstTry = roundWrongRef.current === 0;
      const chosen = firstWrongRef.current;
      const shown = shownRef.current;
      const replays = replaysRef.current;
      window.setTimeout(() => {
        const latencyMs = Date.now() - shown;
        recordItem(learnerId, config.skill, firstTry, latencyMs, firstTry ? undefined : chosen);
        logSkillEvent(learnerId, { skillKey: config.skill, correct: firstTry, at: Date.now(), game: config.gameId, level: 5, firstTry: true, latencyMs, replays, chosen: firstTry ? undefined : chosen });
      }, 0);
      sfx.correct(); setMood('cheer');
      window.setTimeout(() => say(config.wordOf(round)), 360); // re-speak the rebuilt word
      if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => {
        setMood(null); setPicked(null);
        roundWrongRef.current = 0; firstWrongRef.current = undefined;
        if (ri + 1 >= rounds.length) finishSession(Date.now());
        else { setRi((n) => n + 1); setLine(config.hint); }
      }, 1300);
    } else {
      wrongRef.current += 1; roundWrongRef.current += 1;
      if (firstWrongRef.current === undefined) firstWrongRef.current = opt;
      sfx.wrong(); setMood('wobble');
      if (character) setLine(reactionLine(character, 'wrong'));
      window.setTimeout(() => { setMood(null); setPicked(null); }, 800); // gentle retry, no shame
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: config.gameId, level: 5,
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
    setRounds(config.build()); setFinish(null); setRi(0); setPicked(null); setLine(config.hint);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game tt"
      back={{ label: '← Tinker Town', onClick: () => goBack('#/level/5') }}
      badge={config.badge}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">{config.finishTitle} {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{config.finishSay}</p>
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

          {config.renderTarget(round, solved)}
          <button type="button" className="tt-hear" onClick={hearAgain}>🔊 hear it again</button>

          <div className="tt-opts" role="group" aria-label="parts to add">
            {config.optionsOf(round).map((opt) => (
              <button
                key={opt}
                type="button"
                className={`tt-part${picked === opt ? (opt === answer ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null}
                onClick={() => choose(opt)}
                aria-label={`add the ${opt} part`}
              >{config.optionLabel(opt)}</button>
            ))}
          </div>

          <p className="tt-built" aria-live="polite">{solved ? config.renderBuilt(round) : ' '}</p>
          <p className="tt-help">{config.help}</p>
        </div>
      ) : null}
    </GameShell>
  );
}
