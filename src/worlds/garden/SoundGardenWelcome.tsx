import { useRef, useState } from 'react';
import { navigate } from '../../router';
import { sfx } from '../../audio/sfx';
import { castFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { GardenBackdrop } from './GardenArt';
import { saveScreener, pacingFor, type Pacing } from '../../mastery/screener';
import './garden.css';

/**
 * "Sound Garden Welcome" — a one-time, cozy serial naming-speed warm-up that
 * seeds the learner's INITIAL pacing (a voice-free RAN proxy; RAN is the single
 * strongest early reading-risk predictor). Chip lights one garden friend at a
 * time across a grid; the child names each aloud and taps it as fast as they can.
 * We time the traversal — its SPEED, not what the child says — and turn that into
 * a pacing profile (gentle / standard / springboard).
 *
 * No score, no "test", no result is ever shown to the child — only "the garden's
 * waking up!". The pacing only seeds the starting point and is overridden by live
 * mastery as soon as real practice exists. All Date.now() lives inside a deferred
 * 0-timeout (lint-safe + the tap-time it captures is accurate to the tap).
 */

/** Familiar garden friends + the word a child names for each. */
const NAMES: Record<string, string> = {
  '🌱': 'sprout',
  '☀️': 'sun',
  '💧': 'drop',
  '🐛': 'bug',
  '🌸': 'flower',
};
// Fixed pseudo-random board (each friend ×4, no two neighbours alike) — a serial
// RAN board is fixed per administration, so no RNG (keeps render pure + stable).
const BOARD = [
  '🌱', '☀️', '💧', '🐛', '🌸',
  '☀️', '🌸', '🌱', '💧', '🐛',
  '💧', '🐛', '☀️', '🌸', '🌱',
  '🐛', '🌱', '🌸', '☀️', '💧',
];
const TOTAL = BOARD.length;

export function SoundGardenWelcome({ learnerId = 'guest' }: { learnerId?: string }) {
  const character = castFor(1); // Chip — the Sound Garden companion
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>('intro');
  const [nextIdx, setNextIdx] = useState(0);
  const [pacing, setPacing] = useState<Pacing | null>(null);

  // Logic source-of-truth lives in refs (setState is async; the tap handler reads
  // the ref). Timestamps are captured in the deferred callback below.
  const nextRef = useRef(0);
  const firstRef = useRef(0);
  const lastRef = useRef(0);
  const doneRef = useRef(false);

  function start() {
    sfx.tap();
    nextRef.current = 0;
    firstRef.current = 0;
    lastRef.current = 0;
    doneRef.current = false;
    setNextIdx(0);
    setPacing(null);
    setPhase('play');
  }

  function tapCell(idx: number) {
    if (phase !== 'play' || doneRef.current || idx !== nextRef.current) return;
    sfx.tick(nextRef.current + 1);
    // Defer all clock reads + the finish math (keeps render/handler pure; a
    // 0-delay timeout still captures ~tap-time).
    window.setTimeout(() => {
      const now = Date.now();
      if (firstRef.current === 0) firstRef.current = now; // clock starts on first tap
      lastRef.current = now;
      const next = nextRef.current + 1;
      nextRef.current = next;
      setNextIdx(next);
      if (next >= TOTAL && !doneRef.current) {
        doneRef.current = true;
        const msPerItem = (lastRef.current - firstRef.current) / (TOTAL - 1);
        const p = pacingFor(msPerItem);
        saveScreener(learnerId, { ranMsPerItem: Math.round(msPerItem), takenAt: new Date(now).toISOString(), pacing: p });
        sfx.win();
        setPacing(p);
        setPhase('done');
      }
    }, 0);
  }

  return (
    <main className="gd">
      <GardenBackdrop />
      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => navigate('#/level/1')}>← Garden</button>
        <span className="gd-badge"><CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} size={22} art={character?.art} label={character?.name} /> Welcome · the Sound Garden</span>
      </div>

      <div className="gd-stage">
        {phase === 'intro' && (
          <div className="gd-hero gd-tend-done">
            <CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} />
            <p className="gd-hero__line" role="status">Hi! I'm {character?.name ?? 'Chip'}. Let's wake up the garden together. 🌱</p>
            <p className="gd-tend-prompt">Name each garden friend out loud — and tap the glowing one as fast as you can!</p>
            <button type="button" className="gd-hub__check" onClick={start}>✨ Let's go!</button>
          </div>
        )}

        {phase === 'play' && (
          <>
            <p className="gd-tend-prompt">Name it, then tap the glowing one — go go go! 🌱</p>
            <div className="gd-ran-grid" role="group" aria-label="Name each garden friend and tap the glowing one as fast as you can">
              {BOARD.map((emoji, i) => (
                <button
                  key={i}
                  type="button"
                  className={`gd-ran-cell${i === nextIdx ? ' is-next' : ''}${i < nextIdx ? ' is-done' : ''}`}
                  onClick={() => tapCell(i)}
                  aria-label={NAMES[emoji] ?? 'garden friend'}
                  aria-current={i === nextIdx ? 'true' : undefined}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>
            <span className="gd-tend-progress" aria-hidden="true">
              {BOARD.map((_, n) => <i key={n} className={n < nextIdx ? 'done' : n === nextIdx ? 'on' : ''} />)}
            </span>
          </>
        )}

        {phase === 'done' && (
          <div className="gd-hero gd-tend-done">
            <CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} />
            {/* Pacing is stored for the grown-ups; the child only ever sees warmth. */}
            <p className="gd-hero__line" role="status">The garden's waking up! 🌸 Thanks for naming them all.</p>
            <p className="gd-tend-prompt" data-pacing={pacing ?? undefined}>Let's go plant your very first sound.</p>
            <div className="wk-actions">
              <button type="button" className="gd-hub__check" onClick={() => navigate('#/level/1')}>Into the Garden ▸</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
