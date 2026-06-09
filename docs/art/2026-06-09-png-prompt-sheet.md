# Full PNG Prompt Sheet — replace every placeholder emoji
_2026-06-09. Generated from a full code sweep for placeholder emoji + research on
children's-book illustration and child-app icon design. Paste these into your
SDXL workflow. Sources at the bottom._

## Design principles (bake these into every render)
From the research — these are *why* the prompts are written the way they are:
- **Eyes first.** Children look at faces/eyes first, longest, most. Anything with a
  face gets **big, expressive eyes with a gentle direct gaze** — the child feels "seen."
- **Recognizable · expressive · relatable.** Distinctive silhouette, one clear emotion,
  something endearing. Simple shapes read instantly.
- **Action over static** where it fits — a character *doing* the thing beats a still pose.
- **Icons must be literal, not abstract.** A child reads a *picture of the thing*, never a
  symbol. Friendly, rounded, uncluttered — one idea per icon.
- **Calm, warm palette** (our cream + sage/teal/gold world); bright accents only for play.
- **One cohesive hand** so the whole app feels like one storybook.

## Shared settings (every prompt)
- **White background**, 1024×1024, **one fixed seed per group** (listed) so a set matches.
- **Style tail** (append to every subject below):
  > `, single subject, centered, on a plain solid white background, cute cozy storybook illustration, soft rounded shapes, big friendly proportions, hand-painted gouache texture, soft golden-hour light, clear simple silhouette, children's picture-book art, no text, no letters`
- **Characters/faces** add: `, big expressive friendly eyes with a gentle gaze, soft smile`
- **Negative prompt** (every render):
  > `photo, 3d render, realistic, harsh shadows, neon, dark, scary, text, words, letters, numbers, watermark, logo, signature, busy, cluttered, ugly, blurry, lowres, deformed, extra limbs, duplicate, drop shadow on background`

---

## A. Game icons — the "feature games" (24)
Each level's games. Subjects evoke the game + its world. → `public/images/games/<id>.png`
**Seed 70010.** Keep them as small cohesive emblems (they sit on level cards/buttons).

| File (`games/`) | Game | Subject (prepend, + style tail) |
|---|---|---|
| `tap-it-out.png` | Tap It Out (L1) | a single green sprout in soft soil with three gentle sound-ripples rising from it |
| `l1-switch.png` | Switch It (L1) | two little seed-pods on a leaf with a friendly circular swap arrow between them |
| `l1-same.png` | Same or Different? (L1) | a cute cupped ear (no head) listening, with two small sound-dots beside it |
| `beginning-sounds.png` | Blast Off (L2) | a friendly little rocket lifting off with a soft star trail |
| `ending-sounds.png` | Touchdown (L2) | a friendly little rocket gently landing on a small planet pad |
| `middle-sounds.png` | Vowel Patrol (L2) | a cute round UFO with a soft glow scanning a tiny planet |
| `l2-build.png` | Star Station (L2) | a small space station built of glowing letter-bricks |
| `l3-syll.png` | Chop Shop (L3) | a friendly axe gently splitting a soft log into two even pieces |
| `l3-rules.png` | Rule Breakers (L3) | a cheerful wooden ruler character measuring a little word-block |
| `l4-split.png` | The Great Divide (L4) | a pair of friendly scissors snipping a soft paper word-strip in two |
| `l4-magic.png` | Name Change (L4) | a little magic wand with a sparkle turning a plain stone into a glowing gem |
| `l4-read.png` | Word Giants (L4) | a small friendly dinosaur reading a tiny book |
| `l5-suffix.png` | Happy Endings (L5) | a glowing plus sign joining a word-block to a little tail-block, cheerful |
| `l5-prefix.png` | Front Loaders (L5) | a cute front-loader tractor scooping a glowing block onto the front of a row |
| `l6-silente.png` | Silent Partners (L6) | a gentle character with a finger to its lips ("shh"), a tiny letter-e firefly |
| `l6-drop.png` | Drop It! (L6) | a single soft water droplet falling, a small letter-e dissolving into it |
| `l7-bossyr.png` | Bossy R (L7) | a friendly little crowned letter-R character, kindly bossy, hands on hips |
| `l7-er.png` | Three Ways to /er/ (L7) | three small matching paths merging into one cozy road |
| `l8-teamup.png` | Vowel Team-Up (L8) | two cute jigsaw pieces clicking together with a soft glow |
| `l8-manysounds.png` | One Team, Many Sounds (L8) | a small friendly mixing-slider/fader with a soft sound-wave |
| `l9-borrowed.png` | Word Detective (L9) | a cute detective magnifying glass over a tiny glowing clue |
| `l9-french.png` | French Connection (L9) | a warm golden croissant on a little plate, cozy |
| `l10-roots.png` | Root Lab (L10) | a friendly seedling in a small science flask, glowing roots |
| `l10-greek.png` | Word Architect (L10) | a tiny cozy Greek column/temple being built with glowing blocks |

## B. Level world-badges (Levels 3–10) → `public/images/levels/level-<n>.png`
Small round "world" emblems for the chapter cards (Levels 1–2 already themed). **Seed 70020.**

| File | Level | Subject (+ style tail) |
|---|---|---|
| `level-3.png` | Closed Syllables | a cozy wooden cabin with a closed round door, warm window glow |
| `level-4.png` | Syllable Division & Vowel Teams | a friendly winding path splitting around a little hill with two trees |
| `level-5.png` | Prefixes & Suffixes | a cheerful train engine with one car in front and one behind |
| `level-6.png` | Six Reasons for Silent-E | a calm lantern glowing softly in twilight, one firefly |
| `level-7.png` | Vowel-R Syllables | a friendly crowned letter-R on a soft hill at golden hour |
| `level-8.png` | Advanced Vowel Teams | two cute jigsaw pieces joined, glowing, on a soft cloud |
| `level-9.png` | Foreign Languages | a little hot-air balloon drifting over tiny rooftops, cozy |
| `level-10.png` | Greek & Latin Roots | a small friendly Greek temple on a hill with a glowing seedling root |

## C. Achievement stickers (12) → `public/images/stickers/<id>.png`
Glossy collectible "stickers" — these reward effort, so make them **joyful + face-forward**.
**Seed 70030.** Add the face/eyes line to the animal ones.

| File | Sticker | Subject (+ style tail) |
|---|---|---|
| `first.png` | First Finish | a glowing golden star character cheering, arms up |
| `perfect.png` | Perfect! | a sweet pastel unicorn with a tiny rainbow mane |
| `sharp.png` | Sharp Ears | a soft rainbow arc with two little listening-ear dots |
| `speedy.png` | Speedy | a friendly rocket zooming with a soft motion streak |
| `better.png` | Getting Better | a gentle butterfly mid-flutter, hopeful |
| `five.png` | High Five | a cheerful dolphin leaping, flipper raised for a high-five |
| `ten.png` | Perfect Ten | a bright sunflower character beaming |
| `persist.png` | Never Give Up | a determined little turtle climbing a tiny hill, proud |
| `twoday.png` | Two-Day Streak | two festive balloons tied together, happy |
| `fiveday.png` | Five-Day Club | a cozy content kitten with a small "5" badge collar (no text—a paw print) |
| `wise.png` | Wise Owl | a kind wise owl with big round glasses |
| `collector.png` | Collector | a cute fish in a little bubble surrounded by tiny sparkles |

## D. Remaining word pictures (10) → `public/images/words/<word>.png`
Finishes the word set. **Seed 51000.** Disambiguating hints in parens.

`foot`, `gift`, `ham`, `hat`, `rain`, `taxi`, `thumb` (a thumbs-up hand), `top` (a spinning-top toy), `train`, `van` (a delivery van)
> Prompt each: `a <word>` + style tail (these are objects, no face line).

## E. UI affordance icons → `public/images/ui/<name>.png`
The functional glyphs still using emoji. **Literal + friendly** (research: never abstract).
**Seed 70040.** These are small — keep silhouettes very clean.

| File | Replaces | Subject (+ style tail) |
|---|---|---|
| `hear-again.png` | 🔊 (replay) | a friendly little speaker with two soft sound-waves |
| `storytime.png` | 📖 (Storytime) | a cozy open storybook with a soft glow |
| `learn.png` | ✨ (Learn from…) | a warm sparkle/star-burst, gentle |
| `village.png` | 🏡 (Visit Village) | a cozy little cottage with a warm window |
| `checkpoint.png` | ✨ (Checkpoint CTA) | a friendly ribbon rosette/medal, celebratory |
| `lock.png` | 🔒 (locked level) | a soft rounded padlock, friendly not stern, faint sleepy "z" |
| `tip.png` | 💡 (Pip's tip) | a warm glowing lightbulb with a tiny leaf sprout inside |
| `mute-on.png` | 🔊 toggle (sound on) | a friendly speaker with gentle sound-waves |
| `mute-off.png` | 🔇 toggle (muted) | the same speaker, waves replaced by a soft slash, calm |

> **Note:** characters (Pip, Echo, Moss, Chip + frames) are already painted. Mascot
> dialogue/phrase emoji and tiny inline emphasis emoji can stay — they're expressive
> punctuation, not placeholder art.

## Wiring plan (after you generate)
I process each into the path above (key-out white, autocrop, square) and wire them:
game icons + level badges into the level cards, stickers into achievements/leaderboard,
words auto-fill via `WordPicture`, UI icons swap the emoji the same way we did the stat
cards. No generic emoji left in the kid-facing flows.

## Sources
- *Eye-tracking / faces-first, signature color, action, recognizable-expressive-relatable* —
  IU Early Literacy "Power of Pictures"; Taylor & Francis "I'm just looking at the pictures";
  US Illustrations; Prayan Animation (children's-book illustration).
- *Literal icons, friendly/rounded, calming blue-green, ≥44px* — Aufait UX, Gapsy, Kidtivity
  Lab (designing icons/UI for children).
