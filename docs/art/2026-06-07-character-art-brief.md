# Character Art Brief + Integration Contract — Moss (and the cast)

- **Date:** 2026-06-07
- **Why:** the games must be *intrinsic-fantasy* (Malone) and *ludonarrative-harmonious* —
  the character is the STAR and **visibly transforms** as the learner helps. That
  requires real, expressive, *stateful* character art (not an emoji). This brief is
  the exact spec to produce that art and the contract for how it plugs in, so the
  build is a drop-in once the asset exists.
- **Decision:** get the art first, then build the rebuilt Level 2 game around it.

## 1. Recommended path (free): Rive

[Rive](https://rive.app) — free editor tier + free, open-source web/React runtime
(`@rive-app/react-canvas`). One vector character with a **state machine** lets the
same file idle, emote, and *transform from scattered → whole*, driven by our data.
Alternatives if not Rive: a sprite sheet (PNG frames per stage/expression) or per-
state Lottie JSONs — I can wire any of the three.

**Licensing (commercial product — tutoring centers):** the asset must be
commercial-safe — CC0, owned, commissioned-with-rights, or AI-generated under a
license that permits commercial use. Verify before shipping.

## 2. Style guide

- **Cohesive characterful-flat** (our Road B): clean shapes, soft gradients, warm,
  kindchenschema (big head/eyes), **ages 5→adult — endearing, never babyish**.
- Consistent with Pip & Echo's world (teal/green/gold garden palette).
- Reads clearly at **48px (hub chip)** through **~160px (in-game hero)**.

## 3. Moss — character

A tiny garden-sprout spirit who drifted into the cold dark of space and *came
apart* — his hums (voice, color, self) scattered. **Want:** his hum back, to go
home. **Need:** to learn he wasn't broken — just scattered — and a friend + the
right way make him whole. **Flaw:** sure he's "broken," hides, blames himself.
**Strength (his gift):** he always *knows where a sound belongs*, even when he
can't catch it himself (spatial — the dyslexic strength, shown as a pointing/
leaning "I know where this goes" pose).

Silhouette: a small rounded sprout-body, a single curling leaf, one or two big
soft eyes. Must be recognizable as the same Moss across all transformation stages.

## 4. Transformation stages (the progress bar IS Moss)

Map to `heal` 0→1 (fraction of his sounds restored). Suggest **4 stages**:

- **S0 Scattered (heal 0):** grey, translucent, curled tight, dim, barely there.
- **S1 Flickering (~0.33):** a little color returns, one eye opens, faint glow.
- **S2 Gathering (~0.66):** mostly colored, sitting up, leaf half-unfurled, humming.
- **S3 Whole (1.0):** full color, uncurled, upright, radiant, leaf open, softly
  glowing/humming — the "movie payoff" pose he leaves for the garden in.

Blending between stages should be smooth (Rive: drive a timeline by `heal`).

## 5. Expressions / states (in addition to stage)

- **idle** — gentle breath/bob.
- **listening** — leans toward a sound.
- **cheer** — a hum comes home (a correct match): perk up, sparkle, brighter for ~0.6s.
- **wobble** — a gentle miss (NO shame): soft wilt + recover.
- **point/guide** — his gift: indicates where a caught sound belongs.
- **bloom** — completion celebrate.

## 6. Integration contract (how it plugs in)

Preferred Rive artboard **"Moss"**, State Machine **"Moss"**, with inputs:

| Input | Type | Meaning |
|---|---|---|
| `heal` | Number 0–100 | transformation stage (S0→S3); we feed `journey*100` |
| `mood` | Number (0 idle,1 cheer,2 wobble,3 point,4 bloom) **or** Triggers `cheer`/`wobble`/`point`/`bloom` | momentary reactions |
| `talking` | Boolean (optional) | mouth/hum movement during audio |

- Vector; crisp 48–160px. Provide the `.riv` (and source).
- Sprite alt: PNG frames named `moss_s{0..3}_{idle|cheer|wobble|point|bloom}.png`.
- Lottie alt: one JSON per state, named the same.

A single `CharacterArt` component will consume `(art, heal, mood)` and render in
three places: the **in-game hero** (the star), the **level hub** card, and the
**Garden resident**. I add `@rive-app/react-canvas` and build that component +
the rebuilt intrinsic game the moment the asset lands.

## 7. The rebuilt game this unlocks ("Bring Moss Home")

Moss is central and scattered; his lost hums (the items) are sorted to their
sounds; **each correct match flies into Moss and restores a visible piece**
(`heal` ticks up a stage), returns a fragment of his story, and warms the dark; a
miss drifts back with a kind line (no-fail). You + Moss are a team: you catch the
slippery little sound, he (his gift) shows where it belongs. All home → S3 Whole →
he sings and leaves for your garden (the /m/ marigold). The Barton skill (match
word → its sound) is unchanged and central — but now it *is* rebuilding Moss
(intrinsic fantasy / ludonarrative harmony).

## 8. Cast template

Same contract for **Echo** and every level character (see spec §15 cast map). Each
needs: stages S0→S3 of their own wound→whole transformation + the six expressions.
Produce Moss first as the reference; the rest follow the template.
