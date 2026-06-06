# Role-based dashboards + per-item mastery — design spec

**Date:** 2026-06-06
**Status:** Approved for planning (UI validated via mockups in `.superpowers/brainstorm/`)
**Author:** Learn to Learn Tutoring Solutions / Claude

## Goal

When a **family (guardian)** logs in, they see a warm, read-only dashboard for
their child. When a **tutor** logs in, they see a very different center-wide
management/triage dashboard. Both are powered by a new **per-item skill-mastery
model** that tracks what each student gets right/wrong against the Barton scope &
sequence at their current position, and turns weak spots into **targeted practice
+ plain-language understanding** so students gain control over their own learning.

Validated mockups (saved, persistent):
- `family-dashboard-v2.html` — family view (current level/lesson, week stats,
  **Next up**, **Areas to improve**, recent practice, sticker shelf, home tip)
- `tutor-dashboard.html` — tutor view (KPIs, **Needs attention** triage, roster
  with per-student top focus area + family-link status, class insight, drill-down)
- `areas-to-improve.html` — actionable focus cards (mastery ring + What/Why/How +
  targeted game + "You choose" learner framing)

## Non-goals (YAGNI)

- No messaging/chat between family and tutor in v1 (a "message tutor" button is a
  future idea, not built now).
- No groups/classes, scheduling, or calendar in v1.
- No billing/subscription changes.
- No new game *types* required for v1 — existing games gain per-item logging and a
  `focus` parameter; new games adopt the same interfaces as they're built.

## Architecture

### 1. Identity & roles
- Two authenticated roles: `tutor` (exists) and `guardian` (new).
- **Decision:** separate `guardians` table (mirrors `tutors`) + a
  `guardian_learners` join table. **Many-to-many**: a guardian may have multiple
  children; a child may have multiple guardians.
- Role is also written to Supabase auth user metadata at signup/invite so routing
  resolves instantly without an extra round-trip; the table is the source of truth.
- Role resolution: on auth, look up the user id in `tutors` then `guardians`;
  render the matching dashboard. (Helper: `currentRole()` in `src/data/cloud.ts`.)

### 2. Family linking — email invite
- Tutor UI: **"✉ Invite family"** → enter email + select student(s) at the center.
- Server: a Supabase **Edge Function** `invite-guardian` (holds the service role;
  never the client). It (a) verifies via the caller's JWT that they are a tutor of
  the center, (b) calls `auth.admin.inviteUserByEmail(email, { data: { role:
  'guardian', center_id, learner_ids } })`, (c) inserts a `guardian_invites` row
  (email, learner_ids, center_id, status='pending', invited_by).
- Acceptance: the family clicks the invite link, sets a password, and lands in the
  app. The existing `handle_new_user` signup trigger is extended: if
  `raw_user_meta_data.role = 'guardian'`, create the `guardians` row and the
  `guardian_learners` links from `learner_ids`, and mark the matching invite
  `accepted`.
- **Operated by the user (cannot be done/tested by Claude):** deploy the edge
  function (`supabase functions deploy invite-guardian`); ensure Supabase Auth
  email sending is enabled (default works for testing; SMTP for production).
  Claude cannot create accounts or sign in (safety rules), so the user verifies
  the end-to-end invite.

### 3. Privacy (RLS)
- `guardians`: a guardian may `SELECT` only their own row.
- `guardian_learners`: a guardian sees only rows where `guardian_id = auth.uid()`.
- `learners` / `sessions` / `mastery` / `achievements`: guardians may `SELECT`
  only rows for learners they are linked to (policy joins `guardian_learners`);
  **no** insert/update/delete for guardians (read-only).
- Tutors retain today's center-scoped policies. No client holds the service key.

### 4. Per-item mastery model

**Skill-key taxonomy** — granular, derived from the captured curriculum
(`src/curriculum.ts`) plus a small set of known confusions. Defined in a new
`src/mastery/skills.ts`. Examples of the key scheme:
- `sound:first:b`, `sound:last:m` — a phoneme in a position
- `letter:b` — grapheme↔sound
- `vowel:a-short`, `vowel:i-short`
- `digraph:sh`, `digraph:ck`
- `confusion:b-p`, `confusion:i-e` — explicit, high-value confusions
- `blend:final`, `blend:initial`
- `rule:floss`, `rule:c-k`, `rule:ck`, `rule:tch` — Level 3+ named rules

Each skill key carries: a human label, the level/lesson it is introduced at
(for "at/below current position" scoping, via `soundsThrough`), and the skill
tag(s) it relates to.

**Per-item events** — every game emits one result per presented item:
`{ learnerId, skillKey, correct: boolean, level, lesson, gameId, ts }`.
Phase 1 wires the two live games (Sound Safari, Last Sound Standing); each item's
target sound/position maps to a skill key. New games adopt the same emit call.

**Storage decision:** aggregated **mastery rows** are the source of truth — one
row per `learner × skillKey`: `{ attempts, correct, scoreRolling, lastSeen }`.
- Local: a `mastery` store (localStorage/IndexedDB) updated on each item, mirroring
  the offline-first pattern used by `sessionLog`/`progress`.
- Cloud: a `mastery` table (learner_id, skill_key, attempts, correct, score,
  updated_at), upserted on sync (same fire-and-forget path as `cloudSync`).
- A raw per-event log (`skill_events`) is **deferred** (future deep analytics);
  the spec keeps the emit interface compatible so it can be added without rework.

**Scoring (concrete, v1):**
- `scoreRolling` = accuracy over the last `K=10` attempts of that skill, recency-
  weighted (more recent answers weigh more).
- A skill is **rated** once `attempts >= 5`.
- **Needs improvement** = rated AND `scoreRolling < 0.8`, restricted to skills
  introduced at/below the learner's current lesson.
- Rank weak skills by `(1 - scoreRolling)` × a recency factor; take the top 3.
- Outputs:
  - Family **Areas to improve** = top 3 weak skills (gentle labels).
  - Learner **What should I practice** = same list, "You choose" framing.
  - Tutor roster **Top focus area** = the single weakest skill per student.
  - Tutor **Class insight** = most common weak skill across the center this week.
  - **Next up** (family) is curriculum-derived (next lesson → next level), not
    mastery — read straight from `curriculum.ts`.

### 5. Closing the loop — targeted practice + understanding
- **Skill → game registry** (`src/mastery/skill-games.ts`): maps each skill key to
  a game id + a `focus` value. Games accept an optional `focus` query param
  (e.g. `#/play/beginning-sounds?focus=confusion:b-p`); the round generator biases
  item selection toward that skill (extends the existing anti-pattern generation).
- **Skill-help content** (`src/mastery/skill-help.ts`): our own What / Why / How +
  an at-home tip per skill key (never Barton's copyrighted scripts). Powers the
  expandable focus cards on both the family view and the learner "What should I
  practice?" panel.

### 6. Role-based routing & navigation
- `App` resolves role → renders `FamilyDashboard` (guardian) or the center-wide
  `TutorHome` (tutor). Today's `TutorDashboard` (single student) becomes the
  tutor's **drill-down** (`#/student/<id>`), reached from the roster's "View ▸".
- The burger drawer adapts per role:
  - Guardian: Dashboard · My Child · Games · Profile
  - Tutor: Dashboard · Students · Levels · Games · Profile
- Family dashboard supports a **child switcher** when a guardian has >1 linked
  student.
- The learner "What should I practice?" panel is reachable from the play flow so
  the student can self-direct.

### 7. Local fallback
- With no Supabase configured, the app stays in today's local single-user mode
  (no role split) so dev/demo keeps working. Phase 1 (mastery) is fully local and
  needs no auth. The role split activates only when signed in to the cloud.

## Phasing (each phase is independently shippable)

**Phase 1 — Mastery foundation (local, no auth).** Skill taxonomy + per-item
logging in the two live games + local mastery store + scoring + the "Areas to
improve / Next up / What should I practice" UI + targeted-game `focus` param +
skill-help content. Delivers visible value with zero backend dependency.

**Phase 2 — Roles & Family dashboard (cloud).** `guardians` + `guardian_learners`
+ RLS; role resolution + routing; the cloud `mastery` table + sync + RLS (so a
guardian on their *own* device sees real data — the student plays elsewhere);
FamilyDashboard wired to cloud mastery; the `invite-guardian` edge function +
tutor invite UI + `handle_new_user` trigger extension.

**Phase 3 — Tutor center-wide dashboard.** Roster + Needs-attention triage + class
insight + per-student top focus, all reading the synced cloud `mastery`; "View ▸"
drill-down into the existing single-student page.

## Data model summary (cloud additions)

- `guardians (id uuid pk = auth.uid, center_id, name, email, created_at)`
- `guardian_learners (guardian_id, learner_id, created_at, pk(guardian_id, learner_id))`
- `guardian_invites (id, center_id, email, learner_ids uuid[], status, invited_by, created_at)`
- `mastery (learner_id, skill_key text, attempts int, correct int, score real, updated_at, pk(learner_id, skill_key))`
- RLS policies as in §3. `handle_new_user` extended for the guardian branch.

## Risks / things to verify
- Edge function deploy + Supabase email config are user-operated and untestable by
  Claude; the invite flow must be verified by the user end-to-end.
- Skill-key coverage: only skills the live games exercise get data in Phase 1
  (mostly Level 1–2 sounds). Areas-to-improve is sparse until more games log items.
- Mastery scoring thresholds (`K=10`, `>=5` attempts, `<0.8`) are first-pass and
  tunable after real data appears.
