import { describe, it, expect } from 'vitest';
import type { SkillEvent } from '../mastery/events';
import { tutorSignalSummary } from './summary';

function seq(skill: string, specs: Array<Partial<SkillEvent> & { correct: boolean }>): SkillEvent[] {
  return specs.map((s, i) => ({ skillKey: skill, at: i, ...s }));
}

describe('tutorSignalSummary', () => {
  it('buckets skills into stuck / effortful / improving (mutually exclusive)', () => {
    const events = [
      // stuck: many tries, never 3-in-a-row
      ...seq('stuck', Array.from({ length: 10 }, (_, i) => ({ correct: i % 2 === 0 }))),
      // effortful: accurate but latency flat/rising over 4 correct exposures
      ...seq('eff', [
        { correct: true, latencyMs: 300 },
        { correct: true, latencyMs: 320 },
        { correct: true, latencyMs: 310 },
        { correct: true, latencyMs: 340 },
      ]),
      // improving: accurate and latency falling
      ...seq('imp', [
        { correct: true, latencyMs: 500 },
        { correct: true, latencyMs: 400 },
        { correct: true, latencyMs: 320 },
        { correct: true, latencyMs: 250 },
      ]),
    ];
    const sig = tutorSignalSummary(events);
    expect(sig.stuck).toContain('stuck');
    expect(sig.effortful).toContain('eff');
    expect(sig.improving).toContain('imp');
    // mutually exclusive
    expect(sig.stuck).not.toContain('eff');
    expect(sig.effortful).not.toContain('imp');
  });

  it('omits skills without enough evidence', () => {
    const sig = tutorSignalSummary(seq('thin', [{ correct: true }, { correct: false }]));
    expect(sig.stuck).toHaveLength(0);
    expect(sig.effortful).toHaveLength(0);
    expect(sig.improving).toHaveLength(0);
  });

  it('returns empty buckets for no events', () => {
    expect(tutorSignalSummary([])).toEqual({ stuck: [], effortful: [], improving: [] });
  });
});
