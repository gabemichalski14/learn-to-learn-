-- Learn to Learn — center-wide schema for Supabase (Postgres + RLS)
-- Paste into the Supabase SQL editor after creating a project, then enable
-- Email auth. Privacy: store student FIRST NAME / INITIALS only — no student PII.

-- ---------- tables ----------
create table if not exists centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- a tutor account (1:1 with a Supabase auth user)
create table if not exists tutors (
  id uuid primary key references auth.users (id) on delete cascade,
  center_id uuid not null references centers (id) on delete cascade,
  name text,
  role text not null default 'tutor' check (role in ('owner', 'tutor')),
  created_at timestamptz not null default now()
);

create table if not exists learners (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references centers (id) on delete cascade,
  display_name text not null,            -- first name / initials only
  color text not null default '#1b9aaa',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists learners_center_idx on learners (center_id);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references learners (id) on delete cascade,
  center_id uuid not null references centers (id) on delete cascade,
  game text not null,
  level int,
  lesson int,
  started_at timestamptz,
  ended_at timestamptz not null default now(),
  duration_ms int not null,
  rounds int,
  items int,
  wrong_attempts int,
  accuracy real
);
create index if not exists sessions_learner_idx on sessions (learner_id);
create index if not exists sessions_center_idx on sessions (center_id);

create table if not exists achievements (
  learner_id uuid not null references learners (id) on delete cascade,
  achievement_id text not null,
  earned_at timestamptz not null default now(),
  primary key (learner_id, achievement_id)
);

-- ---------- helper: the signed-in tutor's center ----------
create or replace function current_center_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select center_id from tutors where id = auth.uid()
$$;

-- ---------- row-level security (per center) ----------
alter table centers      enable row level security;
alter table tutors       enable row level security;
alter table learners     enable row level security;
alter table sessions     enable row level security;
alter table achievements enable row level security;

create policy "center read"   on centers for select using (id = current_center_id());
create policy "self tutor"    on tutors  for select using (id = auth.uid());
-- NOTE: no tutor self-UPDATE policy on purpose. The app never edits a tutor's own
-- row, and an unguarded UPDATE would let a tutor change their center_id to point at
-- another center and read its data. If tutor profile editing is added later, scope
-- it to safe columns and lock center_id (e.g. a BEFORE UPDATE trigger).

create policy "learners by center" on learners for all
  using (center_id = current_center_id()) with check (center_id = current_center_id());

create policy "sessions by center" on sessions for all
  using (center_id = current_center_id()) with check (center_id = current_center_id());

create policy "achievements by center" on achievements for all
  using (exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id()))
  with check (exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id()));

-- ---------- stats view (leaderboard + dashboard) ----------
-- security_invoker makes the view run with the QUERYING user's privileges so it
-- respects RLS on learners/sessions — without it the view runs as its owner and
-- would expose every center's stats (cross-center leak).
create or replace view learner_stats with (security_invoker = on) as
  select
    l.id as learner_id,
    l.center_id,
    l.display_name,
    l.color,
    count(s.id)            as sessions,
    min(s.duration_ms)     as best_ms,
    avg(s.accuracy)        as avg_accuracy,
    max(s.ended_at)        as last_played
  from learners l
  left join sessions s on s.learner_id = l.id
  where l.archived = false
  group by l.id;

-- ---------- per-answer event log (append-only; powers cross-device mastery) ----------
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

alter table skill_events enable row level security;
-- SP1: center-scoped. SP2 broadens these to "or is_guardian_of(learner_id)".
create policy "skill_events read"   on skill_events for select using (center_id = current_center_id());
create policy "skill_events insert" on skill_events for insert with check (
  exists (select 1 from learners l where l.id = learner_id and l.center_id = current_center_id()));

-- ---------- onboarding trigger ----------
-- Auto-provision a center + owner tutor for each new auth user (runs as definer,
-- so it isn't blocked by RLS). Uses the `center_name` passed at sign-up, else
-- derives one from the email.
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare new_center uuid;
begin
  insert into public.centers (name)
    values (coalesce(nullif(new.raw_user_meta_data->>'center_name', ''),
                     split_part(new.email, '@', 1) || '''s Center'))
    returning id into new_center;
  insert into public.tutors (id, center_id, role) values (new.id, new_center, 'owner');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
