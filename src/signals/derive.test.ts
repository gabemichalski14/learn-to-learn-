import { describe, it, expect } from 'vitest';
import type { SkillEvent } from '../mastery/events';
import {
  learningCurve,
  wheelSpinning,
  automaticitySlope,
  replayReliance,
  rapidGuessRate,
  confusionGraph,
  skillSignals,
  RAPID_GUESS_MS,
  WHEEL_SPIN_WINDOW,
} from './derive';
import { SIGNAL_CATALOG, DERIVABLE_NOW } from './catalog';

/** Build a time-ordered first-try event sequence for one skill. */
function seq(skill: string, specs: Array<Partial<SkillEvent> & { correct: boolean }>): SkillEvent[] {
  return specs.map((s, i) => ({ skillKey: skill, at: i, ...s }));
}

describe('learningCurve', () => {
  it('flags learning when error rate falls across practice', () => {
    const c = learningCurve(seq('s', [{ correct: false }, { correct: false }, { correct: true }, { correct: true }]), 's');
    expect(c.isLearning).toBe(true);
    expect(c.errorRateLate).toBeLessThan(c.errorRateEarly);
  });
  it('flags NOT learning on a flat/poor curve', () => {
    const c = learningCurve(seq('s', [{ correct: true }, { correct: true }, { correct: false }, { correct: false }]), 's');
    expect(c.isLearning).toBe(false);
  });
  it('returns null when too few attempts', () => {
    expect(learningCurve(seq('s', [{ correct: true }, { correct: false }]), 's').isLearning).toBeNull();
  });
});

describe('wheelSpinning', () => {
  it('detects mastery (3-in-a-row) and is not stuck', () => {
    const w = wheelSpinning(seq('s', [{ correct: false }, { correct: true }, { correct: true }, { correct: true }]), 's');
    expect(w.stuck).toBe(false);
    expect(w.reachedMasteryAt).toBe(4);
  });
  it('flags stuck after enough opportunities without mastery', () => {
    const allWrong = Array.from({ length: WHEEL_SPIN_WINDOW }, () => ({ correct: false }));
    expect(wheelSpinning(seq('s', allWrong), 's').stuck).toBe(true);
  });
  it('does NOT flag stuck without enough evidence', () => {
    expect(wheelSpinning(seq('s', [{ correct: false }, { correct: false }]), 's').stuck).toBe(false);
  });
  it('ignores retries (firstTry=false) in the mastery run', () => {
    const events = seq('s', [
      { correct: false },
      { correct: true, firstTry: false }, // retry — ignored
      { correct: true },
      { correct: true },
      { correct: true },
    ]);
    expect(wheelSpinning(events, 's').reachedMasteryAt).toBe(4);
  });
});

describe('automaticitySlope', () => {
  it('detects declining latency (automatizing) on correct exposures', () => {
    const a = automaticitySlope(seq('s', [
      { correct: true, latencyMs: 500 },
      { correct: true, latencyMs: 400 },
      { correct: true, latencyMs: 300 },
      { correct: true, latencyMs: 200 },
    ]), 's');
    expect(a.declining).toBe(true);
    expect(a.slopeMsPerExposure).toBeLessThan(0);
  });
  it('flags stalled mapping when latency is not falling', () => {
    const a = automaticitySlope(seq('s', [
      { correct: true, latencyMs: 300 },
      { correct: true, latencyMs: 320 },
      { correct: true, latencyMs: 310 },
      { correct: true, latencyMs: 340 },
    ]), 's');
    expect(a.declining).toBe(false);
  });
  it('returns null with too few timed-correct exposures', () => {
    expect(automaticitySlope(seq('s', [{ correct: true, latencyMs: 300 }]), 's').declining).toBeNull();
  });
});

describe('replayReliance', () => {
  it('detects re-hears falling (consolidating)', () => {
    const r = replayReliance(seq('s', [
      { correct: false, replays: 3 },
      { correct: true, replays: 2 },
      { correct: true, replays: 1 },
      { correct: true, replays: 0 },
    ]), 's');
    expect(r.decreasing).toBe(true);
  });
});

describe('rapidGuessRate', () => {
  it('is the fraction of implausibly-fast responses', () => {
    const events = seq('s', [
      { correct: false, latencyMs: RAPID_GUESS_MS - 100 },
      { correct: true, latencyMs: RAPID_GUESS_MS + 500 },
      { correct: false, latencyMs: 200 },
    ]);
    expect(rapidGuessRate(events, 's')).toBeCloseTo(2 / 3, 5);
  });
  it('is 0 when nothing is timed', () => {
    expect(rapidGuessRate(seq('s', [{ correct: true }]), 's')).toBe(0);
  });
});

describe('confusionGraph', () => {
  it('aggregates the specific wrong choice per target (reuses the memory reducer)', () => {
    const events = seq('sound:first:b', [
      { correct: false, chosen: 'd' },
      { correct: false, chosen: 'd' },
      { correct: true },
    ]);
    expect(confusionGraph(events)).toEqual({ 'sound:first:b': { d: 2 } });
  });
});

describe('skillSignals bundle', () => {
  it('returns every derived signal for a skill', () => {
    const events = seq('s', [
      { correct: false, latencyMs: 600, replays: 2, chosen: 'x' },
      { correct: true, latencyMs: 450, replays: 1 },
      { correct: true, latencyMs: 350, replays: 0 },
      { correct: true, latencyMs: 280, replays: 0 },
      { correct: true, latencyMs: 220, replays: 0 },
    ]);
    const sig = skillSignals(events, 's');
    expect(sig.skill).toBe('s');
    expect(sig.wheelSpin.reachedMasteryAt).toBe(4); // 3-in-a-row completes at the 4th opportunity
    expect(sig.automaticity.declining).toBe(true); // 4 correct-timed exposures, latency falling
    expect(typeof sig.rapidGuessRate).toBe('number');
  });
});

describe('catalog integrity', () => {
  it('every derivable-now catalog signal is honestly tagged and the refused one stays refused', () => {
    expect(DERIVABLE_NOW.length).toBeGreaterThanOrEqual(6);
    const prosody = SIGNAL_CATALOG.find((s) => s.id === 'prosody');
    expect(prosody?.deriveStatus).toBe('out-of-scope'); // voice capture stays refused, forever
    // no catalog copy claims to measure brain states
    for (const s of SIGNAL_CATALOG) expect(s.indexes.toLowerCase()).not.toContain('brain state');
  });
});
