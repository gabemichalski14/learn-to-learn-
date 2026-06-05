# Beginning Sounds Match — Design Spec

**Date:** 2026-06-04
**Status:** Approved (brainstorm complete, ready for implementation planning)
**Working repo name:** `barton-games` (public brand name is a later decision; see Open Questions re: trademark)

---

## 1. Summary

A modern, web-based phonics learning game that recreates and dramatically improves on a Wordwall "Beginning Sounds Match" activity, **tailored to the Barton Reading & Spelling System**. This is **game #1** of an intended growing suite. The near-term milestone is to **master Barton Level 1**; the long-term vision is a full learning-games platform that tutoring centers can use across all 10 Barton levels.

The guiding bet: build the first game on cleanly separated layers (content / engine / theme / shell) so that adding lessons, retargeting to other sounds, restyling for any student, and eventually adding a center-management backend all happen **without rewriting the engine**.

## 2. Background: Barton fidelity (the prime directive)

The Barton Reading & Spelling System is an Orton-Gillingham–influenced, systematic, multisensory program of 10 sequential levels (level ≠ grade; students span **ages 5 through adult**, including teens and adults with dyslexia). Tile color convention: **consonants = blue, vowels = yellow, units (sh, ck, th…) = red**.

**Level 1 = Phonemic Awareness, and uses NO letters** — it is purely auditory (blank tiles, sound manipulation). Lessons progress CV/VC → CVC → VCC → CCV → Rhyming & Real Words. The source activity, "Level 1 – Lesson 5 – Beginning Sounds Match," is therefore an **audio-first, letterless** task: match/sort words *by their beginning sound*, where pictures stand in for words (never printed labels — the learner must rely on sound, not reading).

**Faithfulness rules that constrain this design:**
- Level 1 shows **no letters**. Pictures + audio only.
- The learner can **replay any sound infinitely** (multisensory, auditory-first).
- Sounds are **pure phonemes** (a clipped /b/, never "buh") — see Audio.
- The level **sequence** is sacred; the engine is built to follow Barton's scope, not invent its own order.

**Copyright note:** Barton's *method* is not copyrightable, but its specific word lists, stories, and materials are. We **author our own decodable word lists** aligned to Barton's sound sequence and do not reproduce Barton's proprietary content. "Barton" is trademarked — see Open Questions on public branding.

## 3. Goals & non-goals

**Goals (v1):**
1. A genuinely engaging, polished Beginning Sounds Match game with **two play modes**.
2. **Barton-faithful** Level 1 behavior (letterless, audio-first, no-anxiety).
3. **Personalizable** for students of any age/sex/race/interest via themes, interest packs, and reward style.
4. **Accessible** (dyslexia-first) and usable on tablet, laptop, and smartboard.
5. A **data-driven foundation** that visibly generalizes to the rest of Level 1.

**Non-goals (v1, explicitly deferred):**
- Customizable avatar/guide character (phase 2).
- "Game World" rich-animated theme (phase 2 — becomes a swappable theme).
- Ending/Middle Sounds, Rhyming games (the engine will be *ready* for them, but they are not built in v1).
- Levels 2–10 content.
- Accounts, multi-student progress tracking, tutoring-center management backend.

## 4. Pillars

- **Barton-faithful** — letterless Level 1, audio-first, correct sequence.
- **For ages 5 → adult** — never babyish; age-band themes solve the "humiliates a teen" problem.
- **No anxiety** — no timers, no streak-loss, no buzzers; you can't fail, only keep trying.
- **Dyslexia-accessible** — high contrast, big targets, minimal text, audio for everything.
- **Built to grow** — separated layers; retarget/restyle/extend without engine changes.

## 5. Architecture

Four separated layers (separation is the core design value):

1. **Content data** — declarative data only, no logic. Word sets where each word carries its sound breakdown (e.g. its beginning sound) and references to its audio + illustration. Phoneme audio library. Interest packs are content files.
2. **Game engine** — pure functions. Given `{ targetSound(s), wordSet, mode, roundSize }`, it generates a round, validates answers, and signals audio playback. Knows nothing about color, theme, or layout. This is the unit-tested heart.
3. **Theme & personalization** — declarative config that restyles the shell: age-band theme (color/shape/type/motion/reward feel), selected interest pack (which word set), reward style. No game logic.
4. **App shell** — React app: screens, drag-and-drop interactions, audio playback, wiring the above together.

**Why it matters / how it grows:**
- Change **target sound** (beginning → ending → middle): engine input change only → Ending/Middle Sounds games.
- Add a **content file**: new lesson/pack, no code.
- Add a **theme**: new look (e.g. phase-2 "Game World"), no engine change.
- Add a **backend** later: the shell gains an accounts/progress integration; engine and content untouched.

## 6. The game experience

**Shared:**
- **Letterless, audio-first.** Pictures represent words; no printed labels. A speaker control speaks the word/sound on demand and on interaction; **infinite replays**.
- **No-anxiety feedback.** Correct = satisfying snap + chime + theme-appropriate reward. Incorrect = gentle "not quite — listen again," sound replays, the piece returns to start. No penalty, no timer, no fail state.
- **Round shape.** Short sets (default ~5–6 items; tutor-configurable). Clear, calm progress indicator. A gentle celebration on completion.

**Mode A — Sort into sound baskets.** 2–3 baskets, each anchored by a target sound (audible, optionally a representative anchor picture). The learner drags each picture into the basket whose **beginning sound** it shares. (Barton "same first sound" categorization.)

**Mode B — Connect the pairs.** Two groups of pictures; the learner links the two that **start with the same sound** (e.g. bear ↔ ball). Closest to the original Wordwall matching.

Student (or tutor) chooses the mode. Both run on the same engine + content.

## 7. Accessibility (dyslexia-first — non-negotiable)

Large touch targets; high contrast; generous spacing; clean dyslexia-friendly typeface; minimal on-screen text (the game is audio-driven); full **touch + mouse + keyboard** support; **reduced-motion** option that still satisfies the no-anxiety reward; every instruction available as audio; one-handed tablet use and smartboard use both work.

## 8. Personalization (v1)

- **Age-band themes:** Playful / Cool / Grown-up. Restyle color, shape, typography, motion, and reward feel. Same game, never babyish. Default house style = **"Soft & Friendly."**
- **Interest packs:** swappable word/picture sets (animals, sports, food, vehicles…). **Each pack is validated** so every word genuinely begins with its intended target sound. v1 ships with one pack chosen for cleanest beginning-sound coverage (implementer's choice).
- **Reward style:** playful (stars/confetti) ↔ calm (quiet progress) toggle.
- A tutor selects target sound(s), interest pack, theme, and round size before a session.

## 9. Content & audio plan

- **Word lists:** authored in-house, decodable, aligned to Barton's Level 1 sound sequence. Not copied from Barton materials.
- **Audio:** recorded **human voice** (gold standard). Production order: (1) the ~40 English **phonemes** — recorded once, reusable across the *entire* program; (2) v1 word audio. Pure clipped phonemes (no schwa). During development, audio is stubbed with placeholders and real recordings are swapped in before release. *(Dependency on the user: a recording session against a provided record-list.)*
- **Illustrations:** one cohesive, **inclusive** set in the "Soft & Friendly" style. Begin from a consistent source; upgrade hero items over time.

## 10. Technology

- **React + TypeScript + Vite.** Component-based.
- **Drag-and-drop** that works on **touch and mouse** (pointer events).
- **Web Audio** for crisp, low-latency phoneme/word playback.
- Ships as a **static site** (instant shareable link, no server in v1).
- Structured so a later **tutoring-center backend** (accounts, progress, assignment) integrates at the shell layer without rewriting engine or content.

## 11. Testing & "definition of done"

- **Engine unit tests:** round generation, answer-checking, correct sound-targeting, no-duplicate/solvability guarantees, pack validation (every word matches its claimed beginning sound).
- **Component tests** for the two interaction modes.
- **Manual QA** on tablet + smartboard + desktop; accessibility pass (contrast, keyboard, reduced motion, audio-only operability).

**v1 is done when:** both modes are playable; "Soft & Friendly" look is in place; the 3 age themes + ≥1 interest pack + reward toggle work; audio (real or placeholder) is wired with infinite replay; the no-anxiety feedback loop is complete; it's accessible; it's deployed to a shareable link; and the engine demonstrably retargets to ending/middle sounds (even if those games aren't surfaced yet).

## 12. Open questions / dependencies

- **Recording session** for phonemes + v1 words (user-provided voice). I will deliver an exact record-list.
- **Specific picture/word sets:** if the user has particular sets they use in practice, screenshots would improve fidelity; otherwise authored in-house.
- **Public branding / trademark:** "Barton" is trademarked; a public-facing product name is a separate later decision. Internal/working name is `barton-games`.

## 13. Roadmap after v1 (for context, not built now)

Avatar/guide → "Game World" theme → Ending/Middle Sounds & Rhyming (same engine) → rest of Level 1 → Levels 2–10 (introduces letters + the blue/yellow/red tile system from Level 2 on) → tutoring-center accounts, progress, and assignment.
