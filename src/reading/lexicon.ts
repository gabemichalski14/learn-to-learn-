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
  /** Floor on the level a word becomes admissible, independent of its graphemes —
   *  e.g. a multisyllable CLOSED word ('napkin') is all-L2 graphemes but needs the
   *  L3 syllable-division skill to read, so minLevel:3. Omit for single-syllable. */
  minLevel?: number;
}

interface MakeOpts {
  emoji?: string;
  heart?: boolean;
  animate?: boolean;
  place?: boolean;
  feeling?: boolean;
  /** Explicit GPC graphemes — REQUIRED for split digraphs (vce: cake → c,a_e,k),
   *  r-controlled (car → c,ar) and vowel teams (rain → r,ai,n), which greedy
   *  left-to-right segmentation can't recover. */
  graphemes?: string[];
  /** Admissibility floor independent of graphemes (e.g. multisyllable → L3). */
  minLevel?: number;
}

function make(word: string, pos: Pos, opts: MakeOpts = {}): LexEntry {
  const graphemes = opts.graphemes ?? segmentGraphemes(word);
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
    minLevel: opts.minLevel,
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
  make('shed', 'noun', { place: true }), make('chin', 'noun'),

  // ── multisyllable CLOSED words: all-L2 graphemes, but need the L3 syllable-division
  //    skill to read (Chop Shop) → gated by minLevel, not graphemes. ──
  make('rabbit', 'noun', { emoji: '🐰', animate: true, minLevel: 3 }),
  make('kitten', 'noun', { emoji: '🐱', animate: true, minLevel: 3 }),
  make('napkin', 'noun', { emoji: '🧻', minLevel: 3 }),
  make('basket', 'noun', { emoji: '🧺', place: true, minLevel: 3 }),
  make('sunset', 'noun', { emoji: '🌇', minLevel: 3 }),
  make('muffin', 'noun', { emoji: '🧁', minLevel: 3 }),
  make('magnet', 'noun', { emoji: '🧲', minLevel: 3 }),

  // ── Level-4 vce / magic-e (split digraph — EXPLICIT graphemes) ──
  make('snake', 'noun', { emoji: '🐍', animate: true, graphemes: ['s', 'n', 'a_e', 'k'] }),
  make('whale', 'noun', { emoji: '🐋', animate: true, graphemes: ['wh', 'a_e', 'l'] }),
  make('mole', 'noun', { emoji: '🦫', animate: true, graphemes: ['m', 'o_e', 'l'] }),
  make('cake', 'noun', { emoji: '🎂', graphemes: ['c', 'a_e', 'k'] }),
  make('bike', 'noun', { emoji: '🚲', graphemes: ['b', 'i_e', 'k'] }),
  make('kite', 'noun', { emoji: '🪁', graphemes: ['k', 'i_e', 't'] }),
  make('rose', 'noun', { emoji: '🌹', graphemes: ['r', 'o_e', 's'] }),
  make('bone', 'noun', { emoji: '🦴', graphemes: ['b', 'o_e', 'n'] }),
  make('game', 'noun', { emoji: '🎮', graphemes: ['g', 'a_e', 'm'] }),
  make('cube', 'noun', { emoji: '🧊', graphemes: ['c', 'u_e', 'b'] }),
  make('lake', 'noun', { emoji: '🏞️', place: true, graphemes: ['l', 'a_e', 'k'] }),
  make('cave', 'noun', { emoji: '🕳️', place: true, graphemes: ['c', 'a_e', 'v'] }),
  make('gate', 'noun', { emoji: '🚪', place: true, graphemes: ['g', 'a_e', 't'] }),
  make('bake', 'verb', { graphemes: ['b', 'a_e', 'k'] }), make('hide', 'verb', { graphemes: ['h', 'i_e', 'd'] }),
  make('ride', 'verb', { graphemes: ['r', 'i_e', 'd'] }), make('wave', 'verb', { graphemes: ['w', 'a_e', 'v'] }),
  make('hope', 'verb', { graphemes: ['h', 'o_e', 'p'] }),
  make('safe', 'adj', { graphemes: ['s', 'a_e', 'f'] }), make('late', 'adj', { graphemes: ['l', 'a_e', 't'] }),
  make('cute', 'adj', { feeling: true, graphemes: ['c', 'u_e', 't'] }), make('ripe', 'adj', { graphemes: ['r', 'i_e', 'p'] }),

  // ── Level-7 r-controlled / bossy-r (EXPLICIT graphemes) ──
  make('car', 'noun', { emoji: '🚗', place: true, graphemes: ['c', 'ar'] }),
  make('star', 'noun', { emoji: '⭐', graphemes: ['s', 't', 'ar'] }),
  make('shark', 'noun', { emoji: '🦈', animate: true, graphemes: ['sh', 'ar', 'k'] }),
  make('barn', 'noun', { emoji: '🏚️', place: true, graphemes: ['b', 'ar', 'n'] }),
  make('corn', 'noun', { emoji: '🌽', graphemes: ['c', 'or', 'n'] }),
  make('fork', 'noun', { emoji: '🍴', graphemes: ['f', 'or', 'k'] }),
  make('bird', 'noun', { emoji: '🐦', animate: true, graphemes: ['b', 'ir', 'd'] }),
  make('girl', 'noun', { emoji: '👧', animate: true, graphemes: ['g', 'ir', 'l'] }),
  make('hard', 'adj', { graphemes: ['h', 'ar', 'd'] }), make('dark', 'adj', { graphemes: ['d', 'ar', 'k'] }),

  // ── Level-8 vowel teams (EXPLICIT graphemes) ──
  make('rain', 'noun', { emoji: '🌧️', graphemes: ['r', 'ai', 'n'] }),
  make('train', 'noun', { emoji: '🚂', place: true, graphemes: ['t', 'r', 'ai', 'n'] }),
  make('boat', 'noun', { emoji: '⛵', place: true, graphemes: ['b', 'oa', 't'] }),
  make('goat', 'noun', { emoji: '🐐', animate: true, graphemes: ['g', 'oa', 't'] }),
  make('bee', 'noun', { emoji: '🐝', animate: true, graphemes: ['b', 'ee'] }),
  make('tree', 'noun', { emoji: '🌳', place: true, graphemes: ['t', 'r', 'ee'] }),
  make('leaf', 'noun', { emoji: '🍃', graphemes: ['l', 'ea', 'f'] }),
  make('seed', 'noun', { emoji: '🌱', graphemes: ['s', 'ee', 'd'] }),
  make('road', 'noun', { emoji: '🛣️', place: true, graphemes: ['r', 'oa', 'd'] }),
  make('soap', 'noun', { emoji: '🧼', graphemes: ['s', 'oa', 'p'] }),

  // ── heart words for L3–L5 (irregular HF; admit ONLY when taught) ──
  make('said', 'function', { heart: true }), make('of', 'function', { heart: true }),
  make('you', 'function', { heart: true }), make('they', 'function', { heart: true }),
  make('have', 'function', { heart: true }), make('are', 'function', { heart: true }),
  make('were', 'function', { heart: true }), make('one', 'function', { heart: true }),
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
  if (e.minLevel && inv.level < e.minLevel) return false; // gate (e.g. multisyllable → L3)
  if (e.heart) return inv.heartWords.has(e.word.toLowerCase());
  return e.graphemes.every((g) => inv.graphemes.has(g));
}

/** Every lexicon word a learner can read at this level. */
export function admissibleWords(inv: TaughtInventory): LexEntry[] {
  return LEXICON.filter((e) => isAdmissible(e, inv));
}
