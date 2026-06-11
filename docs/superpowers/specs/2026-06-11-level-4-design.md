# Level 4 — design + research (for approval)

**Status: research + plan to approve before building** (same flow as L1–L3). Builds
on the verified archetype library + the art system (P0). Companion assets (with
prompts) go in `docs/art/PNG-MANIFEST.md`.

## Research → scope
Structured-literacy scope & sequence is consistent across sources: **closed →
open (taught against closed for the long/short contrast) → VCe (silent-e) → vowel
teams → r-controlled → consonant-le**. Syllable **division** keys off the
consonants between vowels: **VCCV** (most common — split between the consonants:
`rab|bit`) and **VCV** (split before the consonant → open/long `ti|ger`, or after →
closed/short `rob|in`). Chunking long words into syllables is *the* unlock for
dyslexic readers. ([6 syllable types](https://pridereadingprogram.com/6-syllable-types-complete-guide/) ·
[teaching order](https://www.thedyslexiaclassroom.com/blog/teaching-the-six-syllable-types) ·
[V/CV vs VC/V division](https://brainspring.com/orton-gillingham-weekly/teaching-syllable-division-for-the-vcv-vcv-patterns/) ·
[syllable division for dyslexia](https://ortongillinghammama.com/unlocking-multisyllabic-words-the-power-of-syllable-division-in-reading-instruction/))

L3 already taught **closed** syllables + blends/digraphs + ck/FLOSS + 2-syllable
**closed** division (Chop Shop, VCCV). So **L4 = the long-vowel jump + reading big
words**:
1. **Open syllables** (CV → long: me, go, hi, flu) — the long/short contrast.
2. **Silent-e / VCe** (a_e i_e o_e u_e: cap → cape) — "the e makes the vowel say its name."
3. **Syllable division extended** to VCV (open vs closed: ti|ger vs rob|in).
4. **Multisyllable reading** — decode longer words part by part.

> **Vowel teams stay at L8** (placeholder already names "Advanced Vowel Teams").
> Pulling them out of L4 keeps it focused on the single-vowel long jump — the
> evidence-based next step. (Curriculum note: update games.ts L4 focus to
> "Open syllables, silent-e, and dividing big words"; vowel teams → L8.)

## Character (L4) — name TBD (you name it, like Patch)
**Strength lever:** big-picture / spatial chunking — the dyslexic gift of seeing
the *whole shape* of a thing. This character meets a scary-long word and, instead
of freezing, sees it as a few friendly parts. Arc: "Big words aren't bigger — they're
just more parts. I take them one chunk at a time." A **gentle giant / friendly
word-dino** guide (the placeholder's 🦕 "Word Giants"). World: **Giant's Valley** —
long words are mountains/giants you climb part by part; each part you read lights a
step up the giant's back.

## Games (5–6) — archetype reuse in **bold**
1. **Name Change** (silent-e/VCe) — see/hear `cap`; add the magic **e**; hear it
   become `cape`. Tap/slide the e on and off, watch the vowel change. *(new "toggle-e" mechanic)* → `vce:<vowel>`
2. **Long or Short?** (open vs closed) — hear a syllable, decide if the vowel is
   long (open: me, hi) or short (closed: met, hit). **Same/Different-style choose.** → `syll:open`
3. **The Great Divide** (syllable division) — split a 2-syllable word at the right
   spot; the game then reads each part. Extends **Chop Shop** to VCV (open vs closed). → `syll:divide`
4. **Word Giants** (multisyllable reading) — a long word appears in chunks; read it
   part by part, then tap its picture. **Read/pick (Warp-Speed-style, untimed).** → `read:multi`
5. **Name Change Dictation** — hear a VCe word, spell it from the alphabet.
   **Dictation archetype.** → `vce`
6. **Giant Steps** (fluency) — read open/VCe/long words fast, tap the picture.
   **Fluency archetype.** → `read:multi`

**New archetype to build: 1** (toggle-e "Name Change"); the rest reuse Same/Different,
Chop, Dictation, Fluency. So L4 is mostly **content + reskins** on proven engines.

## Data taxonomy (extends the existing skill_events pipeline; no schema change)
New skill keys + labels/tags (in `mastery/skills.ts`):
- `vce` / `vce:a|i|o|u` — silent-e long vowels → "silent-e (magic e)".
- `syll:open` — open vs closed (long/short) → "open vs closed syllables".
- `syll:divide` — splitting longer words → "dividing big words" (Chop already uses `syll:*`).
- `read:multi` — reading longer words → "reading longer words" (extends `read:cvc`).

`levelGate.levelSkillStats(4)` = keys starting `vce` / `syll:open` / `syll:divide` /
`read:multi`. Checkpoint gate identical to L1–L3 (PASS_BAR 0.95).

## Phasing (after approval)
- **P-L4a** — content pack `content/packs/level4.ts` (VCe word pairs cap/cape; open
  vs closed syllables; VCV/VCCV division words; multisyllable word pool) + skill
  keys/labels + tests.
- **P-L4b** — the new **Name Change** (toggle-e) game + the 5 reskins, each wired to
  the L4 character arc + art keys; gated + committed per game.
- **P-L4c** — L4 hub world ("Giant's Valley") + levelGate L4 case + checkpoint.
- Art (your track): create the L4 PNGs from the manifest (now prompt-driven).

## Open question for you
**The L4 character's name** (and is the gentle-giant / word-dino direction right,
or do you picture something else for "big words = friendly parts"?). Everything
else can proceed on approval.
