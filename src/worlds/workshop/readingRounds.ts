import { resolveInventory } from '../../reading/inventory';
import { compose, type ReadingUnit } from '../../reading/compose';
import { admissibleWords, type LexEntry } from '../../reading/lexicon';

/**
 * Round builder for "Say It Again" (Level 3 echo reading). Each round is a
 * decodable sentence (from the reading engine) plus a COMPREHENSION question:
 * which picture is the sentence about? The answer is the sentence's subject; the
 * distractors are unrelated picturable words (never the sentence's own object), so
 * a child can't pass by word-calling without meaning. Pure + deterministic.
 */

export interface ReadingRound {
  unit: ReadingUnit;
  /** The comprehension answer (the sentence's subject) + 2 distractors, shuffled. */
  options: { word: string; emoji: string; correct: boolean }[];
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildReadingRounds(n: number, rng: () => number = Math.random, level = 3): ReadingRound[] {
  const inv = resolveInventory(level);
  const picturable = admissibleWords(inv).filter((e): e is LexEntry & { emoji: string } => e.imageable && !!e.emoji);
  const rounds: ReadingRound[] = [];

  for (let guard = 0; rounds.length < n && guard < n * 25; guard++) {
    const unit = compose(inv, 'sentence', rng);
    if (!unit) break;
    const subject = unit.words.find((w) => w.imageable && w.emoji);
    if (!subject?.emoji) continue;

    // distractors: picturable words that DON'T appear in this sentence (so the
    // sentence's own object is never an option — the choice tests meaning).
    const distractors = shuffle(
      picturable.filter((e) => !unit.words.some((w) => w.word === e.word)),
      rng,
    ).slice(0, 2);
    if (distractors.length < 2) continue;

    rounds.push({
      unit,
      options: shuffle(
        [
          { word: subject.word, emoji: subject.emoji, correct: true },
          ...distractors.map((d) => ({ word: d.word, emoji: d.emoji, correct: false })),
        ],
        rng,
      ),
    });
  }
  return rounds;
}
