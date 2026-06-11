import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildMultiRounds } from '../../content/packs/level4';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './giantvalley.css';

const ROUNDS = 12;
const SKILL = 'read:multi';

/**
 * Giant Steps — Bram's Level 4 FLUENCY game. Read a longer word and tap its
 * picture, quick as you can climb. Accuracy-first + gentle (no scary clock, no
 * fail state); pace = words/minute from the session. Logs `read:multi`.
 */
export function GiantSteps({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(4);
  const [rounds, setRounds] = useState(() => buildMultiRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Read each big word and grab its picture — one giant step at a time! 🏔️');
  const [finish, setFinish] = useState<{ score: number; perMin: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const round = rounds[i];

  useEffect(() => { startRef.current = Date.now(); }, []);

  function choose(word: string) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = word === round.word;
    setPicked(word); advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    window.setTimeout(() => {
      recordItem(learnerId, SKILL, correct, undefined, correct ? undefined : word);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'giant-steps', level: 4, firstTry: true, chosen: correct ? undefined : word });
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 600);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(1, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, { game: 'giant-steps', level: 4, startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(), durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS });
    awardForSession(learnerId);
    sfx.win();
    const perMin = Math.round((correctRef.current / durationMs) * 60000);
    setFinish({ score: correctRef.current, perMin, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advRef.current = false; correctRef.current = 0; wrongRef.current = 0;
    startRef.current = Date.now(); setRounds(buildMultiRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  return (
    <main className="wk gv">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/4')}>← Valley</button>
        <span className="wk-badge">🏔️ Giant Steps · Level 4</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Giant strides! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finish.score} / {ROUNDS} read · about {finish.perMin} words a minute. {character?.name ?? 'Bram'} could barely keep up! 🏔️</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Go again 🔁</button>
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

          <p className="wg-word wg-word--read" aria-label={`read ${round.word}`}>{round.word}</p>
          <div className="nc-row">
            {round.options.map((opt) => (
              <button key={opt.word} type="button"
                className={`wg-opt${picked === opt.word ? (opt.word === round.word ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null} onClick={() => choose(opt.word)} aria-label={opt.word}>
                <span className="wg-opt__emoji">{opt.emoji}</span>
              </button>
            ))}
          </div>

          <span className="wk-progress" aria-hidden="true">
            {rounds.map((_, n) => <i key={n} className={n < i ? 'done' : n === i ? 'on' : ''} />)}
          </span>
        </div>
      )}
    </main>
  );
}
