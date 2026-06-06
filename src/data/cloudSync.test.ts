import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./cloud', () => ({
  currentCenterId: vi.fn().mockResolvedValue('C1'),
  upsertLearner: vi.fn().mockResolvedValue('cloud-L1'),
  insertSession: vi.fn().mockResolvedValue(undefined),
  insertSkillEvents: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../profiles', () => ({ getLearner: () => ({ id: 'L1', name: 'Mia', color: '#000' }) }));
vi.mock('./supabase', () => ({ getSupabase: vi.fn().mockResolvedValue({ auth: { getSession: async () => ({ data: { session: { user: {} } } }) } }) }));

import * as cloud from './cloud';
import { logSkillEvent, flushOutbox } from './cloudSync';
import { allItems } from './outbox';

beforeEach(() => localStorage.clear());

describe('cloudSync outbox integration', () => {
  it('logSkillEvent enqueues; flushOutbox pushes + drains when signed in', async () => {
    logSkillEvent('L1', { skillKey: 'sound:medial:a', correct: true, at: 123 });
    expect(allItems()).toHaveLength(1);
    await flushOutbox();
    expect(cloud.insertSkillEvents).toHaveBeenCalledTimes(1);
    expect(allItems()).toHaveLength(0);
  });
});
