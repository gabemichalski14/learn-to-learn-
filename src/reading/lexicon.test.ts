import { describe, it, expect } from 'vitest';
import { GPCS, resolveInventory } from './inventory';
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

  it('every word reconciles with its spelling (graphemes cover the letters; split digraphs allowed)', () => {
    // Greedy-segmented words join back exactly; vce/vowel-team words carry explicit
    // graphemes (split digraph a_e, vowel teams), so we verify by LETTER-COVERAGE —
    // the graphemes (underscores stripped) must use exactly the word's letters. This
    // still catches typos (a wrong/missing letter), the original guard's purpose.
    const letters = (s: string) => s.toLowerCase().replace(/_/g, '').split('').sort().join('');
    for (const e of LEXICON) {
      expect(letters(e.graphemes.join('')), `${e.word} = ${e.graphemes.join('+')}`).toBe(letters(e.word));
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

  it('holds a vce / magic-e word (split digraph) back until L4', () => {
    expect(isAdmissible(find('cake'), resolveInventory(3))).toBe(false);
    expect(isAdmissible(find('cake'), resolveInventory(4))).toBe(true);
  });

  it('holds r-controlled to L7 and vowel-teams to L8', () => {
    expect(isAdmissible(find('car'), resolveInventory(6))).toBe(false);
    expect(isAdmissible(find('car'), resolveInventory(7))).toBe(true);
    expect(isAdmissible(find('rain'), resolveInventory(7))).toBe(false);
    expect(isAdmissible(find('rain'), resolveInventory(8))).toBe(true);
  });

  it('gates a multisyllable closed word (all-L2 graphemes) to L3 syllable division', () => {
    // 'napkin' is fully spelled by L2 graphemes, but needs the L3 syllable-division
    // skill to read — minLevel enforces that independent of graphemes.
    expect(isAdmissible(find('napkin'), resolveInventory(2))).toBe(false);
    expect(isAdmissible(find('napkin'), resolveInventory(3))).toBe(true);
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
