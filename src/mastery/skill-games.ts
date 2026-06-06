import { parseSkillKey } from './skills';
import type { SkillKey } from './skills';

/** The game that drills a given skill, as a route with a ?focus= param. Null if none yet. */
export function practiceRouteForSkill(skillKey: SkillKey): string | null {
  const p = parseSkillKey(skillKey);
  if (!p) return null;
  const game = p.target === 'ending' ? 'ending-sounds' : 'beginning-sounds';
  return `#/play/${game}?focus=${skillKey}`;
}
