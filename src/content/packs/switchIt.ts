import { MINIMAL_PAIRS } from './comparePairs';

/**
 * Switch It (Level 1 — Chip): phoneme manipulation. The child hears a word, then
 * a NEW word that differs by exactly one sound, and "switches" the sound that
 * changed — tapping the bead (one per sound, no letters; Level 1 is oral) in the
 * position that's different. Reuses the minimal-pair set so the curriculum
 * content stays single-sourced.
 */
export interface SwitchRound {
  source: string;
  target: string;
  /** index of the single sound that differs (= bead the child must switch) */
  changeIndex: number;
}

/** Index of the one differing character (CVC: letter position == sound position). */
function diffIndex(a: string, b: string): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return i;
  return -1;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build `n` manipulation rounds from the minimal-pair set. Each round picks a
 * pair and a direction (source→target), recording which sound changed. Only
 * equal-length pairs are used so each word maps cleanly to N beads. `rng`
 * injectable for tests.
 */
export function buildSwitchRounds(n: number, rng: () => number = Math.random): SwitchRound[] {
  const pairs = shuffle(MINIMAL_PAIRS.filter(([a, b]) => a.length === b.length), rng);
  const rounds: SwitchRound[] = [];
  for (let i = 0; i < n; i++) {
    const [a, b] = pairs[i % pairs.length];
    const [source, target] = rng() < 0.5 ? [a, b] : [b, a];
    rounds.push({ source, target, changeIndex: diffIndex(source, target) });
  }
  return rounds;
}
