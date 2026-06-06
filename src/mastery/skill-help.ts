import { parseSkillKey } from './skills';
import type { SkillKey } from './skills';

export interface SkillHelp {
  what: string; // plain description
  why: string;  // why it matters
  tip: string;  // a quick at-home / strategy tip
}

/** Our own kid-friendly guidance per skill (never Barton's scripts). */
export function skillHelp(key: SkillKey): SkillHelp {
  const p = parseSkillKey(key);
  if (!p) return { what: key, why: 'A skill to practice.', tip: 'Keep practicing — short and playful.' };
  const s = p.soundId;
  const where = p.target === 'ending' ? 'end' : 'start';
  return {
    what: `We listen for the /${s}/ sound at the ${where} of a word and match it to its letter.`,
    why: `Hearing /${s}/ clearly makes reading and spelling words with it much easier.`,
    tip: `Say a few words slowly and stretch the ${where} sound: is it /${s}/? Thumbs up if yes.`,
  };
}
