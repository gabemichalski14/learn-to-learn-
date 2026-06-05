# Beginning Sounds Match (Barton Level 1)

An audio-first, **letterless** phonics game tailored to the Barton Reading & Spelling
System (Level 1 — Phonemic Awareness). Pictures stand in for words; the learner hears
the word and sorts it by its **beginning sound** — no reading required.

This is game #1 of a planned Barton-aligned learning-games suite. It is built on
separated layers (content / engine / theme / shell) so future lessons, sounds, themes,
and game modes extend it without rewriting the engine.

## Play modes
- **Mode A — Sort into sound baskets** (this build): drag each picture into the basket
  whose beginning sound it shares.
- **Mode B — Connect the pairs** (planned, Plan 2).

## Design principles
- **Barton-faithful:** Level 1 shows no letters; everything is audio-first; sounds can be
  replayed infinitely.
- **No anxiety:** no timers, no fail state. A wrong move gently replays the sound and
  returns the picture.
- **For ages 5 → adult:** swappable age-band themes (Plan 2) keep it from ever looking babyish.
- **Accessible:** large touch targets, high contrast, reduced-motion support, audio for
  everything, works on touch / mouse / keyboard and on a smartboard.

## Develop
- `npm install`
- `npm run dev` — play locally
- `npm test` — run the engine + UI tests
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build

## Status
**v1 foundation (this branch):** engine + content + Mode A, default "Soft & Friendly"
look, **placeholder** TTS audio. The TTS voice mispronounces isolated phonemes on
purpose — it is a temporary dev stand-in that the recorded human-voice library replaces
in Plan 2 (the audio interface is already in place, so no call sites change).

**Next (Plan 2):** Mode B, age-band themes, interest-pack switching, the reward-style
toggle, recorded human audio, and the customizable avatar.

See `docs/superpowers/specs/` and `docs/superpowers/plans/` for the full design and plan.
