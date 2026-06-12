import { describe, it, expect } from 'vitest';
import { HEART_WORDS, buildHeartRounds } from './heartWords';
import { bannedReason } from '../../reading/ageGuard';

describe('heart words pack', () => {
  it('every heart index is inside its word', () => {
    for (const w of HEART_WORDS) {
      expect(w.heart.length).toBeGreaterThan(0);
      for (const i of w.heart) expect(i).toBeGreaterThanOrEqual(0);
      for (const i of w.heart) expect(i).toBeLessThan(w.word.length);
    }
  });

  it('every word and sentence word is age-appropriate', () => {
    for (const w of HEART_WORDS) {
      expect(bannedReason(w.word), w.word).toBeNull();
      for (const token of w.sentence.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean)) {
        expect(bannedReason(token), `${w.word} sentence: ${token}`).toBeNull();
      }
    }
  });

  it('buildHeartRounds returns the requested count, distinct', () => {
    const r = buildHeartRounds(5, () => 0.3);
    expect(r).toHaveLength(5);
    expect(new Set(r.map((x) => x.word)).size).toBe(5);
  });
});
