-- ============================================================================
-- learner note — a free-text note the owner keeps on a student's record
-- (qualitative context the data can't capture: "tired today", "big breakthrough
-- on short vowels"). Nullable; owner-write is already covered by the existing
-- "learners write" RLS policy (owner ∧ same center). Reads ride the existing
-- read policy. Only the dedicated getLearnerNote() selects this column, so the
-- app is unaffected before this runs.
--
-- Paste into the Supabase SQL editor.
-- ============================================================================

alter table public.learners add column if not exists note text;
