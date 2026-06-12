import { parseSkillKey } from '../../mastery/skills';
import { HEART_WORDS } from '../../content/packs/heartWords';
import type { ReviewItem } from './review';

/**
 * Turns a due ReviewItem into a short RETRIEVAL trial for the "garden tending"
 * warm-up: hear a cue, tap the answer. Pure + deterministic.
 *
 * Covers the families that have a clean recognition trial:
 *   sound:<pos>:<id>  → hear the sound, tap the letter (+ confusable PAIRS as
 *                       minimal-pair discrimination)
 *   heart:<word>      → hear the word, tap the word (sight-word recognition)
 *   digraph:<x>       → hear it, tap the letter team
 *   blend:<pos>:<x>   → hear it, tap the blend
 * Bespoke families:
 *   pa:segment        → hear a word, tap HOW MANY sounds (segmentation retrieval)
 *   read:*            → READ a shown word, tap its picture (reading for meaning)
 * The remaining abstract families (pa:blend/rhyme, rule:/syll:/vce/vowel:/div:) still
 * need their own mechanics and are skipped (return null).
 */

export interface TendingTrial {
  itemId: string;
  /** what to PLAY (sound/word) or SHOW (read) as the cue */
  cue: string;
  /** sound = play a phoneme; word = play a whole word; read = SHOW the word and do
   *  NOT speak it — the child reads it and taps its picture. */
  cueKind: 'sound' | 'word' | 'read';
  /** the child-facing question */
  prompt: string;
  /** options to show (includes the answer) */
  options: string[];
  /** the correct option */
  answer: string;
  kind: 'skill' | 'pair';
  /** render options as text labels (default) or emoji pictures. */
  optionKind?: 'text' | 'emoji';
  /** a11y labels for emoji options, parallel to `options`. */
  optionAria?: string[];
}

const LETTERS = 'bcdfghjklmnprstvwzaeiou'.split('');
const DIGRAPHS = ['sh', 'ch', 'th', 'wh', 'ck'];
const BLENDS = ['st', 'bl', 'cr', 'sp', 'tr', 'fl', 'gr', 'sn', 'pl', 'dr', 'cl', 'br'];
const HEART_LIST = HEART_WORDS.map((w) => w.word);

/** Short words with their PHONEME counts (not letters: fish = f-i-sh = 3) — for the
 *  pa:segment retrieval trial ("how many sounds?"). */
const SEGMENT_WORDS: { word: string; n: number }[] = [
  { word: 'at', n: 2 }, { word: 'up', n: 2 }, { word: 'on', n: 2 },
  { word: 'cat', n: 3 }, { word: 'sun', n: 3 }, { word: 'dog', n: 3 }, { word: 'pig', n: 3 },
  { word: 'bed', n: 3 }, { word: 'map', n: 3 }, { word: 'fish', n: 3 }, { word: 'ship', n: 3 },
  { word: 'frog', n: 4 }, { word: 'clap', n: 4 }, { word: 'stop', n: 4 }, { word: 'hand', n: 4 }, { word: 'jump', n: 4 },
];

/** Decodable, imageable words for the read: retrieval trial (read it, tap its picture). */
const READ_WORDS: { word: string; emoji: string }[] = [
  { word: 'cat', emoji: '🐱' }, { word: 'dog', emoji: '🐶' }, { word: 'sun', emoji: '☀️' },
  { word: 'pig', emoji: '🐷' }, { word: 'bed', emoji: '🛏️' }, { word: 'fish', emoji: '🐟' },
  { word: 'frog', emoji: '🐸' }, { word: 'bug', emoji: '🐛' }, { word: 'hat', emoji: '🎩' }, { word: 'cup', emoji: '🥤' },
];

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** answer + 2 distractors drawn from a pool, all shuffled. */
function withDistractors(answer: string, pool: readonly string[], rng: () => number): string[] {
  const distractors = shuffle(pool.filter((p) => p !== answer), rng).slice(0, 2);
  return shuffle([answer, ...distractors], rng);
}

/** A retrieval trial for one item, or null if its family has no trial yet. */
export function trialFor(item: ReviewItem, rng: () => number = Math.random): TendingTrial | null {
  // confusable PAIR (sound family) → minimal-pair discrimination
  if (item.kind === 'pair') {
    const parsed = item.members.map((m) => parseSkillKey(m));
    if (parsed.some((p) => !p)) return null;
    const sounds = parsed.map((p) => p!.soundId);
    const answer = sounds[Math.floor(rng() * sounds.length)];
    return { itemId: item.id, cue: answer, cueKind: 'sound', prompt: 'Which one says it?', options: shuffle(sounds, rng), answer, kind: 'pair' };
  }

  const key = item.members[0];

  // sound:<pos>:<id> → hear the sound, tap the letter
  const p = parseSkillKey(key);
  if (p) {
    return { itemId: item.id, cue: p.soundId, cueKind: 'sound', prompt: 'Tap the sound you hear.', options: withDistractors(p.soundId, LETTERS, rng), answer: p.soundId, kind: 'skill' };
  }

  const [family, a, b] = key.split(':');
  if (family === 'heart' && a) {
    return { itemId: item.id, cue: a, cueKind: 'word', prompt: 'Tap the word you hear.', options: withDistractors(a, HEART_LIST, rng), answer: a, kind: 'skill' };
  }
  if (family === 'digraph' && a) {
    return { itemId: item.id, cue: a, cueKind: 'sound', prompt: 'Tap the letter team you hear.', options: withDistractors(a, DIGRAPHS, rng), answer: a, kind: 'skill' };
  }
  if (family === 'blend' && b) {
    return { itemId: item.id, cue: b, cueKind: 'sound', prompt: 'Tap the blend you hear.', options: withDistractors(b, BLENDS, rng), answer: b, kind: 'skill' };
  }

  // pa:segment → hear a word, tap HOW MANY sounds (the retrieval form of segmenting)
  if (family === 'pa' && a === 'segment') {
    const w = SEGMENT_WORDS[Math.floor(rng() * SEGMENT_WORDS.length)];
    return { itemId: item.id, cue: w.word, cueKind: 'word', prompt: 'How many sounds do you hear?', options: ['2', '3', '4'], answer: String(w.n), kind: 'skill' };
  }
  // read:* → READ the word (shown, never spoken), tap its picture (reading for meaning)
  if (family === 'read') {
    const ans = READ_WORDS[Math.floor(rng() * READ_WORDS.length)];
    const opts = shuffle([ans, ...shuffle(READ_WORDS.filter((w) => w.word !== ans.word), rng).slice(0, 2)], rng);
    return { itemId: item.id, cue: ans.word, cueKind: 'read', prompt: 'Read it — tap its picture.', options: opts.map((w) => w.emoji), optionKind: 'emoji', optionAria: opts.map((w) => w.word), answer: ans.emoji, kind: 'skill' };
  }
  return null;
}

/** Build up to `cap` renderable trials from the due items (skips families without
 *  a trial yet). */
export function buildTrials(items: ReviewItem[], rng: () => number = Math.random, cap = 6): TendingTrial[] {
  const out: TendingTrial[] = [];
  for (const it of items) {
    const t = trialFor(it, rng);
    if (t) out.push(t);
    if (out.length >= cap) break;
  }
  return out;
}
