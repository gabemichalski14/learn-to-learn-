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
    focus: 'Open syllables, dividing big words, and long-vowel spelling',
    games: [
      soon('l4-split', 'The Great Divide', '✂️', 'Split big words into parts.'),
      soon('l4-magic', 'Name Change', '✨', 'Silent-e makes the vowel say its name.'),
      soon('l4-read', 'Word Giants', '🦕', 'Read longer words part by part.'),
    ],
  },
  {
    num: 5,
    title: 'Prefixes & Suffixes',
    focus: 'Plurals, suffixes (-s, -ed, -ing), spelling rules, and prefixes',
    games: [
      soon('l5-suffix', 'Happy Endings', '➕', 'Add the right ending: -s, -ed, -ing.'),
      soon('l5-prefix', 'Front Loaders', '🚜', 'Match the prefix to its meaning.'),
    ],
  },
  // Levels 6–10: titles and games fill in as each book is captured.
  // (Earlier themed guesses were off — VCe lives in Level 4, suffixes in Level 5.)
  {
    num: 6,
    title: 'Six Reasons for Silent-E',
    focus: 'Why silent-E is there, suffix rules, and Consonant-LE',
    games: [
      soon('l6-silente', 'Silent Partners', '🤫', 'Spot the reason each word needs a silent-E.'),
      soon('l6-drop', 'Drop It!', '💧', 'Drop the silent-E before adding -ing or -ed.'),
    ],
  },
  {
    num: 7,
    title: 'Vowel-R Syllables',
    focus: 'R-controlled vowels (ar, or, er, ir, ur) and their spelling rules',
    games: [
      soon('l7-bossyr', 'Bossy R', '👑', 'The R bosses the vowel — sort ar, or, er.'),
      soon('l7-er', 'Three Ways to /er/', '🔀', 'Match er, ir, and ur to the same sound.'),
    ],
  },
  {
    num: 8,
    title: 'Coming soon',
    focus: 'Captured from the book next',
    games: [soon('l8-soon', 'New games', '🧩', 'Lessons and games arrive once this book is filmed.')],
  },
  {
    num: 9,
    title: 'Coming soon',
    focus: 'Captured from the book next',
    games: [soon('l9-soon', 'New games', '🧩', 'Lessons and games arrive once this book is filmed.')],
  },
  {
    num: 10,
    title: 'Coming soon',
    focus: 'Captured from the book next',
    games: [soon('l10-soon', 'New games', '🧩', 'Lessons and games arrive once this book is filmed.')],
  },
];

export function findLevel(num: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.num === num);
}

export function availableCount(level: LevelInfo): number {
  return level.games.filter((g) => g.status === 'available').length;
}
