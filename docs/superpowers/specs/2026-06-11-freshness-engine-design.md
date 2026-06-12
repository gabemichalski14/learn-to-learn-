# Freshness Engine — Design Spec

*Date: 2026-06-11 · Status: design (awaiting review) · Owner: Learn to Learn*

> Keeps the app **provably current on the reading science AND the game-design
> science** as we add levels and as new research lands — via mechanisms that
> **cannot be silently skipped**. A coverage rubric nobody re-runs is just a doc
> that rots; this turns "are we still up to date?" into a question the system
> *forces us to answer on a fixed cadence* and *can't ship without answering*.

---

## 1. Goal & principles

**Goal.** A standing system that (a) maps every evidence-validated component of
**all three fronts — reading · gaming · compliance** — to where/how well we cover
it, (b) detects internal drift, external research drift, ethics drift, and
**regulatory drift** automatically, and (c) keeps **itself** from developing blind
spots.

> **Why three fronts, not two.** Self-audit (2026-06-11) surfaced that
> **legal/regulatory compliance** (COPPA, UK Children's Code, GDPR-K, FERPA) goes
> stale on its *own* clock and is the highest-stakes front for a kids' product —
> the amended COPPA rule has a **compliance deadline of 2026-04-22**. Folding it
> under "gaming ethics" under-weighted it, so it is now a first-class front with
> its own framework registry and domains. (Security / dependency-CVE freshness is
> deliberately **out of scope** here — it runs on a daily cadence and is handled by
> standard tooling, not this quarterly engine.)

**Three independent locks** (any one catches a lapse the others miss):
1. **Time** — a build-time *staleness tripwire*: the gate goes red every 90 days
   until the quarterly sweep is run and the review date is bumped. It has a
   **visible emergency valve** (a dated, reason-logged, capped `acknowledgedUntil`
   override) so an urgent hotfix or a slow review can defer *specific* findings
   without ever silently deleting the test — the override itself is recorded and
   expires.
2. **Development events** — *no-level-left-behind*: a new level/game can't ship
   without a coverage row; wired into CLAUDE.md's definition-of-done.
3. **Ethics drift** — *ethics-as-tests*: a dark pattern sneaking into source
   fails the build (an `ipGuard`-style scan). This catches *accidental*
   introductions; it is **necessary but not sufficient** — a determined or
   obfuscated dark pattern is caught by the standing quarterly **human ethics
   audit** (Layer 3), not the keyword scan.

**Two cross-cutting disciplines:**
- **Walk the line** — the game map enforces both *bright lines we never cross*
  and *white-hat levers we must exploit to the hilt*. Engagement is pushed to the
  maximum that stays on the ethical side; nothing past it.
- **No gaps in the engine itself** (Layer 0) — required meta-domains + a canonical
  framework registry + a triangulation rule + a quarterly red-team gap-hunter, so
  the rubric can't quietly omit a whole area.

**Hard constraints inherited (do not violate):** no streaks/FOMO/scarcity/decay/
shame; store results + first name only, no child PII, no child-voice capture;
offline-first, no re-engagement notifications; gate runs LOCAL binaries; the
assistant does not deploy — findings go to the owner for approval first.

---

## 2. Architecture

### Layer 0 — Completeness assurance ("the engine has no gaps")

Full proof against unknown-unknowns is impossible; this is the rigorous best
practice — multi-framework triangulation + required coverage areas + a dedicated
quarterly red-team.

- **Required meta-domains (enforced).** Each map must populate every domain or the
  build fails (an empty domain = a whole area missing).
  - *Reading:* `content` · `delivery` · `bridging` · `comprehension` ·
    `learner-variation` · `measurement`.
  - *Gaming:* `motivation` · `aesthetics` · `loop-feel` · `difficulty` ·
    `ethics` · `wellbeing` · `session-retention` · `accessibility` ·
    `audience-split`.
  - *Compliance:* `privacy-data` · `consent` · `retention-deletion` ·
    `age-assurance` · `transparency-notices` · `school-use` (FERPA).
- **Canonical-framework registry (enforced).** Every enumerated element of each
  authority must map to ≥1 coverage row:
  - *Reading:* National Reading Panel (5 pillars), Simple View of Reading,
    Scarborough's Reading Rope, Active View of Reading, IDA Knowledge & Practice
    Standards, Ehri's phases / orthographic mapping.
  - *Gaming:* MDA, LeBlanc's 8 Kinds of Fun, Octalysis (8 core drives),
    Self-Determination Theory, UNICEF RITEC-8, Quantic Foundry motivations.
  - *Compliance:* COPPA (2025 amended rule), UK Children's Code (15 standards),
    GDPR-K, FERPA, US state minors'-privacy laws.
  - New authorities discovered by a sweep are appended to the registry.
- **Triangulation rule (enforced).** A component can be `covered` only with ≥2
  independent sources; single-source rows auto-downgrade to `partial`
  ("under-validated") and surface in the next sweep.
- **Red-team gap-hunter (every sweep).** A dedicated sub-agent whose only job is
  to find structural blind spots / unknown-unknowns — "what category is entirely
  absent?" — distinct from the agents scanning for new papers. Its brief is
  explicitly a **horizon scan of adjacent fields and under-served populations**,
  not just our registered frameworks: e.g. **English-language-learner /
  multilingual / biliteracy** support, learners with co-occurring conditions, and
  emerging areas (AI tutoring, etc.). It also re-audits the meta-domain list and
  framework registry themselves, and **critiques the thoroughness of the sweep's
  own prompts** so the engine doesn't manufacture false confidence.

### Layer 1 — Coverage maps + machine-readable manifest

- `src/coverage/coverage.ts` — **single source of truth** the tests read. Typed
  component lists + framework registry + required-domain lists + review metadata.
- `docs/coverage/READING-COVERAGE.md` — narrative reading gap-scanner (migrated
  from the existing `docs/CURRICULUM-COVERAGE.md`).
- `docs/coverage/GAME-COVERAGE.md` — narrative engagement/ethics gap-scanner
  (new twin; the walk-the-line map, §3).
- `docs/coverage/COMPLIANCE-COVERAGE.md` — narrative regulatory map (COPPA /
  Children's Code / GDPR-K / FERPA), with each requirement → where we satisfy it.
- `docs/coverage/CHANGELOG.md` — provenance of how our science evolved, appended
  each sweep; a `coverageVersion` bumps on material change (the `SEARCH_VERSION`
  pattern we already use).

> **Manifest is authoritative; prose is generated-or-checked.** The `.md` maps and
> `coverage.ts` can desync and mislead the humans who read the prose. Rule: the
> manifest is the single source of truth, and a test (Layer 2 #10) asserts every
> manifest `id` is referenced in its narrative map — so the docs can't silently
> drift from what's enforced.

**Data model:**
```ts
export type CoverageStatus = 'covered' | 'partial' | 'missing' | 'out-of-scope';
//  ✅ covered  ⚠️ partial  ❌ missing  ⬜ deliberate scope boundary

export type ReadingDomain =
  'content' | 'delivery' | 'bridging' | 'comprehension'
  | 'learner-variation' | 'measurement';
export type GamingDomain =
  'motivation' | 'aesthetics' | 'loop-feel' | 'difficulty' | 'ethics'
  | 'wellbeing' | 'session-retention' | 'accessibility' | 'audience-split';
export type ComplianceDomain =
  'privacy-data' | 'consent' | 'retention-deletion' | 'age-assurance'
  | 'transparency-notices' | 'school-use';
export type Side = 'reading' | 'gaming' | 'compliance';
export type MetaDomain = ReadingDomain | GamingDomain | ComplianceDomain;

export interface CoverageComponent {
  id: string;
  side: Side;
  domain: MetaDomain;
  title: string;
  status: CoverageStatus;
  where: string;                       // required (non-empty) when 'covered'
  levels?: number[];                   // when level-specific
  sources: string[];                   // ≥2 required for 'covered'
  frameworks: string[];                // canonical frameworks it satisfies
  kind?: 'bright-line' | 'lean-in';    // gaming ethics/engagement classification
  note?: string;
}

export interface FrameworkSpec {
  id: string; title: string; side: Side; elements: string[];
}

// Emergency valve: a logged, dated, capped deferral of a specific finding so the
// tripwire informs without hostage-taking the deploy pipeline. Never a silent skip.
export interface AcknowledgedDefer {
  componentId: string;      // the finding being deferred
  reason: string;           // why (required)
  by: string;               // who acknowledged
  until: string;            // ISO; must be within MAX_DEFER_DAYS of `at`
  at: string;               // ISO when acknowledged
}

export const REQUIRED_DOMAINS:
  { reading: ReadingDomain[]; gaming: GamingDomain[]; compliance: ComplianceDomain[] };
export const FRAMEWORKS: FrameworkSpec[];
export const READING_COVERAGE: CoverageComponent[];
export const GAME_COVERAGE: CoverageComponent[];
export const COMPLIANCE_COVERAGE: CoverageComponent[];
export const COVERAGE_META = {
  lastReviewed: '2026-06-11',
  reviewIntervalDays: 90,
  maxDeferDays: 30,         // an emergency defer can't exceed this
  coverageVersion: 1,
  acknowledgedDefers: [] as AcknowledgedDefer[],
};
```

### Layer 2 — Guard tests in the gate (the part that bites)

`src/coverage/coverage.test.ts` (runs in the existing `vitest` gate):
1. **Staleness tripwire** — fail if `today > lastReviewed + reviewIntervalDays`.
   A self-explanatory error message names the overdue front(s) and points to
   `docs/coverage/SWEEP.md`. **Emergency valve:** a finding listed in
   `acknowledgedDefers` with `until >= today` is skipped (and its deferral printed
   as a warning); the test still *fails* if any defer exceeds `maxDeferDays` or
   lacks a reason — so the valve is visible and bounded, never a silent skip.
2. **No-level-left-behind** — every `LEVELS[*].num` (games.ts) appears in
   `READING_COVERAGE`; a `covered`/`partial` row referencing that level exists.
3. **Required-domain completeness** (Layer 0) — every `REQUIRED_DOMAINS` entry
   (reading · gaming · **compliance**) has ≥1 component on its side.
4. **Framework completeness** (Layer 0) — every `FrameworkSpec.elements[*]` is
   referenced by ≥1 component's `frameworks`/`note`.
5. **Triangulation** (Layer 0) — every `covered` row has non-empty `where` and
   `sources.length >= 2`; otherwise the test fails (forcing a downgrade to
   `partial`).
6. **Ethics-as-tests (bright lines)** — an `ipGuard`-style source scan that fails
   on dark-pattern tells (`streak`, login-bonus, reward-countdown, child-facing
   `leaderboard`, progress `decay`) and on privacy-posture violations (no
   `Notification`/notification scheduling, no `getUserMedia`/mic capture) outside
   an explicit, commented allowlist. Each `bright-line` component must have a
   corresponding scan assertion. *(Necessary-not-sufficient: catches accidents;
   subtle drift is caught by the Layer-3 human ethics audit.)*
7. **Walk-the-line tracking** — every `lean-in` maximizer is a tracked row; the
   sweep report lists any still `missing`/`partial` so we keep adopting them
   (non-blocking — it informs, doesn't fail the build).
8. **Decodability invariant** (activated when the connected-text engine ships) —
   every generated passage ≥95% decodable, else fail. Registered here as a
   coverage invariant.
9. **Tripwire self-test** — unit tests of the staleness + defer math itself (due
   dates, `maxDeferDays` cap, expired/ malformed defers), so the forcing function
   can't silently rot. *Test the test.*
10. **Manifest↔prose sync** — every `coverage.ts` component `id` is referenced in
    its narrative `.md` map, so the human-readable docs can't drift from what's
    enforced.

### Layer 3 — The quarterly research sweep (autonomous → review-before-deploy)

- `docs/coverage/SWEEP.md` + a `/coverage-sweep` command capture the exact
  procedure used in this session: spawn the research roster, each tasked to find
  **what's new since `lastReviewed`**, diff against the manifest, emit
  added/changed components + new sources.
- **Agent roster:**
  - *Reading (4):* frameworks/science-of-reading · dyslexia/Orton-Gillingham ·
    fluency-vocabulary-comprehension · neurodivergence/psychology.
  - *Gaming (4):* fun/flow/game-feel · design-frameworks/player-psychology ·
    mobile/social/online-vs-local · child-vs-adult ethics/exemplars. The ethics
    agent also delivers a **standing human ethics audit** of our *current* design
    (does any mechanic read as a dark pattern now?) — the safety net the keyword
    scan can't be.
  - *Compliance (1):* COPPA / Children's Code / GDPR-K / FERPA + state laws — what
    changed, and does our data posture still satisfy it (flags time-bound items
    like the **2026-04-22 COPPA deadline**).
  - *Meta (1):* the **red-team gap-hunter** (Layer 0).
- **Background + approval gate.** A scheduled task fires **quarterly**, runs the
  sweep autonomously in the background, and produces a **findings report for the
  owner**. Nothing the sweep proposes is merged, applied, or deployed until the
  owner reviews and approves. On approval: update maps + manifest, bump
  `lastReviewed`, append `CHANGELOG.md`, gate goes green; new gaps join the ranked
  list and become build tasks if warranted.
- The tripwire is the guarantee; the schedule is the legwork — a missed run can't
  slip past because the gate is already red.

### Layer 4 — Development hooks

- CLAUDE.md gains a short **"Freshness Engine"** section (so a future contributor
  — or a fresh session — understands a red coverage gate and where to run the
  sweep) plus a definition-of-done line: *a new level/game must re-score the
  relevant coverage maps* (enforced by test #2).
- Each sweep appends findings to the memory KB for cross-session provenance.

---

## 3. The walk-the-line map (gaming `kind`)

**Bright lines — NEVER (enforced by ethics-as-tests):**
variable-ratio / random rewards & loot boxes · streaks & streak-loss ·
FOMO / scarcity / limited-time / countdowns · decay / "wilting" guilt ·
leaderboards / peer-ranking / public scores · re-engagement push notifications /
nags · guilt-tripping companion (sad-on-absence) · appointment mechanics ·
infinite scroll / autoplay · extrinsic coin/gem/loot economies bolted beside the
learning · child-voice capture or child PII beyond first-name + results ·
onboarding friction (unskippable intros, pre-play popups/shop redirects).

**Lean-in maximizers — DO, to the hilt (tracked; we must keep adopting):**
juice the *success* beat (hit-pause, scale-punch, layered sound, companion
delight) while keeping the *thinking* beat quiet (avoid "seductive details") ·
intrinsic integration (the heal **is** the phonics gesture, never a separate
cutscene) · endogenous fantasy + personalization (named plantings, customization,
identity) · SDT autonomy (real choices) · competence (visible, earned mastery) ·
relatedness (the companion bond) · protégé effect · flow/ZPD adaptive difficulty
at ~85% success with emotionally-costless failure · **"reward the return"** (warm
welcome + small bonus on coming back, never decay) · permanence-based Living World
· process-praise not person-praise · RITEC creativity + identity surfaces ·
multisensory + instant gentle corrective feedback · snackable 5–10 min sessions
with clean natural stop points · cooperative co-play with a trusted adult (the
only safe "social").

---

## 4. File map

```
src/coverage/coverage.ts          # typed manifest (single source of truth)
src/coverage/coverage.test.ts     # the guard tests (Layers 0 & 2)
docs/coverage/READING-COVERAGE.md     # narrative reading map (migrated)
docs/coverage/GAME-COVERAGE.md        # narrative engagement/ethics map (new)
docs/coverage/COMPLIANCE-COVERAGE.md  # narrative regulatory map (new)
docs/coverage/SWEEP.md                # the quarterly sweep playbook
docs/coverage/CHANGELOG.md            # per-sweep provenance
.claude/commands/coverage-sweep.md    # /coverage-sweep command (optional)
```
Plus: a short `CLAUDE.md` "Freshness Engine" section (+ definition-of-done line)
and the scheduled quarterly task.

---

## 5. Phasing (build only after approval)

- **P1 — Skeleton that starts forcing the cadence immediately:** `coverage.ts`
  manifest seeded **honestly** from this session's research (current ❌ gaps —
  connected text, heart words, memory engine, screener — recorded as `missing`,
  not papered over) + the three narrative maps (reading · gaming · compliance) +
  tests #1 (staleness + emergency valve), #2 (no-level-left-behind), #3 (required
  domains incl. compliance), #4 (framework completeness), #5 (triangulation),
  #9 (tripwire self-test), #10 (manifest↔prose sync).
- **P2 — Ethics-as-tests:** the bright-line source scan (#6) + walk-the-line
  tracking (#7), with the allowlist.
- **P3 — The sweep:** `SWEEP.md` playbook + `/coverage-sweep` + the 10-agent roster
  (incl. compliance agent + standing ethics audit + red-team gap-hunter) + the
  scheduled quarterly background task + the owner-approval report flow.
- **P4 — Decodability invariant** (#8) wired when the connected-text engine ships.

---

## 6. Decisions locked

- Cadence: **quarterly** (90 days).
- Sweep runs **autonomously in the background**; findings go to the **owner for
  approval before anything is applied or deployed**.
- **No dark patterns, but walk the line** — enforce bright lines, actively adopt
  white-hat maximizers.
- **Full engine** (guard tests + recurring sweep + living docs) with a
  **completeness layer** so the engine itself has no gaps.
- **Three fronts:** reading · gaming · **compliance** (the last added by self-audit;
  security/CVE freshness deliberately out of scope → standard tooling).
- `coverage.ts` **ships in the app bundle** (tiny plain data — owner's call).
- The tripwire has a **visible, bounded emergency valve** (`acknowledgedDefers`,
  capped by `maxDeferDays`) — never a silent skip.

## 7. Open items

- Exact allowlist entries for the ethics source scan (settle during P2 against the
  real codebase).
- The scheduled-task mechanism specifics (environment scheduler vs. repo-driven
  reminder) — confirm during P3.

---

## Sources

This engine is seeded from a nine-agent research sweep (2026-06-11) across
reading science, dyslexia/OG, fluency-vocabulary-comprehension, neurodivergence/
psychology, game fun/flow/feel, design-frameworks/player-psychology,
mobile/social/online game data, and child-vs-adult ethics. Full URLs live in the
per-component `sources` of `coverage.ts` and the narrative maps. Anchor
authorities: NRP · Simple View · Scarborough's Rope · Active View · IDA KPS ·
Ehri / orthographic mapping · MDA · 8 Kinds of Fun · Octalysis · SDT · RITEC-8 ·
Quantic Foundry · UK Children's Code · COPPA.
```
