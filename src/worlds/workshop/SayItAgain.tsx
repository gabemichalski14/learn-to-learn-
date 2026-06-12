import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildReadingRounds, type ReadingRound } from './readingRounds';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './workshop.css';

const ROUNDS = 5;
const READ_HINT = 'Listen to Patch — then read it back, word by word. 🧵';

/**
 * Say It Again — Level 3 ECHO READING. Patch reads a short decodable sentence
 * (the model); the child reads it back by tapping each word in order; then a
 * COMPREHENSION beat ("which one is it about?") must be cleared before it counts —
 * so a child can never win by word-calling. Logs ONE `read:sentence` event per
 * sentence (correct = comprehension right first try; latency = reading pace, kept
 * for the tutor, never shown). Reading is enrichment, not a level gate.
 */
export function SayItAgain({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(3); // Patch
  const [rounds, setRounds] = useState<ReadingRound[]>(() => buildReadingRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [phase, setPhase] = useState<'read' | 'check'>('read');
  const [readCount, setReadCount] = useState(0);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(READ_HINT);
  const [wrongOpt, setWrongOpt] = useState<string | null>(null);
  const [finish, setFinish] = useState<{ stars: number } | null>(null);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };

  const startRef = useRef(0);
  const wrongRef = useRef(0);
  const roundStartRef = useRef(0);
  const compWrongRef = useRef(0);
  const compFirstWrongRef = useRef<string | undefined>(undefined);
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];
  const words = useMemo(() => (round ? round.unit.text.replace(/\.$/, '').split(' ') : []), [round]);

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { roundStartRef.current = Date.now(); void audio.narrate(round.unit.text); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  function tapWord(idx: number) {
    if (finish || phase !== 'read' || !round || idx !== readCount) return; // read in order
    sfx.tap();
    void audio.playWord({ id: words[idx], label: words[idx].toLowerCase(), emoji: '🔈' });
    const next = readCount + 1;
    setReadCount(next);
    if (next >= words.length) {
      setLine('Nice reading! Now — which one is it about?');
      void audio.narrate(round.unit.text);
      window.setTimeout(() => setPhase('check'), 350);
    }
  }

  function tapOption(opt: ReadingRound['options'][number]) {
    if (finish || phase !== 'check' || advancingRef.current || !round) return;
    if (opt.correct) {
      advancingRef.current = true;
      sfx.correct();
      setMood('cheer');
      const correct = compWrongRef.current === 0;
      const chosen = compFirstWrongRef.current;
      window.setTimeout(() => {
        const at = Date.now();
        const latencyMs = Math.max(0, at - roundStartRef.current);
        recordItem(learnerId, 'read:sentence', correct, latencyMs, correct ? undefined : chosen, true);
        logSkillEvent(learnerId, { skillKey: 'read:sentence', correct, at, game: 'say-it-again', level: 3, firstTry: true, latencyMs, chosen: correct ? undefined : chosen });
      }, 0);
      if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => {
        setMood(null);
        compWrongRef.current = 0; compFirstWrongRef.current = undefined;
        if (ri + 1 >= ROUNDS) finishSession(Date.now());
        else { setRi((n) => n + 1); setReadCount(0); setPhase('read'); setLine(READ_HINT); advancingRef.current = false; }
      }, 1100);
    } else {
      wrongRef.current += 1;
      compWrongRef.current += 1;
      if (compFirstWrongRef.current === undefined) compFirstWrongRef.current = opt.word;
      sfx.wrong();
      setMood('wobble');
      setWrongOpt(opt.word);
      window.setTimeout(() => { setWrongOpt(null); setMood(null); }, 460);
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'say-it-again', level: 3,
      startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(),
      durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: ROUNDS / (ROUNDS + wrongRef.current),
    });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ stars: wrongRef.current === 0 ? 3 : wrongRef.current <= 2 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advancingRef.current = false; wrongRef.current = 0;
    compWrongRef.current = 0; compFirstWrongRef.current = undefined;
    startRef.current = Date.now(); setRounds(buildReadingRounds(ROUNDS)); setFinish(null);
    setRi(0); setReadCount(0); setPhase('read'); setLine(READ_HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game"
      back={{ label: '← Workshop', onClick: () => goBack('#/level/3') }}
      badge={<>🗣️ Say It Again · Level 3</>}
      current={ri}
      total={ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">You read them all! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{character?.name ?? 'Patch'} loved hearing you read out loud. 🧵</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Read again 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/3')}>Back to the Workshop</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Patch'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood={mood} size={88} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <div className="wk-sentence" aria-label="the sentence to read">
            {words.map((w, idx) => (
              <button
                key={idx}
                type="button"
                className={`wk-word${idx < readCount ? ' is-read' : ''}${phase === 'read' && idx === readCount ? ' is-next' : ''}`}
                disabled={phase !== 'read' || idx !== readCount}
                onClick={() => tapWord(idx)}
              >{w}</button>
            ))}
          </div>
          <button type="button" className="wk-hear" onClick={() => { void audio.narrate(round.unit.text); sfx.tap(); }}>🔊 hear it</button>

          {phase === 'check' && (
            <>
              <p className="wk-prompt" role="status">Which one is it about?</p>
              <div className="wk-options" role="group" aria-label="pick the picture">
                {round.options.map((opt) => (
                  <button key={opt.word} type="button" className={`wk-opt${wrongOpt === opt.word ? ' is-wrong' : ''}`} onClick={() => tapOption(opt)} aria-label={opt.word}>
                    <span aria-hidden="true">{opt.emoji}</span>
                  </button>
                ))}
              </div>
            </>
          )}

        </div>
      )}
    </GameShell>
  );
}
