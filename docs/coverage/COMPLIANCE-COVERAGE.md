# Compliance Coverage Map

> Checked against `src/coverage/coverage.ts` (test #10). Legend: ✅ covered ·
> ⚠️ partial · ❌ missing. **This is an engineering self-map, not legal advice** —
> the quarterly sweep's compliance agent re-checks against current rules, and
> counsel review is required before broad child sign-up. Anchor authorities:
> COPPA (2025 amended rule) · UK Children's Code · GDPR-K · FERPA · US state laws.

Required domains: `privacy-data` · `consent` · `retention-deletion` ·
`age-assurance` · `transparency-notices` · `school-use`.

⏰ **Time-bound:** the COPPA amended-rule compliance deadline is **2026-04-22**
(`c-security-program` WISP requirement) — tracked here so it can't slip silently.

## Components

| id | domain | status | where / note |
|----|--------|--------|--------------|
| `c-data-minimization` | privacy-data | ✅ | First-name + results only; signals derived on-device (derive-don't-collect) |
| `c-no-biometric` | privacy-data | ✅ | No child-voice capture (voiceprint = biometric — hard line); playback-only audio |
| `c-no-behavioral-ads` | privacy-data | ✅ | No ads, no third-party trackers, profiling off by default |
| `c-no-detrimental-use` | transparency-notices | ✅ | Dark-pattern prohibition = the walk-the-line bright lines |
| `c-state-opt-out` | privacy-data | ✅ | We never sell or share child data |
| `c-consent` | consent | ⚠️ | Account gating exists; formal VPC flow (KBA/gov-ID) not implemented |
| `c-retention-deletion` | retention-deletion | ⚠️ | Local-first + center RLS; self-serve cloud deletion/export pending |
| `c-age-assurance` | age-assurance | ⚠️ | Content provably age-appropriate; explicit age-assurance gate not built |
| `c-transparency` | transparency-notices | ⚠️ | NOTICE + disclaimers; full + child-friendly privacy notices pending |
| `c-school-ferpa` | school-use | ⚠️ | Center-scoped RLS; formal FERPA DPA + parent-access workflow pending |
| `c-security-program` | privacy-data | ⚠️ | Engineering controls in place; documented WISP pending (**deadline 2026-04-22**) |
| `c-dpia` | consent | ❌ | No DPIA on file; required for UK/EU rollout |

## Honest gaps (ranked by stakes)

1. **`c-consent` (⚠️) + `c-dpia` (❌)** — a formal verifiable-parental-consent flow
   and a DPIA are prerequisites for broad child sign-up / UK-EU rollout.
2. **`c-security-program` (⚠️)** — a *written* information security program is a
   COPPA 2025 requirement with a hard **2026-04-22** deadline.
3. **`c-retention-deletion` / `c-transparency` / `c-school-ferpa` (⚠️)** — self-serve
   deletion, full privacy notices, and a FERPA DPA round out the posture.
