# Build Plan — Curriculum Gap-Fills

*Date: 2026-06-11 · Status: design (awaiting review) · Owner: Learn to Learn*

> The **content** the Freshness Engine first measures us against. Where the engine
> (`2026-06-11-freshness-engine-design.md`) is the *process* that keeps us current,
> this is the *sequenced work* that closes the gaps a nine-agent research sweep
> found in our current app. Each item says **what it is, where it plugs into our
> real architecture (game-in-level vs. cross-cutting feature vs. new level), what
> it reuses, what it logs, and its evidence anchor** — built so each piece rides
> the universal seams we already have (one logging contract, `SkillKey` prefixes,
> `GameShell`, per-world CSS prefix) with near-zero schema change.

---

## 0. Honest current state

We have a **near-exemplary Word Recognition strand** (the "D" of the Simple View)
delivered with strong structured-literacy fidelity. The gaps below are real
because `Reading Comprehension = Decoding × Language Comprehension` is
**multiplicative** — a child can ace every game and still not comprehend. None of
this is cosmetic.

**The verified gap list, ranked (from `docs/CURRICULUM-COVERAGE.md` §B):**

1. **Connected decodable text** — the bridge itself; the substrate fluency +
   orthographic mapping both need. Highest ROI; no new linguistic content.
2. **Real fluency** — prosody-first repeated reading; reframe "fast" → "smooth".
3. **Heart words / orthographic mapping** of irregular high-frequency words.
4. **Memory architecture** — spaced cumulative review + interleaving + closing the
   confusion-data loop (the two strongest effects in learning science, absent).
5. **Seed morphology earlier** (L2–L4 oral compounds/-s/-ing/prefixes).
6. **At-risk screener** (RAN/PA/letter-sound).
7. **ADHD-aware session design** (caps, novelty rotation, enactment, chunking).
8. **Language Comprehension strand** — the one *strategic scope decision* (§5).

Plus **engagement adoptions** the game-science sweep says we should make (the
"walk-the-line" maximizers we don't yet do — §6).

---

## 1. Architecture decision per gap

| Gap | Form | Where it lives | One-line why |
|---|---|---|---|
| Connected text + fluency | **One cross-cutting "Reading track"** — capstone game *inside each hub* from L2 | `src/reading/` engine + `ReadAloud` shell | text must stay lesson-matched to each level's GPCs; a standalone "reading level" would break decodability |
| Heart words | **In-level recurring game** L2→L10 + thin cross-level surface | `HeartWord` game (reuses PA + dictation) + "Heart Garden" | heart/flash status is *defined by* where the child is in the sequence |
| Memory engine | **Cross-cutting feature**, surfaced as a warm-up ritual | `src/world/memory/` + "garden tending" | review is woven into the world, not a quarantined quiz tab |
| Screener | **One-time game-framed flow** | `#/screener` + `src/mastery/screener.ts` | sets *initial pacing*, then live mastery overrides it |
| ADHD session | **Cross-cutting session governor** | `src/game/useSession.ts` + `src/session/sessionConfig.ts` | wraps every game; helps everyone, critical for the comorbid group |
| Early morphology | **In-level warm-ups** L2–L4 | `MorphWarmup` + `morphWarmups.ts` + `morph:*` skills | oral, ungated enrichment; formal roots stay L9–L10 |

**No new levels.** Every gap is the *application/strengthening* of skills the
existing 10 levels already teach, so they thread *through* the hubs we have.

---

## 2. Feature detail

### 2.1 Reading track — connected decodable text + fluency *(gaps 1, 2)*

**Mechanic.** A deterministic generation engine emits per-level "reading units" on
a ladder — **word rows → phrases → sentences → short passages** — built only from
the cumulative grapheme set taught up to that point plus taught heart words. One
reskinnable `ReadAloud` game appears as each hub's capstone, its **mode climbing
the evidence ladder Accuracy → Automaticity → Prosody → Rate** (rate is
tutor-only, never shown). The level's character is the fluent model the child
echoes/reads-with.

**Why an engine, not an LLM or hand-authoring.** Decodability must be *provable*
(generic LLMs land ~35% decodable; a constraint engine ~93%), offline, and
IP-clean (no external-content regurgitation). Three layers:
- **Taught-inventory resolver** — folds all `SkillKey`s at/before the `(level,
  lesson)` cursor into `{ gpcs, heartWords, syllableTypes, rules }`. Cumulative.
- **Lexicon** (`src/reading/lexicon.ts`) — original words tagged with required
  GPCs, syllable type, an **imageability/meaning** flag, heart-word flag. A word
  is admissible iff every GPC it needs is in the inventory. Seeded from our
  existing content packs (which already are decodability-tagged, imageable words).
- **Template composer + validator** — original syntactic frames with typed slots,
  filled only from admissible words, hard-rejected unless: **≥95% decodable**
  (≤10% untaught = frustration), new skill foregrounded, heart-words only-if-taught,
  meaning-known, natural/cohesive, length ramps by level.

**Mode ladder (kid-facing name · mechanic):** L2 Read&Match + "Read It Smooth"
(accuracy, self-paced) · L3 "Say It Again" (echo) · L4 "Read Together" (choral) ·
L5 "Smooth It Out" (repeated reading, ≤3 passes, confidence not clock) · L6 "Scoop
the Phrases" (phrase-cued, scoops fade) · L7 "Read Like Pip" (prosody/expression
mood-tap) · L8 "Story Theater" (readers theater) · L9 + self-rated smoothness ·
L10 automaticity capstone (rate tutor-only).

**Anti-"word-caller" guards (non-negotiable):** every passage ends with **one
comprehension beat** before it's "done" (can't win by word-calling); **prosody is
sequenced before rate**; **speed/WCPM never shown to the child**; phrase-scooping
trains chunking; the mascot models prosody every time.

**Reuses:** `GameShell`, `AudioPlayer.narrate` + `recordedAudioPlayer` (per-word
clips already keyed by label → sentence words get audio free), the full logging
contract, `castFor(level)` + `CharacterArt`, App dispatch + `games.ts`.
**New:** `src/reading/` (resolver + lexicon + composer + validator), `ReadAloud.tsx`
(built on `GameShell`, `mode` prop), `read:phrase|sent|passage` + `prosody:*`
skill-key families (extend existing `read:*`), a **CI decodability test** (every
generated unit ≥95% decodable or the build fails — this is gap-fix #8's invariant,
registered in the Freshness Engine).

**Logs (existing `SkillEvent`, zero migration):** `skillKey` `read:passage:vce`
etc.; `correct` per chunk/word; `firstTry` true on rep 1 (repeated-reading reps
carry `firstTry:false` → correctly ignored by mastery, still stored); `chosen` =
the misread (confusion capture); `latencyMs` (raw→bucketed, tutor-only WCPM);
`replays` = model re-hears (scaffolding-reliance). Tutor-only derived: WCPM vs
Hasbrouck-Tindal 2017 norms; accuracy band auto-levels passage difficulty
(<90% → route to shorter units).

**Input fork:** ship **tap-to-advance** first (no ASR, offline, no privacy
surface — enough for accuracy/automaticity/prosody via mood/smoothness taps);
on-device mic prosody/ASR is a later enhancement behind a permission gate, never
required.

### 2.2 Heart words — "Plant the Word" *(gap 3)*

**Mechanic.** Never a cold flashcard. **Hear → Segment (PA engine) → Map graphemes
into sound boxes** (a multi-letter grapheme shares one box) → **a heart glows over
*only* the irregular grapheme(s)** ("your ears say /e/, your eyes remember `ai`")
→ **read & spell from memory** (dictation engine, heart box outlined). Themed as
planting a word-seed in the garden.

**List & sequencing.** **Fry, sorted by spelling pattern (not frequency)**. Tag
each word **flash** (fully decodable now → route to a speed/automaticity drill, no
heart), **temporarily-irregular** (regular but pattern not taught yet → heart word
now, **auto-promotes to flash** the moment its level teaches the pattern), or
**permanently-irregular** (`said`, `was`, `of` → stays a heart word). ~10–15
pre-reading seed words around L1; **2–4 new heart words per level** from L2 (needs
L1 segmenting); re-surface old words via the memory engine rather than piling on
more.

**Architecture:** in-level recurring game (inherits the level's taught
correspondences → auto-promotion falls out for free) + a thin cross-level **"Heart
Garden"** (reuses named-plantings) where mapped words live and **spaced retrieval**
re-surfaces them (day-2/day-7 feel, via the memory engine — no streaks/decay).

**Reuses:** PA segment engine (the Segment step) = `TapItOut` mechanic with a
heart-word token; dictation engine (`WordBeam`) = the spell-from-memory step
(add to `DICTATION_GAMES`); existing first-try + `chosen` logging = the Map step.
**New:** `heartWords` pack (`{ word, emoji, heartIndices }`), `heart:<word>`
skill family, the game component, the Heart Garden surface.

**Logs (high-value):** per-grapheme first-try + **the specific wrong grapheme on
the heart box** (distinguishes "sounded it out, missed the heart" `sed`→`said`
from guessing) + recall spelling + **exposure-count-to-mastery curve** (1–4 typical
vs 20+ struggling → a gentle, unlabeled early dyslexia-risk signal).

### 2.3 Memory engine — spaced review + interleaving + confusion loop *(gaps 4, the loop)*

**Thesis from the evidence:** for ages 5–10 the *retrieval act* dominates; spacing
math is noise. So **no SM-2/Anki** (per-card ease → "low-interval hell" /
over-exposure). Build a **3-box Leitner** with **successive-relearning dropout**.

**Scheduler.** Items = passed `SkillItem`s + confusable `PairItem`s. Boxes:
Sprout(due next session) → Growing(~3) → Rooted(~7) → **Retired** (Box 3 + 2
consecutive correct → stops surfacing; a blooming plant the child walks past).
Correct → promote; wrong → back to Sprout + (for skills) flag for **re-teach**
(route to the mini-lesson, not just re-quiz). **Session-based, not calendar-based**
intervals → a child away two weeks returns to a gentle queue, never an avalanche
or guilt.

**Interleaving — block-first guardrail.** A `PairItem` (e.g. `b`/`d`, `sh`/`ch`,
short `e`/`i`) is minted by the **confusion loop** when one skill's wrong-answer
data shows a *systematic* confusion (≥~25% of misses on a specific other grapheme,
≥3 occurrences). It is **not eligible to interleave until both members are
individually acquired** (both passed + Box ≥2). Then mixed minimal-pair
discrimination trials run. Cap concurrently-active pairs (≤2) — a scalpel, not a
blender.

**Architecture:** cross-cutting `src/world/memory/` (pure: a `skillEvents →
confusionMatrix` reducer + the Leitner scheduler + a due-items selector),
surfaced as a short capped **"garden tending" warm-up** on world entry (3–6
retrieval trials reusing existing game components) — **not a separate mode**. A
miss is "weather, not failure."

**Reuses:** existing `MasteryMap`/`SkillStat` (`lastSeen`, recency-weighted
`scoreOf`, `confusions`), `masteryFromEvents`, the existing adaptive
focus/contrast selection in `GameScreen`. **New:** the scheduler module + a small
`ll:<id>:review` store (same `dataBus`/`stableRead` pattern). No schema change.

### 2.4 Screener — "Sound Garden Welcome" *(gap 6)*

**Mechanic.** A one-time ~2–3 min first-visit flow framed as **Pip showing you the
garden** (never a test): (1) **RAN** "name the sprouts fast" (object board;
alphanumeric board auto-unlocks if the child knows letters — the stronger
predictor); (2) **PA** "clap the beats" (the existing `pa:segment` Tap-It mechanic
in calibration mode); (3) **letter-sound** "which says /m/?" (only if letter
familiarity shows). No timer shown, no score screen — the child only sees "the
garden's waking up!"

**Output = pacing, never a deficit score.** Writes `ll:<id>:screener`
(`gentle|standard|springboard` + soft flags) that sets initial session length /
rotation cadence (consumed by 2.5) and seeds `placement.ts` — then **live mastery
immediately overrides it**. Tutor/parent view phrases flags as "benefits from
extra naming-speed practice," never a number. Optional gentle re-screen every
~8–12 weeks (growth vs. own baseline only).

**Reuses:** `GameShell`, `CheckpointGame`'s `soundQuestion` builder, Tap-It,
`latencyMs` plumbing, `placement.ts`. **New:** `RanBoard.tsx`, the flow
orchestrator, `src/mastery/screener.ts`. Wire `#/screener` (router + App).

### 2.5 ADHD-aware session governor *(gap 7)*

**Mechanic.** A session governor wrapping every game, parameterized by the
screener `pacing`: **length caps** ending on a garden-natural beat (gentle ~3–4
min / standard ~5–6 / springboard ~7–8) with a clean "one more, or rest?" exit;
**novelty rotation** (2–3 mechanic *types* per session, never two of a kind
back-to-back, weaving in the weak skill); an opt-in **"Act it out!"** enactment
affordance (do the word with your body before answering — the enactment effect,
honors `prefers-reduced-motion`); **chunked instructions** (one step on screen at
a time via audio-first mascot); optional 15-s movement micro-break at the stop
point.

**Reuses:** existing fixed-round structure, `GameShell` (the "Act it out" slot is a
shared slot so all worlds get it), `weakestSoundForTarget`. **New:**
`src/game/useSession.ts`, `src/session/sessionConfig.ts` (pure `pacing` → caps,
testable). **Logs (additive `SessionRecord` fields):** `endedNaturally`,
`rotations`, `enactUsed` → a no-pressure engagement read; session length
**self-tunes** to the child.

### 2.6 Early oral morphology *(gap 5)*

**Mechanic.** A 30–60 s spoken "word-building" warm-up *before* the main game at
L2–L4 — purely oral, no affix decoding: **L2** compounds ("sun + flower → ?";
"take flower out of sunflower"), **L3** plural -s / -ing ("one cat… two ___?";
"I jump → I am ___"), **L4** prefix meaning ("untie undoes tie"; "replay means
play…?"), plus a "smaller word hiding inside?" listening game. Reuses the
blend/segment interaction (whole-word units) + pick-the-meaning.

**Reuses:** existing blend/segment + `CheckpointGame` meaning picks. **New:**
`morphWarmups.ts` pack (original), shared `MorphWarmup.tsx` (themed per world),
`morph:<kind>:<form>` skill family. **Deliberately *not* a level gate** (omit
`morph:` from `levelSkillStats`) — seeded enrichment, tracked in the dashboard,
gives an early vocabulary/comprehension signal pure phonics misses.

---

## 3. Sequenced build order

Ordered by ROI + dependency. Every phase ends with the gate green **and** a
coverage re-score (the Freshness Engine hook), and advances specific ❌/⚠️ rows.

- **Phase A — Foundations that unlock the rest**
  - **A1** `src/reading/` taught-inventory resolver + decodability-tagged lexicon +
    template/validator + **CI decodability test**. *(substrate for fluency +
    heart-word promotion + review word selection)*
  - **A2** Memory engine core (`src/world/memory/`: confusion reducer + 3-box
    Leitner + selector). *(highest leverage — reuses data we already log, no new
    content)*
- **Phase B — First vertical slices (prove the patterns)**
  - **B1** `ReadAloud` shell in echo mode + **L3 "Say It Again"** end-to-end
    (model audio + echo + comprehension gate + logging) + tutor-only WCPM panel.
  - **B2** Heart-words "Plant the Word" at **L2** + Heart Garden surface (wires to
    A2 for spaced retrieval).
  - **B3** "Garden tending" warm-up UI (surfaces A2).
- **Phase C — Reach + readiness**
  - **C1** Screener flow → pacing profile.
  - **C2** Session governor + "Act it out" slot (consumes C1).
  - **C3** Early morphology warm-ups L2–L4.
- **Phase D — Roll out across levels**
  - **D1** ReadAloud modes L4→L10 (choral → repeated → scoop → prosody → theater →
    automaticity), per-world mascot audio.
  - **D2** Heart words L3→L10 with auto-promotion (uses A1 inventory).
  - **D3** Engagement adoptions (§6).
- **Phase E — Comprehension** *(DEFERRED — ships later as a separate **paid
  add-on**, behind an adult-facing entitlement; core A–D runs fully without it)*
  - **E1** Vocabulary (Tier-2 "word garden", reframe affix/root levels).
  - **E2** Sentence-level comprehension once connected text exists (knowledge woven
    via the narrative system; **no** content-free "main idea" minigames).

### Confidence gates (≥95%, earned per brick — see CLAUDE.md "Confidence floor")

No brick is "done" until confidence in *it* is ≥95%, evidenced not asserted:

- **A1 (reading engine) ships as a proving SPIKE first** — the resolver + a small
  decodability-tagged lexicon + the validator + the CI decodability test +
  **≥N generated sample passages reviewed for naturalness**. A1 is declared ≥95%
  only when those samples pass *both* the decodability test *and* a human
  naturalness read. This is the cheap de-risk before the expensive L2→L10 roll-out.
- **A2 (memory engine core)** — pure + fully unit-tested against the spec'd
  promote/retire/interleave behavior (the first brick; built test-first).
- **Tunable parameters** (Leitner intervals, screener thresholds, confusion
  trigger) are **named constants with a "validate against real data" note**, so a
  later tuning is one line, not a rewrite.
- **Audio** has a TTS fallback, so recorded-clip quality is an *enhancement* axis,
  never a blocker on the critical path.
- Each brick lands **gate-green** (`tsc && eslint && vitest && vite build`) and
  re-scores the coverage maps.

---

## 4. Cross-cutting guardrails (apply to every item)

- **Reading:** decodable **not** predictable text (no repeated-sentence/picture
  guessing); never show speed; **prosody before rate**; comprehension-gate every
  passage; multisensory ≠ learning-styles (never build modality-matching).
- **Memory:** block-before-interleave; session-based not calendar-based; **retire**
  mastered items (no over-exposure); a miss re-teaches, never shames.
- **Screener/session:** output sets *intensity/pacing*, **never a deficit score**,
  and is never shown to the child; the mastery-gate should become **adaptive**
  (scaffolding rises with difficulty) so a struggling child stays in flow.
- **Enrichment vs gate:** morphology and fluency are **tracked, not gates**
  (per the research) — they enrich, they don't block progression.
- **Congruence (CLAUDE.md):** every new game wraps `GameShell`, themes via a
  per-world prefix, honors the **universal logging contract** (`recordItem` +
  `logSkillEvent` per item, `logSession`/`recordFinish`/`awardForSession` at
  finish), fits one viewport (no scroll), ≥40px targets, transform/opacity motion,
  `prefers-reduced-motion`.
- **IP:** all content original; the reading engine is template+lexicon we author
  (no LLM regurgitation path); never display a transcribed scope & sequence.
- **`SkillKey` extensibility:** every new family (`read:*`, `prosody:*`,
  `heart:*`, `morph:*`) adds a prefix + `skillLabel`/`skillTag` cases and rides the
  whole mastery/gate/tutor/cloud pipeline with **zero schema change**.

---

## 5. The strategic scope decision — Language Comprehension *(DECIDED)*

By the Simple View we build **D** and leave **LC ≈ 0**. **Decision (2026-06-11):**
the **core product owns the Word-Recognition boundary**, and the **Language
Comprehension layer ships later as a separate PAID ADD-ON** — not part of the free
core.

- **Core (Phases A–D) = the Word Recognition strand.** Position explicitly in copy:
  "we teach kids to lift words off the page; pair us with read-alouds &
  conversation for the rest." For a dyslexic-profile child whose oral language is
  intact, decoding *is* the bottleneck, so this focus is exactly right. *Constraint:*
  never claim a standalone "non-reader → fluent comprehending reader" outcome while
  the core teaches one factor.
- **Phase E = the paid Comprehension add-on (post-core).** Vocabulary first
  (Tier-2 "word garden", reframe affix/root levels into a meaning engine), then
  sentence-level comprehension once connected text exists, knowledge woven via the
  narrative system. *Avoid* standalone "find the main idea/inference" drills —
  content-free strategy practice doesn't transfer (Hirsch/Wexler).

**Monetization guardrails (these are ethics + compliance constraints, not options).**
The add-on must be **entitlement-gated and adult-facing**: the *parent/tutor* buys
it; **never** paywall or interrupt the child's core learning loop, **never** show a
child a purchase prompt, pressure, or "locked" tease, and **never** use random/loot
purchase mechanics. (Game-science consensus: keep monetization adult-facing; keep
the child's learning loop free of spend.) This introduces a **new coverage area —
"monetization ethics"** — which the Freshness Engine's compliance + gaming fronts
should track (COPPA/Children's Code rules on commerce directed at children).
Architecturally: build Phase E behind a clean feature-flag/entitlement boundary so
the core ships and runs entirely without it.

---

## 6. Engagement adoptions — "walk the line" *(Phase D3)*

The game-science sweep says our stack is unusually well-aligned; these are the
white-hat maximizers we don't yet fully do:

- **Verify intrinsic integration** — confirm the heal *is* the phonics gesture, not
  a separate cutscene (a separate reward = extrinsic fantasy = loses the
  attentional learning benefit). An audit, not a build.
- **"Reward the return"** — a warm welcome (+ optional small bonus) on coming back,
  while the garden simply *waits* unchanged. The ethical replacement for streaks —
  same re-engagement pull, opposite sign. **Never decay.**
- **Juice the success / quiet the thinking** — hit-pause (~80–150 ms), scale-punch
  (`transform: scale`), layered sound + companion delight on *success*; keep the
  *deliberation* moment uncluttered (over-juicing the thinking step = "seductive
  details" that lower learning). Opacity/sound-only fallback under reduced-motion.
- **Adaptive difficulty at ~85% success** — tune *support* (scaffolding, distractor
  count, pace), not reward, to hold the learning sweet spot with
  **emotionally-costless failure**. (Distinct from the 0.95 mastery PASS_BAR, which
  gates progression — this tunes in-session challenge.)
- **Process-praise not person-praise** — companion credits *effort/strategy*, never
  ability.
- **RITEC creativity + identity** — let kids build/customize their corner of the
  garden (the under-served wellbeing dimensions).

**Bright lines (already ours; the Freshness Engine enforces):** no variable-ratio/
loot rewards, streaks, FOMO/scarcity/countdowns, decay/wilting-guilt, leaderboards,
re-engagement nags, guilt-tripping companion (responds to effort-*present*, never
absence), extrinsic coin economies, child-voice/PII capture.

---

## 7. Open decisions for the owner

1. ✅ **DECIDED** — core owns the Word-Recognition boundary; **Phase E
   (comprehension) ships later as a paid, adult-facing add-on** (§5).
2. **Fluency input** — ship **tap-first** (recommended), add mic later behind a
   permission gate.
3. **Heart-word list** — **Fry, sorted by spelling pattern** (recommended); confirm.
4. **Build entry point** — start at **Phase A** (A1 reading substrate + A2 memory
   engine) on approval.

---

## 8. Sources

Seeded from the nine-agent research sweep (2026-06-11): connected-text+fluency,
heart-words, memory-engine, screener/ADHD/morphology solution designs +
brick-by-brick architecture map + four game-design research reports. Full URLs
live in those reports and in `docs/CURRICULUM-COVERAGE.md`. Anchor authorities:
NRP · Simple View · Scarborough's Rope · Active View (bridging 0.70) · IDA KPS
(B-5 irregular words, E-3 fluency) · Ehri / orthographic mapping · Hasbrouck-Tindal
2017 · Bowers/Kirby/Deacon (morphology) · Lyster/Lervåg/Hulme (oral morphology) ·
McWeeny 2022 (RAN) · distributed-practice & retrieval-practice meta-analyses ·
Rohrer (interleaving, block-first) · Habgood & Ainsworth (intrinsic integration) ·
SDT · Hodent / RITEC-8 (ethical engagement).
```
