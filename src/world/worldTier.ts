/**
 * The "Living World" growth model — the app's whole backdrop gets richer the
 * more a learner ACTUALLY practices. Fuel is the same competence signal the
 * Sound Garden already uses (finished sessions + earned stickers), so the
 * ambient world and the garden hub always agree.
 *
 * Design facts this encodes (research round 2, 2026-06):
 *  - Intrinsic only: growth tracks real practice, never login-streaks / FOMO /
 *    decay. (Top-grossing-game retention tricks are anti-mission for a
 *    no-anxiety, dyslexia-friendly tool — we keep only the ethical subset:
 *    the "investment loop" + "competence made visible".)
 *  - Additive tiers: each tier ADDS a layer, never thrashes — so the world
 *    "opens up as you grow" (Ori) and rewards thorough play with more to find.
 *  - Never decays: a learner who steps away keeps their world; it only rests
 *    (dimmed) and re-blooms on return. Recovery, never punishment.
 */

import { useMemo } from 'react';
import { useProgress } from '../data/store';
import type { Progress } from '../progress';

/** Highest tier. Tiers run 0..MAX (6 visible richness levels). */
export const WORLD_MAX_TIER = 5;

/** Competence score: sessions weigh most (each is real practice time), stickers
 *  add a little. Pure + deterministic so it's trivially testable. */
export function investmentScore(progress: Pick<Progress, 'sessions' | 'earned'>): number {
  const sessions = Math.max(0, progress.sessions | 0);
  const stickers = Array.isArray(progress.earned) ? progress.earned.length : 0;
  return sessions * 3 + stickers;
}

/** Score needed to ENTER each tier (index = tier). Tuned so tier 1 arrives in
 *  the first session or two, and the top tier is a long, satisfying horizon. */
const TIER_THRESHOLDS = [0, 3, 10, 22, 40, 70] as const;

/** A short, grown-up-friendly name per tier (never babyish — works for adults). */
export const TIER_NAMES = [
  'Seedling',
  'Sprouting',
  'Budding',
  'Blooming',
  'Flourishing',
  'Wild Meadow',
] as const;

/** Map a competence score to a world tier 0..WORLD_MAX_TIER. */
export function worldTier(score: number): number {
  let tier = 0;
  for (let i = 0; i <= WORLD_MAX_TIER; i++) {
    if (score >= TIER_THRESHOLDS[i]) tier = i;
  }
  return tier;
}

export interface TierProgress {
  tier: number;
  score: number;
  name: string;
  /** Score where the next tier begins, or null if already at the top. */
  nextAt: number | null;
  /** 0..1 progress through the current tier toward the next (1 at the top). */
  pct: number;
}

/** Full growth snapshot for a score — drives both the backdrop and any
 *  "your world is growing" affordance. */
export function tierProgress(score: number): TierProgress {
  const tier = worldTier(score);
  const base = TIER_THRESHOLDS[tier];
  const nextAt = tier < WORLD_MAX_TIER ? TIER_THRESHOLDS[tier + 1] : null;
  const pct = nextAt == null ? 1 : Math.min(1, Math.max(0, (score - base) / (nextAt - base)));
  return { tier, score, name: TIER_NAMES[tier], nextAt, pct };
}

/** Reactive hook: the current learner's world tier. Reads the memoized Progress
 *  snapshot (stable reference) via the store, so this never loops and updates
 *  the instant a finished session bumps the count. */
export function useWorldTier(learnerId: string): TierProgress {
  const progress = useProgress(learnerId);
  return useMemo(() => tierProgress(investmentScore(progress)), [progress]);
}
