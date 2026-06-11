# Monetization — tiered access (ON HOLD)

Status: **deferred.** Build the curriculum, games, and account system first; take
this on afterward. The earlier level-based freemium gate was reverted (commit
`21a1566` + its revert `25341c4`) because (a) it blocked building/testing Level 2+
and (b) it gated by *level*, which is NOT the model below.

## The model (3 tiers)

| Tier | Who | Gets |
|------|-----|------|
| **Free preview** | Public / prospects (no payment) | The **first game of *each* level** is playable, plus a **limited** amount of the graphs/tips (a teaser of the data). |
| **Paid (individual)** | A consumer who pays | Unlocks **the rest of the games** in every level **and the full data** (all graphs/tips). |
| **Tutoring-center client** | A student under a paying center | **Unlimited, free** — every game, unlimited turns, full data collection. The *center* pays; their students get everything at no extra cost. |

## Key implications (resolve when resuming)
1. **Gating granularity is per-GAME-within-level**, not per-level. So we need a
   notion of "first game of a level" (an ordered game list per level) and gate
   games beyond the first for free users.
2. **Data is tiered too:** free = a limited subset of graphs/tips; paid + center
   = full. Need a "data depth" entitlement, not just game access.
3. **Entitlement source:**
   - Center-client = the learner belongs to a paying center (RLS already scopes
     learners to a center; add a `center.plan`/`subscription` flag).
   - Paid individual = an entitlement on that account (a `subscriptions` table /
     billing provider — Stripe etc.).
   - Free = signed out OR a signed-in account with no entitlement.
4. **Conversion path (the funnel gap):** prospects currently can't self-sign-up
   (center creation is invite-only). Decide: self-serve trial signup vs
   sales-led ("request access"). Required for the paid-individual tier to convert.
5. **Billing integration:** none yet. Likely Stripe (Checkout + webhook → set the
   entitlement). Out of scope until the above are settled.

## Prerequisites before building this
- **Curriculum** mapped (levels → ordered games → lessons) so "first game of each
  level" + "the rest" are well-defined.
- **Games** for the curriculum built (currently L1 Garden + L2 Space).
- **Accounts** finalized (owner/tutor/parent/center; how a "paying center" and a
  "paid individual" are represented).

## What already exists that this will build on
- Per-game/per-level structure (`games.ts`, `levelGate.ts`), the mastery gate,
  `LockedScreen`.
- Auth + roles + RLS-scoped center/learners; guest-vs-account roster separation
  (commit `f40b970`).
- The reverted gate (`21a1566`) shows the wiring points (App routing + a
  `LockedScreen` lock variant) — useful reference, but re-do per-game, not
  per-level.
