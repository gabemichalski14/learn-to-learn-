import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { buildSwitchRounds } from '../../content/packs/switchIt';
import { recordItem, loadMastery } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { GardenBackdrop } from './GardenArt';
import { castFor, reactionLine, healFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './garden.css';

const ROUNDS = 8;
const SKILL = 'pa:manipulate';
const BEAD_COLORS = ['#3f8f5e', '#4f6fc0', '#c47f1e', '#a8569c']; // one hue per sound slot (deepened for contrast)

/** Render a word with each letter tinted to match its sound-bead, so the child
 *  can map "which letter changed" → "which colored bead to tap". */
function ColoredWord({ word }: { word: string }) {
  return (
    <>
      {Array.from(word).map((ch, i) => (
        <span key={i} className="si-cw" style={{ color: BEAD_COLORS[i % BEAD_COLORS.length] } as CSSProperties}>{ch}</span>
      ))}
    </>
  );
}

/**
 * Switch It — Chip's Level 1 phoneme-manipulation game. Hear a word, then a new
 * word that differs by one sound, and tap the bead (one per sound — no letters,
 * Level 1 is oral) in the position that changed. Logs `pa:manipulate` mastery.
 */
export function SwitchItGame({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(1); // Chip
  // Chip's real recovery, so he looks the SAME across every Level-1 game.
  const heal = character ? healFor(character, loadMastery(learnerId)) : 1;
  const [rounds, setRounds] = useState(() => buildSwitchRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('Let’s remix a word! Listen, then tap the sound that SWITCHED.');
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);
  // Level 1 is ORAL first: the words are hidden so the child uses their ear, with
  // an optional "show me" reveal as a scaffold. Resets to hidden each new round.
  const [showLetters, setShowLetters] = useState(false);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const round = rounds[i];

  useEffect(() => { startRef.current = Date.now(); }, []);

  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  // On a new round: hear the source word, then the target it should become.
  useEffect(() => {
    if (!round || finish) return;
    say(round.source);
    const id = window.setTimeout(() => say(round.target), 1050);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function choose(idx: number) {
    if (picked !== null || !round || finish) return;
    const correct = idx === round.changeIndex;
    setPicked(idx);
    if (correct) {
      correctRef.current += 1; sfx.correct(); setMood('cheer');
      if (character) setLine(reactionLine(character, 'correct'));
      say(round.target);
    } else {
      wrongRef.current += 1; sfx.wrong(); setMood('wobble');
      if (character) setLine(reactionLine(character, 'wrong'));
    }
    window.setTimeout(() => {
      const now = Date.now();
      recordItem(learnerId, SKILL, correct);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: now, game: 'switch-it', level: 1, firstTry: true });
      setMood(null); setPicked(null); setShowLetters(false);
      if (i + 1 >= ROUNDS) finishSession(now);
      else setI((n) => n + 1);
    }, 1150);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    const correct = correctRef.current;
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'switch-it', level: 1,
      startedAt: new Date(startRef.current).toISOString(),
      endedAt: new Date(endAt).toISOString(),
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
    setRounds(buildSwitchRounds(ROUNDS));
    setFinish(null); setI(0); setPicked(null); setShowLetters(false);
  }

  const resolved = picked !== null;

  return (
    <main className="gd sd si">
      <GardenBackdrop />
      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => goBack('#/level/1')}>← Garden</button>
        <span className="gd-badge">🔁 Switch It · Level 1</span>
      </div>

      {finish ? (
        <div className="gd-stage">
          <div className="gd-finish">
            <div className="sd-finish__art"><CharacterArt emoji={character?.emoji ?? '🦗'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="gd-finish__title">Great switching! {'★'.repeat(finish.stars)}</p>
            <p className="sd-finish__score">{finish.score} / {ROUNDS} right</p>
            <p className="sd-finish__say">{character?.name} loves how you remix the sounds. 🎵</p>
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
              <button type="button" className="gd-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character.name} again`}>
                <CharacterArt emoji={character.emoji} heal={heal} mood={mood} size={76} art={character.art} label={character.name} />
              </button>
              <div className="gd-hero__body">
                <p className="gd-hero__line" role="status">{line}</p>
                <span className="sd-progress" aria-hidden="true">
                  {rounds.map((_, n) => <i key={n} className={n < i ? 'done' : n === i ? 'on' : ''} />)}
                </span>
              </div>
            </div>
          )}

          {round && (
            <div className="gd-panel">
              <p className="sd-q">Listen to both words. Tap the sound that <b>switched</b> — first, middle, or last.</p>
              {/* Oral first: words hidden unless the child asks to see them. The
                  letters are tinted to match the beads so the mapping is clear. */}
              {showLetters && (
                <p className="si-reveal"><ColoredWord word={round.source} /> <span className="si-reveal__arrow" aria-hidden="true">→</span> <ColoredWord word={round.target} /></p>
              )}
              <div className="si-beads" role="group" aria-label="sounds">
                {Array.from(round.source).map((_, idx) => {
                  const isAnswer = idx === round.changeIndex;
                  const state = resolved && isAnswer ? ' is-answer' : resolved && picked === idx ? ' is-wrong' : '';
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`si-bead${state}`}
                      style={{ '--bead': BEAD_COLORS[idx % BEAD_COLORS.length] } as CSSProperties}
                      disabled={resolved}
                      onClick={() => choose(idx)}
                      aria-label={`sound ${idx + 1}`}
                    />
                  );
                })}
              </div>
              <div className="sd-listen">
                <button type="button" className="sd-listen__btn" onClick={() => round && say(round.source)}>🔊 First word</button>
                <button type="button" className="sd-listen__btn" onClick={() => round && say(round.target)}>🔊 Second word</button>
              </div>
              <button type="button" className="si-hint" onClick={() => { setShowLetters((v) => !v); sfx.tap(); }} aria-pressed={showLetters}>
                {showLetters ? '🙈 Hide the words' : '👀 Show me the words'}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
