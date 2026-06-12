/**
 * Reading substrate — the taught-inventory resolver + the GPC (grapheme→phoneme
 * correspondence) scope-and-sequence the connected-text engine reads.
 *
 * IP boundary (see docs/IP-CURRICULUM.md): this encodes only the unprotectable
 * METHOD/FACTS — which letters/patterns a child can decode by each of OUR themed
 * levels — aligned to our own `curriculum.ts` level focuses (L1 oral PA; L2
 * consonants + short vowels; L3 closed-syllable blends/digraphs; …). It is NOT a
 * transcription of any program's scope & sequence. No branded names, no "Book N".
 *
 * Why a hard-coded GPC list rather than reading curriculum.ts: text generation
 * needs the concrete grapheme inventory (which letters/digraphs are known), which
 * the generic lesson skeleton doesn't carry. Kept in its own module so the reading
 * engine can be imported from views without tripping the curriculum lint ban.
 *
 * Granularity note (tunable / future): the inventory currently resolves by LEVEL
 * (cumulative through level N). Finer LESSON-level granularity (e.g. L2.5 begins
 * digraphs) is a later refinement; the L2/L3 spike only needs level granularity.
 */

export type GpcKind = 'consonant' | 'vowel' | 'digraph';

export interface Gpc {
  grapheme: string;   // letters, e.g. 'm', 'a', 'sh'
  phoneme: string;    // sound id (matches our phoneme registry; 1:1 for the base set)
  introLevel: number; // the level by which this is reliably taught/decodable
  kind: GpcKind;
}

export type SyllableType = 'closed' | 'open' | 'vce' | 'vowel-team' | 'r-controlled' | 'consonant-le';

// x and qu are omitted from the generation set on purpose: x = /ks/ (not a clean
// single phoneme for early CVC) and q never appears without u. Words needing them
// are simply not generated.
const SINGLE_CONSONANTS = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'y', 'z'];
const SHORT_VOWELS = ['a', 'e', 'i', 'o', 'u'];
// Consonant digraphs are introduced as closed-syllable complexity at Level 3 in
// our sequence, which keeps Level-2 text pure CVC (matches the fluency mode ladder:
// L2 = CVC accuracy, L3 = blends/digraphs).
const CONSONANT_DIGRAPHS = ['sh', 'ch', 'th', 'wh', 'ck'];

export const GPCS: Gpc[] = [
  ...SINGLE_CONSONANTS.map((g): Gpc => ({ grapheme: g, phoneme: g, introLevel: 2, kind: 'consonant' })),
  ...SHORT_VOWELS.map((g): Gpc => ({ grapheme: g, phoneme: g, introLevel: 2, kind: 'vowel' })),
  ...CONSONANT_DIGRAPHS.map((g): Gpc => ({ grapheme: g, phoneme: g, introLevel: 3, kind: 'digraph' })),
];

export const DIGRAPHS: string[] = GPCS.filter((g) => g.kind === 'digraph').map((g) => g.grapheme);
export const VOWEL_GRAPHEMES: ReadonlySet<string> = new Set(GPCS.filter((g) => g.kind === 'vowel').map((g) => g.grapheme));

/** Heart (irregular high-frequency) words become admissible at the level they're
 *  explicitly taught. Seeded with the pre-reading set that unlocks sentences; more
 *  arrive at later levels (heart-word brick + the quarterly sweep). Tunable. */
export const HEART_WORDS_BY_LEVEL: Record<number, string[]> = {
  2: ['the', 'a', 'I', 'is', 'to', 'was'],
};

/** Syllable types unlocked by level, per our curriculum focuses. */
export const SYLLABLE_TYPES_BY_LEVEL: Record<number, SyllableType[]> = {
  2: ['closed'],
  4: ['open'],
  6: ['vce', 'consonant-le'],
  7: ['r-controlled'],
  8: ['vowel-team'],
};

export interface TaughtInventory {
  level: number;
  graphemes: ReadonlySet<string>;
  heartWords: ReadonlySet<string>;
  syllableTypes: ReadonlySet<SyllableType>;
}

/** Greedy left-to-right segmentation into known graphemes (multi-letter digraphs
 *  first, else single letters). Correct for our controlled CVC / closed-syllable
 *  lexicon; complex multi-syllable words can override with explicit graphemes. */
export function segmentGraphemes(word: string): string[] {
  const w = word.toLowerCase();
  const out: string[] = [];
  for (let i = 0; i < w.length;) {
    const two = w.slice(i, i + 2);
    if (DIGRAPHS.includes(two)) {
      out.push(two);
      i += 2;
    } else {
      out.push(w[i]);
      i += 1;
    }
  }
  return out;
}

/** The graphemes NEWLY introduced exactly at `level` (drives new-skill density —
 *  foregrounding the level's new pattern in generated text). */
export function newGraphemesAt(level: number): ReadonlySet<string> {
  return new Set(GPCS.filter((g) => g.introLevel === level).map((g) => g.grapheme));
}

/** The cumulative inventory of everything taught at/below `level`. */
export function resolveInventory(level: number): TaughtInventory {
  const graphemes = new Set(GPCS.filter((g) => g.introLevel <= level).map((g) => g.grapheme));
  const heartWords = new Set<string>();
  const syllableTypes = new Set<SyllableType>();
  for (let l = 1; l <= level; l++) {
    for (const w of HEART_WORDS_BY_LEVEL[l] ?? []) heartWords.add(w.toLowerCase());
    for (const s of SYLLABLE_TYPES_BY_LEVEL[l] ?? []) syllableTypes.add(s);
  }
  return { level, graphemes, heartWords, syllableTypes };
}
