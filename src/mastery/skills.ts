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

// ---------- Level 3 skill keys (blends, digraphs, spelling rules, syllables) ----------
// Stored as distinct string prefixes so they ride the same skill_events pipeline
// and the mastery/personalization engines without any schema change.
export const blendKey = (position: 'init' | 'final', blend: string): SkillKey => `blend:${position}:${blend}`;
export const digraphKey = (dg: string): SkillKey => `digraph:${dg}`;
export const ruleKey = (rule: 'ck' | 'floss'): SkillKey => `rule:${rule}`;
export const syllKey = (pattern: string): SkillKey => `syll:${pattern}`;

/** Compact, position-FIRST tag for tight chips (e.g. the Sound Map). Keeps the
 *  distinguishing part visible even in a narrow space — so "/m/ · start" and
 *  "/m/ · end" never collapse to the same truncated "the /m/ soun…". */
const PA_LABEL: Record<string, string> = {
  'pa:segment': 'hearing each sound in a word',
  'pa:compare': 'telling sounds apart',
  'pa:rhyme': 'hearing rhymes',
  'pa:blend': 'blending sounds into a word',
};
const PA_TAG: Record<string, string> = {
  'pa:segment': 'each sound', 'pa:compare': 'same / different', 'pa:rhyme': 'rhyming', 'pa:blend': 'blending',
};

export function skillTag(key: SkillKey): string {
  if (key.startsWith('pa:')) return PA_TAG[key] ?? 'listening';
  const [kind, a, b] = key.split(':');
  if (kind === 'blend') return `${(b ?? '').split('').join('-')} blend · ${a === 'final' ? 'end' : 'start'}`;
  if (kind === 'digraph') return `${a} · digraph`;
  if (kind === 'rule') return a === 'floss' ? 'FLOSS rule' : a === 'ck' ? '-ck rule' : `${a} rule`;
  if (kind === 'syll') return 'two-syllable words';
  if (kind === 'vce') return 'silent-e';
  if (kind === 'vowel') return 'long / short';
  if (kind === 'div') return 'splitting words';
  if (kind === 'read') return a === 'sentence' ? 'reading sentences' : a === 'multi' ? 'long-word speed' : 'reading speed';
  const p = parseSkillKey(key);
  if (!p) return key;
  const where = p.target === 'ending' ? 'end' : p.target === 'medial' ? 'middle' : 'start';
  return `/${p.soundId}/ · ${where}`;
}

/** Learner-facing label. ipa is simply /id/ in our registry, so we build from the id. */
export function skillLabel(key: SkillKey): string {
  if (key.startsWith('pa:')) return PA_LABEL[key] ?? 'listening to sounds';
  const [kind, a, b] = key.split(':');
  if (kind === 'blend') return `the ${(b ?? '').split('').join('-')} blend ${a === 'final' ? 'at the end' : 'at the start'}`;
  if (kind === 'digraph') return `the “${a}” digraph (two letters, one sound)`;
  if (kind === 'rule') return a === 'floss' ? 'the FLOSS rule (ff, ll, ss, zz)' : a === 'ck' ? 'the -ck spelling rule' : `the ${a} rule`;
  if (kind === 'syll') return 'splitting two-syllable words';
  if (kind === 'vce') return 'silent-e (the magic e makes the vowel say its name)';
  if (kind === 'vowel') return 'open vs closed syllables (long vs short vowel)';
  if (kind === 'div') return 'splitting big words into syllables';
  if (kind === 'read') return a === 'sentence' ? 'reading sentences out loud (fluency)' : a === 'multi' ? 'reading longer words quickly (fluency)' : 'reading short words quickly (fluency)';
  const p = parseSkillKey(key);
  if (!p) return key;
  const where = p.target === 'ending' ? 'at the end' : p.target === 'medial' ? 'in the middle' : 'at the start';
  return `the /${p.soundId}/ sound ${where}`;
}
