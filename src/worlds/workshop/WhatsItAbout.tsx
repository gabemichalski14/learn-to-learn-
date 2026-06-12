import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx, isMuted, setMuted } from '../../audio/sfx';
import { GameShell } from '../../ui/GameShell';
import { buildComprehensionRounds, type ComprehensionRound } from './comprehensionRounds';
import { recordItem } from '../../mastery/mastery';
import { logSkillEvent } from '../../data/cloudSync';
import { recordFinish } from '../../progress';
import { logSession } from '../../sessionLog';
import { awardForSession } from '../../achievements';
import { castFor, reactionLine } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import './workshop.css';

const ROUNDS = 5;
const HINT = 'Read it to yourself — then tap the picture it’s about. 📖';
const SKILL = 'read:comprehension';

/**
 * What's It About? — Level 3 COMPREHENSION (the language strand). Patch shows a
 * decodable sentence; the child reads it, then taps the picture that answers a
 * who/what/where question. The distractors share the answer's category (the meaning
 * engine guarantees it), so a child can't pass by word-calling — they must
 * understand the sentence. Logs one read:comprehension event per sentence (correct =
 * right first try; latency from sentence-shown; replays = sentence re-hears).
 */
export function WhatsItAbout({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(3); // Patch
  const [rounds, setRounds] = useState<ComprehensionRound[]>(() => buildComprehensionRounds(ROUNDS));
  const [ri, setRi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState(HINT);
  const [muted, setMutedState] = useState(isMuted());
  const toggleMute = () => { const next = !muted; setMuted(next); setMutedState(next); };
  const [finish, setFinish] = useState<{ stars: number } | null>(null);

  const startRef = useRef(0);
  const wrongRef = useRef(0); // total wrong taps (for the star score)
  const roundWrongRef = useRef(0); // wrong taps in the CURRENT sentence
  const firstWrongRef = useRef<string | undefined>(undefined);
  const shownRef = useRef(0); // when the sentence appeared → comprehension latency
  const replaysRef = useRef(0); // sentence re-hears for the current item
  const advancingRef = useRef(false);
  const handledRef = useRef(false);

  const round = rounds[ri];

  useEffect(() => { startRef.current = Date.now(); }, []);
  useEffect(() => {
    if (round && !finish) { shownRef.current = Date.now(); replaysRef.current = 0; void audio.narrate(round.sentence); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  const hearSentence = () => { if (round) { replaysRef.current += 1; void audio.narrate(round.sentence); sfx.tap(); } };

  function choose(optWord: string) {
    if (picked !== null || !round || finish || advancingRef.current) return;
    const isAnswer = optWord === round.answer.word;
    setPicked(optWord);
    if (isAnswer) {
      advancingRef.current = true;
      const correct = roundWrongRef.current === 0; // right on the FIRST try?
      const chosen = firstWrongRef.current;
      const shown = shownRef.current;
      const replays = replaysRef.current;
      window.setTimeout(() => {
        const latencyMs = Date.now() - shown;
        recordItem(learnerId, SKILL, correct, latencyMs, correct ? undefined : chosen, true);
        logSkillEvent(learnerId, { skillKey: SKILL, correct, at: Date.now(), game: 'whats-it-about', level: 3, firstTry: true, latencyMs, replays, chosen: correct ? undefined : chosen });
      }, 0);
      sfx.correct(); setMood('cheer');
      if (character) setLine(reactionLine(character, 'correct'));
      window.setTimeout(() => {
        setMood(null); setPicked(null);
        roundWrongRef.current = 0; firstWrongRef.current = undefined;
        if (ri + 1 >= rounds.length) finishSession(Date.now());
        else { setRi((n) => n + 1); setLine(HINT); }
      }, 1000);
    } else {
      wrongRef.current += 1; roundWrongRef.current += 1;
      if (firstWrongRef.current === undefined) firstWrongRef.current = optWord;
      sfx.wrong(); setMood('wobble'); setLine('Read it again — which one is it really about?');
      window.setTimeout(() => { setMood(null); setPicked(null); }, 800); // gentle retry, no shame
    }
  }

  function finishSession(endAt: number) {
    if (handledRef.current) return;
    handledRef.current = true;
    const durationMs = Math.max(0, endAt - startRef.current);
    recordFinish(learnerId, durationMs);
    logSession(learnerId, {
      game: 'whats-it-about', level: 3,
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
    roundWrongRef.current = 0; firstWrongRef.current = undefined; startRef.current = Date.now();
    setRounds(buildComprehensionRounds(ROUNDS)); setFinish(null); setRi(0); setPicked(null); setLine(HINT);
  }

  return (
    <GameShell
      prefix="wk"
      rootClass="wk wk-game"
      back={{ label: '← Workshop', onClick: () => goBack('#/level/3') }}
      badge={<>📖 What's It About? · Level 3</>}
      current={ri}
      total={rounds.length || ROUNDS}
      muted={muted}
      onToggleMute={toggleMute}
    >
      {finish ? (
        <div className="wk-stage">
          <div className="wk-finish">
            <div className="wk-finish__art"><CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} /></div>
            <p className="wk-finish__title">You understood them all! {'★'.repeat(finish.stars)}</p>
            <p className="wk-finish__say">{character?.name ?? 'Patch'} loves how you read for meaning. 📖</p>
            <div className="wk-actions">
              <button type="button" className="wk-btn" onClick={restart}>Read more 🔁</button>
              <button type="button" className="wk-btn wk-btn--ghost" onClick={() => navigate('#/level/3')}>Back to the Workshop</button>
            </div>
          </div>
        </div>
      ) : round ? (
        <div className="wk-stage">
          <div className="wk-hero">
            <button type="button" className="wk-hero__face" onClick={() => { void audio.narrate(line); sfx.tap(); }} aria-label={`Hear ${character?.name ?? 'Patch'} again`}>
              <CharacterArt emoji={character?.emoji ?? '🧵'} heal={1} mood={mood} size={88} art={character?.art} label={character?.name} />
            </button>
            <p className="wk-hero__line" role="status">{line}</p>
          </div>

          <p className="wk-read-sentence" aria-label="the sentence to read">{round.sentence}</p>
          <button type="button" className="wk-hear" onClick={hearSentence}>🔊 hear it</button>

          <p className="wk-prompt" role="status">{round.prompt}</p>
          <div className="wk-options" role="group" aria-label={round.prompt}>
            {round.options.map((o) => (
              <button
                key={o.word}
                type="button"
                className={`wk-opt${picked === o.word ? (o.word === round.answer.word ? ' is-right' : ' is-wrong') : ''}`}
                disabled={picked !== null}
                onClick={() => choose(o.word)}
                aria-label={o.word}
              ><span aria-hidden="true">{o.emoji}</span></button>
            ))}
          </div>
        </div>
      ) : (
        <div className="wk-stage"><p className="wk-hero__line" role="status">Let's find a sentence to read…</p></div>
      )}
    </GameShell>
  );
}
