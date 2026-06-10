-- ============================================================================
-- Roles & Accounts (SP2) — additive, idempotent migration over schema.sql
-- Owner/admin → tutors (assigned students only) → students → parents (own child)
--
-- SAFE TO RUN on the existing DB: creates new tables IF NOT EXISTS, replaces
-- functions, drops+recreates affected policies, and backfills current learners
-- to the owner as 'primary'. Paste into the Supabase SQL editor.
--
-- Security notes (from review): RLS keys off SERVER tables only (never the
-- user-editable JWT user_metadata); helpers are SECURITY DEFINER with a pinned
-- search_path; every policy-referenced FK is indexed; invite redemption is a
-- single-use, expiring, server-validated RPC.
-- ============================================================================

-- ---------- helpers this migration depends on (idempotent; defined here so the
-- migration is self-sufficient over a partial or older schema.sql) ----------
create or replace function current_center_id() returns uuid
  language sql stable security definer set search_path = public as $$
  select center_id from tutors where id = auth.uid()
$$;

create or replace function stamp_center_from_learner() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  select center_id into new.center_id from learners where id = new.learner_id;
  return new;
end;
$$;

-- ensure the per-answer event log exists (older schema.sql may predate it)
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
alter table skill_events enable row level security;
drop trigger if exists skill_events_stamp_center on skill_events;
create trigger skill_events_stamp_center before insert on skill_events
  for each row execute function stamp_center_from_learner();

-- ---------- new tables ----------

-- student ↔ tutor assignment (one 'primary'; optional time-boxed 'substitute')
create table if not exists learner_tutors (
  learner_id uuid not null references learners (id) on delete cascade,
  tutor_id   uuid not null references tutors (id) on delete cascade,
  relation   text not null default 'primary' check (relation in ('primary', 'substitute')),
  expires_at timestamptz,                              -- substitutes: optional auto-expiry
  created_at timestamptz not null default now(),
  primary key (learner_id, tutor_id)
);
create index if not exists learner_tutors_tutor_idx   on learner_tutors (tutor_id);
create index if not exists learner_tutors_learner_idx on learner_tutors (learner_id);

-- parent ↔ child link (a parent may guard several children)
create table if not exists guardians (
  user_id    uuid not null references auth.users (id) on delete cascade,
  learner_id uuid not null references learners (id) on delete cascade,
  center_id  uuid not null references centers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, learner_id)
);
create index if not exists guardians_learner_idx on guardians (learner_id);
create index if not exists guardians_user_idx    on guardians (user_id);

-- one-time invite codes (owner issues; parent OR new-tutor redeems)
create table if not exists invite_codes (
  code        text primary key,
  kind        text not null check (kind in ('parent', 'tutor')),
  center_id   uuid not null references centers (id) on delete cascade,
  learner_id  uuid references learners (id) on delete cascade,   -- parent invites only
  created_by  uuid references auth.users (id),
  expires_at  timestamptz not null,
  used_at     timestamptz,
  used_by     uuid references auth.users (id)
);
create index if not exists invite_codes_center_idx on invite_codes (center_id);

-- COPPA deletion requests (parent requests → owner resolves; easy to find for both)
create table if not exists deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references learners (id) on delete cascade,
  center_id    uuid not null references centers (id) on delete cascade,
  requested_by uuid not null references auth.users (id) default auth.uid(),
  requested_at timestamptz not null default now(),
  status       text not null default 'open' check (status in ('open', 'done', 'dismissed')),
  resolved_by  uuid references auth.users (id),
  resolved_at  timestamptz,
  note         text
);
create index if not exists deletion_requests_center_idx on deletion_requests (center_id, status);

-- ---------- helper predicates (SECURITY DEFINER, pinned search_path) ----------
create or replace function is_owner() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from tutors where id = auth.uid() and role = 'owner');
$$;

create or replace function is_assigned_tutor(l uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from learner_tutors lt
    where lt.learner_id = l and lt.tutor_id = auth.uid()
      and (lt.expires_at is null or lt.expires_at > now())
  );
$$;

create or replace function is_guardian_of(l uuid) returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from guardians g where g.learner_id = l and g.user_id = auth.uid());
$$;

-- ---------- RLS on the new tables ----------
alter table learner_tutors    enable row level security;
alter table guardians         enable row level security;
alter table invite_codes      enable row level security;
alter table deletion_requests enable row level security;

drop policy if exists "lt read" on learner_tutors;
create policy "lt read" on learner_tutors for select using (
  tutor_id = auth.uid() or (is_owner() and (select center_id from learners where id = learner_id) = (select current_center_id())));
drop policy if exists "lt write" on learner_tutors;
create policy "lt write" on learner_tutors for all
  using (is_owner() and (select center_id from learners where id = learner_id) = (select current_center_id()))
  with check (is_owner() and (select center_id from learners where id = learner_id) = (select current_center_id()));

drop policy if exists "guardians read" on guardians;
create policy "guardians read" on guardians for select
  using (user_id = auth.uid() or (is_owner() and center_id = (select current_center_id())));
-- inserts happen only via redeem_invite() (definer); owner/self may revoke
drop policy if exists "guardians delete" on guardians;
create policy "guardians delete" on guardians for delete
  using (user_id = auth.uid() or (is_owner() and center_id = (select current_center_id())));

drop policy if exists "invites read" on invite_codes;
create policy "invites read" on invite_codes for select
  using (is_owner() and center_id = (select current_center_id()));
drop policy if exists "invites write" on invite_codes;
create policy "invites write" on invite_codes for all
  using (is_owner() and center_id = (select current_center_id()))
  with check (is_owner() and center_id = (select current_center_id()));

drop policy if exists "del read" on deletion_requests;
create policy "del read" on deletion_requests for select
  using (requested_by = auth.uid() or (is_owner() and center_id = (select current_center_id())));
drop policy if exists "del insert" on deletion_requests;
create policy "del insert" on deletion_requests for insert
  with check (is_guardian_of(learner_id));
drop policy if exists "del resolve" on deletion_requests;
create policy "del resolve" on deletion_requests for update
  using (is_owner() and center_id = (select current_center_id()))
  with check (is_owner() and center_id = (select current_center_id()));

-- stamp center_id on a deletion request from the learner (client can't spoof it)
drop trigger if exists deletion_requests_stamp_center on deletion_requests;
create trigger deletion_requests_stamp_center before insert on deletion_requests
  for each row execute function stamp_center_from_learner();

-- ---------- REWRITE the per-center policies → owner / assigned-tutor / guardian ----------
-- learners: owner sees all in their center; tutor sees ASSIGNED only; parent sees their child.
drop policy if exists "learners by center" on learners;
drop policy if exists "learners read" on learners;
create policy "learners read" on learners for select using (
  (is_owner() and center_id = (select current_center_id()))
  or is_assigned_tutor(id)
  or is_guardian_of(id)
);
drop policy if exists "learners write" on learners;
create policy "learners write" on learners for all
  using (is_owner() and center_id = (select current_center_id()))
  with check (is_owner() and center_id = (select current_center_id()));

-- sessions / skill_events / achievements: read owner|assigned|guardian; write owner|assigned (gameplay)
drop policy if exists "sessions by center" on sessions;
drop policy if exists "sessions read" on sessions;
drop policy if exists "sessions write" on sessions;
create policy "sessions read" on sessions for select using (
  (is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id) or is_guardian_of(learner_id));
create policy "sessions write" on sessions for insert with check (
  (is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id));

drop policy if exists "skill_events read" on skill_events;
drop policy if exists "skill_events insert" on skill_events;
create policy "skill_events read" on skill_events for select using (
  (is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id) or is_guardian_of(learner_id));
create policy "skill_events insert" on skill_events for insert with check (
  (is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id));

drop policy if exists "achievements by center" on achievements;
drop policy if exists "achievements read" on achievements;
drop policy if exists "achievements write" on achievements;
create policy "achievements read" on achievements for select using (
  is_owner() and exists (select 1 from learners l where l.id = learner_id and l.center_id = (select current_center_id()))
  or is_assigned_tutor(learner_id) or is_guardian_of(learner_id));
create policy "achievements write" on achievements for insert with check (
  is_owner() and exists (select 1 from learners l where l.id = learner_id and l.center_id = (select current_center_id()))
  or is_assigned_tutor(learner_id));

-- owner can read every tutor in their center (for the admin page); the existing
-- "self tutor" policy still lets a plain tutor read their own row (policies OR).
drop policy if exists "tutors by center (owner)" on tutors;
create policy "tutors by center (owner)" on tutors for select
  using (is_owner() and center_id = (select current_center_id()));

-- ---------- signup branching: only 'new_center' (or no intent) makes a center ----------
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare new_center uuid; intent text := new.raw_user_meta_data->>'intent';
begin
  if intent is null or intent = 'new_center' then
    insert into public.centers (name)
      values (coalesce(nullif(new.raw_user_meta_data->>'center_name', ''),
                       split_part(new.email, '@', 1) || '''s Center'))
      returning id into new_center;
    insert into public.tutors (id, center_id, role) values (new.id, new_center, 'owner');
  end if;
  -- 'join_tutor' / 'join_parent': no center; the client calls redeem_invite() after sign-up.
  return new;
end;
$$;

-- ---------- redeem an invite (server-validated, single-use, expiring) ----------
create or replace function public.redeem_invite(p_code text) returns text
  language plpgsql security definer set search_path = public as $$
declare inv public.invite_codes;
begin
  select * into inv from public.invite_codes where code = p_code for update;
  if inv.code is null then return 'invalid'; end if;
  if inv.used_at is not null then return 'used'; end if;
  if inv.expires_at < now() then return 'expired'; end if;

  if inv.kind = 'tutor' then
    insert into public.tutors (id, center_id, role) values (auth.uid(), inv.center_id, 'tutor')
      on conflict (id) do nothing;
  elsif inv.kind = 'parent' then
    insert into public.guardians (user_id, learner_id, center_id)
      values (auth.uid(), inv.learner_id, inv.center_id) on conflict do nothing;
  end if;

  update public.invite_codes set used_at = now(), used_by = auth.uid() where code = p_code;
  return 'ok';
end;
$$;
revoke all on function public.redeem_invite(text) from anon;
grant execute on function public.redeem_invite(text) to authenticated;

-- ---------- backfill: assign every existing learner to its center's owner as 'primary' ----------
insert into learner_tutors (learner_id, tutor_id, relation)
  select l.id, t.id, 'primary'
  from learners l
  join tutors t on t.center_id = l.center_id and t.role = 'owner'
  on conflict (learner_id, tutor_id) do nothing;

-- NOTE: learner_stats view (security_invoker) already respects the new RLS — no change needed.
