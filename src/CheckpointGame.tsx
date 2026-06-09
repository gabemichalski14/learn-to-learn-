import { useMemo, useState, useEffect } from 'react';
import { navigate } from './router';
import { createRecordedAudioPlayer } from './audio/recordedAudioPlayer';
import { sfx } from './audio/sfx';
import { castFor } from './world/lore/cast';
import { CharacterArt } from './world/lore/CharacterArt';
import { WordPicture } from './world/WordPicture';
import { findLevel } from './games';
import { markCheckpointPassed } from './mastery/levelProgress';
import { tapItOutWords } from './content/packs/tapItOut';
import { everydayObjects } from './content/packs/everydayObjects';
import { everydayEndings } from './content/packs/everydayEndings';
import { shortVowelWords } from './content/packs/shortVowelWords';
import { soundOf } from './domain/engine';
import type { SoundTarget } from './domain/types';
import './checkpoint.css';

const N = 8;                  // questions in a checkpoint
const POS_WORD: Record<SoundTarget, string> = { beginning: 'first', ending: 'last', medial: 'middle' };

type Question =
  | { kind: 'count'; label: string; emoji: string; answer: number; choices: number[] }
  | { kind: 'sound'; label: string; emoji: string; target: SoundTarget; answer: string; choices: string[] };

function shuffle<T>(a: T[]): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

function buildQuestions(level: number): Question[] {
  if (level === 1) {
    return shuffle(tapItOutWords).slice(0, N).map((w) => ({
      kind: 'count' as const, label: w.label, emoji: w.emoji, answer: w.sounds, choices: [2, 3, 4],
    }));
  }
  // Level 2 — mix the three sound positions across the test.
  const sources: { words: typeof everydayObjects.words; target: SoundTarget }[] = [
    { words: everydayObjects.words, target: 'beginning' },
    { words: everydayEndings.words, target: 'ending' },
    { words: shortVowelWords.words, target: 'medial' },
  ];
  const qs: Question[] = [];
  for (let i = 0; i < N; i++) {
    const src = sources[i % sources.length];
    const words = shuffle(src.words.filter((w) => soundOf(w, src.target)));
    const w = words[0];
    if (!w) continue;
    const answer = soundOf(w, src.target)!;
    const others = [...new Set(src.words.map((x) => soundOf(x, src.target)).filter((s): s is string => !!s && s !== answer))];
    const choices = shuffle([answer, ...shuffle(others).slice(0, 2)]);
    qs.push({ kind: 'sound', label: w.label, emoji: w.emoji, target: src.target, answer, choices });
  }
  return qs;
}

/**
 * The end-of-level Checkpoint — a friendly, game-shaped post-test: "show what
 * you learned!" No tutorial, no hints, no shame. Clearing it (miss at most one)
 * formally PASSES the level and opens the next. Available once in-game mastery
 * hits 95%; a learner can retake it any time.
 */
export function CheckpointGame({ level, learnerId }: { level: number; learnerId: string }) {
  const audio = useMemo(() => createRecordedAudioPlayer(), []);
  const [questions] = useState(() => buildQuestions(level));
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | number | null>(null);
  const [done, setDone] = useState(false);
  const character = castFor(level);
  const q = questions[i];
  const total = questions.length;

  // Hear the word as each question appears (and on demand).
  useEffect(() => { if (q && !done) void audio.playWord({ id: q.label, label: q.label, emoji: q.emoji } as never); }, [i, q, done, audio]);

  if (!q || total === 0) {
    return <main className="cp"><div className="cp__card"><p>Checkpoint isn't ready yet — practice a little more first. 🌱</p><button type="button" className="cp__btn" onClick={() => navigate(`#/level/${level}`)}>Back to Level {level}</button></div></main>;
  }

  function choose(val: string | number) {
    if (picked != null) return;
    const ok = val === (q.kind === 'count' ? q.answer : q.answer);
    setPicked(val);
    if (ok) { setCorrect((c) => c + 1); sfx.correct(); } else { sfx.wrong(); }
    window.setTimeout(() => {
      setPicked(null);
      if (i + 1 >= total) {
        const finalCorrect = correct + (ok ? 1 : 0);
        if (finalCorrect >= total - 1) markCheckpointPassed(learnerId, level); // pass = miss ≤ 1
        setDone(true);
      } else {
        setI((n) => n + 1);
      }
    }, 760);
  }

  if (done) {
    const passed = correct >= total - 1;
    const next = findLevel(level + 1);
    return (
      <main className="cp">
        <div className={`cp__card cp__result cp__result--${passed ? 'pass' : 'retry'}`}>
          <div className="cp__hero"><CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} mood={passed ? 'bloom' : undefined} size={108} art={character?.art} label={character?.name} /></div>
          <p className="cp__score">{correct} / {total}</p>
          {passed ? (
            <>
              <h1 className="cp__title">Level {level} complete! 🎉</h1>
              <p className="cp__sub">You showed {character?.name ?? 'us'} you really know it{next ? ` — Level ${level + 1} · ${next.title} is open!` : '!'}</p>
              <div className="cp__btns">
                {next && <button type="button" className="cp__btn" onClick={() => navigate(`#/level/${level + 1}`)}>Go to Level {level + 1} →</button>}
                <button type="button" className="cp__btn cp__btn--ghost" onClick={() => navigate('#/village')}>Visit the Village 🏡</button>
              </div>
            </>
          ) : (
            <>
              <h1 className="cp__title">So close! 🌱</h1>
              <p className="cp__sub">A little more practice and you've got this. No worries — try again whenever you're ready.</p>
              <div className="cp__btns">
                <button type="button" className="cp__btn" onClick={() => navigate(`#/level/${level}`)}>Practice a bit more</button>
                <button type="button" className="cp__btn cp__btn--ghost" onClick={() => { setI(0); setCorrect(0); setDone(false); }}>Try the checkpoint again</button>
              </div>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="cp">
      <div className="cp__bar" aria-hidden="true">
        {questions.map((_, n) => <i key={n} className={`cp__pip${n < i ? ' done' : n === i ? ' on' : ''}`} />)}
      </div>
      <div className="cp__card">
        <div className="cp__cheer">
          <CharacterArt emoji={character?.emoji ?? '🌱'} heal={1} size={56} art={character?.art} label={character?.name} />
          <p className="cp__say">Show me what you learned! ✨</p>
        </div>

        <WordPicture label={q.label} emoji={q.emoji} className="cp__pic" />
        <p className="cp__q">
          {q.kind === 'count' ? 'How many sounds do you hear?' : `What is the ${POS_WORD[q.target]} sound?`}
        </p>
        <button type="button" className="cp__again" onClick={() => void audio.playWord({ id: q.label, label: q.label, emoji: q.emoji } as never)}>🔊 Hear it again</button>

        <div className="cp__choices">
          {q.kind === 'count'
            ? q.choices.map((c) => (
                <button key={c} type="button" className={`cp__choice${picked === c ? (c === q.answer ? ' is-right' : ' is-wrong') : ''}`} disabled={picked != null} onClick={() => choose(c)}>{c}</button>
              ))
            : q.choices.map((c) => (
                <button key={c} type="button" className={`cp__choice${picked === c ? (c === q.answer ? ' is-right' : ' is-wrong') : ''}`} disabled={picked != null} onClick={() => choose(c)}>{c}</button>
              ))}
        </div>
      </div>
      <button type="button" className="cp__leave" onClick={() => navigate(`#/level/${level}`)}>← Not yet</button>
    </main>
  );
}
