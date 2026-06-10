# Deploying to Vercel (share for feedback)

The app is a static Vite SPA + Supabase. It uses **hash routing** (`/#/...`), so
no server rewrites are needed. `vercel.json` already pins the framework, build,
output dir, and security headers. Keep the GitHub repo **private** — testers only
need the public Vercel URL; the `service_role` key never leaves Supabase.

## A. Put the code on GitHub (private repo)
1. Install the GitHub CLI (once): `brew install gh && gh auth login`
   *(or create the repo on github.com and `git remote add origin <url>`)*
2. Get everything onto `main` (all work is on `feat/sp1-tutor-cloud-loop`):
   ```bash
   git checkout main && git merge feat/sp1-tutor-cloud-loop   # fast-forward
   ```
3. Create the repo + push:
   ```bash
   gh repo create barton-games --private --source=. --remote=origin --push
   ```

## B. Import to Vercel
4. vercel.com → **Add New → Project → Import** your `barton-games` repo.
   Vercel auto-detects Vite (build `vite build`, output `dist` — already in
   `vercel.json`).
5. **Before the first deploy**, open **Environment Variables** and add (scope:
   Production **and** Preview):
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your **anon / publishable** key (NOT service_role) |
   These are inlined at build time — if missing, the app still runs but in
   local-only mode (no sign-in / dashboards).
6. **Deploy.** You get `https://<project>.vercel.app`.

## C. Point Supabase at the live URL (so auth works)
7. Supabase → **Authentication → URL Configuration**:
   - **Site URL** = `https://<project>.vercel.app`
   - **Redirect URLs** → add `https://<project>.vercel.app/**`
     (keep `http://localhost:5173/**` for local dev)
   This makes sign-up confirmation + password-reset links return to the live app.
8. Run any unapplied migration in the SQL editor — currently
   `supabase/migrations/2026-06-10-05-staff-notes.sql`.

## D. Share + collect feedback
9. Send the Vercel URL. For testers:
   - **The games are fully playable without signing in** — best for kid / gameplay
     feedback.
   - **Tutor / parent / admin dashboards** need an account: a tester can sign up
     (creates their own center as owner), or you invite them by email from the
     admin pages (tutor & parent invites).
10. (Optional) Vercel → Settings → **Domains** to add a custom domain.

## Notes
- The CSP already allows `connect-src https://*.supabase.co`, so the live app
  reaches Supabase. ✅
- Every push to `main` auto-redeploys; pull requests get their own preview URL.
- `vercel.json` builds with `vite build` (skips `tsc`), so a stray type error
  won't block a deploy — **run the gate locally before pushing**:
  `./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/eslint . && ./node_modules/.bin/vitest run && ./node_modules/.bin/vite build`
