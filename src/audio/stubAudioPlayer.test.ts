import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStubAudioPlayer } from './stubAudioPlayer';
import type { WordItem } from '../domain/types';

describe('stub audio player', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(globalThis.speechSynthesis, 'speak');
    vi.spyOn(globalThis.speechSynthesis, 'cancel');
  });

  it('speaks the word label when playing a word', async () => {
    const player = createStubAudioPlayer();
    const ball: WordItem = { id: 'ball', label: 'ball', beginningSound: 'b', emoji: '⚽' };
    await player.playWord(ball);
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it('speaks something for a phoneme id', async () => {
    const player = createStubAudioPlayer();
    await player.playSound('b');
    expect(globalThis.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });
});
