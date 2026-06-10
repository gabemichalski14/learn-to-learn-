/**
 * Curriculum registry: the 10 structured-literacy levels, each holding a sub-menu of games.
 * PLACEHOLDER lineup — titles/focus and the per-level games are first-pass and
 * will be finalised against the full structured-literacy scope & sequence. Game
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
    focus: 'Hearing and changing the sounds in spoken words (oral, no letters)',
    games: [
      { id: 'tap-it-out', title: 'Tap It Out', emoji: '🌱', tagline: 'Tap a sprout for each sound you hear.', status: 'available', route: '#/play/tap-it-out' },
      { id: 'same-or-different', title: 'Same or Different?', emoji: '👂', tagline: 'Decide if two spoken words match.', status: 'available', route: '#/play/same-or-different' },
      { id: 'switch-it', title: 'Switch It', emoji: '🔁', tagline: 'Tap the sound that changed to make a new word.', status: 'available', route: '#/play/switch-it' },
    ],
  },
  {
    num: 2,
    title: 'Consonants & Short Vowels',
    focus: 'Letter sounds, blending, short vowels',
    games: [
      { id: 'beginning-sounds', title: 'Blast Off', emoji: '🚀', tagline: 'Launch each space critter by its first sound.', status: 'available', route: '#/play/beginning-sounds' },
      { id: 'ending-sounds', title: 'Touchdown', emoji: '🛬', tagline: 'Land each space critter by its last sound.', status: 'available', route: '#/play/ending-sounds' },
      { id: 'middle-sounds', title: 'Vowel Patrol', emoji: '🛸', tagline: 'Sort space critters by their middle vowel.', status: 'available', route: '#/play/middle-sounds' },
      { id: 'star-station', title: 'Star Station', emoji: '🛰️', tagline: 'Build the word you hear, letter by letter.', status: 'available', route: '#/play/star-station' },
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
    title: 'Syllable Division & Vowel Teams',
    focus: 'Open syllables, dividing big words, and long-vowel/vowel-team spelling',
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
    title: 'Advanced Vowel Teams',
    focus: 'The remaining vowel teams and the consonant-I /sh/ spellings',
    games: [
      soon('l8-teamup', 'Vowel Team-Up', '🧩', 'Sort words by their vowel team.'),
      soon('l8-manysounds', 'One Team, Many Sounds', '🎚️', 'Pick the sound the team makes (oo, ea…).'),
    ],
  },
  {
    num: 9,
    title: 'Influence of Foreign Languages',
    focus: 'Greek and French spelling patterns in borrowed words',
    games: [
      soon('l9-borrowed', 'Word Detective', '🕵️', 'Spot the clues that a word is borrowed.'),
      soon('l9-french', 'French Connection', '🥐', 'Read French patterns: que, eau, ch, é…'),
    ],
  },
  {
    num: 10,
    title: 'Greek Words & Latin Roots',
    focus: 'Latin roots, Chameleon prefixes, and Greek combining forms',
    games: [
      soon('l10-roots', 'Root Lab', '🧬', 'Build big words from Latin roots + prefixes.'),
      soon('l10-greek', 'Word Architect', '🏛️', 'Combine Greek forms to spell huge words.'),
    ],
  },
];

export function findLevel(num: number): LevelInfo | undefined {
  return LEVELS.find((l) => l.num === num);
}

/** The level number a game id belongs to (for mastery-gating game routes). */
export function levelOfGame(gameId: string): number | undefined {
  return LEVELS.find((l) => l.games.some((g) => g.id === gameId))?.num;
}

export function availableCount(level: LevelInfo): number {
  return level.games.filter((g) => g.status === 'available').length;
}
