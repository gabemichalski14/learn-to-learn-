import { describe, it, expect } from 'vitest';
import { buildComprehensionRounds } from './comprehensionRounds';

function rngFrom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('buildComprehensionRounds', () => {
  it('builds picturable rounds whose answer is among ≥3 same-category options', () => {
    const rounds = buildComprehensionRounds(5, rngFrom(3));
    expect(rounds.length).toBe(5);
    for (const r of rounds) {
      expect(r.sentence.length).toBeGreaterThan(0);
      expect(r.options.length).toBeGreaterThanOrEqual(3);
      expect(r.options.every((o) => !!o.emoji)).toBe(true);
      expect(r.options.some((o) => o.word === r.answer.word)).toBe(true);
    }
  });

  it('is deterministic for a given seed', () => {
    const a = buildComprehensionRounds(4, rngFrom(7)).map((r) => r.sentence);
    const b = buildComprehensionRounds(4, rngFrom(7)).map((r) => r.sentence);
    expect(a).toEqual(b);
  });
});
