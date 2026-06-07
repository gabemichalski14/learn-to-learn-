import { describe, it, expect } from 'vitest';
import { tutorTipsFor } from './tutorTips';
import type { MasteryMap } from '../../mastery/mastery';

function stat(correct: number, attempts: number) {
  // recent window drives scoreOf; fill it to match the ratio.
  const recent = Array.from({ length: Math.min(attempts, 10) }, (_, i) => (i < correct ? 1 : 0));
  return { attempts, correct, recent, lastSeen: 1000 + attempts };
}

describe('tutorTipsFor', () => {
  it('leads with the weakest RATED sound and reports a percentage + an action', () => {
    const m: MasteryMap = { 'sound:first:b': stat(1, 6) }; // weak, rated
    const tips = tutorTipsFor(m, 'Mira');
    expect(tips[0].title).toBe('the /b/ sound at the start');
    expect(tips[0].body).toContain('Mira');
    expect(tips[0].body).toMatch(/%/);
    expect(tips[0].body.length).toBeGreaterThan(40); // carries a real coaching action
  });

  it('suggests building on a strength when there are no weak rated sounds', () => {
    const m: MasteryMap = { 'sound:first:m': stat(10, 10) }; // strong, rated
    const tips = tutorTipsFor(m, 'Sam');
    expect(tips.some((t) => t.id.startsWith('strong:'))).toBe(true);
  });

  it('falls back to a starter nudge with no rated data', () => {
    const tips = tutorTipsFor({}, 'Lee');
    expect(tips).toHaveLength(1);
    expect(tips[0].id).toBe('start');
    expect(tips[0].body).toContain('Lee');
  });

  it('caps at n and never leaks "undefined" into copy', () => {
    const m: MasteryMap = {
      'sound:first:b': stat(1, 6),
      'sound:last:t': stat(1, 6),
      'sound:medial:a': stat(1, 6),
      'pa:segment': stat(1, 6), // non-sound skill -> generic action, no soundId leak
    };
    const tips = tutorTipsFor(m, 'Ada', 3);
    expect(tips).toHaveLength(3);
    for (const t of tips) expect(`${t.title} ${t.body}`).not.toContain('undefined');
  });
});
