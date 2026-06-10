-- ============================================================================
-- redeem_invite fix — a TUTOR invite now MOVES the redeemer into the inviting
-- center as a tutor.
--
-- Why: the previous version did `insert ... on conflict (id) do nothing`. If a
-- person had already created their OWN center (signed up as "Set up my center"
-- instead of opening the invite link), they already had a tutors row, so the
-- insert was skipped — redeem returned 'ok' but they stayed an owner of their
-- own center. Result: they never appeared in the inviting center's Tutors list,
-- and they landed on the owner Admin page instead of the Tutor dashboard.
--
-- Now the tutor branch UPSERTs: on conflict it updates center_id + role so the
-- invite is authoritative — whoever redeems a tutor link becomes a tutor in THAT
-- center. (A previously self-created center is simply left behind.)
--
-- SAFE TO RUN: this only replaces the function. Paste into the Supabase SQL editor.
-- ============================================================================

create or replace function public.redeem_invite(p_code text) returns text
  language plpgsql security definer set search_path = public as $$
declare inv public.invite_codes;
begin
  select * into inv from public.invite_codes where code = p_code for update;
  if inv.code is null then return 'invalid'; end if;
  if inv.used_at is not null then return 'used'; end if;
  if inv.expires_at < now() then return 'expired'; end if;

  if inv.kind = 'tutor' then
    insert into public.tutors (id, center_id, role)
      values (auth.uid(), inv.center_id, 'tutor')
      on conflict (id) do update
        set center_id = excluded.center_id, role = 'tutor';
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
