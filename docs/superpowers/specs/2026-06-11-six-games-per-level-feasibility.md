# 6 games per level — feasibility R&D (go / no-go)

**The question (your bar):** can EVERY level have ~6 games, each adding to the
story arc, with **curriculum, data collection, and story all at an exemplary /
"200% accurate" level**? Pursue it only if yes.

## Verdict — **conditional GO**
All three pillars *can* hit exemplary, because the frameworks are already proven
on L1–L3 and are skill-agnostic. But only under two conditions:

1. **Build it as a SYSTEM, not 60 bespoke games** — a reusable *game-archetype
   library* + per-level curriculum/character/data content.
2. **"6" is a target met by a curriculum-driven 5–7, never a padding quota.**
   Forcing exactly 6 on a thin level (e.g. silent-e) means reskinning the same
   mechanic — the *opposite* of exemplary. Let the curriculum set the count.

Art is explicitly **out of your three pillars** and must be a separate track
(Patch is still an emoji) — see Risks.

---

## Pillar 1 — Curriculum (exemplary? **yes, via archetypes**)
The 10 levels span the full structured-literacy progression (PA → CVC → blends/
digraphs/closed syllables → syllable division & the 6 syllable types → vowel teams
→ r-controlled → silent-e → morphology/affixes → roots). That's ample distinct
sub-skills for ~6 games at *most* levels.

The exemplary unit is **not "6 bespoke games" but a game-archetype library** —
~9 reusable, research-backed mechanics (OG/structured-literacy activity types):

| Archetype | Skill it trains | Status |
|---|---|---|
| Tap-It-Out | phonemic awareness (segment) | ✅ built (L1) |
| Sort (minimal-pair) | discrimination by sound/pattern | ✅ built (L2/L3) |
| Build/Blend | encode a heard word from tiles | ✅ built (StarStation, Blend Buddies) |
| Rule-Apply | spelling generalizations (ck, FLOSS…) | ✅ built (Rule Breakers) |
| Chop | segment / syllable-divide | ✅ built (Chop Shop) |
| **Dictation** | spell what you hear (encode) | ➕ new |
| **Fluency** | timed accuracy (rate + accuracy) | ➕ new |
| **Morph-Build** | assemble prefix + root + suffix | ➕ new |
| **Match** | sound ↔ symbol pairing | ➕ optional |

We already have **5–6 archetypes**; ~3 new ones complete the library. Each level
instantiates the archetypes its skills need → naturally ~5–7 games, all
pedagogically justified (no padding). Per-level fit sketch: L1 PA (6 oral skills —
rich), L4 syllable division (6 syllable types — strong 6), L5/L10 morphology
(Morph-Build — strong 6); **L6 silent-e is thin → an honest 4–5.** Hence the
flexible count is *required* for exemplary.

**Curriculum accuracy ("200%")** = alignment to the public science-of-reading
progression + correct linguistics, with **all word lists ORIGINAL** (never
Barton's). The decisive QA here is *you* — Learn to Learn's own tutoring expertise
should review every pack; that's the difference between "good" and exemplary.

## Pillar 2 — Story (exemplary? **yes, with an authoring commitment**)
The cast framework already does the exact thing you asked ("each game adds to the
arc"): one character per level (Pip constant), their pieces scattered across the
level's games, recovered as the child masters each → the level's games *are* the
arc. Proven with Moss (L2) and Patch (L3).

Scaling to 10 = 10 distinct **dyslexic strengths** (Eide MIND: Material✓Moss,
Interconnected✓Patch, Narrative, Dynamic, + auditory✓Chip, creative, empathic,
resilient, pattern-finder, verbal) × 10 distinct **psychology levers** (Bandura's
escalating self-efficacy sources, SDT, protégé effect, goal-gradient…). There are
enough distinct, research-grounded angles. The exemplary bar = each character's
strength + wound *is* that level's curriculum skill (Patch's blend-reduction = the
L3 error). Achievable per level with care.

**This is the labor-heavy pillar:** 10 character "bibles" + authored, gated,
no-repeat dialogue pools + per-game arc beats. It's writing *volume*, not a
feasibility wall — the framework holds.

## Pillar 3 — Data (exemplary? **yes — already proven, the safest pillar**)
The skill_events pipeline + personalization engines (confusion, first-try mastery,
fluency, retention, adaptive-toward-weakest) are **skill-agnostic** — they already
run on L1–L3's keys including L3's blend/digraph/rule/syll keys, with **no schema
change**. 60 games → the same pipeline.

"200% accurate" data = (a) a **complete skillKey taxonomy** for all 10 levels
(every sub-skill keyed) + (b) **rigorous per-game logging** (correct / chosen /
first-try / latency) — exactly the L3 pattern. Both are extensions of what exists.

---

## What exemplary requires (architecture)
1. **Game-archetype library** — ~9 parameterized, tested mechanics (3 new + the
   5–6 built).
2. **Per-level curriculum pack** — original word lists + skillKeys + which
   archetypes (5–7) the level uses (level3.ts, scaled).
3. **Per-level character bible** — strength + lever + persona + fragments (one per
   game) + teaching + reactions (cast.ts, scaled).
4. **Existing data pipeline** — unchanged; new skillKeys flow through.
5. **A gold-standard reference level** — finish ONE level to exemplary as the
   template + the bar every other level must meet.

## Risks / honest caveats
- **Authoring volume (story)** is the real cost — 10 arcs + dialogue. This is a
  multi-month roadmap, not a sprint.
- **Thin levels** (silent-e) — resist padding; let the count flex 4–7.
- **Art is a separate track.** Your three pillars exclude it, but "exemplary"
  *visuals* for 10 characters × ~6 games need the real art pipeline (Road A).
  Decouple it, or the felt quality slips even when story/data/curriculum are perfect.
- **IP:** all content original; the science-of-reading scope is public, Barton's
  specific lists/sequence are not — we author our own. (Already our standing rule.)

## Recommendation — GO as a system, prove one level first
- **P0** — build the 3 missing archetypes (Dictation, Fluency, Morph-Build) + a
  per-level content schema.
- **P1 — the gold standard:** finish **Level 3 → 6 games** to exemplary (curriculum
  + Patch's full arc + complete data taxonomy). **Review it together.**
- **Decision gate:** if the finished L3 doesn't *feel* exemplary, stop — we've
  risked one level, not ten.
- **P2+** — roll out level-by-level (L4 next): curriculum pack → character bible →
  5–7 archetype games → data taxonomy → gate. Each held to the L3 bar, with your
  tutoring expertise validating curriculum accuracy.

**Bottom line:** the bar is reachable on all three pillars you named, because the
machinery is built and proven — the gate is *authoring effort + a deliberate
prove-one-level-first discipline*, not technical feasibility. The smart move is to
commit to P0+P1 only, then decide P2+ from a real exemplary example.

Sources: [structured-literacy scope & syllable types](https://pridereadingprogram.com/structured-literacy-scope-sequence/),
[OG multisensory activity types](https://www.orton-gillingham.com/what-is-structured-literacy/),
[OG evidence base](https://pmc.ncbi.nlm.nih.gov/articles/PMC8497161/).
