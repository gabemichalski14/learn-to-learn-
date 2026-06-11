import { describe, it, expect } from 'vitest';
import { VCE_PAIRS, buildNameChangeRounds } from './level4';

describe('Level 4 — VCe (silent-e) pack', () => {
  it('every pair: withE = base + "e", and the marked vowel is in the base', () => {
    for (const p of VCE_PAIRS) {
      expect(p.withE).toBe(`${p.base}e`);
      expect(p.base).toContain(p.vowel);
    }
  });
  it('buildNameChangeRounds returns n rounds, each with a boolean target', () => {
    let s = 1; const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
    const rs = buildNameChangeRounds(6, rng);
    expect(rs).toHaveLength(6);
    for (const r of rs) { expect(typeof r.targetIsE).toBe('boolean'); expect(r.withE).toBe(`${r.base}e`); }
  });
});

import { buildLongShortRounds, buildDivideRounds, buildMultiRounds, buildVceDictationRounds, DIVISION_WORDS } from './level4';

describe('Level 4 — remaining game builders', () => {
  const rng = (seed: number) => { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; };
  it('long/short rounds carry a boolean long flag', () => {
    const rs = buildLongShortRounds(8, rng(1));
    expect(rs).toHaveLength(8);
    expect(rs.every((r) => typeof r.long === 'boolean')).toBe(true);
  });
  it('division rounds have a valid in-word split index', () => {
    const rs = buildDivideRounds(6, rng(2));
    expect(rs).toHaveLength(6);
    for (const r of rs) { expect(r.split).toBeGreaterThan(0); expect(r.split).toBeLessThan(r.word.length); }
  });
  it('every division word splits inside the word', () => {
    for (const w of DIVISION_WORDS) { expect(w.split).toBeGreaterThan(0); expect(w.split).toBeLessThan(w.word.length); }
  });
  it('multisyllable rounds: syllables join to the word, 3 unique options incl. the word', () => {
    const rs = buildMultiRounds(8, rng(3));
    for (const r of rs) {
      expect(r.syllables.join('')).toBe(r.word);
      expect(r.options).toHaveLength(3);
      expect(r.options.some((o) => o.word === r.word)).toBe(true);
      expect(new Set(r.options.map((o) => o.word)).size).toBe(3);
    }
  });
  it('vce dictation rounds are the +e words', () => {
    const rs = buildVceDictationRounds(6, rng(4));
    expect(rs.every((r) => r.word.endsWith('e'))).toBe(true);
  });
});
