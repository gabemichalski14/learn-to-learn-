/**
 * The bridge from the lore engine to the UI. At event time (a poke), assemble the
 * dialogue context from real state, pick a character line (gated + no-repeat),
 * record it, and deepen the bond — then hand the bubble a plain Phrase. Called
 * from event handlers only (never render): it reads the store and writes lore.
 */
import { narrativeState } from '../narrative';
import { loadLore, pushRecentLine, bumpBond, bondOf } from './loreStore';
import { plantingsFor } from './plantings';
import { selectLine, type Line, type DialogueCtx } from './dialogue';
import { destById } from '../../mascots/pipNav';
import type { Phrase } from '../../mascots/phrases';

/** Snapshot the current dialogue context for a learner. */
export function buildCtx(learnerId: string, nowMs: number): DialogueCtx {
  return {
    narrative: narrativeState(learnerId, nowMs),
    lore: loadLore(learnerId),
    plantings: plantingsFor(learnerId),
    bond: (id) => bondOf(learnerId, id),
  };
}

/** A chosen line → the bubble's Phrase shape. The CTA's spoken place and its
 *  route come from the SAME Dest (destById), so they can't disagree. */
export function lineToPhrase(line: Line, ctx: DialogueCtx): Phrase {
  const dest = line.cta ? destById(line.cta.destId) : null;
  return {
    say: line.text(ctx),
    cta: dest ? dest.label : undefined,
    to: dest ? dest.to : undefined,
  };
}

/**
 * Pick a line from `pool`, record it as recently-shown (no hollow repeats), and
 * deepen the bond with its speaker. Returns the bubble Phrase, or null if the
 * pool yields nothing (caller can fall back to a generic phrase).
 */
export function speak(learnerId: string, pool: Line[], rng: () => number = Math.random): Phrase | null {
  const ctx = buildCtx(learnerId, Date.now());
  const line = selectLine(pool, ctx, rng);
  if (!line) return null;
  pushRecentLine(learnerId, line.id);
  bumpBond(learnerId, line.speaker);
  return lineToPhrase(line, ctx);
}
