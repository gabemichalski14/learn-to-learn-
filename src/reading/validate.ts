import { lookupWord, isAdmissible } from './lexicon';
import { type TaughtInventory } from './inventory';
import { type ReadingUnit, type ReadingUnitKind } from './compose';

/**
 * The decodability validator — re-derives whether a unit is readable at a level
 * directly from its RENDERED TEXT, independently of the composer. This is what
 * turns "decodable by construction" into a *proof*: a composer bug that emitted an
 * untaught or unknown word drops the score below threshold and fails the unit.
 * This same function backs the CI decodability invariant (A1.3).
 */

/** Evidence threshold: ≥95% of running words decodable-or-taught (≤10% untaught is
 *  the documented frustration line; we aim higher). Tunable. */
export const DECODABLE_THRESHOLD = 0.95;

/** Word-count ramp per unit kind (phrase → passage). Tunable. */
const LENGTH: Record<ReadingUnitKind, [min: number, max: number]> = {
  phrase: [2, 4],
  sentence: [3, 8],
  passage: [6, 60],
};

export interface Validation {
  ok: boolean;
  /** Fraction of running words that are decodable-or-taught (0..1). */
  decodability: number;
  wordCount: number;
  /** Why it failed (empty when ok). */
  reasons: string[];
}

/** Split rendered text into lowercase word tokens (keeps the apostrophe). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function validateText(text: string, inv: TaughtInventory, kind: ReadingUnitKind): Validation {
  const tokens = tokenize(text);
  const reasons: string[] = [];
  let admissible = 0;
  let unknown = 0;

  for (const t of tokens) {
    const entry = lookupWord(t);
    if (!entry) {
      unknown += 1; // not in the lexicon → we cannot vouch for it → not decodable
      continue;
    }
    if (isAdmissible(entry, inv)) admissible += 1;
  }

  const decodability = tokens.length ? admissible / tokens.length : 0;
  if (unknown > 0) reasons.push(`${unknown} unknown word(s) not in the lexicon`);
  if (decodability < DECODABLE_THRESHOLD) {
    reasons.push(`decodability ${Math.round(decodability * 100)}% < ${Math.round(DECODABLE_THRESHOLD * 100)}%`);
  }
  const [min, max] = LENGTH[kind];
  if (tokens.length < min || tokens.length > max) {
    reasons.push(`length ${tokens.length} outside ${min}-${max} for ${kind}`);
  }

  return { ok: reasons.length === 0, decodability, wordCount: tokens.length, reasons };
}

export function validateUnit(unit: ReadingUnit, inv: TaughtInventory): Validation {
  return validateText(unit.text, inv, unit.kind);
}
