# Curriculum notes (how we turn the program into games)

Source of truth: `src/curriculum.ts`. We extract the **factual skeleton** from the
program books (which sounds each lesson introduces + which skills it practises)
and author **our own** words/pictures/sentences — we never copy the program's
word lists, sentences, or tutor scripts into the app.

## Capture pipeline (per level video)
1. Pull frames from the `.MOV` with Swift/AVFoundation (`/tmp/extract.swift`),
   ~1 frame / 2s, downscaled.
2. Build labeled contact sheets (`/tmp/montage.swift`) to locate distinct pages.
3. Read the title/contents + lesson-divider pages at **full resolution**, rotated
   upright (clips are shot sideways), to read small text / word lists.
4. Record the level → lesson → {vowels, consonants, digraphs, skills} into
   `curriculum.ts`.

## What's captured so far
- **Level 1 — Phonemic Awareness** (oral, no letters): segment VC → CVC → longer
  words → blend/manipulate → final sounds. (Value = the skill order; few on-screen
  games — it's tutor-led orally.)
- **Level 2 — Consonants & Short Vowels** (verified from the book): 5 cumulative
  lessons, each adding 1 short vowel + a set of consonants/units:
  - L1 `a` + `b f m p s t` · L2 `i` + `c g h l n r` · L3 `o` + `d j k v z`
  - L4 `u` + `w x y qu` · L5 `e` + digraphs `sh th ch wh ck`
  - Per-lesson skill flow (from the progress-tracking sheet): teach new sound →
    spell sounds on tiles → read real words → spell real words → read phrases →
    read sentences → read story.
- **Level 3 — Closed Syllables** (verified): blends → digraphs/3-letter blends →
  the closed-syllable spelling rules (FLOSS & ALL, C vs K, -ck, -ing/-ink, -tch,
  contractions, -ind/-old). 11 lessons.
- **Level 4 — Syllable Division** (verified from the contents page): open
  syllables → four syllable-division rules for decoding big words → spelling
  rules (/k/-in-the-middle, doubling, schwa) → long vowels & vowel teams. 14
  lessons.
- **Level 5 — Prefixes & Suffixes** (verified from the contents page): plurals
  (-s/-es) → consonant & vowel suffixes (Doubling & Change rules, -tion/-sion) →
  prefixes. 10 lessons.
- **Level 6 — Six Reasons for Silent-E** (verified): the six reasons a silent-E
  exists → suffix spelling (the Dropping rule, tricky suffixes) → Greek clues
  (PH, medial Y) → TURE / TION-SION units → Consonant-LE syllables, the Sprinkle
  Vehicle rule, and ABLE vs IBLE. 14 lessons + Optional Posttest. (Completed from
  the contents page's *second* page — its reverse side never faces the camera on a
  read-through, so it needed a dedicated flip-and-shoot, not a video pass.)
- **Level 7 — Vowel-R Syllables** (verified from the contents page): ar/or →
  er/ir/ur → vowel-R with silent-E and affixes → spelling rules (Commodore
  Sailor, Edward the Lizard) → Bossy W, three sounds of EAR, /air/ spellings,
  ARY/ERY/ORY endings. 11 lessons + Optional Posttest.
- Levels 8–10: placeholders, filled as their books are captured.

Re-shoots that paid off: Level 4's contents page (a single HEIC still) converted
the Lesson-1-only stub into all 14 lessons. The same one-photo shot of a contents
page is the fastest, most reliable way to complete a level — far better than
hunting interior pages, whose running headers carry only "Lesson N", never the
descriptive title (which lives only on the contents page).

## Skill → game-type map (drives "most retention / best results")
| Skill tag | What it trains | Game(s) |
|-----------|----------------|---------|
| `sound`   | keyword ↔ letter sound | **Sound Safari** (first sound), **Last Sound Standing** (last sound) |
| `segment` | break a word into sounds | tile/segment game (build) |
| `blend`   | push sounds into a word | blending game |
| `first` / `last` | isolate first/last sound | the two sort games above |
| `read`    | decode words/phrases | word-reading game |
| `spell`   | encode (build) words | **Brick by Brick** (build-a-word) |

## Design principles to bake into every game
- **Cumulative**: a game at Level L, Lesson N draws from **all sounds taught
  through N** — use `soundsThrough(level, lesson)`. Keeps it review-rich and
  defeats memorization.
- **Mastery, not advancement**: success = accuracy, never a clock. (Our finish
  timer is no-pressure by design.)
- **Multisensory + audio-first + no-fail**: hear the sound, see the picture, drag
  the tile; wrong answers gently retry, never penalize.
- **Our own content**: build picture/word sets from common decodable words for the
  lesson's sound set; keep dyslexia-friendly type + minimal reading.

## Completeness pass (structure captured from the books)
Each book follows the same shape (now stored as `sections` per level):
**Overview → Lessons → Games → Tips & Error Correction → Posttest → Student Pages.**

Per-lesson flow (now stored as `lessonFlow`), e.g. Level 2:
**Review → New Vowel → New Consonants → Read & Spell Words → Read 3 Types of
Phrases → Read & Mark Sentences → Optional Practice.** Level goal: all 5 short
vowels, all 21 consonants, 5 common digraphs. (Level 3 follows: Review → new
concept/rule → read words → spell words → phrases → sentences → story.)

**Testing → product opportunity.** Every level ends with a **Posttest** (a
mastery check on that level's skills). This maps directly onto our tutor
dashboard: a short, no-fail **level check** whose result is logged like a
session → per-student mastery over time, exactly the data families pay for.
Build it as another game type that records pass/score, not as a high-stakes test.

**Tips & Error Correction** sections inform game *feedback* (e.g., the b/p
confusion trick) — useful for gentle, specific retry hints rather than generic
"try again." We summarize the approach; we don't copy the scripts.

NOTE: we store the factual skeleton (lesson titles, sound/rule inventories, flow,
sections) and author all words/pictures/sentences ourselves.
