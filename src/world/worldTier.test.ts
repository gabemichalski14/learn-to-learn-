import { describe, it, expect } from 'vitest';
import { investmentScore, worldTier, tierProgress, lushness, WORLD_MAX_TIER, TIER_NAMES } from './worldTier';

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
  it('climbs monotonically on the stretched multi-year thresholds', () => {
    expect(worldTier(0)).toBe(0);
    expect(worldTier(24)).toBe(0);
    expect(worldTier(25)).toBe(1);
    expect(worldTier(70)).toBe(2);
    expect(worldTier(140)).toBe(3);
    expect(worldTier(260)).toBe(4);
    expect(worldTier(450)).toBe(5);
  });

  it('reaches the top tier only after a long horizon (~150 sessions)', () => {
    expect(worldTier(449)).toBe(4); // still climbing well past 100 sessions
    expect(worldTier(10_000)).toBe(WORLD_MAX_TIER);
  });
});

describe('lushness', () => {
  it('is 0 at the start, grows gradually, and never reaches 1', () => {
    expect(lushness(0)).toBe(0);
    expect(lushness(180)).toBeCloseTo(1 - Math.exp(-1), 5);
    expect(lushness(9)).toBeGreaterThan(0);           // a couple sessions already show
    expect(lushness(9)).toBeLessThan(0.06);           // ...but only a little
    expect(lushness(2000)).toBeLessThan(1);           // asymptotic; even years in, not maxed
    expect(lushness(2000)).toBeGreaterThan(0.99);
  });

  it('increases monotonically', () => {
    expect(lushness(50)).toBeGreaterThan(lushness(20));
    expect(lushness(400)).toBeGreaterThan(lushness(200));
  });
});

describe('tierProgress', () => {
  it('reports fractional progress toward the next tier + lushness', () => {
    const p = tierProgress(47); // tier 1 (base 25), next at 70 -> (47-25)/(70-25)
    expect(p.tier).toBe(1);
    expect(p.nextAt).toBe(70);
    expect(p.pct).toBeCloseTo(22 / 45, 5);
    expect(p.name).toBe(TIER_NAMES[1]);
    expect(p.lush).toBeCloseTo(lushness(47), 5);
  });

  it('saturates at the top tier with no next threshold', () => {
    const p = tierProgress(999);
    expect(p.tier).toBe(WORLD_MAX_TIER);
    expect(p.nextAt).toBeNull();
    expect(p.pct).toBe(1);
  });
});
