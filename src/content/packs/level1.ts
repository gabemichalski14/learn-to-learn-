/**
 * Level 1 — Sound Garden (Chip): extra phonemic-awareness games beyond Tap It Out.
 *  - Rhyme Time: hear a word, pick the picture that RHYMES (onset-rime PA).
 *  - Blend It:   hear the sounds one at a time, pick the picture they blend into
 *                (oral blending — the partner skill to Tap It Out's segmenting).
 * Oral + picture only (Level 1 shows no letters). ORIGINAL word lists.
 */
export interface PicWord { word: string; emoji: string }

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// ---------- Rhyme Time ----------
// Each family is a set of rhyming picture-words (≥2 with a clean emoji).
export const RHYME_FAMILIES: PicWord[][] = [
  [{ word: 'cat', emoji: '🐱' }, { word: 'hat', emoji: '🎩' }, { word: 'bat', emoji: '🦇' }],
  [{ word: 'dog', emoji: '🐶' }, { word: 'frog', emoji: '🐸' }, { word: 'log', emoji: '🪵' }],
  [{ word: 'sun', emoji: '☀️' }, { word: 'bun', emoji: '🍞' }],
  [{ word: 'car', emoji: '🚗' }, { word: 'star', emoji: '⭐' }, { word: 'jar', emoji: '🫙' }],
  [{ word: 'bee', emoji: '🐝' }, { word: 'tree', emoji: '🌳' }, { word: 'key', emoji: '🔑' }],
  [{ word: 'cake', emoji: '🍰' }, { word: 'snake', emoji: '🐍' }],
  [{ word: 'ring', emoji: '💍' }, { word: 'king', emoji: '🤴' }],
  [{ word: 'can', emoji: '🥫' }, { word: 'pan', emoji: '🍳' }, { word: 'van', emoji: '🚐' }],
];

export interface RhymeRound { target: PicWord; options: PicWord[]; answer: string }
/** `n` rounds: a target word + 3 picture options, exactly one of which rhymes. */
export function buildRhymeRounds(n: number, rng: () => number = Math.random): RhymeRound[] {
  const fams = shuffle(RHYME_FAMILIES, rng);
  const all = RHYME_FAMILIES.flat();
  const out: RhymeRound[] = [];
  for (let k = 0; k < n; k++) {
    const fam = shuffle(fams[k % fams.length], rng);
    const target = fam[0];
    const rhyme = fam[1];
    const distractors = shuffle(all.filter((w) => !fams[k % fams.length].some((x) => x.word === w.word)), rng).slice(0, 2);
    out.push({ target, options: shuffle([rhyme, ...distractors], rng), answer: rhyme.word });
  }
  return out;
}

// ---------- Blend It ----------
// `sounds` = the phoneme sequence to play one at a time (sound ids; recorded clip
// when available, else TTS). The child blends them and taps the matching picture.
export interface BlendWordPA { word: string; emoji: string; sounds: string[] }
export const BLEND_IT_WORDS: BlendWordPA[] = [
  { word: 'cat', emoji: '🐱', sounds: ['k', 'a', 't'] },
  { word: 'dog', emoji: '🐶', sounds: ['d', 'o', 'g'] },
  { word: 'sun', emoji: '☀️', sounds: ['s', 'u', 'n'] },
  { word: 'pig', emoji: '🐷', sounds: ['p', 'i', 'g'] },
  { word: 'bed', emoji: '🛏️', sounds: ['b', 'e', 'd'] },
  { word: 'cup', emoji: '☕', sounds: ['k', 'u', 'p'] },
  { word: 'bus', emoji: '🚌', sounds: ['b', 'u', 's'] },
  { word: 'jam', emoji: '🍯', sounds: ['j', 'a', 'm'] },
  { word: 'net', emoji: '🥅', sounds: ['n', 'e', 't'] },
  { word: 'web', emoji: '🕸️', sounds: ['w', 'e', 'b'] },
];

export interface BlendItRound { word: string; emoji: string; sounds: string[]; options: PicWord[] }
/** `n` rounds: a word's sounds to play + 3 picture options (one is the word). */
export function buildBlendItRounds(n: number, rng: () => number = Math.random): BlendItRound[] {
  return shuffle(BLEND_IT_WORDS, rng).slice(0, n).map((w) => {
    const distractors = shuffle(BLEND_IT_WORDS.filter((x) => x.word !== w.word), rng).slice(0, 2).map((x) => ({ word: x.word, emoji: x.emoji }));
    return { word: w.word, emoji: w.emoji, sounds: w.sounds, options: shuffle([{ word: w.word, emoji: w.emoji }, ...distractors], rng) };
  });
}
