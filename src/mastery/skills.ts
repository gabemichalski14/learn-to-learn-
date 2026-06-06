import type { SoundTarget } from '../domain/types';

/** Stable skill identifier, e.g. 'sound:first:m'. Extensible to confusions/rules later. */
export type SkillKey = string;

export interface ParsedSkill {
  kind: 'sound';
  target: SoundTarget;
  soundId: string;
}

/** The skill the sort games train: recognizing a sound in a position. */
export function skillKeyForSound(soundId: string, target: SoundTarget): SkillKey {
  return `sound:${target === 'ending' ? 'last' : 'first'}:${soundId}`;
}

export function parseSkillKey(key: SkillKey): ParsedSkill | null {
  const parts = key.split(':');
  if (parts.length === 3 && parts[0] === 'sound' && (parts[1] === 'first' || parts[1] === 'last')) {
    return { kind: 'sound', target: parts[1] === 'last' ? 'ending' : 'beginning', soundId: parts[2] };
  }
  return null;
}

/** Learner-facing label. ipa is simply /id/ in our registry, so we build from the id. */
export function skillLabel(key: SkillKey): string {
  const p = parseSkillKey(key);
  if (!p) return key;
  return `the /${p.soundId}/ sound at the ${p.target === 'ending' ? 'end' : 'start'}`;
}
