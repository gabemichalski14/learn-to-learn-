# Richer data collection + personalization

Status: approved 2026-06-10. Build the tracking gaps into both **collection** and
**personalization**, in phases (each gated + committed). Privacy guardrail
(hard): results only — no child PII, never capture child audio/voice.

## What we collect today
- `skill_events`: { learner_id, skill_key, correct, game, at } (+ center_id).
- `sessions`: accuracy, duration, rounds, items, wrong_attempts, level, lesson.
- Local-only (never synced): response time (avgMs), re-hear count (replays).

## Target signals
1. **Confusion pair** — the *chosen* wrong answer vs the correct one (b/d
   reversal, e/i vowel confusion…). Highest instructional value.
2. **First-try correctness** — right on the first attempt vs after a re-hear/retry.
3. **Latency (ms)** + **re-hears**, in the cloud (automaticity + uncertainty).
4. **Curriculum tag** (level/lesson) on each event → align mastery to the Barton
   sequence.
5. **Retention / regression** — mastered-but-stale (re-test) + recent dips.
   Computable from existing timestamps/score — no new collection.
6. **Abandoned / struggled sessions** — quit mid-way; frustration signal.
7. **Tutor note** — qualitative per-student context.

## Phases
- **P1 — Retention & regression (no collection change).** Compute from the
  existing mastery map (score + lastSeen + recent[]): "keep fresh" (mastered,
  not seen in ~10d) and "slipping" (recent dip). Surface on the Tutor Dashboard.
  Feeds personalization later (bias review toward stale/slipping skills).
- **P2 — Richer event schema + plumbing.** Add nullable columns to
  `skill_events`: `chosen text`, `first_try bool`, `latency_ms int`,
  `replays int`, `level int`, `lesson int`. Extend SkillEvent type + the
  cloud/local logging path (all optional → back-compatible). Migration runs once.
- **P3 — Emit from games.** Each game's per-item log passes chosen / first_try /
  latency / replays / level / lesson (TapItOut, SpaceSort, SwitchIt, StarStation,
  SameOrDifferent…), one game at a time.
- **P4 — Personalization.** Confusion aggregation per learner → "reverses b/d" +
  bias round generation toward confused contrasts; first-try + latency refine the
  mastery score (truer fluency); retention/regression bias cumulative review.
- **P5 — Surface.** Tutor dashboard: confusions, retention/"keep fresh", fluency
  (fast+sure vs effortful). Parent + Admin read the same engine.
- **P6 — Abandonment + tutor notes.** Log quit sessions; a per-student note field
  (small table/column + UI).

## Design boundaries
- All new aggregation lives in pure, tested helpers (`dashboardData.ts` +
  a `personalization` module) reused across tutor/parent/admin.
- Schema columns nullable so older clients + existing rows keep working.
- Personalization changes to round generation must stay deterministic-in-render
  (no Math.random/Date.now in render) and respect the no-shame rule.

## Out of scope
Voice/audio capture (forbidden); per-word item logging (skill grain is enough
for now); cross-center benchmarking.
