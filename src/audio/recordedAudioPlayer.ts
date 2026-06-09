import type { AudioPlayer } from './audioPlayer';
import type { WordItem } from '../domain/types';
import { createStubAudioPlayer } from './stubAudioPlayer';
import { isMuted } from './sfx';

/**
 * The REAL audio path. Plays recorded human-voice clips when present and falls
 * back to the TTS stub when a clip is missing — so the app works fully before any
 * recordings exist, and upgrades clip-by-clip as files land in `public/audio/`.
 *
 *   sounds  → /audio/sounds/<soundId>.mp3   (e.g. m.mp3, t.mp3, a.mp3)
 *   words   → /audio/words/<label>.mp3      (keyed by the spoken WORD, so the same
 *             word across packs — e.g. ending-pack "e-cat" and "cat" — shares one
 *             cat.mp3 clip; record each word just once)
 *   narrate → TTS (story lines aren't recorded)
 *
 * Why this matters (Barton): TTS mispronounces isolated phonemes, so recorded
 * clips are the accurate teaching signal for an audio-first, no-letters Level 1.
 * This seam lets the user drop clips in with zero code changes (see
 * docs/audio-recording-checklist.md).
 */
const SOUNDS = '/audio/sounds/';
const WORDS = '/audio/words/';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

export function createRecordedAudioPlayer(): AudioPlayer {
  const tts = createStubAudioPlayer();
  const missing = new Set<string>();             // urls known to 404 → go straight to TTS
  const pool = new Map<string, HTMLAudioElement>(); // reuse Audio elements across replays

  function tryPlay(url: string, fallback: () => void): Promise<void> {
    if (isMuted()) return Promise.resolve();
    if (missing.has(url) || typeof Audio === 'undefined') { fallback(); return Promise.resolve(); }
    try {
      let a = pool.get(url);
      if (!a) { a = new Audio(url); a.preload = 'auto'; pool.set(url, a); }
      let fell = false;
      const fall = () => { if (fell) return; fell = true; missing.add(url); pool.delete(url); fallback(); };
      a.onerror = fall;
      try { a.currentTime = 0; } catch { /* not yet seekable — fine */ }
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(fall);
    } catch {
      fallback();
    }
    return Promise.resolve();
  }

  return {
    playSound: (soundId: string) => tryPlay(`${SOUNDS}${slug(soundId)}.mp3`, () => { void tts.playSound(soundId); }),
    playWord: (item: WordItem) => tryPlay(`${WORDS}${slug(item.label)}.mp3`, () => { void tts.playWord(item); }),
    narrate: (text: string) => tts.narrate(text),
  };
}
