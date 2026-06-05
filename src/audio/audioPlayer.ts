import type { WordItem } from '../domain/types';

/**
 * The one audio seam in the app. v1 uses a speechSynthesis stub; the recorded
 * human-voice player implements this same interface later — no call sites change.
 */
export interface AudioPlayer {
  playSound(soundId: string): Promise<void>;
  playWord(item: WordItem): Promise<void>;
}
