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
    title: 'Syllable Division',
    focus: 'Open syllables, the four syllable-division rules, schwa, and long-vowel spelling',
    book: 'Book 4: Syllable Division',
    summary: '14 lessons: open syllables → four syllable-division rules for decoding big words → spelling rules (/k/-in-the-middle, doubling, schwa) → long vowels & vowel teams at the end/middle of a syllable.',
    lessonFlow: ['Review', 'New Teaching (syllable type / division or spelling rule)', 'Read Words', 'Spell Words', 'Sight Word Review (reading deck + spelling cards)', 'Spell Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Games', 'Tips & Error Correction', 'Posttest', 'Student Pages'],
    lessons: [
      { n: 1, title: 'Open Syllables', vowels: ['y'], skills: ['read', 'spell'], note: 'Open syllable = one vowel at the end of a syllable says its long sound; introduce Vowel-Y (long e/i at word end).' },
      { n: 2, title: 'Syllable Division Rule #1', skills: ['read', 'spell'], note: 'First rule for splitting a multisyllable word so it can be decoded.' },
      { n: 3, title: 'Syllable Division Rule #2', skills: ['read', 'spell'] },
      { n: 4, title: 'Spelling: /k/ in the Middle', skills: ['spell', 'read'], note: 'Choosing c / k / ck for the /k/ sound inside a longer word.' },
      { n: 5, title: 'Spelling: Double Letters', skills: ['spell', 'read'], note: 'When a consonant doubles in the middle of a word.' },
      { n: 6, title: 'Spelling: Schwa', skills: ['spell', 'read'], note: 'The unstressed "uh" vowel in a multisyllable word.' },
      { n: 7, title: 'Syllable Division Rule #3', skills: ['read', 'spell'] },
      { n: 8, title: 'Syllable Division Rule #4', skills: ['read', 'spell'] },
      { n: 9, title: 'Three-Syllable Words', skills: ['read', 'spell'] },
      { n: 10, title: 'Spelling: The Banana Rule', skills: ['spell', 'read'] },
      { n: 11, title: 'Spelling: The Confident Rule', skills: ['spell', 'read'] },
      { n: 12, title: 'Spelling: Long A, E, I at the End', skills: ['spell', 'read'] },
      { n: 13, title: 'Spelling: Long O, U at the End', skills: ['spell', 'read'] },
      { n: 14, title: 'Spelling: Vowel Teams in the Middle', skills: ['spell', 'read'] },
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
  {
    level: 6,
    title: 'Six Reasons for Silent-E',
    focus: 'Why a silent-E is there (six reasons), suffix spelling rules, and Consonant-LE',
    book: 'Book 6: Six Reasons for Silent-E',
    summary: 'Silent-E is always there for a reason — learn the six reasons, the Dropping rule for vowel suffixes, the seven Silent-E units, a TION/SION shortcut, and the Consonant-LE syllable type.',
    lessonFlow: ['Review', 'New Teaching (a reason for Silent-E / suffix or spelling rule)', 'Read Words', 'Spell Words', 'Read Nonsense Words on Tiles', 'Spell Nonsense Words with Tiles', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Posttest', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: "Silent-E's in One-Syllable Words", skills: ['read', 'spell'] },
      { n: 2, title: 'Syllable Division with Silent-E', skills: ['read', 'spell'] },
      { n: 3, title: "C's and G's with Silent-E's", skills: ['read', 'spell'], note: 'Soft c/g before e — the Silent-E is what makes them soft.' },
      { n: 4, title: 'Spelling: V at the End', skills: ['spell', 'read'], note: 'English words do not end in v — add a Silent-E (have, give).' },
      { n: 5, title: 'Spelling: The Huge Bridge Rule', skills: ['spell', 'read'] },
      { n: 6, title: 'Spelling: The Dropping Rule', skills: ['spell', 'read'], note: 'Drop the Silent-E before adding a vowel suffix.' },
      { n: 7, title: 'Spelling: Tricky Suffixes', skills: ['spell', 'read'] },
      { n: 8, title: 'Spelling: PH and Medial Y', skills: ['read', 'spell'], note: 'Greek clues: PH says /f/, and a Y in the middle of a word.' },
      { n: 9, title: 'Unit: TURE', skills: ['read', 'spell'] },
      { n: 10, title: 'Spelling: TION and SION', skills: ['spell', 'read'] },
      { n: 11, title: 'Silent-E Units', skills: ['read', 'spell'], note: 'The seven Silent-E units.' },
      { n: 12, title: 'Consonant-LE Syllables', skills: ['read', 'spell'], note: 'The final stable syllable -le (table, candle) — a silent E for a different reason.' },
      { n: 13, title: 'Spelling: The Sprinkle Vehicle Rule', skills: ['spell', 'read'], note: 'Choosing the right Consonant-LE ending (-kle as in sprinkle vs -cle as in vehicle).' },
      { n: 14, title: 'Spelling: ABLE versus IBLE', skills: ['spell', 'read'], note: 'Choosing the -able vs -ible suffix.' },
    ],
  },
  {
    level: 7,
    title: 'Vowel-R Syllables',
    focus: 'R-controlled vowels (ar, or, er, ir, ur) and their spelling rules',
    book: 'Book 7: Vowel-R Syllables',
    summary: '11 lessons: the vowel-R sounds (ar/or, then er/ir/ur) → vowel-R with silent-E and with affixes → spelling rules (Commodore Sailor, Edward the Lizard) → Bossy W, the three sounds of EAR, /air/ spellings, and ARY/ERY/ORY endings.',
    lessonFlow: ['Review', 'New Teaching (a vowel-R sound or spelling rule)', 'Read Words', 'Spell Words', 'Read Nonsense Words on Tiles', 'Spell Nonsense Words with Tiles', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Posttest', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: 'AR and OR', skills: ['read', 'spell'] },
      { n: 2, title: 'ER, IR, and UR', skills: ['read', 'spell'], note: 'Three spellings, one /er/ sound.' },
      { n: 3, title: 'Vowel-R with Silent-E', skills: ['read', 'spell'] },
      { n: 4, title: 'Prefixes & Suffixes with Vowel-R', skills: ['read', 'spell'] },
      { n: 5, title: 'Spelling: Commodore Sailor Rule', skills: ['spell', 'read'] },
      { n: 6, title: 'Bossy W', skills: ['read', 'spell'], note: 'A W before the vowel-R changes its sound (war, work).' },
      { n: 7, title: 'Spelling: Edward the Lizard Rule', skills: ['spell', 'read'] },
      { n: 8, title: 'The Three Sounds of EAR', skills: ['read', 'spell'] },
      { n: 9, title: 'AR and ER Can Say /air/', skills: ['read', 'spell'] },
      { n: 10, title: 'Word Endings: ARY, ERY, and ORY', skills: ['spell', 'read'] },
      { n: 11, title: 'Vowel-R Plus R', skills: ['read', 'spell'] },
    ],
  },
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
