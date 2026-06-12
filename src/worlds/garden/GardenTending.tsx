import { useEffect, useMemo, useRef, useState } from 'react';
import { goBack, navigate } from '../../router';
import { createRecordedAudioPlayer } from '../../audio/recordedAudioPlayer';
import { sfx } from '../../audio/sfx';
import { castFor } from '../../world/lore/cast';
import { CharacterArt } from '../../world/lore/CharacterArt';
import { GardenBackdrop } from './GardenArt';
import { startReviewSession, selectReview, recordReview } from '../../world/memory/reviewStore';
import { buildTrials, type TendingTrial } from '../../world/memory/tendingTrials';
import { reviewDose } from '../../mastery/screener';
import './garden.css';

/**
 * Garden Tending — the spaced-review warm-up that SURFACES the memory engine.
 * Chip invites the child to "check on a few sounds we planted": a short, capped
 * retrieval set (hear a sound → tap the letter), drawn from items due this session.
 * No-shame by design — a miss is "still a sprout, let's help it grow," never a red
 * X or a streak. Advancing the session clock + selecting due items happens once on
 * entry (ref-guarded against StrictMode double-invoke).
 */
export function GardenTending({ learnerId = 'guest' }: { learnerId?: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const character = castFor(1); // Chip — the Sound Garden companion
  const [trials, setTrials] = useState<TendingTrial[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mood, setMood] = useState<'cheer' | 'wobble' | null>(null);
  const [line, setLine] = useState("Let's check on a few sounds we planted — tap the one you hear. 🌱");
  const startedRef = useRef(false);
  const advRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // run once (also dodges StrictMode double-invoke)
    startedRef.current = true;
    startReviewSession(learnerId);
    // Dose flexes with the learner's pacing (gentle = shorter set, springboard = fuller).
    setTrials(buildTrials(selectReview(learnerId), Math.random, reviewDose(learnerId)));
  }, [learnerId]);

  const trial = trials ? trials[idx] : undefined;
  const playCue = (t: TendingTrial) => {
    if (t.cueKind === 'read') return; // a READ task — never speak the answer
    return t.cueKind === 'word'
      ? audio.playWord({ id: t.cue, label: t.cue, emoji: '🔈' })
      : audio.playSound(t.cue);
  };

  useEffect(() => {
    if (trial) void playCue(trial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, trials]);

  function tapOption(opt: string) {
    if (picked !== null || !trial || advRef.current) return;
    advRef.current = true;
    const correct = opt === trial.answer;
    setPicked(opt);
    recordReview(learnerId, trial.itemId, correct);
    if (correct) { setCorrectCount((c) => c + 1); sfx.correct(); setMood('cheer'); }
    else { sfx.wrong(); setMood('wobble'); setLine("Ooh — that one's still a sprout. We'll help it grow. 🌱"); }
    window.setTimeout(() => {
      setMood(null); setPicked(null); advRef.current = false;
      setLine('Tap the sound you hear. 🌱');
      setIdx((n) => n + 1);
    }, 900);
  }

  const done = trials !== null && idx >= trials.length;
  const empty = trials !== null && trials.length === 0;

  return (
    <main className="gd">
      <GardenBackdrop />
      <div className="gd-hud">
        <button type="button" className="gd-back" onClick={() => goBack('#/level/1')}>← Garden</button>
        <span className="gd-badge"><CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} size={22} art={character?.art} label={character?.name} /> Tending · the Sound Garden</span>
      </div>

      <div className="gd-stage">
        {trials === null ? (
          <p className="gd-hero__line" role="status">Looking at the garden…</p>
        ) : empty || done ? (
          <div className="gd-hero gd-tend-done">
            <CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} mood="cheer" size={104} art={character?.art} label={character?.name} />
            <p className="gd-tend-prompt">
              {empty
                ? 'Everything’s blooming! 🌸 Nothing needs tending right now.'
                : `Garden tended! 🌱 You checked ${correctCount} of ${trials.length} sound${trials.length === 1 ? '' : 's'}.`}
            </p>
            <div className="wk-actions">
              <button type="button" className="gd-back" onClick={() => navigate('#/level/1')}>Back to the Garden</button>
            </div>
          </div>
        ) : trial && (
          <>
            <div className="gd-hero gd-hub__greeter">
              <button type="button" className="gd-hero__face" onClick={() => { void playCue(trial); sfx.tap(); }} aria-label="Hear the sound again">
                <CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} mood={mood} size={84} art={character?.art} label={character?.name} />
              </button>
              <p className="gd-hero__line" role="status">{line}</p>
            </div>

            <p className="gd-tend-prompt">{trial.prompt}</p>
            {trial.cueKind === 'read'
              ? <p className="gd-tend-word" aria-label={`read the word ${trial.cue}`}>{trial.cue}</p>
              : <button type="button" className="gd-tend-hear" onClick={() => { void playCue(trial); sfx.tap(); }}>🔊 hear it again</button>}

            <div className={`gd-tend-opts${trial.optionKind === 'emoji' ? ' gd-tend-opts--pic' : ''}`} role="group" aria-label={trial.prompt}>
              {trial.options.map((opt, i) => (
                <button
                  key={opt}
                  type="button"
                  className={`gd-tend-opt${trial.optionKind === 'emoji' ? ' gd-tend-opt--pic' : (opt.length > 2 ? ' gd-tend-opt--word' : '')}${picked === opt ? (opt === trial.answer ? ' is-right' : ' is-wrong') : ''}`}
                  disabled={picked !== null}
                  onClick={() => tapOption(opt)}
                  aria-label={trial.optionAria ? trial.optionAria[i] : opt}
                >{opt}</button>
              ))}
            </div>

            <span className="gd-tend-progress" aria-hidden="true">
              {trials.map((_, n) => <i key={n} className={n < idx ? 'done' : n === idx ? 'on' : ''} />)}
            </span>
          </>
        )}
      </div>
    </main>
  );
}
