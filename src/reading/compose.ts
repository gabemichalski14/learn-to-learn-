import { admissibleWords, type LexEntry } from './lexicon';
import { type TaughtInventory } from './inventory';

/**
 * The text composer — builds original phrases / sentences / passages from ONLY
 * admissible words, with SEMANTIC constraints so the text is meaningful and
 * natural, not grammatical word-salad (the documented failure mode of decodable
 * generators). Deterministic (injectable RNG), no LLM: decodability is guaranteed
 * by construction and independently *proven* by the validator (validate.ts).
 *
 * Meaning rules (why builders, not free slot-filling):
 *  - only ANIMATE subjects do action verbs ("The dog can hop", never "The sun can hop")
 *  - feeling adjectives only describe animate subjects ("The pig is sad")
 *  - "X is on the Y" requires an animate X and a PLACE Y ("The cat is on the bed")
 * Builders vary deliberately (no single repeated pattern) — decodable, NOT
 * predictable/leveled text (which trains guessing).
 */

export type ReadingUnitKind = 'phrase' | 'sentence' | 'passage';

export interface ReadingUnit {
  kind: ReadingUnitKind;
  text: string;
  /** Content words used (for audio, pictures, and per-word skill logging). */
  words: LexEntry[];
}

interface Pools {
  nouns: LexEntry[];
  animals: LexEntry[];
  places: LexEntry[];
  verbs: LexEntry[];
  physAdj: LexEntry[];
  allAdj: LexEntry[];
  has: (w: string) => boolean;
}

function pools(inv: TaughtInventory): Pools {
  const pool = admissibleWords(inv);
  return {
    nouns: pool.filter((e) => e.pos === 'noun' && e.imageable),
    animals: pool.filter((e) => e.pos === 'noun' && e.imageable && e.animate),
    places: pool.filter((e) => e.pos === 'noun' && e.place),
    verbs: pool.filter((e) => e.pos === 'verb'),
    physAdj: pool.filter((e) => e.pos === 'adj' && !e.feeling),
    allAdj: pool.filter((e) => e.pos === 'adj'),
    has: (w: string) => pool.some((e) => e.word.toLowerCase() === w),
  };
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T>(arr: readonly T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)];
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function unit(kind: ReadingUnitKind, tokens: string[], words: LexEntry[]): ReadingUnit {
  const joined = tokens.join(' ');
  return { kind, text: kind === 'phrase' ? joined : `${capitalize(joined)}.`, words };
}

type Builder = () => ReadingUnit | null;

function phraseBuilders(P: Pools, rng: () => number): Builder[] {
  return [
    () => {
      if (!P.has('a') || P.nouns.length === 0) return null;
      const n = pick(P.nouns, rng);
      return unit('phrase', ['a', n.word], [n]);
    },
    () => {
      if (!P.has('the') || P.nouns.length === 0) return null;
      const n = pick(P.nouns, rng);
      const adjs = n.animate ? P.allAdj : P.physAdj; // feeling adjectives only on animate nouns
      if (adjs.length === 0) return null;
      const a = pick(adjs, rng);
      return unit('phrase', ['the', a.word, n.word], [a, n]);
    },
  ];
}

function sentenceBuilders(P: Pools, rng: () => number): Builder[] {
  return [
    // any noun + a physical adjective → always sensible ("The web is big.")
    () => {
      if (!P.has('is') || P.nouns.length === 0 || P.physAdj.length === 0) return null;
      const n = pick(P.nouns, rng);
      const a = pick(P.physAdj, rng);
      return unit('sentence', ['the', n.word, 'is', a.word], [n, a]);
    },
    // animate subject + any adjective incl. feeling ("The pig is sad.")
    () => {
      if (!P.has('is') || P.animals.length === 0 || P.allAdj.length === 0) return null;
      const n = pick(P.animals, rng);
      const a = pick(P.allAdj, rng);
      return unit('sentence', ['the', n.word, 'is', a.word], [n, a]);
    },
    // animate subject + action verb ("The dog can hop.")
    () => {
      if (!P.has('can') || P.animals.length === 0 || P.verbs.length === 0) return null;
      const n = pick(P.animals, rng);
      const v = pick(P.verbs, rng);
      return unit('sentence', ['the', n.word, 'can', v.word], [n, v]);
    },
    // animate subject on a place ("The cat is on the bed.")
    () => {
      if (!P.has('is') || !P.has('on') || P.animals.length === 0 || P.places.length === 0) return null;
      const n = pick(P.animals, rng);
      const p = pick(P.places, rng);
      return unit('sentence', ['the', n.word, 'is', 'on', 'the', p.word], [n, p]);
    },
  ];
}

/** Compose one phrase or sentence (tries meaning-aware builders in random order). */
export function composeUnit(inv: TaughtInventory, kind: 'phrase' | 'sentence', rng: () => number = Math.random): ReadingUnit | null {
  const P = pools(inv);
  const builders = kind === 'phrase' ? phraseBuilders(P, rng) : sentenceBuilders(P, rng);
  for (const b of shuffle(builders, rng)) {
    const u = b();
    if (u) return u;
  }
  return null;
}

/** Compose a short cohesive passage: one recurring ANIMATE subject, DISTINCT
 *  predicates (variety, not a repeated frame), all decodable and sensible. */
export function composePassage(inv: TaughtInventory, rng: () => number = Math.random, sentences = 3): ReadingUnit | null {
  const P = pools(inv);
  if (!P.has('the') || P.animals.length === 0) return null;

  const subject = pick(P.animals, rng);
  const words: LexEntry[] = [subject];

  type Built = { text: string; words: LexEntry[] } | null;
  const predicates: Array<() => Built> = [
    () => (P.has('is') && P.allAdj.length ? ((a) => ({ text: `the ${subject.word} is ${a.word}`, words: [a] }))(pick(P.allAdj, rng)) : null),
    () => (P.has('can') && P.verbs.length ? ((v) => ({ text: `the ${subject.word} can ${v.word}`, words: [v] }))(pick(P.verbs, rng)) : null),
    () => (P.has('is') && P.has('on') && P.places.length ? ((p) => ({ text: `the ${subject.word} is on the ${p.word}`, words: [p] }))(pick(P.places, rng)) : null),
  ];

  const lines: string[] = [];
  for (const build of shuffle(predicates, rng)) {
    if (lines.length >= sentences) break;
    const r = build();
    if (r) {
      lines.push(`${capitalize(r.text)}.`);
      words.push(...r.words);
    }
  }
  if (lines.length === 0) return null;
  return { kind: 'passage', text: lines.join(' '), words };
}

/** Compose a unit of any kind. */
export function compose(inv: TaughtInventory, kind: ReadingUnitKind, rng: () => number = Math.random): ReadingUnit | null {
  return kind === 'passage' ? composePassage(inv, rng) : composeUnit(inv, kind, rng);
}
