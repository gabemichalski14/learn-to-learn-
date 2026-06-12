import type { SkillEvent } from '../mastery/events';
import type { SkillKey } from '../mastery/skills';
import { skillSignals } from './derive';

/**
 * Tutor-facing roll-up of the derived signals: which skills need a *different*
 * approach (wheel-spinning), which are accurate-but-not-yet-fluent (automaticity
 * stalled), and which are coming along. Pure + testable; the panel just renders it.
 *
 * Buckets are mutually exclusive and priority-ordered (stuck > effortful >
 * improving). Skills without enough evidence are omitted (the derive functions
 * return null/insufficient). Honest framing: these are behavioral signals to guide
 * teaching, never a diagnosis.
 */
export interface TutorSignalSummary {
  /** Practised a lot without converging — try re-teaching a new way. */
  stuck: SkillKey[];
  /** Accurate, but latency isn't dropping — needs fluency practice. */
  effortful: SkillKey[];
  /** Getting faster and/or more accurate with practice. */
  improving: SkillKey[];
}

export function tutorSignalSummary(events: SkillEvent[]): TutorSignalSummary {
  const skills = [...new Set(events.map((e) => e.skillKey))];
  const stuck: SkillKey[] = [];
  const effortful: SkillKey[] = [];
  const improving: SkillKey[] = [];

  for (const skill of skills) {
    const s = skillSignals(events, skill);
    if (s.wheelSpin.stuck) stuck.push(skill);
    else if (s.automaticity.declining === false) effortful.push(skill);
    else if (s.automaticity.declining === true || s.curve.isLearning === true) improving.push(skill);
  }
  return { stuck, effortful, improving };
}
