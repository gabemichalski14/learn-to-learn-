# Full platform audit — 2026-06-10

Scope: security, responsive/cross-device scalability, bug-free + room for
expansion, goals/mission realignment, copyright. Gate green throughout (tsc +
eslint + 254 vitest + vite build).

## 1. Security — PASS (1 fix, 1 hardening)
- **Secrets:** no `service_role`/secret keys, no hardcoded Supabase keys/URLs in
  `src` (only `import.meta.env`). `.env*` gitignored; `.env.example` is
  placeholders with a "keep service_role out" warning. ✅
- **XSS:** no `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`,
  `document.write`. ✅
- **Auth:** both `onAuthStateChange` callbacks defer side-effects via
  `setTimeout(0)` (avoids the supabase auth-lock deadlock). Owner-demotion guard
  present in `redeem_invite`. ✅
- **RLS:** authorization is keyed off **server tables** via SECURITY DEFINER
  helpers (`is_owner`, `is_assigned_tutor`, `is_guardian_of`,
  `current_center_id`) with pinned `search_path` — never user-editable JWT
  metadata. learners/sessions/skill_events/achievements: read = owner ∨
  assigned-tutor ∨ guardian; write = owner ∨ assigned-tutor; cross-center
  isolation via `current_center_id()`. ✅
- **Headers (vercel.json):** strict CSP (`default-src 'self'`, `object-src
  'none'`, `frame-ancestors 'none'`, scoped `connect-src` to supabase, no
  `unsafe-eval` for scripts), nosniff, X-Frame-Options DENY, HSTS preload,
  Referrer-Policy, Permissions-Policy. ✅
- **FIXED — staff-note privacy leak (introduced in P6):** the note was a column
  on `learners`, whose read policy includes guardians → a parent could query the
  "staff-only" note. Moved to a dedicated `staff_notes` table with RLS = owner ∨
  assigned-tutor only (never guardian).
- **FIXED — migration ordering landmine:** the foundational
  `roles-and-accounts.sql` sorted *last* alphabetically, and `redeem_invite` was
  redefined across several files; a filename-order apply on a fresh DB would
  clobber the owner-safe `redeem_invite` with the base/un-guarded one. Added
  numeric apply-order prefixes (01–05), removed the superseded move-tutor
  migration (fully subsumed by `redeem-guard-owner`), and documented the order +
  restore SQL in `migrations/README.md`.

## 2. Responsive / cross-device — PASS
- No horizontal overflow at 320, 360, 390, 414, 768, 1440 on Home, Levels,
  Account, and a game surface (scrollWidth == innerWidth at every width). ✅
- No console errors. Mobile (390) render verified: cozy aesthetic intact,
  narrative + mascot + drop-cap + footer disclaimer present, touch targets ≥44px.
- `viewport` meta present; motion honors `prefers-reduced-motion` (19 files); no
  animated `filter`/`backdrop-filter` (the rasterization lag-bug rule). ✅

## 3. Bugs + expansion — PASS
- Gate: 254 tests pass; no TODO/FIXME/HACK in `src`. ✅
- Expansion headroom: content packs are data-driven; level gate + generalized
  SpaceSort + per-level story framework support adding Levels 3–10 without
  engine changes. Bundle is code-split (supabase, Lottie, Rive in separate lazy
  chunks). ✅

## 4. Copyright / IP — PASS
- "Barton" appears only nominatively: the SiteFooter non-affiliation disclaimer
  and internal code comments on the (uncopyrightable) sequential-mastery method.
- No reproduction of Barton word lists / sentences / scripts / materials.
  Content packs are original everyday words. `NOTICE` + `LICENSE` present. ✅

## 5. Goals / mission realignment + gaps
Mission: a structured-literacy (Barton-aligned) phonics game for Learn to Learn —
cozy storybook world, personified Pip, **data-driven personalization**, and
tutor/parent/owner tooling; difference-not-deficit, intrinsic motivation (no
FOMO/decay). The data→personalization→display→adapt loop now exists end-to-end.

**Gap backlog (enhancement, not defects) — prioritized:**
1. **First-try into the mastery *score*.** We collect + display first-try
   accuracy, but the band (mastered/practising) still uses all-attempts
   `scoreOf`. Research says mastery = first-try ≥90% over ≥2 sessions. Wiring
   first-try + a multi-session check into the score is the highest-value
   alignment fix. (Touches `mastery.ts` + the level gate — do carefully.)
2. **Retention/review into round generation.** "Keep fresh" is surfaced, and
   confusion-contrast adapts gameplay, but stale mastered items aren't yet
   interleaved into new rounds (spaced cumulative review). Extend the adaptive
   selector.
3. **Adaptivity beyond SpaceSort.** Minimal-pair contrast currently fires only in
   the sorting game (correct boundary), but retention interleave + 85%-zone
   focus could extend to the other games' round builders.
4. **Mastery threshold doc.** Gate `PASS_BAR=0.95` vs dashboard mastery `0.90` vs
   research "90% instructional" — defensible (gate stricter), but worth a one-line
   note so it's intentional, not drift.
5. **Content depth.** Only Levels 1–2 are built; the curriculum tag + architecture
   are ready for 3–10. This is the main product-growth lever.
6. **Abandoned-session tracking** (deferred from P6) — lowest ROI; struggle is
   already captured via accuracy + wrong_attempts + admin triage.

No additional external research was warranted — the gaps are build-roadmap items
already grounded by this session's research (85% Rule, minimal pairs, spaced
interleaving, first-try accuracy, audience-matched display).

## Verdict
No open security risks, no responsive breakage, no bugs, no copyright exposure.
Two real issues found and fixed (staff-note privacy, migration ordering). The
remaining items are an enhancement roadmap, led by wiring first-try into the
mastery score.
