# Level 3 — design (curriculum · games · story arc · data)

Status: **research + design, for review.** Level 3 is registered (`games.ts`) as
**"Closed Syllables & Spelling Rules"** with stub games *Chop Shop* + *Rule
Breakers*. This fleshes it out, grounded in structured-literacy research and the
established systems (one-character-per-level cast, the sort engine, skill_events).

## 1. Curriculum (what L3 teaches, in order)
After L1 (phonemic awareness) and L2 (consonants + short vowels / CVC), the
evidence-based next steps are blends → digraphs → closed-syllable patterns →
first spelling rules. Teach one element at a time, in isolation before mixing.

1. **Consonant blends** — initial (bl, cl, fl, gl, pl, sl, br, cr, dr, fr, gr,
   pr, tr, sc, sk, sm, sn, sp, st, sw) and final (nd, nt, mp, st, sk, lt, lp, ft…).
   Prereq: automatic letter sounds + fluent CVC. **The central challenge is *blend
   reduction*** — kids drop a consonant ("sip" for "slip") because it's easier to
   say. This is THE skill L3 must build and measure.
2. **Consonant digraphs** — sh, ch, th (voiced/unvoiced), wh, ck, ng (two letters,
   one sound — distinct from blends, where both sounds are heard).
3. **Closed syllables (advanced)** — CCVC/CVCC; then 2-syllable VC|CV words
   (rab·bit, nap·kin), keeping the vowel short because it's "closed in."
4. **First spelling rules** — the **-ck rule** first (after a short vowel: ck),
   then the **FLOSS(Z) rule** (1-syllable word, short vowel → double final f, l,
   s, z: puff, bell, miss, buzz). These are introduced *after* ck because they're
   the most regular, lowest-decision rules — a confidence win.

(All word lists ORIGINAL — never reproduce Barton's lists. The *skills* above are
general structured literacy, not proprietary.)

## 2. Games (4; reuse engines where possible)
| Game | Teaches | Mechanic | Reuses |
|------|---------|----------|--------|
| **Blend Buddies** (headliner) | initial/final blends, anti-reduction | build/say a CCVC word where BOTH blend consonants must be placed/tapped — neither can vanish; the two consonants "hold hands." Directly fights blend reduction. | Star Station word-build pattern |
| **Sort It** (digraphs) | sh/ch/th/wh/ck/ng | sort words by their digraph into bins | the L2 **sort engine** (`useSortGame`) almost verbatim |
| **Rule Breakers** | -ck then FLOSS(Z) | given a short-vowel word, pick the correct ending (k vs ck; single vs doubled f/l/s/z) | new small multiple-choice game |
| **Chop Shop** | VC\|CV syllable division | chop a 2-syllable closed word at the boundary (rab·bit) | segment-style interaction (Tap It Out family) |

Headliner = **Blend Buddies** (it carries the character arc + the key skill).
Ship it + the character first; the other three follow.

## 3. Story arc / character (fits the cast framework)
One new character (Pip stays the constant companion). Must use a **distinct
dyslexic strength + psychology lever** from the cast so far:
- L1 **Chip** — *musical ear* (auditory/whole-song) · lever: protégé effect.
- L2 **Moss** — *spatial sense* · lever: vicarious mastery / self-efficacy.
- **L3 (new): *interconnected reasoning*** — sees how parts connect into a whole
  (the documented dyslexic strength for systems/relationships). Perfect for
  **blends = joining sounds**.

Proposed character — a **builder/weaver** in a new **Workshop / Tinker's Cove**
world (matches the *Chop Shop* / *Rule Breakers* tone):
- **Strength:** a connector — braids/bolts sounds together; sees how every piece
  links into a word.
- **Flaw (curriculum-anchored):** squeezes a blend so tight one sound falls off
  (literal blend reduction — "slip" → "sip"); rushes to mash two sounds into one.
- **Need:** two sounds can hold hands AND both still be heard; a short vowel stays
  short when it's "closed in." The arc heals exactly the L3 skill.
- **Lever (new):** *competence/mastery orientation* — the quiet power of a
  reliable rule ("now I always know"). A spelling rule isn't a chore; it's a
  superpower they unlock. (Different from Chip's teaching-lever and Moss's
  watch-it-click lever.)
- Slots into the existing `LevelCharacter` shape: `fragments` (scattered across
  L3's games → recovered as mastery rises), `teaching` (the Village lesson =
  their method as their gift), `reactions`, `art`. Name/world are the owner's
  call — candidates: **Bolt, Twine, Patch, Rivet, Knit**.

## 4. Data collection (extends the model; mostly new skillKeys)
The skill_events pipeline already carries correct / chosen / first_try /
latency / level. L3 needs finer skillKeys + one genuinely new insight:
- **New skillKeys:** `blend:init:<bl>`, `blend:final:<nd>`, `digraph:<sh>`,
  `rule:ck`, `rule:floss`, `syll:vccv`. (Encodes which blend/digraph/rule.)
- **Blend-reduction insight (new, high value):** when a CCVC item is wrong, log
  *which consonant in the blend was dropped* via the existing `chosen` field
  (chose the CVC "sip" for target "slip"). Surface on the dashboard like
  confusions: *"often drops the /l/ in l-blends."* This is the L3 analogue of the
  P4 confusion engine — reuse `confusions()`.
- **Rule application:** `rule:ck` / `rule:floss` first-try accuracy = "has the
  rule clicked." Feeds the Accurate→Automatic tier.
- **Syllable boundary:** correct vs chopped at the wrong VC|CV point (chosen =
  the wrong cut). Another confusion-style signal.
- No schema migration needed — these ride the existing columns. The personaliz-
  ation engine (confusions, first-try mastery, retention) works as-is on the new
  skillKeys.

## 5. Phasing (mirror how L1/L2 shipped)
- **P0 — content pack:** original L3 word lists (blends, digraphs, ck/floss,
  2-syllable closed) + the new skillKeys + the Workshop world theme stub.
- **P1 — Blend Buddies + the character arc end-to-end** (the headliner: skill +
  fragments + Village lesson + reactions), like Moss in L2. The vertical slice.
- **P2 — Sort It (digraphs)** via the sort engine + **Rule Breakers** (ck/floss).
- **P3 — Chop Shop** (syllable division) + the L3 hub polish.
- **P4 — Data surfacing:** blend-reduction insight + rule-mastery on the tutor
  dashboard (reusing the P4/P5 engines).

## Deep-dive: alignment with research, psychology + mission (verified)
Decision: **name = Patch, build all 4 games.** Before building, validated the
arc + data against the research and the cast framework — two findings sharpened it:

**1. A meta-arc across levels (escalating self-efficacy).** Bandura's four sources
of self-efficacy are *ranked*: enactive mastery (strongest) > vicarious > verbal
persuasion > affective. So the cast deliberately climbs the ladder as the child
grows more capable:
- L1 **Chip** — protégé effect (you teach him → verbal/relational).
- L2 **Moss** — **vicarious** mastery (you watch a lost sound click home).
- L3 **Patch** — **enactive mastery** (YOU apply a rule and it works *every time*)
  — the strongest source. Bandura: vicarious *bootstraps* the first enactive
  mastery, so Moss → Patch is the correct developmental order.

**2. MIND-strengths traversal (Eide, *The Dyslexic Advantage*).** Each level
affirms a different dyslexic strength: Moss = **Material/spatial**; Patch =
**Interconnected reasoning** (seeing how parts connect into a whole) — the perfect
metaphor for *blends = sounds joining*. Difference-not-deficit throughout: Patch's
interconnected mind is the gift; blend-reduction is just "the slippery part."

**Per-game — mechanic ↔ psychology ↔ data (each is principled, not just a toy):**
| Game | Heals / teaches | Psychology principle | Data signal |
|------|-----------------|---------------------|-------------|
| **Blend Buddies** | blends; un-does reduction | enactive mastery + "both sounds heard" (Patch's wound) | first-try on `blend:*`; **`chosen` = the dropped consonant** → reduction insight |
| **Sort It** | digraph discrimination | minimal-pair contrast (sh vs ch) — the evidence-based digraph method | `chosen` = the confused digraph → confusion engine |
| **Rule Breakers** | -ck → FLOSS | enactive mastery — the *rule-unlock* (the lever's heart): apply it, it always works | first-try on `rule:ck` / `rule:floss` = "rule has clicked" |
| **Chop Shop** | VC\|CV chunking | interconnected reasoning — see the word's parts (Patch's strength) | `chosen` = the wrong cut → boundary confusion |

**Data method confirmed against our pipeline:** all four ride the existing
skill_events (correct/chosen/first_try/latency/level) + the P4 personalization
engine (confusions ≥3, first-try mastery, fluency, retention) with NO schema
change — the new skillKeys just flow through. Blend-reduction = the L3 analogue of
the b/d confusion (reuse `confusions()` + `confusionPhrase()`), framed
developmentally + no-shame ("often drops the /l/ in l-blends — very common").

**Gaps surfaced + how handled:**
- *Adaptive minimal-pair contrast* is free for **Sort It** (it reuses
  `useSortGame` + `GameScreen`'s confusion-contrast). **Blend Buddies** is a custom
  build game → it must (a) log `chosen` = the omitted blend consonant, and (b)
  optionally pair a confusable blend; (a) is required for the reduction insight,
  (b) is a nice-to-have.
- *Patch's art*: light flat/emoji presence now (per the art-direction decision —
  no hand-coded SVG scenery); his deep animated art + full fragment/teaching arc
  come in the art pass. The arc's *framing* (flaw heals the skill, no-shame) is
  honored in copy now; mission intact.

**Confidence: high.** The mechanic, the psychology lever, the dyslexic strength,
and the data signal are the SAME thread per game — and the level escalates both the
MIND-strength and the self-efficacy source. Cleared to build P1→P3.

Sources (psychology): [Bandura — sources of self-efficacy, mastery strongest](https://www.simplypsychology.org/self-efficacy.html),
[Eide — MIND strengths](https://www.dyslexicadvantage.org/dyslexic-mind-strengths/).

## Open decisions for the owner
1. Character **name + world theme** (Workshop/Tinker vs another).
2. Game count for v1 — all 4, or headliner + 2?
3. Whether L3 unlock stays gated on passing L2 at 95% (students) — owner already
   bypasses.

Sources: [OG scope & sequence](https://mrsjudyaraujo.com/orton-gillingham-overview/),
[blends order](https://weallcanread.com/orton-gillingham-principles/),
[blend-reduction error](https://thriveedservices.com/spotting-and-correcting-common-decoding-errors/),
[CCVC instruction](https://fivefromfive.com.au/phonics-teaching/essential-principles-of-systematic-and-explicit-phonics-instruction/blending-and-segmenting/),
[FLOSS(Z) rule](https://readinguniverse.org/skill-explainer/phonics-patterns/flossz-pattern-skill-explainer/overview-of-the-flossz-spelling-rule).
