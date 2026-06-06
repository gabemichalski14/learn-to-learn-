import { describe, it, expect } from 'vitest';
import { parseHash } from './router';

describe('parseHash play focus', () => {
  it('parses game id with no focus', () => {
    expect(parseHash('#/play/beginning-sounds')).toEqual({ name: 'play', game: 'beginning-sounds', focus: undefined });
  });
  it('parses a focus query param', () => {
    expect(parseHash('#/play/ending-sounds?focus=sound:last:t')).toEqual({
      name: 'play', game: 'ending-sounds', focus: 'sound:last:t',
    });
  });
});
