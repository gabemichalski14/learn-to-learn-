-- ============================================================================
-- invite email — remember who an invite was sent to, so the owner can see
-- PENDING tutors/parents (invite sent, not yet redeemed) by name/email until
-- they confirm. Nullable; the client degrades gracefully if this hasn't run
-- yet (invites still work, just without the remembered email).
--
-- Pending = used_at IS NULL AND expires_at > now(). Once redeem_invite sets
-- used_at, the invite drops off the pending list automatically.
--
-- Paste into the Supabase SQL editor.
-- ============================================================================

alter table public.invite_codes add column if not exists email text;
