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
 * Abstract families (pa:* segment/blend/rhyme, rule:/syll:/vce/vowel:/div:, read:*)
 * need bespoke mechanics and are skipped (return null) — a later iteration.
 */

export interface TendingTrial {
  itemId: string;
  /** what to PLAY as the cue */
  cue: string;
  /** how to play the cue: a phoneme/unit (playSound) or a whole word (playWord) */
  cueKind: 'sound' | 'word';
  /** the child-facing question */
  prompt: string;
  /** options to show (includes the answer) */
  options: string[];
  /** the correct option */
  answer: string;
  kind: 'skill' | 'pair';
}

const LETTERS = 'bcdfghjklmnprstvwzaeiou'.split('');
const DIGRAPHS = ['sh', 'ch', 'th', 'wh', 'ck'];
const BLENDS = ['st', 'bl', 'cr', 'sp', 'tr', 'fl', 'gr', 'sn', 'pl', 'dr', 'cl', 'br'];
const HEART_LIST = HEART_WORDS.map((w) => w.word);

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
