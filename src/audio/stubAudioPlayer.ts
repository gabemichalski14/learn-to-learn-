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
    playSound: (soundId: string) => speak(soundId),
    playWord: (item: WordItem) => speak(item.label),
    narrate: (text: string) => speak(text),
  };
}
