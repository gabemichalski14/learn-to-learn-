import { describe, it, expect } from 'vitest';
import { isCorrectPlacement, isRoundComplete } from './engine';
import type { SortRound, WordItem } from './types';

const ball: WordItem = { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' };
const sun: WordItem = { id: 'sun', label: 'sun', beginningSound: 's', emoji: '☀️' };
const round: SortRound = { baskets: ['b', 's'], items: [ball, sun] };

describe('isCorrectPlacement', () => {
  it('is true when the item begins with the basket sound', () => {
    expect(isCorrectPlacement(ball, 'b')).toBe(true);
  });
  it('is false otherwise', () => {
    expect(isCorrectPlacement(ball, 's')).toBe(false);
  });
});

describe('isRoundComplete', () => {
  it('is false until every item is correctly placed', () => {
    expect(isRoundComplete(round, { ball: 'b' })).toBe(false);
  });
  it('is true when all items are correctly placed', () => {
    expect(isRoundComplete(round, { ball: 'b', sun: 's' })).toBe(true);
  });
  it('does not count an incorrect placement as complete', () => {
    expect(isRoundComplete(round, { ball: 's', sun: 's' })).toBe(false);
  });
});
