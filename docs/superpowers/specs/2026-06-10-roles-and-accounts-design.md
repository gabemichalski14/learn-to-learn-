# Roles & Accounts — Owner / Tutor / Substitute / Parent / Student

**Status:** Draft for review · **Date:** 2026-06-10 · **Supersedes:** the SP1 "center-scoped, tutor-only" auth model

This is the "SP2" the schema anticipated (`-- SP2 broadens these to "or is_guardian_of(learner_id)"`). It adds a real org hierarchy, per-tutor student assignment, and a parent role — without ever giving a child a login or storing child PII.

---

## 1. Goals
- An **Owner/Admin** (the center operator) who controls everything: students, tutors, assignments, parent invites.
- **Tutors** who see **only the students assigned to them** (primary tutor + optional substitutes).
- **Parents** who see **only their own child**, with the COPPA rights to **view, export, and request deletion**.
- **Students never log in** — their profile *is* their account; all data is keyed to the learner id and personalized to them; an adult's login is only the secure key + cross-device sync.

### Non-goals (this spec)
- No child credentials/PII (first name / initials only — unchanged).
- No advertising, no third-party data sharing, no biometric capture (we play audio, never record the child).
- No payments/billing.

---

## 2. Roles
| Role | Auth | Roster they can access | Powers |
|---|---|---|---|
| **Owner / Admin** | Supabase user (`tutors.role='owner'`) | **All** center students | Create students; create/invite tutors; assign primary + substitute tutors; invite parents; everything a tutor can do |
| **Tutor** | Supabase user (`tutors.role='tutor'`) | Students where they are **primary OR an active substitute** | View/teach their students; dashboards; lock/unlock levels; WIST entry |
| **Substitute** | (a tutor, temporarily) | A student, until `expires_at` | Same as tutor, scoped to the covered student, time-boxed |
| **Parent / Guardian** | Supabase user (`guardians` row) | **Their own child(ren)** | View progress; **export** report; **request deletion** |
| **Student / Learner** | **none** | — | Plays; data keyed to their learner id |

---

## 3. How a student profile is picked (no child login)
- **Play device:** the signed-in adult selects the active student from the **roster picker** (today's Now-Playing bar). The roster is **scoped to that adult's access** (owner → all; tutor → assigned; parent → their child). The child's play logs to the selected learner id.
- **Signed out:** local device profiles only (quick offline use); reconciles to the cloud roster on sign-in.
- **Dashboards:** same scoped roster, for viewing.

---

## 4. Data model (Postgres + RLS)

### New tables
```sql
-- which tutor(s) a student is assigned to
create table learner_tutors (
  learner_id uuid references learners(id) on delete cascade,
  tutor_id   uuid references tutors(id)   on delete cascade,
  relation   text not null default 'primary' check (relation in ('primary','substitute')),
  expires_at timestamptz,                         -- subs: optional auto-expiry; primary: null
  primary key (learner_id, tutor_id)
);

-- a parent ↔ child link (one parent may guard several children)
create table guardians (
  user_id    uuid references auth.users(id) on delete cascade,
  learner_id uuid references learners(id)   on delete cascade,
  center_id  uuid references centers(id)    on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, learner_id)
);

-- one-time codes the owner/tutor issues (parent join OR tutor join)
create table invite_codes (
  code        text primary key,                   -- short, unguessable
  kind        text not null check (kind in ('parent','tutor')),
  center_id   uuid not null references centers(id) on delete cascade,
  learner_id  uuid references learners(id) on delete cascade,  -- parent invites only
  created_by  uuid references auth.users(id),
  expires_at  timestamptz not null,
  used_at     timestamptz,
  used_by     uuid references auth.users(id)
);
```

### Helper predicates (security definer)
- `is_owner()` → caller's `tutors.role = 'owner'`.
- `is_assigned_tutor(l uuid)` → row in `learner_tutors` for caller where not expired.
- `is_guardian_of(l uuid)` → row in `guardians` for caller.

### RLS rewrite (learners / sessions / skill_events / achievements)
Read = `center_id = current_center_id() AND ( is_owner() OR is_assigned_tutor(learner_id) OR is_guardian_of(learner_id) )`
*(guardian arm joins through `learners` for the center match).* Writes (gameplay logging) stay tutor/owner-scoped; parents are read + export + delete-request only.

### Signup branching (replaces today's "every signup makes a center")
`handle_new_user` reads `raw_user_meta_data.intent`:
- `new_center` → create center + `owner` (today's behavior).
- `join_tutor` → **no** center; consume a `kind='tutor'` invite → insert `tutors(role='tutor', center_id=invite.center_id)`.
- `join_parent` → **no** center; consume a `kind='parent'` invite → insert `guardians(user_id, learner_id, center_id)`.
Redemption runs in a `security definer` RPC that validates + marks the code used (atomic; rejects expired/used codes).

---

## 5. UI surfaces
1. **Sign-up role chooser** — "Set up my center" (owner) · "Join as a tutor (I have a code)" · "I'm a parent (I have a code)".
2. **Admin page (owner-only)** — Tutors list + "Invite tutor"; Students list + create; an **assignment grid** (student × tutor, mark primary, add substitute w/ optional end date); "Invite parent" per student.
3. **Tutor dashboard** — unchanged, roster auto-scoped to assignments.
4. **Parent home** — warm, parent-facing child view: garden/village + progress + strengths/needs; **Download report** (CSV/PDF) + **Request deletion**.
5. **Invite redemption** — code entry during sign-up (parent + tutor).

---

## 6. Privacy / COPPA / security
- **No child PII** (first name/initials only); **no child audio capture** (no biometric scope); educational-use only (center-authorization model).
- **Parent rights:** export + delete satisfy COPPA access/erasure; surfaced in Parent home.
- **Retention policy:** define + document a retention window + deletion path (no indefinite storage).
- **RLS is the security boundary** — verified by tests: a tutor cannot read an unassigned student; a parent cannot read another child; expired substitute access disappears; invite codes are single-use + expiring.
- **Service role key never in client** (unchanged). Invite codes are unguessable + short-lived.

---

## 7. Build phases
1. **Schema + RLS migration** + helper predicates + signup branching + redemption RPC. RLS tests.
2. **Auth/role plumbing** — role-aware signup, `useRole()` (owner/tutor/parent), route to the right home, roster scoping in `dataSource`/identity reconcile.
3. **Admin page** (owner) — tutors, students, assignment grid, invites.
4. **Parent home** + export + delete-request.
5. **Invite redemption** UX + tutor-invite flow.
6. **Verification** — RLS isolation tests, gate, operator/runbook doc.

---

## 8. Open questions / risks
- **Migration on a live DB:** schema.sql is "paste-once". Need an *additive* migration that preserves existing centers/tutors and backfills `learner_tutors` (assign all current learners to the owner as 'primary').
- **Substitute expiry:** enforced in `is_assigned_tutor` (predicate checks `expires_at`); no cron needed.
- **Deletion request flow:** parent *requests*; owner confirms the actual delete (avoids accidental/irreversible parent-side deletes) — or hard-delete immediately? (Recommend: request → owner confirms.)
- **Email invites:** out of scope (codes only); revisit if transactional email is added.
