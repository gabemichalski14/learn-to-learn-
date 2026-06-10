-- ============================================================================
-- Lock down center creation. The UI no longer offers "set up my center" — new
-- accounts join an existing center via an invite link only. This closes the
-- door at the database too: a new signup creates a center ONLY with an explicit
-- intent = 'new_center' (which the app never sends). A bare/no-intent signup
-- (e.g. direct API call) gets NO center and NO owner row — it can't spawn its
-- own tutoring center.
--
-- The existing owner + center are untouched. If you ever need to provision a
-- brand-new center, sign up with raw_user_meta_data.intent = 'new_center'.
--
-- Paste into the Supabase SQL editor.
-- ============================================================================

create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
declare new_center uuid; intent text := new.raw_user_meta_data->>'intent';
begin
  if intent = 'new_center' then                       -- was: intent is null or intent = 'new_center'
    insert into public.centers (name)
      values (coalesce(nullif(new.raw_user_meta_data->>'center_name', ''),
                       split_part(new.email, '@', 1) || '''s Center'))
      returning id into new_center;
    insert into public.tutors (id, center_id, role) values (new.id, new_center, 'owner');
  end if;
  -- 'join_tutor' / 'join_parent' / null: no center; the client redeems an invite.
  return new;
end;
$$;
