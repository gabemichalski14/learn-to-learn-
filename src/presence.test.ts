import { describe, it, expect } from 'vitest';
import { presenceState, presenceLabel, parseTs } from './presence';

describe('presence', () => {
  const now = 1_700_000_000_000;
  it('green ≤5 min, amber ≤30 min, grey after / unknown', () => {
    expect(presenceState(now - 60_000, now)).toBe('online');
    expect(presenceState(now - 10 * 60_000, now)).toBe('recent');
    expect(presenceState(now - 60 * 60_000, now)).toBe('offline');
    expect(presenceState(null, now)).toBe('offline');
  });
  it('labels read in plain, non-shaming language', () => {
    expect(presenceLabel(now - 60_000, now)).toMatch(/now/);
    expect(presenceLabel(now - 12 * 60_000, now)).toMatch(/12 min ago/);
    expect(presenceLabel(null, now)).toMatch(/Not on the platform/);
  });
  it('parseTs handles ISO + null', () => {
    expect(parseTs(null)).toBeNull();
    expect(parseTs(new Date(now).toISOString())).toBe(now);
  });
});
