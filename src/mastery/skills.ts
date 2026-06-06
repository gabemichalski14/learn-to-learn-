import type { SoundTarget } from '../domain/types';

/** Stable skill identifier, e.g. 'sound:first:m'. Extensible to confusions/rules later. */
export type SkillKey = string;

export interface ParsedSkill {
  kind: 'sound';
  target: SoundTarget;
  soundId: string;
}

const POS: Record<SoundTarget, string> = { beginning: 'first', ending: 'last', medial: 'medial' };
const TARGET: Record<string, SoundTarget> = { first: 'beginning', last: 'ending', medial: 'medial' };

/** The skill the sort games train: recognizing a sound in a position. */
export function skillKeyForSound(soundId: string, target: SoundTarget): SkillKey {
  return `sound:${POS[target]}:${soundId}`;
}

export function parseSkillKey(key: SkillKey): ParsedSkill | null {
  const parts = key.split(':');
  if (parts.length === 3 && parts[0] === 'sound' && parts[1] in TARGET) {
    return { kind: 'sound', target: TARGET[parts[1]], soundId: parts[2] };
  }
  return null;
}

/** Learner-facing label. ipa is simply /id/ in our registry, so we build from the id. */
export function skillLabel(key: SkillKey): string {
  const p = parseSkillKey(key);
  if (!p) return key;
  const where = p.target === 'ending' ? 'at the end' : p.target === 'medial' ? 'in the middle' : 'at the start';
  return `the /${p.soundId}/ sound ${where}`;
}
