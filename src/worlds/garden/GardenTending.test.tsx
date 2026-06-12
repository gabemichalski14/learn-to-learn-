import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { recordItem } from '../../mastery/mastery';
import { enrollMasteredSkills } from '../../world/memory/reviewStore';
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
});
