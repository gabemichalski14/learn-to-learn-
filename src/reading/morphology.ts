/**
 * The morphology layer — meaning from word PARTS. Where the GPC inventory teaches how
 * to SOUND OUT words, this teaches what their pieces MEAN: prefixes/suffixes (L5) and
 * Greek/Latin roots (L10). This is the decoding→comprehension bridge — morphology is
 * the biggest single lever for vocabulary growth (a known root unlocks a family of
 * words). Child-friendly glosses, original. Pure + data-driven.
 */

export type MorphKind = 'prefix' | 'suffix' | 'root';

export interface Morpheme {
  morph: string; // 'un', 're', 'ing', 'port', 'tele'
  kind: MorphKind;
  meaning: string; // child-friendly: 'not', 'again', 'doing it now', 'carry', 'far'
  introLevel: number; // 5 common affixes · 10 Greek/Latin roots
}

export const MORPHEMES: Morpheme[] = [
  // ── prefixes (L5) ──
  { morph: 'un', kind: 'prefix', meaning: 'not / the opposite', introLevel: 5 },
  { morph: 're', kind: 'prefix', meaning: 'again', introLevel: 5 },
  { morph: 'pre', kind: 'prefix', meaning: 'before', introLevel: 5 },
  { morph: 'dis', kind: 'prefix', meaning: 'not / away', introLevel: 5 },
  // ── suffixes (L5) ──
  { morph: 'ing', kind: 'suffix', meaning: 'doing it now', introLevel: 5 },
  { morph: 'ed', kind: 'suffix', meaning: 'already happened', introLevel: 5 },
  { morph: 'est', kind: 'suffix', meaning: 'the most', introLevel: 5 },
  { morph: 'er', kind: 'suffix', meaning: 'one who does it / more', introLevel: 5 },
  { morph: 'ful', kind: 'suffix', meaning: 'full of', introLevel: 5 },
  { morph: 'ly', kind: 'suffix', meaning: 'in a way', introLevel: 5 },
  { morph: 's', kind: 'suffix', meaning: 'more than one', introLevel: 5 },
  // ── Greek/Latin roots (L10) ──
  { morph: 'port', kind: 'root', meaning: 'carry', introLevel: 10 },
  { morph: 'tele', kind: 'root', meaning: 'far away', introLevel: 10 },
  { morph: 'scope', kind: 'root', meaning: 'see / look at', introLevel: 10 },
  { morph: 'graph', kind: 'root', meaning: 'write or draw', introLevel: 10 },
  { morph: 'struct', kind: 'root', meaning: 'build', introLevel: 10 },
  { morph: 'phon', kind: 'root', meaning: 'sound', introLevel: 10 },
];

const PREFIXES = MORPHEMES.filter((m) => m.kind === 'prefix');
const SUFFIXES = [...MORPHEMES.filter((m) => m.kind === 'suffix')].sort((a, b) => b.morph.length - a.morph.length);
const ROOTS = [...MORPHEMES.filter((m) => m.kind === 'root')].sort((a, b) => b.morph.length - a.morph.length);

/** Morphemes taught at/below a level (5 affixes, 10 roots). */
export function morphemesAt(level: number): Morpheme[] {
  return MORPHEMES.filter((m) => m.introLevel <= level);
}

export interface MorphPart { morph: string; meaning: string; kind: MorphKind | 'base' }

const MIN_BASE = 3; // don't peel an affix off a tiny stem ('rest' is not re+st)

/**
 * Decompose a word into meaning parts for the vocabulary surface — peels a known
 * prefix and/or suffix off a real base ('un·fit', 'jump·ing', 'help·ful'), or names a
 * Greek/Latin root. Conservative (base ≥ 3 letters) so it never mis-splits a plain
 * word; returns null when there's no morpheme to teach. A MEANING tool, not a spelling
 * rule — callers pass words already known to be morphologically interesting.
 */
export function glossWord(word: string): MorphPart[] | null {
  const w = word.toLowerCase();

  let rest = w;
  const prefix = PREFIXES.find((p) => rest.startsWith(p.morph) && rest.length - p.morph.length >= MIN_BASE);
  if (prefix) rest = rest.slice(prefix.morph.length);

  const suffix = SUFFIXES.find((s) => rest.endsWith(s.morph) && rest.length - s.morph.length >= MIN_BASE);
  const base = suffix ? rest.slice(0, rest.length - suffix.morph.length) : rest;

  if (prefix || suffix) {
    return [
      ...(prefix ? [{ morph: prefix.morph, meaning: prefix.meaning, kind: 'prefix' as const }] : []),
      { morph: base, meaning: base, kind: 'base' as const },
      ...(suffix ? [{ morph: suffix.morph, meaning: suffix.meaning, kind: 'suffix' as const }] : []),
    ];
  }

  const root = ROOTS.find((r) => w.includes(r.morph));
  return root ? [{ morph: root.morph, meaning: root.meaning, kind: 'root' }] : null;
}
