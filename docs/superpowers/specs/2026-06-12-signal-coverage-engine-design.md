# Signal Coverage Engine — Design Spec

*Date: 2026-06-12 · Status: design (awaiting review) · Owner: Learn to Learn*

> A standing system that recognizes **where we are not absorbing useful *learning*
> signal to its full potential** — and flags it — while making it structurally
> impossible to drift into surveillance. Built from a four-agent research sweep
> (learning-analytics/stealth-assessment · behavioral-analytics + dark-pattern
> bright-lines · cognitive/brain signals · children's-data privacy/compliance).

---

## 0. The reconciling thesis (why this is safe to build)

All four research strands converged on one point: **useful signal is a *derived,
on-device statistic*, not the raw event.** We already log the right substrate
(`SkillEvent`: skillKey, correct, firstTry, chosen, latencyMs, replays, level,
lesson, at). The gap is **derivations over time**, not raw capture. Therefore
"capture data to its full potential" means *derive richer diagnostics on-device
from input we already process* — never *collect more raw data*. This is what lets
the goal and our privacy bright-lines coexist.

**The litmus test for any signal (hard-coded into the engine):**
> Does it (1) change how we teach *this* child, (2) run on-device / aggregate,
> (3) attach to no PII, (4) expire on schedule, and (5) never feed engagement-
> maximization or any third party? All yes → adopt. Any no → it's surveillance,
> drop it.

**Two architectural lines we never cross:** (a) never persist/transmit raw child
audio (a voiceprint is a COPPA biometric); (b) never create a persistent/cross-
session identifier or a per-child behavioral profile.

---

## 1. The signal catalog (ranked; * = derivable from data we already log)

| # | Signal | What it indexes | Raw fields needed | Status |
|---|---|---|---|---|
| 1 | **Learning curve / mastery trajectory** (AFM/LFA: error-rate over opportunities) | is the skill actually being learned? a flat curve = not learning (or wrong skill def) | correct + skillKey + opportunity index | * derive |
| 2 | **Wheel-spinning** (no mastery within ~10 tries) | stuck → intervene/reroute *before* frustration | correct + skillKey sequence | * derive |
| 3 | **Latency-as-automaticity** (per-skill latency slope) | fluent retrieval vs. effortful-but-accurate (the compensated-dyslexia *rate* deficit); a non-declining slope on accurate items = stalled orthographic mapping | latencyMs + correct, per skill over time | * derive |
| 4 | **Rapid-guess flag + slip/guess** | don't credit lucky-fast taps; don't penalize a fumble on a mastered skill | latencyMs + correct + replays + history | * derive |
| 5 | **Replay-reliance trend** | re-hears trending down = consolidating; staying high = scaffold-dependence on that grapheme | replays per skill over exposures | * derive |
| 6 | **Confusion graph** (per-child) | which wrong grapheme/sound for each target → targeted remediation + early phonological-deficit flag (b/d, vowel swaps) | chosen aggregated per target | * derive |
| 7 | **Retention / forgetting + orthographic-mapping exposure counts** | spaced review at the ~85% recall sweet spot; exposures-to-mastery (1–4 typical, 20+ struggling) | at (timestamp) + exposure counts per skill | * derive (we already have `at`) |
| 8 | **Within-session fatigue** (latency drift + accuracy slip late in session) | depletion, not deficit → end/shorten the session; *don't lower mastery* | latencyMs + correct ordered within session | * derive |
| 9 | **Self-correction / answer-change path** | metacognitive monitoring (age-gated) vs. impulsivity | a pre-commit "selection changed" event | needs UI + 1 event |
| 10 | **Hesitation** (time-to-first-touch, distinct from total latency) | retrieval difficulty vs. motor execution | one extra timestamp | needs 1 field |
| 11 | **RAN / naming-speed** (voice-free timed serial recognition) | one of the two strongest early dyslexia predictors (double-deficit), independent of PA | a new mini-game's per-item latency | = the **screener brick** (planned) |
| — | **Read-aloud prosody** | comprehension beyond automaticity | (voice capture) | **OUT OF SCOPE — never build** (breaches no-voice / no-PII) |

**Verified precedent:** gamified interaction-feature screens (Rello/Dytective, 3,600+
children) detect 80%+ of dyslexic children from click/hit/miss/accuracy features
alone — exactly the kind of signal #1–#8 represent, no PII or voice.

---

## 2. What we already capture vs. derive vs. miss (the audit answer)

- **Capture + use well:** correctness, first-try, skillKey, level/lesson, and —
  a genuine strength most apps throw away — the **specific wrong choice** (`chosen`).
- **Capture but UNDER-derive (the biggest, cheapest wins):** latency (we store it
  but don't compute automaticity slopes/rapid-guess), replays (a counter, not a
  reliance trend), and the whole event stream (we don't compute learning curves /
  wheel-spinning / confusion graph / retention). **These need zero new capture.**
- **Genuinely missing (small additions):** self-correction path (#9, needs a
  pre-commit UI affordance), hesitation timestamp (#10), and a RAN mini-game (#11,
  already the screener brick).

So the headline: **we are leaving high-value signal on the table not by under-
collecting, but by under-*deriving*.** That is exactly the "positions lacking" the
machine must surface.

---

## 3. Engine architecture (mirrors the Freshness Engine, applied to data)

`src/signals/`:
- **`catalog.ts`** — the typed signal catalog (the table above): `{ id, indexes,
  rawFields[], deriveStatus: 'derive'|'needs-capture'|'out-of-scope', ethics }`.
- **`derive.ts`** — pure functions over `SkillEvent[]` (same shape as
  `masteryFromEvents`): `learningCurve`, `wheelSpinning`, `automaticitySlope`,
  `rapidGuess`, `replayReliance`, `confusionGraph`, `retention`, `fatigue`. These
  feed the **tutor dashboard**, the **memory engine** (#122), and the **screener**.
- **`coverage.ts`** — the per-game **signal-coverage map**: for each available
  game, which catalog signals it *can* produce (does it log latencyMs? allow
  self-correction?) vs. which we *actually derive*. The gaps are the report.
- **`vet.ts`** — the **7-gate ethics auto-vetter** (§4) as a pure `vetCapture()`.
- **`signals.test.ts`** — the guard (§5).
- **`docs/coverage/SIGNAL-COVERAGE.md`** — the narrative map + the "data we're
  leaving on the table" report.

**The "see positions lacking" report** (dev/owner-facing): for each game ×
signal, a ✅/⚠️/❌ grid + a ranked list of "high-value signals not yet derived"
and "games missing the substrate they could log" — the literal answer to *where
aren't we absorbing useful data*.

This is the same shape as the Freshness Engine (catalog · coverage map · guard
test · report) — and it can register as a **fifth coverage front** in that engine
(`reading · gaming · compliance · …· signal`) so the quarterly sweep re-audits it.

---

## 4. The 7-gate ethics auto-vetter (every new capture must pass ALL)

Encoded in `vet.ts`; any FAIL blocks the capture or downgrades it to a
derived/ephemeral form.

1. **Classification** — is the raw input COPPA PII (voiceprint/biometric, persistent
   identifier, photo/video/audio of the child, geolocation, contact info)? If it
   would be persisted/transmitted → **BLOCK** unless reducible to a non-PII
   on-device derivative. No persistent/cross-session identifier — ever.
2. **Necessity/purpose** — a *specific named pedagogical purpose* tied to a task the
   child engaged with. "Might be useful later" → FAIL (minimization).
3. **Minimization** — keep raw input **ephemeral** (compute, then drop); persist
   only the derivative. Derive on-device; raw child input never transmits.
4. **Retention** — explicit TTL + deletion path; covered by the published retention
   policy. No indefinite retention.
5. **Sharing/profiling** — any third-party transmission or per-child behavioral
   profile / ad use → BLOCK.
6. **Telemetry safety** (only if ever transmitted) — aggregate-only, differential
   privacy (documented ε), k-anonymity (suppress buckets < k). Never per-child rows.
7. **Transparency / best-interests** — plain-language notice, highest-privacy
   default, no dark-pattern nudging, passes a "serves the *learner* not the
   operator" review.

---

## 5. The guard test (`src/signals/signals.test.ts`)

1. **Substrate coverage** — every available game that *could* produce a Tier-1
   signal logs the raw field it needs (e.g. sequential games log `latencyMs`);
   flag games that emit events but omit derivable enrichment.
2. **Derivation coverage** — every `deriveStatus:'derive'` catalog signal has a
   working `derive.ts` function (no catalog entry without a pipeline).
3. **Ethics gates** — `vetCapture()` unit-tested; plus an `ageGuard`-style source
   scan that fails the build on the never-cross patterns (raw audio persistence,
   `getUserMedia` outside an allowlist, any persistent-identifier/cookie/fingerprint
   API, third-party analytics tags). **So the engine catches drift toward
   surveillance, not just gaps in learning signal.**
4. **Don't-overclaim lint** — the catalog's `indexes` copy must hedge ("behavioral
   signal consistent with"), never assert brain states.

---

## 6. Don't-overclaim rails (baked into copy + model docs)

Never claim to read "brain states" from gameplay (say *behavioral signal consistent
with*). Latency is confounded by touchscreen/motor maturity → always pair with
accuracy, normalize within-child over time, discard implausibly fast/slow taps.
Self-correction is age-gated (under-7s are overconfident — not metacognition). RAN
is a co-equal *screen*, never a diagnosis. Reaction-time variability is suggestive,
never an ADHD claim to families. **A late-session dip is fatigue, not deficit —
never lower a mastery estimate for end-of-session errors.**

---

## 7. The #122 memory-engine wiring (the first consumer)

The memory engine is built but inert; the derived signals make it live:
- **Enroll hook:** `enrollMasteredSkills(learnerId)` inside `markCheckpointPassed`
  (level pass) → mastered skills enter spaced review.
- **Confusion-sync hook:** on session finish, `syncConfusionPairs` sourced from the
  **confusion graph** (signal #6) over the local mastery `confusions` (first-party,
  on-device — no event fetch).
- **Retention drives scheduling:** signal #7 (exposure counts + forgetting) tunes
  which items the Leitner queue surfaces, at the ~85%-recall sweet spot.
- **Consume:** B3's warm-up calls `selectReview` / `recordReview`.
- **Coverage readout:** mastered-but-unenrolled skills, confusions-captured-but-
  unresolved, and per-game empty-enrichment fields — the first slice of the §3
  report.

---

## 8. Phasing (build only after approval)

- **P1 — Derivation layer + catalog** (`src/signals/`): the pure `derive.ts`
  functions + `catalog.ts` over the existing event stream (zero new capture). Wire
  the highest-ROI four — **learning curves, wheel-spinning, automaticity slope,
  confusion graph** — into the tutor dashboard.
- **P2 — Coverage map + guard test + report** (`coverage.ts`, `signals.test.ts`,
  `SIGNAL-COVERAGE.md`): the "positions lacking" machine; register as the Freshness
  Engine's signal front.
- **P3 — Ethics auto-vetter** (`vet.ts` + the surveillance source-scan) hard-gated.
- **P4 — Memory-engine wiring (#122)** consuming retention + confusion-graph signals.
- **P5 — Small new captures** (only if approved): hesitation timestamp (#10),
  self-correction event (#9). **RAN (#11)** rides the screener brick. **Prosody
  stays out of scope, permanently.**

---

## 8a. Data source — DECIDED (Option 2: cloud stream)

The over-time signals (learning curve, retention, automaticity) need the **complete
ordered event history**, which lives only in the cloud `skill_events` (the local
store keeps just last-10 aggregates). Decision: **derive from the cloud stream**
(server-identity-keyed → most accurate, lowest wrong-student risk, fully ethical —
first-party Supabase, RLS, results-only). The child's offline/in-game adaptivity +
the memory engine keep using the **local aggregates** they already have; the rich
longitudinal signals feed the **tutor dashboard** (sign-in expected there). A bounded
local event ring was rejected: a ~200-event cap truncates long history (less
accurate/effective) and a per-learner local store carries higher wrong-student risk
at identity-change moments than server-side identity. **No new local persistence; no
new privacy surface.**

## 9. Decisions for the owner

1. Confirm the **bounded scope**: this is a *learning-signal coverage* engine,
   never a tracking/surveillance system; prosody/voice stays out forever.
2. Confirm **derive-don't-collect** as the default (richer on-device derivations,
   not new raw capture).
3. Confirm the small new captures (hesitation, self-correction) are worth their UI
   cost, or defer them to P5.
4. Build entry point: **P1 (derivation layer)** — pure, testable, zero new capture,
   immediate dashboard payoff.

---

## Sources
Four-agent sweep (2026-06-12): learning-analytics/EDM (Shute stealth assessment,
BKT/DKT, AFM/LFA, wheel-spinning, Wise rapid-guessing, Rello gamified dyslexia
screen) · behavioral-analytics + dark-pattern bright-lines (vanity-vs-actionable
metrics, FTC/ICO dark patterns, cookies/fingerprinting/session-replay never-list) ·
cognitive/brain signals (latency-as-automaticity, RAN double-deficit, vigilance
decrement in 5–7yo, spacing/forgetting, don't-overclaim rails) · children's-data
privacy (COPPA 2025, UK Children's Code, GDPR/FERPA, data-minimization, on-device
derivation, differential privacy, k-anonymity, the 7-gate checklist). Full URLs in
the four agent reports.
```
