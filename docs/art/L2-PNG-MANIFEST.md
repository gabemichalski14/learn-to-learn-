# Level 2 (Space Patrol) — PNG manifest for the remaining emoji

The shared UI icons (hear, mute, replay, etc.) already wire into Level 2 via the
`<Icon>` component, so the only Level-2 emoji left are the **space game icons**
(the per-game badge + mission-card glyphs) and the **picture sets**. Drop finished
files at the paths shown and they appear automatically (emoji fallback until then).

## Shared art-direction (top of every prompt)

> Cozy children's-storybook illustration, soft hand-painted look, friendly and
> rounded, single subject centered, **transparent background**, no text. This is a
> SPACE world — bright, glowing, candy-cosmic palette (cyan / teal / warm gold)
> that reads clearly on a **dark starfield** HUD. Subtle outer glow so the icon
> pops on dark. Square canvas, generous padding.

Export: **PNG, transparent, 256×256** for icons. Match the look of the existing
`/images/ui/ico-*.png` set (same weight/finish), just space-tinted.

---

## A. Space game icons — `public/images/ui/<name>.png`

One per Level-2 game (used in the game's HUD badge **and** its card on the Space
Patrol hub). 256×256, transparent, glowy-on-dark.

| File | Replaces (game) | Prompt |
|------|------|--------|
| `ico-blast-off.png` | 🚀 Blast Off | a friendly rounded rocket lifting off with a little flame trail |
| `ico-touchdown.png` | 🛬 Touchdown | a small spacecraft/lander gently touching down, or a planet with a soft landing arc |
| `ico-vowel-patrol.png` | 🛸 Vowel Patrol | a cute round UFO/saucer with a glowing beam, on patrol |
| `ico-star-station.png` | 🛰️ Star Station | a friendly little space station / satellite with panels |
| `ico-word-beam.png` | 📡 Word Beam | a dish antenna beaming a soft glowing signal |
| `ico-warp-speed.png` | ☄️ Warp Speed | a comet/shooting star with a bright speed-streak tail |
| `ico-space-patrol.png` | (hub badge) | the Space Patrol mark — a small planet + star, the level's emblem |

> Wiring: add these to the `GAME_ICON` map (mirror Level 1's `GardenLevelHub`)
> and the three Station badges, exactly like L1 — I'll do that the moment the
> files exist.

---

## B. Picture sets (bigger, optional — for a fully painted Level 2)

These are the in-game pictures, currently emoji or simple icons. They're a
larger art effort; not required for the chrome to be emoji-free.

| Where | Currently | Option |
|-------|-----------|--------|
| **Vowel Patrol creatures** (the draggable sort items) | `SpaceSpecimen` (creatureIcons) | Either reuse the existing `/images/words/*.png` painted set via `WordPicture` (cat, dog, sun, pig…), OR a bespoke **space-creature** set (each CVC word as a little alien) at `/images/words/space/<word>.png`. |
| **Warp Speed options** (read-the-word → pick the picture) | word emoji | Same: wire to `WordPicture` (reuses the painted word set) — quickest win. |
| **Star Station / Word Beam "hear it" picture** | the word's emoji | `WordPicture` (reuses the painted word set). |

> Recommendation: wire B to the **existing `/images/words` painted set** (no new
> art needed) — same move that de-emoji'd Rhyme Time / Blend It. If you'd prefer
> bespoke space-creatures, say so and I'll spec that set separately.

---

## Note on the shared UI icons over the dark theme

`ico-hear / ico-mute-* / ico-replay / ico-village …` are warm garden-styled but
read fine on the space HUD. If you want space-tinted variants, create
`ico-hear-space.png` etc. and I'll theme the L2 `<Icon>` calls to use them —
otherwise the shared set stays (one icon, every level).
