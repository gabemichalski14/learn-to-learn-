import { describe, it, expect } from 'vitest';
import { selectLine, eligibleLines, type Line, type DialogueCtx } from './dialogue';

function ctx(over: Partial<DialogueCtx> = {}): DialogueCtx {
  return {
    narrative: { newcomer: false, sessions: 3, stickers: 1, tierName: 'Sprouting', daysSince: 0, lastSkill: '/m/' },
    lore: { acknowledged: [], stories: {}, bonds: {}, recentLines: [] },
    plantings: [],
    bond: () => 0,
    ...over,
  };
}

const pool: Line[] = [
  { id: 'a', speaker: 'pip', text: () => 'A' },
  { id: 'b', speaker: 'pip', text: () => 'B' },
  { id: 'gated', speaker: 'pip', when: (c) => c.bond('pip') >= 5, text: () => 'G' },
];

describe('eligibleLines', () => {
  it('hides gated lines until their condition holds', () => {
    expect(eligibleLines(pool, ctx()).map((l) => l.id)).toEqual(['a', 'b']);
    expect(eligibleLines(pool, ctx({ bond: () => 5 })).map((l) => l.id)).toContain('gated');
  });

  it('excludes recently-shown lines (the no-repeat rule)', () => {
    const e = eligibleLines(pool, ctx({ lore: { acknowledged: [], stories: {}, bonds: {}, recentLines: ['a'] } }));
    expect(e.map((l) => l.id)).toEqual(['b']);
  });
});

describe('selectLine', () => {
  it('is deterministic with a seeded rng (weighted pick)', () => {
    expect(selectLine(pool, ctx(), () => 0)?.id).toBe('a');     // r=0 -> first
    expect(selectLine(pool, ctx(), () => 0.99)?.id).toBe('b');  // r≈1.98 of total 2 -> second
  });

  it('relaxes the no-repeat rule rather than going silent', () => {
    const allRecent = ctx({ lore: { acknowledged: [], stories: {}, bonds: {}, recentLines: ['a', 'b'] } });
    const pick = selectLine(pool, allRecent, () => 0);
    expect(pick).not.toBeNull();
    expect(['a', 'b']).toContain(pick?.id);
  });

  it('returns null only when nothing is gate-eligible', () => {
    const onlyGated: Line[] = [{ id: 'g', speaker: 'pip', when: () => false, text: () => 'x' }];
    expect(selectLine(onlyGated, ctx(), () => 0)).toBeNull();
  });
});
