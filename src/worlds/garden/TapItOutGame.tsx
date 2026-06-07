import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { goBack } from '../../router';
import { createStubAudioPlayer } from '../../audio/stubAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { tapItOutWords, type TapWord } from '../../content/packs/tapItOut';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { GardenBackdrop, SproutGuide } from './GardenArt';
import { EchoTwinkle } from '../../mascots/EchoTwinkle';
import { MascotSpeaker } from '../../mascots/MascotSpeaker';
import './garden.css';

const ROUNDS = 5;
type Phase = 'idle' | 'right' | 'wrong' | 'modeled';
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
// Petal-burst directions (degrees) — soft, organic spray on a correct word.
const PETALS = [0, 40, 80, 120, 160, 200, 240, 280, 320];

function pickWords(n: number): TapWord[] {
  const pool = [...tapItOutWords];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

/**
 * Tap It Out (Level 1 — Sound Garden): hear a word, tap a sprout for each sound.
 * Self-contained — owns its own 5-word session, audio, and finish; logs to the
 * shared pipeline (session + the `pa:segment` skill). Juice is tuned warm &
 * organic to match the garden world (vs. the bigger, dramatic space games).
 */
export function TapItOutGame({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createStubAudioPlayer(), []);
  const [words, setWords] = useState<TapWord[]>(() => pickWords(ROUNDS));
  const [round, setRound] = useState(0);
  const [taps, setTaps] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [finish, setFinish] = useState<{ stars: number } | null>(null);
  const [guideOpen, setGuideOpen] = useState(true);

  // Juice state
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [sway, setSway] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [echoPing, setEchoPing] = useState(0); // bumps on an audio moment → Echo twinkles
  const pingEcho = () => setEchoPing((p) => p + 1);

  const startRef = useRef(Date.now());
  const firstTryRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);

  const word = words[round];
  const isLast = round >= ROUNDS - 1;
  const bloom = phase === 'right' || phase === 'modeled';

  // Hear the word whenever it changes (and on restart).
  useEffect(() => {
    void audio.playWord(words[round]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, words]);

  // After a correct answer, let the bloom breathe, then advance.
  useEffect(() => {
    if (phase !== 'right') return;
    const id = window.setTimeout(advanceNow, 1700);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  }

  function tap() {
    if (bloom) return;
    sfx.tap();
    setTaps((t) => t + 1);
  }
  function undo() {
    if (bloom) return;
    setTaps((t) => Math.max(0, t - 1));
  }

  function check() {
    if (bloom || taps === 0) return;
    void audio.playWord(word);
    pingEcho();
    if (taps === word.sounds) {
      const firstTry = attempts === 0;
      if (firstTry) firstTryRef.current += 1;
      recordItem(learnerId, 'pa:segment', firstTry);
      logSkillEvent(learnerId, { skillKey: 'pa:segment', correct: firstTry, at: Date.now() });
      // Bloom + climbing combo + a happy Sprout.
      const c = comboRef.current + 1;
      comboRef.current = c;
      setCombo(c);
      if (c >= 2) sfx.combo(c); else sfx.correct();
      setMood('cheer');
      window.setTimeout(() => setMood((m) => (m === 'cheer' ? null : m)), 900);
      setPhase('right');
    } else {
      wrongRef.current += 1;
      comboRef.current = 0;
      setCombo(0);
      sfx.wrong();
      setMood('wobble');
      setSway(true);
      window.setTimeout(() => setSway(false), 480);
      window.setTimeout(() => setMood((m) => (m === 'wobble' ? null : m)), 640);
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 2) {
        recordItem(learnerId, 'pa:segment', false);
        logSkillEvent(learnerId, { skillKey: 'pa:segment', correct: false, at: Date.now() });
        setTaps(word.sounds);
        setPhase('modeled');
      } else {
        setPhase('wrong');
        window.setTimeout(() => {
          setTaps(0);
          setPhase((p) => (p === 'wrong' ? 'idle' : p));
        }, 1400);
      }
    }
  }

  function advanceNow() {
    if (isLast) {
      finishSession();
      return;
    }
    setRound((r) => r + 1);
    setTaps(0);
    setAttempts(0);
    setPhase('idle');
  }

  function finishSession() {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, Date.now() - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'tap-it-out',
      level: 1,
      startedAt: new Date(startRef.current).toISOString(),
      endedAt: new Date().toISOString(),
      durationMs,
      rounds: ROUNDS,
      items: ROUNDS,
      wrongAttempts: wrongRef.current,
      accuracy: firstTryRef.current / ROUNDS,
    });
    awardForSession(learnerId);
    const stars = wrongRef.current === 0 ? 3 : firstTryRef.current >= ROUNDS - 1 ? 2 : 1;
    sfx.win();
    setFinish({ stars });
  }

  function restart() {
    setWords(pickWords(ROUNDS));
    setRound(0);
    setTaps(0);
    setAttempts(0);
    setPhase('idle');
    setFinish(null);
    firstTryRef.current = 0;
    wrongRef.current = 0;
    handledRef.current = false;
    startRef.current = Date.now();
    comboRef.current = 0;
    setCombo(0);
    setMood(null);
    setSway(false);
  }

  const status =
    phase === 'right' ? `Yes! ${word.label} has ${word.sounds} sounds 🌸`
      : phase === 'modeled' ? `${cap(word.label)} has ${word.sounds} sounds. Listen again: ${word.label}.`
        : phase === 'wrong' ? 'Not quite — listen again and stretch each sound.'
          : '';

  return (
    <main className="gd">
      <GardenBackdrop />

      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => goBack('#/level/1')}>← Back</button>
        <span className="gd-badge">🌱 Tap It Out · Word {round + 1}</span>
        <span className="gd-hud__right">
          {combo >= 2 && <span key={combo} className="gd-combo" aria-label={`${combo} in a row`}>🌸 {combo}</span>}
          <span className="gd-seg" aria-label={`Word ${round + 1} of ${ROUNDS}`}>
            {Array.from({ length: ROUNDS }).map((_, i) => <i key={i} className={i <= round ? 'on' : ''} />)}
          </span>
          <button type="button" className="gd-mute" onClick={toggleMute} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} aria-pressed={muted}>{muted ? '🔇' : '🔊'}</button>
        </span>
      </div>

      <div className={`gd-stage${sway ? ' gd-stage--sway' : ''}`}>
        {echoPing > 0 && <EchoTwinkle key={echoPing} className="gd-echoping" />}
        <div className="gd-word">
          <span className="gd-pic" aria-hidden="true">{word.emoji}</span>
          <button type="button" className="gd-hear" onClick={() => { sfx.tap(); pingEcho(); void audio.playWord(word); }}>🔊 Hear it</button>
        </div>

        <p className="gd-ask">Tap a sprout for every sound you hear in <b>{word.label}</b>.</p>

        <div className="gd-row" aria-live="polite">
          {taps === 0 && !bloom && <span className="gd-row__hint">your sprouts grow here…</span>}
          {Array.from({ length: taps }).map((_, i) => (
            <span key={i} className={`gd-grown${bloom ? ' bloom' : ''}`} aria-hidden="true">{bloom ? '🌸' : '🌱'}</span>
          ))}
          {phase === 'right' && (
            <span className="gd-burst" aria-hidden="true">{PETALS.map((a, i) => <i key={i} style={{ '--a': `${a}deg` } as CSSProperties} />)}</span>
          )}
        </div>

        <button type="button" className="gd-pad" onClick={tap} disabled={bloom} aria-label="Tap for one sound">＋ tap a sound</button>

        {!bloom ? (
          <div className="gd-actions">
            <button type="button" className="gd-ghost" onClick={undo} disabled={taps === 0}>Undo</button>
            <button type="button" className="gd-btn" onClick={check} disabled={taps === 0}>Plant it! 🌷</button>
          </div>
        ) : (
          <div className="gd-actions">
            <button type="button" className="gd-btn" onClick={advanceNow}>{isLast ? 'See my garden 🎉' : 'Next word 🌿'}</button>
          </div>
        )}

        <p className={`gd-status${phase === 'wrong' ? ' gd-status--wrong' : ''}`} role="status">{status}</p>
      </div>

      <div className="gd-scout">
        <button type="button" className="gd-scout__btn" onClick={() => { sfx.tap(); setGuideOpen((o) => !o); }} aria-label="Sprout — tap for help">
          <SproutGuide mood={mood} />
        </button>
        {guideOpen && (
          <div className="gd-bubble" role="status">
            <button type="button" className="gd-bubble__x" onClick={() => setGuideOpen(false)} aria-label="Close help">✕</button>
            <p className="gd-bubble__hi">Hi, I'm Sprout! 🌱</p>
            <p>Listen to the word, then <b>tap a sprout for each sound</b>. Stretch it out — like b…ee.</p>
          </div>
        )}
      </div>

      {finish && (
        <div className="gd-finish">
          <div className="gd-petalfall" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--d': `${(i % 7) * 0.32}s`, '--x': `${(i * 7) % 100}%` } as CSSProperties}>{['🌸', '🌼', '🌷', '🌿'][i % 4]}</i>)}</div>
          <div className="gd-finish__card">
            <MascotSpeaker className="gd-finish__pip" size={84} expression="excited" kinds={['celebrate', 'idle']} label="Pip" />
            <div className="gd-finish__bloom" aria-hidden="true">🌸🌼🌷</div>
            <p className="gd-finish__title">Your garden is in bloom!</p>
            <p className="gd-finish__sub">You planted every sound — beautiful listening. 🌿</p>
            <div className="gd-finish__stars" aria-label={`${finish.stars} of 3 stars`}>
              {[0, 1, 2].map((i) => <span key={i} className={i < finish.stars ? 'on' : undefined}>★</span>)}
            </div>
            <div className="gd-finish__btns">
              <button type="button" className="gd-btn" onClick={restart}>Plant again 🌱</button>
              <button type="button" className="gd-ghost" onClick={() => goBack('#/level/1')}>Back to Level 1</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
