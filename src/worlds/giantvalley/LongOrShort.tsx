import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildLongShortRounds } from '../../content/packs/level4';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './giantvalley.css';

const ROUNDS = 8;
const SKILL = 'vowel:open';

/**
 * Long or Short? — Bram's Level 4 open-vs-closed game. Hear a word; decide if the
 * vowel says its NAME (long — open syllable: me, go) or its short sound (closed:
 * met, got). Logs `vowel:open`.
 */
export function LongOrShort({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(4);
  const [rounds, setRounds] = useState(() => buildLongShortRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Does the vowel say its NAME (long), or its short sound? Listen! 🦕');
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const shownRef = useRef(0); // when the current item appeared → per-item response latency
  const replaysRef = useRef(0); // audio replays for the current item (uncertainty signal)
  const round = rounds[i];
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); replaysRef.current = 0; say(round.word); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function choose(saidLong: boolean) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = saidLong === round.long;
    setPicked(saidLong); advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); if (character) setLine(reactionLine(character, 'correct')); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    const shown = shownRef.current;
    const chosen = correct ? undefined : (saidLong ? 'long' : 'short');
    window.setTimeout(() => {
      const latencyMs = Date.now() - shown;
      recordItem(learnerId, SKILL, correct, latencyMs, chosen);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'long-or-short', level: 4, firstTry: true, latencyMs, replays: replaysRef.current, chosen });
    }, 0);
    window.setTimeout(() => {
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 1000);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, { game: 'long-or-short', level: 4, startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(), durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ score: correctRef.current, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 1 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advRef.current = false; correctRef.current = 0; wrongRef.current = 0;
    startRef.current = Date.now(); setRounds(buildLongShortRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game gv"
      back={{ label: '← Valley', onClick: () => goBack('#/level/4') }}
      badge={<>📏 Long or Short? · Level 4</>}
      current={i}
      total={rounds.length}
      muted={muted}
      onToggleMute={toggleMute}
    >

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Sharp ear! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finish.score} / {ROUNDS} right · {character?.name ?? 'Bram'} heard every vowel with you. 🦕</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Play again 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/4')}>Back to the Valley</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Bram'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood={mood} size={96} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <button type="button" className="nc-hear" onClick={() => { replaysRef.current += 1; say(round.word); }} aria-label="Hear the word again">🔊 hear the word</button>

          <div className="nc-row">
            <button type="button" className={`ls-choice ls-choice--long${picked === true ? (round.long ? ' is-right' : ' is-wrong') : ''}`} disabled={picked !== null} onClick={() => choose(true)}>
              🔵 Long<small>says its name</small>
            </button>
            <button type="button" className={`ls-choice ls-choice--short${picked === false ? (!round.long ? ' is-right' : ' is-wrong') : ''}`} disabled={picked !== null} onClick={() => choose(false)}>
              🔴 Short<small>short sound</small>
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );
}
