import { describe, it, expect, beforeEach } from 'vitest';
import { currentLearner, loadLearners, addLearner } from './profiles';

beforeEach(() => localStorage.clear());

describe('currentLearner — never auto-creates a student', () => {
  it('returns null on an empty roster and fabricates nothing', () => {
    expect(currentLearner()).toBeNull();
    expect(loadLearners()).toHaveLength(0); // calling it must NOT create a learner
    // calling again still creates nothing (no phantom "Player 1" accumulation)
    expect(currentLearner()).toBeNull();
    expect(loadLearners()).toHaveLength(0);
  });

  it('returns the current learner only once one is explicitly added', () => {
    const ada = addLearner('Ada', { setCurrent: true });
    expect(currentLearner()?.id).toBe(ada.id);
    expect(loadLearners()).toHaveLength(1);
  });
});
