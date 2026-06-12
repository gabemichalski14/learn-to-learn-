/**
 * Curriculum model — our INTERNAL skeleton of the general structured-literacy
 * (Orton–Gillingham-based) skill progression. It encodes only the unprotectable
 * METHOD and FACTS — which skill comes before which, and which sound a letter
 * makes — re-derived from first principles / public OG sources. We build our OWN
 * word/picture sets and game content from it.
 *
 * IP boundary (see docs/IP-CURRICULUM.md): a teaching method/sequence is NOT
 * copyrightable (Baker v. Selden; 17 U.S.C. §102(b)), but a specific published
 * program's scope & sequence — its exact lesson titles, groupings, "Book N"
 * structure, and invented mnemonic NAMES — is its protected expression. So this
 * file deliberately contains NONE of that: no program book/section names, no
 * lesson-by-lesson transcription, no branded mnemonics. Lesson labels here are
 * plain descriptions of the skill (e.g. "final blends", "soft c and g"). This
 * file is internal-only and a lint rule bans importing it into any view (.tsx).
 *
 * Skill tags drive which game types belong to a stage:
 *   'segment'    hear a word, break it into sounds
 *   'blend'      push sounds together into a word
 *   'manipulate' break, replace, or remove a sound
 *   'compare'    decide if two spoken words are the same or different
 *   'first'      identify the first sound
 *   'last'       identify the last sound
 *   'sound'      letter ↔ sound for a new grapheme
 *   'read'       decode words/phrases/sentences
 *   'spell'      encode (build) words from sounds
 */
export type Skill =
  | 'segment'
  | 'blend'
  | 'manipulate'
  | 'compare'
  | 'first'
  | 'last'
  | 'sound'
  | 'read'
  | 'spell';

export interface Lesson {
  n: number;
  /** Plain description of the skill this stage practises (our own words). */
  title: string;
  /** Skills this stage practises (drive game generation). */
  skills: Skill[];
}

export interface LevelCurriculum {
  level: number;
  title: string;
  focus: string;
  lessons: Lesson[];
}

// The general structured-literacy progression, in our own words. Stages within a
// level are a sensible teaching order, not a transcription of any one program.
export const CURRICULUM: LevelCurriculum[] = [
  {
    level: 1,
    title: 'Phonemic Awareness',
    focus: 'Hearing and changing the sounds in spoken words (oral, no letters)',
    lessons: [
      { n: 1, title: 'Break apart two-sound words', skills: ['segment', 'manipulate', 'compare'] },
      { n: 2, title: 'Break apart three-sound (CVC) words', skills: ['segment', 'manipulate', 'compare'] },
      { n: 3, title: 'Words ending in a blend', skills: ['segment', 'manipulate', 'compare'] },
      { n: 4, title: 'Words starting with a blend', skills: ['segment', 'manipulate', 'compare'] },
      { n: 5, title: 'Blend and change sounds in real words', skills: ['segment', 'blend', 'manipulate', 'compare'] },
    ],
  },
  {
    level: 2,
    title: 'Consonants & Short Vowels',
    focus: 'Letter sounds, blending, reading and spelling short-vowel words',
    lessons: [
      { n: 1, title: 'First short vowel + a set of consonants', skills: ['sound', 'first', 'last', 'read', 'spell'] },
      { n: 2, title: 'Second short vowel + more consonants', skills: ['sound', 'first', 'last', 'read', 'spell'] },
      { n: 3, title: 'Third short vowel + more consonants', skills: ['sound', 'first', 'last', 'read', 'spell'] },
      { n: 4, title: 'Fourth short vowel + remaining consonants', skills: ['sound', 'first', 'last', 'read', 'spell'] },
      { n: 5, title: 'Fifth short vowel + consonant digraphs', skills: ['sound', 'first', 'last', 'read', 'spell'] },
    ],
  },
  {
    level: 3,
    title: 'Closed Syllables',
    focus: 'Blends, digraphs, and the first closed-syllable spelling rules',
    lessons: [
      { n: 1, title: 'Final consonant blends', skills: ['read', 'spell'] },
      { n: 2, title: 'Initial consonant blends', skills: ['read', 'spell'] },
      { n: 3, title: 'Blends at both ends', skills: ['read', 'spell'] },
      { n: 4, title: 'Digraphs and three-letter blends', skills: ['read', 'spell'] },
      { n: 5, title: 'Doubling f, l, s, z after a short vowel', skills: ['spell', 'read'] },
      { n: 6, title: 'Choosing c or k to start a word', skills: ['spell', 'read'] },
      { n: 7, title: '-ck vs -k after a short vowel', skills: ['spell', 'read'] },
      { n: 8, title: 'Glued units (ing, ink, …)', skills: ['spell', 'read'] },
      { n: 9, title: '-tch vs -ch after a short vowel', skills: ['spell', 'read'] },
    ],
  },
  {
    level: 4,
    title: 'Long Vowels & Big Words',
    focus: 'Open syllables, dividing multisyllable words, and long-vowel / vowel-team spelling',
    lessons: [
      { n: 1, title: 'Open syllables (a vowel says its name)', skills: ['read', 'spell'] },
      { n: 2, title: 'Dividing two-syllable words to read them', skills: ['read', 'spell'] },
      { n: 3, title: 'More syllable-division patterns', skills: ['read', 'spell'] },
      { n: 4, title: 'Choosing c / k / ck inside a word', skills: ['spell', 'read'] },
      { n: 5, title: 'Doubling a consonant in the middle', skills: ['spell', 'read'] },
      { n: 6, title: 'The unstressed (schwa) vowel', skills: ['spell', 'read'] },
      { n: 7, title: 'Three-syllable words', skills: ['read', 'spell'] },
      { n: 8, title: 'Long vowels and vowel teams', skills: ['spell', 'read'] },
    ],
  },
  {
    level: 5,
    title: 'Prefixes & Suffixes',
    focus: 'Plurals, suffixes (-s, -ed, -ing), suffix spelling rules, and prefixes',
    lessons: [
      { n: 1, title: 'Plurals: -s vs -es', skills: ['spell', 'read'] },
      { n: 2, title: 'Consonant suffixes', skills: ['spell', 'read'] },
      { n: 3, title: 'Doubling before a vowel suffix', skills: ['spell', 'read'] },
      { n: 4, title: 'The three sounds of -ed', skills: ['read', 'spell'] },
      { n: 5, title: 'Vowel suffixes', skills: ['spell', 'read'] },
      { n: 6, title: 'Drop silent-e / change y to i', skills: ['spell', 'read'] },
      { n: 7, title: 'Common prefixes', skills: ['read', 'spell'] },
    ],
  },
  {
    level: 6,
    title: 'Silent-E & Consonant-LE',
    focus: 'The jobs of silent-E, suffix spelling rules, and the Consonant-LE syllable',
    lessons: [
      { n: 1, title: 'Silent-E in one-syllable words', skills: ['read', 'spell'] },
      { n: 2, title: 'Soft c and g before e/i', skills: ['read', 'spell'] },
      { n: 3, title: 'Adding a silent-E after v', skills: ['spell', 'read'] },
      { n: 4, title: 'Dropping silent-E before a vowel suffix', skills: ['spell', 'read'] },
      { n: 5, title: 'Word endings: -tion and -sion', skills: ['spell', 'read'] },
      { n: 6, title: 'The Consonant-LE syllable (table, candle)', skills: ['read', 'spell'] },
      { n: 7, title: 'Choosing -able vs -ible', skills: ['spell', 'read'] },
    ],
  },
  {
    level: 7,
    title: 'Vowel-R Syllables',
    focus: 'R-controlled vowels (ar, or, er, ir, ur) and their spelling choices',
    lessons: [
      { n: 1, title: 'ar and or', skills: ['read', 'spell'] },
      { n: 2, title: 'er, ir, ur (one sound, three spellings)', skills: ['read', 'spell'] },
      { n: 3, title: 'Vowel-R with silent-E', skills: ['read', 'spell'] },
      { n: 4, title: 'Vowel-R with prefixes and suffixes', skills: ['read', 'spell'] },
      { n: 5, title: 'A w before the vowel-R changes its sound', skills: ['read', 'spell'] },
      { n: 6, title: 'The three sounds of ear', skills: ['read', 'spell'] },
      { n: 7, title: 'Endings: -ary, -ery, -ory', skills: ['spell', 'read'] },
    ],
  },
  {
    level: 8,
    title: 'Advanced Vowel Teams',
    focus: 'The consonant-I /sh/ spellings and the remaining vowel teams',
    lessons: [
      { n: 1, title: 'Consonant + i spellings that say /sh/', skills: ['spell', 'read'] },
      { n: 2, title: 'Vowel team: ie', skills: ['read', 'spell'] },
      { n: 3, title: 'Vowel teams: oi, oy, ey', skills: ['read', 'spell'] },
      { n: 4, title: 'Vowel teams: au, aw', skills: ['read', 'spell'] },
      { n: 5, title: 'The two sounds of oo', skills: ['read', 'spell'] },
      { n: 6, title: 'Vowel teams: ou, ow', skills: ['read', 'spell'] },
      { n: 7, title: 'The three sounds of ea', skills: ['read', 'spell'] },
      { n: 8, title: 'Long-vowel teams: igh, eigh, …', skills: ['read', 'spell'] },
    ],
  },
  {
    level: 9,
    title: 'Foreign Word Patterns',
    focus: 'Greek and French spelling patterns in borrowed words',
    lessons: [
      { n: 1, title: 'Greek patterns (ch says /k/, silent-letter pairs)', skills: ['read', 'spell'] },
      { n: 2, title: 'Clues that a word is borrowed', skills: ['read', 'spell'] },
      { n: 3, title: 'French endings (que, ic, …)', skills: ['read', 'spell'] },
      { n: 4, title: 'French silent letters and accents', skills: ['read', 'spell'] },
    ],
  },
  {
    level: 10,
    title: 'Greek & Latin Roots',
    focus: 'Latin roots, assimilating prefixes, and Greek combining forms — morphology',
    lessons: [
      { n: 1, title: 'Assimilating prefixes (in → im/il/ir)', skills: ['read', 'spell'] },
      { n: 2, title: 'Latin roots with prefixes and suffixes', skills: ['read', 'spell'] },
      { n: 3, title: 'Greek combining forms', skills: ['read', 'spell'] },
      { n: 4, title: 'Building big academic words from parts', skills: ['read', 'spell'] },
    ],
  },
];

export function levelCurriculum(level: number): LevelCurriculum | undefined {
  return CURRICULUM.find((l) => l.level === level);
}
