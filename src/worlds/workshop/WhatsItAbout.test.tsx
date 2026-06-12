import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { WhatsItAbout } from './WhatsItAbout';

vi.mock('../../audio/recordedAudioPlayer', () => ({
  createRecordedAudioPlayer: () => ({
    playSound: () => Promise.resolve(),
    playWord: () => Promise.resolve(),
    narrate: () => Promise.resolve(),
  }),
}));
vi.mock('../../audio/sfx', () => ({ sfx: { tap() {}, correct() {}, wrong() {}, win() {} }, isMuted: () => false, setMuted: () => {} }));

beforeEach(() => localStorage.clear());

describe('WhatsItAbout — comprehension game', () => {
  it('shows a decodable sentence to read and ≥3 picture choices to pick from', () => {
    const { container } = render(<WhatsItAbout learnerId="t" />);
    const sentence = container.querySelector('.wk-read-sentence');
    expect(sentence).not.toBeNull();
    expect((sentence!.textContent ?? '').length).toBeGreaterThan(0);
    // a comprehension prompt + same-category picture options
    expect(container.textContent).toMatch(/about|where/i);
    expect(container.querySelectorAll('.wk-opt').length).toBeGreaterThanOrEqual(3);
  });
});
