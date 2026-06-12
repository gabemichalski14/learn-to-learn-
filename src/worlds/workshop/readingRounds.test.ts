import { describe, it, expect } from 'vitest';
import { buildReadingRounds } from './readingRounds';
import { resolveInventory } from '../../reading/inventory';
import { validateUnit } from '../../reading/validate';

function rngFrom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('buildReadingRounds', () => {
  it('builds the requested number of rounds, each a valid decodable sentence', () => {
    const inv = resolveInventory(3);
    const rounds = buildReadingRounds(5, rngFrom(7));
    expect(rounds).toHaveLength(5);
    for (const r of rounds) {
      expect(r.unit.kind).toBe('sentence');
      expect(validateUnit(r.unit, inv).ok).toBe(true);
    }
  });

  it('gives exactly one correct comprehension option (the subject), with 2 distractors', () => {
    for (const r of buildReadingRounds(8, rngFrom(3))) {
      expect(r.options).toHaveLength(3);
      expect(r.options.filter((o) => o.correct)).toHaveLength(1);
      const correct = r.options.find((o) => o.correct)!;
      // the correct answer is a content word IN the sentence (its subject)
      expect(r.unit.words.some((w) => w.word === correct.word)).toBe(true);
      // every option has a picture
      for (const o of r.options) expect(o.emoji.length).toBeGreaterThan(0);
    }
  });

  it("never offers the sentence's other words as distractors (choice tests meaning)", () => {
    for (const r of buildReadingRounds(10, rngFrom(11))) {
      for (const o of r.options.filter((x) => !x.correct)) {
        expect(r.unit.words.some((w) => w.word === o.word)).toBe(false);
      }
    }
  });

  it('is deterministic for a given seed', () => {
    const a = buildReadingRounds(4, rngFrom(99)).map((r) => r.unit.text);
    const b = buildReadingRounds(4, rngFrom(99)).map((r) => r.unit.text);
    expect(a).toEqual(b);
  });
});
