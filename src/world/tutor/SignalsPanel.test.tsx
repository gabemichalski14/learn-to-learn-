import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import type { SkillEvent } from '../../mastery/events';
import { SignalsPanel } from './SignalsPanel';

function seq(skill: string, specs: Array<Partial<SkillEvent> & { correct: boolean }>): SkillEvent[] {
  return specs.map((s, i) => ({ skillKey: skill, at: i, ...s }));
}

describe('SignalsPanel', () => {
  it('renders the three signal buckets with skill labels', () => {
    const events = [
      ...seq('sound:first:b', Array.from({ length: 10 }, (_, i) => ({ correct: i % 2 === 0 }))), // stuck
      ...seq('sound:first:d', [
        { correct: true, latencyMs: 300 }, { correct: true, latencyMs: 320 },
        { correct: true, latencyMs: 310 }, { correct: true, latencyMs: 340 },
      ]), // effortful (accurate, not speeding up)
      ...seq('sound:first:m', [
        { correct: true, latencyMs: 500 }, { correct: true, latencyMs: 400 },
        { correct: true, latencyMs: 320 }, { correct: true, latencyMs: 250 },
      ]), // improving
    ];
    const { container } = render(<SignalsPanel events={events} name="Sam" />);
    const text = container.textContent ?? '';
    expect(text).toContain('Deeper signals');
    expect(text).toContain('Worth a fresh approach'); // stuck bucket
    expect(text).toContain('Accurate, not yet automatic'); // effortful bucket
    expect(text).toContain('Coming along'); // improving bucket
    expect(text).toContain('not a diagnosis'); // honest framing present
    expect(text).toContain('/b/'); // a skill label rendered
  });

  it('renders nothing when there is no evidence', () => {
    const { container } = render(<SignalsPanel events={seq('sound:first:b', [{ correct: true }])} name="Sam" />);
    expect(container.firstChild).toBeNull();
  });
});
