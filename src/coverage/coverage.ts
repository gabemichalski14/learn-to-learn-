/**
 * Freshness Engine — Layer 1 manifest (single source of truth).
 *
 * Maps every evidence-validated component of all THREE fronts — reading · gaming ·
 * compliance — to where/how well we cover it, which canonical frameworks it
 * satisfies, and its evidence. The guard tests in `coverage.test.ts` read THIS
 * file; the narrative `docs/coverage/*-COVERAGE.md` maps are checked against it
 * (every id here must appear there). Seeded honestly: real gaps are recorded as
 * `partial`/`missing`, never papered over.
 *
 * See docs/superpowers/specs/2026-06-11-freshness-engine-design.md.
 * P1 = this manifest + maps + tests #1,2,3,4,5,9,10. P2 adds the ethics source
 * scan (#6/#7); P3 the quarterly sweep; P4 the decodability invariant (#8).
 */

export type CoverageStatus = 'covered' | 'partial' | 'missing' | 'out-of-scope';

export type ReadingDomain =
  | 'content' | 'delivery' | 'bridging' | 'comprehension'
  | 'learner-variation' | 'measurement';
export type GamingDomain =
  | 'motivation' | 'aesthetics' | 'loop-feel' | 'difficulty' | 'ethics'
  | 'wellbeing' | 'session-retention' | 'accessibility' | 'audience-split';
export type ComplianceDomain =
  | 'privacy-data' | 'consent' | 'retention-deletion' | 'age-assurance'
  | 'transparency-notices' | 'school-use';
export type Side = 'reading' | 'gaming' | 'compliance';
export type MetaDomain = ReadingDomain | GamingDomain | ComplianceDomain;

export interface CoverageComponent {
  id: string;
  side: Side;
  domain: MetaDomain;
  title: string;
  status: CoverageStatus;
  where: string; // required (non-empty) when 'covered'
  levels?: number[]; // when level-specific
  sources: string[]; // ≥2 required for 'covered'
  frameworks: string[]; // canonical framework elements it satisfies
  kind?: 'bright-line' | 'lean-in'; // gaming ethics/engagement classification
  note?: string;
}

export interface FrameworkSpec {
  id: string;
  title: string;
  side: Side;
  elements: string[];
}

/**
 * Emergency valve: a logged, dated, capped deferral so the tripwire INFORMS
 * without hostage-taking the deploy pipeline. Never a silent skip.
 * Reserved `componentId: 'sweep'` defers the whole overdue review.
 */
export interface AcknowledgedDefer {
  componentId: string;
  reason: string;
  by: string;
  until: string; // ISO date; must be within maxDeferDays of `at`
  at: string; // ISO date when acknowledged
}

export const REQUIRED_DOMAINS: {
  reading: ReadingDomain[];
  gaming: GamingDomain[];
  compliance: ComplianceDomain[];
} = {
  reading: ['content', 'delivery', 'bridging', 'comprehension', 'learner-variation', 'measurement'],
  gaming: ['motivation', 'aesthetics', 'loop-feel', 'difficulty', 'ethics', 'wellbeing', 'session-retention', 'accessibility', 'audience-split'],
  compliance: ['privacy-data', 'consent', 'retention-deletion', 'age-assurance', 'transparency-notices', 'school-use'],
};

// --- Canonical framework registry (every element must be referenced ≥1×) ------
export const FRAMEWORKS: FrameworkSpec[] = [
  // Reading
  { id: 'NRP', title: 'National Reading Panel (5 pillars)', side: 'reading', elements: ['phonemic-awareness', 'phonics', 'fluency', 'vocabulary', 'comprehension'] },
  { id: 'SimpleView', title: 'Simple View of Reading', side: 'reading', elements: ['decoding', 'language-comprehension'] },
  { id: 'ReadingRope', title: "Scarborough's Reading Rope", side: 'reading', elements: ['phonological-awareness', 'sight-recognition', 'background-knowledge', 'language-structures', 'verbal-reasoning', 'literacy-knowledge'] },
  { id: 'ActiveView', title: 'Active View of Reading', side: 'reading', elements: ['active-self-regulation', 'bridging-processes'] },
  { id: 'IDA-KPS', title: 'IDA Knowledge & Practice Standards', side: 'reading', elements: ['structured-literacy', 'explicit-systematic', 'diagnostic-teaching'] },
  { id: 'Ehri', title: 'Ehri — orthographic-mapping phases', side: 'reading', elements: ['partial-alphabetic', 'full-alphabetic', 'consolidated-alphabetic'] },
  // Gaming
  { id: 'MDA', title: 'Mechanics-Dynamics-Aesthetics', side: 'gaming', elements: ['mechanics', 'dynamics', 'aesthetics'] },
  { id: '8KindsOfFun', title: "LeBlanc's 8 Kinds of Fun", side: 'gaming', elements: ['sensation', 'fantasy', 'narrative', 'challenge', 'fellowship', 'discovery', 'expression', 'submission'] },
  { id: 'Octalysis', title: 'Octalysis (8 core drives)', side: 'gaming', elements: ['epic-meaning', 'accomplishment', 'empowerment', 'ownership', 'social-influence', 'scarcity-drive', 'unpredictability-drive', 'avoidance-drive'] },
  { id: 'SDT', title: 'Self-Determination Theory', side: 'gaming', elements: ['autonomy', 'competence', 'relatedness'] },
  { id: 'RITEC-8', title: 'UNICEF RITEC-8', side: 'gaming', elements: ['creativity', 'identity', 'social-connection', 'emotional-regulation', 'safety-security', 'diverse-interactions', 'wellbeing-by-design', 'agency'] },
  { id: 'QuanticFoundry', title: 'Quantic Foundry motivations', side: 'gaming', elements: ['action-motivation', 'social-motivation', 'mastery-motivation', 'achievement-motivation', 'immersion-motivation', 'creativity-motivation'] },
  // Compliance
  { id: 'COPPA', title: 'COPPA (2025 amended rule)', side: 'compliance', elements: ['verifiable-parental-consent', 'data-minimization', 'retention-limits', 'no-behavioral-advertising', 'security-program', 'biometric-restrictions'] },
  { id: 'ChildrensCode', title: 'UK Children’s Code', side: 'compliance', elements: ['best-interests', 'high-privacy-default', 'no-detrimental-use', 'profiling-off-by-default', 'transparency', 'no-nudge-techniques', 'data-minimisation'] },
  { id: 'GDPR-K', title: 'GDPR (children)', side: 'compliance', elements: ['lawful-basis', 'age-of-consent', 'data-subject-rights', 'dpia'] },
  { id: 'FERPA', title: 'FERPA (school use)', side: 'compliance', elements: ['education-records', 'school-official-exception', 'parent-access-rights'] },
  { id: 'StateMinorPrivacy', title: 'US state minors’-privacy laws', side: 'compliance', elements: ['opt-out-of-sale', 'age-appropriate-design-code'] },
];

// --- Reading coverage ---------------------------------------------------------
export const READING_COVERAGE: CoverageComponent[] = [
  {
    id: 'r-phonemic-awareness', side: 'reading', domain: 'content', title: 'Phonemic awareness (segment/blend/manipulate)',
    status: 'covered', where: 'src/worlds/garden (Tap It Out, Switch It, Blend It); pa: skills', levels: [1],
    sources: ['NRP 2000', 'Brady 2020 (PA review)'], frameworks: ['phonemic-awareness', 'phonological-awareness'],
  },
  {
    id: 'r-phonics-gpc', side: 'reading', domain: 'content', title: 'Systematic synthetic phonics (GPC scope & sequence)',
    status: 'covered', where: 'src/curriculum.ts + src/reading/inventory.ts; L2–L4 games', levels: [2, 3, 4],
    sources: ['NRP 2000', 'IDA KPS 2018', 'Castles, Rastle & Nation 2018'],
    frameworks: ['phonics', 'decoding', 'explicit-systematic', 'structured-literacy', 'full-alphabetic'],
  },
  {
    id: 'r-blending-bridging', side: 'reading', domain: 'bridging', title: 'Blending GPCs into words (decoding bridge)',
    status: 'covered', where: 'Blend It / Blend Buddies / Star Station; src/reading/compose.ts', levels: [2, 3],
    sources: ['Ehri 2005', 'Share 1995 (self-teaching)'], frameworks: ['bridging-processes', 'partial-alphabetic'],
  },
  {
    id: 'r-heart-words', side: 'reading', domain: 'content', title: 'Irregular/"heart" high-frequency words',
    status: 'covered', where: 'src/worlds/space/PlantTheWord.tsx + content/packs/heartWords.ts', levels: [2],
    sources: ['Ehri 2014', 'Miles, Rubin & Gonzalez-Frey 2018'], frameworks: ['sight-recognition'],
  },
  {
    id: 'r-orthographic-mapping', side: 'reading', domain: 'bridging', title: 'Orthographic mapping via spaced retrieval',
    status: 'covered', where: 'src/world/memory/* (Leitner + tending warm-up)', levels: [1, 2, 3, 4],
    sources: ['Ehri 2014', 'Cepeda et al. 2006 (spacing)'], frameworks: ['consolidated-alphabetic', 'sight-recognition'],
  },
  {
    id: 'r-fluency', side: 'reading', domain: 'delivery', title: 'Automaticity / reading rate',
    status: 'partial', where: 'speed games (Warp Speed, Tool Time, Giant Steps); latency signals', levels: [3, 4],
    sources: ['NRP 2000', 'Kuhn & Stahl 2003'], frameworks: ['fluency'],
    note: 'Word-level rate only; prosody + connected-text fluency not yet measured.',
  },
  {
    id: 'r-connected-text', side: 'reading', domain: 'delivery', title: 'Decodable connected text (sentences/passages)',
    status: 'partial', where: 'src/reading/* engine + validator; Say It Again (L3)', levels: [3],
    sources: ['Cheatham & Allor 2012', 'NRP 2000'], frameworks: ['fluency', 'comprehension'],
    note: 'Engine + one echo-reading game shipped; broad passage practice pending (#118).',
  },
  {
    id: 'r-comprehension', side: 'reading', domain: 'comprehension', title: 'Sentence/passage comprehension',
    status: 'partial', where: 'Say It Again meaning-check (L3)', levels: [3],
    sources: ['Active View 2021', 'NRP 2000'], frameworks: ['comprehension', 'verbal-reasoning', 'language-comprehension'],
    note: 'Single meaning-check mechanic; explicit comprehension strategy instruction not built.',
  },
  {
    id: 'r-vocabulary', side: 'reading', domain: 'comprehension', title: 'Vocabulary & background knowledge',
    status: 'missing', where: '', sources: ['NRP 2000'], frameworks: ['vocabulary', 'background-knowledge'],
    note: 'No explicit vocabulary/morphology-for-meaning instruction yet (Phase C/D).',
  },
  {
    id: 'r-language-structures', side: 'reading', domain: 'comprehension', title: 'Syntax / language structures / text structure',
    status: 'missing', where: '', sources: ['Scarborough 2001'], frameworks: ['language-structures', 'literacy-knowledge'],
    note: 'Not addressed; flagged for the red-team horizon scan.',
  },
  {
    id: 'r-self-regulation', side: 'reading', domain: 'learner-variation', title: 'Active self-regulation / help-seeking',
    status: 'partial', where: 'no-shame retry loop; gentle corrective feedback; Pip prompts',
    sources: ['Active View 2021', 'Aleven et al. 2003 (help-seeking)'], frameworks: ['active-self-regulation'],
    note: 'Affective scaffolds present; explicit metacognitive strategy coaching minimal.',
  },
  {
    id: 'r-diagnostic-teaching', side: 'reading', domain: 'measurement', title: 'Diagnostic, mastery-based progression',
    status: 'covered', where: 'src/mastery/* + src/signals/* (per-skill mastery, learning curves)',
    sources: ['IDA KPS 2018', 'Beck & Gong 2013 (wheel-spinning)'], frameworks: ['diagnostic-teaching'],
  },
  {
    id: 'r-screener', side: 'reading', domain: 'measurement', title: 'Early at-risk screener (RAN proxy → pacing)',
    status: 'covered', where: 'src/mastery/screener.ts + SoundGardenWelcome.tsx', levels: [1],
    sources: ['Norton & Wolf 2012 (RAN)', 'Catts et al. 2015'], frameworks: ['diagnostic-teaching'],
  },
  {
    id: 'r-learner-variation', side: 'reading', domain: 'learner-variation', title: 'Dyslexia-aware, difference-not-deficit framing',
    status: 'partial', where: 'src/world/lore/* (Pip as dyslexic-strength character); structured multisensory loop',
    sources: ['IDA KPS 2018', 'Shaywitz 2003'], frameworks: ['structured-literacy'],
    note: 'Dyslexia lens strong; ELL/multilingual + co-occurring conditions NOT covered — red-team horizon item.',
  },
  // Planned levels 5–10: reading SCOPE & science mapped; in-app games pending.
  {
    id: 'r-morphology', side: 'reading', domain: 'content', title: 'Morphology — prefixes, suffixes, roots',
    status: 'partial', where: 'LEVELS 5 & 10 scope (games pending)', levels: [5, 10],
    sources: ['Bowers, Kirby & Deacon 2010', 'IDA KPS 2018'], frameworks: ['phonics', 'vocabulary'],
    note: 'Scope & science mapped; games pending (#118 / Phase C–D).',
  },
  {
    id: 'r-syllable-types', side: 'reading', domain: 'content', title: 'Syllable types — silent-e, C-LE, vowel-r',
    status: 'partial', where: 'LEVELS 6 & 7 scope (games pending)', levels: [6, 7],
    sources: ['Moats 2020 (LETRS)', 'IDA KPS 2018'], frameworks: ['phonics', 'full-alphabetic'],
    note: 'Scope mapped; games pending (#118).',
  },
  {
    id: 'r-advanced-vowel-teams', side: 'reading', domain: 'content', title: 'Advanced vowel teams & diphthongs',
    status: 'partial', where: 'LEVEL 8 scope (games pending)', levels: [8],
    sources: ['Moats 2020', 'NRP 2000'], frameworks: ['phonics'],
    note: 'Scope mapped; games pending (#118).',
  },
  {
    id: 'r-foreign-greek-latin', side: 'reading', domain: 'content', title: 'Foreign patterns + Greek/Latin roots',
    status: 'partial', where: 'LEVELS 9 & 10 scope (games pending)', levels: [9],
    sources: ['Henry 2010', 'Bowers et al. 2010'], frameworks: ['vocabulary', 'literacy-knowledge'],
    note: 'Scope mapped; games pending (#118).',
  },
];

// --- Gaming coverage (walk-the-line: lean-in maximizers + bright lines) --------
export const GAME_COVERAGE: CoverageComponent[] = [
  {
    id: 'g-intrinsic-integration', side: 'gaming', domain: 'loop-feel', title: 'Intrinsic integration (the gesture IS the phonics)',
    status: 'covered', kind: 'lean-in', where: 'every game: the answer is the learning act, not a separate reward',
    sources: ['Habgood & Ainsworth 2011', 'Hunicke et al. 2004 (MDA)'], frameworks: ['mechanics', 'dynamics', 'accomplishment', 'competence'],
  },
  {
    id: 'g-juice', side: 'gaming', domain: 'aesthetics', title: 'Success-beat juice (hit-pause, scale-punch, layered sound)',
    status: 'covered', kind: 'lean-in', where: 'src/audio/sfx.ts + per-game motion; DESIGN.md',
    sources: ['Jonasson & Purho 2012 (juice)', 'Hunicke et al. 2004'], frameworks: ['sensation', 'aesthetics'],
  },
  {
    id: 'g-narrative', side: 'gaming', domain: 'motivation', title: 'Endogenous fantasy + story spine',
    status: 'covered', kind: 'lean-in', where: 'src/world/narrative.ts + lore/*; "Sound Garden gone quiet"',
    sources: ['Malone & Lepper 1987', 'LeBlanc 8 Kinds of Fun'], frameworks: ['narrative', 'fantasy', 'epic-meaning', 'identity'],
  },
  {
    id: 'g-companion-bond', side: 'gaming', domain: 'motivation', title: 'Relatedness — the companion bond (Pip + per-level cast)',
    status: 'covered', kind: 'lean-in', where: 'src/world/lore/cast.ts + CharacterArt',
    sources: ['Ryan & Deci 2000 (SDT)', 'UNICEF RITEC 2022'], frameworks: ['relatedness', 'social-connection', 'fellowship'],
  },
  {
    id: 'g-autonomy', side: 'gaming', domain: 'motivation', title: 'Autonomy — real choices, skippable flourishes',
    status: 'covered', kind: 'lean-in', where: 'level/game picker; mascot-led nav; no forced paths',
    sources: ['Ryan & Deci 2000', 'UNICEF RITEC 2022'], frameworks: ['autonomy', 'expression', 'agency', 'action-motivation'],
  },
  {
    id: 'g-competence', side: 'gaming', domain: 'motivation', title: 'Competence — visible, earned mastery (growing garden)',
    status: 'covered', kind: 'lean-in', where: 'gardenGrowth + character heal reflect real mastery',
    sources: ['Ryan & Deci 2000', 'Quantic Foundry 2016'], frameworks: ['competence', 'empowerment', 'mastery-motivation', 'achievement-motivation'],
  },
  {
    id: 'g-personalization', side: 'gaming', domain: 'motivation', title: 'Ownership + creativity (named plantings, identity)',
    status: 'covered', kind: 'lean-in', where: 'src/world/lore/plantings; named garden',
    sources: ['UNICEF RITEC 2022', 'Quantic Foundry 2016'], frameworks: ['ownership', 'creativity', 'creativity-motivation'],
  },
  {
    id: 'g-difficulty', side: 'gaming', domain: 'difficulty', title: 'Adaptive difficulty at ~85% success (ZPD/flow)',
    status: 'covered', kind: 'lean-in', where: 'mastery-driven item selection; memory engine interleaving',
    sources: ['Csikszentmihalyi 1990 (flow)', 'Wilson et al. 2019 (85% rule)'], frameworks: ['challenge', 'dynamics'],
  },
  {
    id: 'g-flow-loop', side: 'gaming', domain: 'loop-feel', title: 'Clean core loop / immersion',
    status: 'partial', kind: 'lean-in', where: 'GameShell loop; congruence debt in workshop games (#123)',
    sources: ['Csikszentmihalyi 1990', 'Quantic Foundry 2016'], frameworks: ['submission', 'immersion-motivation'],
    note: 'Garden/space use GameShell; workshop games hand-roll chrome (#123).',
  },
  {
    id: 'g-discovery', side: 'gaming', domain: 'aesthetics', title: 'Discovery — Living World + easter eggs',
    status: 'partial', kind: 'lean-in', where: 'src/world/* ambient backdrop + easter-egg scheduler',
    sources: ['LeBlanc 8 Kinds of Fun', 'Malone & Lepper 1987'], frameworks: ['discovery'],
    note: 'Ambient life present; discovery depth can grow with the art-direction roadmap.',
  },
  {
    id: 'g-reward-the-return', side: 'gaming', domain: 'session-retention', title: 'Reward the return (warm welcome-back, NEVER decay)',
    status: 'covered', kind: 'lean-in', where: 'src/world/narrative.ts memory-aware greeting; no streaks/decay',
    sources: ['UNICEF RITEC 2022', 'FTC 2022 (dark-patterns guidance)'], frameworks: ['emotional-regulation'],
  },
  {
    id: 'g-wellbeing', side: 'gaming', domain: 'wellbeing', title: 'Emotionally-costless failure / no-shame',
    status: 'covered', kind: 'lean-in', where: 'gentle wrong-cues; "still a sprout"; no red X / no streak-loss',
    sources: ['UNICEF RITEC 2022', 'Ryan & Deci 2000'], frameworks: ['wellbeing-by-design', 'safety-security'],
  },
  {
    id: 'g-session-length', side: 'gaming', domain: 'session-retention', title: 'Snackable sessions + clean natural stop points',
    status: 'covered', kind: 'lean-in', where: 'fixed short rounds; finish screen; pacing-flexed review dose',
    sources: ['AAP 2016 (screen-time)', 'Quantic Foundry 2016'], frameworks: ['submission'],
  },
  {
    id: 'g-accessibility', side: 'gaming', domain: 'accessibility', title: 'Accessibility — reduced-motion, ≥40px, audio-first',
    status: 'covered', where: 'DESIGN.md motion rules; prefers-reduced-motion honored; ≥40px targets',
    sources: ['WCAG 2.2', 'UNICEF RITEC 2022'], frameworks: ['diverse-interactions'],
  },
  {
    id: 'g-co-play', side: 'gaming', domain: 'motivation', title: 'Cooperative co-play with a trusted adult (the only safe social)',
    status: 'partial', kind: 'lean-in', where: 'tutor/parent dashboards + active-student flow',
    sources: ['UNICEF RITEC 2022', 'Takeuchi & Stevens 2011 (joint media engagement)'], frameworks: ['social-influence', 'social-motivation'],
    note: 'Adult tooling exists; a guided shared-session mode is not built.',
  },
  {
    id: 'g-audience-split', side: 'gaming', domain: 'audience-split', title: 'Child-vs-adult split (child loop free; monetization adult-facing)',
    status: 'partial', where: 'child core loop never paywalled; adult/owner tooling separate',
    sources: ['FTC 2022', 'UNICEF RITEC 2022'], frameworks: ['diverse-interactions'],
    note: 'Split principle enforced; full adult monetization surface deferred (Phase E).',
  },
  // Bright lines — enforced as design rules now; ethics-as-tests source scan = P2 (#6).
  {
    id: 'g-no-variable-reward', side: 'gaming', domain: 'ethics', title: 'NO variable-ratio / random rewards / loot boxes',
    status: 'covered', kind: 'bright-line', where: 'rewards track real mastery only; no randomized prizes',
    sources: ['FTC 2022', 'King et al. 2019 (loot boxes)'], frameworks: ['unpredictability-drive'],
  },
  {
    id: 'g-no-streaks-fomo', side: 'gaming', domain: 'ethics', title: 'NO streaks / FOMO / scarcity / countdowns / decay',
    status: 'covered', kind: 'bright-line', where: 'CLAUDE.md hard rule; growth tracks practice, never decays',
    sources: ['FTC 2022', 'ICO Children’s Code 2021'], frameworks: ['scarcity-drive'],
  },
  {
    id: 'g-no-dark-social', side: 'gaming', domain: 'ethics', title: 'NO child-facing leaderboards / peer-ranking / public scores',
    status: 'covered', kind: 'bright-line', where: 'leaderboard is active-student/family only; no peer comparison',
    sources: ['ICO Children’s Code 2021', 'UNICEF RITEC 2022'], frameworks: ['social-influence', 'avoidance-drive'],
  },
];

// --- Compliance coverage ------------------------------------------------------
export const COMPLIANCE_COVERAGE: CoverageComponent[] = [
  {
    id: 'c-data-minimization', side: 'compliance', domain: 'privacy-data', title: 'Data minimization (first name + results only; derive-don’t-collect)',
    status: 'covered', where: 'no child PII; signals derived on-device; src/signals/* litmus test',
    sources: ['16 CFR Part 312 (COPPA)', 'ICO Children’s Code 2021'], frameworks: ['data-minimization', 'data-minimisation', 'high-privacy-default', 'best-interests'],
  },
  {
    id: 'c-no-biometric', side: 'compliance', domain: 'privacy-data', title: 'No child-voice capture (voiceprint = biometric — hard line)',
    status: 'covered', where: 'audio is playback-only; no getUserMedia; CLAUDE.md hard line',
    sources: ['COPPA 2025 amended rule', 'Illinois BIPA'], frameworks: ['biometric-restrictions'],
  },
  {
    id: 'c-no-behavioral-ads', side: 'compliance', domain: 'privacy-data', title: 'No behavioral advertising / profiling / nudging',
    status: 'covered', where: 'no ads, no third-party trackers, profiling off by default',
    sources: ['COPPA 2025 amended rule', 'ICO Children’s Code 2021'], frameworks: ['no-behavioral-advertising', 'profiling-off-by-default', 'no-nudge-techniques'],
  },
  {
    id: 'c-no-detrimental-use', side: 'compliance', domain: 'transparency-notices', title: 'No detrimental use (dark-pattern prohibition)',
    status: 'covered', where: 'walk-the-line bright lines; no-shame/no-FOMO design',
    sources: ['ICO Children’s Code 2021', 'FTC 2022'], frameworks: ['no-detrimental-use'],
  },
  {
    id: 'c-consent', side: 'compliance', domain: 'consent', title: 'Verifiable parental consent / lawful basis',
    status: 'partial', where: 'tutor/parent account gating; cloud opt-in',
    sources: ['COPPA 2025 amended rule', 'GDPR Art. 8'], frameworks: ['verifiable-parental-consent', 'lawful-basis', 'age-of-consent'],
    note: 'Account gating exists; a formal VPC flow (KBA / gov-ID) is not implemented — required before broad child sign-up.',
  },
  {
    id: 'c-retention-deletion', side: 'compliance', domain: 'retention-deletion', title: 'Retention limits + deletion / data-subject rights',
    status: 'partial', where: 'local-first storage; cloud rows under center RLS',
    sources: ['COPPA 2025 amended rule', 'GDPR Arts. 15–17'], frameworks: ['retention-limits', 'data-subject-rights'],
    note: 'Local data is user-clearable; a self-serve cloud deletion/export flow is pending.',
  },
  {
    id: 'c-age-assurance', side: 'compliance', domain: 'age-assurance', title: 'Age-appropriate design & age assurance',
    status: 'partial', where: 'age-appropriate content guard (ageGuard.ts); age-banded UX',
    sources: ['ICO Children’s Code 2021', 'California AADC'], frameworks: ['age-appropriate-design-code'],
    note: 'Content is provably age-appropriate; an explicit age-assurance gate is not built.',
  },
  {
    id: 'c-transparency', side: 'compliance', domain: 'transparency-notices', title: 'Transparency notices (privacy policy / disclosures)',
    status: 'partial', where: 'NOTICE + in-app disclaimers',
    sources: ['COPPA 2025 amended rule', 'ICO Children’s Code 2021'], frameworks: ['transparency'],
    note: 'Disclaimers present; a child-friendly + full privacy notice pair is pending.',
  },
  {
    id: 'c-school-ferpa', side: 'compliance', domain: 'school-use', title: 'School use — FERPA posture',
    status: 'partial', where: 'center-scoped RLS (src/sync); tutor-as-school-official model',
    sources: ['FERPA 34 CFR Part 99'], frameworks: ['education-records', 'school-official-exception', 'parent-access-rights'],
    note: 'Multi-tenant isolation in place; a formal FERPA DPA + parent-access workflow is pending.',
  },
  {
    id: 'c-security-program', side: 'compliance', domain: 'privacy-data', title: 'Written information security program (COPPA 2025)',
    status: 'partial', where: 'anon publishable keys only; service_role never client-side; deploy headers',
    sources: ['COPPA 2025 amended rule (WISP)'], frameworks: ['security-program'],
    note: 'Engineering controls in place; a documented WISP is pending — COPPA deadline 2026-04-22.',
  },
  {
    id: 'c-dpia', side: 'compliance', domain: 'consent', title: 'Data protection impact assessment',
    status: 'missing', where: '', sources: ['GDPR Art. 35', 'ICO Children’s Code 2021'], frameworks: ['dpia'],
    note: 'No DPIA on file; required for UK/EU rollout.',
  },
  {
    id: 'c-state-opt-out', side: 'compliance', domain: 'privacy-data', title: 'No sale of data / opt-out of sale',
    status: 'covered', where: 'we never sell or share child data with third parties',
    sources: ['CCPA/CPRA', 'COPPA 2025 amended rule'], frameworks: ['opt-out-of-sale'],
  },
];

export const ALL_COVERAGE: CoverageComponent[] = [...READING_COVERAGE, ...GAME_COVERAGE, ...COMPLIANCE_COVERAGE];

export const COVERAGE_META = {
  lastReviewed: '2026-06-12',
  reviewIntervalDays: 90,
  maxDeferDays: 30, // an emergency defer can't exceed this
  coverageVersion: 1,
  acknowledgedDefers: [] as AcknowledgedDefer[],
};
export type CoverageMeta = typeof COVERAGE_META;

// --- Pure tripwire / defer math (unit-tested by test #9; "test the test") -----

const DAY_MS = 86_400_000;
const isoDay = (s: string): string => s.slice(0, 10);

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDay(isoDate) + 'T00:00:00Z');
  return new Date(d.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

/** The date the next quarterly review is due (lastReviewed + interval). */
export function dueDate(meta: CoverageMeta = COVERAGE_META): string {
  return addDays(meta.lastReviewed, meta.reviewIntervalDays);
}

/** Is the quarterly review overdue as of `today` (YYYY-MM-DD)? */
export function isOverdue(today: string, meta: CoverageMeta = COVERAGE_META): boolean {
  return isoDay(today) > dueDate(meta);
}

/** Validation problems with the emergency-valve defers (each must be well-formed
 *  and bounded). Empty array = all defers valid. */
export function deferProblems(meta: CoverageMeta = COVERAGE_META): string[] {
  const problems: string[] = [];
  const ids = new Set(ALL_COVERAGE.map((c) => c.id));
  for (const d of meta.acknowledgedDefers) {
    const tag = `defer "${d.componentId}"`;
    if (d.componentId !== 'sweep' && !ids.has(d.componentId)) problems.push(`${tag}: unknown component`);
    if (!d.reason?.trim()) problems.push(`${tag}: missing reason`);
    if (!d.by?.trim()) problems.push(`${tag}: missing acknowledger ("by")`);
    if (!d.at || !d.until) { problems.push(`${tag}: missing at/until date`); continue; }
    if (isoDay(d.until) > addDays(d.at, meta.maxDeferDays)) {
      problems.push(`${tag}: exceeds maxDeferDays (${meta.maxDeferDays}d)`);
    }
  }
  return problems;
}

/** Component ids whose defer is still active as of `today`. */
export function activeDeferIds(today: string, meta: CoverageMeta = COVERAGE_META): Set<string> {
  return new Set(
    meta.acknowledgedDefers.filter((d) => isoDay(d.until) >= isoDay(today)).map((d) => d.componentId),
  );
}

/** True when an overdue review is currently covered by a valid, active whole-sweep defer. */
export function sweepDeferred(today: string, meta: CoverageMeta = COVERAGE_META): boolean {
  return deferProblems(meta).length === 0 && activeDeferIds(today, meta).has('sweep');
}
