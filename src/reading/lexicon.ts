import { segmentGraphemes, VOWEL_GRAPHEMES, type TaughtInventory } from './inventory';

/**
 * The decodability-tagged lexicon — original words the text engine draws from,
 * each tagged with the GPCs it requires (so admissibility is *checkable*, not
 * estimated), its structure, whether it's picturable (meaning-known), and whether
 * it's a heart (irregular) word. Nouns reuse the existing pack words + emoji so
 * audio clips and pictures already resolve by label. ORIGINAL content.
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
  emoji?: string;
  /** The GPC graphemes that spell the word (greedy-segmented; correct for this set). */
  graphemes: string[];
}

function make(word: string, pos: Pos, opts: { emoji?: string; heart?: boolean } = {}): LexEntry {
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
    emoji: opts.emoji,
    graphemes,
  };
}

export const LEXICON: LexEntry[] = [
  // ── CVC nouns (imageable; emoji placeholders reuse the existing pack art) ──
  make('cat', 'noun', { emoji: '🐱' }), make('hat', 'noun', { emoji: '🎩' }),
  make('bag', 'noun', { emoji: '🎒' }), make('map', 'noun', { emoji: '🗺️' }),
  make('van', 'noun', { emoji: '🚐' }), make('jam', 'noun', { emoji: '🍓' }),
  make('hen', 'noun', { emoji: '🐔' }), make('bed', 'noun', { emoji: '🛏️' }),
  make('net', 'noun', { emoji: '🥅' }), make('pen', 'noun', { emoji: '🖊️' }),
  make('web', 'noun', { emoji: '🕸️' }), make('jet', 'noun', { emoji: '🛩️' }),
  make('pig', 'noun', { emoji: '🐷' }), make('pin', 'noun', { emoji: '📌' }),
  make('dog', 'noun', { emoji: '🐶' }), make('pot', 'noun', { emoji: '🍲' }),
  make('top', 'noun', { emoji: '🔝' }), make('sun', 'noun', { emoji: '☀️' }),
  make('bug', 'noun', { emoji: '🐛' }), make('cup', 'noun', { emoji: '☕' }),
  make('bus', 'noun', { emoji: '🚌' }), make('nut', 'noun', { emoji: '🌰' }),
  make('log', 'noun', { emoji: '🪵' }), make('mug', 'noun', { emoji: '🍵' }),

  // ── CVC verbs ──
  make('run', 'verb'), make('sit', 'verb'), make('hop', 'verb'), make('dig', 'verb'),
  make('nap', 'verb'), make('hug', 'verb'), make('tap', 'verb'), make('jog', 'verb'),
  make('win', 'verb'), make('pat', 'verb'),

  // ── CVC adjectives ──
  make('big', 'adj'), make('hot', 'adj'), make('wet', 'adj'), make('red', 'adj'),
  make('sad', 'adj'), make('fun', 'adj'),

  // ── decodable function words (closed/VC; not heart) ──
  make('on', 'function'), make('in', 'function'), make('it', 'function'),
  make('at', 'function'), make('up', 'function'), make('and', 'function'),
  make('can', 'function'), make('had', 'function'), make('not', 'function'), make('got', 'function'),

  // ── heart words (pre-reading seed; admit ONLY when taught) ──
  make('the', 'function', { heart: true }), make('is', 'function', { heart: true }),
  make('a', 'function', { heart: true }), make('I', 'function', { heart: true }),
  make('to', 'function', { heart: true }), make('was', 'function', { heart: true }),

  // ── Level-3 words (a digraph; prove the L2→L3 inventory boundary) ──
  make('fish', 'noun', { emoji: '🐟' }), make('duck', 'noun', { emoji: '🦆' }),
  make('sock', 'noun', { emoji: '🧦' }), make('ship', 'noun', { emoji: '🚢' }),
  make('shed', 'noun'), make('chin', 'noun'), make('chop', 'verb'), make('rich', 'adj'),
];

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
