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
  drives game generation, *provided* it only encodes unprotectable facts/method.
  **TODO (follow-up):** re-derive that skeleton from first principles / public
  Orton-Gillingham sources and strip any comments that reference transcribing a
  specific program's books ("Book 2", "contents page", "Posttest"). Until then,
  treat it as internal-only and do not surface it in the UI.
- ✅ **OK to display:** our own game names, taglines, the level's one-line focus,
  the child's own results, and original word/picture sets.

## Guardrail

`src/curriculum.ts` must never be imported by a **component that renders its
`lessons`/`lessonSounds` to the screen.** A lint guard enforces this (see
`eslint.config.js` → `no-restricted-imports` for `./curriculum` in view files).
