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

/** Name Change Dictation: spell the silent-e word you hear (the +e member). */
export interface VceDictWord { word: string; vowel: 'a' | 'i' | 'o' | 'u'; emoji?: string }
export function buildVceDictationRounds(n: number, rng: () => number = Math.random): VceDictWord[] {
  return shuffle(VCE_PAIRS, rng).slice(0, n).map((p) => ({ word: p.withE, vowel: p.vowel, emoji: p.eEmoji }));
}

// ---------- Open vs Closed (Long or Short?) ----------
// Single-syllable: OPEN ends in a long vowel (me, go); CLOSED ends in a consonant
// with a short vowel (met, got). `long` = the vowel says its name.
export interface SyllWordLS { word: string; long: boolean }
export const OPEN_CLOSED_WORDS: SyllWordLS[] = [
  { word: 'me', long: true }, { word: 'go', long: true }, { word: 'hi', long: true },
  { word: 'no', long: true }, { word: 'she', long: true }, { word: 'we', long: true },
  { word: 'so', long: true }, { word: 'my', long: true }, { word: 'fly', long: true }, { word: 'sky', long: true },
  { word: 'met', long: false }, { word: 'got', long: false }, { word: 'hit', long: false },
  { word: 'hot', long: false }, { word: 'run', long: false }, { word: 'sit', long: false },
  { word: 'cat', long: false }, { word: 'bed', long: false }, { word: 'cup', long: false }, { word: 'top', long: false },
];
export function buildLongShortRounds(n: number, rng: () => number = Math.random): SyllWordLS[] {
  return shuffle(OPEN_CLOSED_WORDS, rng).slice(0, n);
}

// ---------- Syllable division (The Great Divide) ----------
// `split` = the letter index to cut at (letters[0..split) | letters[split..]).
// VCCV → cut between the consonants (closed first syllable); VCV → cut after a
// long vowel (open) or after the consonant (closed). `open` = first syllable open.
export interface DivWord { word: string; split: number; open: boolean; emoji?: string }
export const DIVISION_WORDS: DivWord[] = [
  { word: 'rabbit', split: 3, open: false, emoji: '🐰' },
  { word: 'napkin', split: 3, open: false, emoji: '🧻' },
  { word: 'magnet', split: 3, open: false, emoji: '🧲' },
  { word: 'sunset', split: 3, open: false, emoji: '🌅' },
  { word: 'basket', split: 3, open: false, emoji: '🧺' },
  { word: 'muffin', split: 3, open: false, emoji: '🧁' },
  { word: 'kitten', split: 3, open: false, emoji: '🐱' },
  { word: 'tiger', split: 2, open: true, emoji: '🐯' },
  { word: 'pilot', split: 2, open: true, emoji: '🧑‍✈️' },
  { word: 'robot', split: 2, open: true, emoji: '🤖' },
  { word: 'tulip', split: 2, open: true, emoji: '🌷' },
  { word: 'robin', split: 3, open: false, emoji: '🐦' },
  { word: 'wagon', split: 3, open: false, emoji: '🛺' },
  { word: 'lemon', split: 3, open: false, emoji: '🍋' },
];
export function buildDivideRounds(n: number, rng: () => number = Math.random): DivWord[] {
  return shuffle(DIVISION_WORDS, rng).slice(0, n);
}

// ---------- Multisyllable reading (Word Giants + Giant Steps) ----------
export interface MultiWord { word: string; syllables: string[]; emoji: string }
export const MULTI_WORDS: MultiWord[] = [
  { word: 'sunset', syllables: ['sun', 'set'], emoji: '🌅' },
  { word: 'rabbit', syllables: ['rab', 'bit'], emoji: '🐰' },
  { word: 'magnet', syllables: ['mag', 'net'], emoji: '🧲' },
  { word: 'pumpkin', syllables: ['pump', 'kin'], emoji: '🎃' },
  { word: 'tiger', syllables: ['ti', 'ger'], emoji: '🐯' },
  { word: 'robot', syllables: ['ro', 'bot'], emoji: '🤖' },
  { word: 'pencil', syllables: ['pen', 'cil'], emoji: '✏️' },
  { word: 'basket', syllables: ['bas', 'ket'], emoji: '🧺' },
  { word: 'muffin', syllables: ['muf', 'fin'], emoji: '🧁' },
  { word: 'lemon', syllables: ['lem', 'on'], emoji: '🍋' },
  { word: 'kitten', syllables: ['kit', 'ten'], emoji: '🐱' },
  { word: 'dragon', syllables: ['drag', 'on'], emoji: '🐉' },
  { word: 'cactus', syllables: ['cac', 'tus'], emoji: '🌵' },
  { word: 'donut', syllables: ['do', 'nut'], emoji: '🍩' },
  { word: 'helmet', syllables: ['hel', 'met'], emoji: '⛑️' },
];
export interface MultiRound extends MultiWord { options: { word: string; emoji: string }[] }
export function buildMultiRounds(n: number, rng: () => number = Math.random): MultiRound[] {
  return shuffle(MULTI_WORDS, rng).slice(0, n).map((w) => {
    const distractors = shuffle(MULTI_WORDS.filter((x) => x.word !== w.word), rng).slice(0, 2).map((x) => ({ word: x.word, emoji: x.emoji }));
    return { ...w, options: shuffle([{ word: w.word, emoji: w.emoji }, ...distractors], rng) };
  });
}
