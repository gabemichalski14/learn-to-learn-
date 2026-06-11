import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildChopRounds } from '../../content/packs/level3';
import { recordItem } from '../../mastery/mastery';
import { syllKey } from '../../mastery/skills';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import './workshop.css';

const ROUNDS = 6;
const SKILL = syllKey('vccv');

/** Chop Shop — chop a two-syllable closed word at its VC|CV boundary (rab·bit).
 *  Interconnected reasoning: see the word's parts. A wrong cut logs the chosen
 *  boundary → boundary-confusion signal. */
export function ChopShop({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const [rounds, setRounds] = useState(() => buildChopRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [cut, setCut] = useState<number | null>(null);       // the correct cut, shown on success
  const [wrongCut, setWrongCut] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Hear the word, then chop it into two syllables. 🪚');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const attemptedRef = useRef<Set<number>>(new Set());

  const round = rounds[ri];
  const word = round?.word ?? '';
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) say(round.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function onChop(pos: number) {
    if (finish || advancingRef.current || !round) return;
    const correct = pos === round.split;
    const firstTry = !attemptedRef.current.has(ri);
    attemptedRef.current.add(ri);
    window.setTimeout(() => {
      recordItem(learnerId, SKILL, correct, undefined, correct ? undefined : String(pos), firstTry);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'chop-shop', level: 3, firstTry, chosen: correct ? undefined : String(pos) });
    }, 0);
    if (correct) {
      sfx.correct(); setCut(pos); setMood('cheer');
      setLine(`${word.slice(0, pos)} · ${word.slice(pos)} — chopped! 🪚`);
      advancingRef.current = true;
      window.setTimeout(() => {
        setMood(null); setCut(null);
        if (ri + 1 >= ROUNDS) finishSession(Date.now());
        else { setRi((n) => n + 1); advancingRef.current = false; }
      }, 1150);
    } else {
      wrongRef.current += 1; sfx.wrong(); setMood('wobble'); setWrongCut(pos);
      setLine('Not there — say it slowly and listen for the two parts.');
      window.setTimeout(() => { setWrongCut(null); setMood(null); }, 650);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'chop-shop', level: 3,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0; attemptedRef.current.clear();
    startRef.current = Date.now(); setRounds(buildChopRounds(ROUNDS)); setFinish(null); setRi(0); setCut(null); setWrongCut(null);
  }

  return (
    <main className="wk">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/3')}>← Workshop</button>
        <span className="wk-badge">🪚 Chop Shop · Level 3</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art" aria-hidden="true">🪚</div>
            <p className="wk-finish__title">Chopped clean! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">Patch saw every word's parts — just like you. 🧵</p>
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

          <button type="button" className="wk-pic" onClick={() => say(word)} aria-label="Hear the word again">
            <span className="wk-pic__emoji">{round.emoji ?? '🔧'}</span>
            <span className="wk-pic__hear">🔊 hear it</span>
          </button>

          <div className="wk-word" aria-label={`chop ${word} into two parts`}>
            {Array.from(word).map((ch, i) => (
              <Fragment key={i}>
                <span className="wk-letter">{ch}</span>
                {i < word.length - 1 && (
                  <button
                    type="button"
                    className={`wk-cut${cut === i + 1 ? ' is-cut' : ''}${wrongCut === i + 1 ? ' is-wrong' : ''}`}
                    onClick={() => onChop(i + 1)}
                    aria-label={`chop between ${ch} and ${word[i + 1]}`}
                  >✂️</button>
                )}
              </Fragment>
            ))}
          </div>

          <span className="wk-progress" aria-hidden="true">
            {rounds.map((_, n) => <i key={n} className={n < ri ? 'done' : n === ri ? 'on' : ''} />)}
          </span>
        </div>
      )}
    </main>
  );
}
