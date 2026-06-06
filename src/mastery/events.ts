import { K } from './mastery';
import type { MasteryMap, SkillStat } from './mastery';

/** One answered item, as logged to the cloud (append-only). `at` is epoch ms. */
export interface SkillEvent {
  skillKey: string;
  correct: boolean;
  at: number;
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
