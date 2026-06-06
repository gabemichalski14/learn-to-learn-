# Design — Tutor & Parent Data Pipeline (cross-device)

- **Date:** 2026-06-06
- **Status:** Approved (first iteration)
- **Author:** Learn to Learn / barton-games

## 1. Context & goal

The audit found the app is local-first and single-device. Cloud sync is **write-only**
(session summaries are pushed to Supabase when a tutor is signed in) and **no screen
reads cloud data back**; the rich **per-skill mastery** model is never synced; and there
is **no parent/guardian role**. As a result, a tutor on a second device sees nothing and
parents have no access.

**Goal:** track *all* a student's data (sessions **and** per-skill mastery) and surface it
to **both tutors and parents on any device**, with one canonical record per child that
stays correct even though kids practice in two places (center + home).

## 2. Decisions (locked)

1. **Usage model — both places.** Kids play at the center *and* at home. One canonical
   cloud `learners` row per child; any signed-in device (tutor or guardian) reads/writes it.
2. **Linking — email magic-link invite.** A tutor invites a parent by email; the parent
   signs up/in via the link and is linked to the child as a guardian.
3. **Mastery sync — event-sourced.** Every answered item is logged to the cloud as an
   append-only row; progress is computed from history (no data loss across devices; richer
   trends).
4. **Mastery compute — client-side, reuse existing math.** Dashboards fetch recent answer
   events and run the existing `scoreOf` / `areasToImprove`. One scoring implementation.
5. **Center-device priority (operator note):** the center uses one shared device for many
   students, and the tutor must select the right student *fast* and never mis-log. The
   active-learner picker is built for this case (see §7).

**Defaults agreed:** guardians are **read-only** on the child's profile and data (their
device can still *record* their child's play); **many-to-many** guardians↔learners
(siblings and co-parents); "confirm student when a game starts" toggle exists but is **off
by default**.

## 3. Scope & decomposition

Two connected sub-projects, built in order. Each ships independently.

- **SP1 — Close the tutor loop (cross-device):** schema (`skill_events` + integrity
  trigger), event outbox + sync, cloud-reading dashboards (local fallback), center-friendly
  active-learner picker. Outcome: a tutor sees any student's full progress on any device.
- **SP2 — Parents:** `guardians` + `guardian_invites` + guardian RLS, invite/redeem edge
  functions, read-only parent dashboard. Outcome: invited parents see their own child.

This spec covers the whole pipeline; the implementation plan sequences SP1 then SP2.

## 4. Architecture & data flow

- **Identity:** the cloud `learners` row (uuid) is the shared identity. Every device reads
  and writes that `learner_id`.
- **Roles (Supabase Auth, email):** *tutors* (own a center, see all its learners) and
  *guardians* (linked to specific learners only).
- **Writes are append-only**, so "both places" merges with zero conflict:
  - one `skill_events` row per answered item,
  - one `sessions` summary row on finish,
  - `achievements` upserts.
  These write to the cloud `learner_id` whenever the player's device is signed in.
- **Reads:** dashboards read from the cloud when signed in (tutor → center roster; guardian
  → linked learners), and compute mastery client-side from recent `skill_events`. Local
  storage remains the offline cache and the no-account local mode (today's behavior intact).
- **Linking:** tutor → `invite-guardian` edge function (writes invite + emails link) →
  parent signs up/in → `redeem-invite` edge function (validates token, creates `guardians`).

## 5. Schema additions (`supabase/schema.sql`)

```sql
-- many-to-many parent/guardian <-> learner (siblings + co-parents)
create table if not exists guardians (
  guardian_id uuid not null references auth.users (id) on delete cascade,
  learner_id  uuid not null references learners (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (guardian_id, learner_id)
);
create index if not exists guardians_learner_idx on guardians (learner_id);

-- pending email invites (touched only by edge functions / service role)
create table if not exists guardian_invites (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references learners (id) on delete cascade,
  center_id   uuid not null references centers (id) on delete cascade,
  email       text not null,
  token       text not null unique,
  invited_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '14 days',
  redeemed_at timestamptz
);
create index if not exists guardian_invites_learner_idx on guardian_invites (learner_id);

-- append-only per-answer log (powers cross-device mastery)
create table if not exists skill_events (
  id         uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners (id) on delete cascade,
  center_id  uuid not null references centers (id) on delete cascade,
  skill_key  text not null,
  correct    boolean not null,
  game       text,
  at         timestamptz not null default now()
);
create index if not exists skill_events_learner_idx on skill_events (learner_id, at desc);

-- helper: is the signed-in user a guardian of this learner?
create or replace function is_guardian_of(l uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from guardians g where g.learner_id = l and g.guardian_id = auth.uid())
$$;

-- integrity: stamp center_id from the learner row so a client can never spoof it
create or replace function stamp_center_from_learner() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  select center_id into new.center_id from learners where id = new.learner_id;
  return new;
end;
$$;
drop trigger if exists sessions_stamp_center on sessions;
create trigger sessions_stamp_center before insert on sessions
  for each row execute function stamp_center_from_learner();
drop trigger if exists skill_events_stamp_center on skill_events;
create trigger skill_events_stamp_center before insert on skill_events
  for each row execute function stamp_center_from_learner();
```

## 6. RLS (security-critical)

Access to a learner **L** = `L.center_id = current_center_id()` **OR** `is_guardian_of(L.id)`.
RLS checks key off `learner_id` (client-stable), not the stamped `center_id`, to avoid any
trigger/ordering coupling.

```sql
alter table guardians       enable row level security;
alter table guardian_invites enable row level security;
alter table skill_events    enable row level security;

-- learners: SELECT center-or-guardian; profile writes center-only (guardians read-only)
drop policy if exists "learners by center" on learners;
create policy "learners read"   on learners for select using (center_id = current_center_id() or is_guardian_of(id));
create policy "learners insert" on learners for insert with check (center_id = current_center_id());
create policy "learners update" on learners for update using (center_id = current_center_id()) with check (center_id = current_center_id());
create policy "learners delete" on learners for delete using (center_id = current_center_id());

-- sessions: SELECT + INSERT for center-or-guardian of the learner (append-only)
drop policy if exists "sessions by center" on sessions;
create policy "sessions read"   on sessions for select using (center_id = current_center_id() or is_guardian_of(learner_id));
create policy "sessions insert" on sessions for insert with check (
  exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id())
  or is_guardian_of(learner_id));

-- skill_events: same shape (append-only)
create policy "skill_events read"   on skill_events for select using (center_id = current_center_id() or is_guardian_of(learner_id));
create policy "skill_events insert" on skill_events for insert with check (
  exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id())
  or is_guardian_of(learner_id));

-- achievements: SELECT + upsert for center-or-guardian of the learner
drop policy if exists "achievements by center" on achievements;
create policy "achievements read"  on achievements for select using (
  exists (select 1 from learners l where l.id = learner_id and (l.center_id = current_center_id() or is_guardian_of(l.id))));
create policy "achievements write" on achievements for all using (
  exists (select 1 from learners l where l.id = learner_id and (l.center_id = current_center_id() or is_guardian_of(l.id))))
  with check (
  exists (select 1 from learners l where l.id = learner_id and (l.center_id = current_center_id() or is_guardian_of(l.id))));

-- guardians: a guardian sees own links; a tutor sees links for their center's learners;
-- links are CREATED only by the redeem edge function (service role). A guardian may unlink self.
create policy "guardians self read"   on guardians for select using (guardian_id = auth.uid());
create policy "guardians center read" on guardians for select using (
  exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id()));
create policy "guardians self unlink" on guardians for delete using (guardian_id = auth.uid());

-- guardian_invites: tutor may read pending invites for their center's learners;
-- create/redeem handled by edge functions (service role bypasses RLS).
create policy "invites center read" on guardian_invites for select using (
  exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id()));
```

`learner_stats` is unchanged: it is `security_invoker`, so it automatically respects the new
`learners`/`sessions` SELECT policies — a guardian sees only their own children in it.

**Isolation guarantee:** a guardian has no center membership, so center-scoped rows never
leak to them — they can touch only learners they're explicitly linked to. Tutors still
cannot cross centers.

## 7. App side

### 7.1 Identity reconciliation (local ↔ cloud)
- `Learner` gains an optional `cloudId`.
- On sign-in, the app pulls accessible learners (tutor → center roster via
  `cloud.listLearners`; guardian → linked learners) and reconciles them into the local
  profile list with `cloudId` set. The existing `ll-cloudmap` continues to map
  locally-created learners to their cloud id (offline-created → upsert on first sync).
- Gameplay writes events/sessions/achievements to `cloudId`. With no sign-in (or Supabase
  unconfigured), everything stays local — current behavior preserved.

### 7.2 Active-learner selection (center-friendly) — data-integrity linchpin
- Tutor signs in once on the center device and stays signed in; the app loads the center's
  full roster.
- A persistent **"Now playing: <avatar> <name> ▾"** bar on Home and game-launch screens.
  Tapping opens a **full-screen student picker**: large avatar cards (color + initials +
  name), **sorted by most-recently-active**, with a **search box once the roster is large**
  (> ~12). One tap selects and returns.
- The **active student's name + avatar stays visible during play** (a chip in the game HUD)
  so a tutor instantly notices a wrong selection.
- Optional center setting **"confirm student when a game starts"** (one-tap confirm), **off
  by default**.
- On a parent device the same picker shows only their 1–3 children.

### 7.3 Event-sync layer (durable outbox)
- New `src/data/outbox.ts`: a durable local queue (localStorage) of pending cloud writes
  (`skill_events`, `sessions`, `achievements`). Flushes when online **and** signed in, with
  retry/backoff. Append-only ⇒ flush order is irrelevant and both locations merge cleanly.
- Per-item results: at the game **call site** (the existing `onItemResult` callback), the
  app records locally via `recordItem` (unchanged, cloud-agnostic) **and** enqueues a
  `skill_events` row to the outbox. `logSession` enqueues the session (replacing today's
  direct fire-and-forget push). The outbox resolves the local learner id → `cloudId` at
  flush time. All guarded — a cloud problem never blocks play.

### 7.4 Cloud-reading dashboards
- New `src/data/dataSource.ts`: returns a learner's `sessions` and `skill_events` from the
  **cloud when signed in, local otherwise**.
- New `masteryFromEvents(events)` folds `skill_events` into the existing `MasteryMap` shape
  (attempts/correct/recent window), then reuses `scoreOf` / `areasToImprove` unchanged.
- `TutorDashboard`, `ProfilePage`, `Leaderboard` consume `dataSource` (KPIs/charts from
  sessions; areas-to-improve from events). Offline/local mode looks identical to today.

### 7.5 Parent role
- **Invite (tutor):** "Invite parent" on a student in the tutor dashboard → `invite-guardian`
  edge function. Caller must be a tutor of the learner's center (verified server-side). Writes
  a `guardian_invites` row with a random token and emails a magic link to a redeem URL
  carrying the token.
- **Redeem (parent):** the link opens the app → parent signs up / signs in → `redeem-invite`
  edge function validates the token (exists, not expired, not redeemed, email matches the
  authenticated user) and inserts the `guardians` link, marking `redeemed_at`. Returns the
  child summary.
- **Parent dashboard** (`FamilyDashboard.tsx`): reuses the existing dashboard components
  (KPIs, accuracy/time charts, areas-to-improve, session history) **scoped to the linked
  child(ren), read-only**. Routing detects a guardian (no center / has guardian links) and
  lands them here.

## 8. Error handling & offline
- All cloud calls are **fire-and-forget + guarded** (today's pattern). Cloud failure →
  degrade to local; never break or block play.
- The outbox persists across reloads and flushes opportunistically; bounded size with
  oldest-first drop as a safety valve (matches the session-log 1000 cap philosophy).
- `localStorage` access stays `try/catch`-wrapped (Safari private mode safe).

## 9. Testing
- `outbox` queue: enqueue/flush/retry/idempotency with a mocked client.
- `masteryFromEvents`: equivalence with the local `recordItem` fold (same scores for the
  same sequence).
- `dataSource`: cloud-vs-local switch with a mocked Supabase; offline fallback.
- Identity reconciliation: cloud roster merges into profiles with `cloudId`.
- RLS reasoning documented inline in `schema.sql`; edge-function token validation unit-tested.
- Existing mastery/session tests remain unchanged.

## 10. What the operator (you) sets up in Supabase
The assistant cannot create accounts or deploy. You will:
1. Run the updated `supabase/schema.sql` in the SQL editor.
2. Enable **Email** auth and configure an **SMTP sender** (custom SMTP for production; the
   built-in email has low rate limits).
3. Deploy the two **edge functions** (`invite-guardian`, `redeem-invite`) — code provided in
   the implementation plan.
4. Add the **redeem redirect URL** to the allowed auth redirect URLs.
5. Keep only the **anon/publishable** key + URL in the client `.env.local` (gitignored). The
   `service_role` key lives only in the edge-function environment and must never be committed.

## 11. Out of scope (future iterations)
- Time-windowed / materialized stats and `skill_events` roll-up jobs (only needed at large
  scale; indexes + recent-window fetch suffice now).
- Tutor-settable placement / lesson-scoped areas-to-improve (Phase 3).
- Push notifications / email progress digests to parents.
- Removing the legacy `playful/l2l/clean` themes + ThemeSwitcher (tracked separately).

## 12. Resolved assumptions
- Guardians read-only on profile/data; their device may record their child's play.
- Many-to-many guardians↔learners (siblings, co-parents).
- "Confirm student on launch" exists, default off.
- Cloud is the merge point; local remains offline cache + no-account mode.
