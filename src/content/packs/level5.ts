/**
 * Level 5 — Tinker Town (prefixes & suffixes / morphology). ORIGINAL word lists.
 *
 * v1 deliberately uses NO-spelling-change bases (jump→jumping, not hop→hopping), so an
 * affix always snaps onto an UNCHANGED stem — the doubling / drop-e / y→i rules are a
 * later focused pass. Child-friendly affix "jobs"/"meanings" drive meaning-first play
 * (the research: teach the transformation + the meaning change, never a rote list).
 * Aligned with src/reading/morphology.ts MORPHEMES.
 */

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** answer + (n-1) distractors drawn from a pool, all shuffled. */
function withDistractors(answer: string, pool: readonly string[], rng: () => number, n = 3): string[] {
  const d = shuffle(pool.filter((x) => x !== answer), rng).slice(0, n - 1);
  return shuffle([answer, ...d], rng);
}

// ───────────────────────────────────────────────────────────────────────────
// 1) Happy Endings — SUFFIXES. See a base + a JOB (picture); snap the ending that
//    does that job. The job, not the spelling, drives the choice.
// ───────────────────────────────────────────────────────────────────────────
export interface SuffixItem { base: string; suffix: string; word: string; job: string; jobEmoji: string }
export const SUFFIX_ITEMS: SuffixItem[] = [
  { base: 'jump', suffix: 'ing', word: 'jumping', job: 'doing it now', jobEmoji: '🔄' },
  { base: 'jump', suffix: 'ed', word: 'jumped', job: 'already happened', jobEmoji: '✅' },
  { base: 'paint', suffix: 'ing', word: 'painting', job: 'doing it now', jobEmoji: '🔄' },
  { base: 'paint', suffix: 'ed', word: 'painted', job: 'already happened', jobEmoji: '✅' },
  { base: 'paint', suffix: 'er', word: 'painter', job: 'the one who does it', jobEmoji: '🧑' },
  { base: 'help', suffix: 'ing', word: 'helping', job: 'doing it now', jobEmoji: '🔄' },
  { base: 'help', suffix: 'ed', word: 'helped', job: 'already happened', jobEmoji: '✅' },
  { base: 'help', suffix: 'er', word: 'helper', job: 'the one who does it', jobEmoji: '🧑' },
  { base: 'kick', suffix: 'ing', word: 'kicking', job: 'doing it now', jobEmoji: '🔄' },
  { base: 'kick', suffix: 'ed', word: 'kicked', job: 'already happened', jobEmoji: '✅' },
  { base: 'call', suffix: 'ing', word: 'calling', job: 'doing it now', jobEmoji: '🔄' },
  { base: 'call', suffix: 'ed', word: 'called', job: 'already happened', jobEmoji: '✅' },
  { base: 'fast', suffix: 'er', word: 'faster', job: 'more', jobEmoji: '➕' },
  { base: 'fast', suffix: 'est', word: 'fastest', job: 'the most', jobEmoji: '🏆' },
  { base: 'tall', suffix: 'er', word: 'taller', job: 'more', jobEmoji: '➕' },
  { base: 'tall', suffix: 'est', word: 'tallest', job: 'the most', jobEmoji: '🏆' },
  { base: 'small', suffix: 'er', word: 'smaller', job: 'more', jobEmoji: '➕' },
  { base: 'small', suffix: 'est', word: 'smallest', job: 'the most', jobEmoji: '🏆' },
];
const SUFFIXES = ['ing', 'ed', 'er', 'est'];
export interface SuffixRound extends SuffixItem { options: string[] }
export function buildSuffixRounds(n: number, rng: () => number = Math.random): SuffixRound[] {
  return shuffle(SUFFIX_ITEMS, rng).slice(0, n).map((it) => ({ ...it, options: withDistractors(it.suffix, SUFFIXES, rng, 3) }));
}

// ───────────────────────────────────────────────────────────────────────────
// 2) Front Loaders — PREFIXES. A base + its picture; pick the prefix that makes the
//    target meaning (lock → unlock). v1 leads with the concrete un- / re-.
// ───────────────────────────────────────────────────────────────────────────
export interface PrefixItem { base: string; prefix: string; word: string; meaning: string; meaningEmoji: string; baseEmoji: string }
export const PREFIX_ITEMS: PrefixItem[] = [
  { base: 'lock', prefix: 'un', word: 'unlock', meaning: 'open it', meaningEmoji: '🔓', baseEmoji: '🔒' },
  { base: 'pack', prefix: 'un', word: 'unpack', meaning: 'take it out', meaningEmoji: '📤', baseEmoji: '📦' },
  { base: 'zip', prefix: 'un', word: 'unzip', meaning: 'open it', meaningEmoji: '🔓', baseEmoji: '🧥' },
  { base: 'fit', prefix: 'un', word: 'unfit', meaning: 'not fit', meaningEmoji: '🚫', baseEmoji: '💪' },
  { base: 'play', prefix: 're', word: 'replay', meaning: 'play it again', meaningEmoji: '🔁', baseEmoji: '▶️' },
  { base: 'fill', prefix: 're', word: 'refill', meaning: 'fill it again', meaningEmoji: '🔁', baseEmoji: '🥤' },
  { base: 'do', prefix: 're', word: 'redo', meaning: 'do it again', meaningEmoji: '🔁', baseEmoji: '✏️' },
  { base: 'heat', prefix: 'pre', word: 'preheat', meaning: 'heat it before', meaningEmoji: '⏱️', baseEmoji: '🔥' },
];
const PREFIXES = ['un', 're', 'pre', 'dis'];
export interface PrefixRound extends PrefixItem { options: string[] }
export function buildPrefixRounds(n: number, rng: () => number = Math.random): PrefixRound[] {
  return shuffle(PREFIX_ITEMS, rng).slice(0, n).map((it) => ({ ...it, options: withDistractors(it.prefix, PREFIXES, rng, 3) }));
}

// ───────────────────────────────────────────────────────────────────────────
// 3) Word Workbench — WORD SUMS. Build a target word from its parts (un + lock →
//    unlock). Teaches that the base stays stable while affixes vary.
// ───────────────────────────────────────────────────────────────────────────
export interface WordSum { parts: string[]; word: string; meaning: string; emoji: string }
export const WORD_SUMS: WordSum[] = [
  { parts: ['un', 'lock'], word: 'unlock', meaning: 'open it', emoji: '🔓' },
  { parts: ['re', 'play'], word: 'replay', meaning: 'play it again', emoji: '🔁' },
  { parts: ['help', 'ful'], word: 'helpful', meaning: 'full of help', emoji: '🤝' },
  { parts: ['jump', 'ing'], word: 'jumping', meaning: 'doing it now', emoji: '🔄' },
  { parts: ['un', 'pack'], word: 'unpack', meaning: 'take it out', emoji: '📤' },
  { parts: ['re', 'fill'], word: 'refill', meaning: 'fill it again', emoji: '🔁' },
  { parts: ['paint', 'er'], word: 'painter', meaning: 'one who paints', emoji: '🧑' },
  { parts: ['un', 'fit'], word: 'unfit', meaning: 'not fit', emoji: '🚫' },
];
const SUM_DISTRACTOR_PARTS = ['un', 're', 'pre', 'dis', 'ing', 'ed', 'er', 'ful'];
export interface WordSumRound extends WordSum { tray: string[] }
export function buildWordSumRounds(n: number, rng: () => number = Math.random): WordSumRound[] {
  return shuffle(WORD_SUMS, rng).slice(0, n).map((ws) => {
    const extra = shuffle(SUM_DISTRACTOR_PARTS.filter((p) => !ws.parts.includes(p)), rng).slice(0, 2);
    return { ...ws, tray: shuffle([...ws.parts, ...extra], rng) };
  });
}

// ───────────────────────────────────────────────────────────────────────────
// 4) Take It Apart — PEEL-OFF. Peel the prefix off the front + the suffix off the end
//    of a long word, leaving the real base to read. The strategy for big words.
// ───────────────────────────────────────────────────────────────────────────
export interface PeelWord { word: string; prefix?: string; base: string; suffix?: string; baseEmoji: string }
export const PEEL_WORDS: PeelWord[] = [
  { word: 'unlocking', prefix: 'un', base: 'lock', suffix: 'ing', baseEmoji: '🔒' },
  { word: 'replayed', prefix: 're', base: 'play', suffix: 'ed', baseEmoji: '▶️' },
  { word: 'helpful', base: 'help', suffix: 'ful', baseEmoji: '🤝' },
  { word: 'jumping', base: 'jump', suffix: 'ing', baseEmoji: '🦘' },
  { word: 'painter', base: 'paint', suffix: 'er', baseEmoji: '🎨' },
  { word: 'unpacked', prefix: 'un', base: 'pack', suffix: 'ed', baseEmoji: '📦' },
  { word: 'refilling', prefix: 're', base: 'fill', suffix: 'ing', baseEmoji: '🥤' },
  { word: 'helper', base: 'help', suffix: 'er', baseEmoji: '🤝' },
];
export function buildPeelRounds(n: number, rng: () => number = Math.random): PeelWord[] {
  return shuffle(PEEL_WORDS, rng).slice(0, n);
}

// ───────────────────────────────────────────────────────────────────────────
// 5) Ed's Three Voices — the three sounds of -ed. Hear the word, tap the voice:
//    /t/ (jumped), /d/ (played), /əd/ (wanted). Audio-first — the schwa can't be
//    sounded from letters.
// ───────────────────────────────────────────────────────────────────────────
export type EdSound = 't' | 'd' | 'uhd';
export interface EdWord { word: string; sound: EdSound; emoji: string }
export const ED_WORDS: EdWord[] = [
  { word: 'jumped', sound: 't', emoji: '🦘' },
  { word: 'kicked', sound: 't', emoji: '🦵' },
  { word: 'helped', sound: 't', emoji: '🤝' },
  { word: 'picked', sound: 't', emoji: '🫐' },
  { word: 'played', sound: 'd', emoji: '🎮' },
  { word: 'called', sound: 'd', emoji: '📞' },
  { word: 'filled', sound: 'd', emoji: '🥤' },
  { word: 'rained', sound: 'd', emoji: '🌧️' },
  { word: 'wanted', sound: 'uhd', emoji: '🎁' },
  { word: 'painted', sound: 'uhd', emoji: '🎨' },
  { word: 'rested', sound: 'uhd', emoji: '😴' },
  { word: 'landed', sound: 'uhd', emoji: '🛬' },
];
/** The three fixed voice-buckets shown every round, with kid-facing labels. */
export const ED_VOICES: { id: EdSound; label: string; example: string }[] = [
  { id: 't', label: '/t/', example: 'jumped' },
  { id: 'd', label: '/d/', example: 'played' },
  { id: 'uhd', label: '/uh-d/', example: 'wanted' },
];
export function buildEdRounds(n: number, rng: () => number = Math.random): EdWord[] {
  return shuffle(ED_WORDS, rng).slice(0, n);
}

// ───────────────────────────────────────────────────────────────────────────
// 6) Block Sort — sort each word into its affix bin, with a "Not a Part!" bin for
//    FALSE affixes (under, red, bring) — the "check the base" discernment the
//    research flagged as the level's crucial aha.
// ───────────────────────────────────────────────────────────────────────────
export interface SortWord { word: string; affix: string | null } // null = false affix (no real base)
export const SORT_WORDS: SortWord[] = [
  { word: 'jumping', affix: 'ing' },
  { word: 'resting', affix: 'ing' },
  { word: 'helped', affix: 'ed' },
  { word: 'called', affix: 'ed' },
  { word: 'unlock', affix: 'un' },
  { word: 'unpack', affix: 'un' },
  { word: 'replay', affix: 're' },
  { word: 'refill', affix: 're' },
  // false affixes — the edge letters LOOK like a part but peel to no real base:
  { word: 'under', affix: null }, // un + der → "der" isn't a word
  { word: 'uncle', affix: null }, // un + cle → not a word
  { word: 'red', affix: null }, // re + d → too short, not a base
  { word: 'ring', affix: null }, // r + ing → "r" isn't a base
  { word: 'bring', affix: null }, // br + ing → "br" isn't a base
  { word: 'dish', affix: null }, // dis + h → "h" isn't a base
];
/** The bins shown every round (the real affixes + the reject bin). */
export const SORT_BINS: { id: string; label: string }[] = [
  { id: 'un', label: 'un‑' },
  { id: 're', label: 're‑' },
  { id: 'ing', label: '‑ing' },
  { id: 'ed', label: '‑ed' },
  { id: 'none', label: 'Not a Part!' },
];
export interface SortRound { word: string; answer: string } // answer = affix id, or 'none'
export function buildSortRounds(n: number, rng: () => number = Math.random): SortRound[] {
  return shuffle(SORT_WORDS, rng).slice(0, n).map((w) => ({ word: w.word, answer: w.affix ?? 'none' }));
}
