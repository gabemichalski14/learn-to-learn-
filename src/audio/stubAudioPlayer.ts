import type { AudioPlayer } from './audioPlayer';
import type { WordItem } from '../domain/types';
import { isMuted } from './sfx';

/**
 * DEV PLACEHOLDER. Uses browser TTS so there is audible feedback while building.
 * TTS mispronounces isolated phonemes (it is NOT Barton-correct) — this is
 * intentionally temporary and replaced by recorded human audio in Plan 2.
 *
 * Hardened for real devices: respects the global mute, throttles rapid-fire
 * calls, and schedules the actual speak() off the click handler so a slow
 * macOS speech engine can never block the tap that triggered it. (Chrome on
 * macOS can wedge the renderer if speak()/cancel() are hammered synchronously.)
 */
/**
 * TTS reads a bare phoneme id as the LETTER NAME ("k" → "kay"), which never
 * blends into the word — so Blend It would teach the wrong thing. Map the common
 * phonemes to a spelling TTS pronounces as the SOUND instead. Consonants are
 * reliable; short vowels are approximate (recorded clips in /audio/sounds are the
 * accurate, Barton-correct path and always take precedence when present). Unknown
 * ids fall through unchanged.
 */
const PHONEME_SAY: Record<string, string> = {
  // stop consonants — a faint schwa is unavoidable in TTS, but far better than a letter name
  b: 'buh', d: 'duh', g: 'guh', k: 'kuh', p: 'puh', t: 'tuh', c: 'kuh',
  // continuant consonants — held, no schwa
  f: 'fff', l: 'lll', m: 'mmm', n: 'nnn', r: 'rrr', s: 'sss', v: 'vvv', z: 'zzz',
  h: 'huh', j: 'juh', w: 'wuh', y: 'yuh', x: 'ks', q: 'kwuh',
  // short vowels — approximate (best the engine can do without recordings)
  a: 'aah', e: 'eh', i: 'ih', o: 'awe', u: 'uh',
  // common digraphs
  sh: 'shh', ch: 'ch', th: 'thh', ng: 'ng', ck: 'kuh', wh: 'wuh',
};

/** TTS-pronounceable form of a phoneme id (the SOUND, not the letter name). */
export function sayPhoneme(soundId: string): string {
  return PHONEME_SAY[soundId.toLowerCase()] ?? soundId;
}

export function createStubAudioPlayer(): AudioPlayer {
  // Per-instance throttle: each game screen owns one player, so this damps a
  // flurry of taps within a screen without leaking state between screens.
  let lastAt = 0;
  let lastText = '';

  function speak(text: string): Promise<void> {
    // Honour the shared mute toggle — also lets users disable TTS entirely.
    if (isMuted()) return Promise.resolve();

    const now = Date.now();
    // Drop duplicate/too-rapid requests so a flurry of taps can't queue up a
    // backlog of utterances (the main cause of speech-engine back-pressure).
    if (text === lastText && now - lastAt < 250) return Promise.resolve();
    if (now - lastAt < 70) return Promise.resolve();
    lastAt = now;
    lastText = text;

    return new Promise((resolve) => {
      // Run the speech work asynchronously so it never blocks the gesture, and
      // resolve once dispatched (callers are fire-and-forget; we don't wait for
      // the utterance to finish playing).
      setTimeout(() => {
        try {
          const synth = globalThis.speechSynthesis;
          if (synth && typeof SpeechSynthesisUtterance !== 'undefined') {
            // Only cancel when actually speaking — an unconditional cancel right
            // before speak() is itself a known macOS-Chrome hang trigger.
            if (synth.speaking || synth.pending) synth.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 0.8;
            synth.speak(u);
          }
        } catch {
          /* ignore — audio is best-effort */
        }
        resolve();
      }, 0);
    });
  }

  return {
    // Phonemes go through the sound-map so TTS says the SOUND, not the letter name.
    playSound: (soundId: string) => speak(sayPhoneme(soundId)),
    playWord: (item: WordItem) => speak(item.label),
    narrate: (text: string) => speak(text),
  };
}
