# Design System — Learn to Learn Phonics Games

## Product Context
- **What this is:** An audio-first, letterless phonics practice suite aligned to structured-literacy (Orton–Gillingham) methods. Independent product; not affiliated with the Barton Reading & Spelling System® (see NOTICE).
- **Who it's for:** Tutors and their students, ages 5 → adult. Must never read babyish to an older learner; must never raise anxiety for a dyslexic one.
- **The one memorable thing:** *A calm garden world that quietly grows richer the more you actually practice* — your effort made visible, never a slot machine.

## Aesthetic Direction
- **Direction:** Organic / natural — warm editorial. Cottagecore botanical, not cartoon.
- **Decoration level:** Intentional → expressive *only as earned* (the Living World tiers).
- **Mood:** Encouraging, unhurried, alive. No timers, no fail states, no streak-guilt, no FOMO.
- **Themed worlds:** Level 1 = Sound Garden (meadow). Level 2 = Space Patrol (cosmos). Each level can become its own world.

## Typography
- **Display/Hero:** Playfair Display (serif) — gives an adult, editorial gravity that keeps it from looking like a toy.
- **Body / UI:** Poppins — friendly, highly legible, dyslexia-tolerant.
- **Loading:** Google Fonts (`fonts.googleapis.com` + `fonts.gstatic.com`); allow-listed in the CSP (`vercel.json`).

## Color (live tokens — `src/styles/theme.css :root`)
- **Ink (text):** `#0d1b2a` · **Muted:** `#5c6b75`
- **Brand teal:** `#1b9aaa` (deep `#14808f` for AA text) · ring `#7fc7ce` · soft `#e2f1f2`
- **Growth green:** `#6bae7f` · mint `#a8d5c2`
- **Gold (stars/achievement):** `#f5c84c` (readable text gold `#a9741a`)
- **Surface:** `#ffffff` on bg `#f2f4f6`
- **Semantic:** good = teal; warn = `#a9741a`. Keep all body text ≥ AA on its surface.

## Spacing & Layout
- **Radius:** `--radius: 18px` (cards), pill `999px` for controls.
- **Page:** `.l2l-page` max-width 1080px, centered, fluid padding. Narrow variant 760px.
- **Touch targets:** ≥ 40px for interactive controls; modal buttons 44px.

## Motion
- **Principle:** transform/opacity only. NEVER animate `filter`/`backdrop-filter` on blurred layers (re-rasterizes every frame → the lag bug we already fixed).
- **Restraint:** "not all at once" — only a subset of decorative elements animates at a time; staggered delays; capped counts.
- **`prefers-reduced-motion`:** honored everywhere (drift freezes; the navigation wipe degrades to instant navigate).

## The Living World system (`src/world/`)
The app-wide immersion + progression model. Three intrinsic mechanics only (investment loop, competence-made-visible, caretaking companion); we deliberately reject FOMO/scarcity/streak-guilt/decay as anti-mission. Full research in the project memory note `barton-games-immersion-research.md`.

- **Tier engine — `worldTier.ts`:** per-learner tier 0–5 from `investmentScore = sessions*3 + stickers` (same fuel as the Sound Garden). Thresholds `[0,3,10,22,40,70]`. `useWorldTier()` reads the memoized `Progress` via the reactive store — loop-safe, live-updating, never decays.
- **Ambient backdrop — `LivingWorld.tsx`:** fixed `z-index:-1` layer behind every chrome page. Each tier ADDS a layer (flora → butterflies → fireflies → birds + blossom → meadow + shooting star). Positions seeded once per tier (mulberry32 + `useMemo`). Blooms in on mount = the world "reawakens" on return.
- **Easter eggs — `EasterEggs.tsx`:** rare, non-repeating, tier-scaled surprises on every chrome page (Pip peek, tappable clover, butterfly, sparkle). Self-rescheduling jittered timer; Clippy-proofed (rare, invited, dismissable); reduced-motion → calm clover only.
- **Mascot-led navigation — `GuideTransition.tsx` / `guideContext.ts`:** `useGuide().goTo(route)` plays a leafy curtain wipe with Pip scampering on the leading edge; route swaps mid-cover. Reduced-motion navigates instantly. Mascot CTAs funnel through `MascotBuddy.go()`.

## Mascots
Pip (kindchenschema baby-schema cuteness, modular expressions, idle life) is the primary guide; Echo (sound-spark) appears at audio moments. Scout/Sprout personify the Space/Garden worlds. Vocabulary is warm and learning-pointed — never streak-shaming. Silhouette-first design (per Duolingo Duo).

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-07 | Created DESIGN.md from the established brand + new Living World system | /design-consultation, after round-2 immersion/progression/guiding-mascot research |
| 2026-06-07 | Growth tracks real practice only; no decay, no streak-guilt | Mission fit (no-anxiety) + research: only intrinsic mechanics transfer ethically |
