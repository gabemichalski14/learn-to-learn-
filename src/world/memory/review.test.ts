import { describe, it, expect } from 'vitest';
import type { SkillEvent } from '../../mastery/events';
import {
  INTERVAL,
  RETIRE_CONSECUTIVE,
  CONFUSION_MIN,
  SESSION_ITEM_CAP,
  pairId,
  makeSkillItem,
  makePairItem,
  confusionMatrixFromEvents,
  promotablePairs,
  reviewAfterAnswer,
  pairEligibleForInterleave,
  selectDueItems,
  type ReviewItem,
  type ReviewState,
} from './review';

const ev = (e: Partial<SkillEvent> & { skillKey: string; correct: boolean }): SkillEvent => ({ at: 0, ...e });

describe('pairId', () => {
  it('is stable regardless of argument order', () => {
    expect(pairId('sound:first:b', 'sound:first:d')).toBe(pairId('sound:first:d', 'sound:first:b'));
  });
});

describe('makeSkillItem', () => {
  it('starts in box 1, active, due after the box-1 interval', () => {
    const it0 = makeSkillItem('sound:first:m', 0);
    expect(it0.box).toBe(1);
    expect(it0.status).toBe('active');
    expect(it0.dueSession).toBe(INTERVAL[1]);
    expect(it0.members).toEqual(['sound:first:m']);
  });
});

describe('makePairItem', () => {
  it('sorts members and carries confusion strength', () => {
    const p = makePairItem('sound:first:d', 'sound:first:b', 3, 0.5);
    expect(p.members).toEqual(['sound:first:b', 'sound:first:d']);
    expect(p.kind).toBe('pair');
    expect(p.confusionStrength).toBe(0.5);
    expect(p.dueSession).toBe(3 + INTERVAL[1]);
  });
});

describe('confusionMatrixFromEvents', () => {
  it('tallies wrong choices on first-try misses only', () => {
    const events: SkillEvent[] = [
      ev({ skillKey: 'sound:first:b', correct: false, chosen: 'd' }),
      ev({ skillKey: 'sound:first:b', correct: false, chosen: 'd' }),
      ev({ skillKey: 'sound:first:b', correct: false, chosen: 'p' }),
      ev({ skillKey: 'sound:first:b', correct: true, chosen: undefined }), // correct → ignored
      ev({ skillKey: 'sound:first:b', correct: false, chosen: 'd', firstTry: false }), // retry → ignored
      ev({ skillKey: 'sound:first:b', correct: false }), // no chosen → ignored
    ];
    expect(confusionMatrixFromEvents(events)).toEqual({ 'sound:first:b': { d: 2, p: 1 } });
  });

  it('returns an empty matrix for no qualifying events', () => {
    expect(confusionMatrixFromEvents([ev({ skillKey: 'x', correct: true })])).toEqual({});
  });
});

describe('promotablePairs', () => {
  it('promotes a confusion that is >=25% of misses and >=CONFUSION_MIN occurrences', () => {
    const matrix = { 'sound:first:b': { d: CONFUSION_MIN, p: 1 } };
    const pairs = promotablePairs(matrix);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]).toMatchObject({ target: 'sound:first:b', confusedWith: 'd', count: CONFUSION_MIN });
  });

  it('does NOT promote a confusion below the occurrence floor', () => {
    const matrix = { 'sound:first:b': { d: CONFUSION_MIN - 1 } };
    expect(promotablePairs(matrix)).toHaveLength(0);
  });

  it('does NOT promote a frequent-but-diffuse miss below the rate threshold', () => {
    // d occurs 3x (≥ floor) but is only 3/13 ≈ 23% of misses → below 25%; every
    // other choice occurs < CONFUSION_MIN, so nothing qualifies.
    const matrix = { 'sound:first:b': { d: 3, m: 2, n: 2, p: 2, t: 2, w: 2 } };
    expect(promotablePairs(matrix)).toHaveLength(0);
  });

  it('orders strongest confusion first', () => {
    const matrix = {
      a: { x: 4, y: 1 },          // x = 4/5 = .80 (qualifies)
      b: { z: 3, w: 1, v: 1 },    // z = 3/5 = .60 (qualifies); w,v below the floor
    };
    const pairs = promotablePairs(matrix);
    expect(pairs.map((p) => p.target)).toEqual(['a', 'b']);
  });
});

describe('reviewAfterAnswer', () => {
  it('promotes a box and reschedules on a correct answer', () => {
    const start = makeSkillItem('s', 0);
    const { item, reteach } = reviewAfterAnswer(start, true, 1);
    expect(item.box).toBe(2);
    expect(item.consecutiveCorrect).toBe(1);
    expect(item.dueSession).toBe(1 + INTERVAL[2]);
    expect(item.status).toBe('active');
    expect(reteach).toBe(false);
  });

  it('retires a skill after RETIRE_CONSECUTIVE corrects at box 3 (≈3 spaced successes)', () => {
    let item = makeSkillItem('s', 0);
    let session = item.dueSession;
    for (let i = 0; i < RETIRE_CONSECUTIVE; i++) {
      const out = reviewAfterAnswer(item, true, session);
      item = out.item;
      session = item.dueSession;
    }
    expect(item.box).toBe(3);
    expect(item.status).toBe('retired');
  });

  it('a miss resets a skill to box 1 and flags re-teach', () => {
    const atBox3: ReviewItem = { ...makeSkillItem('s', 0), box: 3, consecutiveCorrect: 2 };
    const { item, reteach } = reviewAfterAnswer(atBox3, false, 12);
    expect(item.box).toBe(1);
    expect(item.consecutiveCorrect).toBe(0);
    expect(item.dueSession).toBe(12 + INTERVAL[1]);
    expect(reteach).toBe(true);
  });

  it('a miss on a PAIR does not flag re-teach', () => {
    const pair: ReviewItem = { ...makePairItem('a', 'b', 0, 0.5), box: 2, consecutiveCorrect: 1 };
    const { reteach } = reviewAfterAnswer(pair, false, 5);
    expect(reteach).toBe(false);
  });
});

describe('pairEligibleForInterleave (block-first guardrail)', () => {
  const pair = makePairItem('a', 'b', 0, 0.5);

  it('is eligible only when BOTH members are acquired', () => {
    expect(pairEligibleForInterleave(pair, () => true)).toBe(true);
    expect(pairEligibleForInterleave(pair, (m) => m === 'a')).toBe(false);
    expect(pairEligibleForInterleave(pair, () => false)).toBe(false);
  });

  it('a skill item is never an interleave pair', () => {
    expect(pairEligibleForInterleave(makeSkillItem('a', 0), () => true)).toBe(false);
  });
});

describe('selectDueItems', () => {
  const state = (items: ReviewItem[]): ReviewState => ({
    sessionCounter: 0,
    items: Object.fromEntries(items.map((it) => [it.id, it])),
  });

  it('only surfaces active items that are due this session', () => {
    const dueNow = { ...makeSkillItem('a', 0), dueSession: 5 };
    const future = { ...makeSkillItem('b', 0), dueSession: 99 };
    const retired: ReviewItem = { ...makeSkillItem('c', 0), dueSession: 1, status: 'retired' };
    const picked = selectDueItems(state([dueNow, future, retired]), 5);
    expect(picked.map((p) => p.id)).toEqual(['a']);
  });

  it('caps the set (less-is-more)', () => {
    const many = Array.from({ length: SESSION_ITEM_CAP + 3 }, (_, i) => ({ ...makeSkillItem(`s${i}`, 0), dueSession: 0 }));
    expect(selectDueItems(state(many), 1)).toHaveLength(SESSION_ITEM_CAP);
  });

  it('prioritizes re-teach, then eligible pairs, then fragile (low-box) skills', () => {
    const reteachSkill = { ...makeSkillItem('reteach', 0), dueSession: 0 };
    const pair = { ...makePairItem('a', 'b', 0, 0.9), dueSession: 0 };
    const box3skill = { ...makeSkillItem('strong', 0), box: 3 as const, dueSession: 0 };
    const box1skill = { ...makeSkillItem('fragile', 0), box: 1 as const, dueSession: 0 };
    const picked = selectDueItems(state([box3skill, box1skill, pair, reteachSkill]), 1, {
      reteach: new Set(['reteach']),
      isAcquired: () => true,
    });
    expect(picked[0].id).toBe('reteach');
    expect(picked[1].id).toBe(pair.id);
    // fragile (box 1) before strong (box 3)
    expect(picked.indexOf(box1skill) >= 0 && picked.indexOf(box1skill) < picked.indexOf(box3skill)).toBe(true);
  });

  it('holds back pairs whose members are not yet acquired (block-first)', () => {
    const pair = { ...makePairItem('a', 'b', 0, 0.9), dueSession: 0 };
    const picked = selectDueItems(state([pair]), 1, { isAcquired: (m) => m === 'a' });
    expect(picked).toHaveLength(0);
  });
});
