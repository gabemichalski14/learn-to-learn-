import { describe, it, expect } from 'vitest';
import { buildRhymeRounds, buildBlendItRounds, RHYME_FAMILIES } from './level1';

// Deterministic RNG for stable assertions.
function seeded(seed: number) { let s = seed; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

describe('Rhyme Time rounds', () => {
  it('builds n rounds, each with 3 options and exactly one true rhyme', () => {
    const rounds = buildRhymeRounds(8, seeded(1));
    expect(rounds).toHaveLength(8);
    for (const r of rounds) {
      expect(r.options).toHaveLength(3);
      // the answer is one of the options
      expect(r.options.some((o) => o.word === r.answer)).toBe(true);
      // the answer and target share a family (rhyme); the target is not an option
      const fam = RHYME_FAMILIES.find((f) => f.some((w) => w.word === r.target.word))!;
      expect(fam.some((w) => w.word === r.answer)).toBe(true);
      expect(r.options.every((o) => o.word !== r.target.word)).toBe(true);
      // the two distractors do NOT rhyme (not in the target's family)
      const distractors = r.options.filter((o) => o.word !== r.answer);
      expect(distractors.every((d) => !fam.some((w) => w.word === d.word))).toBe(true);
    }
  });
});

describe('Blend It rounds', () => {
  it('builds n rounds, each with a sound sequence and 3 options incl. the word', () => {
    const rounds = buildBlendItRounds(8, seeded(2));
    expect(rounds).toHaveLength(8);
    for (const r of rounds) {
      expect(r.sounds.length).toBeGreaterThanOrEqual(2);
      expect(r.options).toHaveLength(3);
      expect(r.options.some((o) => o.word === r.word)).toBe(true);
      // options are unique
      expect(new Set(r.options.map((o) => o.word)).size).toBe(3);
    }
  });
});
