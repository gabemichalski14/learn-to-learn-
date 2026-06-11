import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStubAudioPlayer, sayPhoneme } from './stubAudioPlayer';
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

describe('sayPhoneme (TTS pronounces the SOUND, not the letter name)', () => {
  it('maps stop consonants to a blendable form, not the letter name', () => {
    expect(sayPhoneme('k')).toBe('kuh');
    expect(sayPhoneme('t')).toBe('tuh');
    expect(sayPhoneme('b')).toBe('buh');
  });
  it('holds continuant consonants', () => {
    expect(sayPhoneme('s')).toBe('sss');
    expect(sayPhoneme('m')).toBe('mmm');
  });
  it('blends a CVC into a word-ish sequence (cat → kuh·aah·tuh)', () => {
    expect(['k', 'a', 't'].map(sayPhoneme)).toEqual(['kuh', 'aah', 'tuh']);
  });
  it('is case-insensitive and falls through for unknown ids', () => {
    expect(sayPhoneme('K')).toBe('kuh');
    expect(sayPhoneme('zzz-unknown')).toBe('zzz-unknown');
  });
});
