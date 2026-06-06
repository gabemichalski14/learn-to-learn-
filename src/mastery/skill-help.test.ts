import { describe, it, expect } from 'vitest';
import { skillHelp } from './skill-help';

describe('skillHelp', () => {
  it('returns what/why/how for a known sound skill', () => {
    const h = skillHelp('sound:first:m');
    expect(h.what.length).toBeGreaterThan(0);
    expect(h.why.length).toBeGreaterThan(0);
    expect(h.tip.length).toBeGreaterThan(0);
  });
  it('falls back gracefully for unknown keys', () => {
    const h = skillHelp('sound:first:zzz');
    expect(h.what).toContain('/zzz/');
  });
});
