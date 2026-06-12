import { describe, it, expect } from 'vitest';
import { GPCS, resolveInventory, segmentGraphemes } from './inventory';

describe('GPCS scope-and-sequence', () => {
  it('introduces single consonants and short vowels at L2, digraphs at L3', () => {
    const a = GPCS.find((g) => g.grapheme === 'a');
    const m = GPCS.find((g) => g.grapheme === 'm');
    const sh = GPCS.find((g) => g.grapheme === 'sh');
    expect(a).toMatchObject({ introLevel: 2, kind: 'vowel' });
    expect(m).toMatchObject({ introLevel: 2, kind: 'consonant' });
    expect(sh).toMatchObject({ introLevel: 3, kind: 'digraph' });
  });
});

describe('segmentGraphemes', () => {
  it('splits CVC into single graphemes', () => {
    expect(segmentGraphemes('cat')).toEqual(['c', 'a', 't']);
  });
  it('keeps multi-letter digraphs together', () => {
    expect(segmentGraphemes('fish')).toEqual(['f', 'i', 'sh']);
    expect(segmentGraphemes('duck')).toEqual(['d', 'u', 'ck']);
    expect(segmentGraphemes('ship')).toEqual(['sh', 'i', 'p']);
    expect(segmentGraphemes('the')).toEqual(['th', 'e']);
  });
});

describe('resolveInventory', () => {
  it('is empty (oral) at Level 1', () => {
    const inv = resolveInventory(1);
    expect(inv.graphemes.size).toBe(0);
    expect(inv.heartWords.size).toBe(0);
  });

  it('at L2 knows single graphemes + short vowels + seed heart words, but NOT digraphs', () => {
    const inv = resolveInventory(2);
    expect(inv.graphemes.has('a')).toBe(true);
    expect(inv.graphemes.has('m')).toBe(true);
    expect(inv.graphemes.has('sh')).toBe(false);
    expect(inv.heartWords.has('the')).toBe(true);
    expect(inv.syllableTypes.has('closed')).toBe(true);
  });

  it('at L3 adds digraphs and stays cumulative', () => {
    const l2 = resolveInventory(2);
    const l3 = resolveInventory(3);
    expect(l3.graphemes.has('sh')).toBe(true);
    expect(l3.graphemes.has('ck')).toBe(true);
    // cumulative: everything known at L2 is still known at L3
    for (const g of l2.graphemes) expect(l3.graphemes.has(g)).toBe(true);
  });
});
