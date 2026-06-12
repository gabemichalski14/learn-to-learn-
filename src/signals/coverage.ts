/**
 * Signal coverage — the "positions lacking" machine. It reads the actual
 * `logSkillEvent` call sites (so it can't drift from a hand-maintained manifest)
 * and reports, per game, which derivable signals are UNREACHABLE because the game
 * doesn't log the enrichment field they need. A coverage gap = a blind spot in the
 * learner model, never an un-monetized data field.
 */

export type EnrichmentField = 'latencyMs' | 'chosen' | 'replays';
export const ENRICHMENT_FIELDS: EnrichmentField[] = ['latencyMs', 'chosen', 'replays'];

/** Signal id → the enrichment field(s) it needs beyond the always-present
 *  skillKey/correct/firstTry/at. Signals needing nothing extra (learning curve,
 *  wheel-spinning, retention) are omitted — they're always derivable. */
export const SIGNAL_FIELD_DEPS: Record<string, EnrichmentField[]> = {
  'automaticity-slope': ['latencyMs'],
  'rapid-guess': ['latencyMs'],
  fatigue: ['latencyMs'],
  'confusion-graph': ['chosen'],
  'replay-reliance': ['replays'],
};

/** Games whose whole purpose is reading SPEED — they especially should log latency. */
export const FLUENCY_GAMES = ['warp-speed', 'giant-steps', 'tool-time', 'word-giants'];

export interface LoggedCall {
  /** the `game: '...'` literal, or 'dynamic' when it's a prop, or 'unknown'. */
  game: string;
  fields: Set<EnrichmentField>;
}

/** Parse `logSkillEvent(learnerId, { ... })` calls out of source. Brace-matched,
 *  so multi-line calls are captured whole. */
export function parseLogSkillEventCalls(source: string): LoggedCall[] {
  const out: LoggedCall[] = [];
  const marker = 'logSkillEvent(';
  let from = source.indexOf(marker);
  while (from !== -1) {
    const open = source.indexOf('{', from);
    if (open === -1) break;
    let depth = 0;
    let end = open;
    for (let i = open; i < source.length; i++) {
      if (source[i] === '{') depth += 1;
      else if (source[i] === '}') {
        depth -= 1;
        if (depth === 0) { end = i; break; }
      }
    }
    const body = source.slice(open, end + 1);
    const literal = body.match(/game:\s*'([^']+)'/);
    const game = literal ? literal[1] : /game:\s*gameId\b/.test(body) ? 'dynamic' : 'unknown';
    const fields = new Set<EnrichmentField>();
    for (const f of ENRICHMENT_FIELDS) if (new RegExp(`\\b${f}\\b`).test(body)) fields.add(f);
    out.push({ game, fields });
    from = source.indexOf(marker, end);
  }
  return out;
}

export interface CoverageRow {
  game: string;
  has: EnrichmentField[];
  missing: EnrichmentField[];
  /** signal ids that cannot be derived for this game for lack of a field. */
  underivable: string[];
}

/** Roll the per-call scan up into a per-game coverage report (the grid). */
export function coverageReport(calls: LoggedCall[]): CoverageRow[] {
  const byGame = new Map<string, Set<EnrichmentField>>();
  for (const c of calls) {
    const s = byGame.get(c.game) ?? new Set<EnrichmentField>();
    for (const f of c.fields) s.add(f);
    byGame.set(c.game, s);
  }
  return [...byGame.entries()]
    .map(([game, has]) => {
      const missing = ENRICHMENT_FIELDS.filter((f) => !has.has(f));
      const underivable = Object.entries(SIGNAL_FIELD_DEPS)
        .filter(([, deps]) => deps.some((d) => !has.has(d)))
        .map(([sig]) => sig);
      return { game, has: [...has], missing, underivable };
    })
    .sort((a, b) => a.game.localeCompare(b.game));
}

/** Games (by id) whose events are missing a given enrichment field. */
export function gamesMissing(report: CoverageRow[], field: EnrichmentField): string[] {
  return report.filter((r) => r.missing.includes(field)).map((r) => r.game);
}
