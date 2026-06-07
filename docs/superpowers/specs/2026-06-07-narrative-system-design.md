# Narrative System — Design Spec

- **Date:** 2026-06-07
- **Status:** Approved (build shape: "Foundation + one full story"); ready for implementation plan.
- **Owner area:** `src/world/` (story spine), `src/mascots/`, `src/worlds/garden/`, `src/TutorDashboard.tsx`, `src/ProfilePage.tsx`, `src/StudentPicker.tsx`.
- **Builds on:** the shipped story-spine slice (`src/world/narrative.ts`, commit `aad56da`).

## 1. Goal

Make the app *feel like a story and a living world*, driven entirely by the
learner's real practice — characters who remember you and evolve, a world that
records what you grew, and one complete cozy "small story" (help a creature
recover a lost sound) as proof of the loop. Plus four targeted fixes that remove
current rough edges.

Success = a returning learner is greeted by name/history, sees named things they
grew persist, can complete one full arrive→help→heal→resident NPC arc, and never
hears a hollow repeated line; a tutor sees concrete coaching tips; the explorer
picker and Pip's navigation behave correctly.

## 2. Non-goals (this pass)

- **Chapter/journey framing** of the 10 levels — deferred to the next pass. We
  leave a `chapterId` seam in lore state so it slots in without rework.
- **More than one NPC story** — author exactly one complete arc now; expand later.
- **No GenAI / LLM dialogue.** See §3.
- No new game mechanics — the NPC arc reuses an existing game as its "help" verb.

## 3. Research basis & the trap we are avoiding

- **Memory-gated authored dialogue** (Stardew/Animal Crossing/Cozy Grove): a
  memory log of what the player did gates which lines a character *can* say, so
  dialogue references real events; a no-immediate-repeat rule stops it ringing
  hollow. We replicate this with **authored, state-conditioned line pools + a
  recent-line ring buffer** — deterministic, testable, child-safe.
- **The consistent-miss path we reject: GenAI/LLM-generated NPC dialogue.** It
  needs a paid API, is non-deterministic, and is an "off-putting generation"
  child-safety hazard already flagged in project memory. Authored pools are how
  the cozy greats actually do it.
- **Cozy healing loop** (Cozy Grove/Spiritfarer): helping a lost character
  reveals their story bit by bit, earns warmth, and brightens the world — *no
  failure state, only connection*; mundane tasks gain weight through emotional
  framing. Our arc frames phonics practice as "help Moss find his lost hum."
- **Self-Determination Theory:** intrinsic motivation = autonomy + competence +
  **relatedness**; connecting with fictional characters is itself motivating.
  Hence bondable characters and a journey framing — and **no FOMO/decay/scarcity**
  (standing project rule).

## 4. Architecture — one shared foundation, many readers

New folder `src/world/lore/`. Everything derives from data we already track
(mastery, sessions, progress); only a small "what the learner has already been
shown / bonded with" record is persisted.

### 4.1 `plantings.ts` — named things you grew (pillar 2 data)

```ts
export interface Species { sound: string; plant: string; emoji: string; color: string; }
// keyed by soundId ('m', 'b', …). Deterministic: /m/ is ALWAYS the marigold.
export const SPECIES: Record<string, Species>;
export interface Planting { skillKey: SkillKey; sound: string; species: Species; name: string; } // name = "the /m/ marigold"

export function isMastered(stat: SkillStat | undefined): boolean; // attempts >= RATED_MIN && scoreOf(stat) >= 0.8
export function plantingsFor(learnerId: string): Planting[];        // DERIVED from mastery (no extra write)
```

- `isMastered` reuses mastery's existing `scoreOf`, `RATED_MIN`, and the `0.8`
  competence bar (the same line `areasToImprove` uses), so "planted" == genuine
  competence.
- `SPECIES` must be **total** over the sounds the live games can train (tested):
  every trainable `soundId` has an entry; a fallback species covers any gap so
  `plantingsFor` never returns an unnamed plant.

### 4.2 `loreStore.ts` — the ONLY persisted lore state

Key `ll:<id>:lore`; read via `stableRead` (loop-safe, stable ref); writes call
`notifyDataChanged()`; a `useLore(learnerId)` hook subscribes through the
reactive store. Shape:

```ts
export type StoryStage = 'dormant' | 'arrived' | 'healing' | 'healed' | 'resident';
export interface LoreState {
  acknowledged: string[];                       // beat ids already shown once
  stories: Record<string, { stage: StoryStage; introducedAt?: number; healedAt?: number }>;
  bonds: Record<string, number>;                // characterId -> interaction count
  recentLines: string[];                        // ring buffer (cap 12) of shown line ids
  chapterId?: string;                           // SEAM for the deferred journey pass
}
```

Mutators (all tiny, all notify): `acknowledge(id)`, `setStoryStage(storyId, stage, stamp?)`,
`bumpBond(characterId)`, `pushRecentLine(id)`. Defaults: missing → empty/`dormant`.

### 4.3 `dialogue.ts` — the evolving, no-repeat engine (pillar 1)

```ts
export type Speaker = 'pip' | 'echo' | string; // creatureId for residents
export interface DialogueCtx { narrative: NarrativeState; lore: LoreState; plantings: Planting[]; bond: (id: string) => number; }
export interface Line {
  id: string; speaker: Speaker;
  when?: (c: DialogueCtx) => boolean;  // gate: bond tier, plantings, daysSince, story stage
  weight?: number;
  text: (c: DialogueCtx) => string;    // may reference plantings/lastSkill/daysSince
  cta?: { destId: string };            // references a pipNav Dest by id (see §7)
}
export function selectLine(pool: Line[], ctx: DialogueCtx, rng: () => number): Line | null;
```

`selectLine`: filter by `when`, drop ids present in `lore.recentLines`, weighted
pick via injected `rng` (seeded in tests → deterministic), then the caller
records the chosen id via `pushRecentLine`. **This is the "evolves + never
repeats hollowly" mechanism**: higher-bond lines unlock as `bond` rises; the ring
buffer prevents immediate repeats. Extends today's `phrases.ts` / `narrative.ts`
line functions (kept; routed through the selector for the roaming buddy's varied
lines so they become memory-aware and deduped).

### 4.4 `stories.ts` — the cozy NPC arc (pillar 3)

```ts
export interface Story {
  id: string; creatureId: string; name: string;   // "Moss"
  soundId: string; skillKey: SkillKey;             // the lost sound (see §6 — must be game-trained)
  emoji: string;
  intro: Line[]; healing: Line[]; healed: Line[]; resident: Line[];
}
export const STORIES: Story[];                      // exactly one this pass
export function storyStage(story: Story, lore: LoreState, mastery: MasteryMap): StoryStage; // pure
```

Stage logic (pure, tested):

- `dormant → arrived`: first time the learner reaches the relevant world (Garden
  hub mount) as a non-newcomer; persists `introducedAt`.
- `arrived → healing`: once `mastery[skillKey].attempts > 0` (they've started).
- `healing → healed`: once `isMastered(mastery[skillKey])`; persists `healedAt`;
  fires the one-time celebratory beat.
- `healed → resident`: after the healed beat is acknowledged; Moss idles warmly
  in the garden thereafter (bonded lines).

No-fail / player-paced: nothing regresses a stage; there is no timer and no
penalty; the heal meter is just the learner's real mastery progress on that sound.

## 5. Pillar wiring (where readers attach)

1. **Characters w/ arcs+memory** — `MascotBuddy` and Home/Pip greetings pull lines
   via `selectLine`; Pip/Echo `bond` rises on interaction (`bumpBond`) and gates
   deeper line tiers; Moss is a full `Speaker` once resident.
2. **World that remembers** — `GardenMeadow` renders **named plantings** as a
   distinct, tappable layer over the existing ambient `bloomCount` density
   (tap → "the /m/ marigold — you grew this"). A **one-time beat** fires for each
   `unacknowledgedPlantings(lore, plantings)` entry, then it is acknowledged.
   Greet-by-last-visit stays in `narrative.ts`.
3. **Small story** — §4.4 + §6, surfaced in the Garden hub and through Pip.
4. **Journey/chapters** — deferred; `chapterId` seam only.

## 6. The one vertical story — "Moss"

- **Working content (rename-able):** *Moss*, a small mole who burrowed too deep
  and lost his hum — the **/m/** sound. Creature name starts with its sound as a
  mnemonic. Kindchenschema art consistent with Pip/Echo.
- **Implementation prerequisite (not a placeholder — a concrete first step):**
  confirm which `soundId`s are actually trained by a live game by inspecting the
  `recordItem` call sites (`GameScreen` / `SpaceSortGame` / `TapItOutGame`).
  Choose Moss's sound from that trained set so the "help" verb is really playable.
  Use /m/ if trained; otherwise the closest trained beginning sound, and rename
  the creature to match (sound-initial name).
- **Beats (authored, short, warm):** arrive ("Oh — hello. I'm Moss. I… I lost my
  hum somewhere down in the dark."), heal ("You found it! Mmmmm — there it is.
  Thank you."), move-in (Moss joins the garden), resident idles. All via the
  dialogue pools so they never repeat hollowly.

## 7. Guide reliability + story manner (Phase 0)

- Add `destById(id)` to `pipNav.ts`; **CTAs reference a `Dest` by id**, so the
  spoken place and the navigation target are the same object *by construction*.
- Audit every nav-bearing line (phrases/narrative/dialogue) so the spoken place
  matches `destById(cta.destId).label`/`.to`. Story-frame the walk
  ("Hop along — I'll walk you to the Garden 🌿").
- **Test:** for every line with a `cta`, assert the spoken text references the
  same destination the CTA navigates to (label/route consistency), and that
  `destById` is total over referenced ids.

## 8. Tutor-Pip (Phase 0)

- On **tutor routes**, suppress the child-facing roaming `MascotBuddy` (it should
  not roam a tutor's dashboard speaking kid lines).
- Add `src/world/tutor/tutorTips.ts`: authored coaching-tip templates keyed to
  skills / common confusions, selected from the active student's
  `areasToImprove(learnerId)` + mastery. Output is concrete and professional,
  e.g. "{name} is at {pct}% on {skillLabel} — try modeling it in a mirror and
  contrasting it with a near sound." Pure + tested.
- Render a **TutorPip coaching panel** near the top of `TutorDashboard` showing
  Pip + the top 1–3 tips for the selected student. Reads via the async
  `dataSource`/mastery path the dashboard already uses.

## 9. Explorer picker fix + Profile cleanup (Phase 0)

- **Explorer z-index bug:** `.picker-overlay` is `position:fixed; z-index:80` but
  renders *inside* `<NowPlaying>` within `.l2l-page` — a `position:relative;
  z-index:1` stacking context with parallax/reveal transforms — so fixed
  positioning is trapped and paints behind later page content. **Fix:**
  `createPortal(<overlay/>, document.body)` in `StudentPicker` so it escapes the
  ancestor context. Verify the shared `src/ui/dialog.tsx` Modal isn't trapped the
  same way (portal it too if so).
- **Remove "🚀 Next up":** delete `<NextUp/>` from `ProfilePage`; delete the now
  dead `src/NextUp.tsx` and its `.nextup*` CSS; keep the "Areas to improve" list
  under the "Learning focus" section.

## 10. Persistence & loop-safety rules (must follow)

- Lore reads go through `stableRead` and the reactive store; never read
  `localStorage` in an effect dependency array.
- Capture `now` via `useState(() => Date.now())` (lazy init) — no impure
  `Date.now()`/`Math.random()` in render bodies (`react-hooks/purity`).
- Component files export only components; hooks/contexts/pure logic live in
  `*.ts` files (`react-refresh/only-export-components`).
- Motion: transform/opacity only; never animate filter/backdrop-filter on blurred
  layers; honor `prefers-reduced-motion`. Interactive targets ≥ 40px.
- All content original — never reproduce Barton word lists/sentences/scripts.

## 11. Testing

- **Pure:** `SPECIES` totality over trained sounds; `plantingsFor` derivation +
  `isMastered` boundary; `storyStage` transitions (each edge); `selectLine`
  gating + no-repeat (recentLines) + seeded determinism; `tutorTipsFor`
  selection; `destById` totality and spoken==target for every CTA line.
- **Integration:** lore store read/write is loop-safe (stableRead self-invalidates
  on write); `narrativeState` stays green; ProfilePage renders without NextUp.
- **Live (gstack browse @ :4173):** screenshots for newcomer / returning /
  Moss arrive→heal→resident / named-planting tap / tutor-Pip tips / fixed
  explorer picker (now in front). No console errors, no render loop.
- **Gate (local binaries, never npx):** `tsc --noEmit && eslint . && vitest run
  && vite build`.

## 12. Phasing

- **Phase 0 (independent, ships first):** explorer portal fix; remove Next up;
  tutor-Pip tips; guide reliability + story framing. Each gated + committed.
- **Phase 1 (foundation):** `plantings.ts`, `loreStore.ts`, `dialogue.ts` +
  tests; route the roaming buddy/Home greeting through the selector.
- **Phase 2 (world remembers):** named plantings in `GardenMeadow` + one-time
  bloom beats.
- **Phase 3 (the story):** `stories.ts` (Moss) + arrive/heal/resident surfacing
  in the Garden hub and via Pip.
- **Later passes (out of scope here):** chapters/journey framing; more NPC
  stories; broader planting art.

## 13. Open content notes

- Names (Moss, plant species) are working defaults — easy to rename; they live in
  the authored data tables, not in logic.
- Pip/Echo personalities stay consistent with existing `phrases.ts` voice.

## 14. Addendum (2026-06-07) — story-first expansion

User direction: *"build from the stories out … rethink all current games to fit
this research … incorporate Pip's story … every level has a story so the user
gets more emotionally attached as they progress."* This promotes the story from a
feature to **the organizing architecture**. It **supersedes** the §2 non-goal that
deferred chapters and the §12 phasing below.

### 14.1 Story is the spine

- **World premise (the through-line):** the Sound Garden's voices went quiet; Pip
  & Echo are its keepers; the learner is the one who can bring sounds back to life.
  Already seeded in `narrative.ts`; now the frame for everything.
- **Pip & Echo get authored arcs** (`src/world/lore/characters.ts`): backstory +
  bond/chapter-gated reveals so *who Pip is and why the garden matters* unfolds as
  you progress. Pip becomes a character with a story, not just a guide.
- **Every level is a Chapter** (`src/world/lore/chapters.ts`):
  `Chapter { id, level, title, premise, region, cast: characterIds[], beats: Beat[] }`.
  `Beat`s are progress-gated narrative moments (open / first-help / milestone /
  complete). This is the "journey, not a meter" layer — content authored per level
  incrementally, but the framework is general now.

### 14.2 Critical data reality (drives chapter design — verified, not assumed)

`recordItem` call sites:
- **Garden / Level 1 — `TapItOutGame` → `pa:segment`** (hearing sounds in words;
  oral PA). No per-sound data.
- **Space / Level 2 — `SpaceSortGame` → `skillKeyForSound(...)`** (`sound:first:m`,
  `sound:last:t`, …). **The only source of per-sound mastery.**

Consequences:
- **The Garden is the persistent HOME that remembers everything** (pillar 2,
  cross-cutting — not one chapter). Per-sound **named plantings** ("the /m/
  marigold") bloom here, fed by **Space** mastery; meadow density grows from
  sessions + segmenting. `GardenLevelHub` is already "the whole screen is a living
  meadow that fills as you practice" — we make that meadow *named + remembered*.
- **Each chapter's "help" verb maps to its level's real trained skill.** A
  per-sound "lost sound" creature (e.g. lost /m/) belongs to the **Space** chapter
  (its heal = per-sound mastery). A "lost the ability to hear the little sounds"
  creature belongs to the **Garden/segmenting** chapter (heal = `pa:segment`
  mastery). Either is a valid first complete arc; pick the one that yields the
  crispest playable loop during Phase 3.

### 14.3 Reframe games, don't rewrite them (lowest-miss path)

The research's own lesson is that emotional weight comes from **framing a task**,
not changing it (Spiritfarer: "not cooking — making someone's childhood meal").
So existing game **mechanics stay**; we add the narrative wrapper (who you're
helping, why, the reward = a planting/heal/bond) and make **surgical fixes only
where a mechanic fights coziness** (e.g. any timer/fail-state/pressure framing →
soften to no-fail, player-paced). No engine rewrites.

### 14.4 Revised phasing (replaces §12)

- **Phase 0 — fixes (independent, ships first):** explorer portal · remove Profile
  "Next up" · tutor-Pip coaching tips · Pip-guide spoken==target + story framing.
- **Phase 1 — story foundation:** `dialogue.ts` (authored, gated, no-repeat) +
  `characters.ts` (Pip & Echo arcs, bonds) first, then `plantings.ts` +
  `loreStore.ts` (chapter + story + bond + acknowledged + recent-line state). Route
  the roaming buddy + Home greeting through the selector. Tests throughout.
- **Phase 2 — the Garden remembers:** named per-sound plantings rendered in
  `GardenMeadow` (tappable, "the /m/ marigold — you grew this"), one-time bloom
  beats, greet-by-last-visit deepened. The Garden becomes the emotional home.
- **Phase 3 — first complete chapter (the proof):** author one level's Chapter
  end-to-end with a playable cozy NPC arc (arrive→help→heal→resident), the level's
  game reframed as helping, Pip's arc opening beat. Choose the level whose trained
  skill makes the arc crispest (§14.2).
- **Phase 4+ (later passes):** roll the Chapter framework across all levels with
  authored content; deepen Pip/Echo arcs across chapters; a journey/map view of
  the chapters.

### 14.5 Build order note

Phase 0 and Phase 1 are independent of the Space-vs-Garden first-chapter choice,
so we **commence** on them immediately; the first-chapter content decision (§14.2)
is finalized entering Phase 3, informed by the foundation we'll have built.
