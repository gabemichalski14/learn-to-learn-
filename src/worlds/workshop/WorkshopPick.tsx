import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import './workshop.css';

export interface PickRound {
  word: string;        // the spoken word
  emoji?: string;
  stem?: string;       // optional written prompt to show (e.g. "be__" for Rule Breakers)
  options: string[];   // the choices
  correct: string;     // the right choice
  skillKey: string;    // what to record/log
}

/**
 * Shared Level-3 "hear it → tap the right answer" engine (Sort It, Rule Breakers).
 * Each round logs its skillKey with first_try; a wrong tap logs `chosen` = the
 * picked option, so the confusion engine surfaces digraph / rule mix-ups.
 */
export function WorkshopPick({ learnerId = 'guest', gameId, badge, intro, finishSay, makeRounds }: {
  learnerId?: string; gameId: string; badge: string; intro: string; finishSay: string; makeRounds: () => PickRound[];
}) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const [rounds, setRounds] = useState(makeRounds);
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(intro);
  const [finish, setFinish] = useState<{ stars: number } | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const attemptedRef = useRef<Set<number>>(new Set());
  const shownRef = useRef(0); // when the current item appeared → per-item response latency
  const replaysRef = useRef(0); // audio replays for the current item (uncertainty signal)

  const round = rounds[ri];
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); replaysRef.current = 0; say(round.word); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function onPick(opt: string) {
    if (finish || advancingRef.current || !round) return;
    const correct = opt === round.correct;
    const firstTry = !attemptedRef.current.has(ri);
    attemptedRef.current.add(ri);
    setPicked(opt);
    const shown = shownRef.current;
    window.setTimeout(() => {
      const latencyMs = Date.now() - shown;
      recordItem(learnerId, round.skillKey, correct, latencyMs, correct ? undefined : opt, firstTry);
      logSkillEvent(learnerId, { skillKey: round.skillKey, correct, at: Date.now(), game: gameId, level: 3, firstTry, latencyMs, replays: replaysRef.current, chosen: correct ? undefined : opt });
    }, 0);
    if (correct) {
      sfx.correct(); setMood('cheer'); setLine('Yes! That one. 🤝'); advancingRef.current = true;
      window.setTimeout(() => {
        setMood(null); setPicked(null);
        if (ri + 1 >= rounds.length) finishSession(Date.now());
        else { setRi((n) => n + 1); advancingRef.current = false; }
      }, 900);
    } else {
      wrongRef.current += 1; sfx.wrong(); setMood('wobble'); setLine('Not quite — listen again and try the other one.');
      window.setTimeout(() => { setMood(null); setPicked(null); }, 700);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: gameId, level: 3,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: rounds.length, items: rounds.length, wrongAttempts: wrongRef.current,
      accuracy: rounds.length / (rounds.length + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0; attemptedRef.current.clear();
    startRef.current = Date.now(); setRounds(makeRounds()); setFinish(null); setRi(0); setPicked(null); setLine(intro);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game"
      back={{ label: '← Workshop', onClick: () => goBack('#/level/3') }}
      badge={<>{badge} · Level 3</>}
      current={ri}
      total={rounds.length}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art" aria-hidden="true">🧵</div>
            <p className="wk-finish__title">Nice work! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finishSay}</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Again 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/3')}>Back to the Workshop</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label="Hear Patch again">
              <span className={`wk-patch${mood ? ` is-${mood}` : ''}`} aria-hidden="true">🧵</span>
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <button type="button" className="wk-pic" onClick={() => { replaysRef.current += 1; say(round.word); }} aria-label="Hear the word again">
            <span className="wk-pic__emoji">{round.emoji ?? '🔧'}</span>
            <span className="wk-pic__hear">🔊 hear it</span>
          </button>
          {round.stem && <div className="wk-stem" aria-hidden="true">{round.stem}<i>__</i></div>}

          <div className="wk-opts" role="group" aria-label="choices">
            {round.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`wk-opt${picked === opt ? (opt === round.correct ? ' is-right' : ' is-wrong') : ''}`}
                onClick={() => onPick(opt)}
              >{opt}</button>
            ))}
          </div>

        </div>
      )}
    </GameShell>
  );
}
