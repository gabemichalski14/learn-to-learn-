# Narrative Production Plan — story · character · art · game · background

**Date:** 2026-06-07 · **Goal:** produce the whole experience (story, characters,
art, games, backgrounds) at a level we haven't reached yet, using free tools
(Rive, Twine, Yarn Spinner) and everything we researched today. **One vertical
slice perfected (Level 2 / Moss), then templatized across all levels.**

## North-star principles (the law every step obeys)

Grounded in today's research — see the design spec §14–16 + memory.

- **Intrinsic fantasy** (Malone): the Barton skill *is* the character's need —
  remove the character and the task is meaningless.
- **Ludonarrative harmony**: every correct action *visibly advances the story*.
- **The character is the progress**: they transform as you help; the win is the
  character you rebuilt (full personification, not a caption).
- **Cozy / no-fail / story-in-fragments** (Spiritfarer); **dyslexia-affirming
  partnership** (the character has the *strength*; you each contribute);
  **structured literacy** (one sound, multisensory, mastery); **agency→attachment**.
- **Constraints:** free + **commercial-safe licensing** (CC0 / owned / Rive-free);
  no paid API; ages 5→adult (never babyish); no FOMO/decay; loop-safe architecture;
  every step ends with the gate + live verify + commit.

## Roles

- **You (creative tools):** Rive (character art + state machines), Twine (arcs),
  Yarn Spinner (lines), recorded human audio (phonemes/words + a few character
  voice lines).
- **Me (engineering):** the loaders that ingest your exports, the game rebuild, the
  scene/background system, tests, live verification, commits, gates.

---

## Phase 0 — Already in place (foundation)

Lore engine (`loreStore`, `dialogue`, `plantings`, `cast`, `characters`),
Pip/Echo arcs + data-driven buddy, named plantings, `LevelStory`, **`CharacterArt`
seam (Rive-ready, transforms with progress)**, tutor-Pip, guide reliability,
Phase-0 fixes. Decisions locked: intrinsic-fantasy law, art-first, rebuild (not
decorate) for character levels.

## Phase 1 — The Production Bible (design/authoring; low code)

The reference every later phase copies.

1. **Story Bible** (`docs/story/bible.md`): the world premise; the full cast
   (Pip, Echo + one per level) each with **want / need / flaw / arc / dyslexic
   strength / psychology lever**, mapped to that level's **Barton skill**. (Cast
   map already in spec §15.2 — flesh each to a paragraph.)
2. **Art-direction / style guide** (`docs/art/style-guide.md`): ONE cohesive visual
   language — palette, shape language, character construction rules, background
   style, UI, motion — so Rive characters + backgrounds + UI cohere. Pick CC0
   sources (Kenney/OpenGameArt) + Rive conventions. *Acceptance: a one-screen
   reference an artist or AI can follow.*
3. **Per-character one-pager** (Moss first): design + 4 transformation stages +
   expression set + **the intrinsic game loop for that level** + the line list +
   the background's arc-states. (Moss's is mostly done in the art brief.)

## Phase 2 — Tooling pipelines (build once, reuse per character)

- **2a. Rive pipeline** *(Me, when first `.riv` lands)*: add `@rive-app/react-canvas`;
  render inside `CharacterArt` from `cast.art.rive`, feeding `heal`(0–100)+`mood`;
  lazy-load so it never bloats levels without art; perf budget for low-end devices;
  emoji fallback stays. *JIT research: Rive web runtime API + perf.*
- **2b. Twine→data loader** *(Me)*: parse exported **Twee** into a character's
  stages + per-sound **story fragments**; tests against a sample fixture. *JIT
  research: Twee format specifics.*
- **2c. Yarn→dialogue loader** *(Me)*: compile exported Yarn (nodes/lines/conditions)
  into our tested `dialogue.ts`/`reactions` pools (keeps determinism + no-repeat);
  tests against a sample `.yarn`. *JIT research: Yarn export JSON schema.*
- **2d. Scene/background system** *(Me)*: a `LevelScene` that renders a **layered
  background whose state follows the character's arc** (dark→warm as `heal` rises),
  per-level theme, CC0 art slots, reduced-motion + perf safe. Generalizes the
  current `.sg-warm`.
- **2e. Audio** *(You record, Me wire)*: human phonemes/words (already planned) +
  optional short character voice lines (huge, free emotional lift).

## Phase 3 — Level 2 / Moss, end-to-end (the new bar)

The vertical slice that proves the whole pipeline.

| Step | Owner | Output |
|---|---|---|
| 3a Moss `.riv` (stages + expressions) | You | `src/assets/moss.riv` |
| 3b Moss arc in Twine | You | Twee export |
| 3c Moss lines + fragments in Yarn | You | Yarn export |
| 3d Wire Rive into `CharacterArt`; build Twine+Yarn loaders | Me | animated Moss + data-driven lines |
| 3e **Rebuild "Bring Moss Home"** (intrinsic) | Me | the real game |
| 3f Background follows arc (dark→dawn) | Me | `LevelScene` for space |
| 3g Gate + live verify + commit | Me | shipped slice |

**3e detail (the game):** Moss central + scattered; his lost hums are the items;
each correct match flies into Moss → a visible piece returns (`heal`↑ a stage) + a
story **fragment** + the dark warms; a miss drifts back with a kind line (no-fail);
**partnership** — he knows *where* each sound goes (his gift), you catch the
slippery sound. All home → **whole, sings, walks to the Garden** (the /m/ marigold).
The Barton skill (match word→sound) is unchanged and central — it *is* rebuilding Moss.

*Acceptance: a stranger watching the screen can infer Moss's story from the play
alone; a wrong answer never feels like failure; the win screen is Moss made whole.*

## Phase 4 — Templatize + roll out (all levels)

Per level (1, then 3→10), repeat Phase 3 against the template:
author character (Bible) → Rive art → Twine arc → Yarn lines → add to `CAST` →
the intrinsic game generates from the level's Barton skill + the character →
`LevelScene` theme. Each level gated + committed.

Cross-cutting: **deepen Pip/Echo's arcs** as the journey spine; add the
**chapter/journey map** (levels as chapters you travel).

## Phase 5 — Cohesion, accessibility, ship

Cohesion sweep (one visual language; retire dead foliage/CSS); accessibility
(reduced-motion, ≥44px, audio-first); **performance on low-end devices** (Rive +
scene budgets); **IP/licensing audit** (all content original; CC0/Rive/owned
verified for commercial use); final gate; deploy (**you** deploy — I never enter
credentials).

## Definition of done (every phase)

`tsc --noEmit && eslint . && vitest run && vite build` green · live-verified at
:4173 · committed · memory/spec updated. No paid APIs. No FOMO/no-fail intact.
Commercial-safe assets only.

## Research posture

We have strong **WHAT** research (narrative, character, learning science, cozy
loop, mascot/companion psych). The remaining unknowns are **HOW-to-integrate**
specifics, best researched **just-in-time** at the step that needs them:
- 2a: Rive web runtime API + performance budget.
- 2b/2c: Twee + Yarn export schemas (to write exact loaders).
- 2d/5: CC0 asset sources + licensing + low-end performance budgets.

Optionally, a short **upfront de-risking pass** on those three before building, if
we want zero surprises. Recommendation: targeted JIT research per step (keeps
momentum) unless you want the de-risk pass first.

---

## Appendix A — De-risk research findings → integration decisions (2026-06-07)

### A1. Rive (React) — DECIDED
- Use **`@rive-app/react-canvas`** (smallest bundle vs react-webgl).
- `useRive(...)` loads the `.riv`; **`useStateMachineInput(rive, 'Moss', 'heal', 0)`**
  returns the input — set `.value` for Number/Boolean, `.fire()` for Triggers.
  Hook returns **null until ready → always guard**.
- **Decision:** `CharacterArt` lazy-imports a `RiveAvatar` subcomponent ONLY when
  `cast.art.rive` is set (dynamic `import()` → code-split, so emoji-only levels pay
  zero cost). Feed `heal` (0–100 number) + `mood` (number or triggers). Emoji
  placeholder shows while loading/null. Pause on `prefers-reduced-motion`. One
  artboard; keep `.riv` small.
- Sources: [Rive React params](https://rive.app/docs/runtimes/react/parameters-and-return-values) ·
  [Codrops Rive+React](https://tympanus.net/codrops/2025/05/12/integrating-rive-into-a-react-project-behind-the-scenes-of-valley-adventures/)

### A2. Twine → data (Twee 3) — DECIDED
- Twee 3 passage = `:: Name [tag1 tag2] {json-metadata}` then body until next `::`.
  Special `:: StoryData` (JSON, `ifid`) / `:: StoryTitle`.
- **Decision:** author Moss's arc with a tag convention the loader keys on —
  `[stage]` passages `Stage0..Stage3` (the transformation beats) and `[fragment]`
  passages `Fragment_m`, `Fragment_…` (per-sound memories). Pure parser:
  split on `^:: `, read name + `[tags]` + optional `{json}` + body → map to the
  character's `beats`/stages + story fragments. Tests against a sample `.twee`.
- Source: [Twee 3 spec](https://github.com/iftechfoundation/twine-specs/blob/master/twee-3-specification.md)

### A3. Yarn Spinner → dialogue — DECIDED
- Author in **try.yarnspinner.dev** → **File → Save as JSON**. Nodes hold lines;
  `#hashtags` tag lines; `<<if>>` for conditions.
- **Decision:** we do NOT run the full Yarn runtime (no in-game branching needed);
  a pure loader ingests the JSON, maps **node titles → our pools**
  (`Intro/Correct/Wrong/Clear/Win` → `reactions`; `Fragment_*` → story fragments),
  one line per entry, keeping our deterministic + no-repeat engine. Optional
  `#when:...` hashtags → `Line.when` gates. Tests against a sample JSON.
- Sources: [Yarn JS library (IkeB108)](https://github.com/IkeB108/Yarn-Spinner-Javascript-Library) ·
  [Yarn nodes & lines](https://docs.yarnspinner.dev/write-yarn-scripts/scripting-fundamentals/lines-nodes-and-options)

### A4. Backgrounds (CC0) — DECIDED
- **Kenney.nl** + **OpenGameArt CC0** (incl. layered parallax space/nature) — CC0 =
  commercial-OK, no attribution required (but we track sources in a `LICENSES`/
  `NOTICE` for hygiene).
- **Decision:** `LevelScene` renders a few **layered parallax images** (CC0) +
  an **arc-state overlay** (dark→warm by `heal`, generalizing `.sg-warm`).
  Budget: compressed assets, ≤3–4 layers, transform/opacity motion only,
  reduced-motion + low-end safe. Characters = Rive; scenery = CC0.
- Sources: [Kenney CC0](https://kenney.nl) · [OpenGameArt CC0 backgrounds](https://opengameart.org/content/cc0-backgrounds)

### Net: no blockers. Build order unchanged; loaders + RiveAvatar + LevelScene are
now spec'd precisely enough to implement against sample fixtures before your real
exports arrive.
