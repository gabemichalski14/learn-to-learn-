import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { buildRhymeRounds, type PicWord } from '../../content/packs/level1';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { GardenBackdrop } from './GardenArt';
import { GameShell } from '../../ui/GameShell';
import { castFor, reactionLine, healFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { WordPicture } from '../../world/WordPicture';
import './garden.css';

const ROUNDS = 8;
const SKILL = 'pa:rhyme';

/**
 * Rhyme Time — Chip's Level 1 game (onset-rime PA). Hear a word, then tap the
 * picture that RHYMES (sounds the same at the end). Oral + pictures, no letters.
 * Logs `pa:rhyme`; a wrong tap records the chosen word (confusion signal).
 */
export function RhymeTime({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(1); // Chip
  const heal = character ? healFor(character, loadMastery(learnerId)) : 1; // continuous across L1
  const [rounds, setRounds] = useState(() => buildRhymeRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Listen! Which one RHYMES — sounds the same at the end? 🎵');
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  function toggleMute() { const n = !muted; setMuted(n); setMutedState(n); }

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const round = rounds[i];
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) say(round.target.word);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function choose(opt: PicWord) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = opt.word === round.answer;
    setPicked(opt.word);
    advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); if (character) setLine(reactionLine(character, 'correct')); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    window.setTimeout(() => {
      recordItem(learnerId, SKILL, correct, undefined, correct ? undefined : opt.word);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'rhyme-time', level: 1, firstTry: true, chosen: correct ? undefined : opt.word });
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 1100);
  }

  function finishSession(endTs: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endTs - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'rhyme-time', level: 1,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endTs).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS,
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ score: correctRef.current, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 1 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; correctRef.current = 0; wrongRef.current = 0; advRef.current = false;
    startRef.current = Date.now(); setRounds(buildRhymeRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  return (
    <GameShell
      prefix="gd"
      rootClass="gd rt"
      backdrop={<GardenBackdrop />}
      back={{ label: '← Garden', onClick: () => goBack('#/level/1') }}
      badge={<>🎵 Rhyme Time · Level 1</>}
      current={i}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="gd-stage">
          <div className="gd-finish">
            <div className="sd-finish__art"><CharacterArt emoji={character?.emoji ?? '🦗'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="gd-finish__title">Great ear! {'★'.repeat(finish.stars)}</p>
            <p className="sd-finish__score">{finish.score} / {ROUNDS} right</p>
            <p className="sd-finish__say">{character?.name ?? 'Chip'} heard every rhyme with you. 🎵</p>
            <div className="sd-choices">
              <button type="button" className="gd-btn" onClick={restart}>Play again 🔁</button>
              <button type="button" className="gd-btn gd-btn--ghost" onClick={() => navigate('#/level/1')}>Back to the Garden</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="gd-stage sd-stage">
          {character && (
            <div className="gd-hero sd-hero">
              <button type="button" className="gd-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character.name} again`}>
                <CharacterArt emoji={character.emoji} heal={heal} mood={mood} size={96} art={character.art} label={character.name} />
              </button>
              <div className="gd-hero__body">
                <p className="gd-hero__line" role="status">{line}</p>
              </div>
            </div>
          )}

          <div className="gd-panel">
            <button type="button" className="gd-pic gd-pic--target" onClick={() => say(round.target.word)} aria-label={`Hear ${round.target.word} again`}>
              <WordPicture label={round.target.word} emoji={round.target.emoji} className="gd-picimg" />
              <span className="gd-pic__hear">🔊 hear it</span>
            </button>
            <p className="sd-q">Which one <b>rhymes</b>?</p>
            <div className="gd-pics">
              {round.options.map((opt) => (
                <button key={opt.word} type="button"
                  className={`gd-pic gd-pic--opt${picked === opt.word ? (opt.word === round.answer ? ' is-right' : ' is-wrong') : ''}`}
                  disabled={picked !== null} onClick={() => choose(opt)} aria-label={opt.word}>
                  <WordPicture label={opt.word} emoji={opt.emoji} className="gd-picimg" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
