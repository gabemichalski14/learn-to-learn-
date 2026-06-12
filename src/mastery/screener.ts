import { notifyDataChanged } from '../data/dataBus';

/**
 * At-risk SCREENER result + pacing model. A one-time, game-framed serial
 * naming-speed task (a voice-free RAN proxy — RAN is the strongest single early
 * reading-risk predictor) sets the learner's INITIAL pacing: how much repetition /
 * how long a session starts at. It is NOT a deficit score, is never shown to the
 * child, and is immediately overridden by live mastery once real practice data
 * exists (the screener only seeds the starting point).
 *
 * DON'T OVERCLAIM: this is a behavioral PROXY (tap-through serial speed), not a
 * clinical RAN measure, and never a diagnosis — an at-risk signal routes gentler
 * support, full stop.
 */

export type Pacing = 'gentle' | 'standard' | 'springboard';

export interface ScreenerResult {
  /** serial naming-speed proxy: ms per item to traverse the board */
  ranMsPerItem: number;
  takenAt: string; // ISO
  pacing: Pacing;
}

// Tunable thresholds for the tap-through proxy (NOT clinical RAN norms — validate
// against real data). Faster traversal → springboard (start a touch ahead); slower
// → gentle (more repetition, shorter sessions). Output sets INTENSITY only.
export const RAN_FAST_MS = 700; // <= → springboard
export const RAN_SLOW_MS = 1400; // >= → gentle

export function pacingFor(msPerItem: number): Pacing {
  if (!Number.isFinite(msPerItem) || msPerItem <= 0) return 'standard';
  if (msPerItem <= RAN_FAST_MS) return 'springboard';
  if (msPerItem >= RAN_SLOW_MS) return 'gentle';
  return 'standard';
}

const key = (learnerId: string) => `ll:${learnerId}:screener`;

export function loadScreener(learnerId: string): ScreenerResult | null {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(key(learnerId)) ?? 'null');
    if (v && typeof v === 'object' && 'pacing' in v && 'ranMsPerItem' in v) return v as ScreenerResult;
  } catch {
    /* ignore */
  }
  return null;
}

export function saveScreener(learnerId: string, result: ScreenerResult): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify(result));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

/** Has this learner done the welcome screener yet? */
export function hasScreened(learnerId: string): boolean {
  return loadScreener(learnerId) !== null;
}

/** The learner's pacing (defaults to 'standard' before screening). */
export function pacingOf(learnerId: string): Pacing {
  return loadScreener(learnerId)?.pacing ?? 'standard';
}

/**
 * Review DOSE = how many spaced-review items to surface in one warm-up sitting.
 * Gentler pacing → shorter sets (vigilance/fatigue research: shorter is kinder
 * for at-risk young readers); springboard → a slightly fuller set. This is the
 * one knob pacing turns. Tunable — validate against real engagement/retention.
 *
 * Deliberately NOT modulated by pacing: curriculum PLACEMENT. This is a structured
 * (Barton-aligned) sequence — pacing never skips scope or "starts ahead". What a
 * learner is ready for is gated by real MASTERY, not by a one-time screener. So
 * springboard means "a fuller review set", never "skip phonics steps". The child's
 * core teaching loop is never shortened punitively either — only the review dose flexes.
 */
export const REVIEW_DOSE: Record<Pacing, number> = { gentle: 4, standard: 6, springboard: 8 };

export function reviewDose(learnerId: string): number {
  return REVIEW_DOSE[pacingOf(learnerId)];
}
