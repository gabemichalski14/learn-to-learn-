import { parseSkillKey } from '../../mastery/skills';
import type { ReviewItem } from './review';

/**
 * Turns a due ReviewItem into a short RETRIEVAL trial for the "garden tending"
 * warm-up: hear a sound, tap the letter that makes it. Pure + deterministic.
 *
 * v1 covers the audio-recognition families — `sound:<pos>:<id>` skills and
 * confusable PAIRS of them (minimal-pair discrimination, the highest-value review
 * content). Other families (pa:/blend:/digraph:/read:…) have no audio-recognition
 * trial yet and are skipped (returns null) — a later iteration adds their shells.
 */

export interface TendingTrial {
  itemId: string;
  /** the sound id to PLAY as the cue */
  cue: string;
  /** grapheme options to show (includes the answer) */
  options: string[];
  /** the correct grapheme */
  answer: string;
  /** 'pair' = minimal-pair discrimination; 'skill' = recognition among distractors */
  kind: 'skill' | 'pair';
}

const POOL = 'bcdfghjklmnprstvwzaeiou'.split('');

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** A retrieval trial for one item, or null if its family has no trial yet. */
export function trialFor(item: ReviewItem, rng: () => number = Math.random): TendingTrial | null {
  if (item.kind === 'pair') {
    const parsed = item.members.map((m) => parseSkillKey(m));
    if (parsed.some((p) => !p)) return null; // only sound-family pairs in v1
    const sounds = parsed.map((p) => p!.soundId);
    const answer = sounds[Math.floor(rng() * sounds.length)];
    return { itemId: item.id, cue: answer, options: shuffle(sounds, rng), answer, kind: 'pair' };
  }
  const p = parseSkillKey(item.members[0]);
  if (!p) return null;
  const answer = p.soundId;
  const distractors = shuffle(POOL.filter((d) => d !== answer), rng).slice(0, 2);
  return { itemId: item.id, cue: answer, options: shuffle([answer, ...distractors], rng), answer, kind: 'skill' };
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
