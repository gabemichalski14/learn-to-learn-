/**
 * Same or Different? (Level 1 — Chip): word pairs for auditory discrimination.
 * The skill is hearing whether two SPOKEN words are the same or differ by a
 * single sound (a "minimal pair"). Oral only — no letters, no pictures (a
 * picture would give the answer away). Our own small original set of common
 * one-syllable words; not derived from any program's word lists.
 */
export interface ComparePair {
  a: string;
  b: string;
  same: boolean;
}

/** Pairs that differ by exactly one sound — the heart of the skill. */
const MINIMAL_PAIRS: Array<[string, string]> = [
  ['cat', 'cap'], ['pin', 'pig'], ['sun', 'sub'], ['ten', 'hen'], ['map', 'mop'],
  ['bed', 'bad'], ['big', 'bug'], ['cup', 'cut'], ['fan', 'van'], ['dog', 'dot'],
  ['hat', 'ham'], ['top', 'tap'], ['net', 'nut'], ['pen', 'pet'], ['mat', 'man'],
];

const WORDS = [...new Set(MINIMAL_PAIRS.flat())];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build `n` rounds — a balanced mix of "same" (a word played twice) and
 * "different" (a minimal pair). Shuffled. `rng` injectable for tests.
 */
export function buildCompareRounds(n: number, rng: () => number = Math.random): ComparePair[] {
  const rounds: ComparePair[] = [];
  const pairs = shuffle(MINIMAL_PAIRS, rng);
  const words = shuffle(WORDS, rng);
  let pi = 0;
  let wi = 0;
  for (let i = 0; i < n; i++) {
    if (i % 2 === 0) {
      const w = words[wi++ % words.length];
      rounds.push({ a: w, b: w, same: true });
    } else {
      const [a, b] = pairs[pi++ % pairs.length];
      rounds.push({ a, b, same: false });
    }
  }
  return shuffle(rounds, rng);
}
