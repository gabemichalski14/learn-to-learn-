# Reading Coverage Map

> **The manifest is authoritative.** This narrative map is *checked against*
> `src/coverage/coverage.ts` (test #10 asserts every component `id` below appears
> here). Edit the manifest first; keep this in sync. Legend: ✅ covered · ⚠️ partial
> · ❌ missing · ⬜ out-of-scope. A "covered" claim requires ≥2 independent sources.

Required domains (each must hold ≥1 component): `content` · `delivery` ·
`bridging` · `comprehension` · `learner-variation` · `measurement`.
Anchor frameworks: NRP · Simple View · Scarborough's Rope · Active View · IDA KPS ·
Ehri (orthographic-mapping phases).

## Components

| id | domain | status | where / note |
|----|--------|--------|--------------|
| `r-phonemic-awareness` | content | ✅ | Garden PA games (Tap It Out, Switch It, Blend It), L1 |
| `r-phonics-gpc` | content | ✅ | Systematic synthetic phonics scope & sequence, L2–L4 |
| `r-blending-bridging` | bridging | ✅ | Blending GPCs → words (Blend It / Star Station) |
| `r-heart-words` | content | ✅ | Irregular high-frequency "heart" words (Plant the Word, L2) |
| `r-orthographic-mapping` | bridging | ✅ | Spaced retrieval → sight-word consolidation (memory engine) |
| `r-fluency` | delivery | ⚠️ | Word-rate via speed games; prosody + connected-text rate not yet measured |
| `r-connected-text` | delivery | ⚠️ | Decodable-text engine + Say It Again; broad passage practice pending (#118) |
| `r-comprehension` | comprehension | ⚠️ | Single meaning-check mechanic; no explicit strategy instruction |
| `r-vocabulary` | comprehension | ❌ | No explicit vocabulary / background-knowledge instruction yet |
| `r-language-structures` | comprehension | ❌ | Syntax / text structure not addressed — red-team horizon item |
| `r-self-regulation` | learner-variation | ⚠️ | No-shame retry + gentle correction; explicit metacognition minimal |
| `r-diagnostic-teaching` | measurement | ✅ | Per-skill mastery + learning-curve signals |
| `r-screener` | measurement | ✅ | Early at-risk RAN-proxy screener → pacing (L1) |
| `r-learner-variation` | learner-variation | ⚠️ | Dyslexia-aware (Pip); ADHD governor planned (Phase C) |
| `r-ell-multilingual` | learner-variation | ⬜ | ELL/multilingual — **deliberate scope boundary** (mission = profound *English* readers) |
| `r-morphology` | content | ⚠️ | Prefix/suffix/root scope mapped; games pending (L5, L10) |
| `r-syllable-types` | content | ⚠️ | Silent-e / C-LE / vowel-r scope mapped; games pending (L6, L7) |
| `r-advanced-vowel-teams` | content | ⚠️ | Advanced vowel teams scope mapped; games pending (L8) |
| `r-foreign-greek-latin` | content | ⚠️ | Foreign patterns + Greek/Latin roots scope mapped; games pending (L9) |

## Honest gaps (ranked)

1. **`r-vocabulary` / `r-language-structures` (❌)** — the comprehension half of the
   Simple View is thin. The decoding strand is strong; the language strand needs work.
2. **Levels 5–10 (⚠️)** — reading *science & scope* mapped; in-app games pending (#118).

> **North Star (scope decision, 2026-06-12):** the mission is teaching struggling
> readers to become **profound readers of English** — depth of English structured
> literacy, not multilingual breadth. **ELL/multilingual is a deliberate scope
> boundary** (`r-ell-multilingual` ⬜), not a gap; the quarterly red-team should not
> re-flag it. The real in-scope frontier is the **comprehension half** (vocabulary,
> language structures) — that's where "decode accurately" becomes "read profoundly".
