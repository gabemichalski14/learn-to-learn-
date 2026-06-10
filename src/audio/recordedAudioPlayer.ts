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
  const exists = new Map<string, boolean>();        // url -> known to exist (HEAD-probed, cached)
  const pool = new Map<string, HTMLAudioElement>();  // reuse Audio elements across replays

  function playClip(url: string): void {
    if (isMuted()) return;
    let a = pool.get(url);
    if (!a) { a = new Audio(url); a.preload = 'auto'; pool.set(url, a); }
    try { a.currentTime = 0; } catch { /* not yet seekable — fine */ }
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => { /* best-effort */ });
  }

  // Decide once per url whether a recorded clip exists (HEAD probe, cached), then
  // play it or fall back to TTS. Relying on an <audio> 404 to fire `error`/reject
  // was flaky — some browsers neither errored nor rejected, so the TTS fallback
  // never ran and the word was silent. The probe makes the fallback reliable.
  function tryPlay(url: string, fallback: () => void): Promise<void> {
    if (isMuted()) return Promise.resolve();
    if (typeof Audio === 'undefined' || typeof fetch === 'undefined') { fallback(); return Promise.resolve(); }
    const known = exists.get(url);
    if (known === true) { playClip(url); return Promise.resolve(); }
    if (known === false) { fallback(); return Promise.resolve(); }
    fetch(url, { method: 'HEAD' })
      .then((r) => {
        // A missing clip on an SPA host returns 200 + index.html, so `ok` isn't
        // enough — require a real audio content-type, else fall back to TTS.
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        if (r.ok && !ct.includes('html') && !ct.includes('text')) { exists.set(url, true); playClip(url); }
        else { exists.set(url, false); fallback(); }
      })
      .catch(() => { exists.set(url, false); fallback(); });
    return Promise.resolve();
  }

  return {
    playSound: (soundId: string) => tryPlay(`${SOUNDS}${slug(soundId)}.mp3`, () => { void tts.playSound(soundId); }),
    playWord: (item: WordItem) => tryPlay(`${WORDS}${slug(item.label)}.mp3`, () => { void tts.playWord(item); }),
    narrate: (text: string) => tts.narrate(text),
  };
}
