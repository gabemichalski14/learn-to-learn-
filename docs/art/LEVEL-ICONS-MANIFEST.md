# Levels page — PNG manifest

The `/levels` page now headlines each level's **themed world name** with a
per-world accent + its painted icon. Two asset sets:

- **A. Level icons** — `public/images/ui/level-<N>.png` — ✅ **DONE** (all 10
  uploaded; `LevelEmblem` renders them, emoji/SVG only as fallback).
- **B. Level-card backgrounds** — the soft scene behind each card's text. Only
  L1/L2 have one today (animated). **Needed: `card-3` … `card-10`** (and optional
  painted `card-1`/`card-2` to replace the CSS animations).

## How the card background is wired

Drop files at **`public/images/levelcards/card-<N>.png`**. The card is ~360×220
on screen; export **1200×720 PNG, full-bleed** (it sits *behind* the card text on
the left, so keep the **left ~55% calm/low-contrast** and put the visual interest
on the right). Each card already has a per-world accent color — match it.

## Shared art-direction (top of every prompt)

> Soft hand-painted children's-storybook illustration, cozy and warm, gentle
> depth, painterly light. A wide scene that works as a **card background** —
> low-contrast and uncluttered on the LEFT half so dark text stays readable;
> the subject sits toward the RIGHT. No text, no characters' faces front-and-
> center, no harsh detail. Muted, dreamy palette in the world's accent color.

## Card prompts (one themed world per level)

| File | World (Level) | Accent | Prompt (append to the shared direction) |
|------|---------------|--------|-----------------------------------------|
| `card-3.png` | **Patch's Workshop** (3 · Closed Syllables) | warm amber `#c8893e` | a cozy tinkerer's workbench at golden hour — spools of thread, small wooden tools, a soft lamp glow, sawdust motes in the light; right side has the bench, left fades to warm wood-wall |
| `card-4.png` | **Giant's Valley** (4 · Long Vowels & Big Words) | mossy green `#7a9e6b` | a vast green valley at dawn, gentle rolling hills, a friendly dinosaur silhouette far on the right ridge, soft morning mist; left side is open sky/hill |
| `card-5.png` | **Tinker Town** (5 · Prefixes & Suffixes) | copper `#d98a3d` | a whimsical little town of word-part workshops with gears and a friendly toy train adding cars at front and back, warm copper afternoon; train + town on the right |
| `card-6.png` | **Whisper Woods** (6 · Silent-E & Consonant-LE) | dusk violet `#8a7bc0` | a hushed twilight forest, soft glowing fireflies, a single small glowing letter "e" floating like a will-o'-wisp on the right, lavender mist; calm dark-blue left |
| `card-7.png` | **Pirate Cove** (7 · Vowel-R) | sea teal `#2f8aa8` | a friendly cartoon pirate cove at sunset — a small ship, a rolled treasure map, gentle waves, a little flag with an "R" on the right; calm water + sky on the left |
| `card-8.png` | **Tidepool Bay** (8 · Advanced Vowel Teams) | aqua `#3fb5a0` | a sunny tidepool shore, pairs of cute sea creatures sharing each pool, shells and starfish on the right, calm reflective water; open wet sand on the left |
| `card-9.png` | **Globe Harbor** (9 · Foreign Word Patterns) | warm blue `#5b86c4` | a friendly little world harbor — small boats with flags from many lands, a globe buoy, gentle afternoon light; boats/dock clustered on the right, open water left |
| `card-10.png` | **Root Ruins** (10 · Greek & Latin Roots) | terracotta `#b87a55` | ancient sunlit ruins — a few weathered stone columns wrapped in carved roots and vines, a stone tablet, warm golden-hour glow on the right; open sky/steps on the left |
| `card-1.png` *(optional)* | **Sound Garden** (1) | green `#5aa06f` | soft sunrise meadow, rolling green hills, tiny wildflowers, a sprout on the right (replaces the CSS garden animation) |
| `card-2.png` *(optional)* | **Space Patrol** (2) | teal `#22c1d6` | calm starfield, one ringed planet + a tiny rocket on the right, deep teal cosmos (replaces the CSS space animation) |

## Wiring (after the files exist)

`LevelsPage` adds a `lvl-card--themed` variant: `background-image: url(/images/levelcards/card-<N>.png)` over the accent wash, with the text in a bottom scrim — exactly how L1/L2 work today. Say the word once `card-3…card-10` are in and I'll wire it (one shared variant, every level).
