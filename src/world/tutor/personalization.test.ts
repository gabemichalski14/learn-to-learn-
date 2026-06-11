import { describe, it, expect } from 'vitest';
import { confusions, confusionPhrase, firstTryRate, fluency, type EvInput } from './personalization';

const wrong = (skill_key: string, chosen: string): EvInput => ({ skill_key, correct: false, chosen });

describe('personalization.confusions', () => {
  it('surfaces a swap only once it is a pattern (>=3) and ranks by frequency', () => {
    const events: EvInput[] = [
      wrong('sound:first:b', 'd'), wrong('sound:first:b', 'd'), wrong('sound:first:b', 'd'), wrong('sound:first:b', 'd'),
      wrong('sound:first:m', 'n'), wrong('sound:first:m', 'n'), // only 2 → not a pattern
      { skill_key: 'sound:first:b', correct: true, chosen: 'b' }, // correct → ignored
    ];
    const c = confusions(events);
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ skillKey: 'sound:first:b', chosen: 'd', count: 4 });
  });

  it('ignores wrong answers with no recorded choice', () => {
    expect(confusions([{ skill_key: 'pa:segment', correct: false }, { skill_key: 'pa:segment', correct: false }, { skill_key: 'pa:segment', correct: false }])).toHaveLength(0);
  });

  it('phrases gently (no clinical language)', () => {
    const phrase = confusionPhrase({ skillKey: 'sound:first:b', chosen: 'd', count: 4 });
    expect(phrase).toMatch(/often picks/);
    expect(phrase.toLowerCase()).not.toMatch(/dyslexia|deficit|disorder/);
  });

  it('reads true per L3 kind: blends drop a sound, syllables cut at the wrong spot', () => {
    expect(confusionPhrase({ skillKey: 'blend:init:sl', chosen: 'l', count: 3 })).toMatch(/drops the \/l\/ sound/);
    expect(confusionPhrase({ skillKey: 'syll:vccv', chosen: '3', count: 3 })).toMatch(/cuts at the wrong spot/);
    expect(confusionPhrase({ skillKey: 'syll:vccv', chosen: '3', count: 3 })).not.toMatch(/“3”/); // no opaque index
    // digraph / rule still read perfectly with the "picks X instead" model
    expect(confusionPhrase({ skillKey: 'digraph:sh', chosen: 'ch', count: 3 })).toMatch(/often picks “ch” instead/);
  });
});

describe('personalization.firstTryRate', () => {
  it('computes true first-try accuracy per skill', () => {
    const events: EvInput[] = [
      { skill_key: 'x', correct: false, first_try: false },
      { skill_key: 'x', correct: true, first_try: true },
      { skill_key: 'x', correct: true, first_try: true },
      { skill_key: 'y', correct: true }, // no first_try → ignored
    ];
    const m = firstTryRate(events);
    expect(m.get('x')).toEqual({ rate: 2 / 3, n: 3 });
    expect(m.has('y')).toBe(false);
  });
});

describe('personalization.fluency', () => {
  it('buckets quick+correct as automatic, slow as effortful (>=3 timed)', () => {
    const fast: EvInput[] = [1, 2, 3].map(() => ({ skill_key: 'a', correct: true, latency_ms: 1500 }));
    const slow: EvInput[] = [1, 2, 3].map(() => ({ skill_key: 'b', correct: true, latency_ms: 7000 }));
    const m = fluency([...fast, ...slow]);
    expect(m.get('a')).toBe('automatic');
    expect(m.get('b')).toBe('effortful');
  });
});
