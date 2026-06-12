import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { tapItOutWords, type TapWord } from '../../content/packs/tapItOut';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { GardenBackdrop } from './GardenArt';
import { GameShell } from '../../ui/GameShell';
import { Icon } from '../../ui/Icon';
import { EchoTwinkle } from '../../mascots/EchoTwinkle';
import { MascotSpeaker } from '../../mascots/MascotSpeaker';
import { castFor, reactionLine, healFor, characterStage, fragmentToReveal, isFullyRecovered } from '../../world/lore/cast';
import { setStoryStage, acknowledge, loadLore } from '../../world/lore/loreStore';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { WordPicture } from '../../world/WordPicture';
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
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const [words, setWords] = useState<TapWord[]>(() => pickWords(ROUNDS));
  const [round, setRound] = useState(0);
  const [taps, setTaps] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [finish, setFinish] = useState<{ stars: number; beat?: string; homecoming?: boolean } | null>(null);

  // Chip — the Level 1 companion. You TEACH him to hear the beats (protégé
  // effect); each word you tap out, he catches another beat and heals from your
  // REAL phonemic-awareness mastery. When the level's whole (95%), he goes home.
  const character = castFor(1);
  const [chipHeal, setChipHeal] = useState(() => (character ? healFor(character, loadMastery(learnerId)) : 0));
  const [chipLine, setChipLine] = useState(() => {
    if (!character) return '';
    const whole = isFullyRecovered(character, loadMastery(learnerId));
    if (whole && character.revisit?.length) return character.revisit[Math.floor(Math.random() * character.revisit.length)];
    return reactionLine(character, 'teach');
  });
  const [chipMood, setChipMood] = useState<'cheer' | 'wobble' | 'point' | 'bloom' | null>(null);

  // Juice state
  const [combo, setCombo] = useState(0);
  const comboRef = useRef(0);
  const [sway, setSway] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [echoPing, setEchoPing] = useState(0); // bumps on an audio moment → Echo twinkles
  const pingEcho = () => setEchoPing((p) => p + 1);
  const [grew, setGrew] = useState(0); // bumps when a word is solved → a flower joins your garden

  const startRef = useRef(Date.now());
  const firstTryRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const wordShownRef = useRef(Date.now()); // when the current word appeared → response time
  const replaysRef = useRef(0); // audio replays for the current word (uncertainty signal)

  const word = words[round];
  const isLast = round >= ROUNDS - 1;
  const bloom = phase === 'right' || phase === 'modeled';
  // Pre-emptive tutorial: on the very first word, before any tap, Chip shows the
  // way — he points and the tap pad lights up ("watch, then you try"). Clears the
  // moment you tap. No hand-holding after that.
  const tutorial = !!character && round === 0 && taps === 0 && attempts === 0 && phase === 'idle';

  // Hear the word whenever it changes (and on restart). Also (re)start the
  // per-item clock for response-time data — never shown to the child, no timer UI.
  useEffect(() => {
    void audio.playWord(words[round]);
    wordShownRef.current = Date.now();
    replaysRef.current = 0;
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
    if (chipMood === 'point') setChipMood(null); // first tap ends the tutorial point
    const next = taps + 1;
    sfx.tick(next); // pitch climbs with each sound — anticipation
    setTaps(next);
  }
  function undo() {
    if (bloom) return;
    setTaps((t) => Math.max(0, t - 1));
  }

  function check() {
    if (bloom || taps === 0) return;
    void audio.playWord(word);
    pingEcho();
    const isCorrect = taps === word.sounds;
    // Record the FIRST attempt's outcome ONCE → first-try mastery. Retries are
    // practice, not the assessment, so they must not touch the score.
    if (attempts === 0) {
      if (isCorrect) firstTryRef.current += 1;
      recordItem(learnerId, 'pa:segment', isCorrect, Date.now() - wordShownRef.current);
      logSkillEvent(learnerId, { skillKey: 'pa:segment', correct: isCorrect, at: Date.now(), game: 'tap-it-out', level: 1, firstTry: true, latencyMs: Date.now() - wordShownRef.current, replays: replaysRef.current });
    }
    if (isCorrect) {
      // Bloom + climbing combo + a happy Sprout.
      const c = comboRef.current + 1;
      comboRef.current = c;
      setCombo(c);
      if (c >= 2) sfx.combo(c); else sfx.correct();
      setGrew((g) => g + 1); // a flower for your garden
      // Chip catches the beat — heal from real mastery + react (reveal his memory
      // the moment his sound is fully recovered, else a warm "I caught it").
      if (character) {
        setChipHeal(healFor(character, loadMastery(learnerId)));
        const frag = fragmentToReveal(character, loadLore(learnerId), loadMastery(learnerId));
        if (frag) { setChipLine(frag.line); acknowledge(learnerId, frag.id); }
        else setChipLine(reactionLine(character, 'correct'));
        setChipMood('cheer');
        window.setTimeout(() => setChipMood((m) => (m === 'cheer' ? null : m)), 900);
      }
      setPhase('right');
    } else {
      wrongRef.current += 1;
      comboRef.current = 0;
      setCombo(0);
      sfx.wrong();
      setSway(true);
      window.setTimeout(() => setSway(false), 480);
      if (character) {
        setChipLine(reactionLine(character, 'wrong'));
        setChipMood('wobble');
        window.setTimeout(() => setChipMood((m) => (m === 'wobble' ? null : m)), 700);
      }
      const next = attempts + 1;
      setAttempts(next);
      if (next >= 2) {
        // First-attempt outcome already recorded above; the give-up is just modeling.
        if (character) setChipHeal(healFor(character, loadMastery(learnerId)));
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
    // If Chip's whole now (PA fully mastered at the 95% bar), advance his arc and
    // offer to send him home to the Village.
    const stage = character ? characterStage(character, loadLore(learnerId), loadMastery(learnerId)) : 'arrived';
    const homecoming = stage === 'healed'; // finale only the first time he's whole
    if (stage === 'healed' && character) setStoryStage(learnerId, character.id, 'healed');
    setFinish({
      stars,
      beat: character ? reactionLine(character, homecoming ? 'win' : 'clear') : undefined,
      homecoming,
    });
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
    setSway(false);
    if (character) {
      setChipHeal(healFor(character, loadMastery(learnerId)));
      setChipLine(reactionLine(character, 'teach'));
      setChipMood(null);
    }
  }

  const status =
    phase === 'right' ? `Yes! ${word.label} has ${word.sounds} sounds 🌸`
      : phase === 'modeled' ? `${cap(word.label)} has ${word.sounds} sounds. Listen again: ${word.label}.`
        : phase === 'wrong' ? 'Not quite — listen again and stretch each sound.'
          : '';

  return (
    <GameShell
      prefix="gd"
      rootClass="gd"
      backdrop={<GardenBackdrop />}
      back={{ label: '← Garden', onClick: () => goBack('#/level/1') }}
      badge={<><Icon name="ico-tap-it-out" emoji="🌱" /> Tap It Out · Word {round + 1}</>}
      current={round}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
      rightExtra={combo >= 2 ? <span key={combo} className="gd-combo" aria-label={`${combo} in a row`}>🌸 {combo}</span> : undefined}
    >
      <div className={`gd-stage${sway ? ' gd-stage--sway' : ''}`}>
        {echoPing > 0 && <EchoTwinkle key={echoPing} className="gd-echoping" />}

        {character && (
          <div className="gd-hero">
            <button
              type="button"
              className="gd-hero__face"
              onClick={() => { void audio.narrate(chipLine); sfx.tap(); setChipMood('cheer'); window.setTimeout(() => setChipMood((m) => (m === 'cheer' ? null : m)), 760); }}
              aria-label={`Hear ${character.name} again`}
            >
              <CharacterArt emoji={character.emoji} heal={chipHeal} mood={tutorial ? 'point' : chipMood} size={96} art={character.art} label={character.name} />
            </button>
            <div className="gd-hero__body">
              <p className="gd-hero__line" role="status">{chipLine}</p>
              <div className="gd-hero__meter" role="img" aria-label={`${character.name}'s song: ${Math.round(chipHeal * 100)}% back`}>
                <span className="gd-hero__fill" style={{ width: `${Math.round(chipHeal * 100)}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="gd-word">
          <WordPicture label={word.label} emoji={word.emoji} className="gd-wordpic" />
          <span className="gd-word__label">{cap(word.label)}</span>
          <button type="button" className="gd-hear" onClick={() => { replaysRef.current += 1; sfx.tap(); pingEcho(); void audio.playWord(word); }}><Icon name="ico-hear" emoji="🔊" /> Hear it</button>
        </div>

        <p className="gd-ask">How many sounds do you hear? <b>Tap a beat for each one.</b></p>

        {/* the beat lane — big, clearly-counted tokens fill left→right as you tap */}
        <div className="gd-beats" aria-live="polite" aria-label={`${taps} ${taps === 1 ? 'beat' : 'beats'} so far`}>
          {taps === 0 && !bloom && <span className="gd-beats__hint">your beats show here →</span>}
          {Array.from({ length: taps }).map((_, i) => (
            <span key={i} className={`gd-beat${bloom ? ' bloom' : ''}`} aria-hidden="true">{bloom ? '🌸' : i + 1}</span>
          ))}
          {phase === 'right' && (
            <span className="gd-burst" aria-hidden="true">{PETALS.map((a, i) => <i key={i} style={{ '--a': `${a}deg` } as CSSProperties} />)}</span>
          )}
          {grew > 0 && <span key={grew} className="gd-grew" aria-hidden="true">+🌷</span>}
        </div>
        <p className="gd-beatcount" aria-hidden="true">{bloom ? `${taps} sounds 🎵` : taps > 0 ? `${taps} ${taps === 1 ? 'sound' : 'sounds'} so far` : ' '}</p>

        {!bloom ? (
          <>
            <button type="button" className={`gd-tapbtn${tutorial ? ' gd-tapbtn--hint' : ''}`} onClick={tap} aria-label="Tap for one sound">
              <span className="gd-tapbtn__ico" aria-hidden="true"><Icon name="ico-tap" emoji="👆" /></span>
              <span className="gd-tapbtn__label">Tap</span>
              <span className="gd-tapbtn__sub">one tap = one sound</span>
            </button>
            <div className="gd-actions">
              <button type="button" className="gd-ghost" onClick={undo} disabled={taps === 0}><Icon name="ico-undo" emoji="↩" /> Undo</button>
              <button type="button" className="gd-btn" onClick={check} disabled={taps === 0}>Plant it! <Icon name="ico-plant" emoji="🌷" /></button>
            </div>
          </>
        ) : (
          <div className="gd-actions">
            <button type="button" className="gd-btn" onClick={advanceNow}>{isLast ? 'See my garden 🎉' : <>Next word <Icon name="ico-leaf" emoji="🌿" /></>}</button>
          </div>
        )}

        <p className={`gd-status${phase === 'wrong' ? ' gd-status--wrong' : ''}`} role="status">{status}</p>
      </div>

      {finish && (
        <div className="gd-finish">
          <div className="gd-petalfall" aria-hidden="true">{Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ '--d': `${(i % 7) * 0.32}s`, '--x': `${(i * 7) % 100}%` } as CSSProperties}>{['🌸', '🌼', '🌷', '🌿'][i % 4]}</i>)}</div>
          <div className="gd-finish__card">
            <MascotSpeaker className="gd-finish__pip" size={84} expression="excited" kinds={['celebrate', 'idle']} label="Pip" />
            <div className="gd-finish__bloom" aria-hidden="true">🌸🌼🌷</div>
            <p className="gd-finish__title">{finish.homecoming ? 'Chip can play his whole song!' : 'Your garden is in bloom!'}</p>
            <p className="gd-finish__sub">{finish.beat ?? 'You planted every sound — beautiful listening. 🌿'}</p>
            <div className="gd-finish__stars" aria-label={`${finish.stars} of 3 stars`}>
              {[0, 1, 2].map((i) => <span key={i} className={i < finish.stars ? 'on' : undefined}>★</span>)}
            </div>
            <div className="gd-finish__btns">
              {finish.homecoming && <button type="button" className="gd-btn" onClick={() => { if (character) setStoryStage(learnerId, character.id, 'resident'); navigate('#/village'); }}>Walk Chip home 🏡</button>}
              <button type="button" className="gd-btn" onClick={restart}>Plant again 🌱</button>
              <button type="button" className="gd-ghost" onClick={() => goBack('#/level/1')}>Back to Level 1</button>
            </div>
          </div>
        </div>
      )}
    </GameShell>
  );
}
