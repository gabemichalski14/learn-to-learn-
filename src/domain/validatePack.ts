import type { Pack } from './types';
import { PHONEMES } from './phonemes';

/**
 * Structural integrity checks only. NOTE: code cannot verify that a picture's
 * spoken word truly begins with its claimed sound — that is a human content
 * review. This guards referential integrity so the engine never breaks.
 */
export function validatePack(pack: Pack): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const w of pack.words) {
    if (seen.has(w.id)) problems.push(`duplicate word id "${w.id}"`);
    seen.add(w.id);

    if (!w.beginningSound && !w.endingSound && !w.medialVowel) {
      problems.push(`word "${w.id}": needs a beginningSound, endingSound, or medialVowel`);
    }
    if (w.beginningSound && !PHONEMES[w.beginningSound]) {
      problems.push(`word "${w.id}": unknown beginningSound "${w.beginningSound}"`);
    }
    if (w.endingSound && !PHONEMES[w.endingSound]) {
      problems.push(`word "${w.id}": unknown endingSound "${w.endingSound}"`);
    }
    if (w.medialVowel && !PHONEMES[w.medialVowel]) {
      problems.push(`word "${w.id}": unknown medialVowel "${w.medialVowel}"`);
    }
    if (!w.emoji || w.emoji.trim() === '') {
      problems.push(`word "${w.id}": missing picture (emoji)`);
    }
  }
  return problems;
}
