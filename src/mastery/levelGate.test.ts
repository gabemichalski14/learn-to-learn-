import { describe, it, expect, beforeEach } from 'vitest';
import { recordItem } from './mastery';
import { levelGate, isLevelReady, isLevelPassed, isLevelUnlocked, isGameUnlocked, PASS_BAR } from './levelGate';
import { setLevelOverride, setGameOverride } from './tutorOverrides';
import { markCheckpointPassed } from './levelProgress';

const L = 'gate-learner';
beforeEach(() => { localStorage.clear(); });

/** Drive a skill to a chosen recent-accuracy with enough attempts to be rated. */
function drill(skill: string, correct: number, wrong: number) {
  for (let i = 0; i < wrong; i++) recordItem(L, skill, false);
  for (let i = 0; i < correct; i++) recordItem(L, skill, true);
}

describe('level gate', () => {
  it('Level 1 is always unlocked; Level 2 starts locked', () => {
    expect(isLevelUnlocked(L, 1)).toBe(true);
    expect(isLevelUnlocked(L, 2)).toBe(false);
  });

  it('Level 1 unrated → not ready for the checkpoint', () => {
    expect(isLevelReady(L, 1)).toBe(false);
  });

  it('95% mastery makes the checkpoint available, but Level 2 unlocks only once it is PASSED', () => {
    drill('pa:segment', 6, 0); // all correct → recency score 1.0
    const g = levelGate(L, 1);
    expect(g.mastery).toBeGreaterThanOrEqual(PASS_BAR);
    expect(g.ready).toBe(true);          // checkpoint now available
    expect(isLevelPassed(L, 1)).toBe(false); // ...but not passed yet
    expect(isLevelUnlocked(L, 2)).toBe(false);
    markCheckpointPassed(L, 1);          // clear the post-test
    expect(isLevelPassed(L, 1)).toBe(true);
    expect(isLevelUnlocked(L, 2)).toBe(true);
  });

  it('Level 1 below the bar is not ready (no checkpoint, no unlock)', () => {
    drill('pa:segment', 3, 5); // weak recent accuracy
    expect(isLevelReady(L, 1)).toBe(false);
    expect(isLevelUnlocked(L, 2)).toBe(false);
  });

  it('Level 2 readiness needs breadth (≥3 rated sound skills) AND all ≥95%', () => {
    drill('sound:first:m', 6, 0);
    drill('sound:last:t', 6, 0);
    expect(isLevelReady(L, 2)).toBe(false); // only 2 skills rated
    drill('sound:medial:a', 6, 0);
    expect(isLevelReady(L, 2)).toBe(true); // now 3 targets, all solid
  });

  it('one weak L2 skill blocks readiness (gate = the weakest)', () => {
    drill('sound:first:m', 6, 0);
    drill('sound:last:t', 6, 0);
    drill('sound:medial:a', 2, 6); // shaky
    expect(isLevelReady(L, 2)).toBe(false);
  });
});

describe('tutor overrides', () => {
  it('tutor unlock opens a level the mastery-gate would keep locked', () => {
    expect(isLevelUnlocked(L, 2)).toBe(false);
    setLevelOverride(L, 2, 'unlock');
    expect(isLevelUnlocked(L, 2)).toBe(true);
    setLevelOverride(L, 2, null); // back to auto
    expect(isLevelUnlocked(L, 2)).toBe(false);
  });

  it('tutor lock closes a level that would be open', () => {
    expect(isLevelUnlocked(L, 1)).toBe(true);
    setLevelOverride(L, 1, 'lock');
    expect(isLevelUnlocked(L, 1)).toBe(false);
  });

  it('a tutor game-lock blocks just that game within an open level', () => {
    expect(isGameUnlocked(L, 'tap-it-out')).toBe(true);
    setGameOverride(L, 'tap-it-out', 'lock');
    expect(isGameUnlocked(L, 'tap-it-out')).toBe(false);
    setGameOverride(L, 'tap-it-out', null);
    expect(isGameUnlocked(L, 'tap-it-out')).toBe(true);
  });

  it('a locked level also makes its games unplayable', () => {
    setLevelOverride(L, 1, 'lock');
    expect(isGameUnlocked(L, 'tap-it-out')).toBe(false);
  });
});
