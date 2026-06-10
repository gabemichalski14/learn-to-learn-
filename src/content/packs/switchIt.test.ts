import { describe, it, expect } from 'vitest';
import { buildSwitchRounds } from './switchIt';

describe('buildSwitchRounds', () => {
  it('builds n rounds, each differing at exactly one valid bead index', () => {
    const rounds = buildSwitchRounds(8);
    expect(rounds).toHaveLength(8);
    for (const r of rounds) {
      expect(r.source).toHaveLength(r.target.length);
      expect(r.changeIndex).toBeGreaterThanOrEqual(0);
      expect(r.changeIndex).toBeLessThan(r.source.length);
      // the recorded index is the ONLY position that differs
      let diffs = 0;
      for (let i = 0; i < r.source.length; i++) if (r.source[i] !== r.target[i]) diffs++;
      expect(diffs).toBe(1);
      expect(r.source[r.changeIndex]).not.toBe(r.target[r.changeIndex]);
    }
  });
});
