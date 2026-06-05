import type { Phoneme } from './types';

const c = (id: string): Phoneme => ({ id, label: id, ipa: `/${id}/`, type: 'consonant' });
const v = (id: string): Phoneme => ({ id, label: id, ipa: `/${id}/`, type: 'vowel' });

/** Starter subset — expands toward the full ~40 phonemes as content grows. */
export const PHONEMES: Record<string, Phoneme> = {
  b: c('b'), s: c('s'), m: c('m'), t: c('t'),
  f: c('f'), p: c('p'), n: c('n'), l: c('l'),
  a: v('a'), e: v('e'), i: v('i'), o: v('o'), u: v('u'),
};

export function getPhoneme(id: string): Phoneme {
  const p = PHONEMES[id];
  if (!p) throw new Error(`unknown phoneme: ${id}`);
  return p;
}
