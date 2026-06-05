# Backend + Accounts — Scope (center-wide data)

Goal: make the leaderboard + tutor dashboards span the whole center across devices,
behind tutor accounts — **without changing any game code**. The three client modules
`profiles.ts`, `progress.ts`, `sessionLog.ts` are the only data write-points, so a sync
layer hooks in there.

## Recommended stack
**Supabase** (managed Postgres + Auth + Row-Level Security + auto REST/Realtime JS client).
- Relational data (center → tutor → student → session) fits Postgres cleanly.
- Built-in auth (email/magic-link) + RLS gives per-center privacy with little code.
- Generous free tier; a JS client drops straight into our write-points.
- Alternatives: Firebase (easy realtime, NoSQL modeling, lock-in) · custom Node/Workers +
  Neon Postgres (most control, most work). Recommend Supabase for speed + fit.

## Data model (Postgres)
- `centers` (id, name)
- `tutors` (id = auth user, center_id, name, role: owner|tutor)
- `learners` (id, center_id, display_name **first name / initials only**, color, archived)
- `sessions` (id, learner_id, game, level, lesson, started_at, ended_at, duration_ms,
  rounds, items, wrong_attempts, accuracy) — mirrors `SessionRecord`
- `achievements` (learner_id, achievement_id, earned_at) — mirrors earned ids
- Stats (best time, sessions count) are derived via a view/query (or a small
  `learner_stats` view), not stored.

## Access / queries
- Auth: tutor signs in; students are records under the center (no student logins).
- Writes: `sessions` insert on finish (the only hot path) + learner CRUD.
- Reads: leaderboard (top by stickers / fastest / most games **within center**),
  dashboard (a learner's sessions + aggregates).
- **RLS**: every row scoped by `center_id`; a tutor sees only their center.

## Privacy (kids' data — important)
- Minimal student PII: first name or initials + opaque id. No emails/DOB for students.
- The tutor/center is the data controller; consent handled by the center offline.
- Provide export + hard delete (we already have local export/clear).
- Show initials/avatars on any kid-facing leaderboard.
- ⚠️ Confirm COPPA/FERPA obligations with counsel — we minimize data + support deletion,
  but the center owns the compliance call.

## Migration path (no game code changes)
1. Introduce a `DataAdapter` interface; two impls: `localAdapter` (today's localStorage)
   and `cloudAdapter` (Supabase). `profiles/progress/sessionLog` call the adapter.
2. Offline-first: keep writing locally; queue + sync to cloud when signed in/online.
3. Phase 1: tutor login + learners + sessions → cloud; dashboard/leaderboard read cloud.
4. Phase 2: realtime leaderboard, exports, retention controls.

## What I can / can't do
- I CAN: design the schema + RLS SQL, build the `cloudAdapter`, the sign-in UI, and wire it.
- I CANNOT (safety): create the Supabase project, enter/store secret keys, or accept ToS.
  You create the project and share the **public** project URL + anon key (safe in env);
  any service-role secret stays server-side / in env, never committed.
