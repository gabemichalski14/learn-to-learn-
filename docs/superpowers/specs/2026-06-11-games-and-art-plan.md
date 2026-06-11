# Plan — L1–L3 to 5–6 games + the art system (for approval)

Two pillars, research-grounded. **This is a plan to approve, not yet built.** On
approval: build P0 (art system + new archetypes) → P1 (wire the new games) → done.

Companion: the complete asset list is in **`docs/art/PNG-MANIFEST.md`**.

---

## Pillar 1 — 5–6 games per level (L1–L3)

### The game-archetype library (reusable, research-backed mechanics)
Each level draws the archetypes its skills need (OG/structured-literacy activity
types). Build once, reskin per level.

| Archetype | Trains | Status |
|---|---|---|
| Tap-It-Out | segment a word into sounds (PA) | ✅ built |
| Same/Different | sound discrimination (PA) | ✅ built |
| Switch-It | manipulate a sound (PA) | ✅ built |
| Sort (minimal-pair) | sort by sound/pattern | ✅ built |
| Build/Blend | encode a heard word from tiles | ✅ built |
| Rule-Apply | spelling generalizations | ✅ built |
| Chop | segment / syllable-divide | ✅ built |
| **Rhyme** | rhyme recognition/production (PA) | ➕ new |
| **Oral-Blend** | hear sounds → blend to a word (PA) | ➕ new |
| **Dictation** | spell a heard word (free encode, no tiles) | ➕ new |
| **Fluency** | timed accuracy = automaticity | ➕ new |

(Morph-Build is an L5+ archetype — not needed for L1–L3.)

### Per-level lineup (existing ✅ + new ➕)
**L1 · Sound Garden · Chip** (PA — oral): 1 Tap It Out ✅ · 2 Same or Different ✅
· 3 Switch It ✅ · 4 **Rhyme Time** ➕ · 5 **Blend It** (oral) ➕ · *(6 optional:
First-Sound isolation)*. → **5–6**, each a distinct PA skill (no padding).

**L2 · Space Patrol · Moss** (CVC): 1 Blast Off (first) ✅ · 2 Touchdown (last) ✅
· 3 Vowel Patrol (medial) ✅ · 4 Star Station (build) ✅ · 5 **Word Beam**
(Dictation — spell the CVC you hear) ➕ · 6 **Warp Speed** (Fluency — timed CVC) ➕.
→ **6**.

**L3 · Patch's Workshop · Patch** (blends/digraphs/rules/syllables): 1 Blend
Buddies ✅ · 2 Sort It ✅ · 3 Rule Breakers ✅ · 4 Chop Shop ✅ · 5 **Patch's
Dictation** (spell a blend/digraph word) ➕ · 6 **Tool Time** (Fluency — timed
blend/digraph/rule) ➕. → **6**.

**New games to build: 6** (Rhyme, Oral-Blend, Dictation×2 reskins, Fluency×2
reskins) — i.e. **4 new archetypes**, reused. Each: rides the existing
skill_events pipeline (new skillKeys where needed), wired to the level's character
arc (a fragment per game), gated + committed per game.

### New-archetype mechanics (evidence-based)
- **Rhyme** — hear a word + 3 picture options; tap the one that rhymes. (PA: onset-rime.)
- **Oral-Blend** — hear sounds played one at a time (/c/·/a/·/t/) → tap the picture of the blended word. (PA: blending — the partner skill to Tap-It-Out's segmenting.)
- **Dictation** — hear a word, build it letter-by-letter from a FULL alphabet tray (free encode, not a curated tile set) — the truest spelling check; logs the exact misspelling via `chosen`.
- **Fluency** — a timed round (gentle, no scary clock): answer as many as you can; logs latency → feeds the Accurate→Automatic tier. Never shames slowness (celebrates accuracy first).

---

## Pillar 2 — the art system (most complete, drop-in)

### Architecture: an image-key registry + a resolving `<Art>` component
- **`src/art/assets.ts`** — every visual the app can show is a semantic KEY mapping
  to a PNG path + metadata: `{ key, src, w, h, fallbackEmoji }`. Keys are namespaced:
  `char:<id>:<expr>`, `hub:<world>:bg|frame|prop`, `game:<id>:<slot>`,
  `ui:<name>`, `fx:<name>`, `village:<name>`.
- **`<Art imageKey=… />`** — resolves the key, HEAD-probes the PNG (same proven
  pattern as RiveMascot/audio: only use it if it's a real binary, else render the
  **emoji/SVG fallback**). So the app looks complete TODAY and upgrades the instant
  a PNG lands at its path — no code change.
- **`@2x`** — each key can have a retina variant (`…@2x.png`) via `srcset`.
- **Consumption:** CharacterArt → `char:*` keys; the hubs (Garden/Space/Workshop)
  → `hub:*`; each game → `game:*`; UI/FX → `ui:*`/`fx:*`. All keep their current
  emoji/CSS look as the fallback, so nothing regresses.
- **Naming:** `art/<group>/<id>-<variant>.png` (e.g. `art/char/patch-cheer.png`),
  transparent PNG, sized per the manifest.

### Why this is the right system
Drop-in (fallbacks mean no broken states), data-driven (one registry), retina-ready,
and it reuses the exact missing-asset guard we already hardened. You create PNGs at
the listed paths; they appear automatically.

---

## Build phasing (after approval)
- **P0** — art system: `assets.ts` registry + `<Art>` resolver + wire CharacterArt
  and the 3 hubs to keys (fallbacks intact). Commit.
- **P1** — the 4 new archetypes (Rhyme, Oral-Blend, Dictation, Fluency) + the 6 new
  games across L1–L3, each wired to its character arc + skillKeys + the art keys.
  Gated + committed per game.
- **P2** — fluency/dictation surfacing on the tutor dashboard (reuses P4/P5 engines).
- Art (your track): create PNGs from the manifest at your pace; they light up live.

Sources: [OG activity types](https://www.orton-gillingham.com/what-is-structured-literacy/),
[expression sheets (6–10 active)](https://tavernsprite.com/blog/character-expression-sheet/),
[asset pipeline / naming / PNG transparency](http://ithare.com/graphics-for-games-101-asset-pipeline/).
