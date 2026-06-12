import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseLogSkillEventCalls,
  coverageReport,
  gamesMissing,
  type LoggedCall,
} from './coverage';

describe('parseLogSkillEventCalls', () => {
  it('reads single-line and multi-line calls + the game literal and fields', () => {
    const src = `
      logSkillEvent(learnerId, { skillKey: k, correct, at, game: 'one', firstTry: true, latencyMs, chosen });
      logSkillEvent(learnerId, {
        skillKey, correct, at: Date.now(), game: 'two', level: 2,
        chosen: correct ? undefined : chosen,
      });
      logSkillEvent(learnerId, { skillKey, correct, at, game: gameId, firstTry: true });
    `;
    const calls = parseLogSkillEventCalls(src);
    expect(calls.map((c) => c.game)).toEqual(['one', 'two', 'dynamic']);
    expect([...calls[0].fields].sort()).toEqual(['chosen', 'latencyMs']);
    expect([...calls[1].fields]).toEqual(['chosen']);
    expect([...calls[2].fields]).toEqual([]);
  });
});

describe('coverageReport', () => {
  it('marks signals underivable when their field is missing', () => {
    const report = coverageReport([{ game: 'g', fields: new Set(['chosen']) } as LoggedCall]);
    const g = report.find((r) => r.game === 'g')!;
    expect(g.missing.sort()).toEqual(['latencyMs', 'replays']);
    expect(g.underivable).toContain('automaticity-slope');
    expect(g.underivable).toContain('fatigue');
    expect(g.underivable).toContain('replay-reliance');
    expect(g.underivable).not.toContain('confusion-graph'); // has chosen
  });
});

describe('signal coverage over the real game tree (the "positions lacking" report)', () => {
  const SRC = dirname(fileURLToPath(import.meta.url));
  const worlds = join(SRC, '..', 'worlds');

  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) out.push(...walk(p));
      else if (/\.tsx$/.test(e) && !/\.test\.tsx$/.test(e)) out.push(p);
    }
    return out;
  }

  const calls = walk(worlds).flatMap((f) => parseLogSkillEventCalls(readFileSync(f, 'utf8')));
  const report = coverageReport(calls);

  it('every logSkillEvent call names a game (no "unknown")', () => {
    expect(calls.every((c) => c.game !== 'unknown')).toBe(true);
  });

  it('finds a healthy set of instrumented games', () => {
    expect(report.length).toBeGreaterThanOrEqual(12);
  });

  it('regression guard: the games that DO log latency keep doing so', () => {
    for (const g of ['tap-it-out', 'say-it-again']) {
      expect(report.find((r) => r.game === g)?.has).toContain('latencyMs');
    }
  });

  it('surfaces the current gaps (documented finding, not a silent pass)', () => {
    const missingLatency = gamesMissing(report, 'latencyMs');
    const missingReplays = gamesMissing(report, 'replays');
    console.log('[signal-coverage] games missing latencyMs:', missingLatency.join(', ') || 'none');
    console.log('[signal-coverage] games missing replays:', missingReplays.length, 'of', report.length);
    // The known finding today: latency is logged by very few games (automaticity/
    // fatigue blind for the rest); replays reach no cloud event. See task to close.
    expect(missingLatency.length).toBeGreaterThan(0);
    expect(missingReplays.length).toBe(report.length); // replays nowhere yet
  });
});
