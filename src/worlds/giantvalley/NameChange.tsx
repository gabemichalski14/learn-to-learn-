import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildNameChangeRounds } from '../../content/packs/level4';
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
const SKILL = 'vce';

/**
 * Name Change — Bram's Level 4 SILENT-E game. Hear a word; toggle the magic e on
 * or off (the "magic-e wand" — a known multisensory move) until the written word
 * matches: adding e makes the vowel say its name (cap → cape). Logs `vce`.
 */
export function NameChange({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(4); // Bram
  const [rounds, setRounds] = useState(() => buildNameChangeRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [hasE, setHasE] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Listen — then build the word you hear with me! ✨');
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);

  const round = rounds[ri];
  const currentWord = round ? (hasE ? round.withE : round.base) : '';
  const currentEmoji = round ? (hasE ? round.eEmoji : round.baseEmoji) : undefined;
  const targetWord = round ? (round.targetIsE ? round.withE : round.base) : '';
  const vowelIdx = round ? round.base.indexOf(round.vowel) : -1;

  const playWord = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  const shownRef = useRef(0); // when the current word appeared → time-to-answer latency
  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); playWord(round.targetIsE ? round.withE : round.base); } // hasE is reset on advance/restart
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function toggleE() {
    if (confirmed || advRef.current || !round) return;
    sfx.tap();
    setHasE((v) => {
      const nv = !v;
      window.setTimeout(() => playWord(nv ? round.withE : round.base), 80);
      return nv;
    });
  }

  function confirm() {
    if (confirmed || !round || finish || advRef.current) return;
    const correct = hasE === round.targetIsE;
    setConfirmed(true);
    advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); if (character) setLine(reactionLine(character, 'correct')); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    const chosen = correct ? undefined : (hasE ? '+e' : '-e');
    window.setTimeout(() => {
      const latencyMs = Date.now() - shownRef.current;
      recordItem(learnerId, SKILL, correct, latencyMs, chosen);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'name-change', level: 4, firstTry: true, latencyMs, chosen });
    }, 0);
    window.setTimeout(() => {
      setMood(null); setConfirmed(false); advRef.current = false;
      if (ri + 1 >= ROUNDS) finishSession(Date.now()); else { setRi((n) => n + 1); setHasE(false); }
    }, 1100);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'name-change', level: 4,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS,
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ score: correctRef.current, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 1 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advRef.current = false; correctRef.current = 0; wrongRef.current = 0;
    startRef.current = Date.now(); setRounds(buildNameChangeRounds(ROUNDS)); setFinish(null); setRi(0); setHasE(false); setConfirmed(false);
  }

  return (
    <main className="wk gv">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/4')}>← Valley</button>
        <span className="wk-badge">✨ Name Change · Level 4</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Magic! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finish.score} / {ROUNDS} right · {character?.name ?? 'Bram'} heard every vowel say its name. ✨</p>
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

          <p className="nc-step">1 · Listen to the word</p>
          <button type="button" className="nc-hear" onClick={() => playWord(targetWord)} aria-label="Hear the word you need to build">🔊 The word you heard</button>

          <p className="nc-step">2 · Build it — tap ✨ to add the magic e if the vowel says its name</p>
          <div className="nc-word" aria-label={`you built ${currentWord}`}>
            {round.base.split('').map((ch, i) => (
              <span key={i} className={i === vowelIdx ? `nc-vowel ${hasE ? 'is-long' : 'is-short'}` : 'nc-letter'}>{ch}</span>
            ))}
            {hasE && <span className="nc-e">e</span>}
          </div>
          <div className="nc-pic" aria-hidden="true">{currentEmoji ?? ''}</div>
          <button type="button" className="nc-say" onClick={() => playWord(currentWord)} aria-label="Hear the word you built">🔊 Hear what you built</button>

          <div className="nc-row">
            <button type="button" className="nc-wand" onClick={toggleE} aria-pressed={hasE}>
              {hasE ? '➖ take the e away' : '✨ add the magic e'}
            </button>
            <button type="button" className="nc-confirm" disabled={confirmed} onClick={confirm}>3 · They match! ✓</button>
          </div>

          <p className="nc-help">✨ The magic <b>e</b> is silent — but it makes the vowel say its <b>name</b> (cap → cape).</p>

          <span className="wk-progress" aria-hidden="true">
            {rounds.map((_, n) => <i key={n} className={n < ri ? 'done' : n === ri ? 'on' : ''} />)}
          </span>
        </div>
      )}
    </main>
  );
}
