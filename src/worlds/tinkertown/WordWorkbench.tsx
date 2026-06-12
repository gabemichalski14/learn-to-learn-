import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildWordSumRounds, type WordSumRound } from '../../content/packs/level5';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './tinkertown.css';

const ROUNDS = 6;
const SKILL = 'affix:build';
const HINT = 'Build the word from its parts — in order! 🧩';

/**
 * Word Workbench — Sprig's Level 5 WORD-SUMS game. The child is shown a meaning
 * (picture) and builds the word that means it by tapping its parts IN ORDER from a
 * tray of parts + distractors (un + lock → unlock). Teaches that a big word is just
 * parts bolted together, and that the base stays stable. Only the correct next part
 * advances the build (no soft-lock); a wrong part springs back. Logs affix:build.
 */
export function WordWorkbench({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(5); // Sprig
  const [rounds, setRounds] = useState<WordSumRound[]>(() => buildWordSumRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [usedIdx, setUsedIdx] = useState<number[]>([]); // tray indices placed, in order
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(HINT);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const roundWrongRef = useRef(0);
  const shownRef = useRef(0);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];
  const solved = round != null && usedIdx.length === round.parts.length;
  const built = round ? round.parts.slice(0, usedIdx.length).join('') : '';
  const say = (w: string) => { void audio.playWord({ id: w, label: w, emoji: '🔈' }); };

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) shownRef.current = Date.now(); // usedIdx is reset on advance, not here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function tapPart(part: string, idx: number) {
    if (!round || finish || advancingRef.current || solved || usedIdx.includes(idx)) return;
    const expected = round.parts[usedIdx.length]; // the next part the word needs
    if (part === expected) {
      const nextUsed = [...usedIdx, idx];
      setUsedIdx(nextUsed);
      if (nextUsed.length === round.parts.length) {
        advancingRef.current = true;
        const firstTry = roundWrongRef.current === 0;
        const shown = shownRef.current;
        window.setTimeout(() => {
          const latencyMs = Date.now() - shown;
          recordItem(learnerId, SKILL, firstTry, latencyMs);
          logSkillEvent(learnerId, { skillKey: SKILL, correct: firstTry, at: Date.now(), game: 'l5-build', level: 5, firstTry: true, latencyMs, replays: 0 });
        }, 0);
        sfx.correct(); setMood('cheer');
        window.setTimeout(() => say(round.word), 300);
        if (character) setLine(reactionLine(character, 'correct'));
        window.setTimeout(() => {
          setMood(null); roundWrongRef.current = 0;
          if (ri + 1 >= rounds.length) finishSession(Date.now());
          else { setUsedIdx([]); setRi((n) => n + 1); setLine(HINT); advancingRef.current = false; }
        }, 1300);
      } else {
        sfx.tap();
      }
    } else {
      wrongRef.current += 1; roundWrongRef.current += 1;
      sfx.wrong(); setWrongIdx(idx); setMood('wobble');
      if (character) setLine(reactionLine(character, 'wrong'));
      window.setTimeout(() => { setWrongIdx(null); setMood(null); }, 600); // springs back, no shame
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'l5-build', level: 5,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: rounds.length, items: rounds.length, wrongAttempts: wrongRef.current,
      accuracy: rounds.length / (rounds.length + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    roundWrongRef.current = 0; startRef.current = Date.now();
    setRounds(buildWordSumRounds(ROUNDS)); setFinish(null); setRi(0); setUsedIdx([]); setLine(HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game tt"
      back={{ label: '← Tinker Town', onClick: () => goBack('#/level/5') }}
      badge={<>🧩 Word Workbench · Level 5</>}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Every word built! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">Sprig says a big word is just parts holding hands. 🧩</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Build more 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/5')}>Back to Tinker Town</button>
            </div>
          </div>
        </div>
      ) : round ? (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Sprig'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🧚'} heal={1} mood={mood} size={88} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <div className="tt-pic" aria-hidden="true">{round.emoji}</div>
          <p className="tt-job">build the word that means: <b>{round.meaning}</b></p>
          <p className="tt-built" aria-live="polite" aria-label={`built so far: ${built}`}>{built || ' '}</p>

          <div className="tt-opts" role="group" aria-label="word parts to bolt together">
            {round.tray.map((part, idx) => (
              <button
                key={idx}
                type="button"
                className={`tt-part${usedIdx.includes(idx) ? ' is-used' : ''}${wrongIdx === idx ? ' is-wrong' : ''}`}
                disabled={usedIdx.includes(idx) || solved}
                onClick={() => tapPart(part, idx)}
                aria-label={`part ${part}`}
              >{part}</button>
            ))}
          </div>

          <p className="tt-help">🧩 A big word is just parts holding hands — un + lock → unlock.</p>
        </div>
      ) : null}
    </GameShell>
  );
}
