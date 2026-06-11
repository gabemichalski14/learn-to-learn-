# Level 1 (Sound Garden) — PNG manifest to eliminate every emoji

Goal: replace **all emoji** in Level 1 with transparent PNGs. This file lists
exactly what's missing, with a generation prompt for each. Drop finished files at
the paths shown and they appear automatically (each render point already has an
emoji fallback, so nothing breaks while assets are in progress).

## Shared art-direction (put at the top of every prompt)

> Cozy children's-storybook illustration, soft hand-painted gouache look, warm
> rounded shapes, gentle outlines, friendly and inviting, flat single subject
> centered, **transparent background**, no text, no drop shadow baked in, no
> border. Palette leans warm-meadow (honey golds, soft greens, warm cream) to
> match the Sound Garden. Square canvas, generous padding around the subject.

Export: **PNG, transparent, 512×512** (word pictures can be 512×512; UI icons
256×256). Trim to the subject with even padding. Match the look of the existing
`public/images/words/*.png` set so new pictures sit beside them seamlessly.

---

## A. Word pictures — `public/images/words/<word>.png`

Used by Tap It Out (already) and by Rhyme Time + Blend It (once wired). Keyed by
the spoken word. **18 missing** (the rest already exist):

| File | Word | Prompt (after the shared preamble) |
|------|------|-----------|
| `rain.png` | rain | falling rain with a few round droplets and a small soft cloud, cheerful not gloomy |
| `train.png` | train | a friendly little steam train engine, side view, rounded and toy-like |
| `gift.png` | gift | a wrapped present box with a bow, bright ribbon |
| `hat.png` | hat | a simple sun hat or party hat, single object |
| `bat.png` | bat | a cute friendly flying bat (animal), round and harmless, smiling |
| `log.png` | log | a short woodland log with rings on the cut end, a little moss |
| `bun.png` | bun | a soft round bread bun, golden top |
| `car.png` | car | a small rounded toy car, side view |
| `star.png` | star | a single plump five-point star, warm yellow, soft glow (NOT the UI star — a picture-word star) |
| `jar.png` | jar | a clear glass jar with a lid, maybe a little honey |
| `tree.png` | tree | a single round leafy tree with a brown trunk |
| `cake.png` | cake | a slice or small round layer cake with a cherry |
| `snake.png` | snake | a friendly coiled cartoon snake, smiling, soft S-curve |
| `ring.png` | ring | a simple ring with a round gem |
| `king.png` | king | a friendly king's golden crown, OR a tiny round king character — pick the crown (clearer at small size) |
| `can.png` | can | a tin can with a simple paper label |
| `pan.png` | pan | a frying pan, top-down or 3/4 view, single handle |
| `van.png` | van | a small rounded delivery van, side view |

> Note: `king` reads clearest as a crown at thumbnail size; if you prefer the
> character, keep it big-headed and centered.

---

## B. Game + level icons — `public/images/ui/<name>.png`

Replaces the emoji in each game's HUD badge **and** its card on the Garden hub
(one icon per game, used in both places). 256×256, transparent.

| File | Replaces | Prompt |
|------|----------|--------|
| `ico-tap-it-out.png` | 🌱 | a single green sprout with a tiny sound/beat pulse, or a sprout + one musical dot |
| `ico-same-different.png` | 👂 | a friendly ear with two small soundwave arcs |
| `ico-switch-it.png` | 🔁 | two rounded swap arrows in a circle, warm colors |
| `ico-rhyme-time.png` | 🎵 | a single cheerful musical note with a small sparkle |
| `ico-blend-it.png` | 🔡 | small beads/dots merging into one — three dots flowing into a circle |
| `ico-sound-garden.png` | 🌱 | the Sound Garden mark: a sprout in a little patch of meadow (level badge) |

---

## C. UI action icons — `public/images/ui/<name>.png`

The buttons inside the games. 256×256, transparent, simple and high-contrast so
they read on colored buttons.

| File | Replaces | Prompt |
|------|----------|--------|
| `ico-hear.png` | 🔊 "Hear it" | a speaker with two soundwave arcs, warm |
| `ico-mute-on.png` | 🔊 (sound on) | speaker with soundwaves, "on" state |
| `ico-mute-off.png` | 🔇 (muted) | speaker with a small slash, "off" state |
| `ico-tap.png` | 👆 | a friendly pointing-finger / tap gesture on a soft circle |
| `ico-plant.png` | 🌷 "Plant it!" | a single tulip/flower being planted, hopeful |
| `ico-next.png` | 🌿 "Next" | a leaf or small forward sprig pointing right |
| `ico-undo.png` | ↩ "Undo" | a soft back-curving arrow |
| `ico-show.png` | 👀 "Show me" | two friendly eyes, open |
| `ico-hide.png` | 🙈 "Hide" | the same eyes, gently closed / peeking |
| `ico-checkpoint.png` | ✨ | a sparkle/badge for the checkpoint CTA (or reuse `/art/ui/checkpoint.png`) |
| `ico-village.png` | 🏡 | a small cozy cottage (Village link) |
| `ico-replay.png` | 🔁 "Play again" | circular replay arrow |
| `ico-same.png` | 🟰 "Same" | an equals sign in a soft rounded badge |
| `ico-different.png` | ✳️ "Different" | a small burst/asterisk in a soft rounded badge |

---

## D. Reward + decoration sprites — `public/images/ui/<name>.png`

| File | Replaces | Prompt |
|------|----------|--------|
| `ico-flower-pink.png` | 🌸 (bloom / combo) | a single soft pink blossom, top-down |
| `ico-flower-yellow.png` | 🌼 | a single buttercup-yellow daisy |
| `ico-flower-tulip.png` | 🌷 | a single warm tulip |
| `ico-leaf.png` | 🌿 | a single soft green leaf sprig |
| `ico-star-on.png` | ★ filled | a filled gold reward star with soft glow |
| `ico-star-off.png` | ★ empty | the same star, soft grey/outline (empty state) |

> The "beat" tokens in Tap It Out bloom from numbers → 🌸. With `ico-flower-pink`
> in place, the bloom uses the PNG.

---

## E. Decision needed — dialogue emoji

Chip's authored lines carry small accent emoji **inside sentences** (e.g. "You
did that. 🎵", "I'm right here. 💚", "🌟"). These are tone/punctuation, not UI
chrome, and can't become inline PNGs without breaking the text flow. Two clean
options — tell me which:

1. **Keep them** as tiny text accents (recommended — they add warmth and every
   reader's font renders them; they're not "UI emoji").
2. **Strip them** for a strictly emoji-free build (I'll remove the trailing
   emoji from the L1 dialogue pools).

---

## Wiring (what I do once files land — or now, with fallback)

1. Point Rhyme Time + Blend It picture options at `WordPicture` (today they
   render raw emoji) → existing word PNGs show immediately, new ones auto-appear.
2. Add a small `<Icon name= emoji=>` component (mirrors `WordPicture`: renders
   `/images/ui/<name>.png`, falls back to the emoji) and route every B/C/D emoji
   through it, so the app is emoji-free the moment each PNG lands and never
   breaks in the meantime.
