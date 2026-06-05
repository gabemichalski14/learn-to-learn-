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
- Levels 3–10: placeholders, filled as their books are captured.

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
