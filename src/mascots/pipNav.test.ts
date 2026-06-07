import { describe, it, expect } from 'vitest';
import { matchDestination, PIP_DESTINATIONS } from './pipNav';

describe('matchDestination', () => {
  it('routes natural requests to the right place', () => {
    expect(matchDestination('take me to my garden')?.to).toBe('#/levels');
    expect(matchDestination('I want to play a game')?.to).toBe('#/games');
    expect(matchDestination('show me the leaderboard')?.to).toBe('#/leaderboard');
    expect(matchDestination('how is my progress?')?.to).toBe('#/profile');
    expect(matchDestination('go home please')?.to).toBe('#/');
  });

  it('returns null when nothing is recognized', () => {
    expect(matchDestination('purple monkey dishwasher')).toBeNull();
    expect(matchDestination('')).toBeNull();
    expect(matchDestination('123 456')).toBeNull();
  });

  it('every destination is reachable by at least one of its own keys', () => {
    for (const dest of PIP_DESTINATIONS) {
      expect(matchDestination(dest.keys[0])?.to).toBe(dest.to);
    }
  });
});
