---
description: Run the quarterly Freshness Engine coverage sweep (reading · gaming · compliance) and produce an owner-approval report. Never applies changes without approval.
---

You are running the **quarterly coverage sweep** for the Learn-to-Learn phonics
platform. This keeps the app provably current on reading science, game-design
science, and child-privacy regulation. Follow `docs/coverage/SWEEP.md` exactly.

## Hard rules (do not violate)
- **Report first, never auto-apply.** Produce a findings report for the OWNER. Do
  NOT edit `src/coverage/coverage.ts`, the maps, or any code until the owner
  approves specific findings. You do not deploy.
- **Ask before removal (walk the line).** If the sweep flags an existing mechanic as
  a possible dark pattern, surface it — do NOT remove it. The owner decides keep
  (record in `src/coverage/ethicsReview.ts` with a reason) vs. remove. Hard lines
  (mic/camera capture, push notifications) are non-negotiable.
- **Triangulate.** A component is `covered` only with ≥2 independent, citable
  sources; single-source → `partial`.

## Steps
1. **Read the current state:** `src/coverage/coverage.ts` (`COVERAGE_META.lastReviewed`,
   the component lists, the `FRAMEWORKS` registry) and the three `docs/coverage/*-COVERAGE.md` maps.
2. **Spawn the research roster** (each asked: *what's new since `lastReviewed`?* — new
   papers, frameworks, rulings — then diff against the manifest):
   - Reading ×4: science-of-reading/frameworks · dyslexia/Orton-Gillingham ·
     fluency-vocabulary-comprehension · neurodivergence/psychology.
   - Gaming ×4: fun/flow/game-feel · design-frameworks/player-psychology ·
     mobile/social/online-vs-local · child-vs-adult ethics/exemplars. The ethics
     agent ALSO runs a standing human audit of our *current* design: does any live
     mechanic read as a dark pattern now?
   - Compliance ×1: COPPA / UK Children's Code / GDPR-K / FERPA + US state laws —
     what changed, does our posture still satisfy it, flag time-bound items.
   - Meta ×1 — **red-team gap-hunter:** what whole category is absent? Horizon-scan
     adjacent fields + under-served populations (ELL/multilingual/biliteracy,
     co-occurring conditions, AI tutoring); re-audit the meta-domain list + framework
     registry; critique the thoroughness of these very prompts.
   (If sub-agents aren't available, do the dives sequentially yourself.)
3. **Diff & draft** added/changed components, new sources, new authorities, and any
   ethics findings. Rank by impact + stakes (regulation deadlines first).
4. **Owner report:** present the ranked findings + proposed manifest edits. STOP and
   wait for approval. On approval only:
   - update the maps + `coverage.ts`; bump `COVERAGE_META.lastReviewed` (and
     `coverageVersion` on material change);
   - append `docs/coverage/CHANGELOG.md`; run the gate (tsc/eslint/vitest/build);
   - new gaps become tracked tasks; append findings to the memory KB.

The build-time staleness tripwire (`coverage.test.ts` #1) is the guarantee; this
command is the legwork. A missed run can't slip past — the gate is already red.
