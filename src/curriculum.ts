/**
 * Curriculum model — the single source of truth for what each level/lesson
 * teaches, distilled from the program's scope & sequence. We store the FACTUAL
 * skeleton (which sounds a lesson introduces + which skills it practises) and
 * build our OWN word/picture sets from it — we do not copy any program's
 * word lists, sentences, or scripts.
 *
 * Skill tags drive which game types belong to a lesson:
 *   'segment'  hear a word, break it into sounds      (oral / tile)
 *   'blend'    push sounds together into a word
 *   'first'    identify the first sound
 *   'last'     identify the last sound
 *   'sound'    keyword ↔ sound for a new letter
 *   'read'     decode words/phrases/sentences
 *   'spell'    encode (build) words from sounds
 */
export type Skill = 'segment' | 'blend' | 'first' | 'last' | 'sound' | 'read' | 'spell';

export interface Lesson {
  n: number;
  title: string;
  /** Short vowels introduced this lesson (letter ids). */
  vowels?: string[];
  /** Consonants introduced this lesson. */
  consonants?: string[];
  /** Digraphs / units introduced (sh, th, ch, wh, ck …). */
  digraphs?: string[];
  /** Skills this lesson practises (drive game generation). */
  skills: Skill[];
  /** Tutor-facing note; never shown to the learner. */
  note?: string;
}

export interface LevelCurriculum {
  level: number;
  title: string;
  focus: string;
  /** Source book label, e.g. "Book 2: Consonants & Short Vowels". */
  book?: string;
  /** Level 1 is oral phonemic awareness (no letters on screen). */
  oral?: boolean;
  /** One-line goal for the level. */
  summary?: string;
  /** The repeating skill flow WITHIN each lesson (drives a lesson's game order). */
  lessonFlow?: string[];
  /** Book sections / back-matter (every book ends with a Posttest). */
  sections?: string[];
  /** True when the lesson list is incomplete (e.g., the contents page wasn't captured). */
  partial?: boolean;
  lessons: Lesson[];
}

// Verified from the Level 1 + Level 2 books (title/contents + lesson pages) and
// the tutor's scope & sequence. Levels 3–10 fill in as those books are captured.
export const CURRICULUM: LevelCurriculum[] = [
  {
    level: 1,
    title: 'Phonemic Awareness',
    focus: 'Hearing the sounds in spoken words (oral, no letters)',
    book: 'Book 1: Phonemic Awareness',
    oral: true,
    summary: 'Hear and break apart the sounds in spoken words (no letters yet).',
    lessonFlow: ['Warm-up', 'Break the word into sounds (tiles)', 'Touch & say each sound', 'Blend back together'],
    sections: ['Scope Chart', 'Lessons (oral)', 'Optional Posttest', 'Student Pages'],
    lessons: [
      { n: 1, title: 'Break Apart VC Words', skills: ['segment'], note: 'Segment 2-sound (vowel-consonant) syllables with tiles.' },
      { n: 2, title: 'Break Apart CVC Words', skills: ['segment'], note: 'Segment 3-sound words.' },
      { n: 3, title: 'Break Apart Longer Words', skills: ['segment'], note: 'Segment 4+ sound words (blends).' },
      { n: 4, title: 'Blend & Manipulate Sounds', skills: ['blend', 'segment'] },
      { n: 5, title: 'Word Endings & Final Sounds', skills: ['last', 'segment'] },
    ],
  },
  {
    level: 2,
    title: 'Consonants & Short Vowels',
    focus: 'Letter sounds, blending, reading & spelling short-vowel words',
    book: 'Book 2: Consonants & Short Vowels',
    summary: 'By the end: all 5 short vowels, all 21 consonants, and 5 common digraphs.',
    lessonFlow: ['Review', 'New Vowel', 'New Consonants', 'Read & Spell Words', 'Read 3 Types of Phrases', 'Read & Mark Sentences', 'Optional Practice'],
    sections: ['Overview', 'Lessons', 'Games', 'Tips & Error Correction', 'Posttest', 'Student Pages'],
    lessons: [
      // Each lesson adds ONE short vowel + a set of consonants/units; lessons are
      // cumulative, so later games can draw from all sounds taught so far.
      { n: 1, title: '1 Vowel, 6 Consonants', vowels: ['a'], consonants: ['b', 'f', 'm', 'p', 's', 't'], skills: ['sound', 'first', 'last', 'read', 'spell'], note: 'Keyword Apple for short a; teach consonant keyword only if unknown.' },
      { n: 2, title: 'Short i + 6 Consonants', vowels: ['i'], consonants: ['c', 'g', 'h', 'l', 'n', 'r'], skills: ['sound', 'first', 'last', 'read', 'spell'] },
      { n: 3, title: 'Short o + 5 Consonants', vowels: ['o'], consonants: ['d', 'j', 'k', 'v', 'z'], skills: ['sound', 'first', 'last', 'read', 'spell'], note: 'Balloons-Pigs trick for b/p confusion.' },
      { n: 4, title: 'Short u + w, x, y, qu', vowels: ['u'], consonants: ['w', 'x', 'y', 'qu'], skills: ['sound', 'first', 'last', 'read', 'spell'] },
      { n: 5, title: 'Short e + Digraphs', vowels: ['e'], digraphs: ['sh', 'th', 'ch', 'wh', 'ck'], skills: ['sound', 'first', 'last', 'read', 'spell'], note: 'Digraphs = two letters, one sound (ship, then, chick, when, sock).' },
    ],
  },
  {
    level: 3,
    title: 'Closed Syllables',
    focus: 'Blends, digraphs, and closed-syllable spelling rules',
    book: 'Book 3: Closed Syllables',
    summary: 'Read & spell closed-syllable words with blends and digraphs; learn the core spelling rules.',
    lessonFlow: ['Review', 'New Concept / Rule', 'Read Words', 'Spell Words', 'Read Phrases', 'Read & Mark Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Games', 'Tips & Error Correction', 'Posttest', 'Student Pages'],
    lessons: [
      { n: 1, title: 'Blends at the End', skills: ['read', 'spell'], note: 'Final consonant blends; tell a blend (2 sounds) from a digraph (1 sound).' },
      { n: 2, title: 'Blends at the Beginning', skills: ['read', 'spell'], note: 'Initial consonant blends.' },
      { n: 3, title: 'Blends at Both Ends', skills: ['read', 'spell'] },
      { n: 4, title: 'Digraphs & 3-Letter Blends', skills: ['read', 'spell'], note: 'Digraphs plus three-letter blends (e.g. scr, str, spl).' },
      { n: 5, title: 'Spelling Rule: FLOSS & ALL', skills: ['spell', 'read'], note: 'Double f, l, s, z after a short vowel; the -all family.' },
      { n: 6, title: 'Spelling Rule: C vs K', skills: ['spell', 'read'], note: 'Choosing c or k at the start of a word.' },
      { n: 7, title: 'Spelling Rule: -ck', skills: ['spell', 'read'], note: 'When to use -ck vs -k after a short vowel.' },
      { n: 8, title: 'Spelling: -ing / -ink Units', skills: ['spell', 'read'], note: 'Glued units: ing, ink, ang, ung, etc.' },
      { n: 9, title: 'Spelling Rule: -tch', skills: ['spell', 'read'], note: 'When to use -tch vs -ch.' },
      { n: 10, title: 'Spelling: Contractions', skills: ['spell', 'read'] },
      { n: 11, title: 'Spelling: -ind / -old Units', skills: ['spell', 'read'], note: 'Glued units: ind, old, ost, olt, ild.' },
    ],
  },
  {
    level: 4,
    title: 'Syllable Division & Vowel Teams',
    focus: 'Six syllable types, dividing multisyllable words, vowel teams + per-lesson sight words',
    book: 'Book 4: Syllable Division & Vowel Teams',
    summary: '~14 lessons: open & other syllable types → syllable division → vowel teams, with a sight-word reading deck + spelling cards reviewed each lesson.',
    lessonFlow: ['Review', 'New Teaching (syllable type / vowel team)', 'Read Words', 'Spell Words', 'Sight Word Review (reading deck + spelling cards)', 'Spell Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Games', 'Tips & Error Correction', 'Posttest', 'Student Pages'],
    partial: true, // contents page wasn't filmed; only confirmed lessons listed below
    lessons: [
      { n: 1, title: 'Open Syllables (+ Vowel-Y)', vowels: ['y'], skills: ['read', 'spell'], note: 'Open syllable = one vowel at the end says its long sound; introduce Vowel-Y (long e/i at word end). Watch-Out vowels: E, I, Y.' },
      // Lessons 2–14 confirmed to exist (Lesson 13 = reading stories) — exact titles
      // pending a capture of the Table of Contents.
    ],
  },
  {
    level: 5,
    title: 'Prefixes & Suffixes',
    focus: 'Plurals, suffixes (-s/-es, -ed, -ing), spelling rules, and prefixes',
    book: 'Book 5: Prefixes & Suffixes',
    summary: '10 lessons: plurals + consonant/vowel suffixes (with the Doubling & Change rules and -tion/-sion), then prefixes.',
    lessonFlow: ['Review', 'New Suffix / Prefix or Rule', 'Read Words', 'Spell Words', 'Sight Word Review', 'Spell Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Posttest', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: 'Plurals: -s vs -es', skills: ['spell', 'read'] },
      { n: 2, title: 'Consonant Suffixes', skills: ['spell', 'read'] },
      { n: 3, title: '-ed and -ing: The Doubling Rule', skills: ['spell', 'read'], note: 'Double the final consonant before a vowel suffix in 1-1-1 words.' },
      { n: 4, title: 'Other Sounds of -ed', skills: ['read', 'spell'], note: '-ed says /t/, /d/, or /ed/.' },
      { n: 5, title: 'Vowel Suffixes', skills: ['spell', 'read'] },
      { n: 6, title: 'Spelling: The Change Rule', skills: ['spell', 'read'], note: 'Change y to i; drop silent-e before a vowel suffix.' },
      { n: 7, title: 'Spelling: -tion vs -sion', skills: ['spell', 'read'] },
      { n: 8, title: 'Prefixes: dis, in, un, non', skills: ['read', 'spell'] },
      { n: 9, title: 'Prefixes: mis, sub, re, pre', skills: ['read', 'spell'] },
      { n: 10, title: 'Prefixes: inter, mid, over, up', skills: ['read', 'spell'] },
    ],
  },
  // Levels 6–10: titles/lessons pending each book's capture (earlier guesses
  // were off — e.g. VCe lives inside Level 4, suffixes are Level 5).
  { level: 6, title: 'Level 6', focus: 'Pending — captured from the book', lessons: [] },
  { level: 7, title: 'Level 7', focus: 'Pending — captured from the book', lessons: [] },
  { level: 8, title: 'Level 8', focus: 'Pending — captured from the book', lessons: [] },
  { level: 9, title: 'Level 9', focus: 'Pending — captured from the book', lessons: [] },
  { level: 10, title: 'Level 10', focus: 'Pending — captured from the book', lessons: [] },
];

export function levelCurriculum(level: number): LevelCurriculum | undefined {
  return CURRICULUM.find((l) => l.level === level);
}

/** All sounds taught up to and including a lesson (lessons are cumulative). */
export function soundsThrough(level: number, lessonN: number): string[] {
  const lvl = levelCurriculum(level);
  if (!lvl) return [];
  const out: string[] = [];
  for (const l of lvl.lessons) {
    if (l.n > lessonN) break;
    out.push(...(l.vowels ?? []), ...(l.consonants ?? []), ...(l.digraphs ?? []));
  }
  return out;
}

/** Human-readable list of what a lesson introduces (for the tutor / level page). */
export function lessonSounds(l: Lesson): string {
  const parts = [...(l.vowels ?? []), ...(l.consonants ?? []), ...(l.digraphs ?? [])];
  return parts.join(' · ');
}
