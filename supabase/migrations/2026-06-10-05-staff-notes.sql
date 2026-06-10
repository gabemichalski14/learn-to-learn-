-- ============================================================================
-- staff_notes — a private, staff-only note per student.
--
-- IMPORTANT (privacy): the note must NOT be readable by guardians (parents).
-- The `learners` read policy intentionally includes guardians, and Postgres RLS
-- is row-level (can't hide a single column from a role), so the note lives in
-- its OWN table whose policies are owner ∨ assigned-tutor only — never guardian.
-- This also lets an assigned tutor (not just the owner) keep notes.
--
-- Depends on helpers from 2026-06-10-roles-and-accounts.sql (is_owner,
-- is_assigned_tutor, current_center_id, stamp_center_from_learner).
-- Paste into the Supabase SQL editor.
-- ============================================================================

create table if not exists public.staff_notes (
  learner_id uuid primary key references public.learners(id) on delete cascade,
  center_id  uuid not null references public.centers(id) on delete cascade,
  body       text,
  updated_at timestamptz not null default now()
);

alter table public.staff_notes enable row level security;

-- stamp center_id from the learner on insert (reuses the shared helper)
drop trigger if exists staff_notes_stamp_center on public.staff_notes;
create trigger staff_notes_stamp_center before insert on public.staff_notes
  for each row execute function stamp_center_from_learner();

-- read + write: owner (own center) or the student's assigned tutor. NOT guardian.
drop policy if exists "staff_notes read" on public.staff_notes;
create policy "staff_notes read" on public.staff_notes for select using (
  (is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id));

drop policy if exists "staff_notes write" on public.staff_notes;
create policy "staff_notes write" on public.staff_notes for all
  using ((is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id))
  with check ((is_owner() and center_id = (select current_center_id())) or is_assigned_tutor(learner_id));
