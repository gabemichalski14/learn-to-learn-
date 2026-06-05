import { describe, it, expect } from 'vitest';
import { everydayEndings } from '../content/packs/everydayEndings';
import { validatePack } from './validatePack';
import { generateSortRound, isCorrectPlacement, isRoundComplete, availableSounds } from './engine';

describe('ending-sounds game', () => {
  it('the endings pack is structurally valid', () => {
    expect(validatePack(everydayEndings)).toEqual([]);
  });

  it('exposes ending-sound targets (not beginning)', () => {
    expect(availableSounds(everydayEndings, 2, 'ending').sort()).toEqual(['m', 'n', 'p', 't']);
    expect(availableSounds(everydayEndings, 2, 'beginning')).toEqual([]);
  });

  it('generates a round sorted by the ending sound', () => {
    const round = generateSortRound({ pack: everydayEndings, totalItems: 6, target: 'ending' });
    expect(round.target).toBe('ending');
    expect(round.items.length).toBe(6);
    for (const item of round.items) {
      expect(round.baskets).toContain(item.endingSound);
      expect(isCorrectPlacement(item, item.endingSound!, 'ending')).toBe(true);
    }
  });

  it('completes only when every item is placed by its ending sound', () => {
    const round = generateSortRound({ pack: everydayEndings, totalItems: 6, target: 'ending' });
    const correct = Object.fromEntries(round.items.map((i) => [i.id, i.endingSound!]));
    expect(isRoundComplete(round, correct)).toBe(true);
    // wrong basket for one item → not complete
    const wrong = { ...correct, [round.items[0].id]: 'zzz' };
    expect(isRoundComplete(round, wrong)).toBe(false);
  });
});
