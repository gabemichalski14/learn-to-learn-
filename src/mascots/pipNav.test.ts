import { describe, it, expect } from 'vitest';
import { matchDestination, destById, PIP_DESTINATIONS, searchDestinations } from './pipNav';

describe('searchDestinations (type-ahead)', () => {
  it('suggests by partial label or keyword, best-first', () => {
    expect(searchDestinations('lead')[0]?.id).toBe('leaderboard'); // label prefix
    expect(searchDestinations('gard')[0]?.id).toBe('garden');      // label/keyword
    expect(searchDestinations('rocket').some((d) => d.id === 'space')).toBe(true); // keyword
  });
  it('returns nothing for an empty query (Pip never shows a place grid)', () => {
    expect(searchDestinations('')).toEqual([]);
    expect(searchDestinations('   ')).toEqual([]);
  });
});

describe('matchDestination', () => {
  it('routes natural requests to the right place', () => {
    // The worlds route to their ACTUAL hubs, not the generic Levels list.
    expect(matchDestination('take me to my garden')?.to).toBe('#/level/1');
    expect(matchDestination('blast off to space')?.to).toBe('#/level/2');
    expect(matchDestination('I want to play a game')?.to).toBe('#/games');
    expect(matchDestination('show me the leaderboard')?.to).toBe('#/leaderboard');
    expect(matchDestination('how is my progress?')?.to).toBe('#/profile');
    expect(matchDestination('show me the map of worlds')?.to).toBe('#/levels');
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

  // Reliability contract: the place Pip NAMES is the place he GOES.
  it('asking for a destination by its own label routes to that destination', () => {
    for (const dest of PIP_DESTINATIONS) {
      expect(matchDestination(dest.label)?.id).toBe(dest.id);
    }
  });

  it('keyword sets are disjoint, so routing is unambiguous', () => {
    const seen = new Map<string, string>();
    for (const dest of PIP_DESTINATIONS) {
      for (const key of dest.keys) {
        expect(seen.has(key)).toBe(false); // no key belongs to two destinations
        seen.set(key, dest.id);
      }
    }
  });
});

describe('destById', () => {
  it('resolves every destination id and rejects unknowns', () => {
    for (const dest of PIP_DESTINATIONS) {
      expect(destById(dest.id)).toBe(dest);
    }
    expect(destById('nope')).toBeNull();
  });
});
