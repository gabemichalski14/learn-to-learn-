-- ============================================================================
-- invite name — remember the invitee's NAME (typed by the owner when inviting)
-- so the pending list reads as a person, not a raw email. Also ensures the
-- `email` column exists (idempotent), so running just this migration is enough
-- even if 06 wasn't applied. Both nullable; the client degrades gracefully.
--
-- Paste into the Supabase SQL editor.
-- ============================================================================

alter table public.invite_codes add column if not exists email text;
alter table public.invite_codes add column if not exists name  text;
