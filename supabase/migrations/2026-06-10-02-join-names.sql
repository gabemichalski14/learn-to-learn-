-- ============================================================================
-- Join names + authoritative tutor move.  RUN THIS ONE (it supersedes
-- 2026-06-10-redeem-invite-move-tutor.sql — same redeem_invite, now also names).
--
-- 1) guardians gets a `name` column so parents show by name, not "Parent".
-- 2) redeem_invite captures the name the joiner typed at sign-up (stored in
--    auth user_metadata) into tutors.name / guardians.name.
-- 3) the tutor branch UPSERTs (move into the inviting center as a tutor) so an
--    account that had created its own center is pulled in correctly.
--
-- SAFE TO RUN: additive column + function replace. Paste into the SQL editor.
-- ============================================================================

alter table public.guardians add column if not exists name text;

create or replace function public.redeem_invite(p_code text) returns text
  language plpgsql security definer set search_path = public as $$
declare
  inv public.invite_codes;
  joiner_name text;
begin
  select * into inv from public.invite_codes where code = p_code for update;
  if inv.code is null then return 'invalid'; end if;
  if inv.used_at is not null then return 'used'; end if;
  if inv.expires_at < now() then return 'expired'; end if;

  select nullif(raw_user_meta_data->>'name', '') into joiner_name
    from auth.users where id = auth.uid();

  if inv.kind = 'tutor' then
    insert into public.tutors (id, center_id, role, name)
      values (auth.uid(), inv.center_id, 'tutor', joiner_name)
      on conflict (id) do update
        set center_id = excluded.center_id, role = 'tutor',
            name = coalesce(excluded.name, public.tutors.name);
  elsif inv.kind = 'parent' then
    insert into public.guardians (user_id, learner_id, center_id, name)
      values (auth.uid(), inv.learner_id, inv.center_id, joiner_name)
      on conflict (user_id, learner_id) do update
        set name = coalesce(excluded.name, public.guardians.name);
  end if;

  update public.invite_codes set used_at = now(), used_by = auth.uid() where code = p_code;
  return 'ok';
end;
$$;
revoke all on function public.redeem_invite(text) from anon;
grant execute on function public.redeem_invite(text) to authenticated;
