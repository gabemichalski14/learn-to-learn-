# Operator setup — Supabase (accounts, roles, sync)

Everything here is done by **you** (the center owner). The app code is ready; it
needs a Supabase project + the SQL applied + your keys. Service-role keys never
go in the app — only the public URL + anon key.

## 1. Create / open the Supabase project
- supabase.com → New project (or open your existing one). Pick a region near you.

## 2. Copy the public API keys
- Project Settings → **API**.
- Copy **Project URL** and the **anon / public** key. (Do **not** copy or use the
  `service_role` key anywhere in the app.)

## 3. Wire the keys
- **Local:** copy `.env.example` → `.env.local`, paste:
  - `VITE_SUPABASE_URL=` your Project URL
  - `VITE_SUPABASE_ANON_KEY=` your anon key
- **Production (Vercel):** add those same two as Environment Variables, then redeploy.
- `.env.local` is gitignored — never commit it.

## 4. Run the SQL (SQL Editor → New query → paste → Run)
Run in this order:
1. **Fresh project:** run `supabase/schema.sql` first (base tables + SP1 RLS + the
   signup trigger). *Skip this if your project already had schema.sql applied.*
2. **Always:** run `supabase/migrations/2026-06-10-roles-and-accounts.sql`
   (roles, assignment/guardian/invite/deletion tables, RLS rewrite, redeem RPC,
   and a backfill that assigns existing students to you as `primary`).
   It's additive + idempotent — safe to re-run.

## 5. Enable Email auth
- Authentication → Providers → **Email** = enabled.
- **Confirm email** is your call:
  - *On* (more secure): new tutors/parents confirm their email before their invite
    code links them. The app handles this — it stashes the code and redeems it on
    their first sign-in.
  - *Off* (simpler for a small center): links immediately on sign-up.

## 6. Create YOUR owner account
- In the app: **Account → Create account → "🏫 Set up my center"** → center name +
  email + password.
- The signup trigger auto-creates your center and makes you the **owner**.
- (If email confirmation is on: confirm, then sign in.)
- You'll now see **Center admin** + **Dashboard** in the menu.

## 7. Add tutors / parents (from the Admin page, once signed in as owner)
- **Invite a tutor:** Center admin → *Invite tutor* → copy the code → the tutor
  signs up with **"🧑‍🏫 I'm a tutor"** + the code.
- **Assign students:** the *Who teaches whom* grid — tap a cell to set a tutor as
  **P**rimary or **S**ubstitute for a student.
- **Invite a parent:** *invite parent* under a student → copy the code → the parent
  signs up with **"👪 I'm a parent"** + the code; they then see only that child.

## 8. Verify security FROM THE APP (not the SQL editor)
The SQL editor bypasses RLS, so test as real users in the browser:
- A **second tutor** sees **only** students assigned to them — not the whole center.
- A **parent** sees **only** their own child.
- A **deletion request** (parent) shows up in the owner's Admin inbox.
If any of those leak, stop and tell me — that's the security boundary.

## Known follow-ups (not blockers for you-as-solo-owner)
- **Owner "create student" button** + roster-scoping polish: today cloud students
  appear by playing on a device (they sync up) and you assign them. A dedicated
  "add student" control on the Admin page is the next iteration. While you're the
  only (owner) account, everything works; this matters mainly once non-owner
  tutors are added.
- **Auto-route on sign-in** (parent → My child, owner → Admin) is a planned nicety.

## Reference
- Data retention & deletion policy: `docs/privacy/data-retention.md`
- Roles design spec: `docs/superpowers/specs/2026-06-10-roles-and-accounts-design.md`
