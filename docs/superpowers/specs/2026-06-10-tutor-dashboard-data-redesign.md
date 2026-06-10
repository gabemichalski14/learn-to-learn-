# Tutor Dashboard — data redesign (mastery-first)

Status: approved 2026-06-10. Scope: redesign the Tutor Dashboard (`#/tutor`)
data presentation. Parent + Admin views follow later, reusing the same engine.

## Problem
The current dashboard leads with a per-session **accuracy line** + **time-per-
session bars**. For young learners, per-session accuracy is noisy, so the line
reads as random zig-zags ("weird/awkward"). It also makes the tutor do all the
interpreting, and the organizing unit (the session) isn't what a Barton tutor
acts on.

## Principles (from the deep-dive)
1. Audience-first: the tutor's one question is "what do I teach next, and is the
   last thing sticking?"
2. Lead with the answer (BLUF), not the chart.
3. The actionable unit is the **skill/sound**, not the session — Barton is
   mastery-based + cumulative.
4. Growth = **count of sounds mastered climbing** (monotonic → never zig-zags →
   no shame, always positive).
5. Demote time-on-task to a stat. Progressive disclosure, no data-dump.
6. No-shame framing: "Ready to practice", never red "failing".

## Layout (top → bottom)
1. **Header** — student picker + name + "last played · N days active" (kept).
2. **Insight banner** (new, BLUF) — one warm sentence from mastery, e.g.
   "Beginning sounds are solid — ready to focus on ending sounds."
3. **Calm stat strip** — Sounds mastered (with "+N this week") · Avg accuracy ·
   This week (mins / sessions) · Stickers. No charts.
4. **Work on next** (hero) — the single top focus sound + the *why* in plain
   words (re-heard often / slower responses) + a "practice this" CTA.
5. **Sound map** (core, replaces the accuracy line) — every sound grouped by
   Barton level/lesson; each a chip: Mastered / Practicing / Ready to start. Tap
   → recent ✓/✗ attempts.
6. **Coaching tip** — keep `TutorPip`.
7. **Engagement** (demoted) — quiet line "~Xm/session · Ym this week · Z-day
   streak" + small 14-day activity dots. Time-per-session bars removed; accuracy
   line removed.

## Data (no new collection)
- Map / states / insight / work-next ← `masteryFromEvents(skill_events)` +
  `skillInsights` / `rankAreas`, grouped via `levelCurriculum` / skill→level map.
- "Sounds mastered" = skills with score ≥ mastery threshold (existing model).
- "+N this week" = mastered count now vs from events ≥7 days ago.
- KPIs ← `sessions`; per-skill attempts ← `skill_events`.
- Removed: `AccuracyChart`, `TimeChart`.

## States
- No sessions yet → friendly empty ("A few rounds and the sound map fills in").
- A skill with <N attempts → "Ready to start" (not judged).

## Reuse / boundaries
Reuses the mastery engine + `TutorPip`. The insight + mastery-grouping helpers
should be small pure functions (testable, and reusable by the future Parent
"story" view and Admin roll-up).

## Out of scope (later)
Parent simplified story; Admin cross-student roll-up; a cumulative-mastery
sparkline (the "+N this week" stat covers momentum for now).
