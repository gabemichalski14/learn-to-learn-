# PNG asset manifest — Learn to Learn

Everything the art system can show, **with a ready-to-use generation prompt for
each asset**. Create PNGs at the listed paths and they light up automatically (the
`<Art>` resolver HEAD-probes each path and falls back to the current emoji/SVG
until a real PNG exists — deliver in any order, any pace, no broken states).

## How to use this file
1. Every prompt = **STYLE PREAMBLE** (below) **+** the asset's own line.
2. Drop the result at the asset's path; it appears live.
3. Paths: `public/art/<group>/<id>-<variant>.png` (key `char:patch:cheer` →
   `public/art/char/patch-cheer.png`). Transparent PNG (RGBA), trimmed, centered.
   Optional retina: add `…@2x.png` at 2× the listed px.
4. "★" = do-first for the L1–L3 live polish.

### ⭐ STYLE PREAMBLE (prepend to EVERY prompt)
> *Cozy children's picture-book illustration, "characterful-flat" style: clean flat
> shapes with soft gradient shading and a hint of hand-drawn grain — NOT corporate
> vector-flat, NOT 3D render, NOT photoreal, NOT anime. Warm friendly palette built
> around teal #1B9AAA, leaf-green #6BAE7F, mint #A8D5C2, gold #F5C84C on warm cream
> #FFFDF7. Soft rounded forms, gentle rim light, big readable silhouette, kind and
> calm mood (a reassuring world for a child who finds reading hard). Centered
> subject, generous padding, **fully transparent background**, no text, no letters,
> no logos, no frame/border, no drop-shadow baked in. Square canvas unless noted.*

---

## 1 · Characters (`public/art/char/`) — 6 expressions each · 512×512 (@2x 1024)
Each character = **6 files** using the **same 6 expression modifiers** appended to
that character's design line. (Pip = 7, Echo = 3.)

**Expression modifiers** (append after the character design):
- `calm` — relaxed, gentle closed-mouth smile, facing forward, at rest.
- `talk` — mouth open mid-word, one hand raised in a friendly gesture, lively.
- `cheer` — joyful, arms/limbs up, eyes bright, a couple of sparkles — celebrating a win.
- `wobble` — unsure and a little off-balance, soft worried brows (concerned, never scared or sad-crying).
- `point` — leaning in, one arm pointing to the side, "look here" teaching pose.
- `bloom` — radiant and fully alight, head-to-toe glow + sparkles, the "you did it / I'm whole again" hero moment.

| id | ★ | character DESIGN prompt (then append an expression modifier) |
|----|---|---|
| `pip` | ★ | *Pip — the guide mascot: a tiny round seed-sprout sprite, pale-green seed body with one curl of fresh leaf sprouting on top, big warm dark eyes, stubby arms, no legs (hovers/hops). Curious, gentle, the size of an acorn. Teal + leaf-green.* **(+ `pip-wink`: same, one eye winking, playful — easter egg → 7 files)** |
| `echo` | ★ | *Echo — a sound-sprite: a soft glowing orb made of concentric translucent sound-ripples, a faint ear-like curve, gold-and-teal aura, no face or a minimal dot-eye, ethereal and weightless.* **(only 3 files: `echo-calm`, `echo-happy` = brighter+sparkles, `echo-twinkle` = mid-shimmer burst)** |
| `chip` | ★ | *Chip (Level 1, "musical ear"): a cheerful little cricket, rounded green body, tiny antennae tipped like eighth-notes, a conductor's poise, one small wing raised like a baton; music is his whole world.* |
| `moss` | ★ | *Moss (Level 2, "spatial sense"): a friendly mossy space-explorer creature — a soft round moss-covered ball-being in a tiny clear bubble-helmet, little boots, calm and methodical, knows where everything belongs. Teal + green + starlight.* |
| `patch` | ★ | *Patch (Level 3, "interconnected tinkerer"): a warm handyman sprite stitched from patches of felt, a few visible seams/buttons, a spool-of-thread motif, a tiny tool tucked in a belt; loves seeing how parts join. Warm teal + gold.* |
| `l4` | | *Level 4 character (name TBD, "big-picture chunker"): a GENTLE GIANT / friendly long-necked word-dino — huge but soft and rounded, sleepy-kind eyes, mossy-green hide with gold spots, so big that small kids feel safe; makes long words feel climbable. (See level-4 design doc.)* |
| `l5` | | *Level 5 (TBD, "word-builder"): a tidy maker/engineer sprite surrounded by snap-together word-part blocks (prefix/suffix bricks), tool-belt, building things from parts.* |
| `l6` | | *Level 6 (TBD, "transformer"): a quiet magician sprite with a small wand and a silent-"e" charm, soft sparkles, changes things by adding one secret piece.* |
| `l7` | | *Level 7 (TBD, "resilient"): a small crowned "R" knight-creature that bends vowels, sturdy and friendly, a little royal.* |
| `l8` | | *Level 8 (TBD, "pattern-finder"): a duo/twin sprite — two vowels that speak with one voice, harmonious, mirror-like.* |
| `l9` | | *Level 9 (TBD, "global/curious"): a little traveler sprite with a tiny suitcase and passport, words from faraway places, wonder-struck.* |
| `l10` | | *Level 10 (TBD, "etymologist"): a gentle scholar sprite with a magnifying glass over ancient root-stones (Greek/Latin), wise and warm.* |

## 2 · Worlds / hubs (`public/art/hub/`) — bg 1600×900 · frame 1600×420 · props 400×400
| key | ★ | prompt |
|----|---|---|
| `hub:garden:bg` | ★ | *A cozy storybook MEADOW seen wide: rolling soft hills, a few stylized flowers and a friendly tree off to one side, warm morning light, dreamy distant haze. Calm background (subject area kept clear of clutter in the center). Wide 16:9.* |
| `hub:garden:frame` | | *A foreground GRASS-AND-FLOWERS edge strip (bottom band): tufts of grass, a few blooms and pebbles, slightly out of focus, transparent above. Wide, short.* |
| `hub:garden:prop` (sprout / sound-flower / signpost) | | *Small garden props, transparent: (a) a single fresh sprout, (b) a glowing musical "sound-flower" bloom, (c) a hand-painted wooden signpost. One per file.* |
| `hub:space:bg` | ★ | *A gentle storybook STARFIELD: soft deep-teal night sky, a couple of friendly rounded planets, scattered soft stars and a nebula glow, cozy not scary. Center kept calm. Wide 16:9.* |
| `hub:space:frame` | | *A foreground control-deck / horizon strip (bottom band): a soft console edge or planet-curve with a few glowing dials, transparent above.* |
| `hub:space:prop` (rocket / planet-bin / star) | | *Small space props, transparent: (a) a chubby friendly rocket, (b) a planet that doubles as a collection bin, (c) a plump gold star. One per file.* |
| `hub:workshop:bg` | ★ | *A warm cozy TINKER-WORKSHOP interior: wooden walls, a pegboard of friendly tools, soft lamp glow, sawdust motes in the light, inviting and safe. Center kept clear. Wide 16:9.* |
| `hub:workshop:frame` | | *A foreground WORKBENCH shelf strip (bottom band): a worn wooden bench edge with a spool of thread, a couple of tools, transparent above.* |
| `hub:workshop:prop` (pegboard / spool / saw / gear) | | *Small workshop props, transparent: pegboard tile, spool of teal thread, friendly hand-saw, wooden gear. One per file.* |
| `hub:l4:bg` | | *GIANT'S VALLEY: a soft storybook valley where huge gentle hills/mountains look like sleeping giants, a winding path climbing up in steps, warm light, awe without fear. Wide 16:9. (Level 4.)* |
| `hub:l4:frame` | | *Foreground valley-path strip (bottom band): a stepped trail with grass and a friendly milestone stone, transparent above.* |
| `hub:l4:prop` (giant-step / milestone / chunk-block) | | *Small L4 props, transparent: a stone step that lights up, a carved milestone, a "word-part" boulder that splits.* |
| `hub:l5:bg` … `hub:l10:bg` | | *(One bg each, themed per the level: L5 word-builder workshop-lab, L6 silent-e moonlit grove, L7 vowel-R little castle, L8 vowel-team twin isles, L9 world bazaar, L10 ancient root-ruins.) Same cozy style, calm center, wide 16:9.* |

## 3 · Game pieces (`public/art/game/`) — 512×512 unless noted
| key | ★ | prompt |
|----|---|---|
| `game:tile` | ★ | *A blank letter TILE: a warm wooden/felt rounded square tile, soft bevel, empty face ready for a letter, friendly and tactile.* |
| `game:slot` | | *An empty letter SLOT: a soft recessed rounded-square outline (dashed inner edge) where a tile will drop, gentle shadow inside.* |
| `game:bin` | ★ | *A sorting BIN / basket: an open friendly woven basket or labeled bin, slightly tilted toward the viewer, room to "drop" things in.* |
| `game:card` | | *A picture-CARD frame: a rounded card with a soft cream face and a thin teal edge, blank center for a picture.* |
| `game:scissors` | | *Friendly cartoon SCISSORS / a little saw for "chopping" a word, rounded safe edges, teal handle.* |
| `game:meter` | | *A gentle fluency TIMER RING: a soft circular progress ring (teal→gold), encouraging not stressful, no numbers.* |
| `game:correct` / `game:wrong` | | *Two small answer BADGES, transparent: (correct) a soft green check-sparkle; (wrong) a gentle amber "try again" swirl — kind, never harsh red X.* |
| `game:buddy-link` | | *A "holding-hands" CONNECTOR for blend buddies: two little linked hands / a soft chain-loop joining two tiles, warm.* |
| `words/<word>.png` (optional, 256×256) | | *Optional illustrated WORD-CARDS replacing emoji — one per vocab word in `src/content/packs/*`. Prompt each as: "a single friendly picture-book illustration of a <WORD>, centered, transparent." Large set; emoji is the fallback, so anytime.* |

## 4 · UI (`public/art/ui/`)
| key | ★ | size | prompt |
|----|---|---|---|
| `ui:logo` | ★ | 256 | *The "Learn to Learn" mark: a warm growing-tree/sprout emblem in teal+green+gold, simple and balanced, works tiny.* |
| `ui:level-1`…`ui:level-10` | ★ | 256 | *Ten round level EMBLEMS, one per world: L1 sprout/meadow 🌱, L2 rocket/planet 🚀, L3 spool/tools 🧵, L4 gentle giant/mountain 🦕, L5 building blocks, L6 silent-e moon ✨, L7 crowned R, L8 vowel twins, L9 globe/suitcase, L10 root-stone. Each a soft coin-like badge, consistent set.* |
| `ui:sticker-*` | | 256 | *Achievement STICKERS — one per achievement in `src/achievements.ts`: glossy die-cut reward stickers (star, streak-free "kept practicing", first-finish, level-complete), joyful, collectible.* |
| `ui:checkpoint` | | 256 | *A checkpoint BADGE: a friendly flag/medal marking "level mastered," teal+gold ribbon.* |
| `ui:lock` | | 128 | *A soft rounded PADLOCK for a sleeping/locked level — gentle, "not yet" not "forbidden," muted teal.* |

## 5 · Rewards / FX (`public/art/fx/`)
| key | ★ | size | prompt |
|----|---|---|---|
| `fx:sound-flower` | ★ | 256 | *A bloomed "SOUND-FLOWER" reward (3–4 variants): a glowing musical flower (petals like soft sound-waves, a note at the center), each variant a different warm hue. Transparent.* |
| `fx:confetti` | | 512 | *A celebratory CONFETTI burst: soft paper bits + sparkles in the brand palette, radiating from center, transparent, motion-free (a single frame).* |
| `fx:sparkle` | | 128 | *A small four-point SPARKLE/twinkle, soft gold-white, transparent.* |
| `fx:star-3` | | 256×128 | *Three finish STARS in a row (earned look): plump gold stars, the kind a kid wants all three of, transparent.* |

## 6 · Village (`public/art/village/`)
| key | ★ | size | prompt |
|----|---|---|---|
| `village:bg` | ★ | 1600×600 | *The SOUND GARDEN VILLAGE panorama: a cozy little hamlet of rounded cottages along a winding path through a lush garden, warm dusk light, smoke curls, friendly and storybook. Wide.* |
| `village:cottage` | | 400 | *A friendly COTTAGE (1 base + per-character tints): a small rounded storybook house with a turf roof and a glowing window, themable color. Transparent.* |
| `village:prop-*` | | 300 | *Village props, transparent: a stylized tree, a low fence section, a stone path tile, a warm lamp-post. One per file.* |

---

## Totals & order
≈ **180 PNGs** for the complete system through L4 (10 characters ×6 +Pip/Echo,
≈11 world bgs +frames/props, ~10 game pieces, 10 emblems +logo +stickers, ~8 FX,
village). **Do-first (★) for L1–L3 ≈ 60:** Pip + Echo + Chip/Moss/Patch (6 each),
the 3 world bg/frame/props, core game pieces, the 10 emblems + logo, the
sound-flower, the village panorama. **L4 adds ≈ 12** (the `l4` character ×6 +
`hub:l4:*`). Everything upgrades live with zero code changes.
