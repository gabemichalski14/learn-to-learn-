# The Free Creative-Stack Playbook
### Exactly what to type and click on each free tool — for art, animation, and story

This is the single hand-to-do guide. Everything here is **free**, **commercial-safe**,
and matches the contracts already wired in the app, so whatever you make drops
straight in. Work top-to-bottom or jump to the tool you need.

> **Four golden rules (read once)**
> 1. **Own everything.** Generate art *locally* (you own the output) or use CC0
>    packs. Don't paste in random web-AI images unless the site clearly grants
>    commercial rights.
> 2. **Dialogue is authored, never live AI.** We never call an AI at runtime.
>    You write the lines (Yarn); I load them into no-repeat pools.
> 3. **Dyslexia-first writing**, every line: short (one breath), plain decodable
>    words, no shame, growth mindset ("not yet"), built to be *heard*. (Full
>    rules in `docs/art/authoring-contract.md` and `moss-yarn-guide.md §0`.)
> 4. **Hand-off = files + a ping.** Save to your Desktop with the exact names
>    below and tell me; I run the processing and wire them in. I can't make
>    accounts, log in, or run these sites for you — but I prep everything and
>    integrate whatever you export.

Tools, in the order they pay off:
- **A. Pictures** — Draw Things (local SDXL on your Mac). *Biggest win.*
- **B. Animation** — Rive (you have the account).
- **C. Story mapping** — Twine / Twinery (you have the account).
- **D. Dialogue** — Yarn Spinner.

---

## A. PICTURES — Draw Things (local SDXL, free, Mac-native)

**Why this one:** it runs on your Mac with no terminal and no account, downloads
real SDXL models, and **everything it makes is yours** (SDXL's license permits
commercial use — if you later add a community model/LoRA, read its license card
and prefer ones marked "commercial OK"). This is the best free path to *cohesive*
art — a whole garden/village that looks like one world.

### A1. Install (5 min)
1. Open the **Mac App Store** → search **"Draw Things"** → **Get** (free). It's by
   Liu Liu; the icon is a paintbrush. (Apple-Silicon Mac recommended.)
2. Open it. On first launch it offers to download a model. Pick an **SDXL** base
   model (e.g. *"SDXL Base v1.0"*). Let it download (~6 GB, one time).

### A2. Lock the style (do this ONCE — it's what makes everything match)
In the controls panel set, and then **don't change these between assets**:
- **Model:** the SDXL model you downloaded.
- **Size:** `1024 × 1024` for characters/props; `1344 × 768` (landscape) for backdrops.
- **Steps:** `30`  ·  **Sampler:** `DPM++ 2M Karras`  ·  **CFG / Text guidance:** `6.5`
- **Seed:** type a **fixed number** and keep it, e.g. `73501`. (Same seed + same
  style words = a consistent look across every image.)

**The Style Anchor** — paste this at the END of every prompt, unchanged:

```
cozy storybook flat illustration, soft golden-hour light, gentle rounded shapes,
warm earthy green-and-gold palette, hand-painted gouache texture, simple clean
shapes, friendly, children's picture book art, centered, no text
```

**The Negative prompt** — paste into the "Negative prompt" box, unchanged:

```
photo, 3d render, realistic, harsh shadows, dark, scary, text, words, letters,
watermark, logo, signature, busy, cluttered, ugly, blurry, lowres, deformed,
extra limbs, duplicate
```

### A3. The prompts — copy/paste, swap only the first line

**Village / garden backdrop** (size `1344×768`):
```
a cozy sunny meadow clearing with a few tiny round cottages, thatched roofs,
soft rolling hills, wildflowers, a little winding path, big friendly sky,
{STYLE ANCHOR}
```

**A single house / prop** (size `1024×1024`, **plain white background** so I can cut it out):
```
a single small round cottage with a thatched roof, on a plain solid white
background, centered, full object in frame, {STYLE ANCHOR}
```
(Swap the first line for any prop: `a small garden lantern on a post, …`,
`a single blooming marigold flower, …`, `a wooden signpost, …`.)

**A new character, matching Moss's look** — two ways:
- *Text only:* 
  ```
  a small shy friendly creature made of soft moss and leaves, big gentle eyes,
  rounded body, full body, standing, on a plain solid white background, single
  character, {STYLE ANCHOR}
  ```
- *Even more consistent (recommended): image-to-image off Moss.* In Draw Things,
  tap the **image input** (the little picture icon) → choose
  `public/characters/moss/calm.png` → set **Strength ≈ 0.5** → write the new
  character's first line + the style anchor → Generate. ~0.5 keeps our art style
  while changing the creature.

For **expression frames** of a character (so it can emote in-game), generate the
same character 5 times changing only the mood word, **same seed**:
`…calm, resting` · `…happy, cheering, arms up` · `…unsure, wobbling` ·
`…pointing to one side` · `…blooming with flowers, glowing`.
Name them `calm / cheer / wobble / point / bloom`.

### A4. Export + hand to me
1. For each image: the **export / share** button → **Save PNG** to your **Desktop**.
2. Name them clearly: backdrop → `village-bg.png`; a character → `<name>-calm.png`,
   `<name>-cheer.png`, … ; props → `lantern.png`, etc.
3. **Tell me they're on the Desktop.** I then run our image pipeline (key out the
   white background → autocrop → 512px square for characters/props; backdrops
   stay full-size) and wire them into `public/`. *(For reference, the keying step
   is Pillow: load → make near-white pixels transparent → autocrop → pad to square.
   I run this; you don't have to.)*

> Power alternative (only if you want it): **ComfyUI** runs SDXL on Mac too and
> gives node-graph control, but it needs the terminal. Draw Things is the easier
> win; ask me and I'll write the ComfyUI steps if you outgrow it.

---

## B. ANIMATION — Rive (rive.app — you have the account)

**Goal of the first pass:** one `.riv` for Moss that (1) transforms with a number
`heal` (grey/small/curled → whole/colorful/glowing) and (2) reacts with trigger
moods. The app already has the drop-in: set `art.rive` on the character and
`CharacterArt` renders it. **The contract is exact — match these names or it won't bind.**

**The contract (must match exactly):**
- **Artboard name:** `Moss`
- **State Machine name:** `Moss`
- **Inputs:**
  - `heal` — **Number**, default `0` (we feed it `0–100`).
  - `cheer`, `wobble`, `point`, `bloom` — **Triggers** (momentary reactions).

**Click path (condensed — full version in `docs/art/moss-rive-build-guide.md`):**
1. rive.app → **New File**. Draw an **Artboard**; in the Inspector rename it `Moss`.
2. Build Moss from simple shapes (keep body, eyes, leaf as **separate shapes** so
   they can animate). Use the art from Tool A as a reference image if you like.
3. **Animate** → make timelines: a **Heal** timeline (frame 0 = grey/curled/faint,
   end = full color/upright/glow), plus short ones for `cheer`/`wobble`/`point`/`bloom`.
4. **+ → State Machine**, name it `Moss`. In **Inputs** add: Number `heal` (default 0),
   and Triggers `cheer` `wobble` `point` `bloom` (spell them lowercase, exactly).
5. Wire a **blend state** driven by `heal` for the transform; wire each trigger to
   its reaction timeline (returning to the heal blend after).
6. **Export → Runtime (.riv)** → save `moss.riv` to your Desktop. Tell me; I drop
   it in `public/characters/moss/` and set `art.rive` on Moss (heal/mood already flow).

> You don't need this to ship — the PNG frames from Tool A already heal and emote
> via CSS. Rive is the upgrade to fluid vector motion when you want it.

---

## C. STORY MAPPING — Twine / Twinery (twinery.org — you have the account)

Twine is for **seeing a character's arc** before you write the final lines. It's a
visual map of passages (boxes) connected by arrows — perfect for laying out a
character's want → wound → turn → home journey, and any branches.

**Click path:**
1. twinery.org → **Use it online** (or the app) → **+ Story** → name it e.g. `Moss arc`.
2. Each **passage** = one story beat. Make these passages (double-click to edit text):
   `Arrived` (we meet them, lost) → `Healing` (a hum comes home) →
   `Memory: m` / `Memory: t` / `Memory: a` (the recovered memories) →
   `Healed` (whole) → `Resident` (lives in the village) → `Lesson` (what they teach).
3. Link passages by typing `[[Healed]]` style links so the arrows show the flow.
4. Write the beats here in plain, dyslexia-first language. This is your **outline** —
   you'll copy the final lines into Yarn (Tool D).
5. Export: **Story menu → Publish to File** (`.html`) or just keep it open as your map.

> Twine is the *planning* tool; **Yarn is what the game reads.** Map in Twine,
> then write the polished lines in Yarn.

---

## D. DIALOGUE — Yarn Spinner (try.yarnspinner.dev)

This is where the **real game lines** are written. One **node per moment**; one
**line per variant** (the loader turns them into no-repeat pools). No accounts needed.

**Click path:**
1. Go to **try.yarnspinner.dev** (the in-browser editor).
2. Write nodes in this shape (title, then `---`, then lines, then `===`):

```yarn
title: Intro
---
I'm Moss. I came apart out here in the dark. Will you help me gather my hums? 🌱
Hello! Each little critter holds a sound of mine. Send it home, and I come back — bit by bit.
===

title: Teach
---
Watch how I do it. 🌱 Say the word slow… feel the sound… then send it to the glowing planet. Now you try!
===

title: Correct
---
Mmm — that one's mine! You heard it. 🌟
===

title: Wrong
---
Not that one — and that's okay. The little sounds are slippery. They were for me too.
===

title: Clear
---
A whole sector, clear. I'm humming louder already…
===

title: Win
---
You brought them home — mmmmm! 🌼 I wasn't broken. I was just waiting for you.
===

title: Fragment_m
---
…I remember — I'd hum to the moon-moths, low and warm. Mmm. That was me. 🌙
===
```

**The node names the loader understands (exact):** `Intro`, `Teach`, `Correct`,
`Wrong`, `Clear`, `Win`, and one `Fragment_<sound>` per recovered hum
(`Fragment_m`, `Fragment_t`, `Fragment_a` for Moss — the letter must be the sound).

**Writing rules (dyslexia-first — this is non-negotiable for our learners):**
- One short line, one breath. No walls of text.
- Plain, decodable words. No ALL-CAPS, no dense italics.
- Never shame a miss — "not yet," warmth, the character's own struggle.
- Growth mindset + credit the child ("*you* heard it").
- Write to be *heard* (it's narrated) — it should sound good read aloud.
- 2–3 variants per node so it never repeats.

3. **File → Save** (or copy the text) → save as `moss.yarn` (or `<name>.yarn`) to
   your Desktop. Tell me; I run it through the loader and into the character's pools.

---

## Hand-off checklist (what to save, where, and tell me)

| Tool | You make | Save as | I do |
|------|----------|---------|------|
| Draw Things | village backdrop | `village-bg.png` (Desktop) | size + wire into the Village/Garden scene |
| Draw Things | character frames | `<name>-calm/cheer/wobble/point/bloom.png` | key out white → 512 square → `public/characters/<name>/` |
| Draw Things | props | `lantern.png`, `marigold.png`, … | key out white → place in scene |
| Rive | animated character | `<name>.riv` | drop in `public/characters/<name>/`, set `art.rive` |
| Twine | arc map | (keep open / `.html`) | nothing — it's your outline |
| Yarn Spinner | dialogue | `<name>.yarn` | load into the character's authored pools |

**Then just message me:** *"village-bg.png and moss.yarn are on my Desktop."* I take
it from there — process, wire, gate, and verify in the browser.

> Everything above is free and commercial-safe. The only things I cannot do are
> create accounts, sign in, or run these sites on your behalf — that one click is
> yours. Everything before and after that click is mine.
