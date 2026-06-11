/**
 * Level 3 — "Patch's Workshop": closed syllables, blends, digraphs, and the first
 * spelling rules (-ck, FLOSS). ORIGINAL word lists (never Barton's). All words use
 * short vowels only (no r-controlled / long vowels yet — those are L4). Emoji are
 * included where a clean one exists, for the picture-based games (Sort It, Blend
 * Buddies); audio-only items can omit it.
 *
 * Feeds the L3 skill keys in mastery/skills.ts (blendKey / digraphKey / ruleKey /
 * syllKey) — so everything rides the existing skill_events + mastery pipeline.
 */

// ---------- consonant blends (CCVC initial, CVCC final) — Blend Buddies ----------
export interface BlendWord {
  label: string;
  emoji?: string;
  blend: string;               // the two-consonant blend, e.g. 'fl'
  position: 'init' | 'final';
}
export const BLEND_WORDS: BlendWord[] = [
  // initial blends (the blend is the FIRST two letters)
  { label: 'flag', emoji: '🚩', blend: 'fl', position: 'init' },
  { label: 'frog', emoji: '🐸', blend: 'fr', position: 'init' },
  { label: 'drum', emoji: '🥁', blend: 'dr', position: 'init' },
  { label: 'crab', emoji: '🦀', blend: 'cr', position: 'init' },
  { label: 'sled', emoji: '🛷', blend: 'sl', position: 'init' },
  { label: 'clap', emoji: '👏', blend: 'cl', position: 'init' },
  { label: 'plug', emoji: '🔌', blend: 'pl', position: 'init' },
  { label: 'grin', emoji: '😁', blend: 'gr', position: 'init' },
  { label: 'snip', blend: 'sn', position: 'init' },
  { label: 'spin', emoji: '🌀', blend: 'sp', position: 'init' },
  { label: 'swim', emoji: '🏊', blend: 'sw', position: 'init' },
  { label: 'trap', blend: 'tr', position: 'init' },
  // final blends (the blend is the LAST two letters)
  { label: 'hand', emoji: '✋', blend: 'nd', position: 'final' },
  { label: 'tent', emoji: '⛺', blend: 'nt', position: 'final' },
  { label: 'lamp', emoji: '💡', blend: 'mp', position: 'final' },
  { label: 'gift', emoji: '🎁', blend: 'ft', position: 'final' },
  { label: 'nest', emoji: '🪺', blend: 'st', position: 'final' },
  { label: 'milk', emoji: '🥛', blend: 'lk', position: 'final' },
];

// ---------- consonant digraphs (two letters, one sound) — Sort It ----------
export interface DigraphWord { label: string; emoji?: string; digraph: string }
export const DIGRAPH_WORDS: DigraphWord[] = [
  { label: 'ship', emoji: '🚢', digraph: 'sh' },
  { label: 'fish', emoji: '🐟', digraph: 'sh' },
  { label: 'shell', emoji: '🐚', digraph: 'sh' },
  { label: 'chip', emoji: '🍟', digraph: 'ch' },
  { label: 'cheese', emoji: '🧀', digraph: 'ch' },
  { label: 'chick', emoji: '🐥', digraph: 'ch' },
  { label: 'thumb', emoji: '👍', digraph: 'th' },
  { label: 'bath', emoji: '🛁', digraph: 'th' },
  { label: 'whale', emoji: '🐳', digraph: 'wh' },
  { label: 'duck', emoji: '🦆', digraph: 'ck' },
  { label: 'sock', emoji: '🧦', digraph: 'ck' },
  { label: 'ring', emoji: '💍', digraph: 'ng' },
  { label: 'king', emoji: '🤴', digraph: 'ng' },
];
export const DIGRAPHS = ['sh', 'ch', 'th', 'wh', 'ck', 'ng'] as const;

// ---------- round builders (shared selection) ----------
import { blendKey, digraphKey, ruleKey, syllKey } from '../../mastery/skills';

/** Per-skill weight (1–5) — higher = practise more. Used for adaptive selection. */
export type WeightOf = (skill: string) => number;

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Pick `n` distinct words. Uniform (random) by default; when `weight` is given,
 *  bias toward the weaker skills (the learner's soft spots) — weighted sampling
 *  WITHOUT replacement, so a session still covers a spread. */
function pickWords<T>(pool: readonly T[], n: number, rng: () => number, weight?: (it: T) => number): T[] {
  if (!weight) return shuffle(pool, rng).slice(0, n);
  const bag = pool.map((it) => ({ it, w: Math.max(0.0001, weight(it)) }));
  const out: T[] = [];
  for (let k = 0; k < n && bag.length; k++) {
    const total = bag.reduce((s, b) => s + b.w, 0);
    let r = rng() * total, idx = 0;
    for (; idx < bag.length - 1; idx++) { r -= bag[idx].w; if (r <= 0) break; }
    out.push(bag[idx].it); bag.splice(idx, 1);
  }
  return out;
}
export interface BlendRound { word: string; emoji?: string; blend: string; position: 'init' | 'final'; tiles: string[]; blendIdx: [number, number] }
// ---------- Sort It (tap the matching digraph bin) ----------
export interface SortItRound { word: string; emoji?: string; digraph: string; options: string[] }
export function buildSortItRounds(n: number, rng: () => number = Math.random, weightOf?: WeightOf): SortItRound[] {
  return pickWords(DIGRAPH_WORDS, n, rng, weightOf && ((w) => weightOf(digraphKey(w.digraph)))).map((w) => {
    const others = shuffle(DIGRAPHS.filter((d) => d !== w.digraph), rng).slice(0, 2);
    return { word: w.label, emoji: w.emoji, digraph: w.digraph, options: shuffle([w.digraph, ...others], rng) };
  });
}

// ---------- Rule Breakers (pick the right ending: ck / floss) ----------
export interface RuleRound { word: string; emoji?: string; rule: 'ck' | 'floss'; stem: string; ending: string; distractor: string; options: string[] }
export function buildRuleRounds(n: number, rng: () => number = Math.random, weightOf?: WeightOf): RuleRound[] {
  return pickWords(RULE_WORDS, n, rng, weightOf && ((w) => weightOf(ruleKey(w.rule)))).map((w) => ({
    word: w.label, emoji: w.emoji, rule: w.rule,
    stem: w.label.slice(0, w.label.length - w.ending.length),
    ending: w.ending, distractor: w.distractor, options: shuffle([w.ending, w.distractor], rng),
  }));
}

// ---------- Chop Shop (tap the syllable boundary) ----------
export interface ChopRound { word: string; emoji?: string; split: number }
export function buildChopRounds(n: number, rng: () => number = Math.random, weightOf?: WeightOf): ChopRound[] {
  // All syllable words share one skill (syll:vccv), so weighting just scales how
  // much to practise it overall; selection stays a spread across words.
  void weightOf?.(syllKey('vccv'));
  return shuffle(SYLL_WORDS, rng).slice(0, n).map((w) => ({ word: w.label, emoji: w.emoji, split: w.split }));
}

const TILE_DISTRACTORS = 'bcdfghjklmnpqrstvwz'.split('');
/** `n` rounds: a blend word + a shuffled tray of its letters + 2 distractors.
 *  `blendIdx` marks the two "buddy" letters (so the UI can show them holding hands). */
export function buildBlendRounds(n: number, rng: () => number = Math.random, weightOf?: WeightOf): BlendRound[] {
  return pickWords(BLEND_WORDS, n, rng, weightOf && ((w) => weightOf(blendKey(w.position, w.blend)))).map((w) => {
    const letters = w.label.split('');
    const distractors = shuffle(TILE_DISTRACTORS.filter((d) => !letters.includes(d)), rng).slice(0, 2);
    const blendIdx: [number, number] = w.position === 'init' ? [0, 1] : [letters.length - 2, letters.length - 1];
    return { word: w.label, emoji: w.emoji, blend: w.blend, position: w.position, blendIdx, tiles: shuffle([...letters, ...distractors], rng) };
  });
}

// ---------- first spelling rules (-ck, FLOSS) — Rule Breakers ----------
// `ending` = the correct doubled / ck ending; `distractor` = the tempting single.
export interface RuleWord { label: string; emoji?: string; rule: 'ck' | 'floss'; ending: string; distractor: string }
export const RULE_WORDS: RuleWord[] = [
  { label: 'duck', emoji: '🦆', rule: 'ck', ending: 'ck', distractor: 'k' },
  { label: 'sock', emoji: '🧦', rule: 'ck', ending: 'ck', distractor: 'k' },
  { label: 'rock', emoji: '🪨', rule: 'ck', ending: 'ck', distractor: 'k' },
  { label: 'truck', emoji: '🚛', rule: 'ck', ending: 'ck', distractor: 'k' },
  { label: 'lock', emoji: '🔒', rule: 'ck', ending: 'ck', distractor: 'k' },
  { label: 'bell', emoji: '🔔', rule: 'floss', ending: 'll', distractor: 'l' },
  { label: 'doll', emoji: '🪆', rule: 'floss', ending: 'll', distractor: 'l' },
  { label: 'hill', emoji: '⛰️', rule: 'floss', ending: 'll', distractor: 'l' },
  { label: 'grass', emoji: '🌾', rule: 'floss', ending: 'ss', distractor: 's' },
  { label: 'glass', emoji: '🥛', rule: 'floss', ending: 'ss', distractor: 's' },
  { label: 'dress', emoji: '👗', rule: 'floss', ending: 'ss', distractor: 's' },
  { label: 'buzz', emoji: '🐝', rule: 'floss', ending: 'zz', distractor: 'z' },
];

// ---------- two-syllable closed words (VC|CV) — Chop Shop ----------
// `split` = the index to cut the word into two closed syllables (rabbit → rab|bit).
export interface SyllWord { label: string; emoji?: string; split: number }
export const SYLL_WORDS: SyllWord[] = [
  { label: 'rabbit', emoji: '🐰', split: 3 },   // rab | bit
  { label: 'napkin', emoji: '🧻', split: 3 },   // nap | kin
  { label: 'sunset', emoji: '🌅', split: 3 },   // sun | set
  { label: 'picnic', emoji: '🧺', split: 3 },   // pic | nic
  { label: 'magnet', emoji: '🧲', split: 3 },   // mag | net
  { label: 'kitten', emoji: '🐱', split: 3 },   // kit | ten
  { label: 'muffin', emoji: '🧁', split: 3 },   // muf | fin
  { label: 'pumpkin', emoji: '🎃', split: 4 },  // pump | kin
  { label: 'tennis', emoji: '🎾', split: 3 },   // ten | nis
  { label: 'dentist', emoji: '🦷', split: 3 },  // den | tist
];

// ---------- Patch's Dictation + Tool Time (the two new L3 archetypes) ----------
// One picture pool drawn from the blend + digraph words that have a clean emoji,
// each tagged with the L3 skill key it trains.
export interface L3PicWord { word: string; emoji: string; skillKey: string }
export const L3_PIC_POOL: L3PicWord[] = [
  ...BLEND_WORDS.filter((w) => w.emoji).map((w) => ({ word: w.label, emoji: w.emoji as string, skillKey: blendKey(w.position, w.blend) })),
  ...DIGRAPH_WORDS.filter((w) => w.emoji).map((w) => ({ word: w.label, emoji: w.emoji as string, skillKey: digraphKey(w.digraph) })),
];

/** Patch's Dictation: n words to spell from the full alphabet (logs the word's key). */
export function buildL3DictationRounds(n: number, rng: () => number = Math.random): L3PicWord[] {
  return shuffle(L3_PIC_POOL, rng).slice(0, n);
}

export interface L3ReadRound { word: string; emoji: string; skillKey: string; options: { word: string; emoji: string }[] }
/** Tool Time (fluency): read the word fast, tap its picture from 3. */
export function buildL3ReadRounds(n: number, rng: () => number = Math.random): L3ReadRound[] {
  return shuffle(L3_PIC_POOL, rng).slice(0, n).map((w) => {
    const distractors = shuffle(L3_PIC_POOL.filter((x) => x.word !== w.word), rng).slice(0, 2).map((x) => ({ word: x.word, emoji: x.emoji }));
    return { word: w.word, emoji: w.emoji, skillKey: w.skillKey, options: shuffle([{ word: w.word, emoji: w.emoji }, ...distractors], rng) };
  });
}
