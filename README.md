# Learn to Learn — Phonics Games

An audio-first, **letterless** phonics game aligned to general structured-literacy
(Orton–Gillingham-based) methods (Level 1 — Phonemic Awareness). Pictures stand in for
words; the learner hears the word and sorts it by its **beginning sound** — no reading
required.

This is game #1 of a planned structured-literacy learning-games suite. It is built on
separated layers (content / engine / theme / shell) so future lessons, sounds, themes,
and game modes extend it without rewriting the engine.

> **Independent product.** Not affiliated with, endorsed by, or derived from the Barton
> Reading & Spelling System®. See [`NOTICE`](./NOTICE) for the full trademark notice.

## Play modes
- **Mode A — Sort into sound baskets** (this build): drag each picture into the basket
  whose beginning sound it shares.
- **Mode B — Connect the pairs** (planned, Plan 2).

## Design principles
- **Structured-literacy faithful:** Level 1 shows no letters; everything is audio-first;
  sounds can be replayed infinitely.
- **No anxiety:** no timers, no fail state. A wrong move gently replays the sound and
  returns the picture.
- **For ages 5 → adult:** swappable age-band themes (Plan 2) keep it from ever looking babyish.
- **Accessible:** large touch targets, high contrast, reduced-motion support, audio for
  everything, works on touch / mouse / keyboard and on a smartboard.

## Develop
- `npm install`
- `npm run dev` — play locally
- `npm test` — run the engine + UI tests
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the production build

## Level 2 — Space Patrol world
Level 2 runs in an immersive "Space Patrol" theme. Clicking **Level 2** from Home opens a
drawer-free cosmic hub; all three games (Sound Safari = first sound, Last Sound Standing =
last sound, Vowel Patrol = middle vowel) play in the space world with bespoke creature
icons. The active student is always shown in the game HUD.

## Cloud sync & cross-device (operator setup)
Local-first by default — with no Supabase configured the app runs entirely on-device, exactly
as before. To let a tutor see a student's progress on **any** device (and, in a later
sub-project, parents):

1. Run `supabase/schema.sql` in the Supabase SQL editor (creates the tables, RLS, the
   `skill_events` log + integrity trigger).
2. Put the **public** URL + anon key in `.env.local` (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`) — gitignored. Never commit the `service_role` key.
3. Sign in on each device via the **Account** screen. The center roster syncs into the device,
   every answered item + finished session is queued to a durable outbox and flushed to the
   cloud, and the dashboards read cloud data when signed in (local otherwise).

Per-skill mastery is computed from the answer log, so the **Tutor Dashboard** shows strongest
sounds, focus areas (with links to the games that target them), and an activity streak.
**Parents/guardians** (invite + linking + a read-only family dashboard) are the next
sub-project — see the SP2 spec/plan in `docs/superpowers/`.

## Status
**v1 foundation (this branch):** engine + content + Mode A, default "Soft & Friendly"
look, **placeholder** TTS audio. The TTS voice mispronounces isolated phonemes on
purpose — it is a temporary dev stand-in that the recorded human-voice library replaces
in Plan 2 (the audio interface is already in place, so no call sites change).

**Next (Plan 2):** Mode B, age-band themes, interest-pack switching, the reward-style
toggle, recorded human audio, and the customizable avatar.

See `docs/superpowers/specs/` and `docs/superpowers/plans/` for the full design and plan.

## Deployment & security headers
Deployed as a static Vite build (default: Vercel). [`vercel.json`](./vercel.json) ships
a hardened header set on every response:

- **Content-Security-Policy** locked to `'self'` plus the only external origins the app
  uses — Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) and Supabase
  (`*.supabase.co`, REST + realtime `wss:`). No inline scripts are emitted by the build.
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy` denying camera/microphone/geolocation/topics, and HSTS.
- Hashed `/assets/*` are served `immutable` for a year.

If you add a new external origin (e.g. an analytics or audio CDN), extend the CSP
`connect-src` / `font-src` / `img-src` directives in `vercel.json` accordingly.

## License & trademarks
Proprietary — © 2026 Learn to Learn Tutoring Solutions, all rights reserved. See
[`LICENSE`](./LICENSE). This is **not** open-source software.

"Barton Reading & Spelling System®" is a registered trademark of its owner; this product
is independent and not affiliated with or derived from it. All instructional copy, word
lists, sentences, artwork, characters (Pip, Echo), and code are original works. See
[`NOTICE`](./NOTICE).
