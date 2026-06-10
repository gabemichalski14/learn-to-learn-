import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRecordedAudioPlayer } from './recordedAudioPlayer';
import { setMuted } from './sfx';
import type { WordItem } from '../domain/types';

const word = (id: string): WordItem =>
  ({ id, label: id, target: 'beginning', soundId: id[0], emoji: '🔤' } as unknown as WordItem);

// The player HEAD-probes a clip before playing (a missing clip on an SPA host
// returns 200 + index.html, so we require a real audio content-type). Let the
// probe + the deferred play() settle.
const flush = () => new Promise((r) => setTimeout(r, 0));

describe('recordedAudioPlayer', () => {
  let plays: string[];
  let played: number;

  function stubFetch(contentType: string, ok = true) {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok, headers: { get: () => contentType } })));
  }

  beforeEach(() => {
    plays = [];
    played = 0;
    class FakeAudio {
      src: string; preload = ''; currentTime = 0;
      constructor(src: string) { this.src = src; plays.push(src); }
      play() { played += 1; return Promise.resolve(); }
    }
    vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
    stubFetch('audio/mpeg'); // default: the clip exists
    setMuted(false);
  });
  afterEach(() => { vi.unstubAllGlobals(); setMuted(false); });

  it('plays recorded clips from the right paths (when a real clip exists)', async () => {
    const a = createRecordedAudioPlayer();
    await a.playSound('m');
    await a.playWord(word('cat'));
    await flush();
    expect(plays).toContain('/audio/sounds/m.mp3');
    expect(plays).toContain('/audio/words/cat.mp3');
    expect(played).toBe(2);
  });

  it('slugifies ids into safe filenames', async () => {
    const a = createRecordedAudioPlayer();
    await a.playWord(word('Ice Cream'));
    await flush();
    expect(plays).toContain('/audio/words/ice-cream.mp3');
  });

  it('does NOT play the SPA fallback as audio when a clip is missing (→ TTS)', async () => {
    stubFetch('text/html'); // missing clip on an SPA host: 200 + index.html
    const a = createRecordedAudioPlayer();
    await a.playSound('zz');
    await flush();
    expect(plays).toHaveLength(0); // never tried to play HTML as audio
    expect(played).toBe(0);
  });

  it('honours the global mute (no probe, no clip constructed)', async () => {
    setMuted(true);
    const a = createRecordedAudioPlayer();
    await a.playSound('m');
    await flush();
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
