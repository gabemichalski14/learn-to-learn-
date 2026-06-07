# Garden Scene Art Spec — "a meadow you sit in"

Target: the app's ambient world reads as a real, cozy, golden-hour **meadow** (not
scattered floating sprites), with the content "board" set down *into* it like a
picnic blanket. Derived from cozy-game art breakdowns (Alba, Stardew Valley, Cozy
Grove, BotW/Totoro meadow studies) + grounding/shadow + atmospheric-perspective
research. This is the build target; nothing here is wired yet.

## 1. Layer stack (back → front) with viewport proportions
A built **landscape**, not a transparent scatter. Each layer is an explicit band:

1. **Sky** — top 0→~60%. Warm golden gradient: cream `#fdf4e4` top → honey, with a
   soft peach sun-glow `#ffe2b8` near the horizon (upper-right).
2. **Far hills + treeline** — sit ON the **horizon at ~60% from top** (rule of
   thirds: ground = lower ~40%). Solid soft-rounded hill shapes + a low treeline
   silhouette. **Atmospheric:** pale, desaturated, slightly cool/hazy, low contrast
   (`#c6d3b0` → `#aac291`). A thin warm haze band right at the horizon.
3. **Meadow ground plane** — ~60%→100%. THE missing foundation: a **solid green
   field** with a crisp top edge (the horizon) and a vertical gradient
   (lighter/warmer at horizon `#8fc070` → richer `#5f9a58` → `#4e8a52` toward the
   bottom). Optional faint mown-stripe / soft texture.
4. **Midground plants** — flower + grass **clusters** planted across the field,
   smaller & paler near the horizon, each with a contact shadow. Clustered +
   overlapping with open patches (never even-spaced).
5. **Foreground band** — bottom ~0→20%. Large, warm, saturated grass tufts +
   flowers that **overlap the board's lower edge**, sharp detail, bigger shadows.
6. **Foreground frame** — leafy vines drape over the **top corners**, in front.

## 2. Grounding — the float fix (do this on EVERY plant/tree)
Research is unanimous: *shadows are what say "on the ground" vs "floating."*
- **Contact shadow** under each plant base: a soft ellipse, width ≈ 55–70% of the
  plant, height ≈ 14–18% of its width, `rgba(54,60,38,0.18)`, soft-edged (radial
  fade), anchored at the stem base. Trees get a larger pooled shadow at the trunk.
- Build a reusable `<Planted>` wrapper = plant SVG + its shadow, used everywhere,
  so nothing can be placed without a shadow.

## 3. Placement — clusters, not scatter
- Pick a handful of **cluster centers**; scatter a few plants around each with
  jitter; leave open meadow patches between clusters.
- **Density gradient:** denser in a band along the horizon and again in the
  foreground; sparser in the mid-field.
- **Overlap** is good (plants partly behind each other) — that's what reads as a
  field. Size by depth (near = bigger).

## 4. Atmospheric perspective (depth via color, not just size)
| Depth | Saturation | Value | Temp | Size |
|---|---|---|---|---|
| Far (horizon) | low (hazy) | light | cooler/sage | small |
| Mid | brand greens | mid | neutral | medium |
| Near (foreground) | high | darker/richer | warmer | large |
Plus a thin warm haze gradient at the horizon to separate far from mid.

## 5. Palette (limited + warm; Stardew uses ~6–8 colors)
- Sky cream `#fdf4e4` → peach `#ffe2b8`; hills `#c6d3b0`/`#aac291`.
- Meadow `#8fc070` → `#5f9a58` → `#4e8a52`; foreground accents warmer.
- Flowers (small set, reuse 6 species): coral `#e8657f`, butter `#ffd34d`, poppy
  `#e8553f`, white daisy, soft bluebell `#7d8ff0` (sparing), buttercup `#ffd34d`.
- Shadows warm-green `rgba(54,60,38,0.18)`.

## 6. The board, nestled INTO the meadow (fixes "the board ate the garden")
- Board top starts ~14% from the viewport top, so **sky + hills + horizon show
  above it**.
- The board does **not** fill to the bottom; the **foreground meadow grass
  overlaps the board's lower edge** (tufts rising in front of it) so it sits *in*
  the grass. Vines drape over its top corners.
- Board stays warm parchment + grain + grounded shadow, but is now clearly bedded
  in the garden — picnic-blanket / open-book-on-grass, not a sheet on a void.
- The meadow ground is a **fixed** backdrop, so it always reads as ground behind
  the (scrolling) board.

## 7. Motion (restrained — guardrails preserved)
- Only a subset of grass/flowers sway, slowly. A few butterflies cross.
- **Structured parallax:** 3 bands at different rates on pointer (far hills slowest,
  mid medium, foreground fastest) — multi-layer depth, kept subtle (too much =
  chaotic). Dappled light + motes stay.
- transform/opacity only; `prefers-reduced-motion` freezes drift; loop-safe;
  density still driven by the slow multi-year lushness curve.

## 8. Build shape
- Replace the scatter in `LivingWorld` with an explicit layered `GardenScene`
  (sky / hills+treeline / meadow ground / clustered midflora / foreground / frame).
- `<Planted>` wrapper bakes in the contact shadow; clustered placement helper
  (cluster centers + jitter) seeded by tier, density by lushness.
- Board CSS: top margin for sky; foreground grass overlaps the bottom; vines over
  top corners.

## Sources
Alba env-art (ustwo); Stardew art-style notes; Cozy Grove art interviews; BotW/
Totoro meadow breakdowns; environment concept-art + parallax depth guides;
grounding/blob-shadow + Gestalt figure-ground research.
