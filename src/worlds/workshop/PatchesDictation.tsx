import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildL3DictationRounds } from '../../content/packs/level3';
import { ALPHABET } from '../../content/packs/level2';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './workshop.css';

const ROUNDS = 6;

/**
 * Patch's Dictation — Level 3 spelling (blends + digraphs). Hear a word, then
 * spell it from a full A–Z tray. Logs ONE event per word against that word's
 * skill key (blend / digraph) — correct only if spelled with no wrong taps; the
 * first wrong letter is captured as the confusion signal.
 */
export function PatchesDictation({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(3); // Patch
  const [rounds, setRounds] = useState(() => buildL3DictationRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Hear the word, then spell it yourself — every letter, your hands. 🧵');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const wordWrongRef = useRef(0);          // wrong taps in the current word
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
        // word complete — log one event against the word's blend/digraph key
        advancingRef.current = true;
        const correct = wordWrongRef.current === 0;
        const chosen = wordFirstWrongRef.current;
        const sk = round.skillKey;
        window.setTimeout(() => {
          recordItem(learnerId, sk, correct, undefined, correct ? undefined : chosen);
          logSkillEvent(learnerId, { skillKey: sk, correct, at: Date.now(), game: 'patches-dictation', level: 3, firstTry: true, chosen: correct ? undefined : chosen });
        }, 0);
        setMood('cheer');
        if (character) setLine(reactionLine(character, 'correct'));
        say(word);
        window.setTimeout(() => {
          setMood(null);
          wordWrongRef.current = 0; wordFirstWrongRef.current = undefined;
          if (ri + 1 >= ROUNDS) finishSession(Date.now());
          else { setRi((n) => n + 1); setPlaced(0); advancingRef.current = false; }
        }, 1100);
      }
    } else {
      wrongRef.current += 1;
      wordWrongRef.current += 1;
      if (wordFirstWrongRef.current === undefined) wordFirstWrongRef.current = letter;
      sfx.wrong();
      setMood('wobble');
      setWrongKey(letter);
      window.setTimeout(() => { setWrongKey(null); setMood(null); }, 460);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'patches-dictation', level: 3,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    wordWrongRef.current = 0; wordFirstWrongRef.current = undefined;
    startRef.current = Date.now(); setRounds(buildL3DictationRounds(ROUNDS)); setFinish(null); setRi(0); setPlaced(0);
  }

  return (
    <main className="wk">
      <div className="wk-hud">
        <button type="button" className="wk-back" onClick={() => goBack('#/level/3')}>← Workshop</button>
        <span className="wk-badge">✏️ Patch's Dictation · Level 3</span>
      </div>

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Spelled it! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{character?.name ?? 'Patch'} watched you build every word by hand. 🧵</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Spell again 🔁</button>
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

          <button type="button" className="wk-pic" onClick={() => say(word)} aria-label="Hear the word again">
            <span className="wk-pic__emoji">{round.emoji}</span>
            <span className="wk-pic__hear">🔊 hear it</span>
          </button>

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
