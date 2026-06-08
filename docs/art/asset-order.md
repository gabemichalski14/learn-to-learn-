# Asset Order — the SDXL shot list (levels · stories · village)

Generate these in **Draw Things** (see `free-creative-stack-playbook.md` for setup),
save each to your **Desktop** with the exact filename, and tell me which are ready.
I process (key out white → crop → size) and wire each into the app.

I **can't run SDXL myself** — this is the order; the generate-and-download click is
yours. Everything before and after it is mine.

---

## Shared setup (set once, keep identical for a cohesive world)

- **Model:** SDXL base · **Steps:** 30 · **Sampler:** DPM++ 2M Karras · **CFG:** 6.5
- **Seed:** `73501` for a matching SET (e.g. the 5 frames of one character); you may
  change the seed between *unrelated* props for variety.
- **Sizes:** backdrops `1344×768` (landscape) · everything else `1024×1024`.
- **Background:** scenes are full-bleed; **props / houses / planets / characters must
  be on a plain solid white background** so I can cut them out cleanly.

**{STYLE}** — paste at the end of every prompt:
```
cozy storybook flat illustration, soft golden-hour light, gentle rounded shapes,
warm earthy green-and-gold palette, hand-painted gouache texture, simple clean
shapes, friendly, children's picture book art, centered, no text
```
**{NEG}** — into the Negative prompt box:
```
photo, 3d render, realistic, harsh shadows, dark, scary, text, words, letters,
watermark, logo, signature, busy, cluttered, ugly, blurry, lowres, deformed,
extra limbs, duplicate
```

---

## ⭐ START HERE — the first 5 (biggest visual jump)

These five alone transform the Village + both level worlds.

### 1. `village-bg.png` — Village backdrop · `1344×768` · full-bleed
```
a cozy sunny meadow clearing seen from the front, soft rolling green hills, a
little winding path, wildflowers, a big warm friendly sky with a few round clouds,
empty space in the middle for little houses, {STYLE}
```

### 2. `cottage.png` — A little house · `1024×1024` · white background
```
a single small round storybook cottage with a thatched roof and a round door,
on a plain solid white background, centered, full house in frame, {STYLE}
```
*(One cottage is enough — I tint it per friend. Want variety? Generate 2–3 with
slightly different roofs and name them `cottage-1/2/3.png`.)*

### 3. `garden-bg.png` — Sound Garden (Level 1) · `1344×768` · full-bleed
```
a calm magical garden meadow at golden hour, rows of soft soil, tiny sprouts and
glowing flowers, gentle hills, butterflies, a big warm sky, peaceful and inviting,
{STYLE}
```

### 4. `space-bg.png` — Vowel Patrol (Level 2) · `1344×768` · full-bleed
```
a cozy friendly outer-space scene, soft pastel nebula clouds in teal and gold,
gentle twinkling stars, warm and calm not scary, dreamy children's book space,
{STYLE}
```

### 5. `planet.png` — A friendly planet · `1024×1024` · white background
```
a single cute round planet with soft craters and a gentle ring, smiling-friendly,
on a plain solid white background, centered, {STYLE}
```
*(One planet; I recolor it per vowel in code — colour is never the answer cue.)*

---

## Priority 2 — Village props (cozy details, white background, `1024×1024`)

Swap only the **first line**; keep `{STYLE}`. Each on a plain solid white background.

| Filename | First line |
|----------|-----------|
| `lantern.png` | `a small warm garden lantern on a short post, gently glowing,` |
| `signpost.png` | `a small friendly wooden signpost with a blank board,` |
| `flowerbed.png` | `a small cluster of blooming wildflowers in soft greens and golds,` |
| `bench.png` | `a tiny cozy wooden bench,` |
| `well.png` | `a small round stone wishing well with a little roof,` |

These dress the Village foreground and the Garden. 2–3 is plenty to start.

---

## Priority 3 — Garden plantings (white background, `1024×1024`)

The garden grows a "named planting" per recovered sound. Real flower art beats the
emoji. One per common plant type:

| Filename | First line |
|----------|-----------|
| `plant-marigold.png` | `a single cheerful marigold flower with a green stem,` |
| `plant-sprout.png` | `a single tiny green sprout with two leaves,` |
| `plant-sunflower.png` | `a single small sunflower,` |
| `plant-tulip.png` | `a single soft tulip,` |

(If you'd rather not — the emoji plantings already work; this is polish.)

---

## Priority 4 — Characters (the cast, white background, `1024×1024`)

A character needs **5 expression frames**, same seed, changing only the mood words.
**For a consistent look, use image-to-image:** load `public/characters/moss/calm.png`
as the image input at **Strength ≈ 0.5** for any new mossy friend, or start fresh
for a different creature.

**Moss (already in-game — optional re-do for higher fidelity):**
| Filename | First line |
|----------|-----------|
| `moss-calm.png` | `a small shy creature of soft moss and leaves, big gentle eyes, resting calmly,` |
| `moss-cheer.png` | `…the same moss creature, happy and cheering with arms up, glowing,` |
| `moss-wobble.png` | `…the same moss creature, unsure and wobbling, a little worried,` |
| `moss-point.png` | `…the same moss creature, pointing to one side helpfully,` |
| `moss-bloom.png` | `…the same moss creature, blooming with flowers, bright and whole,` |
*(All `on a plain solid white background, full body, single character, {STYLE}`.)*

**Template for the NEXT character** (we design who/why first, then you generate its
5 frames the same way): `<name>-calm/cheer/wobble/point/bloom.png`. Tell me the
creature idea and I'll write its exact 5 prompts.

---

## Optional — story title cards (`1344×768`, full-bleed)

A key illustration for a character's arc, shown at the top of their level story:
```
a small lost moss creature curled up alone in a soft dark meadow at night, one
tiny glowing firefly nearby, hopeful and tender, {STYLE}
```
Name `story-moss.png`. Nice-to-have, not needed to ship.

---

## Hand-off recap

1. Save each to the **Desktop** with the **exact filename** above.
2. Message me the names that are ready (e.g. *"village-bg, cottage, planet done"*).
3. I key/crop/size them, wire them into the Village + level scenes, gate, and show
   you screenshots.

**Minimum to make a real difference:** the ⭐ first 5. Everything else is depth you
can add whenever.
