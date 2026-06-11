import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildVceDictationRounds } from '../../content/packs/level4';
import { ALPHABET } from '../../content/packs/level2';
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
 * Name Change Dictation — Bram's Level 4 silent-e SPELLING game. Hear a magic-e
 * word (cape, kite); spell it from the full A–Z tray — and don't forget the silent
 * e. Logs one `vce` event per word (the first wrong letter is the confusion signal).
 */
export function NameChangeDictation({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(4);
  const [rounds, setRounds] = useState(() => buildVceDictationRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState("Hear a magic-e word, then spell it — don't forget the silent e! ✨");
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const wordWrongRef = useRef(0);
  const wordFirstWrongRef = useRef<string | undefined>(undefined);

  const round = rounds[ri];
  const word = round?.word ?? '';

  useEffect(() => { startRef.current = Date.now(); }, []);
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };
  useEffect(() => {
    if (round && !finish) say(round.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function onLetter(letter: string) {
    if (finish || advancingRef.current || !round) return;
    const p = placed;
    if (letter === word[p]) {
      sfx.correct();
      setPlaced(p + 1);
      if (p + 1 >= word.length) {
        advancingRef.current = true;
        const correct = wordWrongRef.current === 0;
        const chosen = wordFirstWrongRef.current;
        window.setTimeout(() => {
          recordItem(learnerId, SKILL, correct, undefined, correct ? undefined : chosen);
          logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'l4-dictation', level: 4, firstTry: true, chosen: correct ? undefined : chosen });
        }, 0);
        setMood('cheer'); if (character) setLine(reactionLine(character, 'correct')); say(word);
        window.setTimeout(() => {
          setMood(null); wordWrongRef.current = 0; wordFirstWrongRef.current = undefined;
          if (ri + 1 >= ROUNDS) finishSession(Date.now()); else { setRi((n) => n + 1); setPlaced(0); advancingRef.current = false; }
        }, 1100);
      }
    } else {
      wrongRef.current += 1; wordWrongRef.current += 1;
      if (wordFirstWrongRef.current === undefined) wordFirstWrongRef.current = letter;
      sfx.wrong(); setMood('wobble'); setWrongKey(letter);
      window.setTimeout(() => { setWrongKey(null); setMood(null); }, 460);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, { game: 'l4-dictation', level: 4, startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(), durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current) });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0; wordWrongRef.current = 0; wordFirstWrongRef.current = undefined;
    startRef.current = Date.now(); setRounds(buildVceDictationRounds(ROUNDS)); setFinish(null); setRi(0); setPlaced(0);
  }

  return (
    <main className="wk gv">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/4')}>← Valley</button>
        <span className="wk-badge">✏️ Name Change Dictation · Level 4</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Spelled with magic! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{character?.name ?? 'Bram'} watched you remember every silent e. ✨</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Spell again 🔁</button>
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

          <button type="button" className="nc-hear" onClick={() => say(word)} aria-label="Hear the word again">🔊 hear the word</button>
          {round.emoji && <div className="nc-pic" aria-hidden="true">{round.emoji}</div>}

          <div className="wk-slots" aria-label="word being spelled">
            {Array.from(word).map((ch, idx) => (
              <span key={idx} className={`wk-slot${idx < placed ? ' is-filled' : ''}`}>{idx < placed ? ch : ''}</span>
            ))}
          </div>

          <div className="wk-keys" role="group" aria-label="alphabet">
            {ALPHABET.map((ch) => (
              <button key={ch} type="button" className={`wk-key${wrongKey === ch ? ' is-wrong' : ''}`} onClick={() => onLetter(ch)}>{ch}</button>
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
