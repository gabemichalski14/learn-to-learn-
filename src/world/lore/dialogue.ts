/**
 * The dialogue engine — authored, state-gated, no-repeat. This is how characters
 * "remember you and evolve without repeating hollowly," the deterministic way the
 * cozy greats do it (Stardew/Animal Crossing/Cozy Grove): a pool of authored
 * lines, each GATED by `when(ctx)` on real state (bond tier, plantings, days
 * away, story stage), with a recent-line ring buffer that suppresses immediate
 * repeats. No generation — every line is hand-written and child-safe.
 */
import type { NarrativeState } from '../narrative';
import type { LoreState } from './loreStore';
import type { Planting } from './plantings';

export type Speaker = 'pip' | 'echo' | string; // a resident creature id, later

export interface DialogueCtx {
  narrative: NarrativeState;
  lore: LoreState;
  plantings: Planting[];
  /** Bond count for a character id ('pip' | 'echo' | creatureId). */
  bond: (characterId: string) => number;
}

export interface Line {
  id: string;
  speaker: Speaker;
  /** Gate — the line is only eligible when this returns true (default: always). */
  when?: (c: DialogueCtx) => boolean;
  /** Relative likelihood among eligible lines (default 1). */
  weight?: number;
  /** The spoken text, possibly referencing remembered state. */
  text: (c: DialogueCtx) => string;
  /** Optional learning call-to-action, by destination id (see pipNav.destById)
   *  so the place named and the place navigated stay the same by construction. */
  cta?: { destId: string };
}

/** Lines whose gate passes and which haven't been shown recently. */
export function eligibleLines(pool: Line[], ctx: DialogueCtx): Line[] {
  return pool.filter((l) => (l.when ? l.when(ctx) : true) && !ctx.lore.recentLines.includes(l.id));
}

function pickWeighted(lines: Line[], rng: () => number): Line | null {
  if (lines.length === 0) return null;
  const total = lines.reduce((sum, l) => sum + (l.weight ?? 1), 0);
  let r = rng() * total;
  for (const l of lines) {
    r -= l.weight ?? 1;
    if (r < 0) return l;
  }
  return lines[lines.length - 1];
}

/**
 * Choose a line: weighted-random among eligible (gated + not recently shown). If
 * every gated line was recently shown, relax the no-repeat rule rather than going
 * silent. Deterministic when `rng` is seeded → testable. The caller records the
 * chosen id via `pushRecentLine`.
 */
export function selectLine(pool: Line[], ctx: DialogueCtx, rng: () => number = Math.random): Line | null {
  const fresh = pickWeighted(eligibleLines(pool, ctx), rng);
  if (fresh) return fresh;
  const gatedOnly = pool.filter((l) => (l.when ? l.when(ctx) : true));
  return pickWeighted(gatedOnly, rng);
}
