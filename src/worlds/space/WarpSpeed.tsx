import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { buildReadRounds, type CvcWord } from '../../content/packs/level2';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { SpaceBackdrop } from './SpaceArt';
import { GameShell } from '../../ui/GameShell';
import { Icon } from '../../ui/Icon';
import { castFor, reactionLine, healFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './space.css';

const ROUNDS = 12;
const SKILL = 'read:cvc';

/**
 * Warp Speed — Moss's Level 2 FLUENCY game (decoding automaticity). Read the word
 * and tap its picture, as quick as you can. Accuracy-first + gentle: no scary
 * clock, no fail state — the pace (words / minute from the session) is the signal,
 * never a punishment. Logs `read:cvc` per word.
 */
export function WarpSpeed({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(2); // Moss
  const heal = character ? healFor(character, loadMastery(learnerId)) : 1;
  const [muted, setMutedState] = useState(isMuted());
  function toggleMute() { const n = !muted; setMuted(n); setMutedState(n); }
  const [rounds, setRounds] = useState(() => buildReadRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Read the word, tap its picture — quick as a comet! ☄️');
  const [finish, setFinish] = useState<{ score: number; perMin: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const round = rounds[i];

  useEffect(() => { startRef.current = Date.now(); }, []);

  function choose(opt: CvcWord) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = opt.word === round.word;
    setPicked(opt.word);
    advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    window.setTimeout(() => {
      recordItem(learnerId, SKILL, correct, undefined, correct ? undefined : opt.word);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'warp-speed', level: 2, firstTry: true, chosen: correct ? undefined : opt.word });
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 650);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(1, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'warp-speed', level: 2,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS,
    });
    awardForSession(learnerId);
    sfx.win();
    // Cap at a plausible reading rate so an ultra-fast session can't show an
    // absurd "1200 words a minute" (display-only; the tutor WCPM is computed
    // separately from session data).
    const perMin = Math.min(200, Math.round((correctRef.current / durationMs) * 60000));
    setFinish({ score: correctRef.current, perMin, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; correctRef.current = 0; wrongRef.current = 0; advRef.current = false;
    startRef.current = Date.now(); setRounds(buildReadRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  return (
    <GameShell
      prefix="sg"
      rootClass="sg ss"
      backdrop={<SpaceBackdrop />}
      back={{ label: '← Space', onClick: () => goBack('#/level/2') }}
      badge={<>☄️ Warp Speed · Level 2</>}
      current={i}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="ss-stage">
          <div className="ss-finish">
            <div className="ss-finish__art"><CharacterArt emoji={character?.emoji ?? '🛰️'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="ss-finish__title">Warp speed! {'★'.repeat(finish.stars)}</p>
            <p className="ss-finish__say">{finish.score} / {ROUNDS} read · about {finish.perMin} words a minute. {character?.name ?? 'Moss'} could barely keep up! ☄️</p>
            <div className="ss-actions">
              <button type="button" className="ss-btn" onClick={restart}>Go again <Icon name="ico-replay" emoji="🔁" /></button>
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

          <p className="sg-ask">Read the word, then tap its picture — quick!</p>
          <p className="ws-word" aria-label={`Read the word ${round.word}`}>{round.word}</p>
          <div className="ws-pics" role="group" aria-label="pick the picture">
            {round.options.map((opt) => (
              <button key={opt.word} type="button"
                className={`ss-pic ws-opt${picked === opt.word ? (opt.word === round.word ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null} onClick={() => choose(opt)} aria-label={opt.word}>
                <span className="ss-pic__emoji">{opt.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
