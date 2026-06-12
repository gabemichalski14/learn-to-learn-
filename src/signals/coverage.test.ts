import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseLogSkillEventCalls,
  coverageReport,
  gamesMissing,
  FLUENCY_GAMES,
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

  it('the fluency/speed games log latencyMs (the signal their whole point produces)', () => {
    for (const g of FLUENCY_GAMES) {
      expect(report.find((r) => r.game === g)?.has, `${g} must log latencyMs`).toContain('latencyMs');
    }
  });

  it('surfaces the current gaps (latency fully closed; replays partial)', () => {
    const missingLatency = gamesMissing(report, 'latencyMs');
    const missingReplays = gamesMissing(report, 'replays');
    console.log('[signal-coverage] games missing latencyMs:', missingLatency.join(', ') || 'none');
    console.log('[signal-coverage] games missing replays:', missingReplays.join(', ') || 'none');
    // #126: latency is now logged by EVERY game — this is the regression guard that
    // it stays that way (automaticity-slope / rapid-guess / fatigue stay derivable).
    expect(missingLatency.length, `latency regressed in: ${missingLatency.join(', ')}`).toBe(0);
    // replays: the foundational L1 PA games feed the cloud event; the L2–L4 tail is
    // still pending (mechanical — same pattern). Honest partial-coverage finding.
    expect(missingReplays.length).toBeGreaterThan(0);
    expect(missingReplays.length).toBeLessThan(report.length);
  });
});
