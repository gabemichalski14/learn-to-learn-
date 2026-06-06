import { describe, it, expect } from 'vitest';
import { rankAreas } from './mastery';

describe('rankAreas', () => {
  it('returns rated weak skills weakest-first, capped at n', () => {
    const map = {
      weak: { attempts: 6, correct: 1, recent: [0, 0, 1, 0, 0, 0], lastSeen: 2 },
      okay: { attempts: 6, correct: 6, recent: [1, 1, 1, 1, 1, 1], lastSeen: 1 },
      unrated: { attempts: 2, correct: 0, recent: [0, 0], lastSeen: 3 },
    };
    const out = rankAreas(map, 3);
    expect(out.map((a) => a.skillKey)).toEqual(['weak']);
  });
});
