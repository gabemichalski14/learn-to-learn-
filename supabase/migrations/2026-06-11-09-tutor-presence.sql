-- ============================================================================
-- tutor presence — show whether a tutor is currently active on their account.
--
-- A tutor stamps their OWN last_seen_at via a heartbeat while signed in; the
-- owner reads it on the Tutors page to see who's active. No new table — just a
-- column + a tiny self-only SECURITY DEFINER stamp (pinned search_path).
--
-- Depends on 2026-06-10-01-roles-and-accounts.sql (tutors table).
-- Paste into the Supabase SQL editor.
-- ============================================================================

alter table public.tutors add column if not exists last_seen_at timestamptz;

-- Stamp the CURRENT signed-in tutor's presence (their row only — safe to expose).
create or replace function public.touch_tutor_presence()
returns void
language sql
security definer
set search_path = public
as $$
  update public.tutors set last_seen_at = now() where id = auth.uid();
$$;

revoke all on function public.touch_tutor_presence() from public;
grant execute on function public.touch_tutor_presence() to authenticated;
