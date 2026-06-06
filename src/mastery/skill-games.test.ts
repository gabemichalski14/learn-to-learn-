import { describe, it, expect } from 'vitest';
import { practiceRouteForSkill } from './skill-games';

describe('practiceRouteForSkill', () => {
  it('routes first-sound skills to Sound Safari with a focus', () => {
    expect(practiceRouteForSkill('sound:first:m')).toBe('#/play/beginning-sounds?focus=sound:first:m');
  });
  it('routes last-sound skills to Last Sound Standing', () => {
    expect(practiceRouteForSkill('sound:last:t')).toBe('#/play/ending-sounds?focus=sound:last:t');
  });
  it('returns null for unmapped skills', () => {
    expect(practiceRouteForSkill('rule:floss')).toBeNull();
  });
});
