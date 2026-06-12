import type { SkillEvent } from '../../mastery/events';
import type { SkillKey } from '../../mastery/skills';

/**
 * Memory engine core (pure) — spaced cumulative review + interleaving + the
 * confusion loop, tuned for ages ~5–10.
 *
 * Design (see docs/superpowers/specs/2026-06-11-curriculum-gap-fills-build-plan.md
 * §2.3): a 3-box Leitner scheduler with successive-relearning *dropout* — mastered
 * items RETIRE so they stop nagging (the primary-age over-exposure cure) — driven
 * by RETRIEVAL not re-presentation, with confusable pairs interleaved ONLY after
 * block-first acquisition of both members. Deliberately NOT SM-2/Anki: per-card
 * ease factors create "low-interval hell" / over-exposure for young children.
 * Intervals are SESSION-based, not calendar-based, so irregular play never triggers
 * an avalanche or guilt.
 *
 * The constants below are research-seeded *tunable defaults*, named so a future
 * tuning against real data is a one-line change — not a rewrite (the Confidence
 * Floor discipline: a risky parameter is explicit and validated, never buried).
 *
 * This module is intentionally pure (no store, no React, no mastery/levelGate
 * import): it composes the data we already log. Persistence + UI wiring live in a
 * later brick.
 */

export type ReviewBox = 1 | 2 | 3;
export type ReviewKind = 'skill' | 'pair';
export type ReviewStatus = 'active' | 'retired';

export interface ReviewItem {
  /** skill item: the SkillKey itself; pair item: pairId(a, b). */
  id: string;
  kind: ReviewKind;
  /** [skillKey] for a skill, or [a, b] (sorted) for a confusable pair. */
  members: SkillKey[];
  box: ReviewBox;
  status: ReviewStatus;
  /** Consecutive correct answers; resets to 0 on any miss. */
  consecutiveCorrect: number;
  /** Session index this item is next due (session-based, NOT calendar-based). */
  dueSession: number;
  lastSeenSession: number;
  origin: 'level-pass' | 'confusion-promoted';
  /** For pairs: normalized confusion rate that minted it (drives priority). */
  confusionStrength?: number;
}

/** Box → sessions until due again. ~1 / 3 / 7 is the canonical Leitner cadence and
 *  matches Orton-Gillingham daily→weekly cumulative review. Tunable. */
export const INTERVAL: Record<ReviewBox, number> = { 1: 1, 2: 3, 3: 7 };

/** Consecutive corrects required to RETIRE once at box 3. Chosen so an item earns
 *  ~3 spaced retrieval successes before it stops surfacing (successive relearning:
 *  ~3 sessions a week apart → ~80% retained). Tunable. */
export const RETIRE_CONSECUTIVE = 3;

/** A specific wrong choice becomes a confusable PAIR when it is ≥ CONFUSION_RATE of
 *  a skill's misses AND occurs ≥ CONFUSION_MIN times. Tunable. */
export const CONFUSION_RATE = 0.25;
export const CONFUSION_MIN = 3;

/** Cap on concurrently-active interleaved pairs (a scalpel, not a blender). */
export const MAX_ACTIVE_PAIRS = 2;

/** "Less is more" for primary ages: a tending warm-up surfaces at most this many. */
export const SESSION_ITEM_CAP = 6;

/** Stable, order-independent id for a confusable pair. */
export function pairId(a: SkillKey, b: SkillKey): string {
  return `pair:${[a, b].sort().join('|')}`;
}

export function makeSkillItem(skillKey: SkillKey, createdSession: number): ReviewItem {
  return {
    id: skillKey,
    kind: 'skill',
    members: [skillKey],
    box: 1,
    status: 'active',
    consecutiveCorrect: 0,
    dueSession: createdSession + INTERVAL[1],
    lastSeenSession: createdSession,
    origin: 'level-pass',
  };
}

export function makePairItem(a: SkillKey, b: SkillKey, createdSession: number, strength: number): ReviewItem {
  const members = [a, b].sort();
  return {
    id: pairId(a, b),
    kind: 'pair',
    members,
    box: 1,
    status: 'active',
    consecutiveCorrect: 0,
    dueSession: createdSession + INTERVAL[1],
    lastSeenSession: createdSession,
    origin: 'confusion-promoted',
    confusionStrength: strength,
  };
}

export type ConfusionMatrix = Record<SkillKey, Record<string, number>>;

/** Reduce the append-only skill-event log into per-skill wrong-choice tallies.
 *  Counts the `chosen` value on FIRST-TRY misses only (retries don't reflect the
 *  first instinct). The event log is the source of truth (multi-device merge). */
export function confusionMatrixFromEvents(events: SkillEvent[]): ConfusionMatrix {
  const m: ConfusionMatrix = {};
  for (const e of events) {
    if (e.firstTry === false) continue;
    if (e.correct || !e.chosen) continue;
    const row = (m[e.skillKey] ??= {});
    row[e.chosen] = (row[e.chosen] ?? 0) + 1;
  }
  return m;
}

export interface PromotablePair {
  target: SkillKey;
  /** The wrong choice token systematically confused with `target` (e.g. 'd'). */
  confusedWith: string;
  count: number;
  /** Share of the skill's misses this confusion represents (0..1). */
  strength: number;
}

/** Systematic confusions worth interleaving: a specific wrong choice that is ≥
 *  CONFUSION_RATE of a skill's misses and occurs ≥ CONFUSION_MIN times. The caller
 *  resolves `confusedWith` to a sibling SkillKey (family-specific) before minting a
 *  pair via makePairItem — kept out of this pure core on purpose. */
export function promotablePairs(matrix: ConfusionMatrix): PromotablePair[] {
  const out: PromotablePair[] = [];
  for (const [target, choices] of Object.entries(matrix)) {
    const misses = Object.values(choices).reduce((a, b) => a + b, 0);
    if (misses === 0) continue;
    for (const [confusedWith, count] of Object.entries(choices)) {
      const strength = count / misses;
      if (count >= CONFUSION_MIN && strength >= CONFUSION_RATE) {
        out.push({ target, confusedWith, count, strength });
      }
    }
  }
  return out.sort((a, b) => b.strength - a.strength || b.count - a.count);
}

export interface ReviewOutcome {
  item: ReviewItem;
  /** True when a skill item was missed → route to its mini-lesson, not a re-quiz. */
  reteach: boolean;
}

/** Apply one RETRIEVAL result to an item (pure). Correct → promote a box and, once
 *  at box 3 with enough consecutive successes, RETIRE (stop surfacing — the
 *  over-exposure cure). Miss → back to box 1, and for a skill flag re-teach. Always
 *  reschedules by the new box's interval; a miss can only drop to box 1, never to a
 *  perpetual short-interval pile (no SM-2 ease factor). */
export function reviewAfterAnswer(item: ReviewItem, correct: boolean, sessionN: number): ReviewOutcome {
  let box: ReviewBox = item.box;
  let consecutiveCorrect = item.consecutiveCorrect;
  let status: ReviewStatus = item.status;
  let reteach = false;

  if (correct) {
    box = Math.min(box + 1, 3) as ReviewBox;
    consecutiveCorrect += 1;
    if (box === 3 && consecutiveCorrect >= RETIRE_CONSECUTIVE) status = 'retired';
  } else {
    box = 1;
    consecutiveCorrect = 0;
    if (item.kind === 'skill') reteach = true;
  }

  return {
    item: {
      ...item,
      box,
      consecutiveCorrect,
      status,
      dueSession: sessionN + INTERVAL[box],
      lastSeenSession: sessionN,
    },
    reteach,
  };
}

/** A confusable pair may be interleaved only AFTER block-first acquisition of BOTH
 *  members. `isAcquired` is injected (e.g. "level passed AND individually solid")
 *  so this pure core stays free of the mastery/levelGate dependency. */
export function pairEligibleForInterleave(pair: ReviewItem, isAcquired: (skill: SkillKey) => boolean): boolean {
  if (pair.kind !== 'pair') return false;
  return pair.members.every((m) => isAcquired(m));
}

export interface ReviewState {
  sessionCounter: number;
  items: Record<string, ReviewItem>;
}

export interface SelectOptions {
  cap?: number;
  /** Item ids flagged for re-teach since last session (highest priority). */
  reteach?: ReadonlySet<string>;
  /** Block-first gate for pairs; pairs whose members aren't acquired are held back. */
  isAcquired?: (skill: SkillKey) => boolean;
  maxActivePairs?: number;
}

/** Pick the items due this session as a short retrieval warm-up ("garden tending").
 *  Priority: re-teach-flagged → due eligible pairs (strongest confusion first,
 *  capped) → due skills (lowest box first = most fragile, then least-recently-seen).
 *  Retired items never surface; the whole set is capped (less-is-more). */
export function selectDueItems(state: ReviewState, sessionN: number, opts: SelectOptions = {}): ReviewItem[] {
  const cap = opts.cap ?? SESSION_ITEM_CAP;
  const maxPairs = opts.maxActivePairs ?? MAX_ACTIVE_PAIRS;
  const isAcquired = opts.isAcquired ?? (() => true);

  const due = Object.values(state.items).filter((it) => it.status === 'active' && it.dueSession <= sessionN);
  const reteachIds = opts.reteach ?? new Set<string>();

  const reteachItems = due.filter((it) => reteachIds.has(it.id));

  const pairs = due
    .filter((it) => it.kind === 'pair' && !reteachIds.has(it.id) && pairEligibleForInterleave(it, isAcquired))
    .sort((a, b) => (b.confusionStrength ?? 0) - (a.confusionStrength ?? 0) || a.dueSession - b.dueSession)
    .slice(0, maxPairs);

  const skills = due
    .filter((it) => it.kind === 'skill' && !reteachIds.has(it.id))
    .sort((a, b) => a.box - b.box || a.dueSession - b.dueSession);

  return [...reteachItems, ...pairs, ...skills].slice(0, cap);
}
