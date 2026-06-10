import { K } from './mastery';
import type { MasteryMap, SkillStat } from './mastery';

/** One answered item, as logged to the cloud (append-only). `at` is epoch ms.
 *  Fields after `at` are optional enrichment (added incrementally by each game):
 *  confusion analysis, true first-try accuracy, fluency, curriculum alignment.
 *  masteryFromEvents ignores them (only needs correct + at). */
export interface SkillEvent {
  skillKey: string;
  correct: boolean;
  at: number;
  /** Which game produced this (e.g. 'tap-it-out'). */
  game?: string;
  /** What the learner picked when wrong — the confusion (e.g. 'd' for a /b/). */
  chosen?: string;
  /** Correct on the FIRST attempt (un-inflated accuracy). */
  firstTry?: boolean;
  /** Time to answer in ms (kept raw; interpreted as buckets, never shown raw). */
  latencyMs?: number;
  /** Times the learner re-heard the sound for this item (uncertainty signal). */
  replays?: number;
  /** Curriculum level / lesson for this item (Barton-sequence alignment). */
  level?: number;
  lesson?: number;
}

/**
 * Fold an ordered event list into the existing MasteryMap shape so the dashboard
 * can reuse scoreOf / areasToImprove unchanged. Events are sorted by time first,
 * so multi-device merges (events arriving in any order) are deterministic.
 */
export function masteryFromEvents(events: SkillEvent[]): MasteryMap {
  const map: MasteryMap = {};
  const ordered = [...events].sort((a, b) => a.at - b.at);
  for (const e of ordered) {
    // Mastery = FIRST-TRY accuracy (research): count first attempts only, skip
    // retries. Events without first_try (legacy) are kept.
    if (e.firstTry === false) continue;
    const s: SkillStat = map[e.skillKey] ?? { attempts: 0, correct: 0, recent: [], lastSeen: 0 };
    s.attempts += 1;
    if (e.correct) s.correct += 1;
    s.recent.push(e.correct ? 1 : 0);
    if (s.recent.length > K) s.recent = s.recent.slice(-K);
    s.lastSeen = e.at;
    map[e.skillKey] = s;
  }
  return map;
}
