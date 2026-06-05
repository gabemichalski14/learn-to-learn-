/**
 * Curriculum registry: the 10 Barton levels, each holding a sub-menu of games.
 * PLACEHOLDER lineup — titles/focus and the per-level games are first-pass and
 * will be finalised against the full scanned Barton scope & sequence. Our one
 * built game (Beginning Sounds Match) lives under Level 2, where letter-sound
 * work begins in the sequence.
 */
export interface GameInfo {
  id: string;
  title: string;
  tagline: string;
  emoji: string;
  status: 'available' | 'soon';
  route?: string;
}

export interface LevelInfo {
  num: number;
  title: string;
  focus: string;
  games: GameInfo[];
}

const soon = (id: string, title: string, emoji: string, tagline: string): GameInfo => ({
  id,
  title,
  emoji,
  tagline,
  status: 'soon',
});

export const LEVELS: LevelInfo[] = [
  {
    num: 1,
    title: 'Phonemic Awareness',
    focus: 'Hearing the sounds in spoken words (oral)',
    games: [
      soon('l1-rhyme', 'Rhyme Time', '🎵', 'Find the pictures that rhyme.'),
      soon('l1-first', 'First Sound', '👂', 'Tap the picture that starts the same.'),
      soon('l1-blend', 'Blend & Segment', '🧩', 'Push the sounds together into a word.'),
    ],
  },
  {
    num: 2,
    title: 'Consonants & Short Vowels',
    focus: 'Letter sounds, blending, short vowels',
    games: [
      { id: 'beginning-sounds', title: 'Beginning Sounds Match', emoji: '🔊', tagline: 'Sort each picture by its first sound.', status: 'available', route: '#/play' },
      soon('l2-ending', 'Ending Sounds', '🎯', 'Sort by the sound a word ends with.'),
      soon('l2-vowel', 'Short Vowel Sort', '🅰️', 'Sort words by their short vowel.'),
      soon('l2-build', 'Build-a-Word', '🧱', 'Spell the word you hear.'),
    ],
  },
  {
    num: 3,
    title: 'Closed Syllables & Spelling Rules',
    focus: 'Closed syllables, blends, first spelling rules',
    games: [
      soon('l3-syll', 'Syllable Sort', '✂️', 'Sort closed and open syllables.'),
      soon('l3-rules', 'Spelling Rules', '📏', 'Pick the right ending (ff, ll, ss…).'),
    ],
  },
  {
    num: 4,
    title: 'Syllable Division',
    focus: 'Dividing and reading multisyllable words',
    games: [
      soon('l4-split', 'Split the Syllables', '🔪', 'Break big words into parts.'),
      soon('l4-read', 'Read the Big Word', '📖', 'Read longer words part by part.'),
    ],
  },
  {
    num: 5,
    title: 'Vowel-Consonant-e',
    focus: 'Magic-e and open syllables',
    games: [soon('l5-magic', 'Magic-e Match', '✨', 'Make short vowels say their name.')],
  },
  {
    num: 6,
    title: 'Suffixes & Spelling Rules',
    focus: 'Adding endings: doubling, drop-e, change-y',
    games: [soon('l6-suffix', 'Suffix Builder', '➕', 'Add the ending the right way.')],
  },
  {
    num: 7,
    title: 'Prefixes & Vowel Teams',
    focus: 'Prefixes and common vowel teams',
    games: [
      soon('l7-prefix', 'Prefix Match', '🔤', 'Match prefixes to their meaning.'),
      soon('l7-team', 'Vowel Team Sort', '👥', 'Sort words by their vowel team.'),
    ],
  },
  {
    num: 8,
    title: 'Advanced Vowel Teams',
    focus: 'Vowel-R and advanced vowel teams',
    games: [soon('l8-vr', 'Vowel-R Sort', '🚗', 'Sort ar, or, er, ir, ur words.')],
  },
  {
    num: 9,
    title: 'Influence of Latin',
    focus: 'Latin roots and affixes',
    games: [soon('l9-latin', 'Latin Roots', '🏛️', 'Build words from Latin roots.')],
  },
  {
    num: 10,
    title: 'Greek Combining Forms',
    focus: 'Greek word parts',
    games: [soon('l10-greek', 'Greek Forms', '🔱', 'Combine Greek word parts.')],
  },
];

export function findLevel(num: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.num === num);
}

export function availableCount(level: LevelInfo): number {
  return level.games.filter((g) => g.status === 'available').length;
}
