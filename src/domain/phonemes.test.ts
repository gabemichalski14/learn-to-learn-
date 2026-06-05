import { describe, it, expect } from 'vitest';
import { PHONEMES, getPhoneme } from './phonemes';

describe('phoneme registry', () => {
  it('returns a phoneme by id with required fields', () => {
    const b = getPhoneme('b');
    expect(b).toEqual({ id: 'b', label: 'b', ipa: '/b/', type: 'consonant' });
  });

  it('throws on an unknown id', () => {
    expect(() => getPhoneme('zzz')).toThrow(/unknown phoneme/i);
  });

  it('every registered phoneme has id, label, ipa, and a valid type', () => {
    const validTypes = ['consonant', 'vowel', 'unit'];
    for (const [id, p] of Object.entries(PHONEMES)) {
      expect(p.id).toBe(id);
      expect(p.label.length).toBeGreaterThan(0);
      expect(p.ipa.length).toBeGreaterThan(0);
      expect(validTypes).toContain(p.type);
    }
  });
});
