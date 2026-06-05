import { describe, it, expect } from 'vitest';
import { generateSortRound, canBuildSortRound, availableSounds } from './engine';
import { everydayObjects } from '../content/packs/everydayObjects';

/** Small deterministic PRNG so "random" behaviour is testable. */
function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

describe('availableSounds', () => {
  it('lists sounds that meet the minimum word threshold', () => {
    expect(availableSounds(everydayObjects, 2).sort()).toEqual(['b', 'm', 's', 't']);
  });
  it('excludes sounds without enough words', () => {
    expect(availableSounds(everydayObjects, 99)).toEqual([]);
  });
});

describe('generateSortRound', () => {
  it('uses the requested sounds as baskets (order may be shuffled)', () => {
    const round = generateSortRound({ pack: everydayObjects, sounds: ['b', 's'] });
    expect([...round.baskets].sort()).toEqual(['b', 's']);
  });

  it('only includes pictures whose beginning sound is one of the baskets', () => {
    const round = generateSortRound({ pack: everydayObjects, sounds: ['b', 's'] });
    for (const item of round.items) {
      expect(round.baskets).toContain(item.beginningSound);
    }
  });

  it('draws between minPerSound and maxPerSound pictures for each sound', () => {
    const round = generateSortRound({
      pack: everydayObjects, sounds: ['b', 's'], minPerSound: 2, maxPerSound: 4, rng: seeded(3),
    });
    for (const s of ['b', 's']) {
      const n = round.items.filter((i) => i.beginningSound === s).length;
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(4);
    }
  });

  it('honors an explicit basketCount of 3 with three distinct sounds', () => {
    const round = generateSortRound({ pack: everydayObjects, basketCount: 3, rng: seeded(9) });
    expect(round.baskets).toHaveLength(3);
    expect(new Set(round.baskets).size).toBe(3);
  });

  it('picks 2 or 3 baskets when basketCount is omitted', () => {
    for (let seed = 0; seed < 25; seed++) {
      const round = generateSortRound({ pack: everydayObjects, rng: seeded(seed) });
      expect(round.baskets.length).toBeGreaterThanOrEqual(2);
      expect(round.baskets.length).toBeLessThanOrEqual(3);
    }
  });

  it('is deterministic for a fixed seed', () => {
    const a = generateSortRound({ pack: everydayObjects, rng: seeded(42) });
    const b = generateSortRound({ pack: everydayObjects, rng: seeded(42) });
    expect(b.baskets).toEqual(a.baskets);
    expect(b.items.map((i) => i.id)).toEqual(a.items.map((i) => i.id));
  });

  it('produces different rounds across plays (anti-pattern)', () => {
    const signatures = new Set<string>();
    for (let seed = 0; seed < 12; seed++) {
      const r = generateSortRound({ pack: everydayObjects, rng: seeded(seed) });
      signatures.add(r.baskets.join(',') + '|' + r.items.map((i) => i.id).join(','));
    }
    // 12 seeds should yield several distinct rounds, not one fixed layout.
    expect(signatures.size).toBeGreaterThan(5);
  });

  it('throws when the pack has fewer than 2 usable sounds', () => {
    expect(() => generateSortRound({ pack: everydayObjects, minPerSound: 99 })).toThrow(/at least 2 sounds/i);
  });
});

describe('canBuildSortRound', () => {
  it('is true when every sound has enough words', () => {
    expect(canBuildSortRound(everydayObjects, ['b', 's'], 4)).toBe(true);
  });
  it('is false when a sound is short on words', () => {
    expect(canBuildSortRound(everydayObjects, ['b'], 99)).toBe(false);
  });
});
