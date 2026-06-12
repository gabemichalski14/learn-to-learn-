# Game (Engagement & Ethics) Coverage Map — "Walk the Line"

> Checked against `src/coverage/coverage.ts` (test #10). Legend: ✅ covered ·
> ⚠️ partial · ❌ missing. Two `kind`s: **lean-in** (white-hat maximizers we adopt
> to the hilt) and **bright-line** (mechanics we NEVER cross). Anchor frameworks:
> MDA · LeBlanc's 8 Kinds of Fun · Octalysis · SDT · UNICEF RITEC-8 · Quantic Foundry.

Required domains: `motivation` · `aesthetics` · `loop-feel` · `difficulty` ·
`ethics` · `wellbeing` · `session-retention` · `accessibility` · `audience-split`.

## Lean-in maximizers (DO — keep adopting)

| id | domain | status | where |
|----|--------|--------|-------|
| `g-intrinsic-integration` | loop-feel | ✅ | The answer IS the learning act (not a separate reward) |
| `g-juice` | aesthetics | ✅ | Success-beat juice: hit-pause, scale-punch, layered sound |
| `g-narrative` | motivation | ✅ | Endogenous fantasy + story spine ("Sound Garden gone quiet") |
| `g-companion-bond` | motivation | ✅ | Relatedness — Pip + per-level cast |
| `g-autonomy` | motivation | ✅ | Real choices; skippable flourishes |
| `g-competence` | motivation | ✅ | Visible, earned mastery (growing garden) |
| `g-personalization` | motivation | ✅ | Ownership + creativity (named plantings) |
| `g-difficulty` | difficulty | ✅ | Adaptive ~85%-success ZPD / flow |
| `g-flow-loop` | loop-feel | ⚠️ | Clean loop; workshop chrome congruence debt (#123) |
| `g-discovery` | aesthetics | ⚠️ | Living World + easter eggs; depth can grow |
| `g-reward-the-return` | session-retention | ✅ | Warm welcome-back, **never decay** |
| `g-wellbeing` | wellbeing | ✅ | Emotionally-costless failure / no-shame |
| `g-session-length` | session-retention | ✅ | Snackable rounds + clean natural stop points |
| `g-accessibility` | accessibility | ✅ | Reduced-motion, ≥40px targets, audio-first |
| `g-co-play` | motivation | ⚠️ | Adult co-play tooling; no guided shared-session mode |
| `g-audience-split` | audience-split | ⚠️ | Child loop free; monetization adult-facing (Phase E) |

## Bright lines (NEVER — enforced now; ethics source-scan = P2/#6)

| id | domain | status | where |
|----|--------|--------|-------|
| `g-no-variable-reward` | ethics | ✅ | No variable-ratio/random rewards or loot boxes |
| `g-no-streaks-fomo` | ethics | ✅ | No streaks / FOMO / scarcity / countdowns / decay |
| `g-no-dark-social` | ethics | ✅ | No child-facing leaderboards / peer-ranking / public scores |

Full bright-line list (re-enforced each sweep): variable-ratio rewards · streaks &
streak-loss · FOMO/scarcity/countdowns · decay/"wilting" guilt · leaderboards/peer
comparison · re-engagement push nags · guilt-tripping companion · appointment
mechanics · infinite scroll/autoplay · extrinsic coin/loot economies bolted beside
learning · child-voice capture or child PII beyond first-name+results · onboarding
friction. (P2 adds an `ipGuard`-style source scan so accidental reintroductions
fail the build; subtle drift is caught by the Layer-3 human ethics audit.)
