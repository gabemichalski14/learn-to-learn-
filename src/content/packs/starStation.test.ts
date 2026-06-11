import { describe, it, expect } from 'vitest';
import { buildStarRounds, positionTarget } from './starStation';

describe('buildStarRounds', () => {
  it('builds n CVC rounds whose tray contains every word letter plus extras', () => {
    const rounds = buildStarRounds(6);
    expect(rounds).toHaveLength(6);
    for (const r of rounds) {
      expect(r.word).toMatch(/^[a-z]{3}$/);
      for (const ch of r.word) expect(r.tiles).toContain(ch);
      expect(r.tiles.length).toBeGreaterThan(r.word.length); // has distractors
    }
  });
  it('positionTarget maps index → first/medial/last', () => {
    expect(positionTarget(0, 3)).toBe('beginning');
    expect(positionTarget(1, 3)).toBe('medial');
    expect(positionTarget(2, 3)).toBe('ending');
  });
  it('NEVER includes final-x words (box/fox/six spell /ks/, not one ending sound)', () => {
    const seen = new Set<string>();
    for (let k = 0; k < 80; k++) buildStarRounds(6).forEach((r) => seen.add(r.word));
    for (const w of seen) expect(w.endsWith('x')).toBe(false);
    // sanity: the clean pool is still non-trivial
    expect(seen.size).toBeGreaterThanOrEqual(6);
  });
});
