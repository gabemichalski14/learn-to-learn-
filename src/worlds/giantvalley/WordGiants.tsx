import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildMultiRounds } from '../../content/packs/level4';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import '../workshop/workshop.css';
import './giantvalley.css';

const ROUNDS = 8;
const SKILL = 'read:multi';

/**
 * Word Giants — Bram's Level 4 multisyllable reading game. A long word appears in
 * its syllable CHUNKS (sun·set); read it part by part, then tap its picture.
 * Logs `read:multi`.
 */
export function WordGiants({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(4);
  const [rounds, setRounds] = useState(() => buildMultiRounds(ROUNDS));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState('A giant word! Read it one part at a time — then tap its picture. 🦕');
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ score: number; stars: number } | null>(null);

  const startRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const handledRef = useRef(false);
  const advRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const shownRef = useRef(0);
  const round = rounds[i];

  const sayParts = (syl: string[]) => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = syl.map((s, idx) => window.setTimeout(() => { void audio.playWord({ id: s, label: s, emoji: '🔈' }); }, idx * 650));
  };

  useEffect(() => { startRef.current = Date.now(); return () => timersRef.current.forEach((t) => window.clearTimeout(t)); }, []);
  useEffect(() => {
    shownRef.current = Date.now(); // when this word is shown (for latency)
    if (round && !finish) sayParts(round.syllables);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i]);

  function choose(word: string) {
    if (picked !== null || !round || finish || advRef.current) return;
    const correct = word === round.word;
    setPicked(word); advRef.current = true;
    if (correct) { correctRef.current += 1; sfx.correct(); setMood('cheer'); if (character) setLine(reactionLine(character, 'correct')); }
    else { wrongRef.current += 1; sfx.wrong(); setMood('wobble'); if (character) setLine(reactionLine(character, 'wrong')); }
    // log latency in a deferred callback (render-safe; ~0ms delay ≈ tap time) —
    // Word Giants is a fluency game, so speed is the signal
    const shown = shownRef.current;
    window.setTimeout(() => {
      const latencyMs = Date.now() - shown;
      recordItem(learnerId, SKILL, correct, latencyMs, correct ? undefined : word);
      logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'word-giants', level: 4, firstTry: true, latencyMs, replays: 0, chosen: correct ? undefined : word }); // replays 0 — read-fast fluency, no re-hear by design
    }, 0);
    window.setTimeout(() => {
      setMood(null); setPicked(null); advRef.current = false;
      if (i + 1 >= ROUNDS) finishSession(Date.now()); else setI((n) => n + 1);
    }, 1000);
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, { game: 'word-giants', level: 4, startedAt: new Date(startRef.current).toISOString(), endedAt: new Date(endAt).toISOString(), durationMs, rounds: ROUNDS, items: ROUNDS, wrongAttempts: wrongRef.current, accuracy: correctRef.current / ROUNDS });
    awardForSession(learnerId);
    sfx.win();
    setFinish({ score: correctRef.current, stars: wrongRef.current === 0 ? 3 : correctRef.current >= ROUNDS - 1 ? 2 : 1 });
  }

  function restart() {
    handledRef.current = false; advRef.current = false; correctRef.current = 0; wrongRef.current = 0;
    startRef.current = Date.now(); setRounds(buildMultiRounds(ROUNDS)); setFinish(null); setI(0); setPicked(null);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game gv"
      back={{ label: '← Valley', onClick: () => goBack('#/level/4') }}
      badge={<>🦕 Word Giants · Level 4</>}
      current={i}
      total={rounds.length}
      muted={muted}
      onToggleMute={toggleMute}
    >

      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">Giant reader! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{finish.score} / {ROUNDS} read · {character?.name ?? 'Bram'} climbed every big word with you. 🏔️</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Play again 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/4')}>Back to the Valley</button>
            </div>
          </div>
        </div>
      ) : round && (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Bram'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🦕'} heal={1} mood={mood} size={96} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <button type="button" className="wg-word" onClick={() => sayParts(round.syllables)} aria-label={`read the word ${round.word}`}>
            {round.syllables.map((s, n) => (
              <span key={n} className="wg-chunk">{s}{n < round.syllables.length - 1 && <span className="wg-dot" aria-hidden="true">·</span>}</span>
            ))}
          </button>
          <p className="nc-step">Which picture is it?</p>
          <div className="nc-row">
            {round.options.map((opt) => (
              <button key={opt.word} type="button"
                className={`wg-opt${picked === opt.word ? (opt.word === round.word ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null} onClick={() => choose(opt.word)} aria-label={opt.word}>
                <span className="wg-opt__emoji">{opt.emoji}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}
