/**
 * Curriculum registry: the 10 Barton levels, each holding a sub-menu of games.
 * PLACEHOLDER lineup — titles/focus and the per-level games are first-pass and
 * will be finalised against the full scanned Barton scope & sequence. Game
 * NAMES are intentionally playful; the tagline states the actual skill so a
 * tutor always knows what each game practises. (All content is our own.)
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
      soon('l1-first', 'First Things First', '👂', 'Tap the picture that starts the same.'),
      soon('l1-blend', 'Sound Smoosh', '🫨', 'Squish the sounds together into a word.'),
    ],
  },
  {
    num: 2,
    title: 'Consonants & Short Vowels',
    focus: 'Letter sounds, blending, short vowels',
    games: [
      { id: 'beginning-sounds', title: 'Sound Safari', emoji: '🔊', tagline: 'Sort each picture by its first sound.', status: 'available', route: '#/play/beginning-sounds' },
      { id: 'ending-sounds', title: 'Last Sound Standing', emoji: '🏁', tagline: 'Sort each picture by its last sound.', status: 'available', route: '#/play/ending-sounds' },
      soon('l2-vowel', 'Vowel Patrol', '🚓', 'Catch the short vowel in the middle.'),
      soon('l2-build', 'Brick by Brick', '🧱', 'Spell the word you hear.'),
    ],
  },
  {
    num: 3,
    title: 'Closed Syllables & Spelling Rules',
    focus: 'Closed syllables, blends, first spelling rules',
    games: [
      soon('l3-syll', 'Chop Shop', '🔪', 'Chop words into syllables.'),
      soon('l3-rules', 'Rule Breakers', '📏', 'Pick the right ending (ff, ll, ss…).'),
    ],
  },
  {
    num: 4,
    title: 'Syllable Division',
    focus: 'Dividing and reading multisyllable words',
    games: [
      soon('l4-split', 'The Great Divide', '✂️', 'Split big words into parts.'),
      soon('l4-read', 'Word Giants', '🦕', 'Read longer words part by part.'),
    ],
  },
  {
    num: 5,
    title: 'Vowel-Consonant-e',
    focus: 'Magic-e and open syllables',
    games: [soon('l5-magic', 'Name Change', '✨', 'Magic-e makes the vowel say its name.')],
  },
  {
    num: 6,
    title: 'Suffixes & Spelling Rules',
    focus: 'Adding endings: doubling, drop-e, change-y',
    games: [soon('l6-suffix', 'Happy Endings', '➕', 'Add the ending the right way.')],
  },
  {
    num: 7,
    title: 'Prefixes & Vowel Teams',
    focus: 'Prefixes and common vowel teams',
    games: [
      soon('l7-prefix', 'Front Loaders', '🚜', 'Match the prefix to its meaning.'),
      soon('l7-team', 'Tag Team', '👥', 'Two vowels team up — sort them.'),
    ],
  },
  {
    num: 8,
    title: 'Advanced Vowel Teams',
    focus: 'Vowel-R and advanced vowel teams',
    games: [soon('l8-vr', 'Pirate Talk', '🏴‍☠️', 'Sort the arr, or, er sounds.')],
  },
  {
    num: 9,
    title: 'Influence of Latin',
    focus: 'Latin roots and affixes',
    games: [soon('l9-latin', 'Root Awakening', '🏛️', 'Build words from Latin roots.')],
  },
  {
    num: 10,
    title: 'Greek Combining Forms',
    focus: 'Greek word parts',
    games: [soon('l10-greek', "It's All Greek", '🔱', 'Combine Greek word parts.')],
  },
];

export function findLevel(num: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.num === num);
}

export function availableCount(level: LevelInfo): number {
  return level.games.filter((g) => g.status === 'available').length;
}
