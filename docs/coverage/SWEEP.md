# Quarterly Coverage Sweep — Playbook

**You are here because the coverage gate went RED** (`coverage.test.ts` #1), or 90
days have passed since `COVERAGE_META.lastReviewed`. That is the forcing function
working as designed — **run the sweep; do not delete the test.**

> Cadence: **quarterly (90 days)**. The sweep runs autonomously in the background
> and produces a **findings report for the owner**. Nothing is merged, applied, or
> deployed until the owner reviews and approves. The assistant never deploys.

## Procedure

1. **Spawn the research roster** (each tasked: *what's new since `lastReviewed`?*,
   diff against `src/coverage/coverage.ts`, emit added/changed components + sources):
   - **Reading (4):** frameworks/science-of-reading · dyslexia/Orton-Gillingham ·
     fluency-vocabulary-comprehension · neurodivergence/psychology.
   - **Gaming (4):** fun/flow/game-feel · design-frameworks/player-psychology ·
     mobile/social/online-vs-local · child-vs-adult ethics/exemplars. The ethics
     agent also delivers a **standing human ethics audit** of the *current* design
     (does any mechanic read as a dark pattern now?) — the safety net the keyword
     scan can't be.
   - **Compliance (1):** COPPA / Children's Code / GDPR-K / FERPA + state laws —
     what changed, does our posture still satisfy it (flag time-bound items, e.g.
     the COPPA **2026-04-22** deadline).
   - **Meta (1):** the **red-team gap-hunter** — find structural blind spots /
     unknown-unknowns ("what category is entirely absent?"); horizon-scan adjacent
     fields and under-served populations (co-occurring conditions, AI tutoring) +
     the in-scope frontier of **English reading depth** (comprehension: vocabulary +
     language structures). **Respect recorded scope boundaries** — ELL/multilingual
     is a deliberate `out-of-scope` decision (`r-ell-multilingual`); do NOT re-flag
     it. Re-audit the meta-domain list + framework registry; critique the
     thoroughness of this sweep's own prompts.

2. **Diff & draft.** For each finding: add/update a `CoverageComponent`, attach ≥2
   sources for any `covered` claim (triangulation), append new authorities to
   `FRAMEWORKS`. Single-source rows downgrade to `partial`.

3. **Owner report → approval.** Produce a ranked findings report. On approval:
   - update the three narrative maps + `coverage.ts`;
   - bump `COVERAGE_META.lastReviewed` (and `coverageVersion` on material change);
   - append `docs/coverage/CHANGELOG.md` (provenance);
   - gate goes green; new gaps become tracked build tasks if warranted;
   - append findings to the memory KB for cross-session provenance.

## Emergency valve (bounded, never silent)

If a sweep genuinely can't run in time (hotfix in flight, slow review), add a
`sweep` entry to `COVERAGE_META.acknowledgedDefers` with a `reason`, `by`, `at`,
and an `until` within `maxDeferDays` (30). The gate prints the deferral and passes
until `until`; a malformed or over-cap defer still fails. The override is recorded
and expires — it is visible, not a silent skip.

## Ask before removal (walk the line)

The ethics scan never auto-removes a finding — it **asks**. A red ethics gate means
a flagged pattern needs an owner decision:
- **Hard lines** (mic/camera capture, push notifications) always fail — no consent path.
- **Engagement greys** (streak/decay/loot/countdown/FOMO): the owner either records a
  KEEP decision in `src/coverage/ethicsReview.ts` (a legit white-hat lever, with a
  reason) or approves a removal that a human makes. Maximize evidence-based engagement
  right up to — never across — the ethical line.

## Status

- **P1 (done):** manifest + maps + guard tests #1,2,3,4,5,9,10 — *the cadence is now enforced.*
- **P2 (done):** ethics-as-tests source scan (#6) + walk-the-line tracking (#7) +
  the ask-before-removal consent ledger (`ethicsReview.ts`).
- **P3 (done):** this playbook is now an executable **`/coverage-sweep`** command
  (`.claude/commands/coverage-sweep.md`, guarded by a test) that runs the roster and
  produces an owner-approval report — report-first, ask-before-removal. The
  build-time staleness tripwire (test #1) is the schedule guarantee; an optional
  CronCreate routine can add a proactive quarterly reminder.
- **P4:** decodability invariant (#8) when the connected-text engine ships broadly.
