import { describe, it, expect } from 'vitest';
import { investmentScore, worldTier, tierProgress, WORLD_MAX_TIER, TIER_NAMES } from './worldTier';

describe('investmentScore', () => {
  it('weights sessions over stickers and never goes negative', () => {
    expect(investmentScore({ sessions: 0, earned: [] })).toBe(0);
    expect(investmentScore({ sessions: 2, earned: ['a', 'b'] })).toBe(8); // 2*3 + 2
    expect(investmentScore({ sessions: -5 as number, earned: [] })).toBe(0);
  });

  it('tolerates a missing/garbage earned array', () => {
    // @ts-expect-error — exercising the runtime guard
    expect(investmentScore({ sessions: 3, earned: null })).toBe(9);
  });
});

describe('worldTier', () => {
  it('starts at 0 and climbs monotonically with score', () => {
    expect(worldTier(0)).toBe(0);
    expect(worldTier(2)).toBe(0);
    expect(worldTier(3)).toBe(1);
    expect(worldTier(10)).toBe(2);
    expect(worldTier(22)).toBe(3);
    expect(worldTier(40)).toBe(4);
    expect(worldTier(70)).toBe(5);
  });

  it('caps at WORLD_MAX_TIER no matter how high the score', () => {
    expect(worldTier(10_000)).toBe(WORLD_MAX_TIER);
  });
});

describe('tierProgress', () => {
  it('reports fractional progress toward the next tier', () => {
    const p = tierProgress(6); // tier 1 (base 3), next at 10 -> (6-3)/(10-3)
    expect(p.tier).toBe(1);
    expect(p.nextAt).toBe(10);
    expect(p.pct).toBeCloseTo(3 / 7, 5);
    expect(p.name).toBe(TIER_NAMES[1]);
  });

  it('saturates at the top tier with no next threshold', () => {
    const p = tierProgress(999);
    expect(p.tier).toBe(WORLD_MAX_TIER);
    expect(p.nextAt).toBeNull();
    expect(p.pct).toBe(1);
  });
});
