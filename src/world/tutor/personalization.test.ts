import { describe, it, expect } from 'vitest';
import { confusions, confusionPhrase, firstTryRate, fluency, spellingSlips, spellingSlipPhrase, readingPace, type EvInput } from './personalization';

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

describe('spellingSlips (dictation misspellings)', () => {
  it('counts wrong letters from dictation games only, >= MIN_SLIP', () => {
    const ev = (game: string, chosen: string): EvInput => ({ skill_key: 'sound:first:m', correct: false, chosen, game });
    const slips = spellingSlips([
      ev('word-beam', 'b'), ev('word-beam', 'b'),          // pattern (2) → kept
      ev('patches-dictation', 'n'),                         // 1 → dropped
      ev('blast-off', 'b'), ev('blast-off', 'b'),           // NOT a dictation game → ignored
      { skill_key: 'sound:first:m', correct: true, chosen: 'm', game: 'word-beam' }, // correct → ignored
    ]);
    expect(slips).toHaveLength(1);
    expect(slips[0]).toMatchObject({ chosen: 'b', count: 2 });
    expect(spellingSlipPhrase(slips[0])).toContain('wrote');
  });
});

describe('readingPace (fluency WCPM)', () => {
  it('computes words-correct-per-minute from fluency sessions; latest + best', () => {
    const s = (game: string, items: number, accuracy: number, durationMs: number) => ({ game, items, accuracy, durationMs });
    const pace = readingPace([
      s('star-station', 6, 1, 60000),   // not a fluency game → ignored
      s('warp-speed', 12, 1, 60000),    // 12 wcpm
      s('tool-time', 12, 0.5, 30000),   // 6 correct / 0.5 min = 12 wcpm
    ]);
    expect(pace.n).toBe(2);
    expect(pace.best).toBe(12);
    expect(pace.wcpm).toBe(12); // latest
  });
  it('returns n=0 when there are no fluency sessions', () => {
    expect(readingPace([{ game: 'tap-it-out', items: 8, accuracy: 1, durationMs: 60000 }])).toMatchObject({ n: 0 });
  });
});
