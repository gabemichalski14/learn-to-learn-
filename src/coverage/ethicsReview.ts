/**
 * Walk-the-line consent ledger for the ethics engine.
 *
 * When the ethics guard flags an engagement pattern, the build goes RED — that IS
 * the engine "asking permission." A flagged mechanic is NEVER auto-removed. A human
 * then makes ONE of two calls:
 *
 *   • KEEP  — it's a legitimate, science-/fact-based (white-hat) lever. Record it
 *             here with a reason; the scan then allowlists THAT location and the
 *             pattern stays. This is how we "walk the line": maximize ethical,
 *             evidence-based engagement without crossing into dark patterns.
 *   • REMOVE — the owner approves removal and a human edits the code. Once the token
 *             is gone there's nothing to record.
 *
 * An UNREVIEWED finding keeps failing the build until a human makes one of these
 * calls — so nothing is silently removed AND nothing is silently shipped.
 *
 * NOTE: this ledger only governs the *engagement* greys (streak/decay/loot/etc.).
 * The hard lines — mic/camera capture (COPPA biometric) and push notifications
 * (re-engagement) — are NOT keepable here; they always fail. There is no consent
 * path for a hard line.
 */

export interface EthicsDecision {
  /** repo-relative file the decision covers, e.g. 'src/Home.tsx' */
  file: string;
  /** case-insensitive substring on the flagged line this decision covers, e.g. 'streak' */
  match: string;
  /** the only ledger state: a consciously-retained white-hat lever */
  decision: 'keep';
  /** WHY it's acceptable — the walk-the-line justification (required, non-empty) */
  reason: string;
  /** who approved (required) */
  by: string;
  /** ISO date the decision was recorded (required) */
  at: string;
}

/**
 * Owner-approved KEEP decisions. EMPTY by default — add an entry ONLY after a human
 * reviews a flagged pattern and decides it's a legitimate white-hat lever worth
 * keeping. (The agent must never add one on its own to silence the guard.)
 */
export const ETHICS_DECISIONS: EthicsDecision[] = [];

/** Is a flagged line at `file` consciously KEPT by a recorded owner decision? */
export function isKept(file: string, lineText: string, decisions: EthicsDecision[] = ETHICS_DECISIONS): boolean {
  const t = lineText.toLowerCase();
  return decisions.some((d) => d.decision === 'keep' && d.file === file && t.includes(d.match.toLowerCase()));
}

/** Validation problems with the ledger (a KEEP can't be a rubber stamp). Empty = OK. */
export function decisionProblems(decisions: EthicsDecision[] = ETHICS_DECISIONS): string[] {
  const problems: string[] = [];
  for (const d of decisions) {
    const tag = `keep "${d.match}" @ ${d.file}`;
    if (!d.file?.trim()) problems.push(`${tag}: missing file`);
    if (!d.match?.trim()) problems.push(`${tag}: missing match`);
    if (!d.reason?.trim()) problems.push(`${tag}: missing reason (a KEEP must justify the lever)`);
    if (!d.by?.trim()) problems.push(`${tag}: missing approver ("by")`);
    if (!d.at?.trim()) problems.push(`${tag}: missing date`);
  }
  return problems;
}
