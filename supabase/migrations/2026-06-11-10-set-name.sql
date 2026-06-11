-- ============================================================================
-- set_my_name — let a signed-in user change their own display name.
--
-- Updates the caller's own row in tutors (owner/tutor) and guardians (parent).
-- Self-only + SECURITY DEFINER with a pinned search_path (safe to expose).
--
-- Depends on 2026-06-10-01-roles-and-accounts.sql + 2026-06-10-02-join-names.sql.
-- Paste into the Supabase SQL editor.
-- ============================================================================

create or replace function public.set_my_name(p_name text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.tutors    set name = nullif(btrim(p_name), '') where id      = auth.uid();
  update public.guardians  set name = nullif(btrim(p_name), '') where user_id = auth.uid();
$$;

revoke all on function public.set_my_name(text) from public;
grant execute on function public.set_my_name(text) to authenticated;
