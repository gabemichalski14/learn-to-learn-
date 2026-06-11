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
