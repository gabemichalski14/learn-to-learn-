# Learn to Learn — Phonics Games

## Design System
Read `DESIGN.md` before making any visual or UI decision. Fonts, colors, spacing,
motion rules, and the Living World immersion system are defined there. Do not
deviate without explicit approval.

Hard rules worth repeating:
- Motion is transform/opacity only — never animate `filter`/`backdrop-filter` on
  blurred layers (causes per-frame re-rasterization / the lag bug we fixed).
- Honor `prefers-reduced-motion` everywhere.
- No streak-guilt / FOMO / scarcity / decay — growth tracks real practice only.
- Interactive touch targets ≥ 40px (modal buttons 44px).

## Build & verify (gate)
Run local binaries, never `npx`:
`./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run && ./node_modules/.bin/vite build`

## Architecture guardrails
- Reads of local data go through the reactive store (`src/data/store.ts`,
  `useSyncExternalStore` over `dataBus`). Don't read `localStorage` directly in
  effect dependency arrays — it returns fresh objects each call and loops the
  render. The `local/no-unstable-deps` ESLint rule guards this.
- Component files may export only components (+ constants) — hooks/contexts live
  in their own `*Context.ts` files (`react-refresh/only-export-components`).

## IP boundary
Independent product. Never reproduce the Barton Reading & Spelling System®'s word
lists, sentences, scripts, or materials. All content is original. See `NOTICE`.
- Do NOT display a transcribed scope & sequence (lesson breakdown / sound
  groupings / "Book N"). `src/curriculum.ts` is internal-only; a lint rule bans
  importing it from any `.tsx`. See `docs/IP-CURRICULUM.md`.

## Congruence & scalability (why gaps kept "falling through")
Inconsistencies between levels recurred because screens hand-rolled their own
markup, so they drifted. The fix is STRUCTURAL congruence, not manual review:

- **Any structure on 2+ screens MUST be a shared component — never copy-pasted.**
  Game chrome → `src/ui/GameShell.tsx` (back/badge/progress/mute). Hub headers →
  `src/ui/HubHeader.tsx` (back-left, title-centered). Icons → `src/ui/Icon.tsx`.
  Word pictures → `WordPicture`. Characters → `CharacterArt`. A new level/game
  reuses these; it does not re-implement a header or a HUD.
- **Theme via a per-world `prefix` (gd-/sg-/wk-…), not new layout.** Shared
  components own the LAYOUT; the world only supplies COLORS. New worlds add a
  prefix's color rules — never a new header/HUD structure.
- **Enforce, don't just review.** Prefer a lint rule or a test over a checklist:
  e.g. the IP import guard (`eslint.config.js`), the `no-unstable-deps` rule. When
  a class of bug recurs, add a guard so the gate catches it next time.
- **Definition of done for any screen:** uses the shared shell/header; no bespoke
  chrome; fits one viewport (games never scroll); ≥40px targets; gate green.

## Confidence floor (≥95%, aim 100%) — for this agent and every sub-agent
Before building a brick or marking it done, confidence in THAT brick must be ≥95%,
and it must never knowingly drop below 95%. **Aim for 100%: eliminate every
*addressable* caveat before moving on — do not ship a brick with open "known
limitations".** A residual is acceptable ONLY when it is (a) genuinely
data-dependent (must be tuned against real usage — wire it to the Freshness
Engine / mastery data) or (b) an explicitly-scheduled tracked task (a TaskCreate
id). Reframe every "caveat" as either *fixed now* or *task #N* — never a vague
hand-wave. Confidence is calibrated and EVIDENCED, never asserted: a brick earns
its number only when its risky assumptions have a concrete validation — a passing
test, a reviewed sample output, a cited source, or types read from the real code.
Below the floor, run the de-risking loop: name the uncertainty, resolve it the
cheapest sufficient way (spike, targeted test, research, or a clarifying question),
then re-assess. Risky parameters are named constants with a "tunable / validate
against real data" note. Sub-agents inherit this rule via their prompt. When asked
"how confident are you?", answer with a calibrated number and the specific residual
risks — never round up to please.

## Freshness Engine (stay current — standing practice)
Reading, gaming, and compliance science go stale. The coverage maps in
`docs/coverage/` + the quarterly sweep (`docs/coverage/SWEEP.md`) keep us current,
enforced by guard tests (a red coverage gate means the quarterly review is overdue —
run the sweep, don't delete the test). These deep research dives are a STANDING
cadence, not a one-off. See `docs/superpowers/specs/2026-06-11-freshness-engine-design.md`.
