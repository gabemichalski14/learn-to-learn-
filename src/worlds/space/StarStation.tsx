import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildStarRounds, positionTarget } from '../../content/packs/starStation';
import { recordItem } from '../../mastery/mastery';
import { skillKeyForSound } from '../../mastery/skills';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { SpaceBackdrop, ScoutDrone } from './SpaceArt';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './space.css';

const ROUNDS = 6;

/**
 * Star Station — Moss's Level 2 blending/encoding game. Hear a word, then BUILD
 * it from letter tiles in order. Each correct placement logs that position's
 * sound (first / medial / last), feeding the same Level 2 skills the mastery
 * gate checks. Moss — who loves building things in space — hosts.
 */
export function StarStation({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(2); // Moss
  const [rounds, setRounds] = useState(() => buildStarRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [placed, setPlaced] = useState(0);          // correct letters built so far
  const [used, setUsed] = useState<Set<number>>(new Set()); // consumed tile indices
  const [wrongTile, setWrongTile] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Hear the word, then build it letter by letter. Let’s construct! 🛰️');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);
  const attemptedRef = useRef<Set<string>>(new Set()); // slots tapped → first-try detection

  const round = rounds[ri];
  const word = round?.word ?? '';

  useEffect(() => { startRef.current = Date.now(); }, []);

  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => {
    if (!round || finish) return;
    say(round.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function logPlacement(index: number, correct: boolean, chosen?: string) {
    const key = skillKeyForSound(word[index], positionTarget(index, word.length));
    const fkey = `${ri}:${index}`;
    const firstTry = !attemptedRef.current.has(fkey); // first tap at this slot
    attemptedRef.current.add(fkey);
    window.setTimeout(() => {
      recordItem(learnerId, key, correct, undefined, correct ? undefined : chosen);
      logSkillEvent(learnerId, {
        skillKey: key, correct, at: Date.now(), game: 'star-station', level: 2, firstTry,
        chosen: correct ? undefined : chosen, // the letter they tapped instead (confusion)
      });
    }, 0);
  }

  function onTile(tileIdx: number) {
    if (finish || advancingRef.current || used.has(tileIdx) || !round) return;
    const letter = round.tiles[tileIdx];
    const p = placed;
    if (letter === word[p]) {
      logPlacement(p, true);
      sfx.correct();
      setUsed((prev) => new Set(prev).add(tileIdx));
      setPlaced(p + 1);
      if (p + 1 >= word.length) {
        // word complete
        advancingRef.current = true;
        setMood('cheer');
        if (character) setLine(reactionLine(character, 'correct'));
        say(word);
        window.setTimeout(() => {
          setMood(null);
          if (ri + 1 >= ROUNDS) finishSession(Date.now());
          else { setRi((n) => n + 1); setPlaced(0); setUsed(new Set()); advancingRef.current = false; }
        }, 1100);
      }
    } else {
      wrongRef.current += 1;
      logPlacement(p, false, letter);
      sfx.wrong();
      setMood('wobble');
      setWrongTile(tileIdx);
      window.setTimeout(() => { setWrongTile(null); setMood(null); }, 480);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'star-station', level: 2,
      startedAt: new Date(startRef.current).toISOString(),
      endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS,
      wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    attemptedRef.current.clear();
    startRef.current = Date.now();
    setRounds(buildStarRounds(ROUNDS));
    setFinish(null); setRi(0); setPlaced(0); setUsed(new Set());
  }

  return (
    <main className="sg ss">
      <SpaceBackdrop />
      <div className="sg-hud">
        <button type="button" className="sg-back" onClick={() => goBack('#/level/2')}>← Station</button>
        <span className="sg-badge">🛰️ Star Station · Level 2</span>
      </div>

      {finish ? (
        <div className="ss-stage">
          <div className="ss-finish">
            <div className="ss-finish__art"><CharacterArt emoji={character?.emoji ?? '🛰️'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="ss-finish__title">Station built! {'★'.repeat(finish.stars)}</p>
            <p className="ss-finish__say">{character?.name ?? 'Moss'} loves what you constructed. 🌟</p>
            <div className="ss-actions">
              <button type="button" className="ss-btn" onClick={restart}>Build again 🔁</button>
              <button type="button" className="ss-btn ss-btn--ghost" onClick={() => navigate('#/level/2')}>Back to the Station</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="ss-stage">
          {character && (
            <div className="ss-hero">
              <button type="button" className="ss-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character.name} again`}>
                <CharacterArt emoji={character.emoji} heal={1} mood={mood} size={60} art={character.art} label={character.name} />
              </button>
              <p className="ss-hero__line" role="status">{line}</p>
            </div>
          )}

          <button type="button" className="ss-pic" onClick={() => say(word)} aria-label="Hear the word again">
            <span className="ss-pic__emoji">{round.emoji}</span>
            <span className="ss-pic__hear">🔊 hear it</span>
          </button>

          <div className="ss-slots" aria-label="word being built">
            {Array.from(word).map((ch, idx) => (
              <span key={idx} className={`ss-slot${idx < placed ? ' is-filled' : ''}`}>{idx < placed ? ch : ''}</span>
            ))}
          </div>

          <div className="ss-tray" role="group" aria-label="letter tiles">
            {round.tiles.map((ch, idx) => (
              <button
                key={idx}
                type="button"
                className={`ss-tile${used.has(idx) ? ' is-used' : ''}${wrongTile === idx ? ' is-wrong' : ''}`}
                disabled={used.has(idx)}
                onClick={() => onTile(idx)}
              >{ch}</button>
            ))}
          </div>
          <span className="ss-progress" aria-hidden="true">
            {rounds.map((_, n) => <i key={n} className={n < ri ? 'done' : n === ri ? 'on' : ''} />)}
          </span>
        </div>
      )}

      <div className="sg-scout"><ScoutDrone size={62} /></div>
    </main>
  );
}
