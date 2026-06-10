-- ============================================================================
-- redeem_invite — OWNER-SAFE. RUN THIS ONE (supersedes 2026-06-10-join-names.sql).
--
-- Bug it fixes: the previous version UPSERTed the tutors row, so if a center
-- OWNER redeemed a tutor invite (e.g. clicked their own link while signed in),
-- `on conflict do update set role='tutor'` DEMOTED the owner to a tutor.
--
-- Now: if the caller is already an owner of ANY center, redeem is a NO-OP and
-- returns 'already_owner' WITHOUT consuming the code or touching their row.
-- Otherwise it behaves as before (join as tutor / parent, capture the name).
--
-- SAFE TO RUN: function replace only. Paste into the Supabase SQL editor.
-- ============================================================================

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

  -- SAFETY GUARD: an invite must never alter or demote a center owner.
  if exists (select 1 from public.tutors where id = auth.uid() and role = 'owner') then
    return 'already_owner';  -- leave their row untouched; do NOT consume the code
  end if;

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
