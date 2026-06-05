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

    if (!PHONEMES[w.beginningSound]) {
      problems.push(`word "${w.id}": unknown beginningSound "${w.beginningSound}"`);
    }
    if (!w.emoji || w.emoji.trim() === '') {
      problems.push(`word "${w.id}": missing picture (emoji)`);
    }
  }
  return problems;
}
