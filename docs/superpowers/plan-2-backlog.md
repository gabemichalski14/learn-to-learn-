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

## Learner profiles & per-learner data (DONE — the data keystone)
- `src/profiles.ts`: multiple learners on one device (tutor's device), a current
  learner, add/rename. `ensureLearner()` seeds "Player 1" on first run.
- **All data is namespaced per learner** (`ll:<learnerId>:earned|best|sessions|log`).
  `progress.ts`, `sessionLog.ts`, `achievements.awardForSession()` all take a learnerId.
  The game logs to the current learner (chosen in the Home `LearnerBar`).
- **Leaderboard** (`Leaderboard.tsx`): real local board across the device's learners —
  most stickers / fastest finish / most games, with medals. Preview of the center-wide one.
- **Tutor Dashboard** (`TutorDashboard.tsx`): pick a student → stat tiles (sessions, avg
  accuracy, best time, stickers), an accuracy trend, the full session log, CSV export, and a
  Print report (`@media print` strips nav/actions).
- **Next:** backend + center/class accounts so learners + logs sync across devices and the
  leaderboard goes center-wide. Privacy: store first-name + initials only, or tutor-managed
  handles; keep learner ids opaque. `profiles.ts`/`progress.ts`/`sessionLog.ts` are the only
  write-points a sync layer must hook.

## Platform / site shell
- **Routing:** dependency-free hash router (`src/router.ts`) with routes home / play /
  leaderboard / tutor. App.tsx is the route host. Swap for React Router later **without
  touching page components** — they only call `navigate()`.
- **Pages:** `Home.tsx` (brand + LearnerBar + the 10-level curriculum grid + progress cards),
  `LevelPage.tsx` (`#/level/<n>` — a level's game sub-menu), `GameScreen.tsx` (the game; 🏠
  Home button), `Leaderboard.tsx`, `TutorDashboard.tsx`.
- **Curriculum structure:** `games.ts` exports `LEVELS` (1–10), each with title/focus and a
  games sub-menu. PLACEHOLDER lineup — finalise titles/focus + per-level games against the
  scanned Barton scope & sequence. Beginning Sounds Match sits under Level 2.
- **Dashboard (modernised):** per-student KPI cards + SVG charts (accuracy-over-time area,
  time-per-session bars) + session-history table + CSV/print. `SessionLogPanel` has a
  `showSummary` toggle so the dashboard hides its duplicate stat row.
- **Theme scoping:** kid-band themes apply only inside the game (`data-theme`); the rest of
  the site stays in the default brand look.
- **Next for the platform:** learner/center profile (keys the leaderboard + per-student
  logs); real routes per game (`#/play/<id>`); a games-by-level browse view; a tutor
  "select student" switcher; then the backend that turns local progress/log into shared,
  center-wide data.

## Reference research (use the best, scrutinize the rest)
- **Wordwall** — 30+ activity templates; the ones we should mirror as future games:
  Group sort (= our sort engine), Match up, Find the match / Matching pairs (memory),
  Unjumble / Anagram (build-a-word, spelling), Quiz / Flash cards (listen-and-choose),
  Spin the wheel / Open the box (reward/randomizers). A good roadmap of proven mechanics.
- **Barton (official)** — Orton-Gillingham-influenced, *simultaneously multisensory,
  explicit, systematic, sequential, mastery-based*, 1:1, 10 levels (start at L1 regardless
  of age; completion ≈ 9th-grade reading). Design implications we should honor: practice
  matches the instructional sequence, multisensory (hear + see + drag), **mastery not
  advancement**, and **no-anxiety / confidence-building**. (We already do audio-first,
  no-fail, anti-pattern generation.)
- **Dyslexia simulation (geon.github.io)** — letters "jump around"; reading is high-effort
  even when comprehension is fine. Confirms our **audio-first, minimal-text** design.
  Best practice for any learner-facing text: dyslexia-friendly type (Lexend / OpenDyslexic
  as an optional toggle), generous letter/line spacing, short left-aligned lines, no time
  pressure. (Our finish clock is deliberately no-pressure; brand body font is Poppins — add
  a dyslexia-font accessibility toggle for in-game text later.)
- **Dyslexia Tutoring Toolkit (Sue Bridgman, Teachable)** — a DIRECT analog: Barton-aligned
  digital games organized by level 1–10. BUT it's a curated list of *third-party* embeds
  (Wordwall / BookWidgets), not an owned platform, and has no tutor data/leaderboards. Our
  edge = one branded, modern platform with our OWN engine + per-student data + dashboards.
- **IP / "scrutinize bad info"** — Barton materials are copyrighted and "Barton" is
  trademarked; the Toolkit's games are others' content. So: reference methodology + sequence
  only, **author all our own words/pictures/games**, brand as "Learn to Learn", and never
  reproduce Barton word lists or re-host anyone's games.
