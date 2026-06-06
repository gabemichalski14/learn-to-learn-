import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enqueue, allItems, flush, MAX_OUTBOX } from './outbox';

beforeEach(() => localStorage.clear());

describe('outbox', () => {
  it('persists enqueued items', () => {
    enqueue({ kind: 'skill_event', localLearnerId: 'L1', payload: { skillKey: 's', correct: true, at: 1 } });
    expect(allItems()).toHaveLength(1);
    expect(allItems()[0].tries).toBe(0);
  });

  it('removes items the writer accepts, keeps + counts tries on failure', async () => {
    enqueue({ kind: 'session', localLearnerId: 'L1', payload: { game: 'g' } });
    enqueue({ kind: 'session', localLearnerId: 'L1', payload: { game: 'h' } });
    const writer = vi.fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    await flush(writer);
    expect(writer).toHaveBeenCalledTimes(2);
    const left = allItems();
    expect(left).toHaveLength(1);
    expect(left[0].tries).toBe(1);
  });

  it('drops oldest beyond MAX_OUTBOX', () => {
    for (let i = 0; i < MAX_OUTBOX + 5; i++) enqueue({ kind: 'skill_event', localLearnerId: 'L1', payload: { skillKey: 's', correct: true, at: i } });
    expect(allItems().length).toBe(MAX_OUTBOX);
    expect((allItems()[0].payload as { at: number }).at).toBe(5);
  });
});
