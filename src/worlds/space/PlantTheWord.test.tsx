import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { PlantTheWord } from './PlantTheWord';

vi.mock('../../audio/recordedAudioPlayer', () => ({
  createRecordedAudioPlayer: () => ({
    playSound: () => Promise.resolve(),
    playWord: () => Promise.resolve(),
    narrate: () => Promise.resolve(),
  }),
}));
vi.mock('../../audio/sfx', () => ({
  sfx: { tap() {}, correct() {}, wrong() {}, win() {} },
  isMuted: () => false,
  setMuted: () => {},
}));

beforeEach(() => localStorage.clear());

describe('PlantTheWord', () => {
  it('highlights the heart letters in the learn phase, then accepts spelling', () => {
    const { container } = render(<PlantTheWord learnerId="t" />);

    // learn phase: the irregular "heart" letters are highlighted
    expect(container.querySelectorAll('.hw-letter--heart').length).toBeGreaterThan(0);
    const word = Array.from(container.querySelectorAll('.hw-letter')).map((s) => s.textContent).join('');
    expect(word.length).toBeGreaterThanOrEqual(2);

    // "Plant it" → spell-from-memory phase
    act(() => (container.querySelector('.hw-plant') as HTMLButtonElement).click());
    expect(container.querySelectorAll('.ss-slot')).toHaveLength(word.length);
    expect(container.querySelectorAll('.wb-key')).toHaveLength(26);

    // tapping the first correct letter fills the first slot
    const firstKey = (Array.from(container.querySelectorAll('.wb-key')) as HTMLButtonElement[]).find((b) => b.textContent === word[0])!;
    act(() => firstKey.click());
    expect(container.querySelectorAll('.ss-slot.is-filled')).toHaveLength(1);
  });
});
