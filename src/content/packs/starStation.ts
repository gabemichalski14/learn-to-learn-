import { shortVowelWords } from './shortVowelWords';

/**
 * Star Station (Level 2 — Moss): blending / encoding. The child hears a word and
 * BUILDS it from letter tiles in order (Level 2 introduces letters). Each correct
 * placement is a per-position sound (first / medial / last), so the data feeds the
 * same Level 2 skills the mastery gate checks. CVC only, so the three tile slots
 * map cleanly to beginning / medial / ending.
 */
export interface BuildRound {
  word: string;
  emoji: string;
  /** correct letters + 2 distractors, shuffled — the tile tray */
  tiles: string[];
}

// TRUE 3-phoneme CVC only: each letter must map to one sound, so the three tile
// slots = beginning / medial / ending cleanly. Exclude final-x (box/fox/six spell
// /ks/ — two phonemes in one letter), which would teach "/ks/ = one sound" and log
// a bogus `sound:last:x` skill. (box/fox/six still sort fine in Vowel Patrol.)
const CVC = shortVowelWords.words.filter((w) => /^[a-z]{3}$/.test(w.label) && !w.label.endsWith('x'));

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Build `n` rounds: each is a CVC word + a shuffled tray of its letters plus two
 *  distractor letters not in the word. `rng` injectable for tests. */
export function buildStarRounds(n: number, rng: () => number = Math.random): BuildRound[] {
  const pool = shuffle(CVC, rng);
  const rounds: BuildRound[] = [];
  for (let i = 0; i < n; i++) {
    const w = pool[i % pool.length];
    const correct = w.label.split('');
    const others = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter((c) => !correct.includes(c)), rng).slice(0, 2);
    rounds.push({ word: w.label, emoji: w.emoji, tiles: shuffle([...correct, ...others], rng) });
  }
  return rounds;
}

/** Structured-literacy sound position for an index in a CVC word. */
export function positionTarget(index: number, length: number): 'beginning' | 'medial' | 'ending' {
  if (index === 0) return 'beginning';
  if (index === length - 1) return 'ending';
  return 'medial';
}
