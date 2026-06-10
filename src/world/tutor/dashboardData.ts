import { skillInsights, type MasteryMap, type SkillInsight } from '../../mastery/mastery';
import { skillLabel } from '../../mastery/skills';

/**
 * Mastery-first summarisation for the dashboards. Pure + framework-free so the
 * Tutor view, the future Parent "story" view, and the Admin roll-up can all
 * share one engine. Bands match the existing model (mastery line 0.9, "needs
 * work" below 0.8). No-shame: the lowest band is "ready to work on", never fail.
 */
export const MASTERED = 0.9;
export const PRACTICING = 0.8;

export interface MasterySummary {
  mastered: SkillInsight[];   // score >= 0.9  (best first)
  practicing: SkillInsight[]; // 0.8 <= score < 0.9
  working: SkillInsight[];    // score < 0.8   (lowest first — the next focus)
  total: number;              // rated skills practised
}

export function summarize(map: MasteryMap): MasterySummary {
  const all = skillInsights(map).sort((a, b) => b.score - a.score);
  return {
    mastered: all.filter((s) => s.score >= MASTERED),
    practicing: all.filter((s) => s.score >= PRACTICING && s.score < MASTERED),
    working: all.filter((s) => s.score < PRACTICING).sort((a, b) => a.score - b.score),
    total: all.length,
  };
}

/** A short, no-shame "why this is the next focus" note, from gameplay signals. */
export function whyNote(s: SkillInsight): string {
  if (s.replays >= 3) return 'often re-hears it';
  if (s.avgMs != null && s.avgMs > 6500) return 'takes some thought';
  if (s.score < 0.6) return 'still new — keep practising';
  return 'almost there';
}

/** One warm, plain-language headline for the top of the dashboard (BLUF). */
export function insightLine(name: string, map: MasteryMap): string {
  const { mastered, working, total } = summarize(map);
  if (total === 0) return `A few rounds of play and ${name}'s sound map fills in here.`;
  const m = mastered.length;
  const sounds = (n: number) => `${n} sound${n === 1 ? '' : 's'}`;
  if (working.length === 0) {
    return `${name} is mastering everything they've practised — ${sounds(m)} solid. 🌟`;
  }
  const next = skillLabel(working[0].skillKey);
  return m > 0
    ? `${name} has ${sounds(m)} mastered — ready to focus on ${next}.`
    : `${name} is building toward their first mastered sounds — start with ${next}.`;
}
