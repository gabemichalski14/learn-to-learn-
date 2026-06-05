# Plan 2 Backlog

Carry-forward items for the next build cycle. Sources: the v1 design spec's deferred
scope, plus the final code review of the v1 foundation (2026-06-04).

## Planned v1 → v2 features (from the spec)
- **Mode B — Connect the pairs** (the second play mode).
- **Age-band themes** (Playful / Cool / Grown-up) — swappable, never babyish.
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
- **A11y-3 (live-region swap):** On completion, the prompt `<p role=status aria-live=polite>`
  is unmounted and a different `<div role=status>` is mounted. Keep a single persistent live
  region and change its text instead, so all screen readers reliably announce completion.
- **A11y-4 (button label names a letter):** `SoundBasket` replay label is `Replay the b sound`;
  screen readers say the letter name "bee", at odds with the letterless principle. Revisit
  once recorded phoneme audio exists.

## Other review notes
- **Completion audio:** the spec calls for a gentle celebration on completion; v1 shows the
  visual "All sorted!" silently. Add a completion sound alongside the Plan-2 reward system
  (a `useEffect` in `useSortGame` watching `isComplete`).
- **Placeholder emojis:** all emojis are temporary stand-ins for the real, inclusive
  illustration set. (v1 corrected two mismatches: `mop`→mouse, `top`→tiger.)
