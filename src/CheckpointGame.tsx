import { useMemo, useState, useEffect } from 'react';
import { navigate } from './router';
import { createRecordedAudioPlayer } from './audio/recordedAudioPlayer';
import { sfx } from './audio/sfx';
import { castFor } from './world/lore/cast';
import { CharacterArt } from './world/lore/CharacterArt';
import { WordPicture } from './world/WordPicture';
import { findLevel } from './games';
import { markCheckpointPassed } from './mastery/levelProgress';
import { loadMastery, skillInsights } from './mastery/mastery';
import { parseSkillKey } from './mastery/skills';
import { tapItOutWords } from './content/packs/tapItOut';
import { everydayObjects } from './content/packs/everydayObjects';
import { everydayEndings } from './content/packs/everydayEndings';
import { shortVowelWords } from './content/packs/shortVowelWords';
import { soundOf } from './domain/engine';
import type { Pack, SoundTarget } from './domain/types';
import './checkpoint.css';

const N = 8;                  // questions in a checkpoint
const POS_WORD: Record<SoundTarget, string> = { beginning: 'first', ending: 'last', medial: 'middle' };

type Question =
  | { kind: 'count'; label: string; emoji: string; answer: number; choices: number[] }
  | { kind: 'sound'; label: string; emoji: string; target: SoundTarget; answer: string; choices: string[] };

function shuffle<T>(a: T[]): T[] { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; }

const PACK_BY_TARGET: Record<SoundTarget, Pack> = {
  beginning: everydayObjects, ending: everydayEndings, medial: shortVowelWords,
};

/** One L2 sound question for a target + sound (undefined if no word has it). */
function soundQuestion(target: SoundTarget, sound: string): Question | undefined {
  const pack = PACK_BY_TARGET[target];
  const w = shuffle(pack.words.filter((x) => soundOf(x, target) === sound))[0];
  if (!w) return undefined;
  const others = [...new Set(pack.words.map((x) => soundOf(x, target)).filter((s): s is string => !!s && s !== sound))];
  return { kind: 'sound', label: w.label, emoji: w.emoji, target, answer: sound, choices: shuffle([sound, ...shuffle(others).slice(0, 2)]) };
}

/**
 * Build the checkpoint, PERSONALIZED to this learner. Level 2 samples the sounds
 * the learner has actually practised, over-weighting the shakier ones — so the
 * post-test confirms exactly what they worked on and re-checks their soft spots.
 * Falls back to a representative pack mix when there's no data yet.
 */
function buildQuestions(level: number, learnerId: string): Question[] {
  if (level === 1) {
    // Level 1 is a single PA skill — a representative spread of segmenting words.
    return shuffle(tapItOutWords).slice(0, N).map((w) => ({
      kind: 'count' as const, label: w.label, emoji: w.emoji, answer: w.sounds, choices: [2, 3, 4],
    }));
  }

  const practised = skillInsights(loadMastery(learnerId))
    .map((s) => ({ p: parseSkillKey(s.skillKey), score: s.score }))
    .filter((x): x is { p: NonNullable<ReturnType<typeof parseSkillKey>>; score: number } =>
      x.p != null && (x.p.target === 'beginning' || x.p.target === 'ending' || x.p.target === 'medial'));

  if (practised.length >= 3) {
    // weighted pool — weaker sounds appear more often (1–5×)
    const pool: { target: SoundTarget; sound: string }[] = [];
    for (const s of practised) {
      const weight = Math.min(5, Math.max(1, Math.round((1 - s.score) * 4) + 1));
      for (let i = 0; i < weight; i++) pool.push({ target: s.p.target, sound: s.p.soundId });
    }
    const qs: Question[] = [];
    for (let guard = 0; qs.length < N && guard < 120; guard++) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      const q = soundQuestion(pick.target, pick.sound);
      if (q) qs.push(q);
    }
    if (qs.length >= 3) return qs;
  }

  // Fallback: a representative mix across the three sound positions.
  const targets: SoundTarget[] = ['beginning', 'ending', 'medial'];
  const qs: Question[] = [];
  for (let i = 0; i < N; i++) {
    const target = targets[i % targets.length];
    const sound = soundOf(shuffle(PACK_BY_TARGET[target].words.filter((w) => soundOf(w, target)))[0], target);
    const q = sound ? soundQuestion(target, sound) : undefined;
    if (q) qs.push(q);
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
  const [questions] = useState(() => buildQuestions(level, learnerId));
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
      <div className="cp__exits">
        <button type="button" className="cp__leave" onClick={() => navigate(`#/level/${level}`)}>← Practice more</button>
        <button type="button" className="cp__leave" onClick={() => navigate('#/')}>Home</button>
      </div>
    </main>
  );
}
