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

// ---------- Blend Buddies round builder (build the heard word from tiles) ----------
function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export interface BlendRound { word: string; emoji?: string; blend: string; position: 'init' | 'final'; tiles: string[]; blendIdx: [number, number] }
// ---------- Sort It (tap the matching digraph bin) ----------
export interface SortItRound { word: string; emoji?: string; digraph: string; options: string[] }
export function buildSortItRounds(n: number, rng: () => number = Math.random): SortItRound[] {
  return shuffle(DIGRAPH_WORDS, rng).slice(0, n).map((w) => {
    const others = shuffle(DIGRAPHS.filter((d) => d !== w.digraph), rng).slice(0, 2);
    return { word: w.label, emoji: w.emoji, digraph: w.digraph, options: shuffle([w.digraph, ...others], rng) };
  });
}

// ---------- Rule Breakers (pick the right ending: ck / floss) ----------
export interface RuleRound { word: string; emoji?: string; rule: 'ck' | 'floss'; stem: string; ending: string; distractor: string; options: string[] }
export function buildRuleRounds(n: number, rng: () => number = Math.random): RuleRound[] {
  return shuffle(RULE_WORDS, rng).slice(0, n).map((w) => ({
    word: w.label, emoji: w.emoji, rule: w.rule,
    stem: w.label.slice(0, w.label.length - w.ending.length),
    ending: w.ending, distractor: w.distractor, options: shuffle([w.ending, w.distractor], rng),
  }));
}

// ---------- Chop Shop (tap the syllable boundary) ----------
export interface ChopRound { word: string; emoji?: string; split: number }
export function buildChopRounds(n: number, rng: () => number = Math.random): ChopRound[] {
  return shuffle(SYLL_WORDS, rng).slice(0, n).map((w) => ({ word: w.label, emoji: w.emoji, split: w.split }));
}

const TILE_DISTRACTORS = 'bcdfghjklmnpqrstvwz'.split('');
/** `n` rounds: a blend word + a shuffled tray of its letters + 2 distractors.
 *  `blendIdx` marks the two "buddy" letters (so the UI can show them holding hands). */
export function buildBlendRounds(n: number, rng: () => number = Math.random): BlendRound[] {
  return shuffle(BLEND_WORDS, rng).slice(0, n).map((w) => {
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
