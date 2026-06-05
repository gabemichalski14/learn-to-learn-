import type { AudioPlayer } from './audioPlayer';
import type { WordItem } from '../domain/types';

/**
 * DEV PLACEHOLDER. Uses browser TTS so there is audible feedback while building.
 * TTS mispronounces isolated phonemes (it is NOT Barton-correct) — this is
 * intentionally temporary and replaced by recorded human audio in Plan 2.
 */
export function createStubAudioPlayer(): AudioPlayer {
  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        globalThis.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 0.8;
        u.onend = () => resolve();
        u.onerror = () => resolve();
        globalThis.speechSynthesis.speak(u);
        // jsdom never fires onend; resolve defensively next tick.
        setTimeout(resolve, 0);
      } catch {
        resolve();
      }
    });
  }

  return {
    playSound: (soundId: string) => speak(soundId),
    playWord: (item: WordItem) => speak(item.label),
  };
}
