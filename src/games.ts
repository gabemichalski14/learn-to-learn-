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
      { id: 'rhyme-time', title: 'Rhyme Time', emoji: '🎵', tagline: 'Hear a word — tap the picture that rhymes.', status: 'available', route: '#/play/rhyme-time' },
      { id: 'blend-it', title: 'Blend It', emoji: '🔡', tagline: 'Hear the sounds, then tap the word they make.', status: 'available', route: '#/play/blend-it' },
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
      { id: 'word-beam', title: 'Word Beam', emoji: '📡', tagline: 'Hear a word — spell it from the whole alphabet.', status: 'available', route: '#/play/word-beam' },
      { id: 'warp-speed', title: 'Warp Speed', emoji: '☄️', tagline: 'Read each word fast and tap its picture.', status: 'available', route: '#/play/warp-speed' },
      { id: 'plant-the-word', title: 'Plant the Word', emoji: '💛', tagline: 'Learn a tricky word by heart — then spell it.', status: 'available', route: '#/play/plant-the-word' },
    ],
  },
  {
    num: 3,
    title: "Patch's Workshop",
    focus: 'Closed syllables, blends, digraphs, and the first spelling rules',
    games: [
      { id: 'blend-buddies', title: 'Blend Buddies', emoji: '🧵', tagline: 'Build the word — keep both blend buddies together.', status: 'available', route: '#/play/blend-buddies' },
      { id: 'sort-it', title: 'Sort It', emoji: '🗂️', tagline: 'Sort words by their digraph (sh, ch, th…).', status: 'available', route: '#/play/sort-it' },
      { id: 'rule-breakers', title: 'Rule Breakers', emoji: '📏', tagline: 'Pick the right ending (ck, ff, ll, ss).', status: 'available', route: '#/play/rule-breakers' },
      { id: 'chop-shop', title: 'Chop Shop', emoji: '🪚', tagline: 'Chop two-syllable words in two.', status: 'available', route: '#/play/chop-shop' },
      { id: 'patches-dictation', title: "Patch's Dictation", emoji: '✏️', tagline: 'Hear a word — spell it from the whole alphabet.', status: 'available', route: '#/play/patches-dictation' },
      { id: 'tool-time', title: 'Tool Time', emoji: '🔧', tagline: 'Read each word fast and grab its picture.', status: 'available', route: '#/play/tool-time' },
      { id: 'say-it-again', title: 'Say It Again', emoji: '🗣️', tagline: 'Read a sentence back to Patch — then show what it means.', status: 'available', route: '#/play/say-it-again' },
      { id: 'whats-it-about', title: "What's It About?", emoji: '📖', tagline: 'Read a sentence, then tap the picture it means.', status: 'available', route: '#/play/whats-it-about' },
    ],
  },
  {
    num: 4,
    title: 'Long Vowels & Big Words',
    focus: 'Silent-e, open syllables, and dividing big words to read them part by part',
    games: [
      { id: 'name-change', title: 'Name Change', emoji: '✨', tagline: 'Add the magic e — the vowel says its name.', status: 'available', route: '#/play/name-change' },
      { id: 'long-or-short', title: 'Long or Short?', emoji: '📏', tagline: 'Is the vowel long (says its name) or short?', status: 'available', route: '#/play/long-or-short' },
      { id: 'great-divide', title: 'The Great Divide', emoji: '✂️', tagline: 'Tap where the big word comes apart.', status: 'available', route: '#/play/great-divide' },
      { id: 'word-giants', title: 'Word Giants', emoji: '🦕', tagline: 'Read longer words part by part.', status: 'available', route: '#/play/word-giants' },
      { id: 'l4-dictation', title: 'Name Change Dictation', emoji: '✏️', tagline: 'Hear a magic-e word — spell it.', status: 'available', route: '#/play/l4-dictation' },
      { id: 'giant-steps', title: 'Giant Steps', emoji: '🏔️', tagline: 'Read long words fast, one step at a time.', status: 'available', route: '#/play/giant-steps' },
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
    title: 'Silent-E & Consonant-LE',
    focus: 'The jobs of silent-E, suffix rules, and the Consonant-LE syllable',
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
    title: 'Foreign Word Patterns',
    focus: 'Greek and French spelling patterns in borrowed words',
    games: [
      soon('l9-borrowed', 'Word Detective', '🕵️', 'Spot the clues that a word is borrowed.'),
      soon('l9-french', 'French Connection', '🥐', 'Read French patterns: que, eau, ch, é…'),
    ],
  },
  {
    num: 10,
    title: 'Greek & Latin Roots',
    focus: 'Latin roots, assimilating prefixes, and Greek combining forms',
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
