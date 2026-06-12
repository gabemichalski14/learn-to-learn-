import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { hasScreened, pacingOf } from '../../mastery/screener';
import { SoundGardenWelcome } from './SoundGardenWelcome';

vi.mock('../../audio/recordedAudioPlayer', () => ({
  createRecordedAudioPlayer: () => ({
    playSound: () => Promise.resolve(),
    playWord: () => Promise.resolve(),
    narrate: () => Promise.resolve(),
  }),
}));
vi.mock('../../audio/sfx', () => ({ sfx: { tap() {}, tick() {}, correct() {}, wrong() {}, win() {} } }));

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

function startButton(container: HTMLElement): HTMLButtonElement {
  return Array.from(container.querySelectorAll('button')).find((b) => /Let's go/.test(b.textContent ?? ''))!;
}

describe('SoundGardenWelcome', () => {
  it('runs the board in order from the intro and saves a pacing result', () => {
    vi.useFakeTimers();
    const { container } = render(<SoundGardenWelcome learnerId="w" />);
    act(() => startButton(container).click());

    const cells = Array.from(container.querySelectorAll('.gd-ran-cell')) as HTMLButtonElement[];
    expect(cells).toHaveLength(20);

    // Tap every cell in order, flushing the deferred timing capture after each.
    cells.forEach((cell) => {
      act(() => cell.click());
      act(() => vi.advanceTimersByTime(2));
    });

    expect(container.textContent).toContain('waking up'); // warm finish, no score
    expect(hasScreened('w')).toBe(true);
    expect(['gentle', 'standard', 'springboard']).toContain(pacingOf('w'));
  });

  it('enforces serial order — an out-of-order tap is ignored', () => {
    vi.useFakeTimers();
    const { container } = render(<SoundGardenWelcome learnerId="w2" />);
    act(() => startButton(container).click());

    const cells = Array.from(container.querySelectorAll('.gd-ran-cell')) as HTMLButtonElement[];
    act(() => cells[7].click()); // not the expected first cell
    act(() => vi.advanceTimersByTime(2));

    expect(cells[0].className).toContain('is-next'); // still waiting on the first
    expect(hasScreened('w2')).toBe(false);
  });
});
