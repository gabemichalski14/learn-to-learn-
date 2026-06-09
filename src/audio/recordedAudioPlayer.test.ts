import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRecordedAudioPlayer } from './recordedAudioPlayer';
import { setMuted } from './sfx';
import type { WordItem } from '../domain/types';

const word = (id: string): WordItem =>
  ({ id, label: id, target: 'beginning', soundId: id[0], emoji: '🔤' } as unknown as WordItem);

describe('recordedAudioPlayer', () => {
  let plays: string[];
  let played: number;

  beforeEach(() => {
    plays = [];
    played = 0;
    // Minimal Audio stub that records the src and resolves play() (clip "exists").
    class FakeAudio {
      src: string; preload = ''; currentTime = 0; onerror: (() => void) | null = null;
      constructor(src: string) { this.src = src; plays.push(src); }
      play() { played += 1; return Promise.resolve(); }
    }
    vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
    setMuted(false);
  });
  afterEach(() => { vi.unstubAllGlobals(); setMuted(false); });

  it('plays recorded clips from the right paths', async () => {
    const a = createRecordedAudioPlayer();
    await a.playSound('m');
    await a.playWord(word('cat'));
    expect(plays).toContain('/audio/sounds/m.mp3');
    expect(plays).toContain('/audio/words/cat.mp3');
    expect(played).toBe(2);
  });

  it('slugifies ids into safe filenames', async () => {
    const a = createRecordedAudioPlayer();
    await a.playWord(word('Ice Cream'));
    expect(plays).toContain('/audio/words/ice-cream.mp3');
  });

  it('honours the global mute (no clip constructed)', async () => {
    setMuted(true);
    const a = createRecordedAudioPlayer();
    await a.playSound('m');
    expect(plays).toHaveLength(0);
    expect(played).toBe(0);
  });

  it('exposes the full AudioPlayer interface', () => {
    const a = createRecordedAudioPlayer();
    expect(typeof a.playSound).toBe('function');
    expect(typeof a.playWord).toBe('function');
    expect(typeof a.narrate).toBe('function');
  });
});
