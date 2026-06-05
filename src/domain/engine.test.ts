import { describe, it, expect } from 'vitest';
import { generateSortRound, canBuildSortRound } from './engine';
import { everydayObjects } from '../content/packs/everydayObjects';

describe('generateSortRound', () => {
  it('uses the requested target sounds as baskets', () => {
    const round = generateSortRound({
      pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3,
    });
    expect(round.baskets).toEqual(['b', 's']);
  });

  it('includes itemsPerSound pictures for each target sound', () => {
    const round = generateSortRound({
      pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3,
    });
    expect(round.items).toHaveLength(6);
    const bCount = round.items.filter((i) => i.beginningSound === 'b').length;
    const sCount = round.items.filter((i) => i.beginningSound === 's').length;
    expect(bCount).toBe(3);
    expect(sCount).toBe(3);
  });

  it('only includes pictures whose beginning sound is a target', () => {
    const round = generateSortRound({
      pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3,
    });
    for (const item of round.items) {
      expect(['b', 's']).toContain(item.beginningSound);
    }
  });

  it('is deterministic when given a fixed rng', () => {
    const rng = () => 0;
    const a = generateSortRound({ pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3, rng });
    const b = generateSortRound({ pack: everydayObjects, targetSounds: ['b', 's'], itemsPerSound: 3, rng });
    expect(a.items.map((i) => i.id)).toEqual(b.items.map((i) => i.id));
  });

  it('throws if the pack lacks enough words for a target sound', () => {
    expect(() =>
      generateSortRound({ pack: everydayObjects, targetSounds: ['b'], itemsPerSound: 99 }),
    ).toThrow(/not enough words/i);
  });
});

describe('canBuildSortRound', () => {
  it('is true when every target sound has enough words', () => {
    expect(canBuildSortRound(everydayObjects, ['b', 's'], 3)).toBe(true);
  });
  it('is false when a target sound is short on words', () => {
    expect(canBuildSortRound(everydayObjects, ['b'], 99)).toBe(false);
  });
});
