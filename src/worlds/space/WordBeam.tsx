import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { buildDictationRounds, ALPHABET } from '../../content/packs/level2';
import { positionTarget } from '../../content/packs/starStation';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { skillKeyForSound } from '../../mastery/skills';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { SpaceBackdrop } from './SpaceArt';
import { GameShell } from '../../ui/GameShell';
import { castFor, reactionLine, healFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './space.css';

const ROUNDS = 6;

/**
 * Word Beam — Moss's Level 2 DICTATION game. Hear a word, then spell it from a
 * full A–Z tray (free recall — the truest spelling check, harder than building
 * from a curated set). Each letter logs that position's sound (first/medial/last)
 * so a wrong tap records the exact letter chosen — the misspelling signal.
 */
export function WordBeam({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(2); // Moss
  // Moss's REAL recovery — heals LIVE as you spell (each placement records his sound).
  const [heal, setHeal] = useState(() => (character ? healFor(character, loadMastery(learnerId)) : 1));
  const [muted, setMutedState] = useState(isMuted());
  function toggleMute() { const n = !muted; setMuted(n); setMutedState(n); }
  const [rounds, setRounds] = useState(() => buildDictationRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [placed, setPlaced] = useState(0);
  const [wrongKey, setWrongKey] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Hear the word, then beam in its letters — spell it yourself! 🛰️');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const attemptedRef = useRef<Set<string>>(new Set());

  const round = rounds[ri];
  const word = round?.word ?? '';

  useEffect(() => { startRef.current = Date.now(); }, []);
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };
  useEffect(() => {
    if (round && !finish) say(round.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function logPlacement(index: number, correct: boolean, chosen?: string) {
    const key = skillKeyForSound(word[index], positionTarget(index, word.length));
    const fkey = `${ri}:${index}`;
    const firstTry = !attemptedRef.current.has(fkey);
    attemptedRef.current.add(fkey);
    window.setTimeout(() => {
      recordItem(learnerId, key, correct, undefined, correct ? undefined : chosen, firstTry);
      logSkillEvent(learnerId, { skillKey: key, correct, at: Date.now(), game: 'word-beam', level: 2, firstTry, chosen: correct ? undefined : chosen });
      if (character) setHeal(healFor(character, loadMastery(learnerId))); // Moss heals live
    }, 0);
  }

  function onLetter(letter: string) {
    if (finish || advancingRef.current || !round) return;
    const p = placed;
    if (letter === word[p]) {
      logPlacement(p, true);
      sfx.correct();
      setPlaced(p + 1);
      if (p + 1 >= word.length) {
        advancingRef.current = true;
        setMood('cheer');
        if (character) setLine(reactionLine(character, 'correct'));
        say(word);
        window.setTimeout(() => {
          setMood(null);
          if (ri + 1 >= ROUNDS) finishSession(Date.now());
          else { setRi((n) => n + 1); setPlaced(0); advancingRef.current = false; }
        }, 1100);
      }
    } else {
      wrongRef.current += 1;
      logPlacement(p, false, letter);
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
      game: 'word-beam', level: 2,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0; attemptedRef.current.clear();
    startRef.current = Date.now(); setRounds(buildDictationRounds(ROUNDS)); setFinish(null); setRi(0); setPlaced(0);
  }

  return (
    <GameShell
      prefix="sg"
      rootClass="sg ss"
      backdrop={<SpaceBackdrop />}
      back={{ label: '← Space', onClick: () => goBack('#/level/2') }}
      badge={<>📡 Word Beam · Level 2</>}
      current={ri}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="ss-stage">
          <div className="ss-finish">
            <div className="ss-finish__art"><CharacterArt emoji={character?.emoji ?? '🛰️'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="ss-finish__title">Words beamed! {'★'.repeat(finish.stars)}</p>
            <p className="ss-finish__say">{character?.name ?? 'Moss'} watched you spell every one. 🌟</p>
            <div className="ss-actions">
              <button type="button" className="ss-btn" onClick={restart}>Beam again 🔁</button>
              <button type="button" className="ss-btn ss-btn--ghost" onClick={() => navigate('#/level/2')}>Back to the Station</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="ss-stage">
          {character && (
            <div className="ss-hero">
              <button type="button" className="ss-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character.name} again`}>
                <CharacterArt emoji={character.emoji} heal={heal} mood={mood} size={96} art={character.art} label={character.name} />
              </button>
              <p className="ss-hero__line" role="status">{line}</p>
            </div>
          )}

          <p className="sg-ask">Hear the word, then spell it — tap each letter <b>in order</b>.</p>

          <button type="button" className="ss-pic" onClick={() => say(word)} aria-label="Hear the word again">
            <span className="ss-pic__emoji">{round.emoji}</span>
            <span className="ss-pic__hear">🔊 hear it</span>
          </button>

          <div className="ss-slots" aria-label="word being spelled">
            {Array.from(word).map((ch, idx) => (
              <span key={idx} className={`ss-slot${idx < placed ? ' is-filled' : ''}`}>{idx < placed ? ch : ''}</span>
            ))}
          </div>

          <div className="wb-keys" role="group" aria-label="alphabet">
            {ALPHABET.map((ch) => (
              <button key={ch} type="button" className={`wb-key${wrongKey === ch ? ' is-wrong' : ''}`} onClick={() => onLetter(ch)}>{ch}</button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
