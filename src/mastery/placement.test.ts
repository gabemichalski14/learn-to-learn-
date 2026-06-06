import { describe, it, expect, beforeEach } from 'vitest';
import { getPlacement, setPlacement, nextUp } from './placement';

const L = 'plc-learner';
beforeEach(() => { localStorage.clear(); });

describe('placement', () => {
  it('defaults to Level 1, Lesson 1', () => {
    expect(getPlacement(L)).toEqual({ level: 1, lesson: 1 });
  });
  it('round-trips through setPlacement', () => {
    setPlacement(L, 2, 2);
    expect(getPlacement(L)).toEqual({ level: 2, lesson: 2 });
  });
  it('nextUp lists upcoming lessons then the next level', () => {
    const up = nextUp(2, 2); // Level 2 has 5 lessons
    expect(up.length).toBeGreaterThan(0);
    expect(up[0]).toMatchObject({ kind: 'lesson', level: 2, lesson: 3 });
    expect(up.some((u) => u.kind === 'level' && u.level === 3)).toBe(true);
  });
  it('nextUp at the last lesson points to the next level', () => {
    const up = nextUp(2, 5);
    expect(up[0]).toMatchObject({ kind: 'level', level: 3 });
  });
});
