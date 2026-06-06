import { describe, it, expect } from 'vitest';
import { skillKeyForSound, parseSkillKey, skillLabel } from './skills';

describe('skill keys', () => {
  it('builds keys per sound + position', () => {
    expect(skillKeyForSound('m', 'beginning')).toBe('sound:first:m');
    expect(skillKeyForSound('m', 'ending')).toBe('sound:last:m');
  });
  it('round-trips through parse', () => {
    expect(parseSkillKey('sound:first:b')).toEqual({ kind: 'sound', target: 'beginning', soundId: 'b' });
    expect(parseSkillKey('sound:last:s')).toEqual({ kind: 'sound', target: 'ending', soundId: 's' });
    expect(parseSkillKey('nonsense')).toBeNull();
  });
  it('labels are learner-friendly', () => {
    expect(skillLabel('sound:first:m')).toBe('the /m/ sound at the start');
    expect(skillLabel('sound:last:t')).toBe('the /t/ sound at the end');
  });
});
