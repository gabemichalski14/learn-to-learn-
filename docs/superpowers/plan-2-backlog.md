# Plan 2 Backlog

Carry-forward items for the next build cycle. Sources: the v1 design spec's deferred
scope, plus the final code review of the v1 foundation (2026-06-04).

## ✅ Resolved in the teal redesign (2026-06-04)
- **Learn to Learn brand** (teal #7FFDF7 family + ink + white) is now the default look.
- **Anti-pattern round generation**: random sounds, unequal hidden counts, shuffled
  basket order, 2–3 baskets, varied length, larger pool.
- **Sound-as-basket** layout: central pulsing speaker, tap-anywhere, keyboard-reachable.
- **Grow-the-tree** engagement: enhanced logo recreated as an SVG progress meter.
- **A11y-3 (live-region swap)** — fixed: one persistent `role=status` region.
- **A11y-4 (label names a letter)** — fixed: basket label is "Hear this basket's sound".
- Pack expanded/curated to ~6 clean single-onset words per sound.
- **5-page sessions** of 6 pictures each; tree grows across the whole session; page dots.
- **Age-band themes** (Playful / Cool / Grown-up) — swappable via [data-theme], tutor
  switcher top-right, persisted in localStorage. All teal-family.

## Planned v1 → v2 features (from the spec)
- **Mode B — Connect the pairs** (the second play mode).
- **Interest-pack switching** UI (more packs beyond "Everyday Objects").
- **Reward-style toggle** (playful stars/confetti ↔ calm/minimal).
- **Recorded human audio** — replace the TTS stub via the existing `AudioPlayer` interface
  (record the ~40 phonemes first, then words). No call sites change.
- **Customizable avatar / guide** character.
- **"Game World" theme** (the richer animated direction).
- Generalize `WordItem.beginningSound` to support **ending / middle** sound targets
  (unlocks Ending Sounds & Middle Sounds games on the same engine).

## Accessibility items found in v1 review (address with the audio + theming work)
- **A11y-1 (keyboard word replay):** A keyboard user focused on a `PictureCard` presses
  Space/Enter and dnd-kit's KeyboardSensor starts a *drag* — there's no keyboard path to
  hear the word without dragging. Add a dedicated replay affordance or key binding.
  (v1 fixed the pointer/mouse path by moving `onActivate` onto the button; keyboard remains.)
- **A11y-2 (`role="img"` vs drag semantics):** `PictureCard` sets `role="img"`, overriding
  dnd-kit's `role="button"`, reducing screen-reader "draggable" semantics. Reconcile so the
  element is both a named picture and an announced draggable (e.g. aria-roledescription).
- ~~**A11y-3 (live-region swap)**~~ ✅ done in the teal redesign — one persistent live region.
- ~~**A11y-4 (button label names a letter)**~~ ✅ done — basket label no longer names a letter.

## Other review notes
- **Completion audio:** the spec calls for a gentle celebration on completion; v1 shows the
  visual "All sorted!" silently. Add a completion sound alongside the Plan-2 reward system
  (a `useEffect` in `useSortGame` watching `isComplete`).
- **Placeholder emojis:** all emojis are temporary stand-ins for the real, inclusive
  illustration set. (v1 corrected two mismatches: `mop`→mouse, `top`→tiger.)

## Progress, rewards & leaderboard
- **Local progress store** (`src/progress.ts`): earned achievement ids, best finish time,
  sessions completed. Sticker book + finish reward + elapsed clock read/write through it.
- **Goal-based stickers** (`src/achievements.ts`): each sticker is a distinct, program-wide
  goal (perfect run, speedy, 90%+ accuracy, N sessions, multi-day streak, …). Evaluated +
  awarded once per finished session via `awardForSession()`. New goals = add to the array.
- **Tutor session log** (`src/sessionLog.ts` + `SessionLogView.tsx`): one record per
  completed session (date, duration, items, wrongAttempts, accuracy) + CSV export. **This
  is the paid-value data layer — EVERY game we build MUST log through `logSession()`** with
  the same record shape. Standard pattern: each game screen calls `noteRound(sessionId,
  wrong, items)` per round (survives the per-page remount), and on the final round calls
  `logSession(...)` + `recordFinish(...)` + `awardForSession()`. Add `game`/`level`/`lesson`
  fields so the log is filterable per game and per Barton placement.
- **Tutoring-center-wide leaderboard (eventual).** Needs a backend (shared store) + a
  learner/center identity — neither exists locally. Path: (1) add a lightweight profile
  (name + center/class id), (2) on `recordFinish`, POST the result to an API, (3) a
  leaderboard view reads top times / most stickers per center. Keep `progress.ts` as the
  client write-point so game code never changes. Decide privacy model (kids' names → use
  initials/avatars or tutor-managed handles).
- **Best-time on screen during play?** Deliberately NOT shown (no time pressure, Barton
  no-anxiety). Best time appears only in the sticker book + at the finish.

## Curriculum alignment (from the tutor's Barton scope & sequence — for our OWN content)
- Barton materials are copyrighted → use the scope/sequence only as a reference; author our
  own decodable word/picture sets (individual short words & common sight words aren't
  protected; the selection/arrangement is — so build a pedagogically-equivalent sequence).
- **Cumulative letter-sound sequence** (drives lesson-by-lesson packs). Our current
  b/s/m/t pack maps to Barton **L2 L1** (a, b, f, m, p, s, t):
  - L2 L1: a(short), b, f, m, p, s, t
  - L2 L2: i(short), c, g, h, l, n, r
  - L2 L3: o(short), d, j, k, v, z
  - L2 L4: u(short), w, x, y, qu
  - L2 L5: e(short), sh, th, ch, wh, ck
- **Two skill modes per item: Read vs Spell** — a natural axis for future game types.
- **Sight words** are tracked per Barton level/lesson with Read & Spell checkboxes
  (Learn to Learn's own lists) → a future Sight-Word game + a per-item mastery model.
- Suggested content model: **Level → Lesson → items**, each item tagged with concept type
  (vowel, digraph, suffix, prefix, etc.) per the scope-and-sequence colour taxonomy.
