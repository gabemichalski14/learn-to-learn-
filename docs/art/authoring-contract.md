# Authoring Contract — how You author, how I load

This is the single contract both sides build to, so your Rive/Twine/Yarn exports
drop straight into the game with no rework. Keep names EXACT.

## Rive (character art)

- Artboard: **`Moss`** (the character id, lowercase elsewhere).
- State Machine: **`Moss`**.
- Inputs:
  - **`heal`** — Number **0–100** (0 scattered → 100 whole). Blend the
    transformation timeline by this.
  - **`mood`** — Number: **0 idle · 1 cheer · 2 wobble · 3 point · 4 bloom**
    (or Triggers named `cheer` / `wobble` / `point` / `bloom`).
  - `talking` — Boolean (optional).
- Export the `.riv` to **`src/assets/moss.riv`**; set `cast.art.rive` to that path.

## Twine (the arc + memories) — export as **Twee** (`.twee`)

Passage names are the contract (tags optional, ignored if names match):

- **`Stage0` … `Stage3`** — the four transformation beats (body = the short line
  shown at that heal stage). `Stage0` = scattered intro, `Stage3` = whole.
- **`Fragment_<sound>`** — the memory revealed when that sound is restored, e.g.
  **`Fragment_m`** (Moss's /m/). Body = the fragment line(s); blank lines split
  variants.
- `StoryData` / `StoryTitle` passages are ignored (Twine adds them automatically).

## Yarn Spinner (the reaction lines) — export the **`.yarn`** source

One **node per reaction kind**; one line per variant in the node body:

- Nodes: **`Intro`**, **`Correct`**, **`Wrong`**, **`Clear`**, **`Win`**.
- Memory nodes: **`Fragment_<sound>`** (e.g. `Fragment_m`) — same as Twee fragments;
  use whichever tool you prefer for fragments, the loaders merge both.
- A line may end with hashtags; `// comments`, `<<commands>>`, and `-> options`
  are ignored by the loader (we extract authored lines into our deterministic,
  no-repeat engine — no in-game branching needed).

Example `.yarn`:
```
title: Wrong
---
Oh — not that sound. But you're still here with me. 💚
Close! The little ones are slippery — they were for me too.
===
title: Win
---
You brought them ALL home — mmmmm! 🌼 I wasn't broken… I was just waiting for you.
===
```

## Loaders (mine)
`yarnLoader.ts` → `parseYarn(text)` + `yarnToContent()` → `{ reactions, fragments }`.
`tweeLoader.ts` → `parseTwee(text)` + `tweeToArc()` → `{ stages, fragments }`.
Both pure + tested against sample fixtures; output merges into a `LevelCharacter`.

## Writing principles (ALL character words — Yarn & Twine)

Every authored line follows `docs/art/moss-yarn-guide.md` §0 (dyslexia + our
research): difference-not-deficit · no-shame on misses · growth mindset ·
self-efficacy (credit the learner) · strengths-led · cozy/no-FOMO — AND **low
reading load** (short, plain, decodable, one idea, built to be heard), because the
dyslexic learner is the one reading them. Audio voiceover is the goal so reading is
never required.
