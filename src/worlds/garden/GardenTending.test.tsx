import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { recordItem } from '../../mastery/mastery';
import { enrollMasteredSkills } from '../../world/memory/reviewStore';
import { saveScreener, type Pacing } from '../../mastery/screener';
import { GardenTending } from './GardenTending';

vi.mock('../../audio/recordedAudioPlayer', () => ({
  createRecordedAudioPlayer: () => ({
    playSound: () => Promise.resolve(),
    playWord: () => Promise.resolve(),
    narrate: () => Promise.resolve(),
  }),
}));
vi.mock('../../audio/sfx', () => ({ sfx: { tap() {}, correct() {}, wrong() {}, win() {} } }));

const L = 'tend-test';
beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

function masterSkill(skill: string): void {
  for (let i = 0; i < 5; i++) recordItem(L, skill, true);
}

describe('GardenTending', () => {
  it('surfaces a due sound as a retrieval trial (hear it → tap the letter)', () => {
    masterSkill('sound:first:m'); // mastered → enrollable
    enrollMasteredSkills(L); // creates a review item due next session
    const { container } = render(<GardenTending learnerId={L} />);
    const opts = Array.from(container.querySelectorAll('.gd-tend-opt')) as HTMLButtonElement[];
    expect(opts.length).toBeGreaterThanOrEqual(3);
    expect(opts.some((b) => b.textContent === 'm')).toBe(true); // the answer is offered
  });

  it('records the answer and reaches the no-shame "tended" state', () => {
    vi.useFakeTimers();
    masterSkill('sound:first:m');
    enrollMasteredSkills(L);
    const { container } = render(<GardenTending learnerId={L} />);
    const m = (Array.from(container.querySelectorAll('.gd-tend-opt')) as HTMLButtonElement[]).find((b) => b.textContent === 'm')!;
    act(() => m.click());
    act(() => vi.advanceTimersByTime(1000));
    expect(container.textContent).toContain('Garden tended');
  });

  it('shows the blooming state when nothing is due (no shame, no empty quiz)', () => {
    const { container } = render(<GardenTending learnerId={L} />);
    expect(container.textContent).toContain('blooming');
  });

  it('flexes the review dose to the learner pacing (gentle shorter than springboard)', () => {
    const letters = ['m', 's', 't', 'p', 'n', 'b', 'f', 'r'];
    function seed(id: string, pacing: Pacing) {
      letters.forEach((c) => { for (let i = 0; i < 5; i++) recordItem(id, `sound:first:${c}`, true); });
      enrollMasteredSkills(id);
      saveScreener(id, { ranMsPerItem: 1000, takenAt: new Date().toISOString(), pacing });
    }
    seed('paceG', 'gentle');
    seed('paceS', 'springboard');
    const g = render(<GardenTending learnerId="paceG" />);
    const s = render(<GardenTending learnerId="paceS" />);
    const gentleDots = g.container.querySelectorAll('.gd-tend-progress i').length;
    const springDots = s.container.querySelectorAll('.gd-tend-progress i').length;
    expect(gentleDots).toBeLessThanOrEqual(4); // gentle = shorter set (below the standard 6)
    expect(springDots).toBeGreaterThan(gentleDots); // springboard surfaces a fuller set
  });
});
