import { describe, it, expect, beforeEach } from 'vitest';
import { recordItem } from '../../mastery/mastery';
import type { SkillEvent } from '../../mastery/events';
import {
  loadReview,
  enrollMasteredSkills,
  siblingSkillKey,
  syncConfusionPairs,
  startReviewSession,
  selectReview,
  recordReview,
} from './reviewStore';
import { pairId } from './review';

const L = 'rev-learner';
beforeEach(() => localStorage.clear());

/** Practise a skill to acquired (≥5 first-try attempts, all correct → score 1). */
function master(skill: string, n = 5): void {
  for (let i = 0; i < n; i++) recordItem(L, skill, true);
}

describe('enrollMasteredSkills', () => {
  it('enrolls only skills practised to mastery, and is idempotent', () => {
    master('sound:first:m');
    recordItem(L, 'sound:first:s', false); // 1 attempt, not rated → not enrolled
    expect(enrollMasteredSkills(L)).toBe(1);
    expect(loadReview(L).items['sound:first:m']).toBeDefined();
    expect(loadReview(L).items['sound:first:s']).toBeUndefined();
    expect(enrollMasteredSkills(L)).toBe(0); // idempotent
  });
});

describe('siblingSkillKey', () => {
  it('reconstructs a positional sibling for the sound family', () => {
    expect(siblingSkillKey('sound:first:b', 'd')).toBe('sound:first:d');
    expect(siblingSkillKey('sound:last:t', 'd')).toBe('sound:last:d');
  });
  it('returns null for families it cannot safely reconstruct', () => {
    expect(siblingSkillKey('pa:segment', 'x')).toBeNull();
    expect(siblingSkillKey('digraph:sh', 'ch')).toBeNull();
  });
});

describe('syncConfusionPairs', () => {
  const confusion: SkillEvent[] = [
    { skillKey: 'sound:first:b', correct: false, at: 1, chosen: 'd' },
    { skillKey: 'sound:first:b', correct: false, at: 2, chosen: 'd' },
    { skillKey: 'sound:first:b', correct: false, at: 3, chosen: 'd' },
  ];

  it('mints a pair from a systematic confusion, and is idempotent', () => {
    expect(syncConfusionPairs(L, confusion)).toBe(1);
    const id = pairId('sound:first:b', 'sound:first:d');
    expect(loadReview(L).items[id]).toMatchObject({ kind: 'pair', members: ['sound:first:b', 'sound:first:d'] });
    expect(syncConfusionPairs(L, confusion)).toBe(0);
  });

  it('ignores a one-off confusion below threshold', () => {
    expect(syncConfusionPairs(L, [{ skillKey: 'sound:first:b', correct: false, at: 1, chosen: 'd' }])).toBe(0);
  });
});

describe('session + selection', () => {
  it('only surfaces items once the session clock advances past their due date', () => {
    master('sound:first:m');
    enrollMasteredSkills(L);
    expect(selectReview(L)).toHaveLength(0); // created at session 0, due session 1
    startReviewSession(L);
    expect(selectReview(L).map((i) => i.id)).toEqual(['sound:first:m']);
  });
});

describe('block-first interleave gate (wired from real mastery)', () => {
  it('holds a confusable pair back until BOTH members are acquired', () => {
    syncConfusionPairs(L, [
      { skillKey: 'sound:first:b', correct: false, at: 1, chosen: 'd' },
      { skillKey: 'sound:first:b', correct: false, at: 2, chosen: 'd' },
      { skillKey: 'sound:first:b', correct: false, at: 3, chosen: 'd' },
    ]);
    startReviewSession(L);
    expect(selectReview(L)).toHaveLength(0); // neither member acquired yet

    master('sound:first:b');
    expect(selectReview(L)).toHaveLength(0); // only one member acquired

    master('sound:first:d');
    expect(selectReview(L).map((i) => i.id)).toEqual([pairId('sound:first:b', 'sound:first:d')]);
  });
});

describe('recordReview', () => {
  it('advances a skill on success and flags re-teach on a miss', () => {
    master('sound:first:m');
    enrollMasteredSkills(L);
    startReviewSession(L);

    expect(recordReview(L, 'sound:first:m', true)).toBe(false); // correct → no re-teach
    expect(loadReview(L).items['sound:first:m'].box).toBe(2);

    expect(recordReview(L, 'sound:first:m', false)).toBe(true); // miss on a skill → re-teach
    expect(loadReview(L).items['sound:first:m'].box).toBe(1);
  });

  it('does nothing for an unknown item id', () => {
    expect(recordReview(L, 'nope', true)).toBe(false);
  });
});
