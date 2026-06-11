import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildDivideRounds } from '../../content/packs/level4';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './giantvalley.css';

const ROUNDS = 6;
const SKILL = 'div:vcv';
const isVowel = (c: string) => 'aeiou'.includes(c);

/**
 * The Great Divide — Bram's Level 4 syllable-division game. A big word appears;
 * tap the seam where it comes apart (between the consonants for VCCV, after a long
 * vowel for VCV). On a correct cut the two parts read aloud. Logs `div:vcv`.
 */
export function GreatDivide({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(4);
  const [rounds, setRounds] = useState(() => buildDivideRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('See the whole word — then tap where it comes apart. ✂️');
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const round = rounds[i];
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) say(round.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function cut(at: number) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = at === round.split;
    setPicked(at); advRef.current = true;
    if (correct) {
      correctRef.current += 1; sfx.correct(); setMood('cheer'); if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => say(round.word.slice(0, round.split)), 250);
      window.setTimeout(() => say(round.word.slice(round.split)), 950);
    } else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    window.setTimeout(() => {
      recordItem(learnerId, SKILL, correct, undefined, correct ? undefined : String(at));
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'great-divide', level: 4, firstTry: true, chosen: correct ? undefined : String(at) });
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 1500);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, { game: 'great-divide', level: 4, startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(), durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ score: correctRef.current, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 1 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advRef.current = false; correctRef.current = 0; wrongRef.current = 0;
    startRef.current = Date.now(); setRounds(buildDivideRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  const letters = round ? round.word.split('') : [];

  return (
    <main className="wk gv">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/4')}>← Valley</button>
        <span className="wk-badge">✂️ The Great Divide · Level 4</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Clean cuts! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finish.score} / {ROUNDS} right · {character?.name ?? 'Bram'} read every giant in two. ✂️</p>
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
              <CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood={mood} size={60} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <button type="button" className="nc-hear" onClick={() => say(round.word)} aria-label="Hear the word again">🔊 hear the word</button>
          <p className="nc-step">Tap where the word comes apart ✂️</p>

          <div className="gd-divide" aria-label={`divide the word ${round.word}`}>
            {letters.map((ch, idx) => (
              <Fragment key={idx}>
                <span className={`gd-dl${isVowel(ch) ? ' gd-dl--vowel' : ''}`}>{ch}</span>
                {idx < letters.length - 1 && (
                  <button
                    type="button"
                    className={`gd-gap${picked === idx + 1 ? (idx + 1 === round.split ? ' is-right' : ' is-wrong') : ''}${picked !== null && idx + 1 === round.split ? ' is-answer' : ''}`}
                    disabled={picked !== null}
                    onClick={() => cut(idx + 1)}
                    aria-label={`cut after ${ch}`}
                  >✂️</button>
                )}
              </Fragment>
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
