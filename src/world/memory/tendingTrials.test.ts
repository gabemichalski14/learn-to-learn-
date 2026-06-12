import { describe, it, expect } from 'vitest';
import { trialFor, buildTrials } from './tendingTrials';
import { makeSkillItem, makePairItem, type ReviewItem } from './review';

const rng = () => 0.42;

describe('trialFor', () => {
  it('builds a recognition trial for a sound skill (answer + 2 distractors)', () => {
    const t = trialFor(makeSkillItem('sound:first:m', 0), rng)!;
    expect(t).not.toBeNull();
    expect(t.kind).toBe('skill');
    expect(t.answer).toBe('m');
    expect(t.cue).toBe('m');
    expect(t.options).toHaveLength(3);
    expect(t.options).toContain('m');
    expect(new Set(t.options).size).toBe(3); // distinct
  });

  it('builds a minimal-pair trial for a confusable pair (just the two members)', () => {
    const t = trialFor(makePairItem('sound:first:b', 'sound:first:d', 0, 0.5), rng)!;
    expect(t.kind).toBe('pair');
    expect(new Set(t.options)).toEqual(new Set(['b', 'd']));
    expect(['b', 'd']).toContain(t.answer);
  });

  it('returns null for families without an audio trial yet (pa:, blend:, …)', () => {
    expect(trialFor(makeSkillItem('pa:segment', 0), rng)).toBeNull();
    expect(trialFor(makeSkillItem('blend:init:st', 0), rng)).toBeNull();
  });
});

describe('buildTrials', () => {
  it('keeps renderable items, skips the rest, and caps the set', () => {
    const items: ReviewItem[] = [
      makeSkillItem('sound:first:m', 0),
      makeSkillItem('pa:segment', 0), // skipped
      makeSkillItem('sound:last:t', 0),
      makePairItem('sound:first:b', 'sound:first:d', 0, 0.5),
    ];
    const trials = buildTrials(items, rng, 6);
    expect(trials).toHaveLength(3); // pa:segment dropped
    expect(buildTrials(items, rng, 2)).toHaveLength(2); // cap respected
  });
});
