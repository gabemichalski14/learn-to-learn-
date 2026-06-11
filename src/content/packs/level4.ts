/**
 * Level 4 — Giant's Valley (Bram): the long-vowel jump + reading big words.
 * This file starts with the SILENT-E (VCe) data for Name Change; open/closed,
 * division, and multisyllable pools are added as those games are built.
 * ORIGINAL word lists.
 */

/** A short (closed, CVC) word and its silent-e partner — adding the magic e makes
 *  the vowel say its name (cap → cape). Emoji shown when the word has a clean one. */
export interface VcePair {
  base: string;        // cap
  withE: string;       // cape
  vowel: 'a' | 'i' | 'o' | 'u';
  baseEmoji?: string;
  eEmoji?: string;
}

export const VCE_PAIRS: VcePair[] = [
  { base: 'cap', withE: 'cape', vowel: 'a', baseEmoji: '🧢', eEmoji: '🦸' },
  { base: 'tap', withE: 'tape', vowel: 'a', eEmoji: '🩹' },
  { base: 'plan', withE: 'plane', vowel: 'a', eEmoji: '✈️' },
  { base: 'can', withE: 'cane', vowel: 'a', baseEmoji: '🥫' },
  { base: 'man', withE: 'mane', vowel: 'a' },
  { base: 'kit', withE: 'kite', vowel: 'i', eEmoji: '🪁' },
  { base: 'pin', withE: 'pine', vowel: 'i', baseEmoji: '📌', eEmoji: '🌲' },
  { base: 'dim', withE: 'dime', vowel: 'i', eEmoji: '🪙' },
  { base: 'slid', withE: 'slide', vowel: 'i', eEmoji: '🛝' },
  { base: 'rip', withE: 'ripe', vowel: 'i' },
  { base: 'hop', withE: 'hope', vowel: 'o' },
  { base: 'not', withE: 'note', vowel: 'o', eEmoji: '🎵' },
  { base: 'cod', withE: 'code', vowel: 'o' },
  { base: 'rob', withE: 'robe', vowel: 'o', eEmoji: '🥋' },
  { base: 'cub', withE: 'cube', vowel: 'u', eEmoji: '🧊' },
  { base: 'tub', withE: 'tube', vowel: 'u', baseEmoji: '🛁' },
  { base: 'cut', withE: 'cute', vowel: 'u' },
  { base: 'hug', withE: 'huge', vowel: 'u' },
];

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export interface NameChangeRound extends VcePair {
  /** Which word the round asks for (the one played aloud). */
  targetIsE: boolean;
}

/** Name Change: n rounds. Each plays one of the pair (base or +e); the child
 *  toggles the magic e until the written word matches what they heard. */
export function buildNameChangeRounds(n: number, rng: () => number = Math.random): NameChangeRound[] {
  return shuffle(VCE_PAIRS, rng).slice(0, n).map((p) => ({ ...p, targetIsE: rng() < 0.5 }));
}
