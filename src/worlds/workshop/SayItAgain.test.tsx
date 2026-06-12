import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { SayItAgain } from './SayItAgain';

// Mock the audio + sfx seams so the flow runs cleanly headless (no clip probes).
vi.mock('../../audio/recordedAudioPlayer', () => ({
  createRecordedAudioPlayer: () => ({
    playSound: () => Promise.resolve(),
    playWord: () => Promise.resolve(),
    narrate: () => Promise.resolve(),
  }),
}));
vi.mock('../../audio/sfx', () => ({ sfx: { tap() {}, correct() {}, wrong() {}, win() {} }, isMuted: () => false, setMuted: () => {} }));

beforeEach(() => localStorage.clear());
afterEach(() => vi.useRealTimers());

describe('SayItAgain — echo-reading flow', () => {
  it('renders a decodable sentence, reads it word-by-word in order, then gates on a 3-option comprehension check', () => {
    vi.useFakeTimers();
    const { container } = render(<SayItAgain learnerId="t" />);

    const sentence = container.querySelector('.wk-sentence');
    expect(sentence).not.toBeNull();
    const words = Array.from(sentence!.querySelectorAll('button')) as HTMLButtonElement[];
    expect(words.length).toBeGreaterThanOrEqual(3);

    // read-in-order: only the first word is tappable to start
    expect(words[0].disabled).toBe(false);
    expect(words[words.length - 1].disabled).toBe(true);

    // no comprehension options until the sentence has been read
    expect(container.querySelectorAll('.wk-opt')).toHaveLength(0);

    // read each word left-to-right
    for (const w of words) act(() => w.click());
    act(() => vi.advanceTimersByTime(400)); // the short beat before the check phase

    // the comprehension gate appears with exactly three picture choices
    expect(container.textContent).toContain('Which one is it about?');
    expect(container.querySelectorAll('.wk-opt')).toHaveLength(3);
  });
});
