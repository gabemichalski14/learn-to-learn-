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
