import { describe, it, expect } from 'vitest';
import { GPCS, resolveInventory, segmentGraphemes } from './inventory';
import { LEXICON, isAdmissible, admissibleWords } from './lexicon';

const ALL_GRAPHEMES = new Set(GPCS.map((g) => g.grapheme));
const find = (word: string) => LEXICON.find((e) => e.word === word)!;

describe('lexicon integrity (correctness guards)', () => {
  it('every word is spelled by real GPCs only — no stray/typo graphemes', () => {
    for (const e of LEXICON) {
      for (const g of e.graphemes) {
        expect(ALL_GRAPHEMES.has(g), `${e.word} → unknown grapheme "${g}"`).toBe(true);
      }
    }
  });

  it('every word round-trips through the segmenter (graphemes join back to the word)', () => {
    for (const e of LEXICON) {
      expect(e.graphemes.join('')).toBe(e.word.toLowerCase());
      expect(e.graphemes).toEqual(segmentGraphemes(e.word));
    }
  });

  it('has no duplicate words', () => {
    const words = LEXICON.map((e) => e.word);
    expect(new Set(words).size).toBe(words.length);
  });
});

describe('isAdmissible', () => {
  it('admits a CVC word once its graphemes are taught (L2), not before (L1)', () => {
    expect(isAdmissible(find('cat'), resolveInventory(1))).toBe(false);
    expect(isAdmissible(find('cat'), resolveInventory(2))).toBe(true);
  });

  it('holds a digraph word back until L3', () => {
    expect(isAdmissible(find('fish'), resolveInventory(2))).toBe(false);
    expect(isAdmissible(find('fish'), resolveInventory(3))).toBe(true);
  });

  it('admits a heart word only when explicitly taught, never by graphemes', () => {
    expect(isAdmissible(find('the'), resolveInventory(1))).toBe(false);
    expect(isAdmissible(find('the'), resolveInventory(2))).toBe(true);
  });
});

describe('admissibleWords', () => {
  it('at L2 every non-heart admissible word is fully decodable from the L2 inventory', () => {
    // Heart words (e.g. "the" → th,e) are admitted as sight words and are exempt
    // from the grapheme rule; every OTHER admissible word must be fully decodable.
    const inv = resolveInventory(2);
    for (const e of admissibleWords(inv)) {
      if (e.heart) continue;
      for (const g of e.graphemes) {
        expect(inv.graphemes.has(g), `${e.word} needs untaught grapheme "${g}" at L2`).toBe(true);
      }
    }
  });

  it('at L2 gives the generator enough to build text (a noun, a verb, a function word, a heart word)', () => {
    const words = admissibleWords(resolveInventory(2));
    expect(words.some((e) => e.pos === 'noun' && e.imageable)).toBe(true);
    expect(words.some((e) => e.pos === 'verb')).toBe(true);
    expect(words.some((e) => e.pos === 'function' && !e.heart)).toBe(true);
    expect(words.some((e) => e.heart)).toBe(true);
  });

  it('is monotonic — everything readable at L2 is still readable at L3', () => {
    const l2 = new Set(admissibleWords(resolveInventory(2)).map((e) => e.word));
    const l3 = new Set(admissibleWords(resolveInventory(3)).map((e) => e.word));
    for (const w of l2) expect(l3.has(w)).toBe(true);
    expect(l3.has('fish')).toBe(true); // and L3 unlocks more
  });
});
