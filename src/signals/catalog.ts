/**
 * The signal catalog — the canonical list of pedagogically useful learning signals
 * and their status. Backs the "positions lacking" coverage report and the ethics
 * guard (P2/P3). Every entry must pass the litmus test: changes how we teach THIS
 * child · on-device/aggregate-derivable · no PII · expires · never feeds
 * engagement-maximization or any third party.
 */

export type DeriveStatus =
  | 'derive' // computable now from the existing SkillEvent stream (no new capture)
  | 'needs-capture' // needs a small new field / UI affordance
  | 'out-of-scope'; // deliberately refused (ethics)

export interface SignalSpec {
  id: string;
  title: string;
  /** What it's a behavioral signal CONSISTENT WITH (never "measures brain state"). */
  indexes: string;
  /** Raw SkillEvent fields (or new sources) the derivation needs. */
  rawFields: string[];
  deriveStatus: DeriveStatus;
  /** Why it's ethically permissible — or why it's refused. */
  ethics: string;
}

export const SIGNAL_CATALOG: SignalSpec[] = [
  { id: 'learning-curve', title: 'Learning curve / mastery trajectory', indexes: 'whether a skill is actually being learned (error rate falling over opportunities)', rawFields: ['correct', 'skillKey', 'at'], deriveStatus: 'derive', ethics: 'derived from first-party gameplay; no PII' },
  { id: 'wheel-spinning', title: 'Wheel-spinning', indexes: 'unproductive struggle — stuck on a skill without converging', rawFields: ['correct', 'skillKey', 'at'], deriveStatus: 'derive', ethics: 'serves the learner (intervene before frustration)' },
  { id: 'automaticity-slope', title: 'Latency-as-automaticity', indexes: 'fluent retrieval vs. accurate-but-slow (the dyslexia rate deficit)', rawFields: ['latencyMs', 'correct', 'skillKey', 'at'], deriveStatus: 'derive', ethics: 'latency confounded by motor maturity — normalize within-child' },
  { id: 'rapid-guess', title: 'Rapid-guess / disengagement rate', indexes: 'implausibly fast responses = guessing/disengagement, not retrieval', rawFields: ['latencyMs', 'correct'], deriveStatus: 'derive', ethics: 'used to reroute, never to punish' },
  { id: 'replay-reliance', title: 'Replay-reliance trend', indexes: 'scaffold dependence on a grapheme (re-hears not falling)', rawFields: ['replays', 'skillKey', 'at'], deriveStatus: 'derive', ethics: 'help-seeking is healthy; trend only' },
  { id: 'confusion-graph', title: 'Per-child confusion graph', indexes: 'systematic wrong grapheme/sound per target (b/d, vowel swaps)', rawFields: ['chosen', 'skillKey', 'correct'], deriveStatus: 'derive', ethics: 'feeds targeted remediation + the interleave loop' },
  { id: 'retention', title: 'Retention / forgetting + exposure-to-mastery', indexes: 'spaced review at the recall sweet spot; exposures-to-map a sound', rawFields: ['at', 'correct', 'skillKey'], deriveStatus: 'derive', ethics: 'powers spaced review; derived, not a profile' },
  { id: 'fatigue', title: 'Within-session fatigue', indexes: 'late-session latency drift + accuracy slip = depletion, not deficit', rawFields: ['latencyMs', 'correct', 'at'], deriveStatus: 'derive', ethics: 'NEVER lower a mastery estimate for fatigue errors' },
  { id: 'self-correction', title: 'Self-correction / answer-change path', indexes: 'metacognitive monitoring (age-gated) vs. impulsivity', rawFields: ['pre-commit selection-changed event (new)'], deriveStatus: 'needs-capture', ethics: 'no PII; age-gate the interpretation (<7 overconfident)' },
  { id: 'hesitation', title: 'Hesitation (time-to-first-touch)', indexes: 'retrieval difficulty vs. motor execution', rawFields: ['first-touch timestamp (new field)'], deriveStatus: 'needs-capture', ethics: 'one derived timing; no PII' },
  { id: 'ran', title: 'RAN / naming speed', indexes: 'one of the two strongest early dyslexia predictors (double-deficit)', rawFields: ['per-item latency in a new voice-free naming game'], deriveStatus: 'needs-capture', ethics: 'voice-FREE; a screen prompting assessment, never a diagnosis' },
  { id: 'prosody', title: 'Read-aloud prosody', indexes: 'comprehension beyond automaticity', rawFields: ['raw child audio'], deriveStatus: 'out-of-scope', ethics: 'REFUSED — voice capture = COPPA biometric; breaks no-voice/no-PII' },
];

/** Signals computable today from the existing event stream (the P1 set). */
export const DERIVABLE_NOW = SIGNAL_CATALOG.filter((s) => s.deriveStatus === 'derive');
