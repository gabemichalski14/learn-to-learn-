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
