import { describe, it, expect, beforeEach } from 'vitest';
import { parseHash, navigate, goBack } from './router';

describe('navigation goes where the label says', () => {
  beforeEach(() => { window.location.hash = ''; });

  it('navigate sets the hash to exactly the target', () => {
    navigate('#/levels');
    expect(window.location.hash).toBe('#/levels');
  });

  it('goBack lands on its labelled destination — never ping-pongs to the previous page', () => {
    // Regression: a level hub and the Village both have a "← Home" button. With
    // history-style back, hub → village → "← Home" bounced back to the hub (round
    // and round, going nowhere). A labelled button must go where it says.
    navigate('#/village');
    navigate('#/level/3');
    goBack('#/');
    expect(window.location.hash).toBe('#/'); // Home — not '#/village'
  });
});

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
