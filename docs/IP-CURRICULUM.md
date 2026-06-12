# Curriculum & IP boundary — what we may and may not display

**Not legal advice.** For a definitive clearance, consult an IP attorney. This note
records the working rule we follow so the boundary doesn't drift.

## The rule

1. **A teaching method / sequence is not copyrightable.** Under *Baker v. Selden*
   (101 U.S. 99) and 17 U.S.C. §102(b), a *system / method of operation* — and the
   *facts* it relies on (which letter makes which sound) — get no copyright. So we
   may use a structured-literacy ordering to *generate our own original content*.

2. **A specific program's published scope & sequence is its EXPRESSION.** The exact
   lesson titles, groupings, order, and "Book N / Lesson N" structure of a named
   program (e.g. the Barton Reading & Spelling System®, "© 1999 Susan M. Barton,
   All Rights Reserved", a registered trademark) can carry thin *selection &
   arrangement* copyright, and reproducing it can imply false affiliation
   (trademark). **We do NOT display a transcribed scope & sequence.**

## What this means in the app

- ❌ **Do NOT render** a per-lesson breakdown that mirrors a named program's
  scope & sequence (lesson titles + the specific sound groupings + order). This was
  the old "Mission Log" / "Lessons" list — **removed** from `GardenLevelHub`,
  `SpaceLevelHub`, and `LevelPage`. The `LevelsPage` card foot shows our **games
  count only**, not a lesson count.
- ✅ **OK to keep internal**, not displayed: the `src/curriculum.ts` skeleton that
  drives placement/sequence, *provided* it only encodes unprotectable facts/method.
  **DONE:** `src/curriculum.ts` was re-derived from first principles — the book
  titles, section lists, lesson-flow, per-lesson sound groupings, transcription
  notes, and all branded mnemonic names were removed; lesson labels are now plain
  skill descriptions ("final blends", "soft c and g"). Two displayed level titles
  that matched a program's book titles ("Six Reasons for Silent-E", "Influence of
  Foreign Languages") and a "Chameleon prefixes" focus were genericized in
  `games.ts`.
- ✅ **OK to display:** our own game names, taglines, the level's one-line focus,
  the child's own results, and original word/picture sets.
- ✅ **Level NAMES are our own themed worlds**, NOT academic/program scope &
  sequence headings. Each level headlines an original world name (Sound Garden,
  Space Patrol, Patch's Workshop, Giant's Valley, Tinker Town, Whisper Woods,
  Pirate Cove, Tidepool Bay, Globe Harbor, Root Ruins) — creative expression with
  zero overlap with any program's book/lesson titles. The academic skill (e.g.
  "Closed Syllables") rides along only as a small factual descriptor. Rule: **the
  level NAME is a world we invented; never name a level after a program's book.**

## Guardrail

`src/curriculum.ts` must never be imported by a **component that renders its
`lessons` to the screen.** A lint guard enforces this (see `eslint.config.js` →
`no-restricted-imports` for `./curriculum` in view files).

A second guard, `src/ipGuard.test.ts`, scans the whole source tree and **fails the
gate** if any named-program creative coinage (invented mnemonic names, exact book
titles) reappears anywhere — even in a comment or an internal file. Add new banned
phrases there if a program's distinctive expression slips in.
