import { describe, it, expect, beforeEach } from 'vitest';
import { recordItem, recordReplay, loadMastery, masteryScore, areasToImprove, weakestSoundForTarget, confusionPartner, clearMastery } from './mastery';

const L = 'test-learner';
beforeEach(() => { localStorage.clear(); });

describe('confusion capture + partner', () => {
  it('records the chosen wrong answer and surfaces the repeated partner', () => {
    recordItem(L, 'sound:first:b', false, undefined, 'd');
    recordItem(L, 'sound:first:b', false, undefined, 'd');
    recordItem(L, 'sound:first:b', false, undefined, 'p'); // a one-off, below threshold
    recordItem(L, 'sound:first:b', true, undefined, undefined); // correct → no confusion
    const s = loadMastery(L)['sound:first:b'];
    expect(s.confusions).toEqual({ d: 2, p: 1 });
    expect(confusionPartner(s)).toBe('d');           // 2 ≥ min(2)
    expect(confusionPartner(s, 3)).toBeUndefined();  // none reaches 3
  });
});

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

  it('weakestSoundForTarget picks the weakest rated sound within the pool', () => {
    for (let i = 0; i < 6; i++) recordItem(L, 'sound:medial:a', false); // weakest
    for (let i = 0; i < 6; i++) recordItem(L, 'sound:medial:o', i < 3); // 50%
    for (let i = 0; i < 6; i++) recordItem(L, 'sound:first:m', false); // wrong target
    const map = loadMastery(L);
    expect(weakestSoundForTarget(map, 'medial', ['a', 'o', 'e'])).toBe('a');
    // restricted to the pool — 'a' not offered ⇒ falls to next weakest in pool
    expect(weakestSoundForTarget(map, 'medial', ['o', 'e'])).toBe('o');
    // nothing rated/weak for this target ⇒ undefined (stay random)
    expect(weakestSoundForTarget(map, 'ending', ['t', 'p'])).toBeUndefined();
  });

  it('recordReplay counts re-hears without affecting accuracy', () => {
    recordItem(L, 'sound:first:s', true);
    recordReplay(L, 'sound:first:s');
    recordReplay(L, 'sound:first:s');
    const s = loadMastery(L)['sound:first:s'];
    expect(s.replays).toBe(2);
    expect(s.attempts).toBe(1); // replays never count as attempts
  });

  it('recordItem folds a sane response time into a rolling avgMs', () => {
    recordItem(L, 'sound:first:b', true, 1000);
    recordItem(L, 'sound:first:b', true, 3000);
    const s = loadMastery(L)['sound:first:b'];
    expect(s.avgMs).toBe(2000);
    expect(s.timed).toBe(2);
    // out-of-range times are ignored
    recordItem(L, 'sound:first:b', true, -5);
    expect(loadMastery(L)['sound:first:b'].timed).toBe(2);
  });

  it('clearMastery wipes the learner', () => {
    recordItem(L, 'sound:first:m', true);
    clearMastery(L);
    expect(loadMastery(L)).toEqual({});
  });
});
