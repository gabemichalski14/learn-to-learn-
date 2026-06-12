/**
 * Heart words — irregular high-frequency words for "Plant the Word" (Level 2).
 * Each word is mostly decodable with ONE small irregular part you "learn by heart"
 * (the heart letters). ORIGINAL content; all are common, age-safe function/sight
 * words. `heart` = the character indices of the tricky part (what the eyes must
 * remember because the ears can't sound it out).
 */

export interface HeartWord {
  word: string;
  /** A short spoken sentence using the word (audio only — never decoded by the child). */
  sentence: string;
  /** Character indices of the irregular "heart" letters. */
  heart: number[];
}

const WORDS: HeartWord[] = [
  { word: 'the', sentence: 'I see the bug.', heart: [2] }, // e = schwa
  { word: 'was', sentence: 'It was hot.', heart: [1, 2] }, // a→/o/, s→/z/
  { word: 'said', sentence: 'She said yes.', heart: [1, 2] }, // ai→/e/
  { word: 'of', sentence: 'I had a lot of fun.', heart: [1] }, // f→/v/
  { word: 'to', sentence: 'We go to bed.', heart: [1] }, // o→/oo/
  { word: 'is', sentence: 'It is big.', heart: [1] }, // s→/z/
  { word: 'you', sentence: 'You did it!', heart: [1, 2] }, // ou→/oo/
  { word: 'have', sentence: 'I have a cat.', heart: [3] }, // e silent, a stays short
  { word: 'they', sentence: 'They ran fast.', heart: [2, 3] }, // ey→/ay/
  { word: 'do', sentence: 'We can do it.', heart: [1] }, // o→/oo/
];

export const HEART_WORDS = WORDS;

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** n heart words to plant, shuffled. */
export function buildHeartRounds(n: number, rng: () => number = Math.random): HeartWord[] {
  return shuffle(WORDS, rng).slice(0, n);
}
