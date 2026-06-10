-- ============================================================================
-- skill_events enrichment — richer per-answer signals for personalization.
--
-- Adds NULLABLE columns so older clients + every existing row keep working
-- (the app only sends these once the games emit them; reads are unchanged
-- until the personalization phase). Safe to run anytime.
--
--   chosen      what the learner picked when wrong (confusion analysis)
--   first_try   true if correct on the FIRST attempt (un-inflated accuracy)
--   latency_ms  time to answer (interpreted as coarse buckets, never shown raw)
--   replays     how many times they re-heard the sound this item (uncertainty)
--   level       curriculum level for this item (Barton-sequence alignment)
--   lesson      curriculum lesson for this item
--
-- Paste into the Supabase SQL editor.
-- ============================================================================

alter table public.skill_events add column if not exists chosen     text;
alter table public.skill_events add column if not exists first_try  boolean;
alter table public.skill_events add column if not exists latency_ms  integer;
alter table public.skill_events add column if not exists replays     integer;
alter table public.skill_events add column if not exists level       integer;
alter table public.skill_events add column if not exists lesson      integer;
