import { describe, it, expect, beforeEach } from 'vitest';
import { masteryFromEvents } from './events';
import type { SkillEvent } from './events';
import { recordItem, loadMastery, scoreOf } from './mastery';

beforeEach(() => localStorage.clear());

describe('masteryFromEvents', () => {
  it('matches the recordItem fold for the same ordered sequence', () => {
    const seq: Array<[string, boolean]> = [
      ['sound:medial:a', true], ['sound:medial:a', false], ['sound:medial:a', true],
      ['sound:first:b', false], ['sound:first:b', false], ['sound:medial:a', true],
    ];
    seq.forEach(([k, c]) => recordItem('L1', k, c));
    const expected = loadMastery('L1');

    const events: SkillEvent[] = seq.map(([skillKey, correct], i) => ({ skillKey, correct, at: 1000 + i }));
    const got = masteryFromEvents(events);

    for (const key of Object.keys(expected)) {
      expect(got[key].attempts).toBe(expected[key].attempts);
      expect(got[key].correct).toBe(expected[key].correct);
      expect(scoreOf(got[key])).toBeCloseTo(scoreOf(expected[key]));
    }
  });

  it('counts first attempts only — skips retries (first-try mastery)', () => {
    const map = masteryFromEvents([
      { skillKey: 'x', correct: false, at: 1, firstTry: true },  // first attempt: a miss → counts
      { skillKey: 'x', correct: true, at: 2, firstTry: false },  // retry success → ignored
      { skillKey: 'y', correct: true, at: 3 },                   // legacy (no firstTry) → counts
    ]);
    expect(map['x']).toMatchObject({ attempts: 1, correct: 0 });
    expect(map['y']).toMatchObject({ attempts: 1, correct: 1 });
  });

  it('caps the recent window at K and sorts events by time first', () => {
    const events: SkillEvent[] = Array.from({ length: 14 }, (_, i) => ({
      skillKey: 's', correct: i % 2 === 0, at: 14 - i,
    }));
    const map = masteryFromEvents(events);
    expect(map['s'].attempts).toBe(14);
    expect(map['s'].recent.length).toBe(10);
  });
});
