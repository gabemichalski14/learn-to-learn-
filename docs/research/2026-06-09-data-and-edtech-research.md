# Data Collection + EdTech Research → What Would Make Our System Better
_2026-06-09 · research synthesis + brainstorm. Sources at the bottom._

## 1. How modern products collect & store data
- **Event-based telemetry (clickstream).** Every meaningful interaction is an immutable
  event: `actor · action · object · context · timestamp`. Governed by a written
  **tracking plan / taxonomy** (a data dictionary) and **schema-validated on ingest**.
- **EdTech standard shape:** xAPI ("Tin Can") and Caliper Analytics both model learning as
  **Actor–Verb–Object** statements/events. Shaping our events this way = portable + future-proof.
- **Storage pattern:** events stream → validate/enrich → land in a **warehouse you own**
  (immutable single source of truth) → *derive* aggregates/dashboards. Raw stays raw.

## 2. Compliance (binding for kids + schools)
- **COPPA (amended 2025; in effect Jun 23 2025, compliance Apr 22 2026):** expanded PII
  (biometrics, gov IDs); **separate** verifiable parental consent before any third-party
  sharing; **no indefinite retention** (keep only as long as needed); written security program.
- **FERPA:** vendor acts as a **"school official"** under a data-privacy agreement — no
  commercial use / data mining, minimize collection, delete/de-identify when done; school &
  parents own the records.
- **Privacy-by-design / data minimization (GDPR Art.5):** collect only what's necessary;
  pseudonymize; PIA before launch.

## 3. How the best literacy apps personalize (Lexia Core5 et al.)
- **Comprehensive adaptive initial assessment** (branching logic) → an **individualized path**.
- **Embedded assessment**: progress is measured *from normal play* — no separate test —
  identifying risk, **predicting** end-of-year level, and **prescribing** instructional intensity.
- Covers the structured-literacy strands explicitly (PA, phonics, fluency, …).

## 4. The personalization engine: Bayesian Knowledge Tracing (BKT)
- The industry-standard learner model (Corbett & Anderson 1994): a per-skill **latent mastery
  probability**, updated each attempt via interpretable **guess / slip / learn** parameters
  (a hidden Markov model). Drives "more or less practice as needed" and a principled mastery cutoff.
- More robust than a raw accuracy average: it accounts for lucky guesses and careless slips,
  so "mastered" means *mastered*.

## 5. What educators actually want from a dashboard
- The #1 failure mode: **teachers drowning in non-actionable data.** Dashboards must surface
  **error analysis** (which patterns are confused), **risk/prediction**, and a **clear next
  action** — per-student *and* a class summary — not raw spreadsheets.

---

## What this means for us — gaps vs. what we have

| Area | We have | The upgrade |
|---|---|---|
| **Learner model** | recency-weighted accuracy (`scoreOf`), 0.8/0.95 bars, adaptive weakest-sound weighting | **BKT** probabilistic mastery (guess/slip/learn) — better "mastered" + placement decisions |
| **Placement** | everyone starts at L1; mastery inferred from play | **Intake/placement (slice ⓪)** seeds the model from WIST/paper on day 1 |
| **Retention** | mastered → character goes home, sound dropped | **Spaced review**: resurface mastered sounds after N days to confirm retention (anti-forgetting) |
| **Educator view** | per-skill mastery, accuracy/time charts, weak areas | **Actionable map (slice ③)**: curriculum dots + error analysis + a "do this next" line + risk flag, now enriched with replay + response-time |
| **Data foundation** | local-first events → durable outbox → Supabase (RLS, anon key) | **Governed event taxonomy** (xAPI-shaped, validated) + **retention policy** + written **consent/privacy posture** |

## Recommended build order
1. **BKT learner model** — highest leverage; every other feature gets smarter (placement, "mastered", adaptivity, the map). Self-contained, testable, no UI churn.
2. **Intake & placement (⓪)** — seed BKT from your real assessments (needs your WIST/paper format).
3. **Actionable educator + parent map (③)** — read BKT + error patterns + the new signals.
4. **Spaced review** — durability of mastery.
5. **Event taxonomy + retention/consent posture** — fold in as the compliant foundation (some already in place).

## Sources
- FTC, *Finalizes Changes to Children's Privacy Rule* (COPPA 2025) — ftc.gov
- ED, *Education Technology Vendors / Protecting Student Privacy* (FERPA) — studentprivacy.ed.gov
- 1EdTech, *Caliper Analytics*; xAPI overview — 1edtech.org
- Snowplow, *Ultimate guide to product analytics*; Trackingplan, *Privacy by Design*; Ethyca, *Data Minimization*
- Lexia, *Core5 & the Science of Reading* — lexialearning.com
- *Bayesian Knowledge Tracing* — emergentmind.com (Corbett & Anderson 1994)
- Backpack Interactive / TAO / Renaissance eduCLIMBER — educator dashboard best practices
