import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./cloud', () => ({
  listLearners: vi.fn().mockResolvedValue([
    { id: 'cloud-A', display_name: 'Mia', color: '#111', archived: false },
    { id: 'cloud-B', display_name: 'Sam', color: '#222', archived: false },
  ]),
}));
vi.mock('./supabase', () => ({ getSupabase: vi.fn().mockResolvedValue({ auth: { getSession: async () => ({ data: { session: {} } }) } }) }));

import { reconcileRoster } from './identity';
import { loadLearners, addLearner, setCloudId } from '../profiles';

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

  it('refreshes the name + color of an already-linked profile (rename propagates)', async () => {
    const l = addLearner('Old Name', { color: '#000' });
    setCloudId(l.id, 'cloud-A');
    await reconcileRoster();
    const updated = loadLearners().find((x) => x.cloudId === 'cloud-A');
    expect(updated?.name).toBe('Mia');
    expect(updated?.color).toBe('#111');
  });

  it('prunes local profiles not in the roster (other accounts + local-only ghosts)', async () => {
    addLearner('Guest'); // local-only, no cloudId
    const stale = addLearner('Ex-student');
    setCloudId(stale.id, 'cloud-ZZZ'); // cloud-linked but NOT in this roster
    await reconcileRoster();
    const list = loadLearners();
    expect(list.some((l) => l.name === 'Guest')).toBe(false);
    expect(list.some((l) => l.cloudId === 'cloud-ZZZ')).toBe(false);
    // the actual roster members are present
    expect(list.some((l) => l.cloudId === 'cloud-A')).toBe(true);
    expect(list.some((l) => l.cloudId === 'cloud-B')).toBe(true);
    expect(list).toHaveLength(2);
  });
});
