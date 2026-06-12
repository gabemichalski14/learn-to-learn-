import { notifyDataChanged } from '../../data/dataBus';
import { loadMastery, scoreOf, type MasteryMap } from '../../mastery/mastery';
import { PASS_BAR } from '../../mastery/levelGate';
import { parseSkillKey, skillKeyForSound, type SkillKey } from '../../mastery/skills';
import type { SkillEvent } from '../../mastery/events';
import {
  confusionMatrixFromEvents,
  promotablePairs,
  makeSkillItem,
  makePairItem,
  pairId,
  reviewAfterAnswer,
  selectDueItems,
  type ReviewState,
  type ReviewItem,
} from './review';

/**
 * Persistence + integration layer for the memory engine. Stores the per-learner
 * ReviewState in `ll:<id>:review` (same localStorage + dataBus pattern as the rest
 * of the data layer — every write notifies subscribers), enrolls mastered skills
 * as review items, turns captured confusions into interleaved pairs, and wires the
 * block-first `isAcquired` gate from real mastery. No schema change: it composes
 * the existing skill-events + mastery store. The pure scheduling logic lives in
 * review.ts; this module is the only side-effecting seam.
 */

const RATED_MIN = 5; // attempts before a skill counts as acquired (matches mastery.ts)
const key = (learnerId: string) => `ll:${learnerId}:review`;

export function loadReview(learnerId: string): ReviewState {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(key(learnerId)) ?? 'null');
    if (v && typeof v === 'object' && 'items' in v && 'sessionCounter' in v) {
      return v as ReviewState;
    }
  } catch {
    /* ignore */
  }
  return { sessionCounter: 0, items: {} };
}

function save(learnerId: string, state: ReviewState): void {
  try {
    localStorage.setItem(key(learnerId), JSON.stringify(state));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

export function clearReview(learnerId: string): void {
  try {
    localStorage.removeItem(key(learnerId));
  } catch {
    /* ignore */
  }
  notifyDataChanged();
}

/** A skill is "acquired" (eligible to be interleaved) once it's individually
 *  practised to mastery — NOT merely unseen. Used for the block-first gate. */
function acquiredPredicate(map: MasteryMap): (skill: SkillKey) => boolean {
  return (skill) => {
    const s = map[skill];
    return !!s && s.attempts >= RATED_MIN && scoreOf(s) >= PASS_BAR;
  };
}

/** Enroll every mastered skill as a review skill-item (idempotent). Call on a
 *  level pass / checkpoint clear so freshly-mastered skills enter spaced review.
 *  Returns how many new items were added. */
export function enrollMasteredSkills(learnerId: string): number {
  const map = loadMastery(learnerId);
  const isAcquired = acquiredPredicate(map);
  const state = loadReview(learnerId);
  let added = 0;
  for (const skillKey of Object.keys(map)) {
    if (state.items[skillKey]) continue;
    if (isAcquired(skillKey)) {
      state.items[skillKey] = makeSkillItem(skillKey, state.sessionCounter);
      added += 1;
    }
  }
  if (added) save(learnerId, state);
  return added;
}

/** Resolve a confused-with token to a sibling SkillKey in the target's family.
 *  Only the positional `sound:*` family can be safely reconstructed; other
 *  families return null (we don't invent a sibling we can't verify). */
export function siblingSkillKey(target: SkillKey, confusedWith: string): SkillKey | null {
  const p = parseSkillKey(target);
  if (p) return skillKeyForSound(confusedWith, p.target);
  return null;
}

/** Turn systematic confusions (from the append-only skill-events) into interleaved
 *  PairItems. Idempotent; returns how many new pairs were minted. The pair won't
 *  actually interleave until BOTH members are acquired (block-first, enforced at
 *  selection time). */
export function syncConfusionPairs(learnerId: string, events: SkillEvent[]): number {
  const matrix = confusionMatrixFromEvents(events);
  const state = loadReview(learnerId);
  let added = 0;
  for (const pp of promotablePairs(matrix)) {
    const sibling = siblingSkillKey(pp.target, pp.confusedWith);
    if (!sibling) continue;
    const id = pairId(pp.target, sibling);
    if (state.items[id]) continue;
    state.items[id] = makePairItem(pp.target, sibling, state.sessionCounter, pp.strength);
    added += 1;
  }
  if (added) save(learnerId, state);
  return added;
}

/** Begin a tending session — advances the session clock so due items surface. */
export function startReviewSession(learnerId: string): void {
  const state = loadReview(learnerId);
  state.sessionCounter += 1;
  save(learnerId, state);
}

/** The items due in the current session (the "garden tending" warm-up set),
 *  with the block-first interleave gate wired from real mastery. */
export function selectReview(learnerId: string, reteach?: ReadonlySet<string>): ReviewItem[] {
  const state = loadReview(learnerId);
  const isAcquired = acquiredPredicate(loadMastery(learnerId));
  return selectDueItems(state, state.sessionCounter, { isAcquired, reteach });
}

/** Apply one retrieval result to a review item and reschedule it. Returns whether
 *  the item now needs RE-TEACH (a missed skill → route to its mini-lesson). */
export function recordReview(learnerId: string, itemId: string, correct: boolean): boolean {
  const state = loadReview(learnerId);
  const item = state.items[itemId];
  if (!item) return false;
  const { item: next, reteach } = reviewAfterAnswer(item, correct, state.sessionCounter);
  state.items[itemId] = next;
  save(learnerId, state);
  return reteach;
}
