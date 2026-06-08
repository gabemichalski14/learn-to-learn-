import type { WordItem } from '../domain/types';

/**
 * The one audio seam in the app. v1 uses a speechSynthesis stub; the recorded
 * human-voice player implements this same interface later — no call sites change.
 */
export interface AudioPlayer {
  playSound(soundId: string): Promise<void>;
  playWord(item: WordItem): Promise<void>;
  /** Read an authored line aloud (storytime narration). Best-effort: honours the
   *  global mute. The recorded-voice player can pre-record these fixed lines. */
  narrate(text: string): Promise<void>;
}
