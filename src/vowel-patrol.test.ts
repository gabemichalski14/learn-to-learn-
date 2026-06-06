import { describe, it, expect } from 'vitest';
import { skillKeyForSound, parseSkillKey, skillLabel } from './mastery/skills';
import { practiceRouteForSkill } from './mastery/skill-games';
import { generateSortRound, soundOf } from './domain/engine';
import { validatePack } from './domain/validatePack';
import { shortVowelWords } from './content/packs/shortVowelWords';

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

describe('medial vowel skill keys', () => {
  it('builds + round-trips a medial key', () => {
    expect(skillKeyForSound('a', 'medial')).toBe('sound:medial:a');
    expect(parseSkillKey('sound:medial:a')).toEqual({ kind: 'sound', target: 'medial', soundId: 'a' });
  });
  it('labels medial sounds as "in the middle"', () => {
    expect(skillLabel('sound:medial:a')).toBe('the /a/ sound in the middle');
  });
  it('routes a medial skill to Vowel Patrol (middle-sounds)', () => {
    expect(practiceRouteForSkill('sound:medial:i')).toBe('#/play/middle-sounds?focus=sound:medial:i');
  });
});

describe('shortVowelWords pack', () => {
  it('validates cleanly', () => {
    expect(validatePack(shortVowelWords)).toEqual([]);
  });
  it('every word has a known short-vowel medialVowel', () => {
    expect(shortVowelWords.words.every((w) => w.medialVowel && VOWELS.includes(w.medialVowel))).toBe(true);
  });
  it('covers all five short vowels', () => {
    const vowels = new Set(shortVowelWords.words.map((w) => w.medialVowel));
    VOWELS.forEach((v) => expect(vowels.has(v)).toBe(true));
  });
});

describe('generateSortRound with the medial target', () => {
  it('builds vowel-planet baskets and items sorted by middle vowel', () => {
    for (let i = 0; i < 20; i++) {
      const r = generateSortRound({ pack: shortVowelWords, totalItems: 6, target: 'medial' });
      expect(r.target).toBe('medial');
      expect(r.baskets.length).toBeGreaterThanOrEqual(2);
      r.baskets.forEach((b) => expect(VOWELS).toContain(b));
      r.items.forEach((it) => expect(VOWELS).toContain(soundOf(it, 'medial')!));
    }
  });
  it('honors a focus vowel so it always appears as a planet', () => {
    const r = generateSortRound({ pack: shortVowelWords, totalItems: 6, target: 'medial', focusSound: 'u' });
    expect(r.baskets).toContain('u');
  });
});
