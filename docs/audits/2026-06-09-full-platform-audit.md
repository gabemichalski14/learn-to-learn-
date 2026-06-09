# Full Platform Audit — 2026-06-09

Scope: security, cross-device/responsive scalability, bug-freeness, room for
expansion, and goal/mission realignment with a gap analysis. Run on a fresh
server + clean build (212 → 216 tests after fixes).

## Verdict at a glance

| Area | Result |
|------|--------|
| 🔐 Security | **PASS** — no issues |
| 📱 Responsive / cross-device | **PASS** — no issues |
| 🐛 Bugs (runtime + flows) | **PASS** — clean |
| 🧱 Architecture / expansion | **PASS** — 2 perf optimizations noted |
| 🎯 Goals / mission gaps | **1 critical gap found + fixed** (audio); others queued |

---

## 🔐 Security — PASS
- **No secrets** committed; only the public Supabase **anon key** is used client-side
  (`VITE_SUPABASE_*`). `service_role` appears only as a "keep OUT" note in
  `.env.example`. `.env*` is gitignored.
- **No XSS surfaces** — zero `dangerouslySetInnerHTML` / `innerHTML` / `eval` /
  `new Function`. localStorage values only ever land in escaped React text.
- **Strong headers** (`vercel.json`): CSP with `script-src 'self'` (no unsafe
  inline scripts), `object-src 'none'`, `frame-ancestors 'none'`, connect-src
  limited to Supabase, HSTS, `X-Frame-Options: DENY`, nosniff, Referrer-Policy,
  Permissions-Policy locking camera/mic/geo.
- **`npm audit`: 0 vulnerabilities** (prod and dev).
- Data model is RLS-on-Supabase by design (can't test the live DB without creds,
  but the client posture — anon key only — is correct).

## 📱 Responsive / cross-device — PASS
- **Zero horizontal overflow** on every route at 375 (mobile), 768 (tablet),
  1280/1920 (laptop/desktop).
- **Short landscape (740×360):** games grow and the page **scrolls** (no
  clipping); primary actions reachable.
- New painted backgrounds, the Tap It Out redesign, Village, Space game, and
  dashboards all stack/scale cleanly. Touch targets ≥ 40px (prior pass).
- *Minor polish (not a bug):* Tap It Out shows two helpers (Chip's band + the
  corner Sprout) — slightly redundant now that Chip is the companion.

## 🐛 Bugs — PASS
- **0 console errors** and **0 broken images** across all 14 routes.
- No leftover debug code (one legit `console.warn` on a cloud-failure path), no
  `TODO/FIXME/HACK` debt. 216 tests green; clean production build.

## 🧱 Architecture / room for expansion — PASS (with optimizations)
- The **full 10-level Barton scaffold** is in place: 5 games live, 20 stubbed,
  curriculum covers all 10 levels. The data-driven **cast / curriculum / games**
  registries extend cleanly (proven by adding Chip + a whole level's art with no
  engine changes).
- Bundle: app `index` 136KB gzip + Supabase chunk 51KB gzip (already lazy). CSS
  23KB gzip. Healthy; no oversized source files.
- **Optimization opportunities (non-blocking):**
  1. **Route code-splitting** — games/tutor are eager-loaded; lazy-loading them
     would cut first paint.
  2. **WebP for character art** — ~4.4MB of PNGs could roughly halve (better on
     mobile data). Served on-demand + cached immutable today, so low urgency.

---

## 🎯 Goal/mission gap analysis

Re-read against the mission (Barton/Orton-Gillingham, audio-first Level 1,
dyslexia-affirming, one-level-at-a-time, tutoring-center platform) and the
narrative/immersion research.

### 🔴 CRITICAL — fixed this audit
- **Audio was still the TTS placeholder.** Level 1 is *audio-first, no letters*,
  yet every clip was browser TTS, which mispronounces isolated phonemes and is
  not Barton-correct. **Fix:** built `createRecordedAudioPlayer` — plays recorded
  human-voice clips from `public/audio/` and **falls back to TTS when a clip is
  missing**, so the app works fully today and upgrades clip-by-clip. Wired into
  both games. Wrote `docs/audio-recording-checklist.md` (13 phonemes + 79 words,
  exact filenames + how to record). **Action on user:** record the clips.

### 🟡 Medium — backlog (research/curriculum alignment)
- **Mode B (connect-the-pairs)** — a locked-v1 play mode, never built. All games
  are sort/tap; a matching mode adds variety + a second recall pathway.
- **Barton tile colors** (consonant = blue, vowel = yellow, unit = red) — not yet
  honored on Level 2+ letter tiles. Our planets are deliberately hue-randomized so
  colour never cues the answer; Barton instead *teaches* with colour. Worth a
  deliberate decision: adopt Barton's colour-coding on letter tiles (a teaching
  aid) while keeping the answer itself uncued.

### 🟢 Tracked clusters (from the user's running notes)
- Accessibility: dyslexia-friendly font + toggles (Pip/eggs/sounds/haptics).
- Data/tutor: fix the awkward session-history chart; real time/accuracy graphs;
  deeper data capture; audit Pip's coaching corner vs Barton/OG + dyslexia research.
- Engagement: "ask Pip anything" nav, trickster button, more easter eggs.
- Bigger features: sticker book, random gifts, richer profiles, parent/tutor
  sign-in, evolving themes.

### 🔵 Expected (by design)
- Levels 3–10 are stubs — intentional, we master one level at a time.

---

## Recommended next 3 (highest mission impact)
1. **Record the audio** (user) — turns the core teaching signal real. Everything
   is wired and waiting.
2. **Barton colour-coding decision** for Level 2 letter tiles.
3. **Accessibility pass** — dyslexia font + settings toggles (serves the learner
   directly, self-contained).
