# Supabase migrations — apply IN ORDER

These are **manually-applied** SQL scripts (paste into the Supabase SQL editor).
The numeric prefix is the **required apply order** — later scripts depend on the
foundation and several `create or replace` the same function, so the last one
applied wins. Running them out of order (e.g. alphabetically without the prefix)
can clobber the owner-safe `redeem_invite` with an older version.

| # | File | What it does |
|---|------|--------------|
| 01 | `roles-and-accounts.sql` | Foundation: tables, RLS (owner/assigned-tutor/guardian, off server tables), SECURITY DEFINER helpers (pinned search_path), signup trigger, base `redeem_invite`. |
| 02 | `join-names.sql` | Adds `guardians.name`; `redeem_invite` captures the joiner's name. |
| 03 | `redeem-guard-owner.sql` | **Authoritative `redeem_invite`** — name capture + tutor move-UPSERT + the owner guard (a signed-in owner who opens an invite is never demoted; returns `already_owner` without consuming the code). Supersedes the earlier move-tutor iteration (now removed). |
| 04 | `skill-events-enrichment.sql` | Nullable enrichment columns on `skill_events` (chosen, first_try, latency_ms, replays, level, lesson). |
| 05 | `staff-notes.sql` | `staff_notes` table — private per-student note, RLS owner ∨ assigned-tutor only (NOT guardian). |

All scripts are idempotent (`if not exists` / `create or replace` /
`drop policy if exists`) and safe to re-run **in this order**.

### If an owner ever got demoted to tutor (pre-guard bug)
```sql
update tutors set role = 'owner'
where id = (select id from auth.users where email = 'OWNER_EMAIL_HERE');
```
