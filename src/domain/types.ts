export type SoundType = 'consonant' | 'vowel' | 'unit';

/** A single Barton sound. `id` is our internal key (e.g. 'b', 's', 'a'). */
export interface Phoneme {
  id: string;
  label: string; // shown to tutors only, never to the learner during play
  ipa: string;
  type: SoundType;
}

/**
 * A word the learner hears (never reads). `emoji` is a PLACEHOLDER picture for v1;
 * it is replaced by an illustration asset path (`image`) later.
 */
export interface WordItem {
  id: string;
  label: string;        // for tutors / alt-text / audio, not shown as text in play
  beginningSound: string; // a Phoneme id
  emoji: string;        // placeholder picture
  image?: string;       // future: path to real illustration
}

export interface Pack {
  id: string;
  name: string;
  words: WordItem[];
}

/** Mode A round: which baskets (target sounds) and which pictures to sort. */
export interface SortRound {
  baskets: string[];     // Phoneme ids, in display order
  items: WordItem[];     // pictures to sort, shuffled
}

/** Map of wordId -> the basket sound it has been correctly placed in. */
export type Placements = Record<string, string>;
