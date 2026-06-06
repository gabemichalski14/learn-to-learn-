import { describe, it, expect, beforeEach } from 'vitest';
import { recordItem, loadMastery, masteryScore, areasToImprove, clearMastery } from './mastery';

const L = 'test-learner';
beforeEach(() => { localStorage.clear(); });

describe('mastery store', () => {
  it('accumulates attempts and correct counts', () => {
    recordItem(L, 'sound:first:m', true);
    recordItem(L, 'sound:first:m', false);
    const m = loadMastery(L);
    expect(m['sound:first:m'].attempts).toBe(2);
    expect(m['sound:first:m'].correct).toBe(1);
  });

  it('scores unseen skills as fully solid (1)', () => {
    expect(masteryScore(L, 'sound:first:b')).toBe(1);
  });

  it('weights recent answers more heavily', () => {
    for (let i = 0; i < 5; i++) recordItem(L, 'sound:first:s', false);
    for (let i = 0; i < 5; i++) recordItem(L, 'sound:first:s', true);
    expect(masteryScore(L, 'sound:first:s')).toBeGreaterThan(0.5);
  });

  it('areasToImprove returns rated, weak skills weakest-first', () => {
    for (let i = 0; i < 6; i++) recordItem(L, 'sound:first:t', true);
    for (let i = 0; i < 4; i++) recordItem(L, 'sound:last:p', false);
    for (let i = 0; i < 2; i++) recordItem(L, 'sound:last:p', true);
    recordItem(L, 'sound:first:n', false);

    const areas = areasToImprove(L, 3);
    expect(areas.map((a) => a.skillKey)).toContain('sound:last:p');
    expect(areas.map((a) => a.skillKey)).not.toContain('sound:first:t');
    expect(areas.map((a) => a.skillKey)).not.toContain('sound:first:n');
    expect(areas[0].skillKey).toBe('sound:last:p');
  });

  it('clearMastery wipes the learner', () => {
    recordItem(L, 'sound:first:m', true);
    clearMastery(L);
    expect(loadMastery(L)).toEqual({});
  });
});
