/**
 * Level 2 — Space Patrol (Moss): content for the two new archetypes.
 *  - Word Beam (Dictation): hear a CVC word, spell it from a FULL alphabet tray.
 *  - Warp Speed (Fluency):  read a CVC word fast, tap its picture (decoding pace).
 * Reuses the CVC pool. ORIGINAL words.
 */
import { shortVowelWords } from './shortVowelWords';

export interface CvcWord { word: string; emoji: string }

export const CVC_POOL: CvcWord[] = shortVowelWords.words.map((w) => ({ word: w.label, emoji: w.emoji }));
export const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('');

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Word Beam logs ONE sound key per letter position (first/medial/last), so its
// pool must be exactly 3-letter CVC — otherwise a 4-letter word makes two
// positions "medial" and splits a digraph, polluting the L2 sound keys.
const CVC3_POOL: CvcWord[] = CVC_POOL.filter((w) => /^[a-z]{3}$/.test(w.word));

/** Word Beam: n true-CVC (3-letter) words to spell from the alphabet tray. */
export function buildDictationRounds(n: number, rng: () => number = Math.random): CvcWord[] {
  return shuffle(CVC3_POOL, rng).slice(0, n);
}

export interface ReadRound { word: string; emoji: string; options: CvcWord[] }
/** Warp Speed: n rounds — read the word, pick its picture from 3. */
export function buildReadRounds(n: number, rng: () => number = Math.random): ReadRound[] {
  return shuffle(CVC_POOL, rng).slice(0, n).map((w) => {
    const distractors = shuffle(CVC_POOL.filter((x) => x.word !== w.word), rng).slice(0, 2);
    return { word: w.word, emoji: w.emoji, options: shuffle([w, ...distractors], rng) };
  });
}
