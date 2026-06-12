import { type ReadingUnit } from './compose';
import { admissibleWords, type LexEntry } from './lexicon';
import { type TaughtInventory } from './inventory';

/**
 * The comprehension engine — the LANGUAGE strand on top of decoding. It turns a
 * decodable sentence into a literal-comprehension question: read the sentence, then
 * pick the PICTURE it's about. The trick that makes it real comprehension (not
 * picture-matching): distractors are drawn from the SAME semantic category as the
 * answer (an animal answer gets other animals), so the child must understand the
 * specific sentence — exactly the skill that turns "decodes accurately" into "reads
 * profoundly". Pure + deterministic (injectable RNG); reuses the composer's words +
 * the lexicon's semantic tags. ORIGINAL content.
 */

export type AskKind = 'who' | 'what' | 'where';

export interface MeaningQuestion {
  /** the decodable sentence the child reads first */
  sentence: string;
  ask: AskKind;
  /** child-facing question (audio-supported; answers are pictures so it needn't be decodable) */
  prompt: string;
  /** the correct content word (imageable) */
  answer: LexEntry;
  /** answer + same-category distractors, shuffled — all imageable + admissible */
  options: LexEntry[];
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Same-category candidates (animals / places / plain objects), imageable, admissible,
 *  excluding the answer — so the choice tests comprehension, not categorization. */
export function distractorPool(answer: LexEntry, pool: LexEntry[]): LexEntry[] {
  const notAnswer = (e: LexEntry) => e.word.toLowerCase() !== answer.word.toLowerCase() && e.imageable;
  if (answer.animate) return pool.filter((e) => e.animate && notAnswer(e));
  if (answer.place) return pool.filter((e) => e.place && notAnswer(e));
  return pool.filter((e) => e.pos === 'noun' && !e.animate && !e.place && notAnswer(e));
}

/**
 * Build a meaning-check question from a composed sentence, or null if the sentence
 * has no picturable target or too few same-category distractors for a real choice.
 */
export function makeMeaningQuestion(unit: ReadingUnit, inv: TaughtInventory, rng: () => number = Math.random): MeaningQuestion | null {
  if (unit.kind === 'phrase') return null; // need a proposition to comprehend
  const content = unit.words.filter((e) => e.imageable);
  if (content.length === 0) return null;

  const subject = content.find((e) => e.animate);
  const place = content.find((e) => e.place);

  let answer: LexEntry;
  let ask: AskKind;
  let prompt: string;
  if (place && subject && place.word !== subject.word) {
    answer = place; ask = 'where'; prompt = `Where is the ${subject.word}?`;
  } else if (subject) {
    answer = subject; ask = 'who'; prompt = 'Who is it about?';
  } else {
    answer = content[0]; ask = 'what'; prompt = 'What is it about?';
  }

  const distractors = shuffle(distractorPool(answer, admissibleWords(inv)), rng).slice(0, 2);
  if (distractors.length < 2) return null; // no real choice → skip

  return { sentence: unit.text, ask, prompt, answer, options: shuffle([answer, ...distractors], rng) };
}
