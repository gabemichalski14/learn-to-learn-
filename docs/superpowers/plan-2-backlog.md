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
