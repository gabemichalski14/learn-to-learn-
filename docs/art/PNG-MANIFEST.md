# PNG asset manifest — Learn to Learn

Everything the art system can show. Create PNGs at the listed paths and they light
up automatically (the `<Art>` resolver HEAD-probes each path and falls back to the
current emoji/SVG until a real PNG exists — so you can deliver these in any order,
at any pace, with no broken states).

## Conventions
- **Root:** `public/art/` — e.g. key `char:patch:cheer` → `public/art/char/patch-cheer.png`.
- **Format:** transparent PNG (RGBA), trimmed, centered.
- **Retina:** optionally add a `…@2x.png` at 2× the listed pixels (the resolver uses `srcset`).
- **Style:** cozy storybook / characterful-flat (see `DESIGN.md`). Warm, soft edges, kid-friendly.
- **Naming:** `<id>-<variant>.png`, lowercase, hyphenated.
- **Status:** every row has a working fallback today; "★" = highest impact (do first).

---

## 1 · Characters — 6 expressions each (`public/art/char/`)
Expressions (same 6 for every character): **calm** (idle), **talk**, **cheer**
(correct/happy), **wobble** (unsure/wrong), **point** (teaching), **bloom**
(celebrate/win). Size **512×512** (@2x 1024). One row = 6 files (`<id>-calm.png` …).

| id | who | level | dyslexic strength (art personality) | ★ |
|----|-----|-------|-------------------------------------|---|
| `pip` | Pip — constant companion (also `pip-wink` easter egg = 7 files) | all | warm guide; curious sprout | ★ |
| `echo` | Echo — audio sprite (calm / happy / twinkle = 3 files) | all (games) | a glowing sound-ripple | ★ |
| `chip` | Chip | 1 | musical ear — hears the whole song | ★ |
| `moss` | Moss | 2 | spatial sense — knows where each sound belongs | ★ |
| `patch` | Patch | 3 | interconnected — sees how parts join (a tinker/builder) | ★ |
| `l4` | (name TBD) | 4 | narrative reasoning — words as stories/chunks | |
| `l5` | (name TBD) | 5 | material/builder — assembles word-parts (affixes) | |
| `l6` | (name TBD) | 6 | dynamic reasoning — the "magic-e" transformer | |
| `l7` | (name TBD) | 7 | resilience — the crowned R that bends vowels | |
| `l8` | (name TBD) | 8 | pattern-finder — two vowels, one voice | |
| `l9` | (name TBD) | 9 | curiosity/global — words from faraway places | |
| `l10` | (name TBD) | 10 | etymologist — ancient roots connect everything | |

**Characters subtotal: ~70 PNGs** (10×6 + Pip 7 + Echo 3).

## 2 · Worlds / hubs (`public/art/hub/`)
Per level-world: a **bg** (1600×900, the soft backdrop), a **frame** (1600×420, the
foreground "ground"/edge), and 2–3 **props**. Worlds 1–3 exist (Sound Garden, Space
Patrol, Patch's Workshop); 4–10 are themed slots.

| world | level | bg | frame | props (≈400×400) | ★ |
|---|---|---|---|---|---|
| `garden` | 1 | meadow/storybook hills | grass + flowers edge | sprout, sound-flower, signpost | ★ |
| `space` | 2 | starfield/planets | console/horizon | rocket, planet-bin, star | ★ |
| `workshop` | 3 | warm tinker shop | workbench shelf | pegboard, spool, saw, gear | ★ |
| `l4` | 4 | (syllable valley) | — | — | |
| `l5` | 5 | (word-builder lab) | — | — | |
| `l6` | 6 | (silent-E grove) | — | — | |
| `l7` | 7 | (vowel-R castle) | — | — | |
| `l8` | 8 | (vowel-team isles) | — | — | |
| `l9` | 9 | (world bazaar) | — | — | |
| `l10` | 10 | (ancient ruins) | — | — | |

**Worlds subtotal: ~50 PNGs** (10 × ~5).

## 3 · Per-game art (`public/art/game/`)
Most games use word **emoji** for picture cards (no PNG needed). These are the
shared, reusable game pieces (one set, reskinned by tint per world) — **512×512**
unless noted.

| key | piece | used by | ★ |
|---|---|---|---|
| `game:tile` | letter tile (blank) | Build, Blend Buddies, Dictation | ★ |
| `game:slot` | letter slot (empty/filled) | Build, Blend Buddies | |
| `game:bin` | sorting bin / basket | Sort It, Sort games | ★ |
| `game:card` | picture-card frame | all picture games | |
| `game:scissors` | chop tool | Chop Shop | |
| `game:meter` | fluency timer ring | Fluency games | |
| `game:correct` / `game:wrong` | answer FX badges | all | |
| `game:buddy-link` | the "blend buddies hold hands" connector | Blend Buddies | |

**(Optional, large)** illustrated word-cards — one per vocab word in the content
packs (replaces the emoji). Hundreds of items; emoji is the fallback, so this is a
"nice to have, anytime" set. Path `public/art/words/<word>.png` (256×256). Word
lists live in `src/content/packs/*`.

**Game-art subtotal: ~10 core + optional word set.**

## 4 · UI (`public/art/ui/`)
| key | what | size | ★ |
|---|---|---|---|
| `ui:logo` | Learn to Learn mark | 256×256 | ★ |
| `ui:level-1`…`ui:level-10` | the 10 level emblems | 256×256 | ★ |
| `ui:sticker-*` | achievement stickers (one per achievement in `achievements.ts`) | 256×256 | |
| `ui:checkpoint` | checkpoint badge | 256×256 | |
| `ui:lock` | locked-level padlock | 128×128 | |

**UI subtotal: ~10 emblems + 1 logo + the sticker set (≈12).**

## 5 · Rewards / FX (`public/art/fx/`)
| key | what | size | ★ |
|---|---|---|---|
| `fx:sound-flower` | a bloomed sound-flower (Village reward) — ideally 3–4 variants | 256×256 | ★ |
| `fx:confetti` | celebration burst | 512×512 | |
| `fx:sparkle` | small twinkle | 128×128 | |
| `fx:star-3` | finish-screen stars | 256×128 | |

**FX subtotal: ~8.**

## 6 · Village (`public/art/village/`)
| key | what | size | ★ |
|---|---|---|---|
| `village:bg` | the Sound Garden Village panorama | 1600×600 | ★ |
| `village:cottage` | a friend's cottage (1 base + per-character tints, ≈10) | 400×400 | |
| `village:prop-*` | trees, fence, path, lamp | 300×300 | |

**Village subtotal: ~15.**

---

## Grand total ≈ **165 PNGs** for the complete system (every level, all states).
**Do-first (★) for L1–L3 live polish ≈ 60:** Pip + Echo + Chip/Moss/Patch (6 each),
the 3 world bg/frame/props, the core game pieces, the 10 level emblems + logo, the
sound-flower, the village panorama. Everything else upgrades the experience as it
lands, with zero code changes and no broken states in the meantime.
