import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildCompareRounds } from '../../content/packs/comparePairs';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { GardenBackdrop, SproutGuide } from './GardenArt';
import { castFor, reactionLine, isFullyRecovered } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './garden.css';

const ROUNDS = 8;
const SKILL = 'pa:compare';

/**
 * Same or Different? — Chip's Level 1 game (auditory discrimination). Hear two
 * spoken words; decide if they're the same or differ by one sound. Oral only,
 * no letters/pictures (a picture would give it away). Chip — the musical-ear
 * cricket — is in his element here. Logs `pa:compare` mastery per round.
 */
export function SameOrDifferent({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(1); // Chip
  const [rounds, setRounds] = useState(() => buildCompareRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [picked, setPicked] = useState<boolean | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const whole = character ? isFullyRecovered(character, loadMastery(learnerId)) : false;
  const [line, setLine] = useState(() =>
    character ? (whole && character.revisit?.length ? character.revisit[Math.floor(Math.random() * character.revisit.length)]
      : "My ears love tiny differences! Listen — are these two the SAME word, or DIFFERENT?") : '');
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const round = rounds[i];

  // Start the session clock on mount (kept out of render to stay pure).
  useEffect(() => { startRef.current = Date.now(); }, []);

  const playWord = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  // Play the pair when a new round appears: first word, then the second.
  useEffect(() => {
    if (!round || finish) return;
    playWord(round.a);
    const id = window.setTimeout(() => playWord(round.b), 950);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function choose(saidSame: boolean) {
    if (picked !== null || !round || finish) return;
    const correct = saidSame === round.same;
    setPicked(saidSame);
    if (correct) {
      correctRef.current += 1;
      sfx.correct();
      setMood('cheer'); setPhase('right');
      if (character) setLine(reactionLine(character, 'correct'));
    } else {
      wrongRef.current += 1;
      sfx.wrong();
      setMood('wobble'); setPhase('wrong');
      if (character) setLine(reactionLine(character, 'wrong'));
    }
    window.setTimeout(() => {
      recordItem(learnerId, SKILL, correct);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now() });
      setMood(null); setPicked(null); setPhase('idle');
      if (i + 1 >= ROUNDS) finishSession();
      else setI((n) => n + 1);
    }, 1100);
  }

  function finishSession() {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, Date.now() - startRef.current);
    const correct = correctRef.current;
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'same-or-different', level: 1,
      startedAt: new Date(startRef.current).toISOString(),
      endedAt: new Date().toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS,
      wrongAttempts: wrongRef.current, accuracy: correct / ROUNDS,
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ score: correct, stars: wrongRef.current === 0 ? 3 : correct >= ROUNDS - 1 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; correctRef.current = 0; wrongRef.current = 0;
    startRef.current = Date.now();
    setRounds(buildCompareRounds(ROUNDS)); // fresh pairs each play
    setFinish(null); setI(0); setPhase('idle'); setPicked(null);
  }

  return (
    <main className="gd sd">
      <GardenBackdrop />
      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => goBack('#/level/1')}>← Garden</button>
        <span className="gd-badge">👂 Same or Different? · Level 1</span>
      </div>

      {finish ? (
        <div className="gd-stage">
          <div className="gd-finish">
            <div className="sd-finish__art"><CharacterArt emoji={character?.emoji ?? '🦗'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="gd-finish__title">Sharp ears! {'★'.repeat(finish.stars)}</p>
            <p className="sd-finish__score">{finish.score} / {ROUNDS} right</p>
            <p className="sd-finish__say">{character?.name} heard every one with you. 🎵</p>
            <div className="sd-choices">
              <button type="button" className="gd-btn" onClick={restart}>Play again 🔁</button>
              <button type="button" className="gd-btn gd-btn--ghost" onClick={() => navigate('#/level/1')}>Back to the Garden</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="gd-stage sd-stage">
          {character && (
            <div className="gd-hero sd-hero">
              <button type="button" className="gd-hero__face" onClick={() => { if (character) { void audio.narrate(line); sfx.tap(); } }} aria-label={`Hear ${character.name} again`}>
                <CharacterArt emoji={character.emoji} heal={1} mood={mood} size={64} art={character.art} label={character.name} />
              </button>
              <div className="gd-hero__body">
                <p className="gd-hero__line" role="status">{line}</p>
                <span className="sd-progress" aria-hidden="true">
                  {rounds.map((_, n) => <i key={n} className={n < i ? 'done' : n === i ? 'on' : ''} />)}
                </span>
              </div>
            </div>
          )}

          <p className="sd-q">Are these two words the <b>same</b>?</p>
          <div className="sd-listen">
            <button type="button" className="sd-listen__btn" onClick={() => round && playWord(round.a)}>🔊 First word</button>
            <button type="button" className="sd-listen__btn" onClick={() => round && playWord(round.b)}>🔊 Second word</button>
          </div>

          <div className="sd-choices">
            <button type="button" className={`sd-choice sd-choice--same${picked === true ? (round?.same ? ' is-right' : ' is-wrong') : ''}`} disabled={picked !== null} onClick={() => choose(true)}>🟰 Same</button>
            <button type="button" className={`sd-choice sd-choice--diff${picked === false ? (!round?.same ? ' is-right' : ' is-wrong') : ''}`} disabled={picked !== null} onClick={() => choose(false)}>✳️ Different</button>
          </div>
          {phase !== 'idle' && <p className={`sd-feedback sd-feedback--${phase}`} role="status">{phase === 'right' ? 'Yes! 🎉' : 'Listen again 💛'}</p>}
        </div>
      )}

      <div className="gd-scout gd-hub__scout"><SproutGuide size={64} /></div>
    </main>
  );
}
