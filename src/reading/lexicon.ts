import { segmentGraphemes, VOWEL_GRAPHEMES, type TaughtInventory } from './inventory';

/**
 * The decodability-tagged lexicon — original words the text engine draws from,
 * each tagged with the GPCs it requires (so admissibility is *checkable*, not
 * estimated), its structure, and light SEMANTIC tags (animacy, "place", feeling)
 * so the composer produces meaningful, natural text — not grammatical word-salad.
 * Nouns reuse the existing pack words + emoji so audio clips and pictures already
 * resolve by label. ORIGINAL content.
 *
 * A word is admissible at a level iff every grapheme it needs is in the taught
 * inventory (or it's a taught heart word). This is the load-bearing invariant the
 * generator's ≥95%-decodable guarantee is built on.
 */

export type Pos = 'noun' | 'verb' | 'adj' | 'function';

export interface LexEntry {
  word: string;
  pos: Pos;
  /** C/V structure derived from graphemes, e.g. 'CVC', 'VC', 'CVCC'. */
  structure: string;
  /** Medial/!first vowel sound id, for vowel variety in generation. */
  vowel?: string;
  /** Concrete & picturable (a meaning a child knows) — used by the meaning filter. */
  imageable: boolean;
  /** Irregular high-frequency: admit ONLY when explicitly taught (not by GPCs). */
  heart?: boolean;
  /** A living thing — can be the subject of an action verb / a feeling. */
  animate?: boolean;
  /** A surface/large object something can plausibly be "on". */
  place?: boolean;
  /** A feeling adjective (sad, fun) — only sensible for an animate subject. */
  feeling?: boolean;
  emoji?: string;
  /** The GPC graphemes that spell the word (greedy-segmented; correct for this set). */
  graphemes: string[];
}

interface MakeOpts {
  emoji?: string;
  heart?: boolean;
  animate?: boolean;
  place?: boolean;
  feeling?: boolean;
}

function make(word: string, pos: Pos, opts: MakeOpts = {}): LexEntry {
  const graphemes = segmentGraphemes(word);
  const vowel = graphemes.find((g) => VOWEL_GRAPHEMES.has(g));
  const structure = graphemes.map((g) => (VOWEL_GRAPHEMES.has(g) ? 'V' : 'C')).join('');
  return {
    word,
    pos,
    structure,
    vowel,
    imageable: pos === 'noun' && !!opts.emoji,
    heart: opts.heart,
    animate: opts.animate,
    place: opts.place,
    feeling: opts.feeling,
    emoji: opts.emoji,
    graphemes,
  };
}

export const LEXICON: LexEntry[] = [
  // ── animals (CVC nouns, animate) ──
  make('cat', 'noun', { emoji: '🐱', animate: true }), make('dog', 'noun', { emoji: '🐶', animate: true }),
  make('pig', 'noun', { emoji: '🐷', animate: true }), make('hen', 'noun', { emoji: '🐔', animate: true }),
  make('bug', 'noun', { emoji: '🐛', animate: true }), make('bat', 'noun', { emoji: '🦇', animate: true }),
  make('pup', 'noun', { emoji: '🐶', animate: true }), make('hog', 'noun', { emoji: '🐗', animate: true }),
  make('ram', 'noun', { emoji: '🐏', animate: true }),

  // ── object nouns (CVC; some tagged as "places" you can be on) ──
  make('hat', 'noun', { emoji: '🎩' }), make('bag', 'noun', { emoji: '🎒' }),
  make('map', 'noun', { emoji: '🗺️', place: true }), make('van', 'noun', { emoji: '🚐', place: true }),
  make('jam', 'noun', { emoji: '🍓' }), make('bed', 'noun', { emoji: '🛏️', place: true }),
  make('net', 'noun', { emoji: '🥅', place: true }), make('pen', 'noun', { emoji: '🖊️' }),
  make('web', 'noun', { emoji: '🕸️' }), make('jet', 'noun', { emoji: '🛩️', place: true }),
  make('pin', 'noun', { emoji: '📌' }), make('pot', 'noun', { emoji: '🍲' }),
  make('top', 'noun', { emoji: '🔝', place: true }), make('sun', 'noun', { emoji: '☀️' }),
  make('cup', 'noun', { emoji: '☕' }), make('bus', 'noun', { emoji: '🚌', place: true }),
  make('nut', 'noun', { emoji: '🌰' }), make('log', 'noun', { emoji: '🪵', place: true }),
  make('mug', 'noun', { emoji: '🍵' }), make('mat', 'noun', { emoji: '🟫', place: true }),
  make('rug', 'noun', { emoji: '🧶', place: true }), make('tub', 'noun', { emoji: '🛁' }),
  make('pan', 'noun', { emoji: '🍳' }), make('cap', 'noun', { emoji: '🧢' }),
  make('fan', 'noun', { emoji: '🪭' }), make('bun', 'noun', { emoji: '🍞' }),

  // ── CVC verbs (actions — work intransitively with an animate subject) ──
  make('run', 'verb'), make('sit', 'verb'), make('hop', 'verb'), make('dig', 'verb'),
  make('nap', 'verb'), make('hug', 'verb'), make('tap', 'verb'), make('jog', 'verb'),
  make('win', 'verb'), make('nod', 'verb'),

  // ── CVC adjectives (physical = any noun; feeling/state = animate only) ──
  make('big', 'adj'), make('hot', 'adj'), make('wet', 'adj'), make('red', 'adj'),
  make('tan', 'adj'),
  make('sad', 'adj', { feeling: true }), make('fun', 'adj', { feeling: true }),
  make('fit', 'adj', { feeling: true }),

  // ── decodable function words (closed/VC; not heart) ──
  make('on', 'function'), make('in', 'function'), make('it', 'function'),
  make('at', 'function'), make('up', 'function'), make('and', 'function'),
  make('can', 'function'), make('had', 'function'), make('not', 'function'), make('got', 'function'),

  // ── heart words (pre-reading seed; admit ONLY when taught) ──
  make('the', 'function', { heart: true }), make('is', 'function', { heart: true }),
  make('a', 'function', { heart: true }), make('I', 'function', { heart: true }),
  make('to', 'function', { heart: true }), make('was', 'function', { heart: true }),

  // ── Level-3 words (a digraph; prove the L2→L3 inventory boundary) ──
  make('fish', 'noun', { emoji: '🐟', animate: true }), make('duck', 'noun', { emoji: '🦆', animate: true }),
  make('sock', 'noun', { emoji: '🧦' }), make('ship', 'noun', { emoji: '🚢', place: true }),
  make('shed', 'noun', { place: true }), make('chin', 'noun'), make('chop', 'verb'),
];

const WORD_INDEX = new Map<string, LexEntry>(LEXICON.map((e) => [e.word.toLowerCase(), e]));

/** Case-insensitive lexicon lookup (used by the validator to verify rendered text
 *  independently of the composer). Returns undefined for words we can't vouch for. */
export function lookupWord(token: string): LexEntry | undefined {
  return WORD_INDEX.get(token.toLowerCase());
}

/** Does this word use any of the graphemes newly introduced at a level? Drives
 *  new-skill density — foregrounding the level's new pattern in generated text. */
export function usesNewSkill(e: LexEntry, newGraphemes: ReadonlySet<string>): boolean {
  return e.graphemes.some((g) => newGraphemes.has(g));
}

/** Is this word decodable/known at the given inventory? Heart words admit only
 *  when explicitly taught; everything else iff all its graphemes are taught. */
export function isAdmissible(e: LexEntry, inv: TaughtInventory): boolean {
  if (e.heart) return inv.heartWords.has(e.word.toLowerCase());
  return e.graphemes.every((g) => inv.graphemes.has(g));
}

/** Every lexicon word a learner can read at this level. */
export function admissibleWords(inv: TaughtInventory): LexEntry[] {
  return LEXICON.filter((e) => isAdmissible(e, inv));
}
