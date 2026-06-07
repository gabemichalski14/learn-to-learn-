import { describe, it, expect } from 'vitest';
import { PIP_LINES, ECHO_LINES, bondTier, PIP, ECHO } from './characters';
import { destById } from '../../mascots/pipNav';
import type { DialogueCtx } from './dialogue';
import type { Planting } from './plantings';

const marigold: Planting = {
  skillKey: 'sound:first:m', sound: 'm',
  species: { sound: 'm', plant: 'marigold', emoji: '🌼', color: '#f4c14b' },
  name: 'the /m/ marigold',
};

function ctx(over: Partial<DialogueCtx> = {}): DialogueCtx {
  return {
    narrative: { newcomer: false, sessions: 3, stickers: 1, tierName: 'Sprouting', daysSince: 0, lastSkill: '/m/' },
    lore: { acknowledged: [], stories: {}, bonds: {}, recentLines: [] },
    plantings: [],
    bond: () => 0,
    ...over,
  };
}

describe('bondTier', () => {
  it('maps interaction counts to rising tiers', () => {
    expect(bondTier(0)).toBe(0);
    expect(bondTier(2)).toBe(0);
    expect(bondTier(3)).toBe(1);
    expect(bondTier(8)).toBe(2);
    expect(bondTier(18)).toBe(3);
    expect(bondTier(100)).toBe(3);
  });
});

describe('character profiles', () => {
  it('Pip & Echo have a name, tagline, and a multi-paragraph bio', () => {
    for (const c of [PIP, ECHO]) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.tagline.length).toBeGreaterThan(0);
      expect(c.bio.length).toBeGreaterThan(1);
    }
  });
  it("Pip's bio frames the struggle as difference, not deficit", () => {
    const text = PIP.bio.join(' ').toLowerCase();
    expect(text).toContain('one sound at a time'); // the methodical heart
    expect(text).toContain('same gifts');          // affirming, relatedness
  });
});

describe('line pools', () => {
  const all = [...PIP_LINES, ...ECHO_LINES];

  it('have unique ids', () => {
    const ids = all.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every CTA references a real navigation destination (spoken == target)', () => {
    for (const l of all) if (l.cta) expect(destById(l.cta.destId)).not.toBeNull();
  });

  it('no eligible line ever renders "undefined"', () => {
    const variants: DialogueCtx[] = [
      ctx({ narrative: { newcomer: true, sessions: 0, stickers: 0, tierName: 'Seedling', daysSince: null, lastSkill: null } }),
      ctx({ narrative: { newcomer: false, sessions: 9, stickers: 4, tierName: 'Sprouting', daysSince: 3, lastSkill: '/m/' }, plantings: [marigold, marigold, marigold, marigold], bond: () => 50 }),
    ];
    for (const c of variants) {
      for (const l of all) {
        if (!l.when || l.when(c)) expect(l.text(c)).not.toContain('undefined');
      }
    }
  });

  it("hides Pip's backstory reveals until the bond deepens, then shows them", () => {
    const struggle = PIP_LINES.find((l) => l.id === 'pip.arc.struggle');
    expect(struggle).toBeTruthy();
    expect(struggle!.when!(ctx({ bond: () => 0 }))).toBe(false);
    expect(struggle!.when!(ctx({ bond: () => 50 }))).toBe(true);
  });
});
