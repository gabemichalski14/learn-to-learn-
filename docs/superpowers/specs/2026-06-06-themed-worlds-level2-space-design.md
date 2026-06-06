# Themed worlds — Level 2 "Space Patrol" (pilot) — design spec

**Date:** 2026-06-06
**Status:** Approved (visual direction validated via mockups in `.superpowers/brainstorm/`)

## Goal
Replace the three global themes (`playful` / `l2l` / `grownup`) with **per-level themed
"worlds."** Each Barton level gets one cohesive, age‑neutral world that all of its 2–4
games share — same palette, characters, decoration, and creature/word art, specific to
that level. Pilot the whole system on **Level 2 = "Space Patrol."**

## Why (research)
- **Hi‑Lo (high‑interest, low‑readability):** one age‑neutral aesthetic that reads "cool" to
  a teen and "wondrous" to a 6‑year‑old, while the task stays easy — beats per‑age toggles.
- **Cognitive** engagement drives reading gains; theme must pull attention onto the task.
- **Intrinsic narrative:** doing the skill advances the world (route the signal to a planet).
- Keep our existing pillars: audio‑first, **no‑fail** retry, visible **mastery** progress.

## Architecture (replaces the 3-theme system)
- **World config** (`src/worlds/`): one module per level → `{ level, name, palette (CSS
  vars), Background, Mascot, Basket art, creature art set, copy voice, feedback }`.
- **`WorldShell`** component: renders a world's background, HUD chrome, mascot, palette, and
  feedback layer around any game. Games render *inside* it.
- **Games are theme‑agnostic mechanics.** The sort engine stays generic; it renders its
  baskets/items through **world‑provided art slots** (a `Basket` and `Creature` the world
  supplies). The same sort game shows as "planets + space creatures" in Space, and (later)
  "reefs + sea creatures" in an Ocean world — no game‑logic changes.
- **Art = in‑code SVG components** authored to a short style guide (the hero mockup is the
  target): planets, creatures, drone, nebula background, beams. Fully ours, animatable, no
  external dependency; upgradeable to richer assets later.

## Level 2 — "Space Patrol" world
- Frontier (age‑neutral) look: deep cosmos, nebula + parallax stars, ringed planets, a
  **scout‑drone mascot ("Scout")**, mission‑control HUD (sector label, segmented progress,
  mastery ring), light copy voice ("Route the signal", "Sector clear").
- Baskets = **planets**; word‑items = **creatures/cargo**; correct = **tractor‑beam lock‑in**
  + soft chime; wrong = gentle nudge, retry (no penalty). Finish = a constellation/planet
  bloom (replaces the growing‑tree finish).

## Level 2 games (the "sound trio")
1. **Vowel Patrol** — NEW, the pilot. Sort CVC creatures to **5 vowel planets** by their
   **middle vowel**. Engine gains a `'medial'` sound target + a `shortVowelWords` pack;
   feeds `vowel:<id>` mastery.
2. **Sound Safari** — exists (beginning sound); re‑skin into the Space shell.
3. **Last Sound Standing** — exists (ending sound); re‑skin into the Space shell.
- (Optional 4th later: **Brick by Brick** — spell the word — deferred.)

## Engine + mastery (additive)
- `SoundTarget` += `'medial'`; `WordItem` += `medialVowel?: string`; `soundOf(item,'medial')`.
- `generateSortRound` already supports `focusSound`/anti‑pattern — carries over.
- `skillKeyForSound(id,'medial') → 'vowel:<id>'`; per‑item logging already flows, so Vowel
  Patrol surfaces short‑vowel weak spots in "Areas to improve" with a working Practice link.

## Removing the 3 themes
- Delete `ThemeSwitcher`, `src/themes.ts`, and the theme prop plumbing through
  `App`/`GameScreen`/`SortGame`. The play screen's theme‑conditional visuals
  (playful bg, clean walker, confetti, growing tree, leaf‑fall) are **replaced** by the
  world's shell + feedback (done per world). No theme switch remains.

## Phasing (each verifiable; tweak between)
- **A — Pilot (visible fast):** World architecture + Space `WorldShell` + SVG art + **Vowel
  Patrol** on a new route, playable. Existing games/themes left untouched for now.
- **B — Propagate:** re‑skin Sound Safari + Last Sound Standing into the Space shell; remove
  the 3 global themes + switcher.
- **C — Polish:** feedback/finish animations (tractor beam, planet bloom, Scout reactions).

## Quality bar
TDD for engine/pack/mastery (the testable core); render smoke tests for the WorldShell +
Vowel Patrol; **eslint 0**, tsc clean, all tests pass, build OK at each step; visual
verification with the user (tweak as we go). Built on a branch off `main`.

## Out of scope (now)
Other levels' worlds (each its own later cycle); Brick by Brick; family/tutor role
dashboards (Phase 2/3 of the mastery spec); Foundation in Sounds games.
