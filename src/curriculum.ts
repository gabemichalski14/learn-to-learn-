/**
 * Curriculum model — the single source of truth for what each level/lesson
 * teaches, distilled from the program's scope & sequence. We store the FACTUAL
 * skeleton (which sounds a lesson introduces + which skills it practises) and
 * build our OWN word/picture sets from it — we do not copy any program's
 * word lists, sentences, or scripts.
 *
 * Skill tags drive which game types belong to a lesson:
 *   'segment'    hear a word, break it into sounds      (oral / tile)
 *   'blend'      push sounds together into a word
 *   'manipulate' break, replace, or remove a sound (Level 1 procedure B)
 *   'compare'    decide if two spoken words are the same or different (L1 proc. C)
 *   'first'      identify the first sound
 *   'last'       identify the last sound
 *   'sound'      keyword ↔ sound for a new letter
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
    summary: 'Break spoken words into individual sounds on blank tiles (no letters), then replace/remove sounds and compare words — building from 2-sound words up to real words.',
    // Per-lesson procedures from the Progress Tracking Sheet (A/B/C + games).
    lessonFlow: ['Break Apart (segment the word on blank tiles)', 'Break, Replace, Remove (manipulate sounds)', 'Compare Two Words', 'Optional Games'],
    sections: ['Sound Chart', 'Lessons', 'Optional Posttest', 'Games', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: 'Breaking 2 Sounds Apart', skills: ['segment', 'manipulate', 'compare'], note: 'VC & CV words (2 phonemes) on blank tiles.' },
      { n: 2, title: 'Breaking CVC Words', skills: ['segment', 'manipulate', 'compare'], note: '3-sound consonant-vowel-consonant words.' },
      { n: 3, title: 'Breaking VCC Words', skills: ['segment', 'manipulate', 'compare'], note: 'Vowel + final consonant blend (e.g. /a/·/s/·/k/).' },
      { n: 4, title: 'Breaking CCV Words', skills: ['segment', 'manipulate', 'compare'], note: 'Initial consonant blend + vowel.' },
      { n: 5, title: 'Working with Real Words', skills: ['segment', 'manipulate', 'compare', 'blend'], note: 'Apply all three procedures to real words.' },
    ],
  },
  {
    level: 2,
    title: 'Consonants & Short Vowels',
    focus: 'Letter sounds, blending, reading & spelling short-vowel words',
    book: 'Book 2: Consonants & Short Vowels',
    summary: 'By the end: all 5 short vowels, all 21 consonants, and 5 common digraphs. Mastery-gated — a lesson is not finished until its letters can be read AND spelled accurately and easily.',
    lessonFlow: ['Review known letters & sounds', 'Phonemic-awareness warm-up', 'Teach the new vowel & consonants (tap the keyword)', 'Read & spell sounds on tiles', 'Read & spell real + nonsense words on tiles', 'Read words through the Word Frame', 'Read phrases', 'Read & mark sentences', 'Optional extra practice'],
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
      { n: 4, title: 'Digraph & 3-Letter Blends', skills: ['read', 'spell'], note: 'Digraphs plus three-letter blends (e.g. scr, str, spl).' },
      { n: 5, title: 'Spelling: FLOSS Rule & ALL', skills: ['spell', 'read'], note: 'Double f, l, s, z after a short vowel; the -all family.' },
      { n: 6, title: 'Spelling: Kiss the Cat Rule', skills: ['spell', 'read'], note: 'Barton mnemonic for choosing c vs k at the start of a word.' },
      { n: 7, title: 'Spelling: Milk Truck Rule', skills: ['spell', 'read'], note: 'Barton mnemonic for when to use -ck vs -k after a short vowel.' },
      { n: 8, title: 'Spelling: ING INK Units', skills: ['spell', 'read'], note: 'Glued units: ing, ink, ang, ung, etc.' },
      { n: 9, title: 'Spelling: Catch Lunch Rule', skills: ['spell', 'read'], note: 'Barton mnemonic for when to use -tch vs -ch.' },
      { n: 10, title: 'Spelling: Contractions', skills: ['spell', 'read'] },
      { n: 11, title: 'Spelling: Kind Old Units', skills: ['spell', 'read'], note: 'Glued units: ind, old, ost, olt, ild.' },
    ],
  },
  {
    level: 4,
    title: 'Syllable Division & Vowel Teams',
    focus: 'Open syllables, the four syllable-division rules, schwa spelling, and long-vowel/vowel-team spelling',
    book: 'Book 4: Syllable Division & Vowel Teams',
    summary: '14 lessons: open syllables → four syllable-division rules for decoding big words → spelling rules (/k/-in-the-middle, doubling, schwa) → long vowels & vowel teams at the end/middle of a syllable. (TOC titles it "Syllable Division"; the page running-header is the fuller "Syllable Division & Vowel Teams".)',
    lessonFlow: ['Review', 'New Teaching (syllable type / division or spelling rule)', 'Read Words', 'Spell Words', 'Sight Word Review (reading deck + spelling cards)', 'Spell Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Games', 'Tips & Error Correction', 'Posttest', 'Student Pages'],
    lessons: [
      { n: 1, title: 'Open Syllables', vowels: ['y'], skills: ['read', 'spell'], note: 'Open syllable = one vowel at the end says its long (name) sound; introduce Vowel-Y (long I at end of 1-syllable words, long E at end of longer words). Long-U has two sounds (Few /ē-oo/, Flu /oo/). Builds on the Closed + Unit syllable types from earlier books; no finger-spelling in Book 4.' },
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
  {
    level: 8,
    title: 'Advanced Vowel Teams',
    focus: 'The consonant-I /sh/ spellings and the remaining vowel teams',
    book: 'Book 8: Advanced Vowel Teams',
    summary: '13 lessons: first the consonant+I spellings that say /sh/, /shun/, /nyuh/ (TI, CI, SI, TIAN, NIA), then the rest of the vowel teams — IE, OI/OY/EY, AU/AW, OO, OU/OW, EA, IGH/AUGH/EIGH/EI, EU/TU — and split vowels. Builds on the 9 vowel teams taught in earlier books.',
    lessonFlow: ['Review', 'New Teaching (a spelling pattern or vowel team)', 'Read Words', 'Spell Words', 'Sight Word Review', 'Spell Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Posttest', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: 'Spelling: India, Indian, Musician', skills: ['spell', 'read'], note: 'The letter I before a vowel; TI / TIAN patterns that say /sh/ and /shun/.' },
      { n: 2, title: 'Spelling: Obvious, Spacious, Religious', skills: ['spell', 'read'], note: 'CI / SI / -ous patterns that say /sh/.' },
      { n: 3, title: 'Spelling: Radio, Union, Million, Region', skills: ['spell', 'read'] },
      { n: 4, title: 'Spelling: Industrial, Special, Dial', skills: ['spell', 'read'] },
      { n: 5, title: 'IE: Piece of Pie', skills: ['read', 'spell'], note: 'The vowel team IE.' },
      { n: 6, title: 'OI, OY, EY: Oil, Boy, Turkey', skills: ['read', 'spell'] },
      { n: 7, title: 'AU, AW: Audience, Saw', skills: ['read', 'spell'] },
      { n: 8, title: 'OO: Good, Food', skills: ['read', 'spell'], note: 'The two sounds of oo (book vs. moon).' },
      { n: 9, title: 'OU, OW: Mouse, Group, Slow Down', skills: ['read', 'spell'] },
      { n: 10, title: 'EA: Clean, Breath, Great', skills: ['read', 'spell'], note: 'The three sounds of ea (/ē/, /ĕ/, /ā/).' },
      { n: 11, title: 'IGH, AUGH, EIGH, EI', skills: ['read', 'spell'] },
      { n: 12, title: 'EU, TU: Feud, Sleuth, Actual', skills: ['read', 'spell'] },
      { n: 13, title: 'Split Vowels', skills: ['read', 'spell'], note: 'Two adjacent vowels read in separate syllables (di-al, qui-et).' },
    ],
  },
  {
    level: 9,
    title: 'Influence of Foreign Languages',
    focus: 'Greek and French spelling patterns in borrowed words',
    book: 'Book 9: Influence of Foreign Languages',
    summary: '9 lessons: Greek patterns (CH = /k/, Greek silent-letter pairs), silent-letter pairs that mark very old English words, the four clues that a word is "borrowed" from another language, then six lessons of French spelling patterns. Strategy: look words up with standard American spelling and enter only the sounds you hear (spell-checker).',
    lessonFlow: ['Review', 'New Teaching (a Greek/French pattern or borrowed-word clue)', 'Read Words', 'Spell Words', 'Sight Word Review', 'Spell Sentences', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Posttest', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: 'Greek Words', skills: ['read', 'spell'], note: 'In Greek words CH says /k/; three Greek silent-letter pairs.' },
      { n: 2, title: 'Silent-Letter Pairs', skills: ['read', 'spell'], note: 'Silent-letter pairs that mark very old English words.' },
      { n: 3, title: 'Borrowed Words', skills: ['read', 'spell'], note: 'The four ways to tell a word was borrowed from another language.' },
      { n: 4, title: 'French Words: OUS, CH & Suffixes', skills: ['read', 'spell'] },
      { n: 5, title: 'French Words: QUE, IC, ACE', skills: ['read', 'spell'] },
      { n: 6, title: 'French Words: Silent S & GN', skills: ['read', 'spell'] },
      { n: 7, title: 'French Words: Accented É', skills: ['read', 'spell'] },
      { n: 8, title: 'French Words: T & EAU', skills: ['read', 'spell'] },
      { n: 9, title: 'French Words: G, GU, GUE', skills: ['read', 'spell'] },
    ],
  },
  {
    level: 10,
    title: 'Greek Words & Latin Roots',
    focus: 'Latin roots, Chameleon (assimilating) prefixes, and Greek combining forms — morphology for big words',
    book: 'Book 10: Greek Words & Latin Roots',
    summary: 'Morphology — reading, spelling, and understanding the long words found in college texts. Lessons 1–5: Latin Roots + the seven "Chameleon" prefix families (assimilating prefixes, e.g. IN → IM/IL/IR) and their spelling rules (the final reason for double letters), using all known suffix rules. Lessons 6–10: Greek Combining Forms — meaning-bearing parts that unlock science, math, medicine, and social-studies vocabulary (electrocardiogram, ethnomusicology).',
    lessonFlow: ['Review', 'New Teaching (a prefix family + Latin roots, or a Greek combining-form set)', 'Read Words', 'Spell Words', 'Sight Word Review', 'Build & Define Big Words', 'Read a Story'],
    sections: ['Overview', 'Lessons', 'Posttest', 'Tips & Error Correction'],
    lessons: [
      { n: 1, title: 'Chameleon Prefix: IN', skills: ['read', 'spell'], note: 'IN (not/within) assimilates: IM before m/b/p, IL before l, IR before r. Latin roots are accented, so the Doubling rule applies when a root ends CVC.' },
      { n: 2, title: 'Chameleon Prefixes & Latin Roots', skills: ['read', 'spell'] },
      { n: 3, title: 'Chameleon Prefixes & Latin Roots', skills: ['read', 'spell'] },
      { n: 4, title: 'Chameleon Prefixes & Latin Roots', skills: ['read', 'spell'] },
      { n: 5, title: 'Chameleon Prefixes & Latin Roots', skills: ['read', 'spell'], note: 'All seven Chameleon-prefix families are taught across Lessons 1–5.' },
      { n: 6, title: 'Greek Combining Forms', skills: ['read', 'spell'], note: 'Greek forms work like compound words — each part carries a meaning.' },
      { n: 7, title: 'Greek Combining Forms: Science', skills: ['read', 'spell'] },
      { n: 8, title: 'Greek Combining Forms: Math', skills: ['read', 'spell'] },
      { n: 9, title: 'Greek Combining Forms: Medicine', skills: ['read', 'spell'] },
      { n: 10, title: 'Greek Combining Forms: Social Studies', skills: ['read', 'spell'] },
    ],
  },
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
