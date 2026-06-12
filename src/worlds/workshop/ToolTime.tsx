import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildL3ReadRounds } from '../../content/packs/level3';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './workshop.css';

const ROUNDS = 12;

/**
 * Tool Time — Patch's Level 3 FLUENCY game. Read a blend/digraph word and tap its
 * picture, quick as you can. Accuracy-first + gentle (no scary clock, no fail
 * state); pace = words/minute from the session. Logs the word's blend/digraph key
 * so fluency feeds that exact skill.
 */
export function ToolTime({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(3); // Patch
  const [rounds, setRounds] = useState(() => buildL3ReadRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Read the word, grab its picture — quick hands! 🔧');
  const [finish, setFinish] = useState<{ score: number; perMin: number; stars: number } | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const shownRef = useRef(0);
  const round = rounds[i];

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => { shownRef.current = Date.now(); }, [i]); // when this word is shown (for latency)

  function choose(opt: { word: string; emoji: string }) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = opt.word === round.word;
    setPicked(opt.word);
    advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    // log latency in a deferred callback (render-safe; ~0ms delay ≈ tap time) —
    // Tool Time is a fluency game, so speed is the signal
    const shown = shownRef.current;
    const sk = round.skillKey;
    window.setTimeout(() => {
      const latencyMs = Date.now() - shown;
      recordItem(learnerId, sk, correct, latencyMs, correct ? undefined : opt.word);
      logSkillEvent(learnerId, { skillKey: sk, correct, at: Date.now(), game: 'tool-time', level: 3, firstTry: true, latencyMs, chosen: correct ? undefined : opt.word });
    }, 0);
    window.setTimeout(() => {
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 650);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(1, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'tool-time', level: 3,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS,
    });
    awardForSession(learnerId);
    sfx.win();
    const perMin = Math.round((correctRef.current / durationMs) * 60000);
    setFinish({ score: correctRef.current, perMin, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; correctRef.current = 0; wrongRef.current = 0; advRef.current = false;
    startRef.current = Date.now(); setRounds(buildL3ReadRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game"
      back={{ label: '← Workshop', onClick: () => goBack('#/level/3') }}
      badge={<>🔧 Tool Time · Level 3</>}
      current={i}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Fast hands! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finish.score} / {ROUNDS} read · about {finish.perMin} words a minute. {character?.name ?? 'Patch'} is impressed. 🔧</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Go again 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/3')}>Back to the Workshop</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Patch'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood={mood} size={96} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <p className="wk-word" aria-label={`Read the word ${round.word}`}>{round.word}</p>
          <div className="wk-pics" role="group" aria-label="pick the picture">
            {round.options.map((opt) => (
              <button key={opt.word} type="button"
                className={`wk-pic wk-opt${picked === opt.word ? (opt.word === round.word ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null} onClick={() => choose(opt)} aria-label={opt.word}>
                <span className="wk-pic__emoji">{opt.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
