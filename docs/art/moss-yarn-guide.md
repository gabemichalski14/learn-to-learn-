# Write Moss's words in Yarn — step by step

Author Moss's lines once in the free browser editor; I run the export through our
loader and they replace the placeholders. ~20 minutes.

## 0. Write EVERY line with dyslexia + our research in mind (read first)

This applies to all characters' words, not just Moss. Two layers:

**A) What it says (affirming — from our dyslexia/character research):**
- **Difference, not deficit.** Name the gift; never imply the learner is broken.
- **No shame on a miss.** "Not yet," warmth — and model that the hard part was
  hard for the character too ("the little ones are slippery — they were for me too").
- **Growth mindset.** Praise effort/the try; mistakes grow the brain.
- **Self-efficacy.** Give the learner the credit: "you heard it," "you did that."
- **Strengths-led + cozy.** Reflect dyslexic strengths (big-picture, spatial,
  story, creativity); help comes from care, never pressure. No FOMO/streak-guilt.

**B) How it reads (because a dyslexic child READS these):**
- **Short.** One idea, one breath. In-game lines the shortest of all.
- **Plain, common, decodable words.** Avoid rare/long words and jargon.
- **No text walls** — 1–2 short sentences max; hub beats can be a touch longer.
- **Built to be HEARD** — keep it natural for a voiceover (we'll add audio), so a
  child never has to read to follow.
- Let the friendly UI type do the work — no ALL-CAPS blocks or dense italics.

**Quick check before you save a line:**
- [ ] Could a 6-year-old who struggles to read get it in one listen?
- [ ] No "wrong/bad/fail" — no shame?
- [ ] Short — one idea, one breath, plain words?
- [ ] Warm, hopeful, and true to the character?

## 1. Open the editor
Go to **try.yarnspinner.dev** (free, nothing to install).

## 2. Make these nodes (names are EXACT — the loader keys on them)
For each: in the editor create a node, set its **title**, and put **one line per
variant** in the body (2–3 variants each so it never feels repetitive). Plain
text — no need for `<<commands>>` or options; the loader ignores those.

**In-game reactions**
- `Intro` — what Moss says when the game opens (his ask for help).
- `Correct` — a critter sent home / a hum returning.
- `Wrong` — a gentle miss. **No shame, ever** — "not yet," warmth, his own
  struggle ("the little ones are slippery — they were for me too").
- `Clear` — finishing a sector (round).
- `Win` — finishing the patrol (session).

**Memories — one per scattered hum** (revealed the moment that sound is mastered)
- `Fragment_m` — the memory tied to **/m/** (his hum).
- `Fragment_s` — the memory tied to **/s/**.
- `Fragment_b` — the memory tied to **/b/**.

> These three sounds are his "scattered hums" — recovering all of them is what
> makes him whole. (If you want a different set, tell me and I'll match it.)

## 3. Voice guide (so it feels like Moss)
Shy, warm, earnest, a little funny; never babyish; growth-minded; difference-not-
deficit. He shows feeling through his body (curls when unsure, glows when a sound
clicks). Keep lines short (one breath).

## 4. Example you can paste & tweak
```
title: Intro
---
These little critters carry my lost hums, scattered across the dark. Help me send each one home? 🌱
I'm Moss. I came apart out here… but together, maybe we can gather me back.
===
title: Correct
---
Mmm — that one's mine! I can feel it. 🌟
Yes — home it goes. You hear it too, don't you?
===
title: Wrong
---
Oh — not that one. But you're still here with me, and that's what counts. 💚
The little ones are slippery — they were for me too. Listen once more?
===
title: Clear
---
A whole sector, cleared. I'm humming a little louder already…
===
title: Win
---
You brought them home — mmmmm! 🌼 I wasn't broken. I was just waiting for you.
===
title: Fragment_m
---
…I remember now — I used to hum to the moon-moths, low and warm. Mmm. That was me. 🌙
===
title: Fragment_s
---
The sea! I'd hush along with the waves on the shore… sss. It's coming back. 🌊
===
title: Fragment_b
---
And the big drum of my heart — buh, buh — I thumped it whenever I was brave. 🥁
===
```

## 5. Export & hand off
**File ▸ Save** (or Export) the `.yarn` → save it to your **Desktop** as
`moss.yarn`. Tell me it's there; I'll move it into the repo, run it through the
loader, and your lines + memories replace the placeholders everywhere.

(The loader strips comments/commands/options and trailing #tags automatically, so
you can use the editor's features freely.)
