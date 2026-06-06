import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./cloud', () => ({
  listLearners: vi.fn().mockResolvedValue([
    { id: 'cloud-A', display_name: 'Mia', color: '#111', archived: false },
    { id: 'cloud-B', display_name: 'Sam', color: '#222', archived: false },
  ]),
}));
vi.mock('./supabase', () => ({ getSupabase: vi.fn().mockResolvedValue({ auth: { getSession: async () => ({ data: { session: {} } }) } }) }));

import { reconcileRoster } from './identity';
import { loadLearners } from '../profiles';

beforeEach(() => localStorage.clear());

describe('reconcileRoster', () => {
  it('creates local profiles for cloud learners with cloudId set', async () => {
    await reconcileRoster();
    const list = loadLearners();
    const mia = list.find((l) => l.cloudId === 'cloud-A');
    expect(mia?.name).toBe('Mia');
    expect(list.some((l) => l.cloudId === 'cloud-B')).toBe(true);
  });

  it('is idempotent (no duplicates on a second run)', async () => {
    await reconcileRoster();
    await reconcileRoster();
    expect(loadLearners().filter((l) => l.cloudId === 'cloud-A')).toHaveLength(1);
  });
});
