import { describe, it, expect, beforeEach, vi } from 'vitest';

const signedInRef = { value: false };
vi.mock('./supabase', () => ({
  getSupabase: vi.fn().mockImplementation(async () =>
    signedInRef.value ? { auth: { getSession: async () => ({ data: { session: {} } }) } } : null),
}));
vi.mock('./cloud', () => ({
  listSessions: vi.fn().mockResolvedValue([{ id: 'c1', game: 'g', ended_at: '2026-01-01T00:00:00Z', duration_ms: 1000, rounds: 1, items: 6, wrong_attempts: 0, accuracy: 1 }]),
  listSkillEvents: vi.fn().mockResolvedValue([{ skill_key: 's', correct: true, at: '2026-01-01T00:00:00Z' }]),
}));

import { getMastery } from './dataSource';
import { recordItem, scoreOf } from '../mastery/mastery';

beforeEach(() => { localStorage.clear(); signedInRef.value = false; });

describe('dataSource.getMastery', () => {
  it('reads local mastery when signed out', async () => {
    recordItem('L1', 's', false);
    const m = await getMastery({ id: 'L1', name: 'x', color: '#000', createdAt: '' });
    expect(m['s'].attempts).toBe(1);
  });

  it('reads cloud events when signed in + cloudId present', async () => {
    signedInRef.value = true;
    const m = await getMastery({ id: 'L1', cloudId: 'cloud-1', name: 'x', color: '#000', createdAt: '' });
    expect(m['s'].attempts).toBe(1);
    expect(scoreOf(m['s'])).toBeCloseTo(1);
  });
});
