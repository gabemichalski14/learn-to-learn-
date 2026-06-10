import { describe, it, expect } from 'vitest';
import { buildCompareRounds } from './comparePairs';

describe('buildCompareRounds', () => {
  it('builds exactly n rounds where same === (a equals b)', () => {
    const r = buildCompareRounds(8);
    expect(r).toHaveLength(8);
    for (const p of r) expect(p.same).toBe(p.a === p.b);
  });

  it('"different" rounds are genuine minimal pairs (a !== b)', () => {
    const diff = buildCompareRounds(20).filter((p) => !p.same);
    expect(diff.length).toBeGreaterThan(0);
    for (const p of diff) expect(p.a).not.toBe(p.b);
  });

  it('mixes same and different in a session', () => {
    const r = buildCompareRounds(8);
    expect(r.some((p) => p.same)).toBe(true);
    expect(r.some((p) => !p.same)).toBe(true);
  });
});
