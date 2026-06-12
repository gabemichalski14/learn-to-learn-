import type { SkillEvent } from '../mastery/events';
import type { SkillKey } from '../mastery/skills';
import { confusionMatrixFromEvents, type ConfusionMatrix } from '../world/memory/review';

/**
 * Signal derivation layer (pure) — turns the append-only `SkillEvent` stream into
 * the learning diagnostics the field's evidence says are highest-value, NONE of
 * which need new capture (we already log the substrate). Runtime source is the
 * cloud `skill_events` history (the complete, server-identity-keyed record);
 * tests run on synthetic arrays. First-party, on-device-derivable, no PII, no
 * profile — every signal answers "how do we teach THIS child better."
 *
 * Constants are research-seeded *tunable defaults* (named so a later tuning is one
 * line, validated against real data — the Confidence-Floor discipline).
 *
 * DON'T-OVERCLAIM: these are *behavioral signals consistent with* learning states,
 * never readouts of "brain states". Latency is confounded by touchscreen/motor
 * maturity → always pair with accuracy and normalize within-child over time.
 */

/** Consecutive correct first-tries that count as "mastered" (Beck & Gong). */
export const MASTERY_RUN = 3;
/** Opportunities allowed before failing-to-master = wheel-spinning (Beck & Gong ≈10). */
export const WHEEL_SPIN_WINDOW = 10;
/** Below this latency a response is likely a rapid guess, not retrieval (tunable;
 *  Wise's effort-moderated approach uses a per-item low percentile — refine later). */
export const RAPID_GUESS_MS = 800;
/** Minimum exposures before an automaticity (latency) slope is meaningful. */
export const AUTOMATICITY_MIN_N = 4;
/** Minimum first-tries before a learning curve is meaningful. */
export const CURVE_MIN_N = 4;

const mean = (xs: number[]): number => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

/** First-try events for one skill, time-ordered (mastery = first-try semantics). */
function skillSeq(events: SkillEvent[], skill: SkillKey): SkillEvent[] {
  return events.filter((e) => e.skillKey === skill && e.firstTry !== false).sort((a, b) => a.at - b.at);
}

/** Least-squares slope of y over index 0..n-1. */
function slopeOverIndex(ys: number[]): number {
  const n = ys.length;
  const xbar = (n - 1) / 2;
  const ybar = mean(ys);
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xbar) * (ys[i] - ybar);
    den += (i - xbar) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export interface LearningCurve {
  n: number;
  errorRateEarly: number;
  errorRateLate: number;
  /** true = error rate fell across practice (learning); null = too few attempts. */
  isLearning: boolean | null;
}

/** Error-rate-over-opportunities (AFM/LFA spirit): is the skill actually being
 *  learned? A flat/rising curve means it isn't (or the skill is mis-defined). */
export function learningCurve(events: SkillEvent[], skill: SkillKey): LearningCurve {
  const seq = skillSeq(events, skill);
  const n = seq.length;
  if (n < CURVE_MIN_N) return { n, errorRateEarly: NaN, errorRateLate: NaN, isLearning: null };
  const half = Math.floor(n / 2);
  const errEarly = 1 - mean(seq.slice(0, half).map((e) => (e.correct ? 1 : 0)));
  const errLate = 1 - mean(seq.slice(half).map((e) => (e.correct ? 1 : 0)));
  return { n, errorRateEarly: errEarly, errorRateLate: errLate, isLearning: errLate < errEarly };
}

export interface WheelSpin {
  /** true = never reached mastery within the window despite enough opportunities. */
  stuck: boolean;
  /** opportunity index (1-based) at which MASTERY_RUN-in-a-row was reached, or null. */
  reachedMasteryAt: number | null;
  opportunities: number;
}

/** Wheel-spinning (Beck & Gong): grinding a skill without converging to mastery —
 *  a "stuck on /sh/" alert to intervene/reroute BEFORE frustration accumulates. */
export function wheelSpinning(events: SkillEvent[], skill: SkillKey): WheelSpin {
  const seq = skillSeq(events, skill);
  let run = 0;
  for (let i = 0; i < seq.length; i++) {
    run = seq[i].correct ? run + 1 : 0;
    if (run >= MASTERY_RUN) return { stuck: false, reachedMasteryAt: i + 1, opportunities: seq.length };
  }
  return { stuck: seq.length >= WHEEL_SPIN_WINDOW, reachedMasteryAt: null, opportunities: seq.length };
}

export interface Automaticity {
  n: number;
  /** ms change in latency per correct exposure; NEGATIVE = getting faster (good). */
  slopeMsPerExposure: number;
  /** true = latency declining (automatizing); false = stalled mapping; null = too few. */
  declining: boolean | null;
}

/** Latency-as-automaticity: on CORRECT exposures, is retrieval getting faster? A
 *  non-declining slope on accurate items = stalled orthographic mapping — the
 *  accurate-but-slow profile pure accuracy misses (compensated dyslexia). */
export function automaticitySlope(events: SkillEvent[], skill: SkillKey): Automaticity {
  const seq = skillSeq(events, skill).filter((e) => e.correct && typeof e.latencyMs === 'number' && (e.latencyMs as number) > 0);
  const n = seq.length;
  if (n < AUTOMATICITY_MIN_N) return { n, slopeMsPerExposure: NaN, declining: null };
  const slope = slopeOverIndex(seq.map((e) => e.latencyMs as number));
  return { n, slopeMsPerExposure: slope, declining: slope < 0 };
}

export interface ReplayReliance {
  n: number;
  early: number;
  late: number;
  /** true = re-hears dropping (consolidating); false = persistent scaffold reliance. */
  decreasing: boolean | null;
}

/** Replay-reliance trend: re-hears falling across exposures = consolidating; staying
 *  high = scaffold-dependence on that grapheme. */
export function replayReliance(events: SkillEvent[], skill: SkillKey): ReplayReliance {
  const seq = skillSeq(events, skill).map((e) => e.replays ?? 0);
  const n = seq.length;
  if (n < CURVE_MIN_N) return { n, early: NaN, late: NaN, decreasing: null };
  const half = Math.floor(n / 2);
  const early = mean(seq.slice(0, half));
  const late = mean(seq.slice(half));
  return { n, early, late, decreasing: late < early };
}

/** Fraction of timed responses that are implausibly fast (likely rapid guesses /
 *  disengagement, not retrieval) — a flag to reroute, never to punish. */
export function rapidGuessRate(events: SkillEvent[], skill?: SkillKey): number {
  const pool = (skill ? events.filter((e) => e.skillKey === skill) : events).filter((e) => typeof e.latencyMs === 'number');
  if (pool.length === 0) return 0;
  const fast = pool.filter((e) => (e.latencyMs as number) < RAPID_GUESS_MS).length;
  return fast / pool.length;
}

/** The per-child confusion map (signal #6) — reuses the memory engine's reducer
 *  (one source of truth): which wrong grapheme/sound for each target. */
export function confusionGraph(events: SkillEvent[]): ConfusionMatrix {
  return confusionMatrixFromEvents(events);
}

export interface SkillSignals {
  skill: SkillKey;
  curve: LearningCurve;
  wheelSpin: WheelSpin;
  automaticity: Automaticity;
  replay: ReplayReliance;
  rapidGuessRate: number;
}

/** The full derived bundle for one skill (the tutor-dashboard unit). */
export function skillSignals(events: SkillEvent[], skill: SkillKey): SkillSignals {
  return {
    skill,
    curve: learningCurve(events, skill),
    wheelSpin: wheelSpinning(events, skill),
    automaticity: automaticitySlope(events, skill),
    replay: replayReliance(events, skill),
    rapidGuessRate: rapidGuessRate(events, skill),
  };
}
